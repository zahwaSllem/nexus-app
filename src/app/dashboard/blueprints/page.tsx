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
  draft:     { label: "Draft",     dot: "bg-slate-500",   badge: "bg-slate-700 text-slate-400" },
  reviewed:  { label: "Reviewed",  dot: "bg-amber-500",   badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30" },
  approved:  { label: "Approved",  dot: "bg-emerald-500", badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" },
  validated: { label: "Validated", dot: "bg-blue-500",    badge: "bg-blue-500/15 text-blue-400 border border-blue-500/30" },
};

const USE_CASE_LABELS: Record<string, string> = {
  developmental:                      "Developmental",
  hiring_support_validated_blueprint: "Hiring Support",
};

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
  D2: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  D4: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function bqColor(score: number): { text: string; bar: string } {
  if (score >= 0.85) return { text: "text-emerald-400", bar: "bg-emerald-500" };
  if (score >= 0.70) return { text: "text-amber-400",   bar: "bg-amber-500"   };
  return                    { text: "text-red-400",     bar: "bg-red-500"     };
}

// ─── Blueprint card ────────────────────────────────────────────────────────────

function BlueprintCard({ bp }: { bp: RoleBlueprint }) {
  const ab       = getAssessmentBlueprintByRoleBlueprint(bp.blueprint_id);
  const status   = STATUS_CONFIG[bp.approval_status];
  const bqPct    = Math.round(bp.blueprint_quality.composite * 100);
  const bqc      = bqColor(bp.blueprint_quality.composite);
  const isApproved = bp.approval_status === "approved" || bp.approval_status === "validated";

  return (
    <div className="flex flex-col rounded-xl border border-slate-700 bg-slate-800 p-5 transition-shadow hover:shadow-md hover:shadow-slate-950/40">

      {/* Title + status */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{bp.role_context.role_title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {bp.role_context.job_level} · {bp.role_context.job_family}
            {bp.role_context.industry ? ` · ${bp.role_context.industry}` : ""}
          </p>
        </div>
        <span className={`shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Use case */}
      <div className="mb-3">
        <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-400">
          {USE_CASE_LABELS[bp.role_context.use_case] ?? bp.role_context.use_case}
        </span>
      </div>

      {/* Domains + item count */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
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
          <span className="text-xs text-slate-600">Assessment blueprint pending</span>
        )}
      </div>

      {/* BQ score */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-slate-500">Blueprint Quality</span>
          <span className={`font-mono text-xs font-bold ${bqc.text}`}>{bqPct}/100</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
          <div className={`h-1.5 rounded-full ${bqc.bar}`} style={{ width: `${bqPct}%` }} />
        </div>
      </div>

      {/* Created */}
      <p className="mb-4 text-xs text-slate-600">Created {fmtDate(bp.created_at)}</p>

      {/* Actions */}
      <div className="mt-auto flex flex-col gap-2">
        <Link
          href={`/dashboard/blueprints/${bp.blueprint_id}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
        >
          View Blueprint
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        {isApproved && (
          <Link
            href="/dashboard/assessments/new"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-700 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
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
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState<FilterStatus>("all");

  const filtered = useMemo(() => {
    return BLUEPRINTS.filter((bp) => {
      const matchSearch =
        search.trim() === "" ||
        bp.role_context.role_title.toLowerCase().includes(search.toLowerCase()) ||
        bp.role_context.job_family.toLowerCase().includes(search.toLowerCase());

      const matchFilter =
        filter === "all" || bp.approval_status === filter;

      return matchSearch && matchFilter;
    });
  }, [search, filter]);

  const totalApproved = BLUEPRINTS.filter((b) => b.approval_status === "approved" || b.approval_status === "validated").length;
  const totalDraft    = BLUEPRINTS.filter((b) => b.approval_status === "draft").length;

  return (
    <div className="min-h-full bg-slate-900 p-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Blueprint Library</h1>
          <p className="mt-1 text-sm text-slate-400">
            Agent-generated role blueprints. Approved blueprints can be assigned to candidates.
          </p>
        </div>
        <Link
          href="/dashboard/agent"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          New Blueprint
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total",    value: BLUEPRINTS.length, color: "text-white"       },
          { label: "Approved", value: totalApproved,     color: "text-emerald-400" },
          { label: "Draft",    value: totalDraft,        color: "text-slate-400"   },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-4">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + filter */}
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
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-blue-700 text-white"
                  : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blueprint cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/50 py-16 text-center">
          <svg viewBox="0 0 20 20" fill="currentColor" className="mb-3 h-8 w-8 text-slate-600">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-slate-500">No blueprints match your search.</p>
          <button
            type="button"
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300"
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
  );
}
