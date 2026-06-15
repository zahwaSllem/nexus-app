"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import { useStore } from "@/lib/providers/store-provider";
import type { AssessmentAssignment } from "@/lib/types/nexus";
import { PageAmbient } from "@/components/layout/PageAmbient";

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

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
  D2: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  D4: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AssessmentsPage() {
  const { assignments } = useStore();
  const total     = assignments.length;
  const pending   = assignments.filter((a) => a.status === "not_started" || a.status === "in_progress").length;
  const completed = assignments.filter((a) => a.status === "completed").length;

  return (
    <div className="relative min-h-full bg-slate-900">
      <PageAmbient />

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-800/70">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900 to-slate-900" />
        <div aria-hidden className="pointer-events-none absolute -top-10 right-0 h-48 w-64 rounded-full bg-indigo-500/6 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 right-1/3 h-32 w-48 rounded-full bg-violet-500/4 blur-2xl" />

        <div className="relative px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">
                Assessments
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white">Assessment Assignments</h1>
              <p className="mt-1 text-sm text-slate-400">
                Manage and track all candidate assessment sessions.
              </p>
            </div>
            <Link
              href="/dashboard/assessments/new"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Assignment
            </Link>
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
              label: "In Progress / Pending",
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
              label: "Completed",
              value: completed,
              valueColor: "text-emerald-400",
              accent: "from-emerald-500 to-teal-500",
              iconBg: "bg-emerald-500/10",
              icon: (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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

        {/* Table */}
        <div className="animate-scale-in overflow-hidden rounded-xl border border-slate-800/60 bg-slate-800/40">
          {/* Table toolbar */}
          <div className="border-b border-slate-800/80 bg-slate-800/60 px-5 py-3">
            <p className="text-xs font-semibold text-slate-400">
              {total} assignment{total !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {["Candidate", "Blueprint / Role", "Use Case", "Status", "Deadline", "Assigned", "Actions"].map((h) => (
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
                {assignments.map((a) => {
                  const blueprint = blueprintMap.get(a.blueprint_id);
                  const statusCfg = STATUS_BADGE[a.status];

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
                          <div>
                            <p className="text-sm text-slate-200">{blueprint.role_context.role_title}</p>
                            <div className="mt-1 flex gap-1">
                              {blueprint.included_domains.map((d) => (
                                <span
                                  key={d}
                                  className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold ${DOMAIN_COLORS[d] ?? "bg-slate-700 text-slate-400"}`}
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
                        <span className="rounded-full border border-slate-700/60 bg-slate-700/40 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                          {USE_CASE_LABELS[a.use_case] ?? a.use_case}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
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
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300"
                          >
                            Candidate
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </Link>
                          {a.status === "completed" && (
                            <Link
                              href="/dashboard/reports/demo-report"
                              className="flex items-center gap-1 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                            >
                              Results
                              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
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

          <div className="border-t border-slate-800/60 bg-slate-800/30 px-5 py-3">
            <p className="text-xs text-slate-600">
              Mock mode · New assignments reset on refresh
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
