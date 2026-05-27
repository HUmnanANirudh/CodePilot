import { Avatar, AvatarFallback } from "./ui/avatar";
import type { AnalysisResult } from "@/types";
import { Bot, FileText, Activity, Star, Users, Clock, Code, Download, Copy, GitPullRequest } from "lucide-react";
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

const ResultsDisplay: React.FC<ResultsProps> = ({ data }) => {
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

      {/* 2. How It Works - Two Column Layout */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2/3: Architecture Diagram & Summary */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-muted p-8 rough-border sketch-shadow tape-corner -rotate-1 relative h-full flex flex-col">
            <h3 className="text-4xl font-marker text-foreground rotate-1 mb-6 inline-block bg-card px-4 py-1 tape sketch-shadow self-start">
                How It Works
            </h3>
            
            <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed text-xl font-sans mb-8">
                <ReactMarkdown>{data.how_it_works || "*No architecture summary generated.*"}</ReactMarkdown>
            </div>

            {data.modules && data.modules.nodes && data.modules.nodes.length > 0 ? (
              <div className="flex-1 min-h-125 w-full bg-background rounded-md rough-border overflow-hidden">
                <ArchitectureFlow data={data.modules} />
              </div>
            ) : (
              <div className="flex-1 min-h-75 flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-md">
                <p className="font-hand text-xl text-muted-foreground">Module diagram not available.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3: Intelligence Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 rough-border sketch-shadow tape-top rotate-1 h-full">
            <h3 className="text-3xl font-marker mb-6 border-b-2 border-border border-dashed pb-2 flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" /> Repository Intelligence
            </h3>
            
            {data.intelligence ? (
              <div className="space-y-6 flex flex-col items-center w-full">
                <div className="w-full bg-secondary text-secondary-foreground font-hand font-bold text-xl px-4 py-3 sketch-shadow -rotate-1 rough-border flex items-center gap-3">
                  <Star className="w-6 h-6 text-yellow-600" /> {data.intelligence.stars} Stars
                </div>
                <div className="w-full bg-card text-foreground font-hand font-bold text-xl px-4 py-3 sketch-shadow rotate-1 rough-border flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" /> {data.intelligence.contributors} Contributors
                </div>
                <div className="w-full bg-muted text-muted-foreground font-hand font-bold text-xl px-4 py-3 sketch-shadow -rotate-2 rough-border flex items-center gap-3">
                  <Clock className="w-6 h-6" /> {data.intelligence.recent_commits} Recent Commits
                </div>
                {data.intelligence.total_prs != null && data.intelligence.merged_prs != null && data.intelligence.open_prs != null && (
                  <div className="w-full bg-card text-foreground font-hand font-bold text-xl px-4 py-3 sketch-shadow rotate-2 rough-border flex items-center gap-3">
                    <GitPullRequest className="w-6 h-6 text-green-600" /> {data.intelligence.merged_prs} Merged / {data.intelligence.open_prs} Open PRs
                  </div>
                )}
                <div className="w-full bg-primary text-primary-foreground font-mono font-bold text-md px-4 py-4 sketch-shadow -rotate-1 rough-border flex flex-col gap-2">
                  <div className="flex items-center gap-2 border-b border-primary-foreground/20 pb-2 mb-1">
                    <Code className="w-5 h-5" /> Tech Stack
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(data.intelligence.tech_stack ?? []).slice(0, 8).map(tech => (
                      <span key={tech} className="bg-primary-foreground/20 px-2 py-1 rounded text-sm">{tech}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-hand text-xl italic opacity-70">No intelligence data available.</p>
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

      {/* 4. Directory Tree (Secondary Info) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-8 pt-8 border-t-2 border-border/50 border-dashed">

        {/* Directory Tree */}
        <div>
          {data.tree_viewer && Object.keys(data.tree_viewer).length > 0 && <TreeViewer data={data.tree_viewer} />}
        </div>

      </motion.div>

    </motion.div>
  );
};

export default ResultsDisplay;
