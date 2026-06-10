import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

// ─── Mock data ─────────────────────────────────────────────────────────────────

const REPORTS = [
  {
    id: "demo-report",
    reference: "NSX-2026-0042",
    candidate: "Alex Jordan",
    candidateId: "C-007",
    jobTitle: "Software Engineer",
    level: "Entry / IC",
    useCase: "Hiring",
    domains: ["D1", "D2", "D3", "D4"],
    generated: "Jun 9, 2026",
    status: "Available",
  },
  {
    id: "r-002",
    reference: "NSX-2026-0038",
    candidate: "Maya Chen",
    candidateId: "C-003",
    jobTitle: "Product Manager",
    level: "Manager",
    useCase: "Development",
    domains: ["D1", "D2"],
    generated: "Jun 7, 2026",
    status: "Available",
  },
  {
    id: "r-003",
    reference: "NSX-2026-0031",
    candidate: "Omar Khalil",
    candidateId: "C-011",
    jobTitle: "Data Analyst",
    level: "Entry / IC",
    useCase: "Hiring",
    domains: ["D1", "D2", "D3"],
    generated: "Jun 5, 2026",
    status: "Available",
  },
  {
    id: "r-004",
    reference: "NSX-2026-0044",
    candidate: "Sarah Mitchell",
    candidateId: "C-014",
    jobTitle: "UX Designer",
    level: "Senior / Expert",
    useCase: "Hiring",
    domains: ["D1", "D2"],
    generated: "—",
    status: "Processing",
  },
  {
    id: "r-005",
    reference: "NSX-2026-0047",
    candidate: "James Okafor",
    candidateId: "C-019",
    jobTitle: "Engineering Manager",
    level: "Manager",
    useCase: "Succession",
    domains: ["D1", "D2", "D4"],
    generated: "—",
    status: "Processing",
  },
  {
    id: "r-006",
    reference: "NSX-2026-0051",
    candidate: "Priya Sharma",
    candidateId: "C-022",
    jobTitle: "Software Engineer",
    level: "Entry / IC",
    useCase: "Hiring",
    domains: ["D1"],
    generated: "—",
    status: "Pending",
  },
];

const STATUS_VARIANT: Record<string, "success" | "warning" | "default"> = {
  Available: "success",
  Processing: "warning",
  Pending: "default",
};

const USE_CASE_COLORS: Record<string, string> = {
  Hiring:     "bg-blue-500/10 text-blue-300",
  Development:"bg-violet-500/10 text-violet-300",
  Succession: "bg-emerald-500/10 text-emerald-300",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const available = REPORTS.filter((r) => r.status === "Available").length;
  const processing = REPORTS.filter((r) => r.status === "Processing").length;
  const pending = REPORTS.filter((r) => r.status === "Pending").length;

  return (
    <div className="min-h-full bg-slate-900 p-8">

      {/* Page header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-sm text-slate-400">
            Generated assessment reports by candidate and use case.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-amber-400">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-amber-300">Mock data · Not scientifically validated</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Available",  value: available,  color: "text-emerald-400" },
          { label: "Processing", value: processing, color: "text-amber-400" },
          { label: "Pending",    value: pending,    color: "text-slate-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4"
          >
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Reports table */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {["Candidate", "Reference", "Use Case", "Level", "Domains", "Generated", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {REPORTS.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-slate-700/30">

                  {/* Candidate */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-white">{r.candidate}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">{r.candidateId} · {r.jobTitle}</p>
                  </td>

                  {/* Reference */}
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">{r.reference}</td>

                  {/* Use case */}
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${USE_CASE_COLORS[r.useCase] ?? "bg-slate-700 text-slate-300"}`}>
                      {r.useCase}
                    </span>
                  </td>

                  {/* Level */}
                  <td className="px-5 py-4 text-xs text-slate-400">{r.level}</td>

                  {/* Domains */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {r.domains.map((d) => (
                        <span
                          key={d}
                          className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-300"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Generated date */}
                  <td className="px-5 py-4 text-xs text-slate-400">{r.generated}</td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <Badge dark variant={STATUS_VARIANT[r.status] ?? "default"}>{r.status}</Badge>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">
                    {r.id === "demo-report" ? (
                      <Link
                        href={`/dashboard/reports/${r.id}`}
                        className="text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
                      >
                        Open →
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-700 bg-slate-800/60 px-5 py-3">
          <p className="text-xs text-slate-500">{REPORTS.length} reports total · Mock data only</p>
        </div>
      </div>
    </div>
  );
}
