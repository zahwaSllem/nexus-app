"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/providers/language-provider";
import { useTheme } from "@/lib/providers/theme-provider";
import type { Theme } from "@/lib/providers/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Role = "candidate" | "admin";

const MOCK_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  candidate: { email: "candidate@nexus.io", password: "password123" },
  admin: { email: "admin@nexus.io", password: "admin123" },
};

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

export default function LoginPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState<Role>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const ROLES: { value: Role; label: string; hint: string }[] = [
    { value: "candidate", label: t.login.candidate, hint: t.login.candidateHint },
    { value: "admin", label: t.login.admin, hint: t.login.adminHint },
  ];

  const FEATURES = [t.login.f1, t.login.f2, t.login.f3];

  const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "light", icon: <SunIcon />, label: t.theme.light },
    { value: "dark", icon: <MoonIcon />, label: t.theme.dark },
    { value: "system", icon: <MonitorIcon />, label: t.theme.system },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const creds = MOCK_CREDENTIALS[role];
    if (email === creds.email && password === creds.password) {
      document.cookie = `nexus_session=${role}; path=/; max-age=86400; SameSite=Strict`;
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      router.push(redirect ?? (role === "admin" ? "/dashboard/agent" : "/candidate/dashboard"));
    } else {
      setError(t.login.errorMessage);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ── Left brand panel (desktop only) ─────────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden lg:flex lg:w-[52%]"
        style={{ background: "linear-gradient(155deg, #0f0b2d 0%, #0f172a 45%, #0d1020 100%)" }}
      >
        {/* Gradient mesh nodes — decorative only */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-700/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-indigo-800/10 blur-2xl"
        />

        {/* Subtle grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3 p-12">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "bg-gradient-to-br from-indigo-500 to-violet-600",
              "text-lg font-bold text-white",
              "shadow-[0_4px_16px_0_rgba(99,102,241,0.40)]",
            )}
          >
            N
          </div>
          <span className="text-xl font-semibold text-white">{t.common.nexus}</span>
        </div>

        {/* Headline */}
        <div className="relative px-12 pb-4">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-indigo-400/80">
            {t.login.enterprisePlatform}
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            {t.login.mainHeading1}
            <br />
            <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
              {t.login.mainHeading2}
            </span>
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-400">
            {t.login.mainSubheading}
          </p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-sm text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                {feat}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-2">
            {["D1 Personality", "D2 Cognition", "D3 Motivations", "D4 Emotional", "D5 Workplace"].map(
              (d, i) => (
                <span
                  key={d}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-xs",
                    i === 4
                      ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                      : "border-indigo-500/25 bg-indigo-500/10 text-indigo-300",
                  )}
                >
                  {d}
                </span>
              ),
            )}
          </div>
        </div>

        <p className="relative px-12 pb-10 text-xs text-slate-600">{t.login.version}</p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">

        {/* Mobile logo */}
        <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              "bg-gradient-to-br from-indigo-500 to-violet-600",
              "font-bold text-white",
              "shadow-[0_4px_12px_0_rgba(99,102,241,0.35)]",
            )}
          >
            N
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            {t.common.nexus}
          </span>
        </Link>

        <div className="w-full max-w-sm">

          {/* Theme + Language row */}
          <div className="mb-8 flex items-center justify-end gap-3">
            {/* Theme toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  title={opt.label}
                  className={cn(
                    "flex items-center justify-center rounded-md px-2 py-1.5 text-xs transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    theme === opt.value
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                  )}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
            {/* Language toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    lang === l
                      ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
                  )}
                >
                  {l === "en" ? "EN" : "AR"}
                </button>
              ))}
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.login.welcomeBack}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              {t.login.signInSubtitle}
            </p>
          </div>

          {/* Role selector */}
          <div className="mb-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t.login.signInAs}
            </p>
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/60">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setRole(r.value);
                    setError("");
                  }}
                  className={cn(
                    "flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                    role === r.value
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
              {ROLES.find((r) => r.value === role)?.hint}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {t.login.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={MOCK_CREDENTIALS[role].email}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={cn(
                  "w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900",
                  "placeholder-slate-400 outline-none transition-all duration-150",
                  "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
                  "dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-600",
                  "dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20",
                  error
                    ? "border-red-400 dark:border-red-500/60"
                    : "border-slate-200",
                )}
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t.login.passwordLabel}
                </label>
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-xs text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {t.login.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className={cn(
                    "w-full rounded-lg border bg-white px-4 py-2.5 pr-11 text-sm text-slate-900",
                    "placeholder-slate-400 outline-none transition-all duration-150",
                    "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
                    "dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-600",
                    "dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20",
                    error
                      ? "border-red-400 dark:border-red-500/60"
                      : "border-slate-200",
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                  aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Inline error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" variant="primary" size="lg" className="mt-1 w-full">
              {role === "candidate" ? t.login.signInButtonCandidate : t.login.signInButtonAdmin}
            </Button>
          </form>

          {/* Mock credentials hint */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700/60 dark:bg-slate-800/40">
            <p className="mb-2 text-xs font-medium text-slate-500">{t.login.mockCredentials}</p>
            <div className="space-y-1 font-mono text-xs text-slate-500 dark:text-slate-600">
              <p>
                <span className="text-slate-400 dark:text-slate-500">candidate</span>
                {" "}candidate@nexus.io · password123
              </p>
              <p>
                <span className="text-slate-400 dark:text-slate-500">admin</span>
                {" · · "}admin@nexus.io · admin123
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            >
              {t.login.backToHome}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
