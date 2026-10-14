from typing import Tuple, List


def determine_maintenance_priority(
    health_status: str,
    failure_probability: float,
    predicted_rul: float,
    machine_criticality: str = "MEDIUM",
    production_priority: str = "MEDIUM",
    production_impact: str = "MEDIUM",
    impact_severity: str = "LOW",
    affected_machine_count: int = 0
) -> Tuple[str, List[str]]:
    """
    Deterministic rule-based priority engine evaluating asset urgency:
    
    CRITICAL Priority:
      - Health is CRITICAL AND (Asset Criticality is CRITICAL/HIGH OR Impact Severity is CRITICAL/HIGH OR Affected Count >= 3 OR Production Priority is CRITICAL).
      
    HIGH Priority:
      - Health is CRITICAL (with isolated impact).
      - OR Health is AT_RISK with significant cascade/criticality impact (Affected Count >= 1 OR Criticality is HIGH/CRITICAL OR Impact Severity is HIGH/CRITICAL).
      
    MEDIUM Priority:
      - Health is AT_RISK with limited downstream disruption.
      - OR Health is HEALTHY but asset has critical priority and significant downstream exposure.
      
    LOW Priority:
      - Health is HEALTHY and nominal operation is observed.
    """
    reasons: List[str] = []
    h_upper = health_status.upper()
    crit_upper = machine_criticality.upper()
    prod_prio_upper = production_priority.upper()
    impact_sev_upper = impact_severity.upper()

    is_critical_impact = (
        crit_upper in {"CRITICAL", "HIGH"} or
        impact_sev_upper in {"CRITICAL", "HIGH"} or
        prod_prio_upper == "CRITICAL" or
        affected_machine_count >= 3
    )

    is_moderate_impact = (
        affected_machine_count >= 1 or
        crit_upper in {"HIGH", "CRITICAL"} or
        impact_sev_upper in {"HIGH", "CRITICAL"}
    )

    if h_upper == "CRITICAL" and is_critical_impact:
        priority = "CRITICAL"
        reasons.append(
            f"CRITICAL priority: Machine exhibits critical failure risk ({failure_probability * 100:.1f}%, RUL {predicted_rul:.1f} cycles) combined with high line exposure ({affected_machine_count} downstream machines affected)."
        )
    elif h_upper == "CRITICAL":
        priority = "HIGH"
        reasons.append(
            f"HIGH priority: Machine is in critical condition ({failure_probability * 100:.1f}% risk, RUL {predicted_rul:.1f} cycles), though direct cascade impact is localized."
        )
    elif h_upper == "AT_RISK" and is_moderate_impact:
        priority = "HIGH"
        reasons.append(
            f"HIGH priority: Machine is AT_RISK with elevated failure probability and significant downstream production exposure ({affected_machine_count} dependent machines)."
        )
    elif h_upper == "AT_RISK":
        priority = "MEDIUM"
        reasons.append(
            f"MEDIUM priority: Machine is AT_RISK ({predicted_rul:.1f} cycles RUL), but downstream disruption is isolated."
        )
    elif h_upper == "HEALTHY" and crit_upper == "CRITICAL" and affected_machine_count >= 5:
        priority = "MEDIUM"
        reasons.append(
            f"MEDIUM priority: Machine is healthy, but extreme downstream exposure ({affected_machine_count} assets) warrants proactive monitoring."
        )
    else:
        priority = "LOW"
        reasons.append(
            "LOW priority: Machine operates within nominal health tolerances with healthy RUL and no immediate risk."
        )

    return priority, reasons
