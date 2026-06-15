"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import { useStore } from "@/lib/providers/store-provider";
import { PageAmbient } from "@/components/layout/PageAmbient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const blueprintMap = new Map(BLUEPRINTS.map((b) => [b.blueprint_id, b]));

const USE_CASE_LABELS: Record<string, string> = {
  developmental:                     "Developmental",
  hiring_support_validated_blueprint: "Hiring Support",
};

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
  D2: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  D4: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
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
  const total = assignments.length;
  const pending = assignments.filter((a) => a.status === "not_started" || a.status === "in_progress").length;

  return (
    <div className="relative min-h-full bg-slate-900">
      <PageAmbient />

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-800/70">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900 to-slate-900" />
        <div aria-hidden className="pointer-events-none absolute -top-12 right-0 h-48 w-64 rounded-full bg-indigo-500/6 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-48 rounded-full bg-violet-500/4 blur-2xl" />

        <div className="relative px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">
                Reports
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white">Assessment Reports</h1>
              <p className="mt-1 text-sm text-slate-400">
                Results for all completed candidate assessments.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-amber-400">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-amber-300">Mock data · Not scientifically validated</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="px-8 py-7">

        {/* KPI cards */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Total Assignments",
              value: total,
              valueColor: "text-white",
              accent: "from-slate-500 to-slate-600",
              iconBg: "bg-slate-700/60",
              icon: (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-300">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                </svg>
              ),
            },
            {
              label: "Pending",
              value: pending,
              valueColor: "text-amber-400",
              accent: "from-amber-500 to-orange-500",
              iconBg: "bg-amber-500/10",
              icon: (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-amber-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              ),
            },
            {
              label: "Reports Available",
              value: completed.length,
              valueColor: "text-emerald-400",
              accent: "from-emerald-500 to-teal-500",
              iconBg: "bg-emerald-500/10",
              icon: (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                </svg>
              ),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border border-slate-800/60 bg-slate-800/50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700/80 hover:shadow-lg hover:shadow-slate-950/40"
            >
              <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${stat.accent}`} />
              <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className={`mt-1 text-3xl font-bold tabular-nums ${stat.valueColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Reports table / empty state */}
        {completed.length === 0 ? (

          <div className="animate-scale-in overflow-hidden rounded-xl border border-slate-800/60 bg-slate-800/40">
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-slate-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-300">No reports yet</p>
              <p className="mt-1.5 max-w-sm text-sm text-slate-600">
                Reports appear here once candidates complete their assessments.
              </p>
              <Link
                href="/dashboard/assessments"
                className="mt-5 flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg"
              >
                View Assessments
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

        ) : (

          <div className="animate-scale-in overflow-hidden rounded-xl border border-slate-800/60 bg-slate-800/40">
            {/* Table header */}
            <div className="border-b border-slate-800/80 bg-slate-800/60 px-5 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400">
                  {completed.length} report{completed.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/60">
                    {["Candidate", "Blueprint / Role", "Use Case", "Domains", "Completed", "Status", ""].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {completed.map((a) => {
                    const blueprint = blueprintMap.get(a.blueprint_id);
                    return (
                      <tr key={a.assignment_id} className="group relative transition-colors duration-150 hover:bg-slate-800/50">

                        {/* Candidate */}
                        <td className="relative px-5 py-4">
                          <span className="absolute inset-y-0 left-0 w-0.5 bg-indigo-500 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
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
                          <span className="rounded-full border border-slate-700/60 bg-slate-700/40 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                            {USE_CASE_LABELS[a.use_case] ?? a.use_case}
                          </span>
                        </td>

                        {/* Domains */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(blueprint?.included_domains ?? []).map((d) => (
                              <span
                                key={d}
                                className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold ${DOMAIN_COLORS[d] ?? "bg-slate-700 text-slate-400"}`}
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
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                          >
                            Open report
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-800/60 bg-slate-800/30 px-5 py-3">
              <p className="text-xs text-slate-600">
                Mock mode · Reports generated for completed assignments only
              </p>
            </div>
          </div>

        )}
      </div>
    </div>
  );
}
