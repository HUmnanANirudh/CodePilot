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
                "size": churn,  # Use churn to determine node size
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

    def build_module_diagram(self) -> Dict[str, Any]:
        """
        Aggregates file-level graph to cluster-level module diagram.
        Auto-classifies clusters into layer types (UI/State/Data/Infra/Business).
        Returns {"nodes": [{"id", "type", "data": {"label", "description", "icon"}, "position": {"x", "y"}}], "edges": [{"source", "target", "label"}]}
        """
        nodes = []
        edges = []
        
        # Helper to classify a directory into a layer
        def classify_layer(path: str) -> str:
            path_lower = path.lower()
            if any(p in path_lower for p in ['pages', 'components', 'views', 'screens', 'layouts']):
                return 'ui'
            elif any(p in path_lower for p in ['store', 'state', 'context', 'recoil', 'zustand', 'redux']):
                return 'state'
            elif any(p in path_lower for p in ['services', 'api', 'models', 'db', 'queries', 'hooks']):
                return 'data'
            elif any(p in path_lower for p in ['config', 'lib', 'core', 'utils', 'helpers', 'middleware']):
                return 'infra'
            else:
                return 'business'
                
        # Helper for assigning Y position based on layer
        def get_layer_y(layer: str) -> int:
            return {
                'ui': 0,
                'state': 150,
                'data': 300,
                'business': 450,
                'infra': 600
            }.get(layer, 450)

        # Mapping layer string to node type
        def get_node_type(layer: str) -> str:
            if layer == 'ui':
                return 'input'
            elif layer == 'infra':
                return 'output'
            return 'default'

        # Count cluster frequencies to space them on X axis
        layer_counts = {'ui': 0, 'state': 0, 'data': 0, 'business': 0, 'infra': 0}
        
        # Build Nodes
        # Use filtered clusters to only show meaningful ones
        clusters_to_use = self.clusters  # Or we could call generate_clusters() again if needed
        # We will use self.generate_clusters() to get the filtered ones
        filtered = self.generate_clusters()
        
        for cluster_id, files in filtered.items():
            if not cluster_id or cluster_id == '.':
                label = 'root'
            else:
                label = os.path.basename(cluster_id)
                if not label:
                    label = cluster_id
            
            layer = classify_layer(cluster_id)
            count = layer_counts[layer]
            layer_counts[layer] += 1
            
            nodes.append({
                "id": cluster_id,
                "type": get_node_type(layer),
                "data": {
                    "label": label,
                    "description": f"{len(files)} files",
                    "layer": layer
                },
                "position": {
                    "x": count * 250, # Space horizontally by 250px
                    "y": get_layer_y(layer)
                }
            })
            
        # Build Edges
        # We need to map file-to-file dependencies to cluster-to-cluster dependencies
        # First, create a reverse mapping from file to its cluster
        file_to_cluster = {}
        for cluster_id, files in filtered.items():
            for f in files:
                file_to_cluster[f] = cluster_id
                
        cluster_edges = set()
        for dep in self.dependencies:
            source_file = dep['source']
            target_file = dep['target']
            
            source_cluster = file_to_cluster.get(source_file)
            target_cluster = file_to_cluster.get(target_file)
            
            # Add edge if both are in known clusters and it's not a self-loop
            if source_cluster and target_cluster and source_cluster != target_cluster:
                edge_tuple = (source_cluster, target_cluster)
                if edge_tuple not in cluster_edges:
                    cluster_edges.add(edge_tuple)
                    edges.append({
                        "id": f"e-{source_cluster}-{target_cluster}",
                        "source": source_cluster,
                        "target": target_cluster
                    })

        return {"nodes": nodes, "edges": edges}