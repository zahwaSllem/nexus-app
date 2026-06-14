import type { RoleBlueprint } from "@/lib/types/nexus";
import { BlueprintStatusStepper } from "./BlueprintStatusStepper";

// ─── Context profile field definitions ────────────────────────────────────────

const CONTEXT_FIELDS: Array<{
  key: string;
  label: string;
  max: number;
  format?: (v: number) => string;
}> = [
  { key: "ambiguity_level", label: "Ambiguity Level", max: 5 },
  { key: "decision_stakes", label: "Decision Stakes", max: 5 },
  { key: "time_pressure", label: "Time Pressure", max: 5 },
  { key: "regulatory_constraint", label: "Regulatory Constraint", max: 5 },
  { key: "autonomy_level", label: "Autonomy Level", max: 5 },
  { key: "stakeholder_complexity", label: "Stakeholder Complexity", max: 5 },
  { key: "interdependence_level", label: "Interdependence Level", max: 5 },
  { key: "innovation_demand", label: "Innovation Demand", max: 5 },
  { key: "execution_precision_demand", label: "Execution Precision Demand", max: 5 },
  { key: "customer_exposure", label: "Customer Exposure", max: 5 },
  { key: "conflict_load", label: "Conflict Load", max: 5 },
  { key: "change_velocity", label: "Change Velocity", max: 5 },
  { key: "failure_cost", label: "Failure Cost", max: 5 },
  { key: "leadership_scope", label: "Leadership Scope", max: 4 },
];

const BQ_COMPONENTS = [
  { key: "evidence_completeness", label: "Evidence Completeness", weight: "30%" },
  { key: "construct_clarity", label: "Construct Clarity", weight: "25%" },
  { key: "sme_agreement", label: "SME Agreement", weight: "20%" },
  { key: "weight_justification", label: "Weight Justification", weight: "15%" },
  { key: "role_level_specificity", label: "Role-Level Specificity", weight: "10%" },
] as const;

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
  D2: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
  D4: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
};

const USE_CASE_LABELS: Record<string, string> = {
  developmental: "Developmental Feedback",
  hiring_support_validated_blueprint: "Hiring Support — Validated Blueprint",
};

// ─── Component ─────────────────────────────────────────────────────────────────

interface RoleBlueprintReviewProps {
  blueprint: RoleBlueprint;
}

export function RoleBlueprintReview({ blueprint }: RoleBlueprintReviewProps) {
  const { role_context, context_profile, selected_dimensions, blueprint_quality, included_domains } = blueprint;

  // Group dimensions by domain
  const byDomain: Record<string, typeof selected_dimensions> = {};
  for (const dim of selected_dimensions) {
    if (!byDomain[dim.domain_id]) byDomain[dim.domain_id] = [];
    byDomain[dim.domain_id].push(dim);
  }

  const bqPct = Math.round(blueprint_quality.composite * 100);
  const bqColor = bqPct >= 85 ? "text-emerald-400" : bqPct >= 70 ? "text-amber-400" : "text-red-400";
  const bqBarColor = bqPct >= 85 ? "bg-emerald-500" : bqPct >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-6">

      {/* Blueprint status + header */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-400">Agent-Generated Blueprint</p>
            <h2 className="mt-1 text-xl font-bold text-white">{role_context.role_title}</h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {role_context.job_level} · {role_context.job_family}
              {role_context.industry && ` · ${role_context.industry}`}
            </p>
          </div>
          <BlueprintStatusStepper status={blueprint.approval_status} />
        </div>

        {/* Role summary grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Use Case", value: USE_CASE_LABELS[role_context.use_case] ?? role_context.use_case },
            { label: "Decision Authority", value: role_context.decision_authority_level.charAt(0).toUpperCase() + role_context.decision_authority_level.slice(1) },
            { label: "Blueprint ID", value: blueprint.blueprint_id },
          ].map((row) => (
            <div key={row.label} className="rounded-lg bg-slate-700/40 px-3 py-2.5">
              <p className="text-xs text-slate-500">{row.label}</p>
              <p className="mt-0.5 text-sm font-medium text-slate-200">{row.value}</p>
            </div>
          ))}
        </div>

        {/* Key responsibilities */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Key Responsibilities</p>
          <ul className="space-y-1.5">
            {role_context.key_responsibilities.map((r) => (
              <li key={r} className="flex items-start gap-2.5 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Environmental notes */}
        {role_context.environmental_notes && (
          <div className="mt-4 rounded-lg border border-slate-700/60 bg-slate-900/40 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Environmental Context</p>
            <p className="mt-1 text-sm text-slate-400">{role_context.environmental_notes}</p>
          </div>
        )}
      </div>

      {/* Selected domains + dimensions */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Selected Domains & Dimensions</h3>
          <div className="flex gap-2">
            {included_domains.map((d) => (
              <span key={d} className={`rounded-full px-2.5 py-0.5 font-mono text-xs font-bold ${DOMAIN_COLORS[d] ?? "bg-slate-700 text-slate-400"}`}>
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(byDomain).map(([domainId, dims]) => (
            <div key={domainId}>
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 font-mono text-xs font-bold ${DOMAIN_COLORS[domainId] ?? "bg-slate-700 text-slate-400"}`}>
                  {domainId}
                </span>
                <span className="text-xs text-slate-500">{dims[0]?.domain_id}</span>
              </div>
              <div className="space-y-2 pl-2">
                {dims.map((dim) => (
                  <div key={dim.dimension_id} className="rounded-lg border border-slate-700/50 bg-slate-700/20 px-4 py-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{dim.dimension_id}</span>
                      <span className="text-sm font-medium text-white">{dim.dimension_name}</span>
                    </div>
                    <p className="mt-1 text-xs italic text-slate-500">{dim.selection_rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Exclusion note */}
        <div className="mt-4 rounded-lg border border-slate-700/40 bg-slate-900/30 px-4 py-3">
          <p className="text-xs text-slate-600">
            D3 (Motivational Drivers) and D5 (Applied Workplace Behavior) are excluded per V1 governance — both are deferred to Phase 2.
          </p>
        </div>
      </div>

      {/* Context profile — 17 fields */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <h3 className="mb-1 text-sm font-semibold text-white">Context Profile</h3>
        <p className="mb-4 text-xs text-slate-500">
          These 17 fields define the role environment and will be used to derive Domain 6 context-fit indices post-scoring.
        </p>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-700/40 px-3 py-2.5">
            <p className="text-xs text-slate-500">Context Name</p>
            <p className="mt-0.5 text-sm font-medium text-slate-200">{context_profile.context_name}</p>
          </div>
          <div className="rounded-lg bg-slate-700/40 px-3 py-2.5">
            <p className="text-xs text-slate-500">Job Family</p>
            <p className="mt-0.5 text-sm font-medium text-slate-200">{context_profile.job_family}</p>
          </div>
          <div className="rounded-lg bg-slate-700/40 px-3 py-2.5">
            <p className="text-xs text-slate-500">Job Level</p>
            <p className="mt-0.5 text-sm font-medium text-slate-200">{context_profile.job_level}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CONTEXT_FIELDS.map(({ key, label, max }) => {
            const value = (context_profile as unknown as Record<string, number>)[key] ?? 0;
            const pct = (value / max) * 100;
            return (
              <div key={key} className="rounded-lg bg-slate-700/20 px-3 py-2.5">
                <p className="text-xs text-slate-500">{label}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-1 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-5 text-right font-mono text-xs font-bold text-slate-300">
                    {value}/{max}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {context_profile.success_profile_notes && (
          <div className="mt-4 rounded-lg border border-slate-700/40 bg-slate-900/30 px-4 py-3">
            <p className="text-xs font-medium text-slate-500">Success Profile Notes</p>
            <p className="mt-1 text-sm text-slate-400">{context_profile.success_profile_notes}</p>
          </div>
        )}
      </div>

      {/* Blueprint Quality Score */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Blueprint Quality Score</h3>
            <p className="mt-0.5 text-xs text-slate-500">BQ = 0.30E + 0.25C + 0.20S + 0.15W + 0.10R</p>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-bold tabular-nums ${bqColor}`}>{bqPct}</span>
            <span className="text-slate-500">/100</span>
          </div>
        </div>

        <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-700">
          <div className={`h-2 rounded-full transition-all ${bqBarColor}`} style={{ width: `${bqPct}%` }} />
        </div>

        <div className="space-y-2.5">
          {BQ_COMPONENTS.map(({ key, label, weight }) => {
            const val = blueprint_quality[key as keyof typeof blueprint_quality] as number;
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

        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
          <p className="text-xs text-emerald-400">
            {bqPct >= 85
              ? "Strong blueprint — approved for operational role-fit scoring."
              : bqPct >= 70
              ? "Adequate blueprint — exploratory or development-only role fit permitted."
              : "Weak blueprint — role-fit output blocked until quality improves."}
          </p>
        </div>
      </div>

    </div>
  );
}
