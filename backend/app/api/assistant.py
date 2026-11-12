from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    QuickQuestionItem,
    AssistantSourceData,
)
from app.services.auth_service import get_current_user
from app.services.assistant_service import (
    get_assistant_chat_response,
    get_quick_questions,
    fetch_machine_context,
)

router = APIRouter(prefix="/assistant", tags=["AI Maintenance Assistant"])


@router.post("/chat", response_model=AssistantChatResponse)
def assistant_chat(
    request: AssistantChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Main conversational endpoint for the 3D AI Robot Maintenance Assistant.
    Retrieves authorized equipment telemetry, ML failure predictions, RUL estimations,
    TreeSHAP attributions, cascade impacts, and prescriptive maintenance recommendations.
    Supports English ('en'), Tamil ('ta'), and Tanglish ('tanglish').
    Requires valid JWT Bearer authentication.
    """
    try:
        return get_assistant_chat_response(db, request, current_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Assistant processing error: {str(e)}"
        )


@router.get("/quick-questions", response_model=List[QuickQuestionItem])
def list_quick_questions(
    language: str = "en",
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves the 8 standardized industrial maintenance questions in the requested language
    (en, ta, tanglish) for one-click prompts.
    """
    return get_quick_questions(language)


@router.get("/context/{machine_id}", response_model=AssistantSourceData)
def get_machine_assistant_context(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves structured operational context and model attributions for a specific machine.
    """
    context = fetch_machine_context(db, machine_id)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{machine_id}' context could not be loaded."
        )

    return AssistantSourceData(
        machine_id=context.get("machine_id"),
        process=context.get("process"),
        production_line=context.get("production_line"),
        health_status=context.get("health_status"),
        failure_probability=context.get("failure_probability"),
        predicted_rul=context.get("predicted_rul"),
        criticality=context.get("criticality"),
        top_contributing_sensors=context.get("top_factors", [])[:5],
        recommended_action=context.get("recommended_action"),
        priority=context.get("priority"),
        affected_downstream_machines=context.get("affected_downstream_machines", []),
        affected_machine_count=context.get("affected_machine_count", 0),
        technician_available=context.get("technician_available"),
        spare_part_available=context.get("spare_part_available"),
        maintenance_window=context.get("maintenance_window"),
        data_sources=context.get("data_sources", []),
    )
