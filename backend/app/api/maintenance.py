from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database.session import get_db
from app.models.user import User
from app.models.machine import Machine
from app.models.maintenance import MaintenanceRecord, MaintenanceRecommendation
from app.schemas.maintenance import (
    RecommendationResponse,
    RecommendationHistoryItem,
    WorkOrderItem,
    UpdateWorkOrderStatusRequest
)
from app.services.auth_service import get_current_user, require_roles
from app.services.decision_service import (
    generate_maintenance_recommendation,
    get_machine_recommendation_history,
)
from app.services.impact_service import get_factory_context_data
from app.services.prediction_service import ensure_machine_exists

router = APIRouter(prefix="/maintenance", tags=["Prescriptive Maintenance"])


def ensure_initial_work_orders(db: Session):
    """Seed initial maintenance work orders in PostgreSQL from factory_context.csv if table is empty."""
    count = db.query(MaintenanceRecord).count()
    if count > 0:
        return

    factory_context = get_factory_context_data()
    for m_id, ctx in factory_context.items():
        machine = ensure_machine_exists(db, m_id)
        m_type = ctx.get("maintenance_type", "Preventive")
        m_window = ctx.get("maintenance_window", "AVAILABLE")
        rep_hours = ctx.get("estimated_repair_hours", 4.0)

        status_val = "SCHEDULED"
        if m_window == "AVAILABLE":
            status_val = "IN_PROGRESS"
        elif m_window == "UNAVAILABLE":
            status_val = "SCHEDULED"

        desc = f"{m_type} maintenance on {machine.process} line. Estimated repair: {rep_hours}h. Window: {m_window}."
        
        rec = MaintenanceRecord(
            machine_id=machine.id,
            maintenance_type=m_type,
            description=desc,
            status=status_val,
            created_at=datetime.now(timezone.utc)
        )
        db.add(rec)
    db.commit()


@router.get("/recommendations/{machine_id}", response_model=RecommendationResponse)
def get_prescriptive_recommendation(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates an explainable prescriptive maintenance recommendation for a machine,
    combining its latest ML failure prediction, RUL, cascade dependencies,
    technician availability, spare parts inventory, and shift maintenance windows.
    Requires Bearer JWT authentication.
    """
    return generate_maintenance_recommendation(machine_id, db=db)


@router.get("/recommendations/{machine_id}/history", response_model=List[RecommendationHistoryItem])
def get_recommendation_audit_history(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves chronological history of prescriptive maintenance recommendations
    previously generated for the specified machine.
    Requires Bearer JWT authentication.
    """
    return get_machine_recommendation_history(machine_id, db=db)


@router.get("/work-orders", response_model=List[WorkOrderItem])
def list_work_orders(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves maintenance work orders with equipment context.
    Accessible to MAINTENANCE_ENGINEER, PLANT_MANAGER, and ADMIN.
    """
    ensure_initial_work_orders(db)

    stmt = select(MaintenanceRecord).order_by(MaintenanceRecord.id)
    records = db.execute(stmt).scalars().all()

    result = []
    for r in records:
        if status_filter and r.status.upper() != status_filter.upper():
            continue
        m = r.machine
        result.append(
            WorkOrderItem(
                id=r.id,
                machine_id=m.machine_id if m else "UNKNOWN",
                process=m.process if m else None,
                production_line=m.production_line if m else None,
                criticality=m.criticality if m else None,
                maintenance_type=r.maintenance_type,
                description=r.description,
                status=r.status,
                scheduled_at=r.scheduled_at,
                completed_at=r.completed_at,
                created_at=r.created_at or datetime.now(timezone.utc)
            )
        )
    return result


@router.patch("/work-orders/{record_id}/status", response_model=WorkOrderItem)
def update_work_order_status(
    record_id: int,
    payload: UpdateWorkOrderStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("MAINTENANCE_ENGINEER", "ADMIN"))
):
    """
    Updates the status of a maintenance work order (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED).
    Role-enforced: Only MAINTENANCE_ENGINEER and ADMIN can update work orders.
    """
    stmt = select(MaintenanceRecord).where(MaintenanceRecord.id == record_id)
    rec = db.execute(stmt).scalar_one_or_none()
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work order with ID {record_id} not found."
        )

    valid_statuses = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
    new_status = payload.status.upper().strip()
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Must be one of: {', '.join(valid_statuses)}"
        )

    rec.status = new_status
    if new_status == "COMPLETED":
        rec.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(rec)

    m = rec.machine
    return WorkOrderItem(
        id=rec.id,
        machine_id=m.machine_id if m else "UNKNOWN",
        process=m.process if m else None,
        production_line=m.production_line if m else None,
        criticality=m.criticality if m else None,
        maintenance_type=rec.maintenance_type,
        description=rec.description,
        status=rec.status,
        scheduled_at=rec.scheduled_at,
        completed_at=rec.completed_at,
        created_at=rec.created_at
    )


@router.get("/history", response_model=List[WorkOrderItem])
def get_maintenance_history(
    machine_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves completed and historical maintenance records.
    Accessible to MAINTENANCE_ENGINEER, PLANT_MANAGER, and ADMIN.
    """
    ensure_initial_work_orders(db)

    stmt = select(MaintenanceRecord).order_by(desc(MaintenanceRecord.created_at))
    records = db.execute(stmt).scalars().all()

    result = []
    for r in records:
        m = r.machine
        if machine_id and m and m.machine_id != machine_id.strip():
            continue
        result.append(
            WorkOrderItem(
                id=r.id,
                machine_id=m.machine_id if m else "UNKNOWN",
                process=m.process if m else None,
                production_line=m.production_line if m else None,
                criticality=m.criticality if m else None,
                maintenance_type=r.maintenance_type,
                description=r.description,
                status=r.status,
                scheduled_at=r.scheduled_at,
                completed_at=r.completed_at,
                created_at=r.created_at or datetime.now(timezone.utc)
            )
        )
    return result
