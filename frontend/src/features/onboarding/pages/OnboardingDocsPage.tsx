import { useParams } from "@tanstack/react-router";

export function OnboardingDocsPage() {
  // @ts-ignore
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Onboarding Documentation</h1>
        <p className="text-muted-foreground">Generated developer onboarding guides.</p>
      </div>

      <article className="prose prose-invert max-w-none">
        <h2>Getting Started</h2>
        <p>Welcome to the repository. Here is what you need to know to get set up...</p>
      </article>
    </div>
  );
}
