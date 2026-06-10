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

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_TITLES: Record<Step, { title: string; subtitle: string }> = {
  1: {
    title: "Role Interview",
    subtitle: "The agent will ask questions to understand the role and generate a blueprint.",
  },
  2: {
    title: "Role Blueprint",
    subtitle: "Review the agent-generated Role Blueprint. All selections are read-only.",
  },
  3: {
    title: "Assessment Blueprint",
    subtitle: "Review the 22 items selected and contextualized by the agent for this role.",
  },
  4: {
    title: "Governance Review",
    subtitle: "Acknowledge all governance warnings before proceeding to approval.",
  },
  5: {
    title: "Approval",
    subtitle: "Confirm the compliance checklist and formally approve this blueprint.",
  },
};

const USE_CASE_LABEL = "Hiring Support — Validated Blueprint";

export default function AgentPage() {
  const [step, setStep] = useState<Step>(1);
  const [allAcknowledged, setAllAcknowledged] = useState(false);

  const advance = () => setStep((s) => Math.min(5, s + 1) as Step);
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  const handleAllAcknowledged = useCallback(() => {
    setAllAcknowledged(true);
  }, []);

  const { title, subtitle } = STEP_TITLES[step];

  return (
    <div className="flex min-h-full flex-col bg-slate-900">

      {/* Page header */}
      <div className="border-b border-slate-800 px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
                AI Assessment Agent
              </p>
              <h1 className="mt-1 text-xl font-bold text-white">{title}</h1>
              <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5">
              <span className="font-mono text-xs text-slate-500">bp-001</span>
              <span className="text-slate-700">·</span>
              <span className="text-xs text-slate-500">Junior Software Engineer</span>
            </div>
          </div>

          <AgentStepIndicator currentStep={step} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-8">

          {/* Step 1 — Interview */}
          {step === 1 && (
            <div className="flex h-[560px] flex-col">
              <AgentChatInterface
                transcript={TRANSCRIPT_A}
                onComplete={advance}
              />
            </div>
          )}

          {/* Step 2 — Role Blueprint */}
          {step === 2 && (
            <RoleBlueprintReview blueprint={BLUEPRINT_A} />
          )}

          {/* Step 3 — Assessment Blueprint */}
          {step === 3 && (
            <AssessmentBlueprintPreview
              blueprint={ASSESSMENT_BLUEPRINT_A}
              bankItems={QUESTION_BANK}
            />
          )}

          {/* Step 4 — Governance */}
          {step === 4 && (
            <GovernanceReviewPanel
              warnings={BLUEPRINT_A.governance_warnings}
              onAllAcknowledged={handleAllAcknowledged}
            />
          )}

          {/* Step 5 — Approval */}
          {step === 5 && (
            <ApprovalChecklist
              blueprintId={BLUEPRINT_A.blueprint_id}
              useCaseLabel={USE_CASE_LABEL}
              onApprove={() => {}}
            />
          )}

        </div>
      </div>

      {/* Bottom navigation — steps 2, 3, 4 only */}
      {step >= 2 && step <= 4 && (
        <div className="border-t border-slate-800 bg-slate-900/80 px-8 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {/* Back */}
            <button
              type="button"
              onClick={back}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>

            {/* Step label */}
            <span className="text-xs text-slate-600">Step {step} of 5</span>

            {/* Forward */}
            {step === 2 && (
              <button
                type="button"
                onClick={advance}
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
              >
                Confirm Blueprint, Continue
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
                Preview Complete, Continue
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
                Governance Complete, Approve
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
