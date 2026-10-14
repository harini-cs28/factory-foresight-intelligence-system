from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
import logging

from app.models.machine import Machine
from app.models.alert import Alert
from app.alerts.alert_rules import evaluate_machine_alert_rules
from app.services.prediction_service import ensure_machine_exists

logger = logging.getLogger(__name__)


def process_machine_alerts(
    db: Session,
    machine_id_str: str,
    failure_probability: float,
    predicted_rul: float,
    health_status: str,
    criticality: str = "MEDIUM",
    cascade_affected_count: int = 0,
    cascade_max_level: int = 0,
    recommended_urgency: str = "ROUTINE",
    prediction_id: Optional[int] = None
) -> List[Alert]:
    """
    Evaluates alert rules for a machine, applies deduplication against active unacknowledged alerts,
    and saves new Alert records to PostgreSQL.
    """
    clean_id = machine_id_str.strip()
    machine = ensure_machine_exists(db, clean_id)

    candidates = evaluate_machine_alert_rules(
        machine_id=clean_id,
        failure_probability=failure_probability,
        predicted_rul=predicted_rul,
        health_status=health_status,
        criticality=criticality,
        cascade_affected_count=cascade_affected_count,
        cascade_max_level=cascade_max_level,
        recommended_urgency=recommended_urgency,
        prediction_id=prediction_id,
    )

    created_alerts: List[Alert] = []

    for c in candidates:
        # Deduplication check: Do not create duplicate unacknowledged alert of same type and severity for machine
        existing_stmt = select(Alert).where(
            and_(
                Alert.machine_id == machine.id,
                Alert.alert_type == c["alert_type"],
                Alert.severity == c["severity"],
                Alert.is_acknowledged == False
            )
        )
        existing = db.execute(existing_stmt).scalar_one_or_none()

        if not existing:
            new_alert = Alert(
                machine_id=machine.id,
                prediction_id=c.get("prediction_id"),
                alert_type=c["alert_type"],
                severity=c["severity"],
                title=c["title"],
                message=c["message"],
                recommended_action=c.get("recommended_action"),
                is_acknowledged=False,
            )
            db.add(new_alert)
            created_alerts.append(new_alert)

    if created_alerts:
        db.commit()
        for a in created_alerts:
            db.refresh(a)
        logger.info(f"Generated {len(created_alerts)} new alert(s) for machine {clean_id}.")

    return created_alerts
