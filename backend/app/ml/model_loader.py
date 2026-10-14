import json
import logging
from pathlib import Path
from typing import Optional, List, Any
import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from app.core.config import settings

logger = logging.getLogger(__name__)

# Global in-memory cache for ML models
_FAILURE_MODEL: Optional[RandomForestClassifier] = None
_RUL_MODEL: Optional[RandomForestRegressor] = None
_FEATURE_COLUMNS: Optional[List[str]] = None


def load_models(force_reload: bool = False) -> None:
    """
    Loads serialized ML models and feature configuration into memory.
    Cached for fast real-time API inference.
    """
    global _FAILURE_MODEL, _RUL_MODEL, _FEATURE_COLUMNS

    if _FAILURE_MODEL is not None and _RUL_MODEL is not None and not force_reload:
        return

    models_dir = Path(settings.ML_MODELS_DIR)
    failure_path = models_dir / "failure_model.joblib"
    rul_path = models_dir / "rul_model.joblib"
    features_path = models_dir / "feature_columns.json"

    if not failure_path.exists() or not rul_path.exists():
        raise FileNotFoundError(
            f"Trained ML models not found in {models_dir}. Please run train_models.py first."
        )

    logger.info(f"Loading ML models from {models_dir}...")
    _FAILURE_MODEL = joblib.load(failure_path)
    _RUL_MODEL = joblib.load(rul_path)

    if features_path.exists():
        with open(features_path, "r", encoding="utf-8") as f:
            _FEATURE_COLUMNS = json.load(f)
    else:
        from app.ml.preprocessing import FEATURE_COLUMNS
        _FEATURE_COLUMNS = FEATURE_COLUMNS

    logger.info("FFIS ML models successfully loaded into memory.")


def get_failure_model() -> RandomForestClassifier:
    """Returns the loaded Failure Prediction Classifier."""
    if _FAILURE_MODEL is None:
        load_models()
    return _FAILURE_MODEL


def get_rul_model() -> RandomForestRegressor:
    """Returns the loaded RUL Prediction Regressor."""
    if _RUL_MODEL is None:
        load_models()
    return _RUL_MODEL


def get_feature_columns() -> List[str]:
    """Returns the list of required feature column names."""
    if _FEATURE_COLUMNS is None:
        load_models()
    return _FEATURE_COLUMNS
