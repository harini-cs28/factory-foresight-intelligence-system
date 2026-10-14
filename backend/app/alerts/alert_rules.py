from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)


def evaluate_machine_alert_rules(
    machine_id: str,
    failure_probability: float,
    predicted_rul: float,
    health_status: str,
    criticality: str = "MEDIUM",
    cascade_affected_count: int = 0,
    cascade_max_level: int = 0,
    recommended_urgency: str = "ROUTINE",
    prediction_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Evaluates multi-dimensional deterministic alert rules combining failure risk, RUL,
    criticality, cascade impact, and maintenance urgency.
    """
    candidate_alerts = []

    # 1. Critical Machine Risk Rule (High Criticality Asset At Risk)
    if criticality.upper() == "HIGH" and (failure_probability >= 0.60 or predicted_rul <= 20):
        candidate_alerts.append({
            "machine_id_str": machine_id,
            "prediction_id": prediction_id,
            "alert_type": "CRITICAL_MACHINE_RISK",
            "severity": "CRITICAL",
            "title": f"High Criticality Asset Degradation: {machine_id}",
            "message": (
                f"Machine {machine_id} is marked as HIGH business criticality and exhibits "
                f"elevated failure risk ({failure_probability * 100:.1f}%) with RUL at {predicted_rul:.0f} cycles."
            ),
            "recommended_action": "Prioritize immediate inspection and standby equipment staging.",
        })

    # 2. General Failure Risk Alerts
    if failure_probability >= 0.70:
        candidate_alerts.append({
            "machine_id_str": machine_id,
            "prediction_id": prediction_id,
            "alert_type": "FAILURE_RISK",
            "severity": "CRITICAL",
            "title": f"Critical Failure Probability Threshold: {machine_id}",
            "message": (
                f"Predicted failure probability has reached {failure_probability * 100:.1f}%, "
                f"exceeding critical operating threshold (70%)."
            ),
            "recommended_action": "Initiate emergency maintenance order and prepare replacement assemblies.",
        })
    elif failure_probability >= 0.45:
        candidate_alerts.append({
            "machine_id_str": machine_id,
            "prediction_id": prediction_id,
            "alert_type": "FAILURE_RISK",
            "severity": "HIGH",
            "title": f"Elevated Failure Risk: {machine_id}",
            "message": (
                f"Predicted failure probability is {failure_probability * 100:.1f}%, "
                f"indicating significant operational anomaly."
            ),
            "recommended_action": "Schedule diagnostic lubrication and mechanical alignment check.",
        })
    elif failure_probability >= 0.30:
        candidate_alerts.append({
            "machine_id_str": machine_id,
            "prediction_id": prediction_id,
            "alert_type": "FAILURE_RISK",
            "severity": "MEDIUM",
            "title": f"Moderate Risk Warning: {machine_id}",
            "message": (
                f"Machine telemetry shows early risk signals with failure probability at {failure_probability * 100:.1f}%."
            ),
            "recommended_action": "Increase monitoring frequency and review sensor trend telemetry.",
        })

    # 3. Remaining Useful Life (RUL) Alerts
    if predicted_rul <= 15:
        candidate_alerts.append({
            "machine_id_str": machine_id,
            "prediction_id": prediction_id,
            "alert_type": "LOW_RUL",
            "severity": "CRITICAL",
            "title": f"Critical Low RUL Remaining: {machine_id}",
            "message": (
                f"Estimated remaining useful life has dropped to {predicted_rul:.0f} cycles "
                f"(critical threshold <= 15 cycles)."
            ),
            "recommended_action": "Perform planned component replacement before cycle expiration.",
        })
    elif predicted_rul <= 30:
        candidate_alerts.append({
            "machine_id_str": machine_id,
            "prediction_id": prediction_id,
            "alert_type": "LOW_RUL",
            "severity": "HIGH",
            "title": f"Low RUL Warning: {machine_id}",
            "message": (
                f"Remaining useful life estimated at {predicted_rul:.0f} cycles."
            ),
            "recommended_action": "Verify spare parts inventory availability and reserve technician time.",
        })

    # 4. High Cascade Impact Rule
    if cascade_affected_count >= 2 and (failure_probability >= 0.35 or predicted_rul <= 30):
        candidate_alerts.append({
            "machine_id_str": machine_id,
            "prediction_id": prediction_id,
            "alert_type": "HIGH_CASCADE_IMPACT",
            "severity": "HIGH" if failure_probability < 0.70 else "CRITICAL",
            "title": f"Production Bottleneck Cascade Threat: {machine_id}",
            "message": (
                f"Potential failure of {machine_id} will propagate downstream to block "
                f"{cascade_affected_count} machines across {cascade_max_level} dependency levels."
            ),
            "recommended_action": "Coordinate with production scheduling to adjust buffer inventory.",
        })

    # 5. Maintenance Action Required Rule
    if recommended_urgency in ["IMMEDIATE", "HIGH"]:
        candidate_alerts.append({
            "machine_id_str": machine_id,
            "prediction_id": prediction_id,
            "alert_type": "MAINTENANCE_REQUIRED",
            "severity": "HIGH" if recommended_urgency == "HIGH" else "CRITICAL",
            "title": f"Prescriptive Work Order Urgency: {machine_id}",
            "message": (
                f"Decision support engine flagged urgent maintenance requirement with status '{recommended_urgency}'."
            ),
            "recommended_action": "Dispatch maintenance technician with prescribed tooling.",
        })

    return candidate_alerts
