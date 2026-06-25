import { useRepositories } from "../hooks/useRepositories";
import { Link } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";

export function RepositoryListPage() {
  const { data: repositories, isLoading, error } = useRepositories();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Repositories</h1>
          <p className="text-muted-foreground">Manage your analyzed repositories.</p>
        </div>
        <Link to="/">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Repository
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-destructive text-center p-8 border border-destructive/20 rounded-lg">
          Failed to load repositories.
        </div>
      ) : repositories?.length === 0 ? (
        <div className="text-center p-16 border border-border rounded-lg bg-card">
          <h3 className="text-xl font-medium mb-2">No repositories yet</h3>
          <p className="text-muted-foreground mb-6">Add your first repository to start analyzing.</p>
          <Link to="/">
            <Button>Get Started</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories?.map((repo: any) => (
            <Link key={repo.id} to="/repositories/$repoId" params={{ repoId: repo.id }}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="truncate">{repo.name}</CardTitle>
                  <CardDescription>{repo.owner}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>View Analysis</span>
                    <span>&rarr;</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
