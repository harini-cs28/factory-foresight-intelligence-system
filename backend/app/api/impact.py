from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.impact import ImpactResponse
from app.services.auth_service import get_current_user
from app.services.impact_service import analyze_machine_cascade_impact

router = APIRouter(prefix="/impact", tags=["Impact Analysis"])


@router.get("/{machine_id}", response_model=ImpactResponse)
def get_machine_cascade_impact(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes BFS cascade impact analysis for a given textile machine,
    identifying downstream dependent equipment, propagation levels,
    and estimated potential downtime costs.
    Requires Bearer JWT authentication.
    """
    return analyze_machine_cascade_impact(machine_id, db=db)
