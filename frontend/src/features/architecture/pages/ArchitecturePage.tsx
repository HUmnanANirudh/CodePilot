import { useParams } from "@tanstack/react-router";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import "@xyflow/react/dist/style.css";

export function ArchitecturePage() {
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  const { data, isLoading } = useQuery({
    queryKey: ['architecture', repoId],
    queryFn: () => fetcher<any>(`/analytics/${repoId}/architecture`),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const nodes = data?.architecture?.nodes?.map((n: any, idx: number) => ({
    id: n.id,
    position: { x: 100 + (idx * 50), y: 100 + (idx * 50) },
    data: { label: n.label }
  })) || [];
  
  const edges = data?.architecture?.edges || [];

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Architecture Explorer</h1>
        <p className="text-muted-foreground">Interactive module graph and service boundaries.</p>
      </div>

      <div className="flex-1 linear-card overflow-hidden relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ReactFlow nodes={nodes} edges={edges} fitView colorMode="dark">
            <Background />
            <Controls />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
