import { useParams } from "@tanstack/react-router";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export function DependencyGraphPage() {
  // @ts-ignore
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Dependency Insights</h1>
        <p className="text-muted-foreground">Internal and external dependency visualization.</p>
      </div>

      <div className="flex-1 border border-border rounded-lg bg-card overflow-hidden">
        <ReactFlow nodes={[]} edges={[]} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
