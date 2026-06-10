import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "error" | "info" | "pilot";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  dark?: boolean;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error: "bg-red-50 text-red-700 border border-red-200",
  info: "bg-sky-50 text-sky-700 border border-sky-200",
  pilot: "bg-violet-50 text-violet-700 border border-violet-200",
};

const darkVariantClasses: Record<Variant, string> = {
  default: "bg-slate-700 text-slate-300",
  success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-300 border border-amber-500/25",
  error:   "bg-red-500/15 text-red-300 border border-red-500/25",
  info:    "bg-sky-500/15 text-sky-300 border border-sky-500/25",
  pilot:   "bg-violet-500/15 text-violet-300 border border-violet-500/25",
};

export function Badge({ children, variant = "default", dark = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        dark ? darkVariantClasses[variant] : variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
