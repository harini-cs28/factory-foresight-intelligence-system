from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import settings
from app.database.session import get_db
from app.database.connection import engine
from app.models import Base
from app.api.auth import router as auth_router
from app.api.predictions import router as predictions_router
from app.api.impact import router as impact_router
from app.api.maintenance import router as maintenance_router
from app.api.machines import router as machines_router
from app.api.admin import router as admin_router
from app.api.sensors import router as sensors_router
from app.api.explainability import router as explainability_router
from app.api.alerts import router as alerts_router
from app.ml.model_loader import load_models
from app.iot.sensor_simulator import sensor_simulator

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables (including newly added alerts table) are created
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.warning(f"Database schema synchronization warning: {e}")

    # Preload ML models into memory on application startup
    try:
        load_models()
        logger.info("ML models preloaded successfully during startup.")
    except Exception as e:
        logger.warning(f"ML models could not be loaded during startup: {e}")

    # Start background sensor simulation
    try:
        sensor_simulator.start()
        logger.info("IoT sensor simulator started successfully.")
    except Exception as e:
        logger.warning(f"IoT sensor simulator could not be started: {e}")

    yield

    # Shutdown background sensor simulation
    try:
        sensor_simulator.stop()
        logger.info("IoT sensor simulator stopped.")
    except Exception as e:
        logger.warning(f"Error stopping IoT sensor simulator: {e}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Factory Foresight Intelligence System (FFIS) in Textile Manufacturing",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(predictions_router, prefix=settings.API_V1_PREFIX)
app.include_router(impact_router, prefix=settings.API_V1_PREFIX)
app.include_router(maintenance_router, prefix=settings.API_V1_PREFIX)
app.include_router(machines_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(sensors_router, prefix=settings.API_V1_PREFIX)
app.include_router(explainability_router, prefix=settings.API_V1_PREFIX)
app.include_router(alerts_router, prefix=settings.API_V1_PREFIX)


@app.get("/api/health", tags=["Health"])
def health_check():
    """General health check endpoint."""
    return {
        "status": "ok",
        "service": "FFIS Backend"
    }


@app.get("/api/health/database", tags=["Health"])
def database_health_check(db: Session = Depends(get_db)):
    """Database connectivity health check using SQLAlchemy session executing SELECT 1."""
    try:
        result = db.execute(text("SELECT 1")).scalar()
        if result == 1:
            return {
                "status": "ok",
                "database": "connected"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database query returned unexpected result"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection error: {str(e)}"
        )


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Factory Foresight Intelligence System (FFIS) API",
        "documentation": "/docs"
    }
