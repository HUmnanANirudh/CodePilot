import { useParams } from "@tanstack/react-router";

export function DeadCodePage() {
  // @ts-ignore
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Dead Code Analysis</h1>
        <p className="text-muted-foreground">Identify unused functions, exports, and orphaned files.</p>
      </div>

      <div className="border border-border rounded-lg p-8 text-center text-muted-foreground">
        No dead code identified. (Mock data)
      </div>
    </div>
  );
}
