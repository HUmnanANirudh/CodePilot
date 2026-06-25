import { useParams } from "@tanstack/react-router";

export function RepositorySettingsPage() {
  // @ts-ignore
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage repository settings and preferences.</p>
      </div>

      <div className="border border-border rounded-lg p-6 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-medium">Re-index Repository</h3>
          <p className="text-sm text-muted-foreground">Trigger a fresh analysis of the repository.</p>
        </div>
      </div>
    </div>
  );
}
