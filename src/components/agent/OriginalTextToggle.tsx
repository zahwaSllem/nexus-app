"use client";

import { useState } from "react";

interface OriginalTextToggleProps {
  originalText: string;
}

export function OriginalTextToggle({ originalText }: OriginalTextToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800"
      >
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-3 w-3 transition-transform ${open ? "rotate-90" : ""}`}
        >
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        {open ? "Hide original bank item text" : "Show original bank item text"}
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-900/50">
          <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Original (preserved verbatim)</p>
          <p className="text-xs leading-relaxed text-slate-500">{originalText}</p>
        </div>
      )}
    </div>
  );
}
