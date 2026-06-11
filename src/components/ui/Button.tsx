import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-gradient-to-r from-indigo-600 to-violet-600 text-white",
    "shadow-brand",
    "hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg",
    "active:scale-[0.97] active:shadow-brand",
  ].join(" "),

  secondary: [
    "bg-indigo-50 text-indigo-700",
    "hover:bg-indigo-100",
    "dark:bg-indigo-500/10 dark:text-indigo-300",
    "dark:hover:bg-indigo-500/20",
  ].join(" "),

  outline: [
    "border border-slate-200 bg-white text-slate-700",
    "hover:bg-slate-50 hover:border-slate-300",
    "dark:border-slate-700 dark:bg-transparent dark:text-slate-300",
    "dark:hover:bg-slate-800/60 dark:hover:border-slate-600",
  ].join(" "),

  ghost: [
    "text-slate-600",
    "hover:bg-slate-100 hover:text-slate-900",
    "dark:text-slate-400",
    "dark:hover:bg-slate-800 dark:hover:text-white",
  ].join(" "),

  destructive: [
    "bg-red-600 text-white shadow-sm",
    "hover:bg-red-700",
    "active:bg-red-800 active:scale-[0.97]",
    "dark:bg-red-700 dark:hover:bg-red-600",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2 text-sm rounded-lg",
  lg: "px-5 py-2.5 text-sm rounded-lg",
  xl: "px-6 py-3 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 font-semibold transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        "dark:focus-visible:ring-offset-slate-900",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
