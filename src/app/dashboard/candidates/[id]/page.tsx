import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const domainRows = [
  { code: "D1", name: "Personality Architecture", status: "scored" },
  { code: "D2", name: "Cognition", status: "scored" },
  { code: "D3", name: "Motivations", status: "pending" },
  { code: "D4", name: "Emotional & Social", status: "pending" },
  { code: "D5", name: "Workplace Effectiveness", status: "blocked" },
];

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "pilot" }> = {
  scored: { label: "Scored", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  blocked: { label: "Phase 2", variant: "pilot" },
};

interface PageProps {
  params: { id: string };
}

export default function CandidateProfilePage({ params }: PageProps) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard/candidates" className="text-sm text-slate-500 hover:text-slate-700">
          ← Candidates
        </Link>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate {params.id}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Assessment profile — Individual Contributor · Entry Level
          </p>
        </div>
        <Badge variant="success">Completed</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Domain Scores</CardTitle>
            </CardHeader>
            <div className="divide-y divide-slate-100">
              {domainRows.map((domain) => {
                const config = statusConfig[domain.status];
                return (
                  <div key={domain.code} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700">
                        {domain.code}
                      </span>
                      <span className="text-sm text-slate-700">{domain.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full ${domain.status === "scored" ? "bg-blue-600" : "bg-slate-200"}`}
                          style={{ width: domain.status === "scored" ? "65%" : "0%" }}
                        />
                      </div>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Session ID", value: params.id },
                { label: "Job Level", value: "Entry / IC" },
                { label: "Modules Completed", value: "D1, D2" },
                { label: "Report Status", value: "Pending" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard/reports"
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span>View Report</span>
                <span className="text-slate-400">→</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
