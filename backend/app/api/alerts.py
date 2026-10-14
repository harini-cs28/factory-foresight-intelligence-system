from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import logging

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.alerts.alert_service import (
    get_all_alerts,
    acknowledge_alert,
    evaluate_live_sensor_alerts,
)
from app.schemas.alert import (
    AlertResponse,
    AlertAcknowledgeResponse,
    AlertSummaryResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alerts", tags=["Intelligent Alert Engine"])


@router.get("", response_model=AlertSummaryResponse)
def get_alerts(
    severity: Optional[str] = Query(default=None, description="Filter by severity: CRITICAL, HIGH, MEDIUM, LOW"),
    is_acknowledged: Optional[bool] = Query(default=None, description="Filter by acknowledgement status"),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns alerts filtered by severity or acknowledgement status.
    Requires authentication.
    """
    alerts_data = get_all_alerts(
        db=db,
        severity=severity,
        is_acknowledged=is_acknowledged,
        limit=limit
    )

    alerts = [AlertResponse(**a) for a in alerts_data]
    unack = sum(1 for a in alerts if not a.is_acknowledged)
    critical_cnt = sum(1 for a in alerts if a.severity == "CRITICAL" and not a.is_acknowledged)
    high_cnt = sum(1 for a in alerts if a.severity == "HIGH" and not a.is_acknowledged)
    medium_cnt = sum(1 for a in alerts if a.severity == "MEDIUM" and not a.is_acknowledged)

    return AlertSummaryResponse(
        total_alerts=len(alerts),
        unacknowledged_count=unack,
        critical_count=critical_cnt,
        high_count=high_cnt,
        medium_count=medium_cnt,
        alerts=alerts,
    )


@router.get("/{machine_id}", response_model=List[AlertResponse])
def get_machine_alerts(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all alerts associated with a specific machine identifier.
    Requires authentication.
    """
    clean_id = machine_id.strip()
    alerts_data = get_all_alerts(db=db, machine_id_str=clean_id)
    return [AlertResponse(**a) for a in alerts_data]


@router.patch("/{alert_id}/acknowledge", response_model=AlertAcknowledgeResponse)
def acknowledge_machine_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Acknowledges an active alert.
    Accessible to MAINTENANCE_ENGINEER, PLANT_MANAGER, PRODUCTION_MANAGER, and ADMIN roles.
    """
    result = acknowledge_alert(db=db, alert_id=alert_id, current_user=current_user)
    return AlertAcknowledgeResponse(**result)


@router.post("/evaluate", response_model=AlertSummaryResponse)
def trigger_alert_evaluation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Evaluates current live simulated telemetry across all factory assets
    and generates intelligent alerts for active operational anomalies.
    """
    evaluate_live_sensor_alerts(db)
    alerts_data = get_all_alerts(db=db, limit=100)
    alerts = [AlertResponse(**a) for a in alerts_data]
    unack = sum(1 for a in alerts if not a.is_acknowledged)
    critical_cnt = sum(1 for a in alerts if a.severity == "CRITICAL" and not a.is_acknowledged)
    high_cnt = sum(1 for a in alerts if a.severity == "HIGH" and not a.is_acknowledged)
    medium_cnt = sum(1 for a in alerts if a.severity == "MEDIUM" and not a.is_acknowledged)

    return AlertSummaryResponse(
        total_alerts=len(alerts),
        unacknowledged_count=unack,
        critical_count=critical_cnt,
        high_count=high_cnt,
        medium_count=medium_cnt,
        alerts=alerts,
    )
