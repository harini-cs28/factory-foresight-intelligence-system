from pathlib import Path
from typing import List, Optional, Dict, Any
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.models.machine import Machine
from app.models.prediction import Prediction
from app.services.prediction_service import ensure_machine_exists
from app.services.impact_service import get_factory_context_data
from app.ml.predictor import predict_machine_health
from app.schemas.machine import MachineItem, SensorHistoryItem, DashboardOverviewResponse
from app.schemas.prediction import PredictionResponse


def seed_all_machines_if_needed(db: Session) -> List[Machine]:
    """Ensures all 12 textile machines from factory_context.csv exist in PostgreSQL."""
    factory_context = get_factory_context_data()
    machines = []
    for m_id in factory_context.keys():
        m = ensure_machine_exists(db, m_id)
        machines.append(m)
    return machines


def get_latest_machine_prediction(db: Session, machine: Machine) -> Optional[PredictionResponse]:
    """Retrieves the latest prediction for a machine, or computes it from the latest cycle if not yet stored."""
    stmt = (
        select(Prediction)
        .where(Prediction.machine_id == machine.id)
        .order_by(Prediction.created_at.desc())
    )
    latest = db.execute(stmt).scalars().first()

    if latest:
        return PredictionResponse(
            id=latest.id,
            machine_id=machine.machine_id,
            failure_probability=latest.failure_probability,
            failure_prediction=bool(latest.failure_prediction),
            predicted_rul=latest.predicted_rul,
            health_status=latest.health_status,
            model_version=latest.model_version,
            created_at=latest.created_at
        )

    # Compute prediction from latest sensor cycle in CSV
    sensor_path = Path(settings.SENSOR_DATA_CSV)
    if sensor_path.exists():
        try:
            df = pd.read_csv(sensor_path)
            m_df = df[df["machine_id"] == machine.machine_id]
            if not m_df.empty:
                last_row = m_df.sort_values(by="cycle").iloc[-1]
                sensor_dict = {
                    "temperature_c": float(last_row["temperature_c"]),
                    "vibration_mm_s": float(last_row["vibration_mm_s"]),
                    "motor_current_a": float(last_row["motor_current_a"]),
                    "rpm": float(last_row["rpm"]),
                    "pressure_bar": float(last_row["pressure_bar"]),
                    "load_percentage": float(last_row["load_percentage"]),
                    "operating_hours": int(last_row["operating_hours"]),
                    "maintenance_count": int(last_row["maintenance_count"]),
                }
                inf = predict_machine_health(sensor_dict, machine_id=machine.machine_id)
                new_pred = Prediction(
                    machine_id=machine.id,
                    failure_probability=inf["failure_probability"],
                    failure_prediction=1 if inf["failure_prediction"] else 0,
                    predicted_rul=inf["predicted_rul"],
                    health_status=inf["health_status"],
                    model_version=inf["model_version"]
                )
                db.add(new_pred)
                db.commit()
                db.refresh(new_pred)
                return PredictionResponse(
                    id=new_pred.id,
                    machine_id=machine.machine_id,
                    failure_probability=new_pred.failure_probability,
                    failure_prediction=bool(new_pred.failure_prediction),
                    predicted_rul=new_pred.predicted_rul,
                    health_status=new_pred.health_status,
                    model_version=new_pred.model_version,
                    created_at=new_pred.created_at
                )
        except Exception:
            pass

    return None


def get_all_machines_service(db: Session) -> List[MachineItem]:
    """Returns list of all machines with their operational context and latest prediction."""
    seed_all_machines_if_needed(db)
    factory_context = get_factory_context_data()

    stmt = select(Machine).order_by(Machine.machine_id)
    machines = db.execute(stmt).scalars().all()

    result = []
    for m in machines:
        ctx = factory_context.get(m.machine_id, {})
        pred = get_latest_machine_prediction(db, m)

        result.append(
            MachineItem(
                id=m.id,
                machine_id=m.machine_id,
                process=m.process,
                production_line=m.production_line,
                criticality=m.criticality,
                latest_prediction=pred,
                technician_available=ctx.get("technician_available"),
                spare_part_available=ctx.get("spare_part_available"),
                maintenance_window=ctx.get("maintenance_window"),
            )
        )
    return result


def get_single_machine_service(machine_id_str: str, db: Session) -> MachineItem:
    """Returns detailed machine information for a single machine ID."""
    m_id = machine_id_str.strip()
    factory_context = get_factory_context_data()
    
    if m_id not in factory_context:
        # Check if in DB
        stmt = select(Machine).where(Machine.machine_id == m_id)
        machine = db.execute(stmt).scalar_one_or_none()
        if not machine:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Machine '{m_id}' not found.")
    else:
        machine = ensure_machine_exists(db, m_id)

    ctx = factory_context.get(m_id, {})
    pred = get_latest_machine_prediction(db, machine)

    return MachineItem(
        id=machine.id,
        machine_id=machine.machine_id,
        process=machine.process,
        production_line=machine.production_line,
        criticality=machine.criticality,
        latest_prediction=pred,
        technician_available=ctx.get("technician_available"),
        spare_part_available=ctx.get("spare_part_available"),
        maintenance_window=ctx.get("maintenance_window"),
    )


def get_machine_sensor_history_service(
    machine_id_str: str,
    start_cycle: Optional[int] = None,
    end_cycle: Optional[int] = None,
    limit: Optional[int] = 50
) -> List[SensorHistoryItem]:
    """Retrieves chronological sensor telemetry history from textile_machine_sensor_data.csv."""
    m_id = machine_id_str.strip()
    sensor_path = Path(settings.SENSOR_DATA_CSV)
    if not sensor_path.exists():
        raise HTTPException(status_code=500, detail="Sensor dataset file missing.")

    df = pd.read_csv(sensor_path)
    m_df = df[df["machine_id"] == m_id]
    if m_df.empty:
        raise HTTPException(status_code=404, detail=f"No sensor history for machine '{m_id}'.")

    if start_cycle is not None:
        m_df = m_df[m_df["cycle"] >= start_cycle]
    if end_cycle is not None:
        m_df = m_df[m_df["cycle"] <= end_cycle]

    m_df = m_df.sort_values(by="cycle")
    if limit and limit > 0:
        m_df = m_df.tail(limit)

    records = []
    for _, row in m_df.iterrows():
        records.append(
            SensorHistoryItem(
                machine_id=str(row["machine_id"]),
                process=str(row["process"]),
                production_line=str(row["production_line"]),
                cycle=int(row["cycle"]),
                temperature_c=float(row["temperature_c"]),
                vibration_mm_s=float(row["vibration_mm_s"]),
                motor_current_a=float(row["motor_current_a"]),
                rpm=float(row["rpm"]),
                pressure_bar=float(row["pressure_bar"]),
                load_percentage=float(row["load_percentage"]),
                operating_hours=int(row["operating_hours"]),
                maintenance_count=int(row["maintenance_count"]),
                rul_cycles=int(row["rul_cycles"]),
                failure_within_20_cycles=int(row["failure_within_20_cycles"]),
            )
        )
    return records


def get_dashboard_overview_service(db: Session) -> DashboardOverviewResponse:
    """Computes high-level factory health summary and critical asset count."""
    machines = get_all_machines_service(db)
    
    healthy = 0
    at_risk = 0
    critical = 0
    critical_machines = []
    affected_lines = set()

    for m in machines:
        affected_lines.add(m.production_line)
        if m.latest_prediction:
            status = m.latest_prediction.health_status
            if status == "CRITICAL":
                critical += 1
                critical_machines.append(m.machine_id)
            elif status == "AT_RISK":
                at_risk += 1
            else:
                healthy += 1
        else:
            healthy += 1

    return DashboardOverviewResponse(
        total_machines=len(machines),
        healthy_count=healthy,
        at_risk_count=at_risk,
        critical_count=critical,
        critical_machines=critical_machines,
        high_priority_maintenance_count=critical + (1 if at_risk > 0 else 0),
        affected_production_lines=sorted(list(affected_lines))
    )
