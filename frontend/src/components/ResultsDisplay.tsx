import { useState } from 'react';
import { Avatar, AvatarFallback } from "./ui/avatar";
import type { AnalysisResult, ModuleNode } from "@/types";
import { Bot, FileText, Activity, Star, Users, Clock, Download, Copy, GitPullRequest, X, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion, type Variants } from "motion/react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import ArchitectureFlow from "./ArchitectureFlow";

interface ResultsProps {
  data: AnalysisResult;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
} satisfies Variants;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
} satisfies Variants;

type TreeNode = { [key: string]: TreeNode };

const renderTree = (node: TreeNode, path: string = "") => {
  return (
    <ul className="pl-6 border-l-2 border-border/30 border-dashed ml-3 mt-2">
      {Object.keys(node).map((key) => {
        return (
          <li key={path + key} className="my-2 font-mono text-lg text-foreground">
            <span className="font-bold text-primary">📁 {key}/</span>
            {Object.keys(node[key]).length > 0 && renderTree(node[key], path + key + "/")}
          </li>
        );
      })}
    </ul>
  );
};

const TreeViewer = ({ data }: { data: TreeNode }) => {
  if (!data) return null;
  return (
    <div className="bg-card p-6 rough-border sketch-shadow tape-corner -rotate-1 max-h-100 overflow-y-auto">
      <h3 className="text-3xl font-marker mb-4 border-b-2 border-border border-dashed pb-2 flex items-center gap-2">
         <FileText className="w-6 h-6 text-primary" /> Directory Tree
      </h3>
      {renderTree(data)}
    </div>
  );
};

const layerLabels: Record<string, string> = {
  'ui': 'UI Layer',
  'core-service': 'Core Service',
  'service': 'Service',
  'domain': 'Domain',
  'infrastructure': 'Infrastructure',
  'utility': 'Utility',
};

const layerColors: Record<string, string> = {
  'ui': '#6366f1',
  'core-service': '#f59e0b',
  'service': '#10b981',
  'domain': '#8b5cf6',
  'infrastructure': '#64748b',
  'utility': '#6b7280',
};

const NodeDetailPanel = ({ node, onClose }: { node: ModuleNode; onClose: () => void }) => {
  const { label, layer, files, fan_in, fan_out, centrality, incoming, outgoing } = node.data || {};

  return (
    <div className="bg-card p-5 rough-border sketch-shadow -rotate-1 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 border-b-2 border-border border-dashed pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: layerColors[layer] || '#6b7280' }}
          />
          <h3 className="text-2xl font-marker text-foreground">{label}</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Layer</span>
          <span
            className="text-lg font-hand font-bold px-3 py-1 rounded text-white w-fit"
            style={{ backgroundColor: layerColors[layer] || '#6b7280' }}
          >
            {layerLabels[layer] || layer}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Module Size</span>
          <span className="text-xl font-hand font-bold">{files} files</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 bg-secondary/20 px-3 py-2 rounded">
            <span className="text-xs font-mono text-muted-foreground">Fan In</span>
            <span className="text-xl font-hand font-bold text-primary flex items-center gap-1">
              <ArrowDownLeft className="w-4 h-4" /> {fan_in}
            </span>
          </div>
          <div className="flex flex-col gap-1 bg-secondary/20 px-3 py-2 rounded">
            <span className="text-xs font-mono text-muted-foreground">Fan Out</span>
            <span className="text-xl font-hand font-bold text-primary flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> {fan_out}
            </span>
          </div>
          <div className="flex flex-col gap-1 bg-secondary/20 px-3 py-2 rounded">
            <span className="text-xs font-mono text-muted-foreground">Centrality</span>
            <span className="text-xl font-hand font-bold text-primary">{centrality}</span>
          </div>
        </div>

        {incoming && incoming.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Used By (Fan In)</span>
            <div className="flex flex-wrap gap-2">
              {incoming.map((dep: string) => (
                <span key={dep} className="text-sm font-hand bg-muted px-2 py-1 rounded">
                  {dep.split('/').pop()}
                </span>
              ))}
            </div>
          </div>
        )}

        {outgoing && outgoing.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider">Depends On (Fan Out)</span>
            <div className="flex flex-wrap gap-2">
              {outgoing.map((dep: string) => (
                <span key={dep} className="text-sm font-hand bg-muted px-2 py-1 rounded">
                  {dep.split('/').pop()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsProps> = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState<ModuleNode | null>(null);

  if (!data) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-12"
    >
      {/* 1. What This Repository Is */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-6 p-8 bg-card rough-border sketch-shadow tape-top rotate-1 relative group w-full">
             <Avatar className="w-14 h-14 mt-1 shrink-0 bg-transparent rough-border sketch-shadow -rotate-6">
              <AvatarFallback className="bg-primary text-primary-foreground font-marker">
                <Bot className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <h3 className="text-5xl font-marker text-foreground -rotate-1 mb-2 inline-block bg-secondary px-6 py-2 tape sketch-shadow">
                  What This Repository Is
              </h3>
              <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-2xl font-hand font-bold mt-6">
                 <ReactMarkdown>{data.narrative}</ReactMarkdown>
              </div>
            </div>
        </div>
      </motion.div>

      {/* 2. How It Works - Three Column Layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left: Architecture Diagram & Summary */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-muted p-6 rough-border sketch-shadow tape-corner -rotate-1 relative h-full flex flex-col">
            <h3 className="text-4xl font-marker text-foreground rotate-1 mb-4 inline-block bg-card px-4 py-1 tape sketch-shadow self-start">
                How It Works
            </h3>

            <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed text-lg font-sans mb-6">
                <ReactMarkdown>{data.how_it_works || "*No architecture summary generated.*"}</ReactMarkdown>
            </div>

            {data.modules && data.modules.nodes && data.modules.nodes.length > 0 ? (
              <div className="flex-1 min-h-96 w-full bg-background rounded-md rough-border overflow-hidden">
                <ArchitectureFlow data={data.modules} onNodeSelect={setSelectedNode} />
              </div>
            ) : (
              <div className="flex-1 min-h-75 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-md">
                <p className="font-hand text-xl text-muted-foreground">Module diagram not available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Node Detail Panel */}
        <div className="lg:col-span-3">
          {selectedNode ? (
            <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          ) : (
            <div className="bg-card p-6 rough-border sketch-shadow tape-top rotate-1 h-full flex flex-col items-center justify-center">
              <Activity className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="font-hand text-xl text-center text-muted-foreground/70">
                Click a node in the diagram to explore its architecture details
              </p>
            </div>
          )}
        </div>

        {/* Right: Intelligence Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-card p-5 rough-border sketch-shadow tape-top rotate-1 h-full">
            <h3 className="text-3xl font-marker mb-4 border-b-2 border-border border-dashed pb-2 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Intel
            </h3>

            {data.intelligence ? (
              <div className="space-y-4 flex flex-col">
                <div className="flex items-center gap-2 font-hand">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="font-bold">{data.intelligence.stars} stars</span>
                </div>
                <div className="flex items-center gap-2 font-hand">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-bold">{data.intelligence.contributors} contributors</span>
                </div>
                <div className="flex items-center gap-2 font-hand">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold">{data.intelligence.recent_commits} commits</span>
                </div>
                {data.intelligence.total_prs != null && (
                  <div className="flex items-center gap-2 font-hand">
                    <GitPullRequest className="w-4 h-4 text-green-600" />
                    <span className="font-bold">{data.intelligence.merged_prs ?? 0}/{data.intelligence.open_prs ?? 0} PRs</span>
                  </div>
                )}
                <div className="pt-3 border-t border-border/50">
                  <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider mb-2">Stack</div>
                  <div className="flex flex-wrap gap-1">
                    {(data.intelligence.tech_stack ?? []).slice(0, 6).map(tech => (
                      <span key={tech} className="bg-primary/20 text-primary-foreground text-xs px-2 py-0.5 rounded font-mono">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-hand text-sm italic opacity-70">No intel available.</p>
            )}
          </div>
        </div>

      </motion.div>

      {/* 3. How To Rebuild It */}
      <motion.div variants={itemVariants}>
        {data.rebuild_prompt && (
          <div className="bg-primary/5 p-8 rough-border sketch-shadow tape-top -rotate-1 relative flex flex-col w-full">
            <h3 className="text-4xl font-marker text-foreground rotate-1 mb-4 inline-block bg-card px-4 py-1 tape sketch-shadow self-start">
                How To Rebuild It
            </h3>
            <p className="font-hand text-2xl mb-6 text-foreground/80 mt-2">Use this generated prompt to inject the repository context into your favorite AI agent.</p>

            <div className="flex-1 bg-card p-6 font-mono text-base overflow-y-auto max-h-100 rough-border mb-6 text-foreground/80 whitespace-pre-wrap">
                {data.rebuild_prompt?.structured || "*No structured prompt generated.*"}
            </div>

            <div className="flex gap-4">
                <Button onClick={() => navigator.clipboard.writeText(data.rebuild_prompt!.markdown)} className="flex-1 bg-primary text-primary-foreground font-bold text-lg py-6 hover:scale-105 transition-transform sketch-shadow rough-border">
                <Copy className="w-5 h-5 mr-2" /> Copy Markdown Prompt
                </Button>
                <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(data.rebuild_prompt!.json, null, 2))} variant="outline" className="flex-1 font-bold text-lg py-6 hover:scale-105 transition-transform sketch-shadow rough-border bg-card">
                <Download className="w-5 h-5 mr-2" /> Export JSON Configuration
                </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* 4. Directory Tree */}
      <motion.div variants={itemVariants} className="pt-8 border-t-2 border-border/50 border-dashed">
        {data.tree_viewer && Object.keys(data.tree_viewer).length > 0 && <TreeViewer data={data.tree_viewer} />}
      </motion.div>

    </motion.div>
  );
};

export default ResultsDisplay;
