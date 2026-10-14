from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse, ProtectedMessageResponse
from app.core.security import create_access_token
from app.services.auth_service import authenticate_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticates a user using email and password.
    Returns JWT access token and sanitized user profile upon successful verification.
    """
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate JWT token
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role, "id": user.id}
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
def get_authenticated_user_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieves profile information for the currently authenticated user.
    Requires Bearer JWT token in Authorization header.
    """
    return UserResponse.model_validate(current_user)


@router.get("/protected", response_model=ProtectedMessageResponse)
def protected_test_route(current_user: User = Depends(get_current_user)):
    """
    Test endpoint verifying valid JWT authentication and role extraction.
    """
    return ProtectedMessageResponse(message="Authenticated access successful")
