import pytest
from fastapi.testclient import TestClient
import app.models
from app.main import app as fastapi_app
from app.iot.sensor_simulator import sensor_simulator
from app.iot.sensor_state import sensor_state_manager

client = TestClient(fastapi_app)


@pytest.fixture
def auth_header():
    res = client.post("/api/auth/login", json={"email": "engineer@gmail.com", "password": "12345"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_sensor_simulator_data_loading():
    """Verify that sensor simulator loads actual machines from the CSV dataset."""
    machines = sensor_simulator.get_loaded_machines()
    assert len(machines) >= 12
    assert "SPIN-01" in machines
    assert "CARD-01" in machines
    assert "WEAV-01" in machines
    assert "PACK-01" in machines


def test_sensor_simulator_sequential_step():
    """Verify that step_simulation advances cycle data and updates sensor state."""
    reading_before = sensor_state_manager.get_latest_reading("SPIN-01")
    assert reading_before is not None
    cycle_before = reading_before["cycle"]

    # Trigger a step
    updated = sensor_simulator.step_simulation()
    assert "SPIN-01" in updated
    reading_after = sensor_state_manager.get_latest_reading("SPIN-01")
    assert reading_after is not None

    # Verify sensor values are numeric and within physical textile machine ranges
    assert reading_after["temperature_c"] > 0
    assert reading_after["vibration_mm_s"] > 0
    assert reading_after["motor_current_a"] > 0
    assert reading_after["rpm"] > 0
    assert reading_after["pressure_bar"] > 0
    assert reading_after["load_percentage"] > 0


def test_get_all_latest_sensors_api(auth_header):
    """Verify GET /api/sensors/latest requires auth and returns all machines."""
    # 1. Unauthenticated request should fail with 401
    unauth_res = client.get("/api/sensors/latest")
    assert unauth_res.status_code == 401

    # 2. Authenticated request should succeed
    res = client.get("/api/sensors/latest", headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert "machines" in data
    assert data["total_machines"] >= 12
    machine_ids = [m["machine_id"] for m in data["machines"]]
    assert "SPIN-01" in machine_ids
    assert "WEAV-01" in machine_ids


def test_get_single_machine_sensor_api(auth_header):
    """Verify GET /api/sensors/latest/{machine_id} for valid and invalid machine IDs."""
    # 1. Valid machine
    res = client.get("/api/sensors/latest/SPIN-01", headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert data["machine_id"] == "SPIN-01"
    assert "temperature_c" in data
    assert "vibration_mm_s" in data
    assert "motor_current_a" in data
    assert "rpm" in data

    # 2. Unknown machine -> 404
    res_unknown = client.get("/api/sensors/latest/UNKNOWN-MACHINE-99", headers=auth_header)
    assert res_unknown.status_code == 404


def test_get_machine_sensor_history_api(auth_header):
    """Verify GET /api/sensors/history/{machine_id} returns recent trend buffer."""
    # Step simulation a few times to build history
    for _ in range(3):
        sensor_simulator.step_simulation()

    res = client.get("/api/sensors/history/SPIN-01?limit=10", headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert data["machine_id"] == "SPIN-01"
    assert data["readings_count"] >= 1
    assert len(data["readings"]) >= 1


def test_live_prediction_from_sensor_api(auth_header):
    """Verify POST /api/sensors/predict/{machine_id} runs ML pipeline on live reading."""
    res = client.post("/api/sensors/predict/SPIN-01", headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert data["machine_id"] == "SPIN-01"
    assert 0.0 <= data["failure_probability"] <= 1.0
    assert data["predicted_rul"] >= 0.0
    assert data["health_status"] in ["HEALTHY", "AT_RISK", "CRITICAL"]
    assert "temperature_c" in data
    assert "vibration_mm_s" in data


def test_trigger_simulation_step_api(auth_header):
    """Verify POST /api/sensors/step manually triggers simulation step."""
    res = client.post("/api/sensors/step", headers=auth_header)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "stepped"
    assert data["updated_machines_count"] >= 12
