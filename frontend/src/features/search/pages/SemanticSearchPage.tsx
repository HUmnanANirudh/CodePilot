import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import { Input } from "../../../components/ui/input";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

export function SemanticSearchPage() {
  // @ts-ignore
  const { repoId } = useParams({ strict: false }) as { repoId: string };
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Semantic Search</h1>
        <p className="text-muted-foreground">Search through code using natural language.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input 
          className="pl-10 h-12 text-lg" 
          placeholder="e.g. How does authentication work?" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {/* Mock Results */}
        {query && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">auth/jwt.ts</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                <code>
{`export function verifyToken(token: string) {
  // Authentication logic
  return jwt.verify(token, secret);
}`}
                </code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
