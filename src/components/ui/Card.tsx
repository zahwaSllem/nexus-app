import { cn } from "@/lib/utils";

export type CardVariant = "default" | "raised" | "glass";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
}

interface CardSubProps {
  children: React.ReactNode;
  className?: string;
}

const cardVariantClasses: Record<CardVariant, string> = {
  default: [
    "rounded-xl border border-slate-200 bg-white",
    "dark:border-slate-700 dark:bg-slate-800",
  ].join(" "),

  raised: [
    "rounded-xl border border-slate-200/80 bg-white",
    "shadow-card transition-shadow duration-200",
    "hover:shadow-md",
    "dark:border-slate-700/60 dark:bg-slate-800",
    "dark:shadow-card",
  ].join(" "),

  glass: [
    "rounded-xl border border-white/20 bg-white/70 backdrop-blur-md",
    "dark:border-white/10 dark:bg-slate-900/60",
  ].join(" "),
};

export function Card({ children, variant = "default", className }: CardProps) {
  return (
    <div className={cn(cardVariantClasses[variant], className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardSubProps) {
  return (
    <div className={cn("border-b border-slate-100 px-6 py-4 dark:border-slate-700", className)}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardSubProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardSubProps) {
  return (
    <h3 className={cn("text-base font-semibold text-slate-900 dark:text-white", className)}>
      {children}
    </h3>
  );
}

export function CardFooter({ children, className }: CardSubProps) {
  return (
    <div className={cn("border-t border-slate-100 px-6 py-4 dark:border-slate-700", className)}>
      {children}
    </div>
  );
}
