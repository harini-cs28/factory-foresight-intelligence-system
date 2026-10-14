import pytest
from fastapi.testclient import TestClient
import app.models
from app.main import app as fastapi_app

client = TestClient(fastapi_app)

def test_complete_e2e_flow_and_data_integrity():
    """
    Complete Phase 8 End-to-End integration test covering:
    1. Health checks
    2. Authentication for all 4 roles + failure cases
    3. Machine listing and overview
    4. Sensor telemetry and ML predictions on multiple assets
    5. BFS cascade impact analysis
    6. Prescriptive maintenance recommendation and explainability
    7. Audit recommendation history
    8. RBAC security enforcement
    """
    # 1. Health checks
    res_h = client.get("/api/health")
    assert res_h.status_code == 200
    assert res_h.json()["status"] == "ok"

    res_db = client.get("/api/health/database")
    assert res_db.status_code == 200
    assert res_db.json()["database"] == "connected"

    # 2. Authentication
    users = [
        ("admin@gmail.com", "12345", "ADMIN"),
        ("engineer@gmail.com", "12345", "MAINTENANCE_ENGINEER"),
        ("production@gmail.com", "12345", "PRODUCTION_MANAGER"),
        ("manager@gmail.com", "12345", "PLANT_MANAGER")
    ]
    tokens = {}
    for email, pwd, expected_role in users:
        res = client.post("/api/auth/login", json={"email": email, "password": pwd})
        assert res.status_code == 200
        data = res.json()
        tokens[expected_role] = data["access_token"]
        assert data["user"]["role"] == expected_role

    # Verify wrong password & unknown email
    assert client.post("/api/auth/login", json={"email": "admin@gmail.com", "password": "wrong"}).status_code == 401
    assert client.post("/api/auth/login", json={"email": "unknown@gmail.com", "password": "12345"}).status_code == 401

    # Verify /api/auth/me
    eng_headers = {"Authorization": f"Bearer {tokens['MAINTENANCE_ENGINEER']}"}
    res_me = client.get("/api/auth/me", headers=eng_headers)
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "engineer@gmail.com"

    # Verify unauthenticated rejection
    assert client.get("/api/machines").status_code == 401

    # 3. Overview & Machine List
    res_overview = client.get("/api/dashboard/overview", headers=eng_headers)
    assert res_overview.status_code == 200
    overview_data = res_overview.json()
    assert overview_data["total_machines"] > 0
    assert "affected_production_lines" in overview_data

    res_machines = client.get("/api/machines", headers=eng_headers)
    assert res_machines.status_code == 200
    machines = res_machines.json()
    assert len(machines) > 0

    # 4. Multi-machine live prediction inference
    for machine in machines[:3]:
        m_id = machine["machine_id"]
        pred_payload = {
            "machine_id": m_id,
            "temperature_c": 72.0,
            "vibration_mm_s": 3.8,
            "motor_current_a": 16.5,
            "rpm": 1400.0,
            "pressure_bar": 5.8,
            "load_percentage": 80.0,
            "operating_hours": 3500,
            "maintenance_count": 2
        }
        res_pred = client.post("/api/predictions/predict", json=pred_payload, headers=eng_headers)
        assert res_pred.status_code == 201
        pred = res_pred.json()
        assert 0.0 <= pred["failure_probability"] <= 1.0
        assert pred["predicted_rul"] >= 0.0
        assert pred["health_status"] in ["HEALTHY", "AT_RISK", "CRITICAL"]

        # 5. Cascade Impact
        res_impact = client.get(f"/api/impact/{m_id}", headers=eng_headers)
        assert res_impact.status_code == 200
        impact = res_impact.json()
        assert impact["origin_machine"]["machine_id"] == m_id
        assert impact["cascade"]["maximum_cascade_level"] >= 0
        assert impact["production_impact"]["impact_severity"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        assert impact["production_impact"]["estimated_potential_downtime_cost"] >= 0.0

        # 6. Prescriptive Maintenance Recommendation
        res_rec = client.get(f"/api/maintenance/recommendations/{m_id}", headers=eng_headers)
        assert res_rec.status_code == 200
        rec = res_rec.json()
        assert rec["priority"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
        assert len(rec["recommended_action"]) > 0
        assert len(rec["reason"]) > 0
        assert rec["estimated_repair_hours"] > 0.0
        assert rec["decision_factors"] is not None

        # 7. Recommendation Audit History
        res_hist = client.get(f"/api/maintenance/recommendations/{m_id}/history", headers=eng_headers)
        assert res_hist.status_code == 200
        assert isinstance(res_hist.json(), list)

    # 8. RBAC
    res_admin_denied = client.get("/api/admin/users", headers=eng_headers)
    assert res_admin_denied.status_code == 403

    admin_headers = {"Authorization": f"Bearer {tokens['ADMIN']}"}
    res_admin_ok = client.get("/api/admin/users", headers=admin_headers)
    assert res_admin_ok.status_code == 200
    assert len(res_admin_ok.json()) >= 4
