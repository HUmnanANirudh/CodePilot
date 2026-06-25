import { useParams } from "@tanstack/react-router";

export function GuidedTourPage() {
  // @ts-ignore
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Guided Tour</h1>
        <p className="text-muted-foreground">Interactive step-by-step repository walkthrough.</p>
      </div>

      <div className="space-y-4">
        {/* Placeholder for Tour steps */}
        <div className="p-6 border border-border rounded-lg bg-card">
          <h2 className="text-xl font-medium mb-2">1. What This Project Does</h2>
          <p className="text-muted-foreground">An overview of the project's purpose and functionality.</p>
        </div>
      </div>
    </div>
  );
}
