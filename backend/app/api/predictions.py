from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.auth_service import get_current_user
from app.services.prediction_service import process_and_store_prediction

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def predict_machine_telemetry(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes ML inference (Failure Probability + Remaining Useful Life) on input sensor telemetry,
    determines health status (HEALTHY, AT_RISK, CRITICAL), and stores the historical record in PostgreSQL.
    Requires Bearer JWT authentication.
    """
    return process_and_store_prediction(db, request)
