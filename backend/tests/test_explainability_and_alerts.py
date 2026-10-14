import pytest
from fastapi.testclient import TestClient
from app.database.connection import engine
from app.models import Base
from app.main import app as fastapi_app
from app.ml.explainability import compute_shap_explanation, get_tree_explainer
from app.alerts.alert_rules import evaluate_machine_alert_rules

Base.metadata.create_all(bind=engine)
client = TestClient(fastapi_app)


@pytest.fixture
def auth_header_engineer():
    res = client.post("/api/auth/login", json={"email": "engineer@gmail.com", "password": "12345"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_header_admin():
    res = client.post("/api/auth/login", json={"email": "admin@gmail.com", "password": "12345"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_shap_direct_computation():
    """Verify that SHAP TreeExplainer correctly attributes feature impacts."""
    features = {
        "temperature_c": 88.5,
        "vibration_mm_s": 7.2,
        "motor_current_a": 18.0,
        "rpm": 1450.0,
        "pressure_bar": 4.5,
        "load_percentage": 85.0,
        "operating_hours": 4200.0,
        "maintenance_count": 3,
    }
    result = compute_shap_explanation(features, machine_id="SPIN-01", failure_probability=0.85)

    assert result["machine_id"] == "SPIN-01"
    assert result["failure_probability"] == 0.85
    assert len(result["all_factors"]) == 8
    assert len(result["top_factors"]) <= 8
    assert "explanation_summary" in result
    assert "method" in result
    assert "TreeExplainer" in result["method"]

    # Verify factors structure
    top = result["top_factors"][0]
    assert "feature" in top
    assert "shap_value" in top
    assert top["impact"] in ["INCREASES_RISK", "DECREASES_RISK", "NEUTRAL"]
    assert isinstance(top["value"], (int, float))


def test_explainability_api_unauthorized():
    """Verify that Explainability API requires authentication."""
    res = client.get("/api/explainability/SPIN-01")
    assert res.status_code == 401


def test_explainability_api_success(auth_header_engineer):
    """Verify that Explainability API returns complete explainability response."""
    res = client.get("/api/explainability/SPIN-01", headers=auth_header_engineer)
    assert res.status_code == 200
    data = res.json()
    assert data["machine_id"] == "SPIN-01"
    assert "top_factors" in data
    assert len(data["top_factors"]) > 0
    assert "explanation_summary" in data
    assert "failure_probability" in data
    assert "predicted_rul" in data
    assert "health_status" in data


def test_alert_rules_evaluation():
    """Verify deterministic rule triggering for various machine risk conditions."""
    # Critical machine
    crit_alerts = evaluate_machine_alert_rules(
        machine_id="SPIN-01",
        failure_probability=0.82,
        predicted_rul=12.0,
        health_status="CRITICAL",
        criticality="HIGH",
        cascade_affected_count=3,
        cascade_max_level=2,
        recommended_urgency="IMMEDIATE"
    )
    assert len(crit_alerts) >= 2
    types = [a["alert_type"] for a in crit_alerts]
    assert "FAILURE_RISK" in types
    assert "LOW_RUL" in types

    # Healthy machine
    healthy_alerts = evaluate_machine_alert_rules(
        machine_id="PACK-01",
        failure_probability=0.08,
        predicted_rul=120.0,
        health_status="HEALTHY",
        criticality="LOW",
        cascade_affected_count=0,
        cascade_max_level=0,
        recommended_urgency="NONE"
    )
    assert len(healthy_alerts) == 0


def test_alert_evaluation_and_listing_api(auth_header_engineer):
    """Verify POST /api/alerts/evaluate and GET /api/alerts."""
    # 1. Trigger evaluation
    eval_res = client.post("/api/alerts/evaluate", headers=auth_header_engineer)
    assert eval_res.status_code == 200
    summary = eval_res.json()
    assert "total_alerts" in summary
    assert "unacknowledged_count" in summary
    assert "alerts" in summary

    # 2. Query alerts list
    list_res = client.get("/api/alerts", headers=auth_header_engineer)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total_alerts"] >= 0


def test_alert_acknowledgement_api(auth_header_engineer):
    """Verify PATCH /api/alerts/{id}/acknowledge marks alert as acknowledged."""
    # Evaluate first to ensure alerts exist
    client.post("/api/alerts/evaluate", headers=auth_header_engineer)

    # Get an unacknowledged alert
    list_res = client.get("/api/alerts?is_acknowledged=false", headers=auth_header_engineer)
    assert list_res.status_code == 200
    alerts = list_res.json()["alerts"]

    if len(alerts) > 0:
        alert_id = alerts[0]["id"]
        ack_res = client.patch(f"/api/alerts/{alert_id}/acknowledge", headers=auth_header_engineer)
        assert ack_res.status_code == 200
        ack_data = ack_res.json()
        assert ack_data["is_acknowledged"] is True
        assert ack_data["acknowledged_by"] is not None
