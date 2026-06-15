"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BLUEPRINTS } from "@/lib/mock-data/blueprints";
import { getAssessmentBlueprintByRoleBlueprint } from "@/lib/mock-data/assessment-blueprints";
import type { RoleBlueprint, BlueprintApprovalStatus } from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BlueprintApprovalStatus, {
  label: string;
  dot: string;
  badge: string;
}> = {
  draft:     { label: "Draft",     dot: "bg-slate-500",   badge: "bg-slate-700/80 text-slate-400 border border-slate-700" },
  reviewed:  { label: "Reviewed",  dot: "bg-amber-500",   badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  approved:  { label: "Approved",  dot: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  validated: { label: "Validated", dot: "bg-indigo-400",  badge: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" },
};

const USE_CASE_LABELS: Record<string, string> = {
  developmental:                      "Developmental",
  hiring_support_validated_blueprint: "Hiring Support",
};

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
  D2: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  D4: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function bqRingColor(score: number): string {
  if (score >= 0.85) return "#10B981";
  if (score >= 0.70) return "#F59E0B";
  return "#EF4444";
}

function bqTextColor(score: number): string {
  if (score >= 0.85) return "text-emerald-400";
  if (score >= 0.70) return "text-amber-400";
  return "text-red-400";
}

// ─── Blueprint card ────────────────────────────────────────────────────────────

function BlueprintCard({ bp }: { bp: RoleBlueprint }) {
  const ab         = getAssessmentBlueprintByRoleBlueprint(bp.blueprint_id);
  const status     = STATUS_CONFIG[bp.approval_status];
  const bqPct      = Math.round(bp.blueprint_quality.composite * 100);
  const ringColor  = bqRingColor(bp.blueprint_quality.composite);
  const textColor  = bqTextColor(bp.blueprint_quality.composite);
  const isApproved = bp.approval_status === "approved" || bp.approval_status === "validated";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-800/60 bg-slate-800/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700/80 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.45)]">
      {/* Top gradient accent bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-indigo-600 via-violet-500 to-transparent" />

      <div className="flex flex-1 flex-col p-5">

        {/* Title + BQ ring + status */}
        <div className="mb-4 flex items-start gap-4">
          {/* Circular BQ score */}
          <div className="relative h-[58px] w-[58px] shrink-0">
            <div
              className="h-[58px] w-[58px] rounded-full"
              style={{
                background: `conic-gradient(from -90deg, ${ringColor} ${bqPct * 3.6}deg, #334155 ${bqPct * 3.6}deg)`,
              }}
            />
            <div className="absolute inset-[4px] flex flex-col items-center justify-center rounded-full bg-slate-800">
              <span className={`text-sm font-bold tabular-nums leading-none ${textColor}`}>{bqPct}</span>
              <span className="text-[9px] text-slate-600">BQ</span>
            </div>
          </div>

          {/* Title + meta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-white">{bp.role_context.role_title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {bp.role_context.job_level} · {bp.role_context.job_family}
                  {bp.role_context.industry ? ` · ${bp.role_context.industry}` : ""}
                </p>
              </div>
              <span className={`ml-1 flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>

            {/* Use case */}
            <div className="mt-2">
              <span className="rounded-full border border-slate-700/50 bg-slate-700/30 px-2 py-0.5 text-xs font-medium text-slate-400">
                {USE_CASE_LABELS[bp.role_context.use_case] ?? bp.role_context.use_case}
              </span>
            </div>
          </div>
        </div>

        {/* Domains + item count */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {bp.included_domains.map((d) => (
            <span key={d} className={`rounded-full px-2 py-0.5 font-mono text-xs font-bold ${DOMAIN_COLORS[d] ?? "bg-slate-700 text-slate-400"}`}>
              {d}
            </span>
          ))}
          <span className="text-xs text-slate-600">
            {bp.selected_dimensions.length} dimensions
          </span>
          {ab && (
            <>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-600">{ab.total_items} items · ~{ab.estimated_duration_min} min</span>
            </>
          )}
          {!ab && bp.blueprint_id === "bp-002" && (
            <span className="text-xs text-slate-700">Assessment pending</span>
          )}
        </div>

        {/* Separator */}
        <div className="mb-4 h-px bg-gradient-to-r from-slate-700/80 to-transparent" />

        {/* Created + BQ note */}
        <p className="mb-4 text-xs text-slate-600">
          Created {fmtDate(bp.created_at)} · BQ score {bqPct}/100
        </p>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={`/dashboard/blueprints/${bp.blueprint_id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700/60 py-2 text-xs font-semibold text-slate-300 transition-all duration-150 hover:border-slate-600/80 hover:bg-slate-700/40 hover:text-white"
          >
            View Blueprint
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          {isApproved && (
            <Link
              href="/dashboard/assessments/new"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-2 text-xs font-semibold text-white shadow-brand transition-all duration-150 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97]"
            >
              Assign Assessment
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Filter pills ──────────────────────────────────────────────────────────────

type FilterStatus = "all" | BlueprintApprovalStatus;
const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all",       label: "All"       },
  { value: "approved",  label: "Approved"  },
  { value: "validated", label: "Validated" },
  { value: "reviewed",  label: "Reviewed"  },
  { value: "draft",     label: "Draft"     },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BlueprintsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    return BLUEPRINTS.filter((bp) => {
      const matchSearch =
        search.trim() === "" ||
        bp.role_context.role_title.toLowerCase().includes(search.toLowerCase()) ||
        bp.role_context.job_family.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "all" || bp.approval_status === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  const totalApproved = BLUEPRINTS.filter((b) => b.approval_status === "approved" || b.approval_status === "validated").length;
  const totalDraft    = BLUEPRINTS.filter((b) => b.approval_status === "draft").length;

  return (
    <div className="min-h-full bg-slate-900">

      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-slate-800/70">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-900 to-slate-900" />
        <div aria-hidden className="pointer-events-none absolute -top-10 right-0 h-48 w-64 rounded-full bg-indigo-500/6 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/4 h-36 w-52 rounded-full bg-violet-500/4 blur-2xl" />

        <div className="relative px-8 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400">
                Blueprint Library
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white">Role Blueprints</h1>
              <p className="mt-1 text-sm text-slate-400">
                Agent-generated blueprints. Approved blueprints can be assigned to candidates.
              </p>
            </div>
            <Link
              href="/dashboard/agent"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              New Blueprint
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
              label: "Total Blueprints",
              value: BLUEPRINTS.length,
              valueColor: "text-white",
              accent: "from-slate-500 to-slate-600",
              iconBg: "bg-slate-700/60",
              icon: (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-300">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              ),
            },
            {
              label: "Approved / Validated",
              value: totalApproved,
              valueColor: "text-emerald-400",
              accent: "from-emerald-500 to-teal-500",
              iconBg: "bg-emerald-500/10",
              icon: (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ),
            },
            {
              label: "Draft",
              value: totalDraft,
              valueColor: "text-slate-400",
              accent: "from-slate-600 to-slate-700",
              iconBg: "bg-slate-700/50",
              icon: (
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-500">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
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

        {/* Search + filter bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <svg viewBox="0 0 20 20" fill="currentColor" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role title or job family…"
              className="w-full rounded-lg border border-slate-800/60 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all duration-150 focus:border-indigo-500/60 focus:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  filter === f.value
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-brand"
                    : "border border-slate-800/60 bg-slate-800/30 text-slate-400 hover:border-slate-700/80 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint cards grid */}
        {filtered.length === 0 ? (
          <div className="animate-scale-in flex flex-col items-center justify-center rounded-xl border border-slate-800/60 bg-slate-800/30 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-slate-600">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">No blueprints match your filters</p>
            <button
              type="button"
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map((bp) => (
              <BlueprintCard key={bp.blueprint_id} bp={bp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
