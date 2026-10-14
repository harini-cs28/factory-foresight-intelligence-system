import pytest
from fastapi.testclient import TestClient

import app.models  # register SQLAlchemy models
from app.main import app as fastapi_app

client = TestClient(fastapi_app)


def test_1_admin_login():
    """TEST 1: Admin login with valid credentials."""
    response = client.post("/api/auth/login", json={
        "email": "admin@gmail.com",
        "password": "12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@gmail.com"
    assert data["user"]["role"] == "ADMIN"
    assert "password_hash" not in data["user"]


def test_2_maintenance_engineer_login():
    """TEST 2: Maintenance Engineer login with valid credentials."""
    response = client.post("/api/auth/login", json={
        "email": "engineer@gmail.com",
        "password": "12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "engineer@gmail.com"
    assert data["user"]["role"] == "MAINTENANCE_ENGINEER"


def test_3_production_manager_login():
    """TEST 3: Production Manager login with valid credentials."""
    response = client.post("/api/auth/login", json={
        "email": "production@gmail.com",
        "password": "12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "production@gmail.com"
    assert data["user"]["role"] == "PRODUCTION_MANAGER"


def test_4_plant_manager_login():
    """TEST 4: Plant Manager login with valid credentials."""
    response = client.post("/api/auth/login", json={
        "email": "manager@gmail.com",
        "password": "12345"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "manager@gmail.com"
    assert data["user"]["role"] == "PLANT_MANAGER"


def test_5_wrong_password():
    """TEST 5: Login with wrong password returns 401 Unauthorized."""
    response = client.post("/api/auth/login", json={
        "email": "admin@gmail.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "access_token" not in response.json()


def test_6_unknown_email():
    """TEST 6: Login with non-existent email returns 401 Unauthorized."""
    response = client.post("/api/auth/login", json={
        "email": "unknown@gmail.com",
        "password": "12345"
    })
    assert response.status_code == 401


def test_7_auth_me_with_valid_jwt():
    """TEST 7: GET /api/auth/me with valid Bearer token returns 200 OK and user info."""
    login_res = client.post("/api/auth/login", json={
        "email": "engineer@gmail.com",
        "password": "12345"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == "engineer@gmail.com"
    assert user_data["role"] == "MAINTENANCE_ENGINEER"
    assert user_data["name"] == "Maintenance Engineer"
    assert "password_hash" not in user_data


def test_8_auth_me_without_jwt():
    """TEST 8: GET /api/auth/me without token returns 401 Unauthorized."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_9_protected_endpoint_without_jwt():
    """TEST 9: GET /api/auth/protected without token returns 401 Unauthorized."""
    response = client.get("/api/auth/protected")
    assert response.status_code == 401


def test_10_protected_endpoint_with_valid_jwt():
    """TEST 10: GET /api/auth/protected with valid Bearer token returns 200 OK."""
    login_res = client.post("/api/auth/login", json={
        "email": "admin@gmail.com",
        "password": "12345"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/auth/protected",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Authenticated access successful"
