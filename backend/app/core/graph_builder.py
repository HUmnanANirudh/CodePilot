import os
from collections import defaultdict
from typing import List, Dict, Any, Set

IGNORE_DIRS = {'node_modules/', 'public/', 'venv/', '__pycache__/', '.git/', 'dist/', 'build/'}
IGNORE_FILES = {'.gitignore', 'package.json', 'package-lock.json', 'yarn.lock', 'requirements.txt'}


class GraphBuilder:
    def __init__(self, file_tree: List[Dict[str, Any]], churn_data: Dict[str, int], dependencies: List[Dict[str, str]]):
        self.file_tree = file_tree
        self.churn_data = churn_data
        self.dependencies = dependencies
        self.nodes = []
        self.edges = []
        self.clusters = {}
        self.file_to_cluster = {}

    def _is_ignored(self, path: str) -> bool:
        if any(path.startswith(d) for d in IGNORE_DIRS):
            return True
        if os.path.basename(path) in IGNORE_FILES:
            return True
        return False

    def _get_module_name(self, file_path: str) -> str:
        """Extract meaningful module name from file path."""
        parts = file_path.rsplit('/', 1)
        if len(parts) == 2:
            return parts[1].rsplit('.', 1)[0]  # strip extension
        return parts[0]

    def build_synapse_graph(self) -> Dict[str, List]:
        """Builds the raw file-level dependency graph."""
        files = [item for item in self.file_tree if item['type'] == 'blob' and not self._is_ignored(item['path'])]
        node_ids = {item['path'] for item in files}

        for file_path in node_ids:
            self.nodes.append({
                "id": file_path,
                "group": os.path.dirname(file_path),
                "size": self.churn_data.get(file_path, 0),
            })

        for dep in self.dependencies:
            source, target = dep['source'], dep['target']
            if source in node_ids and target in node_ids:
                self.edges.append({"source": source, "target": target})

        return {"nodes": self.nodes, "links": self.edges}

    def generate_clusters(self, min_size: int = 3, max_depth: int = 4) -> Dict[str, List[str]]:
        """
        Deprecated — do not use. Kept for API compatibility.
        Use build_module_diagram() which does import-based module detection.
        """
        return {}

    def _build_import_adjacency(self) -> Dict[str, Set[str]]:
        """Build adjacency list from source -> {targets it imports}."""
        adj = defaultdict(set)
        for dep in self.dependencies:
            adj[dep['source']].add(dep['target'])
        return adj

    def _find_strongly_connected_components(self, nodes: Set[str], adj: Dict[str, Set[str]]) -> List[Set[str]]:
        """
        Tarjan's algorithm for finding strongly connected components.
        Files in an SCC all import each other (or import through a cycle).
        """
        index_counter = [0]
        stack = []
        lowlinks = {}
        index = {}
        on_stack = {}
        sccs = []

        def strongconnect(v):
            index[v] = index_counter[0]
            lowlinks[v] = index_counter[0]
            index_counter[0] += 1
            stack.append(v)
            on_stack[v] = True

            for w in adj.get(v, []):
                if w not in index:
                    strongconnect(w)
                    lowlinks[v] = min(lowlinks[v], lowlinks[w])
                elif on_stack.get(w, False):
                    lowlinks[v] = min(lowlinks[v], index[w])

            if lowlinks[v] == index[v]:
                scc = set()
                while True:
                    w = stack.pop()
                    on_stack[w] = False
                    scc.add(w)
                    if w == v:
                        break
                sccs.append(scc)

        for node in nodes:
            if node not in index:
                strongconnect(node)

        # Filter to SCCs with more than 1 node (actual mutual dependencies)
        # or single nodes that import/are imported by others
        return [scc for scc in sccs if len(scc) > 1]

    def _aggregate_sccs_into_modules(self, sccs: List[Set[str]], adj: Dict[str, Set[str]], all_files: Set[str]) -> Dict[str, List[str]]:
        """
        Aggregate SCCs into modules. Each SCC becomes a module.
        Also include singleton files that have import relationships.
        """
        modules = {}
        used_files = set()

        # First pass: all multi-file SCCs become modules
        for scc in sccs:
            # Find the common directory prefix (the "module" they belong to)
            sorted_files = sorted(scc)
            common_prefix = os.path.dirname(os.path.commonpath(scc)) if len(scc) > 1 else os.path.dirname(sorted_files[0])
            module_id = common_prefix if common_prefix else 'root'

            if module_id not in modules:
                modules[module_id] = []
            modules[module_id].extend(sorted_files)
            used_files.update(scc)

        # Second pass: group remaining files by their top-level directory
        remaining = all_files - used_files
        by_toplevel = defaultdict(list)
        for f in remaining:
            parts = f.split('/')
            toplevel = parts[0] if parts else 'root'
            by_toplevel[toplevel].append(f)

        for toplevel, files in by_toplevel.items():
            if files and toplevel not in ('.', ''):
                modules[toplevel] = files

        return modules

    def _calc_module_metrics(self, modules: Dict[str, List[str]], adj: Dict[str, Set[str]]) -> Dict[str, Dict[str, Any]]:
        """Calculate fan-in, fan-out, centrality for each module."""
        file_to_module = {}
        for mod_id, files in modules.items():
            for f in files:
                file_to_module[f] = mod_id

        fan_in = defaultdict(int)
        fan_out = defaultdict(int)
        incoming = defaultdict(set)
        outgoing = defaultdict(set)

        for source, targets in adj.items():
            src_mod = file_to_module.get(source)
            if not src_mod:
                continue
            for target in targets:
                tgt_mod = file_to_module.get(target)
                if tgt_mod and tgt_mod != src_mod:
                    if tgt_mod not in outgoing[src_mod]:
                        outgoing[src_mod].add(tgt_mod)
                        fan_out[src_mod] += 1
                    if src_mod not in incoming[tgt_mod]:
                        incoming[tgt_mod].add(src_mod)
                        fan_in[tgt_mod] += 1

        metrics = {}
        for mod_id in modules:
            fi = fan_in[mod_id]
            fo = fan_out[mod_id]
            centrality = round((fi * fo) / (fi + fo + 1), 2)
            metrics[mod_id] = {
                "fan_in": fi,
                "fan_out": fo,
                "centrality": centrality,
                "incoming": list(incoming[mod_id]),
                "outgoing": list(outgoing[mod_id]),
            }
        return metrics

    def _classify_layer(self, mod_id: str, metrics: Dict[str, Dict[str, Any]]) -> str:
        """Classify module by fan-in/fan-out pattern."""
        m = metrics.get(mod_id, {"fan_in": 0, "fan_out": 0})
        fi, fo = m["fan_in"], m["fan_out"]

        if fi >= 4 and fo <= 2:
            return "core-service"
        elif fo >= 4 and fi <= 2:
            return "infrastructure"
        elif fo >= 2 and fi >= 2:
            return "service"
        elif fo <= 1 and fi <= 1:
            return "utility"
        return "domain"

    def build_module_diagram(self) -> Dict[str, Any]:
        """
        Build a module-level dependency diagram using import analysis.
        NOT folder-based — finds actual code modules via import relationships.
        """
        all_files = {item['path'] for item in self.file_tree if item['type'] == 'blob' and not self._is_ignored(item['path'])}
        if not all_files:
            return {"nodes": [], "edges": []}

        adj = self._build_import_adjacency()
        sccs = self._find_strongly_connected_components(all_files, adj)
        modules = self._aggregate_sccs_into_modules(sccs, adj, all_files)

        if not modules:
            return {"nodes": [], "edges": []}

        # Filter to modules with >= 2 files OR that have import relationships
        meaningful_modules = {
            m: files for m, files in modules.items()
            if len(files) >= 2 or m in [k for k, v in adj.items() if v]
        }

        metrics = self._calc_module_metrics(meaningful_modules, adj)

        layer_y = {
            'core-service': 50,
            'service': 180,
            'domain': 310,
            'infrastructure': 440,
            'utility': 570,
        }
        layer_x_counters = {l: 0 for l in layer_y}

        nodes = []
        for mod_id, files in meaningful_modules.items():
            label = mod_id.split('/')[-1] if '/' in mod_id else mod_id
            layer = self._classify_layer(mod_id, metrics)
            m = metrics.get(mod_id, {})

            x = layer_x_counters[layer]
            layer_x_counters[layer] += 1

            nodes.append({
                "id": mod_id,
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
                "position": {"x": 150 + x * 290, "y": layer_y.get(layer, 400)},
            })

        seen_edges = set()
        edges = []
        for mod_id, files in meaningful_modules.items():
            m = metrics.get(mod_id, {})
            for target_mod in m.get("outgoing", []):
                if target_mod in meaningful_modules:
                    key = (mod_id, target_mod)
                    if key not in seen_edges:
                        seen_edges.add(key)
                        edges.append({
                            "id": f"e-{mod_id}-{target_mod}",
                            "source": mod_id,
                            "target": target_mod,
                            "label": "uses",
                        })

        return {"nodes": nodes, "edges": edges}
