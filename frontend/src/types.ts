export interface HistoryItem {
  id: string;
  owner: string;
  name: string;
}

export interface Node {
  id: string;
  group: string;
}

export interface Link {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface Intelligence {
  repo_name: string;
  stars: number;
  contributors: number;
  recent_commits: number;
  tech_stack: string[];
  total_prs?: number;
  merged_prs?: number;
  open_prs?: number;
}

export interface RebuildPrompt {
  markdown: string;
  structured: string;
  json: object;
}

export interface ModuleNode {
  id: string;
  type: 'input' | 'default' | 'output' | 'group';
  data: { label: string; description?: string; icon?: string; layer?: string };
  position: { x: number; y: number };
}

export interface ModuleEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ModuleDiagram {
  nodes: ModuleNode[];
  edges: ModuleEdge[];
}

export interface AnalysisResult extends HistoryItem {
  graph: GraphData;
  narrative: string;
  how_it_works?: string;
  intelligence?: Intelligence;
  tree_viewer?: Record<string, any>;
  rebuild_prompt?: RebuildPrompt;
  modules?: ModuleDiagram;
  metrics: {
    hotspots: string[];
  };
  clusters: Record<string, string[]>;
}