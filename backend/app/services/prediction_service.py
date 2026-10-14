from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
import pandas as pd
from pathlib import Path

from app.core.config import settings
from app.models.machine import Machine
from app.models.prediction import Prediction
from app.ml.predictor import predict_machine_health
from app.schemas.prediction import PredictionRequest, PredictionResponse


def ensure_machine_exists(db: Session, machine_id_str: str) -> Machine:
    """
    Looks up a machine by its string identifier (e.g. 'SPIN-01').
    If not found in database, checks factory_context.csv or creates a default record.
    """
    stmt = select(Machine).where(Machine.machine_id == machine_id_str.strip())
    machine = db.execute(stmt).scalar_one_or_none()

    if machine:
        return machine

    # Look up context metadata from factory_context.csv if available
    context_file = Path(settings.FACTORY_CONTEXT_CSV)
    process = "Textile Manufacturing"
    line = "Line-A"
    criticality = "MEDIUM"

    if context_file.exists():
        try:
            df_ctx = pd.read_csv(context_file)
            m_rows = df_ctx[df_ctx["machine_id"] == machine_id_str.strip()]
            if not m_rows.empty:
                row = m_rows.iloc[0]
                process = str(row.get("process", process))
                line = str(row.get("production_line", line))
                criticality = str(row.get("criticality", criticality))
        except Exception:
            pass

    # Create machine record in database
    new_machine = Machine(
        machine_id=machine_id_str.strip(),
        process=process,
        production_line=line,
        criticality=criticality
    )
    db.add(new_machine)
    db.commit()
    db.refresh(new_machine)
    return new_machine


def process_and_store_prediction(db: Session, request: PredictionRequest) -> PredictionResponse:
    """
    Executes ML inference for failure probability, RUL estimation, and health status,
    then saves the historical prediction record into PostgreSQL.
    """
    # 1. Ensure machine exists in PostgreSQL database
    machine = ensure_machine_exists(db, request.machine_id)

    # 2. Extract sensor features for ML models
    sensor_features = {
        "temperature_c": request.temperature_c,
        "vibration_mm_s": request.vibration_mm_s,
        "motor_current_a": request.motor_current_a,
        "rpm": request.rpm,
        "pressure_bar": request.pressure_bar,
        "load_percentage": request.load_percentage,
        "operating_hours": request.operating_hours,
        "maintenance_count": request.maintenance_count,
    }

    # 3. Run ML Inference Pipeline
    inference_result = predict_machine_health(sensor_features, machine_id=request.machine_id)

    # 4. Save to PostgreSQL predictions table
    prediction_record = Prediction(
        machine_id=machine.id,
        failure_probability=inference_result["failure_probability"],
        failure_prediction=1 if inference_result["failure_prediction"] else 0,
        predicted_rul=inference_result["predicted_rul"],
        health_status=inference_result["health_status"],
        model_version=inference_result["model_version"]
    )
    db.add(prediction_record)
    db.commit()
    db.refresh(prediction_record)

    # 5. Return validated response
    return PredictionResponse(
        id=prediction_record.id,
        machine_id=machine.machine_id,
        failure_probability=prediction_record.failure_probability,
        failure_prediction=bool(prediction_record.failure_prediction),
        predicted_rul=prediction_record.predicted_rul,
        health_status=prediction_record.health_status,
        model_version=prediction_record.model_version,
        created_at=prediction_record.created_at
    )
