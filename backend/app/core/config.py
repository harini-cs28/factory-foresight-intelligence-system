from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

# Base paths
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    # App Information
    PROJECT_NAME: str = "Factory Foresight Intelligence System (FFIS) Backend"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:root@localhost:5432/ffis_db"

    # Security & JWT
    JWT_SECRET_KEY: str = "change-this-later"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ADDITIONAL_ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://127.0.0.1:5173"

    @property
    def cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_URL.strip()]
        for origin in self.ADDITIONAL_ALLOWED_ORIGINS.split(","):
            cleaned = origin.strip()
            if cleaned and cleaned not in origins:
                origins.append(cleaned)
        return origins

    # Health & Risk Assessment Thresholds
    CRITICAL_RISK_THRESHOLD: float = 0.70       # Risk >= 70%
    CRITICAL_RUL_THRESHOLD: int = 15            # RUL <= 15 cycles
    AT_RISK_RISK_MIN: float = 0.30              # 30% <= Risk < 70%
    AT_RISK_RUL_MAX: int = 35                   # 15 < RUL <= 35 cycles
    HEALTHY_RISK_MAX: float = 0.30              # Risk < 30%
    HEALTHY_RUL_MIN: int = 35                   # RUL > 35 cycles

    # Dataset & ML artifact paths
    DATA_DIR: Path = BACKEND_DIR / "data"
    SENSOR_DATA_CSV: Path = BACKEND_DIR / "data" / "textile_machine_sensor_data.csv"
    DEPENDENCIES_CSV: Path = BACKEND_DIR / "data" / "machine_dependencies.csv"
    FACTORY_CONTEXT_CSV: Path = BACKEND_DIR / "data" / "factory_context.csv"
    ML_MODELS_DIR: Path = BACKEND_DIR / "ml_models"

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH) if ENV_FILE_PATH.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
