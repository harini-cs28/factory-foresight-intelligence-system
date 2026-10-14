from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import shap
import logging

from app.ml.model_loader import get_failure_model
from app.ml.preprocessing import validate_and_format_features, FEATURE_COLUMNS

logger = logging.getLogger(__name__)

FEATURE_METADATA = {
    "temperature_c": {"label": "Operating Temperature", "unit": "°C", "nominal": "45 - 75 °C"},
    "vibration_mm_s": {"label": "Vibration Velocity", "unit": "mm/s", "nominal": "1.0 - 4.0 mm/s"},
    "motor_current_a": {"label": "Motor Current", "unit": "A", "nominal": "8.0 - 15.0 A"},
    "rpm": {"label": "Rotational Speed", "unit": "RPM", "nominal": "1200 - 1600 RPM"},
    "pressure_bar": {"label": "Operating Pressure", "unit": "bar", "nominal": "2.5 - 4.5 bar"},
    "load_percentage": {"label": "Mechanical Load", "unit": "%", "nominal": "40 - 80 %"},
    "operating_hours": {"label": "Operating Hours", "unit": "hrs", "nominal": "Cumulative"},
    "maintenance_count": {"label": "Past Maintenance", "unit": "events", "nominal": "Interventions"},
}

_explainer_instance: Optional[shap.TreeExplainer] = None


def get_tree_explainer() -> shap.TreeExplainer:
    """Returns or creates the cached SHAP TreeExplainer for the failure prediction model."""
    global _explainer_instance
    if _explainer_instance is None:
        model = get_failure_model()
        _explainer_instance = shap.TreeExplainer(model)
        logger.info("SHAP TreeExplainer initialized for failure classifier.")
    return _explainer_instance


def generate_explanation_summary(top_increasing: List[Dict[str, Any]], failure_prob: float) -> str:
    """
    Generates a natural, industrial domain-accurate explanation summary
    describing the primary model-derived risk contributors without claiming causality.
    """
    if failure_prob < 0.30 and not top_increasing:
        return (
            "Observed sensor telemetry parameters remain within nominal baseline operating limits, "
            "contributing to low overall predicted failure risk."
        )

    if not top_increasing:
        return (
            "Sensor parameters reflect balanced baseline operational behavior across monitored channels."
        )

    # Take top 2-3 risk increasing features
    factors_text = []
    for f in top_increasing[:3]:
        lbl = f["label"].lower()
        val = f["value"]
        unit = f["unit"]
        factors_text.append(f"{lbl} ({val} {unit})")

    if len(factors_text) == 1:
        joined = factors_text[0]
    elif len(factors_text) == 2:
        joined = f"{factors_text[0]} and {factors_text[1]}"
    else:
        joined = f"{factors_text[0]}, {factors_text[1]}, and {factors_text[2]}"

    if failure_prob >= 0.70:
        return (
            f"Elevated {joined} are the strongest model-derived contributors to the critical failure risk assessment."
        )
    elif failure_prob >= 0.30:
        return (
            f"Increased {joined} are the principal factors contributing to the elevated failure risk trajectory."
        )
    else:
        return (
            f"Mildly elevated {joined} were identified by SHAP attribution, but overall failure probability remains low."
        )


def compute_shap_explanation(
    features: Dict[str, Any],
    machine_id: str = "UNKNOWN",
    failure_probability: Optional[float] = None
) -> Dict[str, Any]:
    """
    Calculates SHAP feature attributions for the failure classifier.
    Returns structured model-derived risk factors, contribution directions, and explanation summaries.
    """
    X = validate_and_format_features(features)
    explainer = get_tree_explainer()

    # Calculate SHAP values
    shap_output = explainer(X)

    # For binary RandomForestClassifier, shap_output has shape (1, num_features, 2) or (1, num_features)
    # We extract the SHAP values corresponding to the positive failure class (index 1)
    if len(shap_output.values.shape) == 3:
        raw_shap_values = shap_output.values[0, :, 1]
        base_value = float(explainer.expected_value[1]) if isinstance(explainer.expected_value, (list, np.ndarray)) else float(explainer.expected_value)
    else:
        raw_shap_values = shap_output.values[0]
        base_value = float(explainer.expected_value)

    # Compute failure probability if not provided
    if failure_probability is None:
        model = get_failure_model()
        failure_probability = float(model.predict_proba(X)[0][1])

    all_factors = []
    for col_idx, col_name in enumerate(FEATURE_COLUMNS):
        shap_val = float(raw_shap_values[col_idx])
        feature_val = float(X.iloc[0][col_name])
        meta = FEATURE_METADATA.get(col_name, {"label": col_name, "unit": "", "nominal": ""})

        impact = "INCREASES_RISK" if shap_val > 0.0001 else ("DECREASES_RISK" if shap_val < -0.0001 else "NEUTRAL")

        all_factors.append({
            "feature": col_name,
            "label": meta["label"],
            "unit": meta["unit"],
            "nominal_range": meta["nominal"],
            "value": round(feature_val, 2),
            "shap_value": round(shap_val, 4),
            "impact": impact,
            "contribution_score": round(abs(shap_val), 4),
        })

    # Sort all factors by absolute SHAP contribution descending
    all_factors.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

    # Separate factors that increase risk vs decrease risk
    increasing_factors = [f for f in all_factors if f["impact"] == "INCREASES_RISK"]
    decreasing_factors = [f for f in all_factors if f["impact"] == "DECREASES_RISK"]

    # Top contributing factors (top 4 by absolute attribution)
    top_factors = all_factors[:4]

    # Generate professional decision-support explanation summary
    summary = generate_explanation_summary(increasing_factors, failure_probability)

    return {
        "machine_id": machine_id,
        "failure_probability": round(failure_probability, 4),
        "base_value": round(base_value, 4),
        "explanation_summary": summary,
        "method": "SHAP (TreeExplainer)",
        "top_factors": top_factors,
        "increasing_factors": increasing_factors,
        "decreasing_factors": decreasing_factors,
        "all_factors": all_factors,
    }
