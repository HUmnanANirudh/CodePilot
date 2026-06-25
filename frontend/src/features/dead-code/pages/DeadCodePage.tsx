import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DeadCodePage() {
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  const { data, isLoading } = useQuery({
    queryKey: ['dead-code', repoId],
    queryFn: () => fetcher<any>(`/analytics/${repoId}/dead-code`),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Dead Code Analysis</h1>
        <p className="text-muted-foreground">Identify unused functions, exports, and orphaned files.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : data?.dead_code?.length > 0 ? (
        <div className="grid gap-4">
          {data.dead_code.map((item: any, idx: number) => (
            <Card key={idx} className="linear-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium text-destructive">{item.file}:{item.line}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg p-8 text-center text-muted-foreground linear-card bg-card/50">
          No dead code identified. The repository looks clean!
        </div>
      )}
    </div>
  );
}
