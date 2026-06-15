"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/providers/theme-provider";
import { useLanguage } from "@/lib/providers/language-provider";
import type { Theme } from "@/lib/providers/theme-provider";
import type { ReactNode } from "react";

// ── Icons ──────────────────────────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

interface HeaderBarProps {
  role?: "dashboard" | "admin";
}

export function HeaderBar({ role = "dashboard" }: HeaderBarProps) {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  const themeOpts: { value: Theme; icon: ReactNode }[] = [
    { value: "light",  icon: <SunIcon /> },
    { value: "dark",   icon: <MoonIcon /> },
    { value: "system", icon: <MonitorIcon /> },
  ];

  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between px-5",
        "border-b border-slate-200/70 bg-white/90 backdrop-blur-xl",
        "dark:border-slate-800/50 dark:bg-slate-950/80",
      )}
    >
      {/* Left: workspace label */}
      <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400/80 dark:text-slate-600 sm:block">
        {role === "admin" ? t.nav.administration : t.nav.workspace}
      </span>

      {/* Right: premium control cluster */}
      <div
        className={cn(
          "ml-auto flex items-center gap-0.5 rounded-full px-1 py-1",
          "border border-slate-200/80 bg-slate-100/90 shadow-sm backdrop-blur-sm",
          "dark:border-slate-700/50 dark:bg-slate-800/50",
        )}
      >
        {/* User role chip */}
        <div className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm dark:bg-slate-900/80">
          <div
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              "bg-gradient-to-br from-indigo-600 to-violet-600",
              "text-[9px] font-bold leading-none text-white",
            )}
          >
            {role === "admin" ? "A" : "U"}
          </div>
          <span className="hidden text-xs font-semibold text-slate-700 dark:text-slate-200 sm:block">
            {role === "admin" ? "Platform Admin" : t.nav.workspace}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
        </div>

        {/* Divider */}
        <div className="mx-1.5 h-4 w-px bg-slate-200 dark:bg-slate-700/80" aria-hidden />

        {/* Language toggle */}
        {(["en", "ar"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            title={l === "en" ? t.language.en : t.language.ar}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950",
              lang === l
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
            )}
          >
            {l.toUpperCase()}
          </button>
        ))}

        {/* Divider */}
        <div className="mx-1.5 h-4 w-px bg-slate-200 dark:bg-slate-700/80" aria-hidden />

        {/* Theme toggle */}
        {themeOpts.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            title={t.theme[opt.value]}
            className={cn(
              "flex items-center justify-center rounded-full p-1.5 transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950",
              theme === opt.value
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300",
            )}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
