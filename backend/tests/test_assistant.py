import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import engine
from app.models import Base

Base.metadata.create_all(bind=engine)
client = TestClient(app)


@pytest.fixture
def auth_header_engineer():
    res = client.post("/api/auth/login", json={"email": "engineer@gmail.com", "password": "12345"})
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_quick_questions_endpoint(auth_header_engineer):
    """Verify GET /api/assistant/quick-questions returns questions for en, ta, tanglish."""
    # 1. English
    res_en = client.get("/api/assistant/quick-questions?language=en", headers=auth_header_engineer)
    assert res_en.status_code == 200
    data_en = res_en.json()
    assert len(data_en) == 8
    assert any("Why is this machine at risk?" in q["question"] for q in data_en)

    # 2. Tamil
    res_ta = client.get("/api/assistant/quick-questions?language=ta", headers=auth_header_engineer)
    assert res_ta.status_code == 200
    data_ta = res_ta.json()
    assert len(data_ta) == 8
    assert any("ஆபத்தில்" in q["question"] for q in data_ta)

    # 3. Tanglish
    res_tg = client.get("/api/assistant/quick-questions?language=tanglish", headers=auth_header_engineer)
    assert res_tg.status_code == 200
    data_tg = res_tg.json()
    assert len(data_tg) == 8
    assert any("risk-la" in q["question"] for q in data_tg)


def test_assistant_chat_unauthorized():
    """Verify that assistant requires JWT authentication."""
    res = client.post(
        "/api/assistant/chat",
        json={"message": "Why is this machine at risk?", "language": "en"}
    )
    assert res.status_code == 401


def test_assistant_chat_risk_explanation_english(auth_header_engineer):
    """Verify English risk query grounding in real FFIS machine data."""
    payload = {
        "message": "Why is this machine at risk?",
        "language": "en",
        "machine_id": "SPIN-01",
    }
    res = client.post("/api/assistant/chat", json=payload, headers=auth_header_engineer)
    assert res.status_code == 200
    data = res.json()

    assert "reply" in data
    assert "SPIN-01" in data["reply"]
    assert "source_data" in data
    source = data["source_data"]
    assert source is not None
    assert source["machine_id"] == "SPIN-01"
    assert "health_status" in source
    assert source["failure_probability"] is not None
    assert source["predicted_rul"] is not None
    assert isinstance(source["top_contributing_sensors"], list)
    assert "SPIN-01" in data["related_machine_ids"]


def test_assistant_chat_tamil_explanation(auth_header_engineer):
    """Verify Tamil query returns authentic Tamil explanation."""
    payload = {
        "message": "இந்த இயந்திரம் ஏன் ஆபத்தில் உள்ளது?",
        "language": "ta",
        "machine_id": "SPIN-01",
    }
    res = client.post("/api/assistant/chat", json=payload, headers=auth_header_engineer)
    assert res.status_code == 200
    data = res.json()

    assert data["language"] == "ta"
    assert "SPIN-01" in data["reply"]
    # Check for Tamil script presence
    assert any("\u0b80" <= char <= "\u0bff" for char in data["reply"])
    assert data["source_data"] is not None


def test_assistant_chat_tanglish_explanation(auth_header_engineer):
    """Verify Tanglish query returns conversational Tamil-English format."""
    payload = {
        "message": "Intha machine-oda Remaining Useful Life (RUL) evalavu?",
        "language": "tanglish",
        "machine_id": "SPIN-01",
    }
    res = client.post("/api/assistant/chat", json=payload, headers=auth_header_engineer)
    assert res.status_code == 200
    data = res.json()

    assert data["language"] == "tanglish"
    assert "SPIN-01" in data["reply"]
    assert "RUL" in data["reply"] or "Remaining" in data["reply"]


def test_assistant_chat_downstream_cascade(auth_header_engineer):
    """Verify cascade question returns affected machines."""
    payload = {
        "message": "Which downstream machines may be affected?",
        "language": "en",
        "machine_id": "SPIN-01",
    }
    res = client.post("/api/assistant/chat", json=payload, headers=auth_header_engineer)
    assert res.status_code == 200
    data = res.json()

    assert "reply" in data
    assert "source_data" in data
    assert "affected_machine_count" in data["source_data"]
    assert len(data["related_machine_ids"]) >= 1


def test_assistant_chat_maintenance_action(auth_header_engineer):
    """Verify maintenance action recommendation explanation."""
    payload = {
        "message": "What maintenance action should I take?",
        "language": "en",
        "machine_id": "SPIN-01",
    }
    res = client.post("/api/assistant/chat", json=payload, headers=auth_header_engineer)
    assert res.status_code == 200
    data = res.json()

    assert "reply" in data
    source = data["source_data"]
    assert source["recommended_action"] is not None
    assert source["priority"] is not None


def test_assistant_context_endpoint(auth_header_engineer):
    """Verify GET /api/assistant/context/{machine_id} returns structured machine telemetry."""
    res = client.get("/api/assistant/context/SPIN-01", headers=auth_header_engineer)
    assert res.status_code == 200
    data = res.json()
    assert data["machine_id"] == "SPIN-01"
    assert data["health_status"] in ["HEALTHY", "AT_RISK", "CRITICAL"]
    assert isinstance(data["data_sources"], list)
    assert len(data["data_sources"]) > 0


def test_assistant_chat_follow_up_questions(auth_header_engineer):
    """Verify follow-up questions 'Why?', 'What should I do next?', 'Which machines will be affected?'."""
    # 1. "Why?"
    res_why = client.post(
        "/api/assistant/chat",
        json={"message": "Why?", "language": "en", "machine_id": "SPIN-01"},
        headers=auth_header_engineer,
    )
    assert res_why.status_code == 200
    assert "Risk" in res_why.json()["reply"] or "SPIN-01" in res_why.json()["reply"]

    # 2. "What should I do next?"
    res_action = client.post(
        "/api/assistant/chat",
        json={"message": "What should I do next?", "language": "en", "machine_id": "SPIN-01"},
        headers=auth_header_engineer,
    )
    assert res_action.status_code == 200
    assert "Recommendation" in res_action.json()["reply"] or "Priority" in res_action.json()["reply"]

    # 3. "Which machines will be affected?"
    res_cascade = client.post(
        "/api/assistant/chat",
        json={"message": "Which machines will be affected?", "language": "en", "machine_id": "SPIN-01"},
        headers=auth_header_engineer,
    )
    assert res_cascade.status_code == 200
    assert "Cascade" in res_cascade.json()["reply"] or "affected" in res_cascade.json()["reply"]

    # 4. "Explain that in Tamil."
    res_ta = client.post(
        "/api/assistant/chat",
        json={"message": "Explain that in Tamil.", "language": "en", "machine_id": "SPIN-01"},
        headers=auth_header_engineer,
    )
    assert res_ta.status_code == 200
    # Tamil characters presence
    assert any("\u0b80" <= c <= "\u0bff" for c in res_ta.json()["reply"])


def test_assistant_chat_missing_machine_fallback(auth_header_engineer):
    """Verify that an invalid or non-existent machine ID returns a clear data-grounded fallback."""
    res = client.post(
        "/api/assistant/chat",
        json={"message": "Why is this machine at risk?", "language": "en", "machine_id": "INVALID-MACHINE-999"},
        headers=auth_header_engineer,
    )
    assert res.status_code == 200
    data = res.json()
    assert "could not locate" in data["reply"].lower() or "not available" in data["reply"].lower()

