import logging
from sqlalchemy import create_engine, text
from app.core.config import settings
from app.database.base import Base

logger = logging.getLogger(__name__)

# SQLAlchemy Engine using SQLAlchemy 2.x
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=False
)


def check_db_connection() -> bool:
    """Verifies active connectivity to the PostgreSQL database."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return result.scalar() == 1
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return False
