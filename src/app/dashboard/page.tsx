"use client";

import { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/providers/language-provider";
import { useStore } from "@/lib/providers/store-provider";
import { PageAmbient } from "@/components/layout/PageAmbient";
import { AssessmentFunnel } from "@/components/dashboard/AssessmentFunnel";
import { StatusDistribution } from "@/components/dashboard/StatusDistribution";
import { ReleaseStateBreakdown } from "@/components/dashboard/ReleaseStateBreakdown";
import { DomainAnalytics } from "@/components/dashboard/DomainAnalytics";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { REPORTS } from "@/lib/mock-data/reports";
import { SCORED_RESULTS } from "@/lib/mock-data/scored-results";
import {
  computeFunnel,
  computeStatusDistribution,
  computeReleaseStates,
  computeDomainAverages,
  computeActivityTimeline,
  computeKpis,
} from "@/lib/analytics/dashboard-analytics";

export default function DashboardPage() {
  const { t } = useLanguage();
  const a = t.dashboard.analytics;

  // Live assignments come from the store (includes any created via the agent flow).
  // Reports + scored results are the existing static mock data.
  const { assignments } = useStore();

  const analytics = useMemo(() => {
    return {
      kpis: computeKpis(assignments, REPORTS, SCORED_RESULTS),
      funnel: computeFunnel(assignments, REPORTS),
      status: computeStatusDistribution(assignments),
      release: computeReleaseStates(REPORTS),
      domains: computeDomainAverages(SCORED_RESULTS),
      timeline: computeActivityTimeline(assignments, REPORTS),
    };
  }, [assignments]);

  const KPI = [
    {
      label: a.kpiTotalAssignments,
      value: analytics.kpis.totalAssignments,
      delta: `${analytics.status.slices.find((s) => s.status === "not_started")?.count ?? 0} ${a.statusNotStarted.toLowerCase()}`,
      textAccent: "text-indigo-600 dark:text-indigo-400",
      bgAccent: "bg-indigo-500/10",
      accentBar: "bg-indigo-500",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
    },
    {
      label: a.kpiCompleted,
      value: analytics.kpis.completed,
      delta: `${analytics.kpis.completionRatePct}% ${a.kpiCompletionRate.toLowerCase()}`,
      textAccent: "text-emerald-600 dark:text-emerald-400",
      bgAccent: "bg-emerald-500/10",
      accentBar: "bg-emerald-500",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: a.kpiReportsReleased,
      value: analytics.kpis.reportsReleased,
      delta: `${analytics.release.total} ${analytics.release.total === 1 ? a.reportSingular : a.reportsLabel}`,
      textAccent: "text-violet-600 dark:text-violet-400",
      bgAccent: "bg-violet-500/10",
      accentBar: "bg-violet-500",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      label: a.kpiAvgScore,
      value: analytics.kpis.avgDomainScore,
      delta: `${analytics.domains.length} ${t.dashboard.colDomains.toLowerCase()}`,
      textAccent: "text-sky-600 dark:text-sky-400",
      bgAccent: "bg-sky-500/10",
      accentBar: "bg-sky-500",
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      ),
    },
  ];

  const quickActions = [
    { href: "/dashboard/agent", label: t.dashboard.actionNewAssessment, symbol: "+" },
    { href: "/dashboard/assessments/bulk", label: t.dashboard.actionBulkAssign, symbol: "+" },
    { href: "/dashboard/reports", label: t.dashboard.actionViewReports, symbol: "→" },
    { href: "/dashboard/candidates", label: t.dashboard.actionAllCandidates, symbol: "→" },
    { href: "/admin", label: t.dashboard.actionAdminPanel, symbol: "→" },
  ];

  return (
    <div className="relative min-h-full bg-slate-50 p-6 dark:bg-slate-900 sm:p-8">
      <PageAmbient />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {a.executiveOverview}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {a.commandCenterSubtitle}
          </p>
        </div>
        <Link
          href="/dashboard/agent"
          className={cn(
            "inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white",
            "bg-gradient-to-r from-indigo-600 to-violet-600",
            "shadow-brand hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg",
            "transition-all duration-200 active:scale-[0.97]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
          )}
        >
          {t.dashboard.newAssessment}
        </Link>
      </div>

      {/* ── Derived KPI cards ──────────────────────────────────────── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI.map((card, i) => (
          <div
            key={card.label}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white",
              "shadow-card transition-all duration-200 ease-spring",
              "hover:-translate-y-0.5 hover:shadow-md",
              "dark:border-slate-700/60 dark:bg-slate-800 dark:shadow-card",
              "animate-fade-in-up",
            )}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className={cn("absolute inset-x-0 top-0 h-0.5 rounded-t-xl", card.accentBar)} />
            <div className="p-5 pt-6">
              <div className="flex items-start justify-between gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {card.label}
                </p>
                <div
                  className={cn(
                    "rounded-xl p-2.5 transition-transform duration-200 ease-spring group-hover:scale-110",
                    card.bgAccent, card.textAccent,
                  )}
                >
                  {card.icon}
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </p>
              <p className={cn("mt-1.5 text-xs font-medium", card.textAccent)}>{card.delta}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Funnel + Domain analytics ──────────────────────────────── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "280ms" }}>
          <AssessmentFunnel stages={analytics.funnel} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "340ms" }}>
          <DomainAnalytics domains={analytics.domains} />
        </div>
      </div>

      {/* ── Status · Release states · Activity ─────────────────────── */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <StatusDistribution total={analytics.status.total} slices={analytics.status.slices} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "460ms" }}>
          <ReleaseStateBreakdown total={analytics.release.total} buckets={analytics.release.buckets} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "520ms" }}>
          <ActivityTimeline events={analytics.timeline} />
        </div>
      </div>

      {/* ── Quick actions + V1 release note ────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "580ms" }}>
          <div className="rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-700 dark:bg-slate-800 dark:shadow-card">
            <div className="border-b border-slate-200/80 px-6 py-4 dark:border-slate-700/60">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.dashboard.quickActions}
              </h2>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {quickActions.map((action, i) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-150",
                    i === 0
                      ? [
                          "border-indigo-200/80 bg-indigo-50/80 text-indigo-700",
                          "hover:border-indigo-300 hover:bg-indigo-100/80",
                          "dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300",
                          "dark:hover:border-indigo-500/30 dark:hover:bg-indigo-500/15",
                        ].join(" ")
                      : [
                          "border-slate-200 text-slate-600",
                          "hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                          "dark:border-slate-700 dark:text-slate-300",
                          "dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white",
                        ].join(" "),
                  )}
                >
                  <span>{action.label}</span>
                  <span className="opacity-60 transition-transform duration-150 group-hover:translate-x-0.5">
                    {action.symbol}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 dark:border-indigo-500/20 dark:bg-indigo-500/5 animate-fade-in-up"
          style={{ animationDelay: "640ms" }}
        >
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {t.dashboard.v1ReleaseStatus}
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-500 dark:text-slate-500">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              {t.dashboard.d1d4Operational}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
              {t.dashboard.d5Deferred}
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
              {t.dashboard.d6Roadmap}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
