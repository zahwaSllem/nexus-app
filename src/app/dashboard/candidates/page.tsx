"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useStore } from "@/lib/providers/store-provider";
import type { AssignmentStatus } from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<
  AssignmentStatus,
  { label: string; variant: "success" | "warning" | "default" | "info" }
> = {
  not_started: { label: "Not Started", variant: "default"  },
  in_progress:  { label: "In Progress", variant: "warning"  },
  completed:    { label: "Completed",   variant: "success"  },
  expired:      { label: "Expired",     variant: "info"     },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CandidatesPage() {
  const { candidates } = useStore();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Candidates</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            All candidates in the assessment pipeline.
          </p>
        </div>
        <Link
          href="/dashboard/assessments/new"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          + New Assignment
        </Link>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700">
                {["Candidate", "Domains", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {candidates.map((c) => {
                const statusCfg = STATUS_BADGE[c.latest_status];
                return (
                  <tr key={c.candidate_id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{c.candidate_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.candidate_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {c.domains.length > 0 ? (
                          c.domains.map((d) => (
                            <span
                              key={d}
                              className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
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
                      <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/candidates/${c.candidate_id}`}
                        className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3 dark:border-slate-700 dark:bg-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-600">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} · Mock mode: new assignments reset on refresh.
          </p>
        </div>
      </Card>
    </div>
  );
}
