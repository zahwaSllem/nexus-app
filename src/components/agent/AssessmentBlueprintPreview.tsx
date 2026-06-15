import type { AssessmentBlueprint, BankItem, ContextualizedItem } from "@/lib/types/nexus";
import { ItemContextCard } from "./ItemContextCard";

const DOMAIN_COLORS: Record<string, string> = {
  D1: "bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20",
  D2: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  D4: "bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
};

const DOMAIN_NAMES: Record<string, string> = {
  D1: "Personality Architecture",
  D2: "Cognitive Architecture",
  D4: "Interpersonal and Emotional Functioning",
};

interface AssessmentBlueprintPreviewProps {
  blueprint: AssessmentBlueprint;
  bankItems: BankItem[];
}

type GroupedItem = { ci: ContextualizedItem; bi: BankItem };
type DimensionGroup = { dimension_name: string; items: GroupedItem[] };
type DomainGroup = { domain_name: string; dimensions: Record<string, DimensionGroup> };

export function AssessmentBlueprintPreview({ blueprint, bankItems }: AssessmentBlueprintPreviewProps) {
  const bankMap = new Map(bankItems.map((b) => [b.item_id, b]));

  // Build domain → dimension → items structure
  const grouped: Record<string, DomainGroup> = {};

  for (const ci of blueprint.contextualized_items) {
    const bi = bankMap.get(ci.item_id);
    if (!bi) continue;

    if (!grouped[bi.domain_id]) {
      grouped[bi.domain_id] = {
        domain_name: DOMAIN_NAMES[bi.domain_id] ?? bi.domain_name,
        dimensions: {},
      };
    }
    if (!grouped[bi.domain_id].dimensions[bi.dimension_id]) {
      grouped[bi.domain_id].dimensions[bi.dimension_id] = {
        dimension_name: bi.dimension_name,
        items: [],
      };
    }
    grouped[bi.domain_id].dimensions[bi.dimension_id].items.push({ ci, bi });
  }

  const { method_mix, total_items, estimated_duration_min, domain_coverage } = blueprint;

  return (
    <div className="space-y-6">

      {/* Summary bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Assessment Blueprint</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{total_items} items</span>
              {" · "}
              <span className="font-semibold text-slate-900 dark:text-white">~{estimated_duration_min} min</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {domain_coverage.map((dc) => (
              <span
                key={dc.domain_id}
                className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${DOMAIN_COLORS[dc.domain_id] ?? "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-400"}`}
              >
                {dc.domain_id} · {dc.item_count}
              </span>
            ))}
          </div>
        </div>

        {/* Method mix */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(method_mix)
            .filter(([, count]) => count > 0)
            .map(([method, count]) => (
              <div
                key={method}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100/50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-700/30"
              >
                <span className="text-xs text-slate-600 dark:text-slate-400">{method.replace(/_/g, " ")}</span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Agent rationale */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-5 py-4 dark:border-indigo-500/20 dark:bg-indigo-500/5">
        <p className="mb-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">Agent Selection Rationale</p>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{blueprint.agent_selection_rationale}</p>
      </div>

      {/* Items grouped by domain → dimension */}
      {Object.entries(grouped).map(([domainId, domainGroup]) => (
        <div key={domainId} className="space-y-4">
          {/* Domain header */}
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${DOMAIN_COLORS[domainId] ?? "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-700 dark:text-slate-400"}`}>
              {domainId}
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">{domainGroup.domain_name}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700/80" />
          </div>

          {/* Dimensions */}
          {Object.entries(domainGroup.dimensions).map(([dimId, dimGroup]) => (
            <div key={dimId} className="pl-4">
              {/* Dimension header */}
              <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">{dimId}</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{dimGroup.dimension_name}</span>
                <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700/60">
                  {dimGroup.items.length} item{dimGroup.items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Items */}
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
}
