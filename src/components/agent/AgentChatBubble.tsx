import type { AgentTurn } from "@/lib/types/nexus";

const FIELD_LABELS: Record<string, string> = {
  role_title: "Role title captured",
  job_family: "Job family captured",
  job_level: "Job level captured",
  use_case: "Use case captured",
  key_responsibilities: "Key responsibilities captured",
  decision_authority_level: "Decision authority captured",
  environmental_notes: "Context notes captured",
  industry: "Industry captured",
  team_scope: "Team scope captured",
};

function formatTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "";
  }
}

interface AgentChatBubbleProps {
  turn: AgentTurn;
}

export function AgentChatBubble({ turn }: AgentChatBubbleProps) {
  const isAgent = turn.role === "agent";
  const time = formatTime(turn.timestamp);

  // ── Blueprint generating state ─────────────────────────────────────────────
  if (turn.is_generating) {
    return (
      <div className="flex items-start gap-3 animate-slide-up">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-[0_0_12px_0_rgba(99,102,241,0.40)]">
          N
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold text-indigo-400">Nexus Agent</p>
          <div className="relative max-w-[75%] overflow-hidden rounded-xl rounded-tl-sm border border-indigo-500/20 bg-slate-800/80 px-4 py-3.5">
            {/* Shimmer sweep */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
              <div className="absolute inset-y-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-indigo-400/8 to-transparent" />
            </div>
            <div className="relative flex items-center gap-2.5">
              <span className="text-xs font-medium text-indigo-300">Generating blueprint</span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1 w-1 rounded-full bg-indigo-400 animate-dot-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Agent message ──────────────────────────────────────────────────────────
  if (isAgent) {
    return (
      <div className="flex items-start gap-3 animate-slide-up">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-[0_0_12px_0_rgba(99,102,241,0.35)]">
          N
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-400">Nexus Agent</span>
            {time && <span className="text-[10px] text-slate-700">{time}</span>}
          </div>
          <div className="max-w-[85%] rounded-xl rounded-tl-sm border border-slate-700/60 border-l-2 border-l-indigo-500/50 bg-slate-800/80 px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {turn.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin message ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-end gap-1 animate-slide-up">
      <div className="mb-1 flex items-center gap-2">
        {time && <span className="text-[10px] text-slate-700">{time}</span>}
        <span className="text-xs font-semibold text-slate-500">You</span>
      </div>
      <div className="max-w-[75%] overflow-hidden rounded-xl rounded-tr-sm bg-gradient-to-br from-indigo-600 to-violet-600/90 px-4 py-3 shadow-[0_0_18px_0_rgba(99,102,241,0.20)]">
        <p className="text-sm leading-relaxed text-white">{turn.content}</p>
      </div>
      {turn.extracted_field && (
        <span className="mt-0.5 flex items-center gap-1 text-xs text-emerald-400">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {FIELD_LABELS[turn.extracted_field] ?? turn.extracted_field}
        </span>
      )}
    </div>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────────────

export function AgentTypingBubble() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-[0_0_12px_0_rgba(99,102,241,0.35)]">
        N
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold text-indigo-400">Nexus Agent</p>
        <div className="rounded-xl rounded-tl-sm border border-slate-700/60 border-l-2 border-l-indigo-500/50 bg-slate-800/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Thinking</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-indigo-400/70 animate-dot-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
