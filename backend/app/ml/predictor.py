from typing import Dict, Any, Tuple
import pandas as pd
from app.core.config import settings
from app.ml.model_loader import get_failure_model, get_rul_model
from app.ml.preprocessing import validate_and_format_features


def determine_health_status(failure_prob: float, predicted_rul: float) -> str:
    """
    Evaluates machine health status using project risk and RUL thresholds:
    - CRITICAL: Risk >= 70% OR RUL <= 15 cycles
    - AT_RISK:  30% <= Risk < 70% OR 15 < RUL <= 35 cycles
    - HEALTHY:  Risk < 30% AND RUL > 35 cycles
    The most severe condition determines the final status.
    """
    # Check Critical condition
    if failure_prob >= settings.CRITICAL_RISK_THRESHOLD or predicted_rul <= settings.CRITICAL_RUL_THRESHOLD:
        return "CRITICAL"

    # Check At Risk condition
    if (settings.AT_RISK_RISK_MIN <= failure_prob < settings.CRITICAL_RISK_THRESHOLD) or \
       (settings.CRITICAL_RUL_THRESHOLD < predicted_rul <= settings.AT_RISK_RUL_MAX):
        return "AT_RISK"

    # Healthy condition
    if failure_prob < settings.HEALTHY_RISK_MAX and predicted_rul > settings.HEALTHY_RUL_MIN:
        return "HEALTHY"

    # Default fallback to most conservative/severe
    return "AT_RISK"


def predict_failure(features: Dict[str, Any]) -> Tuple[float, bool]:
    """
    Runs failure prediction on input sensor features.
    Returns (failure_probability, failure_prediction).
    """
    X = validate_and_format_features(features)
    clf = get_failure_model()
    prob = float(clf.predict_proba(X)[0][1])
    is_failing = bool(prob >= 0.5)
    return round(prob, 4), is_failing


def predict_rul(features: Dict[str, Any]) -> float:
    """
    Runs RUL estimation on input sensor features.
    Returns predicted remaining useful life in cycles.
    """
    X = validate_and_format_features(features)
    reg = get_rul_model()
    raw_rul = float(reg.predict(X)[0])
    return max(0.0, round(raw_rul, 1))


def predict_machine_health(features: Dict[str, Any], machine_id: str = "UNKNOWN") -> Dict[str, Any]:
    """
    Complete inference pipeline generating failure probability, RUL estimation,
    and determined health status.
    """
    failure_prob, failure_pred = predict_failure(features)
    predicted_rul = predict_rul(features)
    health_status = determine_health_status(failure_prob, predicted_rul)

    return {
        "machine_id": machine_id,
        "failure_probability": failure_prob,
        "failure_prediction": failure_pred,
        "predicted_rul": predicted_rul,
        "health_status": health_status,
        "model_version": "v1.0"
    }
