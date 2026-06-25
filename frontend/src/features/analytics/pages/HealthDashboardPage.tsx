import { useParams } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', maintainability: 85, complexity: 40 },
  { name: 'Feb', maintainability: 82, complexity: 45 },
  { name: 'Mar', maintainability: 88, complexity: 38 },
];

export function HealthDashboardPage() {
  // @ts-ignore
  const { repoId } = useParams({ strict: false }) as { repoId: string };

  return (
    <div className="max-w-5xl mx-auto space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Repository Health</h1>
        <p className="text-muted-foreground">Maintainability and complexity trends.</p>
      </div>

      <div className="flex-1 border border-border rounded-lg p-6 bg-card">
        <h3 className="text-lg font-medium mb-4">Maintainability Trend</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="maintainability" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="complexity" stroke="#f43f5e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
