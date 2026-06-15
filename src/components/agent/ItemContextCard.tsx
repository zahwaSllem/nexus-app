import type { ContextualizedItem, BankItem } from "@/lib/types/nexus";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { GovernanceBadge } from "@/components/ui/GovernanceBadge";
import { OriginalTextToggle } from "./OriginalTextToggle";

const DOMAIN_ACCENT_COLOR: Record<string, string> = {
  D1: "#6366F1",
  D2: "#F59E0B",
  D4: "#8B5CF6",
};

interface ItemContextCardProps {
  item: ContextualizedItem;
  bankItem: BankItem;
}

export function ItemContextCard({ item, bankItem }: ItemContextCardProps) {
  return (
    <div
      className="rounded-xl border border-slate-700 bg-slate-800 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.4)]"
      style={{
        borderLeftColor: DOMAIN_ACCENT_COLOR[bankItem.domain_id] ?? "#475569",
        borderLeftWidth: "2px",
      }}
    >
      {/* Header row */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-slate-300">
            {bankItem.item_id}
          </span>
          <span className="text-xs text-slate-500">{bankItem.dimension_name}</span>
          <span className="text-xs text-slate-700">·</span>
          <span className="text-xs text-slate-600">{bankItem.facet_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700">#{item.display_order}</span>
          {bankItem.reverse_scored && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              reverse-scored
            </span>
          )}
          <MethodBadge method={bankItem.method_family} />
          <GovernanceBadge status={bankItem.use_status} />
        </div>
      </div>

      {/* Contextualized text — prominent */}
      <p className="text-[15px] font-medium leading-snug text-white">
        {item.contextualized_text}
      </p>

      {/* Separator */}
      <div className="my-3 h-px bg-slate-700/60" />

      {/* Original text toggle */}
      <OriginalTextToggle originalText={item.original_text} />

      {/* Rationale */}
      <p className="mt-2 text-xs italic text-slate-600">
        {item.contextualization_rationale}
      </p>
    </div>
  );
}
