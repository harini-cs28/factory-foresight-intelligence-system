from typing import Dict, Any


def generate_prescriptive_recommendation(
    priority: str,
    health_status: str,
    failure_probability: float,
    predicted_rul: float,
    technician_available: Any = "YES",
    spare_part_available: Any = "YES",
    maintenance_window: str = "AVAILABLE",
    estimated_repair_hours: float = 4.0,
    affected_machine_count: int = 0
) -> Dict[str, Any]:
    """
    Generates actionable, explainable maintenance recommendations considering
    operational constraints (technician, spare parts, and shift maintenance windows).
    """
    # Normalize booleans/strings
    tech_ok = str(technician_available).strip().upper() in {"YES", "TRUE", "1"}
    spare_ok = str(spare_part_available).strip().upper() in {"YES", "TRUE", "1"}
    window_str = str(maintenance_window).strip().upper()

    prio_upper = priority.upper()
    health_upper = health_status.upper()

    if prio_upper == "CRITICAL":
        if not tech_ok and not spare_ok:
            action = "SCHEDULE_URGENT_MAINTENANCE"
            reason = (
                f"Critical failure risk ({failure_probability * 100:.1f}%) and low predicted RUL ({predicted_rul:.1f} cycles) detected with {affected_machine_count} downstream dependencies. "
                "Urgent maintenance is required; however, both technician and spare parts are currently unavailable. Immediate component procurement and technician dispatch must be expedited."
            )
            rec_window = "Emergency expedited window"
        elif not tech_ok:
            action = "SCHEDULE_URGENT_MAINTENANCE"
            reason = (
                f"Machine is at critical risk ({failure_probability * 100:.1f}%, RUL {predicted_rul:.1f} cycles), but technician availability is currently limited. "
                "Dispatch qualified maintenance personnel immediately upon shift availability."
            )
            rec_window = "Next shift emergency window" if window_str == "NEXT_SHIFT" else "Immediate personnel dispatch"
        elif not spare_ok:
            action = "SCHEDULE_URGENT_MAINTENANCE"
            reason = (
                f"Machine exhibits critical failure probability ({failure_probability * 100:.1f}%), but required spare parts are currently unavailable in inventory. "
                "Initiate urgent component requisition while preparing maintenance staging."
            )
            rec_window = "Expedited procurement window"
        else:
            action = "IMMEDIATE_INSPECTION"
            reason = (
                f"Critical failure risk ({failure_probability * 100:.1f}%) and imminent RUL depletion ({predicted_rul:.1f} cycles) with {affected_machine_count} downstream machines affected. "
                "Technician and spare parts are available on standby for immediate physical inspection and service."
            )
            rec_window = "Immediate current window"

    elif prio_upper == "HIGH":
        if health_upper == "CRITICAL":
            action = "SCHEDULE_URGENT_MAINTENANCE"
            reason = (
                f"Critical health state detected (RUL {predicted_rul:.1f} cycles). Schedule urgent maintenance within current or next operating cycle."
            )
            rec_window = "Next available maintenance window"
        else:
            action = "SCHEDULE_PREVENTIVE_MAINTENANCE"
            constraint_note = ""
            if not spare_ok:
                constraint_note = " Order replacement spare parts ahead of the service window."
            elif not tech_ok:
                constraint_note = " Confirm technician roster prior to service execution."
            reason = (
                f"Machine is AT_RISK with elevated failure probability ({failure_probability * 100:.1f}%) and {affected_machine_count} dependent assets.{constraint_note} "
                "Execute preventive maintenance before degradation reaches critical threshold."
            )
            rec_window = "Next shift window" if window_str in {"NEXT_SHIFT", "PLANNED"} else "Upcoming scheduled window"

    elif prio_upper == "MEDIUM":
        action = "SCHEDULE_PREVENTIVE_MAINTENANCE"
        reason = (
            f"Machine is in AT_RISK condition (predicted RUL: {predicted_rul:.1f} cycles), with localized production impact. "
            "Plan routine preventive maintenance during the regular scheduled downtime window."
        )
        rec_window = "Planned maintenance window" if window_str == "PLANNED" else "Next scheduled shift"

    else:  # LOW Priority
        action = "MONITOR_MACHINE"
        reason = (
            f"Machine operates within nominal baseline tolerances (failure probability: {failure_probability * 100:.1f}%, RUL: {predicted_rul:.1f} cycles). "
            "No immediate intervention required; continue real-time telemetry monitoring."
        )
        rec_window = "Routine scheduled inspection"

    return {
        "priority": prio_upper,
        "recommended_action": action,
        "reason": reason,
        "recommended_window": rec_window,
        "estimated_repair_hours": float(estimated_repair_hours)
    }
