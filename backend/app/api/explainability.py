from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.services.explainability_service import get_machine_explainability
from app.schemas.explainability import ExplainabilityResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/explainability", tags=["Explainable AI (SHAP)"])


@router.get("/{machine_id}", response_model=ExplainabilityResponse)
def get_explainability_for_machine(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves SHAP-based feature attribution and decision-support explainability
    for the specified machine ID. Requires JWT authentication.
    """
    clean_id = machine_id.strip()
    try:
        explanation = get_machine_explainability(db, clean_id)
        return ExplainabilityResponse(**explanation)
    except Exception as e:
        logger.error(f"Error computing explainability for {clean_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to compute model explainability: {str(e)}"
        )
