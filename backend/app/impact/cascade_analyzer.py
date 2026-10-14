from collections import deque
from typing import Dict, List, Any, Set
from app.impact.dependency_graph import DependencyGraph, get_dependency_graph


def run_bfs_cascade_analysis(
    origin_machine_id: str,
    graph: DependencyGraph = None
) -> Dict[str, Any]:
    """
    Performs a Breadth-First Search (BFS) starting from origin_machine_id
    to compute all cascading downstream affected machines, their cascade levels,
    and associated dependency attributes.
    
    Guarantees:
    - Cycle-safe traversal (visited set prevents infinite loops).
    - No duplicate machines in the affected list.
    - Preserves CSV dependency_level and production_line.
    """
    if graph is None:
        graph = get_dependency_graph()

    origin_id = origin_machine_id.strip()
    
    # Queue stores: (current_machine_id, current_cascade_level, direct_parent_machine_id)
    queue = deque()
    visited: Set[str] = {origin_id}
    affected_machines: List[Dict[str, Any]] = []
    max_cascade_level = 0

    # Initialize queue with direct children of origin (Level 1)
    direct_downstream = graph.get_downstream_machines(origin_id)
    for child in direct_downstream:
        if child not in visited:
            visited.add(child)
            queue.append((child, 1, origin_id))

    # BFS Traversal
    while queue:
        current_machine, current_level, parent_machine = queue.popleft()
        
        edge_data = graph.get_edge_data(parent_machine, current_machine)
        
        affected_machines.append({
            "machine_id": current_machine,
            "cascade_level": current_level,
            "dependency_level": edge_data["dependency_level"],
            "production_line": edge_data["production_line"],
            "direct_source": parent_machine
        })

        if current_level > max_cascade_level:
            max_cascade_level = current_level

        # Explore next downstream machines (Level current_level + 1)
        next_children = graph.get_downstream_machines(current_machine)
        for next_child in next_children:
            if next_child not in visited:
                visited.add(next_child)
                queue.append((next_child, current_level + 1, current_machine))

    return {
        "origin_machine": origin_id,
        "affected_machine_count": len(affected_machines),
        "maximum_cascade_level": max_cascade_level,
        "affected_machines": affected_machines
    }
