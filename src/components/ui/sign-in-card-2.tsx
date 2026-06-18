"use client";

/**
 * Nexus Sign-In Card
 * ------------------
 * Premium, glass-morphism login experience adapted from the shared
 * "Sign In Card 2" component. The *visual + animation* foundation is reused
 * (glass card, moving border light, subtle 3D tilt, animated input focus,
 * entrance motion, loading button, password reveal) but ALL authentication
 * behaviour is the real Nexus mock-auth logic — there is no demo `setTimeout`,
 * no Google sign-in and no sign-up.
 *
 * Background depth is provided by the shared <PageAmbient/> system so the
 * ambient canvas is not duplicated.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/lib/providers/language-provider";
import { useTheme } from "@/lib/providers/theme-provider";
import type { Theme } from "@/lib/providers/theme-provider";
import { cn } from "@/lib/utils";
import { PageAmbient } from "@/components/layout/PageAmbient";

type Role = "candidate" | "admin";
type FocusedInput = "email" | "password" | null;

/** Real Nexus mock credentials — unchanged from the original login page. */
const MOCK_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  candidate: { email: "candidate@nexus.io", password: "password123" },
  admin: { email: "admin@nexus.io", password: "admin123" },
};

export function SignInCard() {
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  // ── Auth state (preserved exactly) ──────────────────────────────────────
  const [role, setRole] = useState<Role>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Visual-only state ───────────────────────────────────────────────────
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt driven by motion values (no `mousePosition` state) so it never
  // triggers React re-renders. Disabled on coarse pointers / reduced motion.
  const rotateXRaw = useMotionValue(0);
  const rotateYRaw = useMotionValue(0);
  const rotateX = useSpring(rotateXRaw, { stiffness: 150, damping: 18 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 150, damping: 18 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    setTiltEnabled(fine && !prefersReducedMotion);
  }, [prefersReducedMotion]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!tiltEnabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 … 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateYRaw.set(px * 6); // gentle, professional — max 3°
    rotateXRaw.set(-py * 6);
  }

  function resetTilt() {
    rotateXRaw.set(0);
    rotateYRaw.set(0);
  }

  // ── Real Nexus authentication (logic preserved verbatim) ────────────────
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const creds = MOCK_CREDENTIALS[role];
    if (email === creds.email && password === creds.password) {
      document.cookie = `nexus_session=${role}; path=/; max-age=86400; SameSite=Strict`;
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      router.push(redirect ?? (role === "admin" ? "/dashboard/agent" : "/candidate/dashboard"));
      // Keep the button in its loading state through navigation/unmount.
    } else {
      setError(t.login.errorMessage);
      setIsLoading(false);
    }
  }

  const ROLES: { value: Role; label: string; hint: string; icon: typeof User }[] = [
    { value: "candidate", label: t.login.candidate, hint: t.login.candidateHint, icon: User },
    { value: "admin", label: t.login.admin, hint: t.login.adminHint, icon: ShieldCheck },
  ];

  const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: t.theme.light },
    { value: "dark", icon: Moon, label: t.theme.dark },
    { value: "system", icon: Monitor, label: t.theme.system },
  ];

  const activeRole = ROLES.find((r) => r.value === role);

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 dark:bg-slate-950"
      style={{ perspective: 1400 }}
    >
      {/* Shared ambient canvas — depth without duplicating the system */}
      <PageAmbient variant="rich" />

      {/* Theme + language controls (existing Nexus behaviour) */}
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <div className="flex rounded-lg border border-slate-200/80 bg-white/70 p-0.5 backdrop-blur dark:border-white/10 dark:bg-white/5">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                title={opt.label}
                aria-label={opt.label}
                aria-pressed={theme === opt.value}
                className={cn(
                  "flex items-center justify-center rounded-md px-2 py-1.5 transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  theme === opt.value
                    ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                    : "text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
        <div className="flex rounded-lg border border-slate-200/80 bg-white/70 p-0.5 backdrop-blur dark:border-white/10 dark:bg-white/5">
          {(["en", "ar"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                lang === l
                  ? "bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white"
                  : "text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              {l === "en" ? "EN" : "AR"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Glass card with 3D tilt + moving border light ──────────────────── */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          rotateX: tiltEnabled ? rotateX : 0,
          rotateY: tiltEnabled ? rotateY : 0,
          transformStyle: "preserve-3d",
        }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Moving light beam — rotating conic gradient framing the card.
            Reduced & subtle; static when reduced-motion is requested. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-50 blur-[1px] dark:opacity-70"
          style={
            {
              background:
                "conic-gradient(from var(--beam-angle), transparent 0deg, rgba(99,102,241,0.5) 70deg, rgba(139,92,246,0.5) 140deg, transparent 210deg, transparent 360deg)",
              "--beam-angle": "0deg",
            } as React.CSSProperties
          }
          animate={prefersReducedMotion ? undefined : ({ "--beam-angle": "360deg" } as never)}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 14, repeat: Infinity, ease: "linear" }
          }
        />

        <div
          className={cn(
            "relative overflow-hidden rounded-3xl p-7 sm:p-9",
            // Light: intentional frosted surface (not a plain white inversion)
            "border border-slate-200/70 bg-white/80 shadow-[0_24px_70px_-20px_rgba(79,70,229,0.25)] backdrop-blur-xl",
            // Dark: original glass-card direction
            "dark:border-white/10 dark:bg-slate-900/60 dark:shadow-[0_24px_80px_-16px_rgba(0,0,0,0.8)]",
          )}
        >
          {/* Soft internal sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent dark:from-indigo-400/10"
          />

          <div className="relative" style={{ transform: tiltEnabled ? "translateZ(40px)" : undefined }}>
            {/* Brand mark */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white shadow-[0_6px_20px_-2px_rgba(99,102,241,0.5)]">
                N
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">
                {t.common.nexus}
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {t.login.welcomeBack}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {t.login.signInSubtitle}
              </p>
            </motion.div>

            {/* Role selector (preserved) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mb-6"
            >
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t.login.signInAs}
              </p>
              <div
                role="radiogroup"
                aria-label={t.login.signInAs}
                className="flex rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-white/10 dark:bg-white/5"
              >
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const selected = role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setRole(r.value);
                        setError("");
                      }}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                        selected
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {r.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{activeRole?.hint}</p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              aria-busy={isLoading}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {t.login.emailLabel}
                </label>
                <div
                  className={cn(
                    "group relative flex items-center rounded-xl border bg-white/60 transition-all duration-200 dark:bg-white/5",
                    focusedInput === "email"
                      ? "border-indigo-500 ring-2 ring-indigo-500/20"
                      : error
                        ? "border-red-400 dark:border-red-500/60"
                        : "border-slate-200 dark:border-white/10",
                  )}
                >
                  <Mail
                    className={cn(
                      "ml-3 h-4 w-4 shrink-0 transition-colors duration-200",
                      focusedInput === "email"
                        ? "text-indigo-500"
                        : "text-slate-400 dark:text-slate-500",
                    )}
                    aria-hidden
                  />
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
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-600"
                  />
                </div>
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
                    className="rounded text-xs text-indigo-600 transition-colors hover:text-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {t.login.forgotPassword}
                  </button>
                </div>
                <div
                  className={cn(
                    "group relative flex items-center rounded-xl border bg-white/60 transition-all duration-200 dark:bg-white/5",
                    focusedInput === "password"
                      ? "border-indigo-500 ring-2 ring-indigo-500/20"
                      : error
                        ? "border-red-400 dark:border-red-500/60"
                        : "border-slate-200 dark:border-white/10",
                  )}
                >
                  <Lock
                    className={cn(
                      "ml-3 h-4 w-4 shrink-0 transition-colors duration-200",
                      focusedInput === "password"
                        ? "text-indigo-500"
                        : "text-slate-400 dark:text-slate-500",
                    )}
                    aria-hidden
                  />
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
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-white dark:placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t.login.hidePassword : t.login.showPassword}
                    aria-pressed={showPassword}
                    className="mr-2 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Inline error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
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

              {/* Submit — smooth loading state tied to the real submit */}
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "group relative mt-1 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl",
                  "bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-semibold text-white",
                  "shadow-[0_8px_24px_-6px_rgba(99,102,241,0.6)] transition-all duration-200",
                  "hover:from-indigo-700 hover:to-violet-700 hover:shadow-[0_10px_30px_-6px_rgba(99,102,241,0.7)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
                  "active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80",
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    <span>{t.common.loading}</span>
                  </>
                ) : (
                  <>
                    <span>
                      {role === "candidate"
                        ? t.login.signInButtonCandidate
                        : t.login.signInButtonAdmin}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </>
                )}
                <span className="sr-only" role="status" aria-live="polite">
                  {isLoading ? t.common.loading : ""}
                </span>
              </button>
            </motion.form>

            {/* Mock credentials hint (existing Nexus testing aid) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 rounded-xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 dark:border-white/10 dark:bg-white/5"
            >
              <p className="mb-2 text-xs font-medium text-slate-500">{t.login.mockCredentials}</p>
              <div className="space-y-1 font-mono text-xs text-slate-500 dark:text-slate-500">
                <p>
                  <span className="text-slate-400 dark:text-slate-600">candidate</span> candidate@nexus.io
                  · password123
                </p>
                <p>
                  <span className="text-slate-400 dark:text-slate-600">admin</span> · admin@nexus.io ·
                  admin123
                </p>
              </div>
            </motion.div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="rounded text-xs text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-500 dark:hover:text-slate-300"
              >
                {t.login.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SignInCard;
