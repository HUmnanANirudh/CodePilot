import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function OnboardingDocsPage() {
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  const { data, isLoading } = useQuery({
    queryKey: ['onboarding', repoId],
    queryFn: () => fetcher<any>(`/generate/onboarding/${repoId}`, { method: 'POST' }),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Onboarding Documentation</h1>
        <p className="text-muted-foreground">Generated developer onboarding guides.</p>
      </div>

      <div className="linear-card p-8 min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <article className="prose prose-invert max-w-none prose-pre:bg-[#1f2023] prose-pre:border prose-pre:border-border">
            <ReactMarkdown>
              {data?.markdown || "Could not generate onboarding documentation."}
            </ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}
