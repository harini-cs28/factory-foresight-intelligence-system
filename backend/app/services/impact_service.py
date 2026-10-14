from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.config import settings
from app.models.machine import Machine
from app.impact.dependency_graph import get_dependency_graph
from app.impact.cascade_analyzer import run_bfs_cascade_analysis
from app.schemas.impact import (
    OriginMachineInfo,
    AffectedMachineInfo,
    CascadeInfo,
    ProductionImpactInfo,
    ImpactResponse,
)

# Global in-memory cache for factory context data
_FACTORY_CONTEXT_CACHE: Optional[Dict[str, Dict[str, Any]]] = None


def get_factory_context_data(force_reload: bool = False) -> Dict[str, Dict[str, Any]]:
    """
    Loads and caches operational context metadata from factory_context.csv.
    """
    global _FACTORY_CONTEXT_CACHE
    if _FACTORY_CONTEXT_CACHE is not None and not force_reload:
        return _FACTORY_CONTEXT_CACHE

    context_file = Path(settings.FACTORY_CONTEXT_CSV)
    if not context_file.exists():
        return {}

    df = pd.read_csv(context_file)
    context_map = {}
    for _, row in df.iterrows():
        m_id = str(row["machine_id"]).strip()
        context_map[m_id] = {
            "machine_id": m_id,
            "process": str(row.get("process", "Textile Manufacturing")),
            "production_line": str(row.get("production_line", "Line-A")),
            "criticality": str(row.get("criticality", "MEDIUM")),
            "production_priority": str(row.get("production_priority", "MEDIUM")),
            "production_impact": str(row.get("production_impact", "MEDIUM")),
            "technician_available": str(row.get("technician_available", "YES")),
            "spare_part_available": str(row.get("spare_part_available", "YES")),
            "estimated_repair_hours": float(row.get("estimated_repair_hours", 4.0)),
            "estimated_repair_cost_inr": int(row.get("estimated_repair_cost_inr", 0)),
            "estimated_downtime_cost_per_hour_inr": int(row.get("estimated_downtime_cost_per_hour_inr", 50000)),
            "maintenance_window": str(row.get("maintenance_window", "NEXT_SHIFT")),
            "maintenance_type": str(row.get("maintenance_type", "Predictive")),
        }

    _FACTORY_CONTEXT_CACHE = context_map
    return _FACTORY_CONTEXT_CACHE


def calculate_impact_severity(
    origin_criticality: str,
    origin_production_impact: str,
    affected_count: int
) -> str:
    """
    Deterministic rule engine evaluating production impact severity:
    - CRITICAL: Origin is CRITICAL, OR production_impact is VERY_HIGH, OR affects >= 5 downstream machines.
    - HIGH:     Origin is HIGH, OR production_impact is HIGH, OR affects >= 2 downstream machines.
    - MEDIUM:   Origin is MEDIUM, OR affects >= 1 downstream machine.
    - LOW:      Origin is LOW with 0 downstream machines affected.
    """
    crit_upper = origin_criticality.upper()
    impact_upper = origin_production_impact.upper()

    if crit_upper == "CRITICAL" or impact_upper == "VERY_HIGH" or affected_count >= 5:
        return "CRITICAL"
    if crit_upper == "HIGH" or impact_upper == "HIGH" or affected_count >= 2:
        return "HIGH"
    if crit_upper == "MEDIUM" or affected_count >= 1:
        return "MEDIUM"
    return "LOW"


def analyze_machine_cascade_impact(
    machine_id: str,
    db: Optional[Session] = None
) -> ImpactResponse:
    """
    Coordinates dependency graph traversal, machine metadata retrieval,
    and cascading operational downtime cost analysis for a given machine.
    """
    m_id = machine_id.strip()
    factory_context = get_factory_context_data()
    dep_graph = get_dependency_graph()

    # 1. Verify existence of machine in factory context or dependency graph or DB
    origin_ctx = factory_context.get(m_id)
    
    if not origin_ctx:
        # Check DB
        if db:
            stmt = select(Machine).where(Machine.machine_id == m_id)
            db_machine = db.execute(stmt).scalar_one_or_none()
            if db_machine:
                origin_ctx = {
                    "machine_id": db_machine.machine_id,
                    "process": db_machine.process,
                    "production_line": db_machine.production_line,
                    "criticality": db_machine.criticality,
                    "production_priority": "MEDIUM",
                    "production_impact": "MEDIUM",
                    "estimated_repair_hours": 4.0,
                    "estimated_downtime_cost_per_hour_inr": 50000,
                }

    if not origin_ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{m_id}' not found in factory context or database."
        )

    # 2. Run BFS Cascade Analysis
    bfs_result = run_bfs_cascade_analysis(m_id, graph=dep_graph)

    # 3. Enrich affected machines with operational context
    enriched_affected_machines: List[AffectedMachineInfo] = []
    affected_lines_set = {origin_ctx["production_line"]}

    total_repair_hours = origin_ctx["estimated_repair_hours"]
    potential_downtime_cost = (
        origin_ctx["estimated_repair_hours"] * origin_ctx["estimated_downtime_cost_per_hour_inr"]
    )

    for item in bfs_result["affected_machines"]:
        aff_id = item["machine_id"]
        aff_ctx = factory_context.get(aff_id, {})
        
        proc = aff_ctx.get("process", "Textile Process")
        line = item.get("production_line") or aff_ctx.get("production_line", "Line-A")
        crit = aff_ctx.get("criticality", "MEDIUM")
        rep_hours = aff_ctx.get("estimated_repair_hours", 4.0)
        cost_per_hr = aff_ctx.get("estimated_downtime_cost_per_hour_inr", 50000)

        affected_lines_set.add(line)
        total_repair_hours += rep_hours
        potential_downtime_cost += (rep_hours * cost_per_hr)

        enriched_affected_machines.append(
            AffectedMachineInfo(
                machine_id=aff_id,
                process=proc,
                production_line=line,
                cascade_level=item["cascade_level"],
                dependency_level=item["dependency_level"],
                direct_source=item["direct_source"],
                criticality=crit,
                estimated_repair_hours=rep_hours,
                estimated_downtime_cost_per_hour_inr=cost_per_hr
            )
        )

    # 4. Compute Impact Severity
    severity = calculate_impact_severity(
        origin_criticality=origin_ctx["criticality"],
        origin_production_impact=origin_ctx.get("production_impact", "MEDIUM"),
        affected_count=bfs_result["affected_machine_count"]
    )

    # 5. Build structured response
    return ImpactResponse(
        origin_machine=OriginMachineInfo(
            machine_id=origin_ctx["machine_id"],
            process=origin_ctx["process"],
            production_line=origin_ctx["production_line"],
            criticality=origin_ctx["criticality"],
            production_priority=origin_ctx.get("production_priority"),
            production_impact=origin_ctx.get("production_impact")
        ),
        cascade=CascadeInfo(
            affected_machine_count=bfs_result["affected_machine_count"],
            maximum_cascade_level=bfs_result["maximum_cascade_level"],
            affected_machines=enriched_affected_machines
        ),
        production_impact=ProductionImpactInfo(
            affected_production_lines=sorted(list(affected_lines_set)),
            estimated_total_repair_hours=round(total_repair_hours, 1),
            estimated_potential_downtime_cost=round(potential_downtime_cost, 2),
            impact_severity=severity
        )
    )
