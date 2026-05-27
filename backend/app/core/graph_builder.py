import os
from typing import List, Dict, Any

IGNORE_DIRS = [
    'node_modules/',
    'public/',
    'venv/',
    '__pycache__/',
    '.git/',
    'dist/',
    'build/',
]
IGNORE_FILES = [
    '.gitignore',
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'requirements.txt',
]

class GraphBuilder:
    def __init__(self, file_tree: List[Dict[str, Any]], churn_data: Dict[str, int], dependencies: List[Dict[str, str]]):
        self.file_tree = file_tree
        self.churn_data = churn_data
        self.dependencies = dependencies
        self.nodes = []
        self.edges = []
        self.clusters = {}

    def _is_ignored(self, path: str) -> bool:
        if any(path.startswith(d) for d in IGNORE_DIRS):
            return True
        if os.path.basename(path) in IGNORE_FILES:
            return True
        return False

    def build_synapse_graph(self) -> Dict[str, List]:
        """
        Builds a dependency graph from the file tree, churn data, and dependencies.
        Nodes represent files, and edges represent dependencies between files.
        """
        files = [item for item in self.file_tree if item['type'] == 'blob' and not self._is_ignored(item['path'])]
        node_ids = {item['path'] for item in files}

        # Create nodes for all files
        for file_path in node_ids:
            churn = self.churn_data.get(file_path, 0)
            self.nodes.append({
                "id": file_path,
                "group": os.path.dirname(file_path),
                "size": churn,
            })

        # Create edges based on dependencies
        for dep in self.dependencies:
            source = dep['source']
            target = dep['target']
            if source in node_ids and target in node_ids:
                self.edges.append({
                    "source": source,
                    "target": target,
                })

        return {"nodes": self.nodes, "links": self.edges}

    def generate_clusters(self, min_size: int = 3, max_depth: int = 3) -> Dict[str, List[str]]:
        """
        Generates clusters of files based on their parent directory, with filtering.
        """
        for node in self.nodes:
            dir_name = os.path.dirname(node['id'])
            if dir_name not in self.clusters:
                self.clusters[dir_name] = []
            self.clusters[dir_name].append(node['id'])

        filtered_clusters = {}
        for dir_name, files in self.clusters.items():
            depth = len(dir_name.split('/'))
            if len(files) >= min_size and depth <= max_depth:
                filtered_clusters[dir_name] = files

        return filtered_clusters

    def _calc_cluster_metrics(self, filtered_clusters: Dict[str, List[str]]) -> Dict[str, Dict[str, int]]:
        """
        Calculate fan-in, fan-out, and centrality for each cluster.
        Uses file-level import edges aggregated to cluster level.
        """
        # Build file → cluster mapping
        file_to_cluster = {}
        for cluster_id, files in filtered_clusters.items():
            for f in files:
                file_to_cluster[f] = cluster_id

        # Count cross-cluster edges in both directions
        fan_in = {c: 0 for c in filtered_clusters}
        fan_out = {c: 0 for c in filtered_clusters}
        incoming = {c: set() for c in filtered_clusters}  # who imports this cluster
        outgoing = {c: set() for c in filtered_clusters}  # who this cluster imports

        for dep in self.dependencies:
            source_cluster = file_to_cluster.get(dep['source'])
            target_cluster = file_to_cluster.get(dep['target'])
            if source_cluster and target_cluster and source_cluster != target_cluster:
                # source imports target, so source has fan_out++, target has fan_in++
                fan_out[source_cluster] += 1
                fan_in[target_cluster] += 1
                outgoing[source_cluster].add(target_cluster)
                incoming[target_cluster].add(source_cluster)

        metrics = {}
        for c in filtered_clusters:
            fi = fan_in[c]
            fo = fan_out[c]
            # Harmonic centrality-like score: high when both in and out are high
            centrality = (fi * fo) / (fi + fo + 1)
            metrics[c] = {
                "fan_in": fi,
                "fan_out": fo,
                "centrality": round(centrality, 2),
                "incoming": list(incoming[c]),
                "outgoing": list(outgoing[c])
            }
        return metrics

    def _classify_layer(self, cluster_id: str, metrics: Dict[str, Dict[str, Any]]) -> str:
        """
        Classify cluster into layer based on fan-in/fan-out pattern:
        - High fan-out, low fan-in → infrastructure (utility/bottom layer)
        - High fan-in, low fan-out → core-service (central module, others depend on it)
        - High fan-out AND fan-in → service (both imports and is imported)
        - Low in/out → utility
        """
        m = metrics.get(cluster_id, {"fan_in": 0, "fan_out": 0})
        fi = m["fan_in"]
        fo = m["fan_out"]

        if fi >= 5 and fo <= 2:
            return "core-service"
        elif fo >= 5 and fi <= 2:
            return "infrastructure"
        elif fo >= 3 and fi >= 3:
            return "service"
        elif fo <= 1 and fi <= 1:
            return "utility"
        else:
            return "domain"

    def build_module_diagram(self) -> Dict[str, Any]:
        """
        Aggregates file-level graph to cluster-level module diagram.
        Layer classification based on fan-in/fan-out centrality, not folder names.
        Returns nodes with layer types and edges with semantic relationship labels.
        """
        nodes = []
        edges = []

        # Get filtered clusters
        filtered = self.generate_clusters(min_size=2, max_depth=4)
        if not filtered:
            return {"nodes": [], "edges": []}

        # Calculate cluster metrics (fan-in, fan-out, centrality)
        metrics = self._calc_cluster_metrics(filtered)

        # Layer Y positions (UI at top, infra at bottom)
        layer_y = {
            'ui': 50,
            'core-service': 180,
            'service': 310,
            'domain': 440,
            'infrastructure': 570,
            'utility': 700,
        }
        layer_color = {
            'ui': '#6366f1',
            'core-service': '#f59e0b',
            'service': '#10b981',
            'domain': '#8b5cf6',
            'infrastructure': '#64748b',
            'utility': '#6b7280',
        }

        layer_x_counters = {l: 0 for l in layer_y}

        for cluster_id, files in filtered.items():
            label = os.path.basename(cluster_id) if cluster_id and cluster_id != '.' else 'root'
            layer = self._classify_layer(cluster_id, metrics)
            m = metrics.get(cluster_id, {})

            x_counter = layer_x_counters[layer]
            layer_x_counters[layer] += 1

            nodes.append({
                "id": cluster_id,
                "type": "default",
                "data": {
                    "label": label,
                    "layer": layer,
                    "files": len(files),
                    "fan_in": m.get("fan_in", 0),
                    "fan_out": m.get("fan_out", 0),
                    "centrality": m.get("centrality", 0),
                    "incoming": m.get("incoming", []),
                    "outgoing": m.get("outgoing", []),
                },
                "position": {
                    "x": 150 + x_counter * 280,
                    "y": layer_y.get(layer, 400)
                }
            })

        # Build semantic edges at cluster level
        seen_edges = set()
        for cluster_id, files in filtered.items():
            m = metrics.get(cluster_id, {})
            for target_cluster in m.get("outgoing", []):
                edge_key = (cluster_id, target_cluster)
                if edge_key not in seen_edges:
                    seen_edges.add(edge_key)
                    edges.append({
                        "id": f"e-{cluster_id}-{target_cluster}",
                        "source": cluster_id,
                        "target": target_cluster,
                        "label": "uses"
                    })

        return {"nodes": nodes, "edges": edges}
