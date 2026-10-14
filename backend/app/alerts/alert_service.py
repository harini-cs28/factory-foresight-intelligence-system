from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, desc, and_
from fastapi import HTTPException, status
import logging

from app.models.alert import Alert
from app.models.machine import Machine
from app.models.user import User
from app.alerts.alert_engine import process_machine_alerts
from app.iot.sensor_state import sensor_state_manager
from app.ml.predictor import predict_machine_health
from app.impact.cascade_analyzer import run_bfs_cascade_analysis
from app.decision_engine.priority_engine import determine_maintenance_priority

logger = logging.getLogger(__name__)


def get_all_alerts(
    db: Session,
    machine_id_str: Optional[str] = None,
    severity: Optional[str] = None,
    is_acknowledged: Optional[bool] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Retrieves alerts with optional filtering by machine, severity, or acknowledged status.
    """
    stmt = (
        select(Alert)
        .join(Machine, Alert.machine_id == Machine.id)
        .options(joinedload(Alert.machine), joinedload(Alert.acknowledged_by))
        .order_by(desc(Alert.created_at))
    )

    conditions = []
    if machine_id_str:
        conditions.append(Machine.machine_id == machine_id_str.strip())
    if severity:
        conditions.append(Alert.severity == severity.upper().strip())
    if is_acknowledged is not None:
        conditions.append(Alert.is_acknowledged == is_acknowledged)

    if conditions:
        stmt = stmt.where(and_(*conditions))

    stmt = stmt.limit(limit)
    results = db.execute(stmt).scalars().all()

    alerts_data = []
    for a in results:
        alerts_data.append({
            "id": a.id,
            "machine_id": a.machine.machine_id if a.machine else f"M-{a.machine_id}",
            "process": a.machine.process if a.machine else "Manufacturing",
            "production_line": a.machine.production_line if a.machine else "Line-A",
            "prediction_id": a.prediction_id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "title": a.title,
            "message": a.message,
            "recommended_action": a.recommended_action,
            "is_acknowledged": a.is_acknowledged,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "acknowledged_at": a.acknowledged_at.isoformat() if a.acknowledged_at else None,
            "acknowledged_by": a.acknowledged_by.name if a.acknowledged_by else None,
        })

    return alerts_data


def get_alert_by_id(db: Session, alert_id: int) -> Alert:
    """Retrieves an alert by its primary key ID or raises 404."""
    stmt = (
        select(Alert)
        .where(Alert.id == alert_id)
        .options(joinedload(Alert.machine), joinedload(Alert.acknowledged_by))
    )
    alert = db.execute(stmt).scalar_one_or_none()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert #{alert_id} not found."
        )
    return alert


def acknowledge_alert(db: Session, alert_id: int, current_user: User) -> Dict[str, Any]:
    """
    Marks an alert as acknowledged by the current authenticated user.
    """
    alert = get_alert_by_id(db, alert_id)

    if alert.is_acknowledged:
        return {
            "id": alert.id,
            "machine_id": alert.machine.machine_id if alert.machine else f"M-{alert.machine_id}",
            "is_acknowledged": True,
            "message": "Alert was already acknowledged.",
            "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
        }

    alert.is_acknowledged = True
    alert.acknowledged_at = datetime.now(timezone.utc)
    alert.acknowledged_by_user_id = current_user.id

    db.commit()
    db.refresh(alert)

    logger.info(f"Alert #{alert_id} for machine {alert.machine.machine_id} acknowledged by user {current_user.email}.")

    return {
        "id": alert.id,
        "machine_id": alert.machine.machine_id if alert.machine else f"M-{alert.machine_id}",
        "is_acknowledged": True,
        "message": f"Alert #{alert.id} successfully acknowledged.",
        "acknowledged_at": alert.acknowledged_at.isoformat(),
        "acknowledged_by": current_user.name,
    }


def evaluate_live_sensor_alerts(db: Session) -> List[Alert]:
    """
    Evaluates current live simulated telemetry for all machines and triggers
    intelligent alerts when degradation or cascade risks are detected.
    """
    latest_readings = sensor_state_manager.get_all_latest_readings()
    all_created: List[Alert] = []

    for r in latest_readings:
        machine_id_str = r.get("machine_id")
        if not machine_id_str:
            continue

        features = {
            "temperature_c": float(r.get("temperature_c", 60.0)),
            "vibration_mm_s": float(r.get("vibration_mm_s", 2.0)),
            "motor_current_a": float(r.get("motor_current_a", 12.0)),
            "rpm": float(r.get("rpm", 1450.0)),
            "pressure_bar": float(r.get("pressure_bar", 3.0)),
            "load_percentage": float(r.get("load_percentage", 55.0)),
            "operating_hours": float(r.get("operating_hours", 3500.0)),
            "maintenance_count": int(r.get("maintenance_count", 2)),
        }

        # ML prediction
        pred = predict_machine_health(features, machine_id=machine_id_str)
        failure_prob = pred["failure_probability"]
        predicted_rul = pred["predicted_rul"]
        health_status = pred["health_status"]

        # Machine metadata
        machine_stmt = select(Machine).where(Machine.machine_id == machine_id_str)
        machine = db.execute(machine_stmt).scalar_one_or_none()
        criticality = machine.criticality if machine else "MEDIUM"

        # Cascade analysis
        cascade_count = 0
        cascade_level = 0
        try:
            cascade_res = run_bfs_cascade_analysis(machine_id_str)
            cascade_count = len(cascade_res.get("affected_machines", []))
            cascade_level = cascade_res.get("max_cascade_level", 0)
        except Exception:
            pass

        # Recommendation urgency via priority engine
        rec_urgency = "ROUTINE"
        try:
            priority_level, reasons = determine_maintenance_priority(
                health_status=health_status,
                failure_probability=failure_prob,
                predicted_rul=predicted_rul,
                machine_criticality=criticality,
                affected_machine_count=cascade_count,
            )
            rec_urgency = "IMMEDIATE" if priority_level in ["CRITICAL", "HIGH"] else "ROUTINE"
        except Exception:
            pass

        # Process alerts
        created = process_machine_alerts(
            db=db,
            machine_id_str=machine_id_str,
            failure_probability=failure_prob,
            predicted_rul=predicted_rul,
            health_status=health_status,
            criticality=criticality,
            cascade_affected_count=cascade_count,
            cascade_max_level=cascade_level,
            recommended_urgency=rec_urgency,
        )
        all_created.extend(created)

    return all_created
