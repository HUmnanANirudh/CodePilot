import { useParams } from "@tanstack/react-router";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: 'Frontend' } },
  { id: '2', position: { x: 100, y: 200 }, data: { label: 'Backend API' } },
  { id: '3', position: { x: 100, y: 300 }, data: { label: 'Database' } },
];
const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

export function ArchitecturePage() {
  // @ts-ignore
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Architecture Explorer</h1>
        <p className="text-muted-foreground">Interactive module graph and service boundaries.</p>
      </div>

      <div className="flex-1 border border-border rounded-lg bg-card overflow-hidden">
        <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
