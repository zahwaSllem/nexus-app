"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Icons ──────────────────────────────────────────────────────────────────────

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

// ── Nav data ───────────────────────────────────────────────────────────────────

interface CandidateNavItem {
  href: string;
  label: string;
  activePrefix: string;
  exact?: boolean;
  highlight?: boolean;
  icon: React.ReactNode;
}

const NAV: CandidateNavItem[] = [
  {
    href: "/candidate/dashboard",
    label: "My Dashboard",
    activePrefix: "/candidate/dashboard",
    exact: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    href: "/assessment",
    label: "My Assessment",
    activePrefix: "/assessment",
    highlight: true,
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
    href: "/candidate/results/demo",
    label: "My Results",
    activePrefix: "/candidate/results",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    href: "/candidate/report/demo",
    label: "My Report",
    activePrefix: "/candidate/report",
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

// ── Inner contents ─────────────────────────────────────────────────────────────

function SidebarNavContents({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Candidate navigation">
        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-600">
          Portal
        </p>
        <ul className="space-y-0.5" role="list">
          {NAV.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.activePrefix);

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
                      : item.highlight
                      ? "text-indigo-600 hover:bg-indigo-50/80 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200",
                  )}
                >
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
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer links */}
      <div className="border-t border-slate-200/60 px-3 pb-3 pt-3 dark:border-slate-800/60">
        <div className="space-y-0.5">
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
            Back to Home
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
            Sign Out
          </Link>
        </div>
      </div>
    </>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

export function CandidateSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setMobileOpen(false);
    setTimeout(() => hamburgerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen, close]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
      {/* Desktop sidebar (md+) */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col",
          "h-full w-60 shrink-0",
          "border-r border-slate-200/60 bg-white/95 backdrop-blur-xl",
          "dark:border-slate-800/50 dark:bg-slate-950",
        )}
      >
        <div className="relative flex h-16 shrink-0 items-center gap-3 overflow-hidden border-b border-slate-200/60 px-5 dark:border-slate-800/50">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent dark:from-indigo-500/8" />
          {brandMark}
          <div className="relative">
            <span className="block text-base font-semibold text-slate-900 dark:text-white">Nexus</span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-indigo-500 dark:text-indigo-400">
              Candidate
            </span>
          </div>
        </div>
        <SidebarNavContents />
      </aside>

      {/* Mobile hamburger trigger */}
      <button
        ref={hamburgerRef}
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        aria-controls="candidate-mobile-nav"
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

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={close}
          />
          <aside
            id="candidate-mobile-nav"
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
                <div>
                  <span className="block text-base font-semibold text-slate-900 dark:text-white">Nexus</span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-indigo-500 dark:text-indigo-400">
                    Candidate
                  </span>
                </div>
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
            <SidebarNavContents onNavigate={close} />
          </aside>
        </>
      )}
    </>
  );
}
