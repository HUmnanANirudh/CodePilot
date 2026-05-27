export interface HistoryItem {
  id: string;
  owner: string;
  name: string;
}

export interface Node {
  id: string;
  group: string;
  size: number;
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
}

export interface AgentPrompt {
  markdown: string;
  structured: string;
  json: object;
}

export interface AnalysisResult extends HistoryItem {
  graph: GraphData;
  narrative: string;
  architecture_summary?: string;
  intelligence?: Intelligence;
  tree_viewer?: Record<string, any>;
  agent_prompt?: AgentPrompt;
  metrics: {
    hotspots: string[];
  };
  clusters: Record<string, string[]>;
}