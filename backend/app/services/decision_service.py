from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.machine import Machine
from app.models.prediction import Prediction
from app.models.maintenance import MaintenanceRecommendation
from app.services.prediction_service import ensure_machine_exists
from app.services.impact_service import get_factory_context_data, analyze_machine_cascade_impact
from app.decision_engine.risk_engine import evaluate_operational_risk
from app.decision_engine.priority_engine import determine_maintenance_priority
from app.decision_engine.recommendation_engine import generate_prescriptive_recommendation
from app.schemas.maintenance import (
    DecisionFactors,
    RecommendationResponse,
    RecommendationHistoryItem,
)


def generate_maintenance_recommendation(
    machine_id_str: str,
    db: Session
) -> RecommendationResponse:
    """
    Coordinates machine ML telemetry, cascade impact, and operational context to
    synthesize an explainable prescriptive maintenance recommendation and persist it to PostgreSQL.
    """
    m_id = machine_id_str.strip()

    # 1. Ensure machine exists in database
    machine = ensure_machine_exists(db, m_id)

    # 2. Retrieve latest prediction for this machine
    stmt = (
        select(Prediction)
        .where(Prediction.machine_id == machine.id)
        .order_by(Prediction.created_at.desc())
    )
    latest_prediction = db.execute(stmt).scalars().first()

    if not latest_prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No prediction record found for machine '{m_id}'. Please run a telemetry prediction first via POST /api/predictions/predict."
        )

    # 3. Retrieve cascade impact analysis
    impact_data = analyze_machine_cascade_impact(m_id, db=db)
    affected_count = impact_data.cascade.affected_machine_count
    impact_severity = impact_data.production_impact.impact_severity

    # 4. Retrieve factory operational context
    factory_context = get_factory_context_data().get(m_id, {})
    crit = machine.criticality or factory_context.get("criticality", "MEDIUM")
    prod_prio = factory_context.get("production_priority", "MEDIUM")
    prod_impact = factory_context.get("production_impact", "MEDIUM")
    tech_avail = factory_context.get("technician_available", "YES")
    spare_avail = factory_context.get("spare_part_available", "YES")
    maint_window = factory_context.get("maintenance_window", "NEXT_SHIFT")
    rep_hours = float(factory_context.get("estimated_repair_hours", 4.0))

    # 5. Run Decision Engine Layers
    # Layer A: Operational Risk Engine
    risk_level, risk_reasons = evaluate_operational_risk(
        failure_probability=latest_prediction.failure_probability,
        predicted_rul=latest_prediction.predicted_rul,
        machine_criticality=crit,
        impact_severity=impact_severity
    )

    # Layer B: Priority Engine
    priority, priority_reasons = determine_maintenance_priority(
        health_status=latest_prediction.health_status,
        failure_probability=latest_prediction.failure_probability,
        predicted_rul=latest_prediction.predicted_rul,
        machine_criticality=crit,
        production_priority=prod_prio,
        production_impact=prod_impact,
        impact_severity=impact_severity,
        affected_machine_count=affected_count
    )

    # Layer C: Prescriptive Recommendation Engine
    rec_data = generate_prescriptive_recommendation(
        priority=priority,
        health_status=latest_prediction.health_status,
        failure_probability=latest_prediction.failure_probability,
        predicted_rul=latest_prediction.predicted_rul,
        technician_available=tech_avail,
        spare_part_available=spare_avail,
        maintenance_window=maint_window,
        estimated_repair_hours=rep_hours,
        affected_machine_count=affected_count
    )

    # 6. Persist Recommendation to PostgreSQL
    recommendation_record = MaintenanceRecommendation(
        machine_id=machine.id,
        prediction_id=latest_prediction.id,
        priority=rec_data["priority"],
        recommended_action=rec_data["recommended_action"],
        reason=rec_data["reason"],
        recommended_window=rec_data["recommended_window"],
        estimated_repair_hours=rec_data["estimated_repair_hours"]
    )
    db.add(recommendation_record)
    db.commit()
    db.refresh(recommendation_record)

    # 7. Structure explainable decision factors
    decision_factors = DecisionFactors(
        failure_probability=latest_prediction.failure_probability,
        predicted_rul=latest_prediction.predicted_rul,
        health_status=latest_prediction.health_status,
        machine_criticality=crit,
        production_priority=prod_prio,
        production_impact=prod_impact,
        impact_severity=impact_severity,
        affected_machine_count=affected_count,
        technician_available=str(tech_avail).upper() in {"YES", "TRUE", "1"},
        spare_part_available=str(spare_avail).upper() in {"YES", "TRUE", "1"},
        maintenance_window=maint_window
    )

    return RecommendationResponse(
        id=recommendation_record.id,
        machine_id=m_id,
        prediction_id=latest_prediction.id,
        priority=recommendation_record.priority,
        recommended_action=recommendation_record.recommended_action,
        reason=recommendation_record.reason,
        recommended_window=recommendation_record.recommended_window,
        estimated_repair_hours=recommendation_record.estimated_repair_hours,
        decision_factors=decision_factors,
        created_at=recommendation_record.created_at
    )


def get_machine_recommendation_history(
    machine_id_str: str,
    db: Session
) -> List[RecommendationHistoryItem]:
    """
    Retrieves historical maintenance recommendation records for a machine,
    ordered chronologically from newest to oldest.
    """
    m_id = machine_id_str.strip()
    stmt_m = select(Machine).where(Machine.machine_id == m_id)
    machine = db.execute(stmt_m).scalar_one_or_none()

    if not machine:
        return []

    stmt_rec = (
        select(MaintenanceRecommendation)
        .where(MaintenanceRecommendation.machine_id == machine.id)
        .order_by(MaintenanceRecommendation.created_at.desc())
    )
    records = db.execute(stmt_rec).scalars().all()

    return [
        RecommendationHistoryItem(
            id=rec.id,
            machine_id=m_id,
            prediction_id=rec.prediction_id,
            priority=rec.priority,
            recommended_action=rec.recommended_action,
            reason=rec.reason or "No reason specified.",
            recommended_window=rec.recommended_window or "Standard window",
            estimated_repair_hours=rec.estimated_repair_hours or 0.0,
            created_at=rec.created_at
        )
        for rec in records
    ]
