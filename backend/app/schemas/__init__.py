from app.schemas.auth import LoginRequest, UserResponse, TokenResponse, ProtectedMessageResponse
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.schemas.impact import (
    OriginMachineInfo,
    AffectedMachineInfo,
    CascadeInfo,
    ProductionImpactInfo,
    ImpactResponse,
)
from app.schemas.maintenance import (
    DecisionFactors,
    RecommendationResponse,
    RecommendationHistoryItem,
)

__all__ = [
    "LoginRequest",
    "UserResponse",
    "TokenResponse",
    "ProtectedMessageResponse",
    "PredictionRequest",
    "PredictionResponse",
    "OriginMachineInfo",
    "AffectedMachineInfo",
    "CascadeInfo",
    "ProductionImpactInfo",
    "ImpactResponse",
    "DecisionFactors",
    "RecommendationResponse",
    "RecommendationHistoryItem",
]
