from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any, Optional
import pandas as pd
from app.core.config import settings


class DependencyGraph:
    """
    Directed graph representing upstream-to-downstream physical dependencies
    among textile machines.
    """

    def __init__(self):
        self.adjacency_list: Dict[str, List[str]] = defaultdict(list)
        self.edge_attributes: Dict[Tuple[str, str], Dict[str, Any]] = {}
        self.all_nodes: Set[str] = set()

    def add_edge(
        self,
        source: str,
        target: str,
        dependency_level: int = 1,
        production_line: str = "Line-A"
    ) -> None:
        source_id = source.strip()
        target_id = target.strip()
        
        self.all_nodes.add(source_id)
        self.all_nodes.add(target_id)
        
        if target_id not in self.adjacency_list[source_id]:
            self.adjacency_list[source_id].append(target_id)
            
        self.edge_attributes[(source_id, target_id)] = {
            "dependency_level": int(dependency_level),
            "production_line": production_line.strip()
        }

    def get_downstream_machines(self, machine_id: str) -> List[str]:
        """Returns direct downstream machine IDs dependent on the given machine."""
        return self.adjacency_list.get(machine_id.strip(), [])

    def get_edge_data(self, source: str, target: str) -> Dict[str, Any]:
        """Returns metadata for the directed dependency edge (source -> target)."""
        return self.edge_attributes.get((source.strip(), target.strip()), {
            "dependency_level": 1,
            "production_line": "Unknown"
        })

    def has_node(self, machine_id: str) -> bool:
        return machine_id.strip() in self.all_nodes

    @classmethod
    def from_csv(cls, csv_path: Optional[Path] = None) -> "DependencyGraph":
        """Constructs a DependencyGraph from machine_dependencies.csv."""
        path = csv_path or settings.DEPENDENCIES_CSV
        if not path.exists():
            raise FileNotFoundError(f"Dependency CSV file not found at: {path}")

        df = pd.read_csv(path)
        graph = cls()

        for _, row in df.iterrows():
            graph.add_edge(
                source=str(row["source_machine"]),
                target=str(row["target_machine"]),
                dependency_level=int(row.get("dependency_level", 1)),
                production_line=str(row.get("production_line", "Line-A"))
            )

        return graph


# Cached in-memory dependency graph
_GRAPH_INSTANCE: Optional[DependencyGraph] = None


def get_dependency_graph(force_reload: bool = False) -> DependencyGraph:
    """Returns the cached DependencyGraph singleton."""
    global _GRAPH_INSTANCE
    if _GRAPH_INSTANCE is None or force_reload:
        _GRAPH_INSTANCE = DependencyGraph.from_csv()
    return _GRAPH_INSTANCE
