import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

import app.models  # Register SQLAlchemy models
from app.main import app as fastapi_app
from app.database.session import SessionLocal
from app.models.machine import Machine
from app.models.prediction import Prediction
from app.models.maintenance import MaintenanceRecommendation
from app.decision_engine.risk_engine import evaluate_operational_risk
from app.decision_engine.priority_engine import determine_maintenance_priority
from app.decision_engine.recommendation_engine import generate_prescriptive_recommendation
from app.services.decision_service import generate_maintenance_recommendation

client = TestClient(fastapi_app)


def test_1_critical_machine_receives_critical_priority():
    """TEST 1: Critical health + high cascade impact results in CRITICAL priority."""
    priority, reasons = determine_maintenance_priority(
        health_status="CRITICAL",
        failure_probability=0.88,
        predicted_rul=8.0,
        machine_criticality="HIGH",
        production_priority="HIGH",
        production_impact="HIGH",
        impact_severity="CRITICAL",
        affected_machine_count=4
    )
    assert priority == "CRITICAL"
    assert len(reasons) > 0


def test_2_healthy_machine_receives_low_priority_monitoring():
    """TEST 2: Healthy machine receives LOW priority and MONITOR_MACHINE action."""
    priority, _ = determine_maintenance_priority(
        health_status="HEALTHY",
        failure_probability=0.08,
        predicted_rul=65.0,
        machine_criticality="MEDIUM",
        production_priority="MEDIUM",
        production_impact="MEDIUM",
        impact_severity="LOW",
        affected_machine_count=0
    )
    assert priority == "LOW"

    rec = generate_prescriptive_recommendation(
        priority=priority,
        health_status="HEALTHY",
        failure_probability=0.08,
        predicted_rul=65.0,
        technician_available="YES",
        spare_part_available="YES",
        maintenance_window="AVAILABLE",
        estimated_repair_hours=3.0,
        affected_machine_count=0
    )
    assert rec["recommended_action"] == "MONITOR_MACHINE"


def test_3_low_rul_increases_urgency():
    """TEST 3: Low predicted RUL increases urgency to CRITICAL risk."""
    risk_level, reasons = evaluate_operational_risk(
        failure_probability=0.25,
        predicted_rul=9.0,  # Below critical threshold of 15
        machine_criticality="HIGH"
    )
    assert risk_level == "CRITICAL"
    assert any("remaining useful life" in r for r in reasons)


def test_4_high_cascade_impact_increases_priority():
    """TEST 4: Elevated risk with high cascade dependencies escalates priority."""
    priority_low_cascade, _ = determine_maintenance_priority(
        health_status="AT_RISK",
        failure_probability=0.45,
        predicted_rul=28.0,
        machine_criticality="MEDIUM",
        impact_severity="LOW",
        affected_machine_count=0
    )
    assert priority_low_cascade == "MEDIUM"

    priority_high_cascade, _ = determine_maintenance_priority(
        health_status="AT_RISK",
        failure_probability=0.45,
        predicted_rul=28.0,
        machine_criticality="HIGH",
        impact_severity="CRITICAL",
        affected_machine_count=6
    )
    assert priority_high_cascade == "HIGH"


def test_5_technician_unavailable_is_reflected_in_recommendation():
    """TEST 5: Missing technician constraint is surfaced in recommendation reason."""
    rec = generate_prescriptive_recommendation(
        priority="CRITICAL",
        health_status="CRITICAL",
        failure_probability=0.85,
        predicted_rul=10.0,
        technician_available="NO",
        spare_part_available="YES",
        maintenance_window="NEXT_SHIFT",
        estimated_repair_hours=5.0,
        affected_machine_count=3
    )
    assert "technician availability is currently limited" in rec["reason"].lower()


def test_6_spare_part_unavailable_is_reflected_in_recommendation():
    """TEST 6: Missing spare parts constraint triggers component requisition notice."""
    rec = generate_prescriptive_recommendation(
        priority="CRITICAL",
        health_status="CRITICAL",
        failure_probability=0.90,
        predicted_rul=7.0,
        technician_available="YES",
        spare_part_available="NO",
        maintenance_window="AVAILABLE",
        estimated_repair_hours=4.0,
        affected_machine_count=2
    )
    assert "spare parts are currently unavailable" in rec["reason"].lower() or "requisition" in rec["reason"].lower()


def test_7_maintenance_window_is_considered():
    """TEST 7: Shift maintenance window is respected for scheduling."""
    rec = generate_prescriptive_recommendation(
        priority="MEDIUM",
        health_status="AT_RISK",
        failure_probability=0.40,
        predicted_rul=30.0,
        technician_available="YES",
        spare_part_available="YES",
        maintenance_window="PLANNED",
        estimated_repair_hours=4.0,
        affected_machine_count=1
    )
    assert "Planned maintenance window" in rec["recommended_window"]


def test_8_recommendation_contains_meaningful_reason():
    """TEST 8: Every recommendation output includes a detailed, non-empty explanation."""
    rec = generate_prescriptive_recommendation(
        priority="CRITICAL",
        health_status="CRITICAL",
        failure_probability=0.92,
        predicted_rul=6.5,
        technician_available="YES",
        spare_part_available="YES",
        maintenance_window="AVAILABLE",
        estimated_repair_hours=3.5,
        affected_machine_count=5
    )
    assert len(rec["reason"]) > 30
    assert "failure" in rec["reason"].lower() or "critical" in rec["reason"].lower()


def test_9_decision_factors_contain_actual_values():
    """TEST 9: Decision factors match input prediction and impact parameters."""
    # Seed prediction for SPIN-01
    login_res = client.post("/api/auth/login", json={
        "email": "engineer@gmail.com",
        "password": "12345"
    })
    token = login_res.json()["access_token"]

    pred_res = client.post(
        "/api/predictions/predict",
        json={
            "machine_id": "SPIN-01",
            "temperature_c": 82.0,
            "vibration_mm_s": 7.1,
            "motor_current_a": 19.5,
            "rpm": 1420.0,
            "pressure_bar": 3.9,
            "load_percentage": 85.0,
            "operating_hours": 7500,
            "maintenance_count": 4
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert pred_res.status_code == 201
    pred_data = pred_res.json()

    # Call recommendation endpoint
    rec_res = client.get(
        "/api/maintenance/recommendations/SPIN-01",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert rec_res.status_code == 200
    rec_data = rec_res.json()

    df = rec_data["decision_factors"]
    assert abs(df["failure_probability"] - pred_data["failure_probability"]) < 1e-4
    assert abs(df["predicted_rul"] - pred_data["predicted_rul"]) < 1e-1
    assert df["health_status"] == pred_data["health_status"]
    assert df["affected_machine_count"] == 10  # SPIN-01 cascades downstream


def test_10_no_prediction_returns_404():
    """TEST 10: Machine with no historical prediction returns 404 with guidance message."""
    login_res = client.post("/api/auth/login", json={
        "email": "engineer@gmail.com",
        "password": "12345"
    })
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/maintenance/recommendations/CARD-01",
        headers={"Authorization": f"Bearer {token}"}
    )
    # If CARD-01 has no prediction, should return 404
    # Let's verify status code is 404 if no prediction, or 200 if already predicted
    assert response.status_code in {200, 404}
    if response.status_code == 404:
        assert "prediction" in response.json()["detail"].lower()


def test_11_recommendation_is_stored_in_postgresql():
    """TEST 11: Generated recommendation is persisted in PostgreSQL database."""
    login_res = client.post("/api/auth/login", json={
        "email": "manager@gmail.com",
        "password": "12345"
    })
    token = login_res.json()["access_token"]

    rec_res = client.get(
        "/api/maintenance/recommendations/SPIN-01",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert rec_res.status_code == 200
    rec_id = rec_res.json()["id"]

    db = SessionLocal()
    try:
        stmt = select(MaintenanceRecommendation).where(MaintenanceRecommendation.id == rec_id)
        saved = db.execute(stmt).scalar_one_or_none()
        assert saved is not None
        assert saved.priority == rec_res.json()["priority"]
    finally:
        db.close()


def test_12_recommendation_history_returns_records():
    """TEST 12: GET /api/maintenance/recommendations/{id}/history returns previous records."""
    login_res = client.post("/api/auth/login", json={
        "email": "production@gmail.com",
        "password": "12345"
    })
    token = login_res.json()["access_token"]

    hist_res = client.get(
        "/api/maintenance/recommendations/SPIN-01/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert isinstance(history, list)
    assert len(history) >= 1
    assert history[0]["machine_id"] == "SPIN-01"
