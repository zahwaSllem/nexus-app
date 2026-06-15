import type { MethodFamily } from "@/lib/types/nexus";

const CONFIG: Record<MethodFamily, { label: string; className: string }> = {
  likert: {
    label: "Likert",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30",
  },
  contextual_self_report: {
    label: "Contextual",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30",
  },
  forced_choice: {
    label: "Forced Choice",
    className: "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/30",
  },
  cognitive_multiple_choice: {
    label: "Cognitive",
    className: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30",
  },
  sjt: {
    label: "SJT",
    className: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30",
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
