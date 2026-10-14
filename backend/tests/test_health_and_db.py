import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import check_db_connection

client = TestClient(app)


def test_database_connection():
    """Verify that PostgreSQL connection succeeds."""
    assert check_db_connection() is True, "PostgreSQL database should be connected and accessible."


def test_health_endpoint():
    """Verify GET /api/health returns 200 and expected status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "FFIS Backend"


def test_health_database_endpoint():
    """Verify GET /api/health/database returns 200 and database connected."""
    response = client.get("/api/health/database")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"


def test_root_endpoint():
    """Verify root / returns 200."""
    response = client.get("/")
    assert response.status_code == 200
