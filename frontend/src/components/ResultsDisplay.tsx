import React, { useState, useMemo } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import GraphDisplay from "./GraphDisplay";
import type { AnalysisResult } from "@/types";
import { Bot, GitGraph, FileText, Activity, Info, ChevronDown, ChevronUp, Star, Users, Clock, Code, Terminal, Download, Copy, GitPullRequest } from "lucide-react";
import { motion, type Variants } from "motion/react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";

interface ResultsProps {
  data: AnalysisResult;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
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

const ResultsDisplay: React.FC<ResultsProps> = ({ data }) => {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [showAllClusters, setShowAllClusters] = useState(false);

  const graphDataMemo = useMemo(() => data?.graph ?? { nodes: [], links: [] }, [data]);

  const filteredGraphData = useMemo(() => {
    if (!selectedCluster || !graphDataMemo) return graphDataMemo;

    const nodes = graphDataMemo.nodes.filter((node) => node.group === selectedCluster);
    const nodeIds = new Set(nodes.map((n) => n.id));
    const getId = (val: string | { id: string }) => typeof val === "object" ? val.id : val;
    const links = graphDataMemo.links.filter(
      (link) => nodeIds.has(getId(link.source as string | { id: string })) && nodeIds.has(getId(link.target as string | { id: string }))
    );

    return { nodes, links };
  }, [graphDataMemo, selectedCluster]);

  const clusters = data?.clusters ?? {};
  const clusterKeys = Object.keys(clusters).filter(key => {
    // Check if key is empty/whitespace
    if (!key || key.trim() === "") return false;
    
    // Check if the cluster array exists and has length > 0
    const clusterItems = clusters[key];
    return Array.isArray(clusterItems) && clusterItems.length > 0;
  });
  const displayedClusters = showAllClusters ? clusterKeys : clusterKeys.slice(0, 10);
  const hasMoreClusters = clusterKeys.length > 10;
  const hotspots = data?.metrics?.hotspots ?? [];

  if (!data) {
    return null;
  }


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      {/* GitHub Intelligence Top Bar */}
      {data.intelligence && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 items-center justify-center mb-6">
          <div className="bg-secondary text-secondary-foreground font-hand font-bold text-2xl px-6 py-2 sketch-shadow rotate-1 rough-border flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" /> {data.intelligence.stars} Stars
          </div>
          <div className="bg-card text-foreground font-hand font-bold text-2xl px-6 py-2 sketch-shadow -rotate-2 rough-border flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> {data.intelligence.contributors} Contributors
          </div>
          <div className="bg-muted text-muted-foreground font-hand font-bold text-2xl px-6 py-2 sketch-shadow rotate-2 rough-border flex items-center gap-2">
            <Clock className="w-5 h-5" /> {data.intelligence.recent_commits} Recent Commits
          </div>
          <div className="bg-primary text-primary-foreground font-mono font-bold text-lg px-6 py-3 sketch-shadow -rotate-1 rough-border flex items-center gap-2 max-w-lg truncate">
            <Code className="w-5 h-5" /> Stack: {(data.intelligence.tech_stack ?? []).slice(0, 3).join(", ")}
          </div>
          {data.intelligence.total_prs != null && (
            <div className="bg-card text-foreground font-hand font-bold text-2xl px-6 py-2 sketch-shadow rotate-1 rough-border flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-green-600" /> {data.intelligence.merged_prs} Merged / {data.intelligence.open_prs} Open PRs
            </div>
          )}
        </motion.div>
      )}

      {/* Narrative Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex gap-6 p-8 bg-card rough-border sketch-shadow tape-top rotate-1 relative group h-full">
             <Avatar className="w-14 h-14 mt-1 shrink-0 bg-transparent rough-border sketch-shadow -rotate-6">
              <AvatarFallback className="bg-primary text-primary-foreground font-marker">
                <Bot className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <h3 className="text-4xl font-marker text-foreground -rotate-2 mb-2 inline-block bg-secondary px-4 py-1 tape sketch-shadow">
                  The Tale
              </h3>
              <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-2xl font-hand font-bold">
                 <ReactMarkdown>{data.narrative}</ReactMarkdown>
              </div>
            </div>
        </div>

        <div className="flex gap-6 p-8 bg-muted rough-border sketch-shadow tape-corner -rotate-1 relative group h-full flex-col">
            <h3 className="text-4xl font-marker text-foreground rotate-2 mb-2 inline-block bg-card px-4 py-1 tape sketch-shadow self-start">
                Architecture Summary
            </h3>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-xl font-sans mt-4">
                 <ReactMarkdown>{data.architecture_summary || "*No architecture summary generated.*"}</ReactMarkdown>
            </div>
        </div>
      </motion.div>

      {/* Tree Viewer & AI Agent Prompt */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.tree_viewer && <TreeViewer data={data.tree_viewer} />}
          
          {data.agent_prompt && (
             <div className="bg-primary/5 p-6 rough-border sketch-shadow tape-top rotate-2 relative flex flex-col">
                <h3 className="text-3xl font-marker mb-4 border-b-2 border-primary/20 border-dashed pb-2 flex items-center gap-2">
                   <Terminal className="w-6 h-6 text-primary" /> AI Agent Prompt Export
                </h3>
                <p className="font-hand text-xl mb-4 text-foreground/80">Use this prompt to inject the repository context into your favorite AI agent.</p>
                <div className="flex-1 bg-card p-4 font-mono text-sm overflow-y-auto max-h-62.5 rough-border mb-4 text-foreground/80">
                   {data.agent_prompt.structured}
                </div>
                <div className="flex gap-4 mt-auto">
                   <Button onClick={() => navigator.clipboard.writeText(data.agent_prompt!.markdown)} className="flex-1 bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform sketch-shadow rough-border">
                      <Copy className="w-4 h-4 mr-2" /> Copy Markdown
                   </Button>
                   <Button onClick={() => navigator.clipboard.writeText(JSON.stringify(data.agent_prompt!.json, null, 2))} variant="outline" className="flex-1 font-bold hover:scale-105 transition-transform sketch-shadow rough-border bg-card">
                      <Download className="w-4 h-4 mr-2" /> Export JSON
                   </Button>
                </div>
             </div>
          )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN (2/3): Graph & Clusters */}
          <div className="lg:col-span-2 space-y-6">
              {/* Graph Container */}
              <motion.div variants={itemVariants} className="mt-4">
                 <div className="bg-card p-2 rough-border sketch-shadow tape-corner -rotate-1 relative group h-112.5">
                     <div className="absolute top-4 left-4 z-10 bg-secondary px-4 py-2 rough-border sketch-shadow font-hand font-bold text-xl text-secondary-foreground flex items-center gap-2 -rotate-2">
                       <Activity className="w-5 h-5 text-primary animate-pulse" />
                       {selectedCluster ? `Filtering: ${selectedCluster}` : "Full Architecture"}
                       {selectedCluster && (
                          <button onClick={() => setSelectedCluster(null)} className="ml-2 text-sm text-foreground hover:text-primary underline">
                              Clear
                          </button>
                       )}
                     </div>
                     <GraphDisplay graphData={filteredGraphData} />
                 </div>
              </motion.div>

              {/* Clusters Card */}
              <motion.div variants={itemVariants}>
                <Card className="bg-card rough-border sketch-shadow rotate-1 mt-6">
                  <CardHeader className="pb-3 border-b-2 border-border border-dashed">
                    <CardTitle className="flex items-center gap-2 text-3xl font-marker text-foreground">
                      <GitGraph className="w-6 h-6 text-primary" />
                      Architecture Clusters
                    </CardTitle>
                    <CardDescription className="font-hand text-xl">Select a cluster to visualize specific modules.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4">
                      {displayedClusters.map((cluster: string, index: number) => (
                        <button 
                          key={cluster} 
                          onClick={() => setSelectedCluster(cluster === selectedCluster ? null : cluster)}
                          className={cn(
                              "sticky-note px-4 py-3 font-hand text-xl font-bold transition-transform",
                              index % 2 === 0 ? "rotate-2" : "-rotate-2",
                              cluster === selectedCluster 
                                ? "scale-110 z-10 outline outline-primary"
                                : "hover:scale-105 hover:z-10"
                          )}
                        >
                          {cluster}
                        </button>
                      ))}
                    </div>
                    {hasMoreClusters && (
                        <div className="mt-4 flex justify-center">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowAllClusters(!showAllClusters)}
                                className="text-muted-foreground hover:text-primary"
                            >
                                {showAllClusters ? (
                                    <><ChevronUp className="w-4 h-4 mr-1" /> Show Less</>
                                ) : (
                                    <><ChevronDown className="w-4 h-4 mr-1" /> Show {clusterKeys.length - 10} More</>
                                )}
                            </Button>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
          </div>

          {/* RIGHT COLUMN (1/3): Hotspots */}
          <motion.div variants={itemVariants} className="lg:h-full mt-4 lg:mt-0">
            <Card className="h-full bg-card rough-border sketch-shadow tape-top flex flex-col -rotate-1 lg:ml-2">
              <CardHeader className="pb-3 border-b-2 border-border border-dashed">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-3xl font-marker text-foreground">
                    <FileText className="w-6 h-6 text-destructive" />
                    Hotspots
                    </CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="w-6 h-6 text-foreground cursor-help hover:text-primary transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs bg-card rough-border sketch-shadow text-foreground text-lg font-hand p-4 rotate-1">
                                <p className="font-bold font-marker text-xl mb-1">What is a Hotspot?</p>
                                <p>Hotspots are files that are frequently changed and have high complexity. They are often sources of technical debt and potential bugs.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <CardDescription className="font-hand text-xl">High complexity zones requiring attention.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 overflow-y-auto flex-1 max-h-200">
                <ul className="space-y-4">
                  {hotspots.map((hotspot: string) => (
                    <li key={hotspot} className="text-xl font-hand font-bold text-foreground bg-transparent px-3 py-3 flex items-start gap-3 border-b-2 border-destructive/30 border-dashed hover:bg-destructive/10 transition-colors">
                      <span className="w-4 h-4 rounded-full border-4 border-destructive mt-1 shrink-0 sketch-shadow" />
                      <span className="break-all">{hotspot}</span>
                    </li>
                  ))}
                  {hotspots.length === 0 && (
                      <li className="text-2xl font-hand text-foreground italic text-center py-8 opacity-70">No significant hotspots detected. 🎉</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

      </div>
    </motion.div>
  );
};

export default ResultsDisplay;
