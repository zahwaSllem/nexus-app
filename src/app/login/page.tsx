"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "candidate" | "admin";

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "candidate", label: "Candidate", hint: "Taking an assessment session" },
  { value: "admin", label: "Admin / HR", hint: "Platform and report management" },
];

const MOCK_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  candidate: { email: "candidate@nexus.io", password: "password123" },
  admin: { email: "admin@nexus.io", password: "admin123" },
};

const FEATURES = [
  "Psychometric scoring with precision and confidence estimates",
  "Job-level routing for Entry, Manager, and Executive",
  "Seven-layer governance-enforced reporting architecture",
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const creds = MOCK_CREDENTIALS[role];
    if (email === creds.email && password === creds.password) {
      document.cookie = `nexus_session=${role}; path=/; max-age=86400; SameSite=Strict`;
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      router.push(redirect ?? (role === "admin" ? "/dashboard/agent" : "/assessment"));
    } else {
      setError("Invalid email or password. Check the mock credentials below.");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-900">

      {/* ── Left brand panel (desktop only) ───────────────────────── */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 p-12 lg:flex lg:w-[52%]">
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-lg text-white shadow-lg">
            N
          </div>
          <span className="text-xl font-semibold text-white">Nexus</span>
        </div>

        {/* Headline */}
        <div className="relative">
          <p className="mb-4 text-xs font-medium uppercase tracking-widest text-blue-400">
            Enterprise Assessment Platform
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
            Precision Assessment
            <br />
            for Human Capability
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-400">
            Six scientifically validated domains. Seven governance layers.
            Deterministic, audience-specific reports.
          </p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map((feat) => (
              <li key={feat} className="flex items-start gap-3 text-sm text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {feat}
              </li>
            ))}
          </ul>

          {/* Domain badges */}
          <div className="mt-10 flex flex-wrap gap-2">
            {["D1 Personality", "D2 Cognition", "D3 Motivations", "D4 Emotional", "D5 Workplace"].map(
              (d, i) => (
                <span
                  key={d}
                  className={`rounded-full border px-3 py-1 font-mono text-xs ${
                    i === 4
                      ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                      : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                  }`}
                >
                  {d}
                </span>
              )
            )}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          Nexus Enterprise Assessment Platform · V1
        </p>
      </div>

      {/* ── Right form panel ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        {/* Mobile logo */}
        <Link href="/" className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            N
          </div>
          <span className="text-lg font-semibold text-white">Nexus</span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-400">Sign in to continue to Nexus</p>
          </div>

          {/* Role selector */}
          <div className="mb-7">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Sign in as
            </p>
            <div className="flex rounded-lg border border-slate-700 bg-slate-800/60 p-1">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setRole(r.value); setError(""); }}
                  className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                    role === r.value
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {ROLES.find((r) => r.value === role)?.hint}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={MOCK_CREDENTIALS[role].email}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  tabIndex={-1}
                  className="text-xs text-blue-400 transition-colors hover:text-blue-300"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 pr-11 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-blue-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Sign in as {role === "candidate" ? "Candidate" : "Admin"}
            </button>
          </form>

          {/* Mock credentials hint */}
          <div className="mt-6 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3">
            <p className="mb-2 text-xs font-medium text-slate-500">
              Mock credentials
            </p>
            <div className="space-y-1 font-mono text-xs text-slate-600">
              <p>
                <span className="text-slate-500">candidate</span>
                {" "}candidate@nexus.io · password123
              </p>
              <p>
                <span className="text-slate-500">admin</span>
                {" · · "}admin@nexus.io · admin123
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
