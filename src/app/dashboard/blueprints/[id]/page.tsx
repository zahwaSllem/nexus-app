import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlueprintById } from "@/lib/mock-data/blueprints";
import { getAssessmentBlueprintByRoleBlueprint } from "@/lib/mock-data/assessment-blueprints";
import { getBankItemById } from "@/lib/mock-data/question-bank";
import { BlueprintStatusStepper } from "@/components/agent/BlueprintStatusStepper";
import { ItemContextCard } from "@/components/agent/ItemContextCard";
import type { GovernanceSeverity } from "@/lib/types/nexus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
  D2: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  D4: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
};

const DOMAIN_NAMES: Record<string, string> = {
  D1: "Personality Architecture",
  D2: "Cognitive Architecture",
  D4: "Interpersonal and Emotional Functioning",
};

const SEVERITY_CONFIG: Record<GovernanceSeverity, { border: string; icon: string; badge: string; label: string }> = {
  blocking: { border: "border-red-500/40",    icon: "text-red-400",    badge: "bg-red-500/15 text-red-400 border border-red-500/30",       label: "Blocking" },
  caution:  { border: "border-amber-500/30",  icon: "text-amber-400",  badge: "bg-amber-500/15 text-amber-400 border border-amber-500/30", label: "Caution"  },
  info:     { border: "border-blue-500/25",   icon: "text-blue-400",   badge: "bg-blue-500/15 text-blue-400 border border-blue-500/30",    label: "Info"     },
};

const USE_CASE_LABELS: Record<string, string> = {
  developmental:                      "Developmental Feedback",
  hiring_support_validated_blueprint: "Hiring Support — Validated Blueprint",
};

const CONTEXT_FIELDS: Array<{ key: string; label: string; max: number }> = [
  { key: "ambiguity_level",            label: "Ambiguity Level",              max: 5 },
  { key: "decision_stakes",            label: "Decision Stakes",              max: 5 },
  { key: "time_pressure",              label: "Time Pressure",                max: 5 },
  { key: "regulatory_constraint",      label: "Regulatory Constraint",        max: 5 },
  { key: "autonomy_level",             label: "Autonomy Level",               max: 5 },
  { key: "stakeholder_complexity",     label: "Stakeholder Complexity",       max: 5 },
  { key: "interdependence_level",      label: "Interdependence Level",        max: 5 },
  { key: "innovation_demand",          label: "Innovation Demand",            max: 5 },
  { key: "execution_precision_demand", label: "Execution Precision Demand",   max: 5 },
  { key: "customer_exposure",          label: "Customer Exposure",            max: 5 },
  { key: "conflict_load",              label: "Conflict Load",                max: 5 },
  { key: "change_velocity",            label: "Change Velocity",              max: 5 },
  { key: "failure_cost",               label: "Failure Cost",                 max: 5 },
  { key: "leadership_scope",           label: "Leadership Scope",             max: 4 },
];

const BQ_COMPONENTS: Array<{ key: string; label: string; weight: string }> = [
  { key: "evidence_completeness",  label: "Evidence Completeness",  weight: "30%" },
  { key: "construct_clarity",      label: "Construct Clarity",      weight: "25%" },
  { key: "sme_agreement",          label: "SME Agreement",          weight: "20%" },
  { key: "weight_justification",   label: "Weight Justification",   weight: "15%" },
  { key: "role_level_specificity", label: "Role-Level Specificity", weight: "10%" },
];

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function bqColor(score: number) {
  if (score >= 0.85) return { text: "text-emerald-400", bar: "bg-emerald-500" };
  if (score >= 0.70) return { text: "text-amber-400",   bar: "bg-amber-500"   };
  return                    { text: "text-red-400",     bar: "bg-red-500"     };
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-500">
        {title}
        <span className="h-px flex-1 bg-slate-800" />
      </h2>
      {children}
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

export default function BlueprintDetailPage({ params }: PageProps) {
  const bp = getBlueprintById(params.id);
  if (!bp) notFound();

  const ab            = getAssessmentBlueprintByRoleBlueprint(bp.blueprint_id);
  const isApproved    = bp.approval_status === "approved" || bp.approval_status === "validated";
  const bqPct         = Math.round(bp.blueprint_quality.composite * 100);
  const bqc           = bqColor(bp.blueprint_quality.composite);

  // Group dimensions by domain
  const byDomain: Record<string, typeof bp.selected_dimensions> = {};
  for (const dim of bp.selected_dimensions) {
    if (!byDomain[dim.domain_id]) byDomain[dim.domain_id] = [];
    byDomain[dim.domain_id].push(dim);
  }

  return (
    <div className="min-h-full bg-slate-50 p-8 dark:bg-slate-900">

      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard/blueprints"
          className="flex w-fit items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Blueprint Library
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            Role Blueprint
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">{bp.role_context.role_title}</h1>
          <p className="mt-0.5 text-sm text-slate-400">
            {bp.role_context.job_level} · {bp.role_context.job_family}
            {bp.role_context.industry ? ` · ${bp.role_context.industry}` : ""}
          </p>
          <div className="mt-2">
            <BlueprintStatusStepper status={bp.approval_status} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isApproved ? (
            <Link
              href="/dashboard/assessments/new"
              className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Assign Assessment
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          ) : (
            <div className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-500">
              Approval required to assign
            </div>
          )}
          <span className="font-mono text-xs text-slate-600">{bp.blueprint_id}</span>
        </div>
      </div>

      <div className="space-y-10">

        {/* ── 1. Role Context ─────────────────────────────────────── */}
        <Section title="Role Context">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Job Family",          value: bp.role_context.job_family },
                { label: "Job Level",           value: bp.role_context.job_level },
                { label: "Decision Authority",  value: bp.role_context.decision_authority_level.charAt(0).toUpperCase() + bp.role_context.decision_authority_level.slice(1) },
                { label: "Use Case",            value: USE_CASE_LABELS[bp.role_context.use_case] ?? bp.role_context.use_case },
                { label: "Team Scope",          value: bp.role_context.team_scope },
                { label: "Blueprint ID",        value: bp.blueprint_id },
              ].map((row) => (
                <div key={row.label} className="rounded-lg bg-slate-700/30 px-4 py-3">
                  <p className="text-xs text-slate-500">{row.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">{row.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-slate-500">Key Responsibilities</p>
              <ul className="space-y-1.5">
                {bp.role_context.key_responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span className="text-sm text-slate-300">{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {bp.role_context.environmental_notes && (
              <div className="rounded-lg border border-slate-700/50 bg-slate-700/20 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">Environmental Context</p>
                <p className="mt-1 text-sm text-slate-400">{bp.role_context.environmental_notes}</p>
              </div>
            )}
          </div>
        </Section>

        {/* ── 2. Critical Success Profile ────────────────────────── */}
        <Section title="Critical Success Profile">
          <div className="space-y-3">
            {bp.context_profile.success_profile_notes ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4">
                <p className="mb-1 text-xs font-medium text-emerald-400">Success Looks Like</p>
                <p className="text-sm leading-relaxed text-slate-300">{bp.context_profile.success_profile_notes}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-5 py-4">
                <p className="text-xs text-slate-600">Success profile notes not yet defined for this blueprint.</p>
              </div>
            )}
            {/* Disqualifying traits placeholder — not in current data model */}
            <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 px-5 py-4">
              <p className="mb-1 text-xs font-medium text-slate-500">Disqualifying Traits</p>
              <p className="text-xs text-slate-600">
                Disqualifying trait profiles are not yet defined for this blueprint. They will be configured during the validation phase.
              </p>
            </div>
          </div>
        </Section>

        {/* ── 3. Selected Domains & Dimensions ─────────────────────── */}
        <Section title={`Selected Domains & Dimensions (${bp.selected_dimensions.length})`}>
          <div className="space-y-4">
            {Object.entries(byDomain).map(([domainId, dims]) => (
              <div key={domainId} className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-3 border-b border-slate-700/60 px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${DOMAIN_COLORS[domainId] ?? "bg-slate-700 text-slate-400"}`}>
                    {domainId}
                  </span>
                  <span className="text-sm font-semibold text-white">{DOMAIN_NAMES[domainId] ?? domainId}</span>
                  <span className="ml-auto text-xs text-slate-600">{dims.length} dimension{dims.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-slate-700/40">
                  {dims.map((dim) => (
                    <div key={dim.dimension_id} className="px-5 py-3">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{dim.dimension_id}</span>
                        <span className="text-sm font-medium text-slate-200">{dim.dimension_name}</span>
                      </div>
                      <p className="mt-0.5 text-xs italic text-slate-600">{dim.selection_rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4. Context Profile ────────────────────────────────────── */}
        <Section title="Context Profile — 17 Fields">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <p className="mb-4 text-xs text-slate-500">
              These values define the role environment for Domain 6 contextual alignment scoring (deferred to Phase 2).
            </p>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Context Name", value: bp.context_profile.context_name },
                { label: "Job Family",   value: bp.context_profile.job_family   },
                { label: "Job Level",    value: bp.context_profile.job_level    },
              ].map((row) => (
                <div key={row.label} className="rounded-lg bg-slate-700/40 px-3 py-2.5">
                  <p className="text-xs text-slate-500">{row.label}</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {CONTEXT_FIELDS.map(({ key, label, max }) => {
                const raw = (bp.context_profile as unknown as Record<string, number>)[key] ?? 0;
                const pct = (raw / max) * 100;
                return (
                  <div key={key} className="rounded-lg bg-slate-700/20 px-3 py-2.5">
                    <p className="text-xs text-slate-500">{label}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-700">
                        <div className="h-1 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right font-mono text-xs font-bold text-slate-300">
                        {raw}/{max}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ── 5. Blueprint Quality Score ────────────────────────────── */}
        <Section title="Blueprint Quality Score">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">BQ Formula: 0.30E + 0.25C + 0.20S + 0.15W + 0.10R</p>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-bold tabular-nums ${bqc.text}`}>{bqPct}</span>
                <span className="text-slate-600">/100</span>
              </div>
            </div>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-700">
              <div className={`h-2 rounded-full ${bqc.bar}`} style={{ width: `${bqPct}%` }} />
            </div>
            <div className="space-y-2.5">
              {BQ_COMPONENTS.map(({ key, label, weight }) => {
                const val = (bp.blueprint_quality as unknown as Record<string, number>)[key] ?? 0;
                const pct = Math.round(val * 100);
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-44 text-xs text-slate-400">{label}</span>
                    <div className="flex flex-1 items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className={`h-1 rounded-full ${pct >= 85 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-xs text-slate-400">{pct}%</span>
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-slate-600">{weight}</span>
                  </div>
                );
              })}
            </div>
            <div className={`mt-4 rounded-lg border px-4 py-2.5 ${bqPct >= 85 ? "border-emerald-500/20 bg-emerald-500/5" : bqPct >= 70 ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5"}`}>
              <p className={`text-xs ${bqPct >= 85 ? "text-emerald-400" : bqPct >= 70 ? "text-amber-400" : "text-red-400"}`}>
                {bqPct >= 85
                  ? "Strong blueprint — approved for operational role-fit scoring."
                  : bqPct >= 70
                  ? "Adequate blueprint — exploratory or development-only role fit."
                  : "Weak blueprint — role-fit output blocked until quality improves."}
              </p>
            </div>

            {/* Approval record */}
            {bp.approved_at && (
              <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-700/50 pt-4">
                <div>
                  <p className="text-xs text-slate-500">Approved</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-300">{fmtDate(bp.approved_at)}</p>
                </div>
                {bp.approved_by && (
                  <div>
                    <p className="text-xs text-slate-500">Approved by</p>
                    <p className="mt-0.5 font-mono text-xs font-medium text-slate-300">{bp.approved_by}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="mt-0.5 text-xs font-medium text-slate-300">{fmtDate(bp.created_at)}</p>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ── 6. Governance Warnings ────────────────────────────────── */}
        <Section title={`Governance Warnings (${bp.governance_warnings.length})`}>
          <div className="space-y-3">
            {[...bp.governance_warnings]
              .sort((a, b) => {
                const order = { blocking: 0, caution: 1, info: 2 };
                return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
              })
              .map((warning) => {
                const cfg = SEVERITY_CONFIG[warning.severity];
                return (
                  <div key={warning.code} className={`rounded-xl border bg-slate-800 p-4 ${cfg.border}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <span className={`font-mono text-xs font-bold ${cfg.icon}`}>{warning.code}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">{warning.message}</p>
                    {warning.nexus_rule && (
                      <p className="mt-1.5 text-xs text-slate-600">
                        Rule: <span className="font-mono">{warning.nexus_rule}</span>
                      </p>
                    )}
                    {warning.affected_dimension_ids && warning.affected_dimension_ids.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {warning.affected_dimension_ids.map((d) => (
                          <span key={d} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-xs text-slate-400">{d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </Section>

        {/* ── 7. Assessment Blueprint ───────────────────────────────── */}
        {ab ? (
          <Section title={`Assessment Blueprint — ${ab.total_items} Items · ~${ab.estimated_duration_min} min`}>
            {/* Summary */}
            <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {ab.domain_coverage.map((dc) => (
                  <span key={dc.domain_id} className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${DOMAIN_COLORS[dc.domain_id] ?? "bg-slate-700 text-slate-400"}`}>
                    {dc.domain_id} · {dc.item_count}
                  </span>
                ))}
                {Object.entries(ab.method_mix)
                  .filter(([, count]) => count > 0)
                  .map(([method, count]) => (
                    <span key={method} className="rounded-lg border border-slate-700 bg-slate-700/30 px-2.5 py-1 text-xs text-slate-400">
                      {method.replace(/_/g, " ")} · {count}
                    </span>
                  ))}
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{ab.agent_selection_rationale}</p>
            </div>

            {/* Items grouped by domain → dimension */}
            {(() => {
              // Group contextualized items by bankItem domain/dimension
              const groups: Record<string, {
                domain_name: string;
                dims: Record<string, {
                  dim_name: string;
                  items: Array<{ ci: typeof ab.contextualized_items[0]; bi: NonNullable<ReturnType<typeof getBankItemById>> }>;
                }>;
              }> = {};

              for (const ci of ab.contextualized_items) {
                const bi = getBankItemById(ci.item_id);
                if (!bi) continue;
                if (!groups[bi.domain_id]) {
                  groups[bi.domain_id] = { domain_name: bi.domain_name, dims: {} };
                }
                if (!groups[bi.domain_id].dims[bi.dimension_id]) {
                  groups[bi.domain_id].dims[bi.dimension_id] = { dim_name: bi.dimension_name, items: [] };
                }
                groups[bi.domain_id].dims[bi.dimension_id].items.push({ ci, bi });
              }

              return (
                <div className="space-y-6">
                  {Object.entries(groups).map(([domainId, domainGroup]) => (
                    <div key={domainId}>
                      {/* Domain header */}
                      <div className="mb-3 flex items-center gap-3">
                        <span className={`rounded-full px-3 py-0.5 font-mono text-xs font-bold ${DOMAIN_COLORS[domainId] ?? "bg-slate-700 text-slate-400"}`}>
                          {domainId}
                        </span>
                        <span className="text-sm font-semibold text-white">{domainGroup.domain_name}</span>
                        <div className="h-px flex-1 bg-slate-800" />
                      </div>

                      {/* Dimensions */}
                      {Object.entries(domainGroup.dims).map(([dimId, dimGroup]) => (
                        <div key={dimId} className="mb-4 pl-4">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-600">{dimId}</span>
                            <span className="text-xs font-medium text-slate-500">{dimGroup.dim_name}</span>
                            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-600">
                              {dimGroup.items.length} item{dimGroup.items.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {dimGroup.items.map(({ ci, bi }) => (
                              <ItemContextCard key={ci.item_id} item={ci} bankItem={bi} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </Section>
        ) : (
          <Section title="Assessment Blueprint">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 px-5 py-6 text-center">
              <p className="text-sm text-slate-500">
                No assessment blueprint has been generated for this role blueprint yet.
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Run the agent interview to generate a full assessment blueprint with contextualized items.
              </p>
              <Link
                href="/dashboard/agent"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
              >
                Open Agent
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </Section>
        )}

        {/* Bottom CTA */}
        {isApproved && (
          <div className="flex flex-col gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Ready to assign</p>
              <p className="mt-0.5 text-xs text-slate-400">
                This blueprint is approved. Assign it to a candidate to begin the assessment workflow.
              </p>
            </div>
            <Link
              href="/dashboard/assessments/new"
              className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
            >
              Assign Assessment
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
