"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/providers/theme-provider";
import { useLanguage } from "@/lib/providers/language-provider";
import type { Theme } from "@/lib/providers/theme-provider";

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

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── Theme Toggle ───────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "light",  icon: <SunIcon />,     label: t.theme.light  },
    { value: "dark",   icon: <MoonIcon />,    label: t.theme.dark   },
    { value: "system", icon: <MonitorIcon />, label: t.theme.system },
  ];

  return (
    <div>
      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        {t.theme.label}
      </p>
      <div className="flex rounded-lg border border-slate-200/70 bg-slate-100/80 p-0.5 dark:border-slate-800/60 dark:bg-slate-900/70">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            title={opt.label}
            className={cn(
              "flex flex-1 items-center justify-center rounded-md py-1.5 text-xs font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950",
              theme === opt.value
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400",
            )}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Language Toggle ────────────────────────────────────────────────────────────

function LangToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div>
      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600">
        {t.language.label}
      </p>
      <div className="flex rounded-lg border border-slate-200/70 bg-slate-100/80 p-0.5 dark:border-slate-800/60 dark:bg-slate-900/70">
        {(["en", "ar"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={cn(
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950",
              lang === l
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400",
            )}
          >
            {l === "en" ? t.language.en : t.language.ar}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Nav data ───────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  labelKey: keyof ReturnType<typeof useLanguage>["t"]["nav"];
  icon: React.ReactNode;
}

const dashboardNav: NavItem[] = [
  {
    href: "/dashboard/agent",
    labelKey: "agent",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/blueprints",
    labelKey: "blueprints",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard/assessments",
    labelKey: "assessments",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path
          fillRule="evenodd"
          d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    labelKey: "overview",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/candidates",
    labelKey: "candidates",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/reports",
    labelKey: "reports",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

const adminNav: NavItem[] = [
  {
    href: "/admin",
    labelKey: "overview",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    labelKey: "users",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    labelKey: "settings",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

// ── Shared nav + controls + footer ─────────────────────────────────────────────

function SidebarNavContents({
  variant,
  onNavigate,
}: {
  variant: "dashboard" | "admin";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const navItems = variant === "admin" ? adminNav : dashboardNav;

  return (
    <>
      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-600">
          {variant === "admin" ? t.nav.administration : t.nav.workspace}
        </p>

        <ul className="space-y-0.5" role="list">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard" || item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const isAgent = item.href === "/dashboard/agent";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                    "transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    "focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950",
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.30)]"
                      : isAgent
                      ? "text-indigo-600 hover:bg-indigo-50/80 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200",
                  )}
                >
                  {/* Active: left accent bar */}
                  {isActive && (
                    <span className="absolute inset-y-2 left-0.5 w-0.5 rounded-full bg-white/50" aria-hidden />
                  )}

                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center transition-transform duration-150",
                      isActive ? "opacity-90" : "group-hover:scale-110",
                    )}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{t.nav[item.labelKey]}</span>
                  {isAgent && !isActive && (
                    <span className="rounded-full bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-500 ring-1 ring-indigo-500/20 dark:text-indigo-400 dark:ring-indigo-500/30">
                      {t.nav.newBadge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Unified bottom zone: controls + footer ─────────────────── */}
      <div className="border-t border-slate-200/60 px-3 pb-3 pt-3 dark:border-slate-800/60">
        {/* Theme + Language toggles */}
        <div className="space-y-2.5">
          <ThemeToggle />
          <LangToggle />
        </div>

        {/* Footer links */}
        <div className="mt-3 space-y-0.5 border-t border-slate-200/50 pt-3 dark:border-slate-800/50">
          <Link
            href="/"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all duration-150",
              "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
              "dark:text-slate-500 dark:hover:bg-slate-800/70 dark:hover:text-slate-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950",
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t.nav.backToHome}
          </Link>

          <Link
            href="/logout"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all duration-150",
              "text-slate-400 hover:bg-red-50 hover:text-red-600",
              "dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-950",
            )}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
            {t.nav.signOut}
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  variant?: "dashboard" | "admin";
}

export function Sidebar({ variant = "dashboard" }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setMobileOpen(false);
    setTimeout(() => hamburgerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, close]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) closeButtonRef.current?.focus();
  }, [mobileOpen]);

  const brandMark = (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        "bg-gradient-to-br from-indigo-600 to-violet-600",
        "text-sm font-bold text-white",
        "shadow-[0_2px_10px_0_rgba(99,102,241,0.35)]",
      )}
    >
      N
    </div>
  );

  return (
    <>
      {/* ── Desktop sidebar (md+) ────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col",
          "h-full w-60 shrink-0",
          // Dark: deep slate-950 — recedes behind content, creating depth hierarchy
          "border-r border-slate-200/60 bg-white/95 backdrop-blur-xl",
          "dark:border-slate-800/50 dark:bg-slate-950",
        )}
      >
        {/* Brand header */}
        <div className="relative flex h-16 shrink-0 items-center gap-3 overflow-hidden border-b border-slate-200/60 px-5 dark:border-slate-800/50">
          {/* Subtle indigo wash in dark mode */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent dark:from-indigo-500/8" />
          {brandMark}
          <span className="relative text-base font-semibold text-slate-900 dark:text-white">
            {t.common.nexus}
          </span>
        </div>

        <SidebarNavContents variant={variant} />
      </aside>

      {/* ── Mobile hamburger trigger (below md) ──────────────────────────── */}
      <button
        ref={hamburgerRef}
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-drawer"
        aria-haspopup="dialog"
        className={cn(
          "fixed left-4 top-4 z-30 md:hidden",
          "flex h-9 w-9 items-center justify-center rounded-lg",
          "border border-slate-200/80 bg-white/95 shadow-md backdrop-blur-xl",
          "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          "dark:border-slate-800/60 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          "transition-colors duration-150",
        )}
      >
        <HamburgerIcon />
      </button>

      {/* ── Mobile drawer (below md) ─────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={close}
          />

          <aside
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-72 flex-col md:hidden",
              "border-r border-slate-200/60 bg-white/95 shadow-xl backdrop-blur-xl",
              "dark:border-slate-800/50 dark:bg-slate-950",
            )}
            style={{ animation: "slideInLeft 0.22s ease-out" }}
          >
            <div className="relative flex h-16 shrink-0 items-center justify-between overflow-hidden border-b border-slate-200/60 px-5 dark:border-slate-800/50">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent dark:from-indigo-500/8" />
              <div className="relative flex items-center gap-3">
                {brandMark}
                <span className="text-base font-semibold text-slate-900 dark:text-white">
                  {t.common.nexus}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                aria-label="Close navigation menu"
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-lg",
                  "text-slate-400 hover:bg-slate-100 hover:text-slate-900",
                  "dark:text-slate-500 dark:hover:bg-slate-800/70 dark:hover:text-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  "transition-colors duration-150",
                )}
              >
                <XIcon />
              </button>
            </div>

            <SidebarNavContents variant={variant} onNavigate={close} />
          </aside>
        </>
      )}
    </>
  );
}
