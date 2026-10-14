from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.auth_service import get_current_user
from app.models.user import User
from app.schemas.machine import MachineItem, SensorHistoryItem, DashboardOverviewResponse
from app.services.machine_service import (
    get_all_machines_service,
    get_single_machine_service,
    get_machine_sensor_history_service,
    get_dashboard_overview_service
)

router = APIRouter(tags=["Machines"])


@router.get("/machines", response_model=List[MachineItem])
def list_machines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all machines with operational context and latest prediction."""
    return get_all_machines_service(db)


@router.get("/machines/{machine_id}", response_model=MachineItem)
def get_machine_details(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve specific machine details and operational status."""
    return get_single_machine_service(machine_id, db)


@router.get("/machines/{machine_id}/sensor-history", response_model=List[SensorHistoryItem])
def get_machine_sensor_history(
    machine_id: str,
    start_cycle: Optional[int] = Query(None, description="Start cycle filter"),
    end_cycle: Optional[int] = Query(None, description="End cycle filter"),
    limit: Optional[int] = Query(50, description="Number of recent records"),
    current_user: User = Depends(get_current_user)
):
    """Retrieve sensor telemetry history for a specific machine."""
    return get_machine_sensor_history_service(
        machine_id_str=machine_id,
        start_cycle=start_cycle,
        end_cycle=end_cycle,
        limit=limit
    )


@router.get("/dashboard/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve overall factory health summary, total machine metrics, and critical assets."""
    return get_dashboard_overview_service(db)
