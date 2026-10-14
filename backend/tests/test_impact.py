import pytest
from pathlib import Path
import pandas as pd
from fastapi.testclient import TestClient

import app.models  # Register models
from app.main import app as fastapi_app
from app.core.config import settings
from app.impact.dependency_graph import DependencyGraph, get_dependency_graph
from app.impact.cascade_analyzer import run_bfs_cascade_analysis
from app.services.impact_service import get_factory_context_data, analyze_machine_cascade_impact

client = TestClient(fastapi_app)


def test_1_dependency_dataset_loads_successfully():
    """TEST 1: Verify dependency CSV exists, loads, and contains expected columns."""
    assert Path(settings.DEPENDENCIES_CSV).exists()
    df = pd.read_csv(settings.DEPENDENCIES_CSV)
    assert len(df) == 13
    assert list(df.columns) == ["source_machine", "target_machine", "dependency_level", "production_line"]


def test_2_dependency_graph_constructed_correctly():
    """TEST 2: Verify directed graph structure from machine_dependencies.csv."""
    graph = DependencyGraph.from_csv()
    assert graph.has_node("SPIN-01")
    assert graph.has_node("PACK-01")
    assert "CARD-01" in graph.get_downstream_machines("SPIN-01")
    assert "CARD-01" in graph.get_downstream_machines("SPIN-02")
    assert "DRAW-01" in graph.get_downstream_machines("CARD-01")
    edge = graph.get_edge_data("SPIN-01", "CARD-01")
    assert edge["dependency_level"] == 1
    assert edge["production_line"] == "Line-A"


def test_3_bfs_identifies_direct_dependencies():
    """TEST 3: BFS identifies immediate Level 1 dependencies."""
    result = run_bfs_cascade_analysis("CARD-01")
    direct_machines = [m["machine_id"] for m in result["affected_machines"] if m["cascade_level"] == 1]
    assert direct_machines == ["DRAW-01"]


def test_4_bfs_identifies_multilevel_dependencies():
    """TEST 4: BFS identifies propagation across multi-level cascade chains."""
    result = run_bfs_cascade_analysis("SPIN-01")
    assert result["origin_machine"] == "SPIN-01"
    assert result["affected_machine_count"] == 10
    assert result["maximum_cascade_level"] == 8

    # Verify level mapping
    level_map = {m["machine_id"]: m["cascade_level"] for m in result["affected_machines"]}
    assert level_map["CARD-01"] == 1
    assert level_map["DRAW-01"] == 2
    assert level_map["RING-01"] == 3
    assert level_map["WEAV-01"] == 4
    assert level_map["WEAV-02"] == 4
    assert level_map["WEAV-03"] == 5
    assert level_map["DYE-01"] == 6
    assert level_map["DYE-02"] == 6
    assert level_map["FIN-01"] == 7
    assert level_map["PACK-01"] == 8


def test_5_no_duplicate_machines_in_cascade():
    """TEST 5: Ensure converge/fork points (e.g. WEAV-01 & WEAV-02 -> WEAV-03) do not produce duplicates."""
    result = run_bfs_cascade_analysis("RING-01")
    machine_ids = [m["machine_id"] for m in result["affected_machines"]]
    assert len(machine_ids) == len(set(machine_ids)), "Cascade should contain strictly unique machine IDs."
    assert "WEAV-03" in machine_ids


def test_6_cycles_do_not_cause_infinite_loop():
    """TEST 6: Ensure cyclic graph configurations terminate safely via visited set."""
    cycle_graph = DependencyGraph()
    cycle_graph.add_edge("M1", "M2")
    cycle_graph.add_edge("M2", "M3")
    cycle_graph.add_edge("M3", "M1")  # Cycle back to M1

    result = run_bfs_cascade_analysis("M1", graph=cycle_graph)
    assert result["affected_machine_count"] == 2
    assert [m["machine_id"] for m in result["affected_machines"]] == ["M2", "M3"]


def test_7_machine_with_no_downstream_dependencies():
    """TEST 7: Terminal machine (e.g., PACK-01) returns an empty cascade with 0 count."""
    result = run_bfs_cascade_analysis("PACK-01")
    assert result["origin_machine"] == "PACK-01"
    assert result["affected_machine_count"] == 0
    assert result["maximum_cascade_level"] == 0
    assert result["affected_machines"] == []


def test_8_unknown_machine_returns_404():
    """TEST 8: Non-existent machine ID returns 404 Not Found."""
    login_res = client.post("/api/auth/login", json={
        "email": "engineer@gmail.com",
        "password": "12345"
    })
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/impact/NON_EXISTENT_MACHINE",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404


def test_9_unauthenticated_request_returns_401():
    """TEST 9: GET /api/impact/{id} without JWT returns 401 Unauthorized."""
    response = client.get("/api/impact/SPIN-01")
    assert response.status_code == 401


def test_10_authenticated_impact_request_returns_valid_structure():
    """TEST 10: Authenticated call returns full cascade and operational impact structure."""
    login_res = client.post("/api/auth/login", json={
        "email": "production@gmail.com",
        "password": "12345"
    })
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/impact/SPIN-01",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["origin_machine"]["machine_id"] == "SPIN-01"
    assert data["origin_machine"]["process"] == "Spinning"
    assert data["origin_machine"]["production_line"] == "Line-A"
    assert data["cascade"]["affected_machine_count"] == 10
    assert data["cascade"]["maximum_cascade_level"] == 8
    assert len(data["cascade"]["affected_machines"]) == 10
    assert "Line-A" in data["production_impact"]["affected_production_lines"]
    assert "Line-B" in data["production_impact"]["affected_production_lines"]
    assert "Line-C" in data["production_impact"]["affected_production_lines"]
    assert data["production_impact"]["impact_severity"] == "CRITICAL"


def test_11_estimated_repair_hours_derived_from_factory_context():
    """TEST 11: Verify estimated repair hours aggregate correctly from factory_context.csv."""
    resp = analyze_machine_cascade_impact("FIN-01")
    # FIN-01 (6.8 hrs) -> PACK-01 (5.1 hrs) = 11.9 hrs
    assert resp.origin_machine.machine_id == "FIN-01"
    assert resp.cascade.affected_machine_count == 1
    assert resp.production_impact.estimated_total_repair_hours == 11.9


def test_12_estimated_downtime_cost_calculated_correctly():
    """TEST 12: Verify potential downtime cost calculation: sum of (repair_hours * downtime_cost_per_hr)."""
    resp = analyze_machine_cascade_impact("FIN-01")
    # FIN-01: 6.8 * 42321 = 287,782.8
    # PACK-01: 5.1 * 51062 = 260,416.2
    # Total = 548,199.0
    expected_cost = (6.8 * 42321) + (5.1 * 51062)
    assert abs(resp.production_impact.estimated_potential_downtime_cost - expected_cost) < 1.0
