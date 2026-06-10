import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const candidates = [
  { id: "c001", name: "Candidate 001", role: "Individual Contributor", level: "Entry", status: "Completed", domains: ["D1", "D2"] },
  { id: "c002", name: "Candidate 002", role: "Manager", level: "Manager", status: "In Progress", domains: ["D1"] },
  { id: "c003", name: "Candidate 003", role: "Senior Leader", level: "Executive", status: "Pending", domains: [] },
  { id: "c004", name: "Candidate 004", role: "Individual Contributor", level: "Entry", status: "Completed", domains: ["D1", "D2", "D3"] },
];

const statusVariants: Record<string, "success" | "warning" | "default"> = {
  Completed: "success",
  "In Progress": "warning",
  Pending: "default",
};

export default function CandidatesPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="mt-1 text-sm text-slate-500">All candidates in the assessment pipeline.</p>
        </div>
        <Link
          href="/assessment"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          + New Assessment
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Candidate", "Level", "Domains", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.role}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{c.level}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {c.domains.length > 0 ? (
                        c.domains.map((d) => (
                          <span
                            key={d}
                            className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-medium text-blue-700"
                          >
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariants[c.status]}>{c.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/candidates/${c.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
