from typing import Tuple, List
from app.core.config import settings


def evaluate_operational_risk(
    failure_probability: float,
    predicted_rul: float,
    machine_criticality: str = "MEDIUM",
    impact_severity: str = "LOW"
) -> Tuple[str, List[str]]:
    """
    Evaluates machine operational risk using failure probability, remaining useful life,
    and asset criticality thresholds.
    
    Returns:
        Tuple of (risk_level: str, reasons: List[str])
    """
    reasons: List[str] = []
    risk_level = "HEALTHY"

    # Check failure probability and RUL thresholds
    if failure_probability >= settings.CRITICAL_RISK_THRESHOLD or predicted_rul <= settings.CRITICAL_RUL_THRESHOLD:
        risk_level = "CRITICAL"
        if failure_probability >= settings.CRITICAL_RISK_THRESHOLD:
            reasons.append(
                f"Failure risk ({failure_probability * 100:.1f}%) exceeds the critical threshold ({settings.CRITICAL_RISK_THRESHOLD * 100:.0f}%)."
            )
        if predicted_rul <= settings.CRITICAL_RUL_THRESHOLD:
            reasons.append(
                f"Predicted remaining useful life ({predicted_rul:.1f} cycles) is within the critical failure horizon (<= {settings.CRITICAL_RUL_THRESHOLD} cycles)."
            )
    elif (settings.AT_RISK_RISK_MIN <= failure_probability < settings.CRITICAL_RISK_THRESHOLD) or \
         (settings.CRITICAL_RUL_THRESHOLD < predicted_rul <= settings.AT_RISK_RUL_MAX):
        risk_level = "AT_RISK"
        if settings.AT_RISK_RISK_MIN <= failure_probability < settings.CRITICAL_RISK_THRESHOLD:
            reasons.append(
                f"Elevated failure probability ({failure_probability * 100:.1f}%) detected."
            )
        if settings.CRITICAL_RUL_THRESHOLD < predicted_rul <= settings.AT_RISK_RUL_MAX:
            reasons.append(
                f"Predicted RUL ({predicted_rul:.1f} cycles) is approaching the warning threshold (<= {settings.AT_RISK_RUL_MAX} cycles)."
            )
    else:
        reasons.append(
            f"Nominal telemetry: Low failure risk ({failure_probability * 100:.1f}%) and healthy RUL ({predicted_rul:.1f} cycles)."
        )

    # Note asset criticality context if elevated
    if machine_criticality.upper() in {"HIGH", "CRITICAL"}:
        reasons.append(f"Asset is classified as {machine_criticality.upper()} criticality.")

    return risk_level, reasons
