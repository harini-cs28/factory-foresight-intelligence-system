from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
import logging

from app.models.machine import Machine
from app.models.prediction import Prediction
from app.ml.explainability import compute_shap_explanation
from app.ml.predictor import predict_machine_health
from app.iot.sensor_state import sensor_state_manager
from app.services.prediction_service import ensure_machine_exists

logger = logging.getLogger(__name__)


def get_machine_explainability(db: Session, machine_id_str: str) -> Dict[str, Any]:
    """
    Retrieves latest sensor features for the machine, calculates SHAP feature attributions,
    and returns comprehensive explainability insights.
    """
    clean_id = machine_id_str.strip()
    machine = ensure_machine_exists(db, clean_id)

    # 1. Retrieve latest sensor telemetry (from live simulator or database/defaults)
    sim_reading = sensor_state_manager.get_latest_reading(clean_id)
    if sim_reading:
        sensor_features = {
            "temperature_c": float(sim_reading.get("temperature_c", 65.0)),
            "vibration_mm_s": float(sim_reading.get("vibration_mm_s", 2.5)),
            "motor_current_a": float(sim_reading.get("motor_current_a", 12.0)),
            "rpm": float(sim_reading.get("rpm", 1450.0)),
            "pressure_bar": float(sim_reading.get("pressure_bar", 3.2)),
            "load_percentage": float(sim_reading.get("load_percentage", 60.0)),
            "operating_hours": float(sim_reading.get("operating_hours", 3800.0)),
            "maintenance_count": int(sim_reading.get("maintenance_count", 3)),
        }
    else:
        # Fallback to standard baseline if simulator has no entry for this specific machine ID
        sensor_features = {
            "temperature_c": 62.5,
            "vibration_mm_s": 2.3,
            "motor_current_a": 12.1,
            "rpm": 1450.0,
            "pressure_bar": 3.0,
            "load_percentage": 55.0,
            "operating_hours": 3500.0,
            "maintenance_count": 2,
        }

    # 2. Get latest ML inference
    pred_result = predict_machine_health(sensor_features, machine_id=clean_id)
    failure_prob = pred_result["failure_probability"]
    predicted_rul = pred_result["predicted_rul"]
    health_status = pred_result["health_status"]

    # 3. Calculate SHAP explanation
    shap_data = compute_shap_explanation(
        features=sensor_features,
        machine_id=clean_id,
        failure_probability=failure_prob
    )

    return {
        "machine_id": clean_id,
        "process": machine.process,
        "production_line": machine.production_line,
        "criticality": machine.criticality,
        "failure_probability": failure_prob,
        "predicted_rul": predicted_rul,
        "health_status": health_status,
        "base_value": shap_data["base_value"],
        "explanation_summary": shap_data["explanation_summary"],
        "method": shap_data["method"],
        "top_factors": shap_data["top_factors"],
        "all_factors": shap_data["all_factors"],
        "increasing_factors": shap_data["increasing_factors"],
        "decreasing_factors": shap_data["decreasing_factors"],
        "sensor_features": sensor_features,
    }
