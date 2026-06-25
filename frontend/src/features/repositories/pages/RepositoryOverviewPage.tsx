import { useParams } from "@tanstack/react-router";
import { useRepository } from "../hooks/useRepository";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export function RepositoryOverviewPage() {
  const { repoId } = useParams({ strict: false }) as { repoId: string };
  const { data: repo, isLoading, error } = useRepository(repoId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Failed to load repository data.</p>
      </div>
    );
  }

  const { intelligence } = repo as any;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">{repo.owner}/{repo.name}</h1>
        <p className="text-muted-foreground">Repository Overview</p>
      </div>

      {intelligence && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Stars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{intelligence.stars}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{intelligence.contributors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Commits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{intelligence.recent_commits}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Open PRs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{intelligence.open_prs}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
