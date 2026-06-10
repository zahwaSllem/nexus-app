import type { MethodFamily } from "@/lib/types/nexus";

const CONFIG: Record<MethodFamily, { label: string; className: string }> = {
  likert: {
    label: "Likert",
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },
  contextual_self_report: {
    label: "Contextual",
    className: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
  },
  forced_choice: {
    label: "Forced Choice",
    className: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
  },
  cognitive_multiple_choice: {
    label: "Cognitive",
    className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  },
  sjt: {
    label: "SJT",
    className: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  },
};

interface MethodBadgeProps {
  method: MethodFamily;
}

export function MethodBadge({ method }: MethodBadgeProps) {
  const cfg = CONFIG[method];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
