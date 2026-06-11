"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import { useStore } from "@/lib/providers/store-provider";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const blueprintMap = new Map(BLUEPRINTS.map((b) => [b.blueprint_id, b]));

const USE_CASE_LABELS: Record<string, string> = {
  developmental:                     "Developmental",
  hiring_support_validated_blueprint: "Hiring Support",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { assignments } = useStore();
  const completed = assignments.filter((a) => a.status === "completed");

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
            Assessment reports for completed assignments.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-amber-400">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-amber-300">Mock data · Not scientifically validated</span>
        </div>
      </div>

      {/* Summary stat */}
      <div className="mb-6">
        <div className="inline-flex rounded-xl border border-slate-700 bg-slate-800 px-5 py-4">
          <div>
            <p className="text-xs text-slate-500">Available</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{completed.length}</p>
          </div>
        </div>
      </div>

      {/* Reports table or empty state */}
      {completed.length === 0 ? (

        <div className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6 text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-400">No reports generated yet.</p>
          <p className="mt-1 text-xs text-slate-600">
            Reports appear after candidates complete their assessments.
          </p>
        </div>

      ) : (

        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  {["Candidate", "Blueprint / Role", "Use Case", "Domains", "Completed", "Status", ""].map((h) => (
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
                {completed.map((a) => {
                  const blueprint = blueprintMap.get(a.blueprint_id);
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
                          <p className="text-sm text-slate-200">{blueprint.role_context.role_title}</p>
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

                      {/* Domains */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(blueprint?.included_domains ?? []).map((d) => (
                            <span
                              key={d}
                              className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-300"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Completed date */}
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {a.completed_at ? fmtDate(a.completed_at) : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge variant="success">Available</Badge>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <Link
                          href="/dashboard/reports/demo-report"
                          className="text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-700 bg-slate-800/60 px-5 py-3">
            <p className="text-xs text-slate-600">
              {completed.length} report{completed.length !== 1 ? "s" : ""} · Mock mode: reports are generated only for completed mock assignments.
            </p>
          </div>
        </div>

      )}
    </div>
  );
}
