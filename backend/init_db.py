"""
Database initialization script for FFIS (Factory Foresight Intelligence System).
Loads configuration, registers all models, and creates tables via SQLAlchemy Base.metadata.create_all().
"""
import sys
import logging
from app.core.config import settings
from app.database.connection import engine
from app.database.base import Base
import app.models  # Register all models on Base.metadata

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def init_db():
    logger.info(f"Connecting to database at {settings.DATABASE_URL.split('@')[-1]}...")
    try:
        # Create all tables without dropping anything
        Base.metadata.create_all(bind=engine)
        print("FFIS database tables created successfully.")
        
        # Verify created tables
        tables = list(Base.metadata.tables.keys())
        print(f"Registered tables ({len(tables)}): {', '.join(tables)}")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        return False


if __name__ == "__main__":
    success = init_db()
    sys.exit(0 if success else 1)
