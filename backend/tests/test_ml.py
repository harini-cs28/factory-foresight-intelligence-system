from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

import app.models  # Register all SQLAlchemy models
from app.main import app as fastapi_app
from app.core.config import settings
from app.ml.preprocessing import (
    load_and_validate_dataset,
    prepare_training_data,
    FEATURE_COLUMNS,
    TARGET_FAILURE,
    TARGET_RUL,
)
from app.ml.train_failure_model import train_failure_classifier
from app.ml.train_rul_model import train_rul_regressor
from app.ml.model_loader import get_failure_model, get_rul_model
from app.ml.predictor import predict_machine_health, determine_health_status
from app.database.session import SessionLocal
from app.models.prediction import Prediction
from app.models.machine import Machine

client = TestClient(fastapi_app)

SAMPLE_TELEMETRY = {
    "machine_id": "SPIN-01",
    "temperature_c": 85.2,
    "vibration_mm_s": 6.4,
    "motor_current_a": 18.2,
    "rpm": 1450.0,
    "pressure_bar": 4.2,
    "load_percentage": 87.5,
    "operating_hours": 8200,
    "maintenance_count": 5
}


def test_1_dataset_loads_successfully():
    """1. Test that the textile machine sensor dataset loads successfully."""
    df = load_and_validate_dataset()
    assert df is not None
    assert len(df) == 3120, "Dataset should contain exactly 3,120 rows."


def test_2_required_columns_exist():
    """2. Test that all required feature columns and target variables exist."""
    df = load_and_validate_dataset()
    for col in FEATURE_COLUMNS:
        assert col in df.columns, f"Feature column {col} missing in dataset."
    assert TARGET_FAILURE in df.columns, "Target failure_within_20_cycles missing."
    assert TARGET_RUL in df.columns, "Target rul_cycles missing."


def test_3_preprocessing_splits_data_correctly():
    """3. Test that train/test split functions without target leakage."""
    df = load_and_validate_dataset()
    X_train, X_test, y_f_train, y_f_test, y_r_train, y_r_test = prepare_training_data(df, test_size=0.2)
    assert len(X_train) == 2496
    assert len(X_test) == 624
    assert list(X_train.columns) == FEATURE_COLUMNS
    assert TARGET_FAILURE not in X_train.columns
    assert TARGET_RUL not in X_train.columns


def test_4_failure_model_training():
    """4. Test that the failure model trains and returns valid metrics."""
    df = load_and_validate_dataset()
    X_train, X_test, y_f_train, y_f_test, _, _ = prepare_training_data(df, test_size=0.2)
    model, metrics = train_failure_classifier(X_train, X_test, y_f_train, y_f_test, n_estimators=50)
    assert model is not None
    assert metrics["accuracy"] > 0.85
    assert metrics["roc_auc"] > 0.90


def test_5_rul_model_training():
    """5. Test that the RUL regression model trains and returns valid metrics."""
    df = load_and_validate_dataset()
    X_train, X_test, _, _, y_r_train, y_r_test = prepare_training_data(df, test_size=0.2)
    model, metrics = train_rul_regressor(X_train, X_test, y_r_train, y_r_test, n_estimators=50)
    assert model is not None
    assert metrics["r2_score"] > 0.80
    assert metrics["mae"] < 20.0


def test_6_model_artifacts_exist_on_disk():
    """6. Test that trained model artifacts exist on disk."""
    models_dir = Path(settings.ML_MODELS_DIR)
    assert (models_dir / "failure_model.joblib").exists(), "failure_model.joblib must exist."
    assert (models_dir / "rul_model.joblib").exists(), "rul_model.joblib must exist."
    assert (models_dir / "feature_columns.json").exists(), "feature_columns.json must exist."


def test_7_8_9_predictor_pipeline_and_health_rules():
    """7, 8, 9. Test failure probability in [0, 1], numeric RUL, and valid health status."""
    features = {
        "temperature_c": 55.0,
        "vibration_mm_s": 2.1,
        "motor_current_a": 11.0,
        "rpm": 1450.0,
        "pressure_bar": 2.5,
        "load_percentage": 50.0,
        "operating_hours": 4000,
        "maintenance_count": 2
    }
    result = predict_machine_health(features, machine_id="SPIN-01")
    
    # 7. Probability between 0 and 1
    assert 0.0 <= result["failure_probability"] <= 1.0
    
    # 8. RUL numeric
    assert isinstance(result["predicted_rul"], (int, float))
    assert result["predicted_rul"] >= 0.0

    # 9. Health status valid
    assert result["health_status"] in {"HEALTHY", "AT_RISK", "CRITICAL"}

    # Test threshold rule logic
    assert determine_health_status(0.85, 50.0) == "CRITICAL"  # High risk
    assert determine_health_status(0.10, 10.0) == "CRITICAL"  # Low RUL
    assert determine_health_status(0.45, 50.0) == "AT_RISK"   # Moderate risk
    assert determine_health_status(0.10, 25.0) == "AT_RISK"   # Moderate RUL
    assert determine_health_status(0.10, 50.0) == "HEALTHY"   # Low risk & high RUL


def test_10_prediction_endpoint_requires_auth():
    """10. Test that POST /api/predictions/predict requires valid Bearer authentication."""
    response = client.post("/api/predictions/predict", json=SAMPLE_TELEMETRY)
    assert response.status_code == 401


def test_11_12_authenticated_prediction_and_db_persistence():
    """11, 12. Test authenticated prediction request and verify PostgreSQL storage."""
    # Authenticate as Maintenance Engineer
    login_res = client.post("/api/auth/login", json={
        "email": "engineer@gmail.com",
        "password": "12345"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # 11. Call Prediction API
    response = client.post(
        "/api/predictions/predict",
        json=SAMPLE_TELEMETRY,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["machine_id"] == "SPIN-01"
    assert "failure_probability" in data
    assert 0.0 <= data["failure_probability"] <= 1.0
    assert "predicted_rul" in data
    assert data["health_status"] in {"HEALTHY", "AT_RISK", "CRITICAL"}
    assert data["model_version"] == "v1.0"
    assert "id" in data
    prediction_id = data["id"]

    # 12. Verify stored record in PostgreSQL
    db = SessionLocal()
    try:
        stmt = select(Prediction).where(Prediction.id == prediction_id)
        saved = db.execute(stmt).scalar_one_or_none()
        assert saved is not None, "Prediction must be found in PostgreSQL database."
        assert saved.health_status == data["health_status"]
        assert abs(saved.failure_probability - data["failure_probability"]) < 1e-4
    finally:
        db.close()
