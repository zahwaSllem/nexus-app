import { cn } from "@/lib/utils";

interface PageAmbientProps {
  /**
   * "subtle" — visible ambient for content pages (blueprints, reports, etc.)
   * "rich"   — stronger ambient for the AI command-centre workspace (agent page).
   */
  variant?: "subtle" | "rich";
  className?: string;
}

/**
 * Animated ambient background canvas.
 * Place as the first child inside a `position: relative` wrapper.
 * Blobs are pointer-events-none and aria-hidden so they never interfere
 * with content, focus management, or screen readers.
 */
export function PageAmbient({ variant = "subtle", className }: PageAmbientProps) {
  const rich = variant === "rich";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 select-none overflow-hidden",
        className,
      )}
    >
      {/* Primary glow — top-right, slow clockwise drift */}
      <div
        className={cn(
          "animate-ambient-1 absolute rounded-full blur-3xl",
          rich
            ? "-right-24 -top-24 h-[70vh] w-[62vw] bg-indigo-400/22 dark:bg-indigo-500/35"
            : "-right-20 -top-20 h-[52vh] w-[50vw] bg-indigo-400/14 dark:bg-indigo-500/22",
        )}
      />
      {/* Secondary glow — bottom-left, slow counter-phase drift */}
      <div
        className={cn(
          "animate-ambient-2 absolute rounded-full blur-3xl",
          rich
            ? "-bottom-20 -left-24 h-[62vh] w-[56vw] bg-violet-400/18 dark:bg-violet-500/28"
            : "-bottom-16 -left-20 h-[44vh] w-[44vw] bg-violet-400/11 dark:bg-violet-500/17",
        )}
      />
      {/* Centre accent — rich variant only, keeps mid-workspace warm */}
      {rich && (
        <div className="animate-ambient-3 absolute left-1/2 top-[42%] h-80 w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/12 blur-2xl dark:bg-indigo-400/20" />
      )}
      {/* Dot-grid texture — structural depth between UI panels */}
      <div
        className={cn(
          "absolute inset-0",
          rich ? "opacity-[0.07] dark:opacity-[0.12]" : "opacity-[0.05] dark:opacity-[0.08]",
        )}
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}
