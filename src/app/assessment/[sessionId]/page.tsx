"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Mock question bank ────────────────────────────────────────────────────────

interface Question {
  id: number;
  moduleCode: string;
  module: string;
  domainCode: string;
  domain: string;
  text: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    moduleCode: "IC",
    module: "Identity & Consent",
    domainCode: "IC",
    domain: "Consent Acknowledgement",
    text: "I understand that this assessment is voluntary, that my responses will be kept confidential and used solely for evaluation purposes, and that I may withdraw at any time without penalty.",
  },
  {
    id: 2,
    moduleCode: "D1",
    module: "Personality Architecture",
    domainCode: "D1",
    domain: "D1 — Conscientious Execution",
    text: "I complete tasks thoroughly before moving on to new ones, even when under time pressure.",
  },
  {
    id: 3,
    moduleCode: "D1",
    module: "Personality Architecture",
    domainCode: "D1",
    domain: "D1 — Exploratory Openness",
    text: "I actively seek out new approaches to familiar problems, even when existing methods work well.",
  },
  {
    id: 4,
    moduleCode: "D1",
    module: "Personality Architecture",
    domainCode: "D1",
    domain: "D1 — Emotional Steadiness",
    text: "When faced with unexpected setbacks at work, I maintain my focus and composure while identifying next steps.",
  },
  {
    id: 5,
    moduleCode: "D1",
    module: "Personality Architecture",
    domainCode: "D1",
    domain: "D1 — Interpersonal Orientation",
    text: "I naturally consider how my decisions and actions might affect those around me before proceeding.",
  },
  {
    id: 6,
    moduleCode: "D1",
    module: "Personality Architecture",
    domainCode: "D1",
    domain: "D1 — Social Assertiveness",
    text: "I am comfortable expressing my point of view clearly in group discussions, even when it differs from the majority.",
  },
  {
    id: 7,
    moduleCode: "D2",
    module: "Cognition",
    domainCode: "D2",
    domain: "D2 — Analytical Reasoning",
    text: "When working through a complex problem, I systematically consider multiple approaches before committing to a solution.",
  },
  {
    id: 8,
    moduleCode: "D2",
    module: "Cognition",
    domainCode: "D2",
    domain: "D2 — Learning Agility",
    text: "I adapt quickly when required to work with unfamiliar tools, methodologies, or subject matter areas.",
  },
];

const LIKERT = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const MODULES = Array.from(new Set(QUESTIONS.map((q) => q.module)));

// ─── Exit confirmation dialog ──────────────────────────────────────────────────

interface ExitDialogProps {
  answeredCount: number;
  totalCount: number;
  onContinue: () => void;
  onExit: () => void;
}

function ExitDialog({ answeredCount, totalCount, onContinue, onExit }: ExitDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-amber-400">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>

        <h2 className="mb-2 text-center text-lg font-bold text-white">Exit Assessment?</h2>
        <p className="mb-5 text-center text-sm text-slate-400">
          You have answered {answeredCount} of {totalCount} questions.
        </p>

        {/* Save progress notice */}
        <div className="mb-5 rounded-xl border border-slate-700/60 bg-slate-800 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-slate-500">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-slate-400">Save Progress</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                Progress saving is not yet available. If you exit now, your responses will not be
                preserved and you will need to restart the assessment.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Continue Assessment
          </button>
          <button
            type="button"
            onClick={onExit}
            className="w-full rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800 hover:text-slate-200"
          >
            Exit Without Saving
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AssessmentSessionPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExitDialog, setShowExitDialog] = useState(false);

  const question = QUESTIONS[currentIndex];
  const total = QUESTIONS.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;
  const selected = answers[question.id] ?? null;
  const progressPct = Math.round((currentIndex / total) * 100);
  const answeredCount = Object.keys(answers).length;

  const moduleIndex = MODULES.indexOf(question.module);
  const moduleQuestions = QUESTIONS.filter((q) => q.module === question.module);
  const posInModule = moduleQuestions.findIndex((q) => q.id === question.id) + 1;

  function handleSelect(value: number) {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  }

  function handleNext() {
    if (!isLast) setCurrentIndex((i) => i + 1);
  }

  function handlePrevious() {
    if (!isFirst) setCurrentIndex((i) => i - 1);
  }

  function handleSubmit() {
    router.push("/assessment/complete");
  }

  function handleExitConfirm() {
    router.push("/assessment");
  }

  return (
    <>
      {/* Exit dialog — rendered above the page */}
      {showExitDialog && (
        <ExitDialog
          answeredCount={answeredCount}
          totalCount={total}
          onContinue={() => setShowExitDialog(false)}
          onExit={handleExitConfirm}
        />
      )}

      <div className="flex min-h-screen flex-col bg-slate-900">

        {/* ── Header ───────────────────────────────────────────────── */}
        <header className="border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="mx-auto max-w-2xl">

            {/* Top row: logo + module name | save placeholder + exit + counter */}
            <div className="mb-3 flex items-center justify-between gap-4">

              {/* Left: logo button (triggers exit dialog if in progress) */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowExitDialog(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-xs text-white transition-opacity hover:opacity-80"
                  aria-label="Exit assessment"
                >
                  N
                </button>
                <span className="text-xs font-medium text-slate-400">{question.module}</span>
              </div>

              {/* Right: save placeholder + exit button + counter */}
              <div className="flex items-center gap-3">
                {/* Save progress — placeholder for future backend */}
                <button
                  type="button"
                  disabled
                  title="Progress saving is not yet available"
                  className="flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs text-slate-700 opacity-50"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Save
                </button>

                {/* Exit button */}
                <button
                  type="button"
                  onClick={() => setShowExitDialog(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Exit
                </button>

                {/* Counter */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{currentIndex + 1} of {total}</span>
                  <span className="font-mono font-semibold text-blue-400">{progressPct}%</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-1 rounded-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Module breadcrumb */}
            <div className="mt-2.5 flex items-center gap-2.5">
              {MODULES.map((mod, i) => (
                <div key={mod} className="flex items-center gap-2">
                  <div
                    className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${
                      i < moduleIndex
                        ? "bg-blue-500"
                        : i === moduleIndex
                        ? "bg-blue-400"
                        : "bg-slate-700"
                    }`}
                  />
                  <span
                    className={`text-xs transition-colors ${
                      i === moduleIndex ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {mod}
                  </span>
                  {i < MODULES.length - 1 && (
                    <span className="text-slate-700">›</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── Question area ─────────────────────────────────────────── */}
        <main className="flex flex-1 flex-col px-6 py-10">
          <div className="mx-auto w-full max-w-2xl">

            {/* Domain label row */}
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-xs font-bold text-blue-300">
                {question.domainCode}
              </span>
              <span className="text-xs text-slate-500">{question.domain}</span>
            </div>

            {/* Position within module */}
            <p className="mb-6 text-xs text-slate-600">
              Question {currentIndex + 1} of {total}
              {moduleQuestions.length > 1 && (
                <span className="text-slate-700">
                  {" "}· {posInModule} of {moduleQuestions.length} in this module
                </span>
              )}
            </p>

            {/* Question text */}
            <h2 className="mb-10 text-xl font-semibold leading-relaxed text-white">
              {question.text}
            </h2>

            {/* Likert scale */}
            <div className="space-y-2.5">
              {LIKERT.map((option) => {
                const isSelected = selected === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-150 ${
                      isSelected
                        ? "border-blue-500 bg-blue-600/10 ring-1 ring-blue-500/40"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected ? "border-blue-500 bg-blue-500" : "border-slate-600"
                      }`}
                    >
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <span
                      className={`w-4 shrink-0 font-mono text-sm font-bold ${
                        isSelected ? "text-blue-300" : "text-slate-500"
                      }`}
                    >
                      {option.value}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isSelected ? "text-white" : "text-slate-300"
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scale endpoints legend */}
            <div className="mt-4 flex justify-between px-1">
              <span className="text-xs text-slate-600">1 — Strongly Disagree</span>
              <span className="text-xs text-slate-600">5 — Strongly Agree</span>
            </div>
          </div>
        </main>

        {/* ── Footer navigation ─────────────────────────────────────── */}
        <footer className="border-t border-slate-800 bg-slate-900 px-6 py-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between">

            {/* Previous */}
            <button
              type="button"
              onClick={handlePrevious}
              disabled={isFirst}
              className="flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-25"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Previous
            </button>

            {/* Dot progress tracker */}
            <div className="flex items-center gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i < currentIndex
                      ? "h-1.5 w-1.5 bg-blue-500"
                      : i === currentIndex
                      ? "h-2 w-2 bg-blue-400"
                      : "h-1.5 w-1.5 bg-slate-700"
                  }`}
                />
              ))}
            </div>

            {/* Next / Submit */}
            {isLast ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selected === null}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={selected === null}
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}
