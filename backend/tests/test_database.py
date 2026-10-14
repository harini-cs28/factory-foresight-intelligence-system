import pytest
from sqlalchemy import text, inspect
from fastapi.testclient import TestClient

import app.models  # register all SQLAlchemy models
from app.main import app as fastapi_app
from app.database.connection import engine, check_db_connection
from app.database.session import SessionLocal
from app.database.base import Base

client = TestClient(fastapi_app)


def test_database_connection():
    """1. Test that the database connection works."""
    assert check_db_connection() is True, "Database connection check should return True."


def test_database_session_creation():
    """2. Test that a database session can be created and closed properly."""
    db = SessionLocal()
    try:
        assert db is not None, "Database session instance should not be None."
        result = db.execute(text("SELECT 1")).scalar()
        assert result == 1, "SELECT 1 via Session should return 1."
    finally:
        db.close()


def test_sqlalchemy_metadata_loads():
    """3. Test that SQLAlchemy Base metadata loads all declared tables."""
    expected_tables = {
        "users",
        "machines",
        "production_lines",
        "machine_dependencies",
        "predictions",
        "maintenance_records",
        "maintenance_recommendations"
    }
    registered_tables = set(Base.metadata.tables.keys())
    for table in expected_tables:
        assert table in registered_tables, f"Table '{table}' must be registered in Base.metadata."


def test_select_1_query():
    """4. Test raw execution of SELECT 1 on the SQLAlchemy engine."""
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar()
        assert result == 1, "Direct engine execution of SELECT 1 should return 1."


def test_required_tables_exist_in_database():
    """5. Test that all required tables physically exist in the PostgreSQL database."""
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    expected_tables = {
        "users",
        "machines",
        "production_lines",
        "machine_dependencies",
        "predictions",
        "maintenance_records",
        "maintenance_recommendations"
    }
    for table in expected_tables:
        assert table in existing_tables, f"Table '{table}' must physically exist in the PostgreSQL database."


def test_api_health_endpoint():
    """Test GET /api/health endpoint response structure."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "FFIS Backend"


def test_api_health_database_endpoint():
    """Test GET /api/health/database endpoint response structure and DB connectivity."""
    response = client.get("/api/health/database")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
