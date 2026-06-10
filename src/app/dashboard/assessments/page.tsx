import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ASSIGNMENTS } from "@/lib/mock-data/assignments";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import type { AssessmentAssignment } from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const blueprintMap = new Map(BLUEPRINTS.map((b) => [b.blueprint_id, b]));

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_BADGE: Record<
  AssessmentAssignment["status"],
  { label: string; variant: "success" | "warning" | "default" | "info" }
> = {
  not_started: { label: "Not Started",  variant: "default"  },
  in_progress:  { label: "In Progress", variant: "warning"  },
  completed:    { label: "Completed",   variant: "success"  },
  expired:      { label: "Expired",     variant: "info"     },
};

const USE_CASE_LABELS: Record<string, string> = {
  developmental:                     "Developmental",
  hiring_support_validated_blueprint: "Hiring Support",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AssessmentsPage() {
  const total     = ASSIGNMENTS.length;
  const pending   = ASSIGNMENTS.filter((a) => a.status === "not_started" || a.status === "in_progress").length;
  const completed = ASSIGNMENTS.filter((a) => a.status === "completed").length;

  return (
    <div className="min-h-full bg-slate-900 p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Assessments</h1>
          <p className="mt-1 text-sm text-slate-400">
            All candidate assessment assignments.
          </p>
        </div>
        <Link
          href="/dashboard/assessments/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Assignment
        </Link>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total",     value: total,     color: "text-white"         },
          { label: "Pending",   value: pending,   color: "text-amber-400"     },
          { label: "Completed", value: completed, color: "text-emerald-400"   },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                {["Candidate", "Blueprint / Role", "Use Case", "Status", "Deadline", "Assigned", "Actions"].map((h) => (
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
              {ASSIGNMENTS.map((a) => {
                const blueprint = blueprintMap.get(a.blueprint_id);
                const statusCfg = STATUS_BADGE[a.status];

                return (
                  <tr key={a.assignment_id} className="transition-colors hover:bg-slate-700/30">

                    {/* Candidate */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-white">{a.candidate_name}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">{a.candidate_email}</p>
                    </td>

                    {/* Blueprint */}
                    <td className="px-5 py-4">
                      {blueprint ? (
                        <div>
                          <p className="text-sm text-slate-200">{blueprint.role_context.role_title}</p>
                          <div className="mt-1 flex gap-1">
                            {blueprint.included_domains.map((d) => (
                              <span
                                key={d}
                                className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-300"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-slate-600">{a.blueprint_id}</span>
                      )}
                    </td>

                    {/* Use case */}
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                        {USE_CASE_LABELS[a.use_case] ?? a.use_case}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <Badge dark variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </td>

                    {/* Deadline */}
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {fmtDate(a.deadline)}
                    </td>

                    {/* Assigned */}
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {fmtDate(a.assigned_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/candidates/${a.candidate_id}`}
                          className="text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
                        >
                          Candidate →
                        </Link>
                        {a.status === "completed" && (
                          <Link
                            href="/dashboard/reports/demo-report"
                            className="text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                          >
                            Results →
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-700 bg-slate-800/60 px-5 py-3">
          <p className="text-xs text-slate-600">
            {total} assignment{total !== 1 ? "s" : ""} · Mock data only — new assignments reset on page refresh
          </p>
        </div>
      </div>

    </div>
  );
}
