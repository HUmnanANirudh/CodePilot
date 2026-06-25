import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

export function GuidedTourPage() {
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  const { data, isLoading } = useQuery({
    queryKey: ['guided-tour', repoId],
    queryFn: () => fetcher<any>(`/generate/guided-tour/${repoId}`, { method: 'POST' }),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Guided Tour</h1>
        <p className="text-muted-foreground">Interactive step-by-step repository walkthrough.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="p-6 border border-border rounded-lg bg-card linear-card whitespace-pre-wrap text-[#f4f4f5]">
            {data?.markdown || "Could not generate tour."}
          </div>
        )}
      </div>
    </div>
  );
}
