from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
import logging

from app.api.auth import get_current_user
from app.models.user import User
from app.iot.sensor_state import sensor_state_manager
from app.iot.sensor_simulator import sensor_simulator
from app.iot.simulator_config import simulator_config
from app.ml.predictor import predict_machine_health
from app.schemas.sensor import (
    SensorReading,
    LatestSensorsResponse,
    MachineHistoryResponse,
    LivePredictionResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sensors", tags=["IoT Sensor Simulation"])


@router.get("/latest", response_model=LatestSensorsResponse)
def get_all_latest_sensors(current_user: User = Depends(get_current_user)):
    """
    Returns the latest simulated sensor readings for all active factory machines.
    Requires authentication.
    """
    readings_data = sensor_state_manager.get_all_latest_readings()
    readings = [SensorReading(**r) for r in readings_data]
    return LatestSensorsResponse(
        machines=readings,
        total_machines=len(readings),
        simulation_interval_seconds=simulator_config.SIMULATION_INTERVAL_SECONDS,
        is_simulator_running=sensor_simulator.is_running,
    )


@router.get("/latest/{machine_id}", response_model=SensorReading)
def get_machine_latest_sensor(machine_id: str, current_user: User = Depends(get_current_user)):
    """
    Returns the latest simulated sensor reading for a specific machine identifier.
    Returns 404 if machine has no simulated data.
    """
    clean_id = machine_id.strip()
    reading = sensor_state_manager.get_latest_reading(clean_id)
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{clean_id}' not found in live sensor simulation."
        )
    return SensorReading(**reading)


@router.get("/history/{machine_id}", response_model=MachineHistoryResponse)
def get_machine_sensor_history(
    machine_id: str,
    limit: int = 30,
    current_user: User = Depends(get_current_user)
):
    """
    Returns the recent historical trend buffer of simulated sensor readings
    for the requested machine.
    """
    clean_id = machine_id.strip()
    history = sensor_state_manager.get_machine_history(clean_id, limit=limit)
    if not history and clean_id not in sensor_state_manager.get_tracked_machines():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{clean_id}' not found in live sensor simulation."
        )
    return MachineHistoryResponse(
        machine_id=clean_id,
        readings_count=len(history),
        readings=[SensorReading(**r) for r in history],
    )


@router.post("/predict/{machine_id}", response_model=LivePredictionResponse)
def predict_from_live_sensor(machine_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieves the latest simulated sensor reading for the machine, runs the
    ML prediction pipeline (failure probability + RUL + health status), and returns the result.
    """
    clean_id = machine_id.strip()
    reading = sensor_state_manager.get_latest_reading(clean_id)
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{clean_id}' not found in live sensor simulation."
        )

    features = {
        "temperature_c": float(reading.get("temperature_c", 0.0)),
        "vibration_mm_s": float(reading.get("vibration_mm_s", 0.0)),
        "motor_current_a": float(reading.get("motor_current_a", 0.0)),
        "rpm": float(reading.get("rpm", 0.0)),
        "pressure_bar": float(reading.get("pressure_bar", 0.0)),
        "load_percentage": float(reading.get("load_percentage", 0.0)),
        "operating_hours": float(reading.get("operating_hours", 3000.0)),
        "maintenance_count": int(reading.get("maintenance_count", 2)),
    }

    pred = predict_machine_health(features, machine_id=clean_id)

    return LivePredictionResponse(
        machine_id=clean_id,
        cycle=reading.get("cycle", 1),
        temperature_c=reading.get("temperature_c", 0.0),
        vibration_mm_s=reading.get("vibration_mm_s", 0.0),
        motor_current_a=reading.get("motor_current_a", 0.0),
        rpm=reading.get("rpm", 0.0),
        pressure_bar=reading.get("pressure_bar", 0.0),
        load_percentage=reading.get("load_percentage", 0.0),
        failure_probability=pred["failure_probability"],
        failure_prediction=pred["failure_prediction"],
        predicted_rul=pred["predicted_rul"],
        health_status=pred["health_status"],
        model_version=pred["model_version"],
        timestamp=reading.get("timestamp", datetime.now(timezone.utc).isoformat()),
    )


@router.post("/step")
def trigger_simulation_step(current_user: User = Depends(get_current_user)):
    """
    Manually advances the simulator by one cycle step for testing and verification.
    """
    updated = sensor_simulator.step_simulation()
    return {
        "status": "stepped",
        "updated_machines_count": len(updated),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
