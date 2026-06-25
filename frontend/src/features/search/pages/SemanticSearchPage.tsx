import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/api-client";

export function SemanticSearchPage() {
  const { repoId } = useParams({ strict: false }) as { repoId: string };
  const [query, setQuery] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ['search', repoId, query],
    queryFn: () => fetcher<any>('/search', {
      method: "POST",
      body: JSON.stringify({ repo_id: repoId, query })
    }),
    enabled: query.length > 2,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Semantic Search</h1>
        <p className="text-muted-foreground">Search through code using natural language.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          className="pl-10 h-12 text-lg bg-card border-border" 
          placeholder="e.g. How does authentication work?" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {isLoading && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" />}
        
        {data?.results?.map((res: any, idx: number) => (
          <Card key={idx} className="linear-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{res.metadata?.path}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-[#1f2023] rounded-md text-sm overflow-x-auto text-muted-foreground">
                <code>{res.content}</code>
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
