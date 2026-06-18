"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { TRANSCRIPT_A } from "@/lib/mock-data/agent-transcripts";
import { BLUEPRINT_A } from "@/lib/mock-data/blueprints";
import { ASSESSMENT_BLUEPRINT_A } from "@/lib/mock-data/assessment-blueprints";
import { QUESTION_BANK } from "@/lib/mock-data/question-bank";
import { AgentStepIndicator, AgentMobileStepBar } from "@/components/agent/AgentStepIndicator";
import { AgentChatInterface } from "@/components/agent/AgentChatInterface";
import { RoleBlueprintReview } from "@/components/agent/RoleBlueprintReview";
import { AssessmentBlueprintPreview } from "@/components/agent/AssessmentBlueprintPreview";
import { GovernanceReviewPanel } from "@/components/agent/GovernanceReviewPanel";
import { ApprovalChecklist } from "@/components/agent/ApprovalChecklist";
import { useLanguage } from "@/lib/providers/language-provider";
import { PageAmbient } from "@/components/layout/PageAmbient";

type Step = 1 | 2 | 3 | 4 | 5;

const USE_CASE_LABEL = "Hiring Support — Validated Blueprint";

export default function AgentPage() {
  const [step, setStep] = useState<Step>(1);
  const [allAcknowledged, setAllAcknowledged] = useState(false);
  const { t } = useLanguage();

  const STEP_TITLES: Record<Step, { title: string; subtitle: string }> = {
    1: { title: t.agent.stepRoleInterview,         subtitle: t.agent.stepRoleInterviewSub },
    2: { title: t.agent.stepRoleBlueprint,         subtitle: t.agent.stepRoleBlueprintSub },
    3: { title: t.agent.stepAssessmentBlueprint,   subtitle: t.agent.stepAssessmentBlueprintSub },
    4: { title: t.agent.stepGovernanceReview,      subtitle: t.agent.stepGovernanceReviewSub },
    5: { title: t.agent.stepApproval,              subtitle: t.agent.stepApprovalSub },
  };

  const advance = () => setStep((s) => Math.min(5, s + 1) as Step);
  const back    = () => setStep((s) => Math.max(1, s - 1) as Step);

  const handleAllAcknowledged = useCallback(() => {
    setAllAcknowledged(true);
  }, []);

  const { title, subtitle } = STEP_TITLES[step];

  return (
    <div className="relative flex min-h-full flex-col bg-white dark:bg-slate-900">

      {/* ── Fixed ambient layers ─────────────────────────────────────────────── */}

      {/* Primary radial glow — top-right, both modes */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_90%_0%,rgba(99,102,241,0.14)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_90%_0%,rgba(99,102,241,0.22)_0%,transparent_70%)]"
      />

      {/* Secondary ambient node — bottom-left, light mode only */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 55% 55% at 5% 95%, rgba(139,92,246,0.09) 0%, transparent 70%)",
        }}
      />

      {/* ── Page-level ambient canvas ─────────────────────────────────────────
          Extends the indigo/violet atmosphere across the full page — hero and
          workspace share the same background environment. */}
      <PageAmbient variant="rich" />

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <header className="relative z-10 overflow-hidden border-b border-indigo-200/50 bg-white dark:border-slate-800/60 dark:bg-slate-900">
        {/* Layered gradient mesh — vivid in light mode */}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/40 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-900" />
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/20" />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-violet-400/12 blur-2xl dark:bg-violet-500/15" />
        <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-indigo-600/8 blur-2xl dark:bg-indigo-400/10" />

        {/* Dot grid overlay — more visible */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative px-6 py-6 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-start justify-between gap-4">

              {/* Left: title block */}
              <div>
                {/* Pulsing session badge */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/70 bg-indigo-50/80 px-3 py-1 dark:border-indigo-500/25 dark:bg-indigo-500/10">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span
                      className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-60"
                      style={{ animationDuration: "2s" }}
                    />
                    <span className="relative block h-2 w-2 rounded-full bg-indigo-500" />
                  </span>
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    AI Session Active
                  </span>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  {t.agent.title}
                </p>
                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {title}
                </h1>
                <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
              </div>

              {/* Right: progress summary + context chip */}
              <div className="flex shrink-0 flex-col items-end gap-3">
                {/* Step progress bar */}
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Step {step} of 5
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={cn(
                          "h-2 rounded-full transition-all duration-500",
                          n < step
                            ? "w-9 bg-emerald-500"
                            : n === step
                            ? "w-12 bg-gradient-to-r from-indigo-500 to-violet-500"
                            : "w-6 bg-slate-200 dark:bg-slate-700",
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Blueprint context chip */}
                <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-1.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/60">
                  <span className="font-mono text-xs text-slate-400 dark:text-slate-500">bp-001</span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span className="text-xs text-slate-500">Junior Software Engineer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Workspace body ──────────────────────────────────────────────────── */}
      <div className="relative z-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-6 sm:px-8 sm:py-8">

          {/* Mobile: compact step bar */}
          <div className="mb-5 md:hidden">
            <AgentMobileStepBar currentStep={step} />
          </div>

          {/* Two-zone layout: step rail + content */}
          <div className="flex items-start gap-6 lg:gap-8">

            {/* Step rail — desktop only */}
            <div className="hidden shrink-0 md:block md:w-56 lg:w-60">
              <div className="animate-scale-in sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 dark:border-slate-700/40 dark:bg-slate-800/60 dark:shadow-none">
                {/* Rail header */}
                <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-700/50">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-600">
                    Workflow
                  </p>
                </div>
                <div className="p-2.5">
                  <AgentStepIndicator currentStep={step} />
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="min-w-0 flex-1">

              {/* Step 1: AI chat workspace */}
              {step === 1 && (
                <div className="animate-scale-in rounded-[22px] bg-gradient-to-b from-indigo-100/80 via-slate-100/40 to-white/60 p-[3px] shadow-[0_8px_48px_0_rgba(99,102,241,0.18)] ring-1 ring-indigo-200/50 dark:bg-gradient-to-b dark:from-slate-700/50 dark:to-slate-800/30 dark:shadow-[0_0_70px_0_rgba(0,0,0,0.70)] dark:ring-slate-700/40">
                  <div className="overflow-hidden rounded-[19px] border border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-950 dark:border-slate-700/40">
                    {/* AI identity bar */}
                    <div className="flex items-center gap-3 border-b border-slate-200 bg-white dark:border-slate-800/60 dark:bg-slate-900/70 px-5 py-3">
                      <div className="relative shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-[0_0_16px_0_rgba(99,102,241,0.50)]">
                          N
                        </div>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-emerald-400"
                          aria-hidden
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Nexus Agent</p>
                        <p className="text-[10px] text-slate-500">Active · Role Interview</p>
                      </div>
                      <div className="ml-auto">
                        <span className="rounded border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800/50 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                          SESSION-001
                        </span>
                      </div>
                    </div>

                    {/* Chat interface */}
                    <div className="flex h-[540px] flex-col p-5 sm:h-[580px]">
                      <AgentChatInterface transcript={TRANSCRIPT_A} onComplete={advance} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step context banner — steps 2–5, re-animates on each step change */}
              {step >= 2 && (
                <div
                  key={step}
                  className="mb-6 flex animate-fade-in-up items-center gap-4 overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50/80 to-white px-5 py-4 shadow-sm dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-transparent"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-[0_0_20px_0_rgba(99,102,241,0.40)]">
                    {step}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                  </div>
                  <div className="hidden shrink-0 items-center gap-1 sm:flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        className={cn(
                          "h-1 rounded-full transition-all duration-500",
                          n < step
                            ? "w-5 bg-emerald-500"
                            : n === step
                            ? "w-7 bg-gradient-to-r from-indigo-500 to-violet-500"
                            : "w-3 bg-slate-200 dark:bg-slate-700",
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in-up">
                  <RoleBlueprintReview blueprint={BLUEPRINT_A} />
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in-up">
                  <AssessmentBlueprintPreview
                    blueprint={ASSESSMENT_BLUEPRINT_A}
                    bankItems={QUESTION_BANK}
                  />
                </div>
              )}

              {step === 4 && (
                <div className="animate-fade-in-up">
                  <GovernanceReviewPanel
                    warnings={BLUEPRINT_A.governance_warnings}
                    onAllAcknowledged={handleAllAcknowledged}
                  />
                </div>
              )}

              {step === 5 && (
                <div className="animate-fade-in-up">
                  <ApprovalChecklist
                    blueprintId={BLUEPRINT_A.blueprint_id}
                    useCaseLabel={USE_CASE_LABEL}
                    onApprove={() => {}}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom navigation — steps 2–4 ───────────────────────────────────── */}
      {step >= 2 && step <= 4 && (
        <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center gap-4">
            {/* Back */}
            <button
              type="button"
              onClick={back}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-200 dark:focus-visible:ring-offset-slate-900"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {t.agent.back}
            </button>

            {/* Center: step counter */}
            <div className="flex-1 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.agent.stepOf.replace("{step}", String(step))}
              </span>
            </div>

            {/* Forward */}
            {step === 2 && (
              <button
                type="button"
                onClick={advance}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                {t.agent.reviewBlueprint}
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={advance}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
              >
                {t.agent.reviewItems}
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            {step === 4 && (
              <button
                type="button"
                onClick={advance}
                disabled={!allAcknowledged}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:focus-visible:ring-offset-slate-900"
              >
                {allAcknowledged ? t.agent.continueToApproval : t.agent.reviewWarningsFirst}
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
