import type { ContextualizedItem, BankItem } from "@/lib/types/nexus";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { GovernanceBadge } from "@/components/ui/GovernanceBadge";
import { OriginalTextToggle } from "./OriginalTextToggle";

interface ItemContextCardProps {
  item: ContextualizedItem;
  bankItem: BankItem;
}

export function ItemContextCard({ item, bankItem }: ItemContextCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
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
      <p className="text-sm font-medium leading-relaxed text-white">
        {item.contextualized_text}
      </p>

      {/* Original text toggle */}
      <OriginalTextToggle originalText={item.original_text} />

      {/* Rationale */}
      <p className="mt-2 text-xs italic text-slate-600">
        {item.contextualization_rationale}
      </p>
    </div>
  );
}
