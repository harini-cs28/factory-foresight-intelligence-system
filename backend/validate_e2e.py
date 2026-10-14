import json
import sys
from fastapi.testclient import TestClient
from app.main import app

def log(msg):
    print(msg, flush=True)

with TestClient(app) as client:
    log("=== 1. HEALTH CHECKS ===")
    h = client.get("/api/health").json()
    log(f"Health: {h}")
    assert h["status"] == "ok" and h["service"] == "FFIS Backend"

    h_db = client.get("/api/health/database").json()
    log(f"Health DB: {h_db}")
    assert h_db["status"] == "ok" and h_db["database"] == "connected"

    log("\n=== 2. AUTHENTICATION VALIDATION ===")
    users = [
        ("admin@gmail.com", "12345", "ADMIN"),
        ("engineer@gmail.com", "12345", "MAINTENANCE_ENGINEER"),
        ("production@gmail.com", "12345", "PRODUCTION_MANAGER"),
        ("manager@gmail.com", "12345", "PLANT_MANAGER")
    ]

    tokens = {}
    for email, pwd, expected_role in users:
        res = client.post("/api/auth/login", json={"email": email, "password": pwd})
        assert res.status_code == 200, f"Login failed for {email}"
        data = res.json()
        tokens[expected_role] = data["access_token"]
        assert data["user"]["role"] == expected_role, f"Role mismatch for {email}"
        log(f"User {email} -> Logged in successfully as {data['user']['role']}")

    # Test invalid credentials
    res_bad_pw = client.post("/api/auth/login", json={"email": "admin@gmail.com", "password": "wrong"})
    assert res_bad_pw.status_code == 401
    log("Wrong password rejected: 401 OK")

    res_bad_user = client.post("/api/auth/login", json={"email": "unknown@gmail.com", "password": "12345"})
    assert res_bad_user.status_code == 401
    log("Unknown user rejected: 401 OK")

    # Test /api/auth/me
    eng_headers = {"Authorization": f"Bearer {tokens['MAINTENANCE_ENGINEER']}"}
    res_me = client.get("/api/auth/me", headers=eng_headers)
    assert res_me.status_code == 200
    log(f"/api/auth/me verified: {res_me.json()['email']} ({res_me.json()['role']})")

    # Test unauthenticated access
    res_unauth = client.get("/api/machines")
    assert res_unauth.status_code == 401
    log("Unauthenticated access blocked: 401 OK")

    log("\n=== 3. MACHINE & DASHBOARD OVERVIEW ===")
    res_overview = client.get("/api/dashboard/overview", headers=eng_headers)
    assert res_overview.status_code == 200
    log(f"Dashboard Overview: {json.dumps(res_overview.json(), indent=2)}")

    res_machines = client.get("/api/machines", headers=eng_headers)
    assert res_machines.status_code == 200
    machine_list = res_machines.json()
    log(f"Total machines returned: {len(machine_list)}")
    for m in machine_list[:5]:
        pred_stat = m.get("latest_prediction")
        stat = pred_stat.get("health_status") if pred_stat else "N/A"
        log(f"  - ID: {m['machine_id']}, Process: {m['process']}, Line: {m['production_line']}, Criticality: {m['criticality']}, Health: {stat}")

    log("\n=== 4. LIVE PREDICTION INFERENCE ON 3 MACHINES ===")
    test_machines = ["SPIN-01", "CARD-01", "WEAV-01"]
    for m_id in test_machines:
        pred_req = {
            "machine_id": m_id,
            "temperature_c": 75.5,
            "vibration_mm_s": 4.2,
            "motor_current_a": 18.5,
            "rpm": 1450.0,
            "pressure_bar": 6.2,
            "load_percentage": 82.0,
            "operating_hours": 4200,
            "maintenance_count": 3
        }
        res_pred = client.post("/api/predictions/predict", json=pred_req, headers=eng_headers)
        assert res_pred.status_code == 201
        pred_data = res_pred.json()
        log(f"Machine {m_id}:")
        log(f"  Failure Prob: {pred_data['failure_probability']:.4f}")
        log(f"  Failure Pred: {pred_data['failure_prediction']}")
        log(f"  Predicted RUL: {pred_data['predicted_rul']:.2f} cycles")
        log(f"  Health Status: {pred_data['health_status']}")
        log(f"  Model Version: {pred_data['model_version']}")

    log("\n=== 5. CASCADE IMPACT ANALYSIS ===")
    for m_id in test_machines:
        res_impact = client.get(f"/api/impact/{m_id}", headers=eng_headers)
        assert res_impact.status_code == 200
        impact_data = res_impact.json()
        log(f"Impact for {m_id}:")
        log(f"  Origin: {impact_data['origin_machine']['machine_id']} ({impact_data['origin_machine']['process']})")
        log(f"  Affected Count: {impact_data['cascade']['affected_machine_count']}")
        log(f"  Max Cascade Level: {impact_data['cascade']['maximum_cascade_level']}")
        log(f"  Estimated Repair Hours: {impact_data['production_impact']['estimated_total_repair_hours']}")
        log(f"  Estimated Potential Downtime Cost: INR {impact_data['production_impact']['estimated_potential_downtime_cost']}")
        log(f"  Severity: {impact_data['production_impact']['impact_severity']}")

    log("\n=== 6. PRESCRIPTIVE MAINTENANCE RECOMMENDATION ===")
    for m_id in test_machines:
        res_rec = client.get(f"/api/maintenance/recommendations/{m_id}", headers=eng_headers)
        assert res_rec.status_code == 200
        rec_data = res_rec.json()
        log(f"Recommendation for {m_id}:")
        log(f"  Priority: {rec_data['priority']}")
        log(f"  Action: {rec_data['recommended_action']}")
        log(f"  Window: {rec_data['recommended_window']}")
        log(f"  Est Repair Hours: {rec_data['estimated_repair_hours']}")
        log(f"  Reason: {rec_data['reason']}")
        if rec_data.get("decision_factors"):
            df = rec_data["decision_factors"]
            log(f"  Decision Factors: prob={df['failure_probability']:.2f}, rul={df['predicted_rul']:.1f}, severity={df['impact_severity']}, tech={df['technician_available']}, spare={df['spare_part_available']}")

    log("\n=== 7. RECOMMENDATION HISTORY AUDIT ===")
    for m_id in test_machines:
        res_hist = client.get(f"/api/maintenance/recommendations/{m_id}/history", headers=eng_headers)
        assert res_hist.status_code == 200
        hist_data = res_hist.json()
        log(f"Audit History for {m_id}: {len(hist_data)} recorded entries")

    log("\n=== 8. ROLE-BASED ACCESS CONTROL (/api/admin/users) ===")
    # Engineer should be forbidden (403)
    res_admin_forbidden = client.get("/api/admin/users", headers=eng_headers)
    assert res_admin_forbidden.status_code == 403
    log("Engineer rejected from admin route: 403 OK")

    # Admin should succeed (200)
    admin_headers = {"Authorization": f"Bearer {tokens['ADMIN']}"}
    res_admin_ok = client.get("/api/admin/users", headers=admin_headers)
    assert res_admin_ok.status_code == 200
    log(f"Admin successfully fetched users: {len(res_admin_ok.json())} users returned")
    log("\nALL E2E VALIDATION CHECKS PASSED PERFECTLY!")
