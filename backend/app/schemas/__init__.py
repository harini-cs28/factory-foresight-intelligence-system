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
from app.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantSourceData,
    QuickQuestionItem,
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
    "AssistantChatRequest",
    "AssistantChatResponse",
    "AssistantSourceData",
    "QuickQuestionItem",
]
