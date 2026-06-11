"use client";

import { useState, useCallback } from "react";
import { TRANSCRIPT_A } from "@/lib/mock-data/agent-transcripts";
import { BLUEPRINT_A } from "@/lib/mock-data/blueprints";
import { ASSESSMENT_BLUEPRINT_A } from "@/lib/mock-data/assessment-blueprints";
import { QUESTION_BANK } from "@/lib/mock-data/question-bank";
import { AgentStepIndicator } from "@/components/agent/AgentStepIndicator";
import { AgentChatInterface } from "@/components/agent/AgentChatInterface";
import { RoleBlueprintReview } from "@/components/agent/RoleBlueprintReview";
import { AssessmentBlueprintPreview } from "@/components/agent/AssessmentBlueprintPreview";
import { GovernanceReviewPanel } from "@/components/agent/GovernanceReviewPanel";
import { ApprovalChecklist } from "@/components/agent/ApprovalChecklist";
import { useLanguage } from "@/lib/providers/language-provider";

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
    <div className="flex min-h-full flex-col bg-slate-50 dark:bg-slate-900">

      {/* Page header */}
      <div className="border-b border-slate-200 px-8 py-6 dark:border-slate-800">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-blue-600 dark:text-blue-400">
                {t.agent.title}
              </p>
              <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100/60 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800/60">
              <span className="font-mono text-xs text-slate-400 dark:text-slate-500">bp-001</span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-500">Junior Software Engineer</span>
            </div>
          </div>

          <AgentStepIndicator currentStep={step} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-8">

          {step === 1 && (
            <div className="flex h-[560px] flex-col">
              <AgentChatInterface transcript={TRANSCRIPT_A} onComplete={advance} />
            </div>
          )}

          {step === 2 && <RoleBlueprintReview blueprint={BLUEPRINT_A} />}

          {step === 3 && (
            <AssessmentBlueprintPreview
              blueprint={ASSESSMENT_BLUEPRINT_A}
              bankItems={QUESTION_BANK}
            />
          )}

          {step === 4 && (
            <GovernanceReviewPanel
              warnings={BLUEPRINT_A.governance_warnings}
              onAllAcknowledged={handleAllAcknowledged}
            />
          )}

          {step === 5 && (
            <ApprovalChecklist
              blueprintId={BLUEPRINT_A.blueprint_id}
              useCaseLabel={USE_CASE_LABEL}
              onApprove={() => {}}
            />
          )}

        </div>
      </div>

      {/* Bottom navigation — steps 2–4 */}
      {step >= 2 && step <= 4 && (
        <div className="border-t border-slate-200 bg-white/80 px-8 py-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {/* Back */}
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {t.agent.back}
            </button>

            {/* Step label */}
            <span className="text-xs text-slate-400 dark:text-slate-600">
              {t.agent.stepOf.replace("{step}", String(step))}
            </span>

            {/* Forward */}
            {step === 2 && (
              <button
                type="button"
                onClick={advance}
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
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
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
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
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
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
