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

interface AgentChatBubbleProps {
  turn: AgentTurn;
}

export function AgentChatBubble({ turn }: AgentChatBubbleProps) {
  const isAgent = turn.role === "agent";

  if (turn.is_generating) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          N
        </div>
        <div className="max-w-[75%] rounded-2xl rounded-tl-sm border border-slate-700 bg-slate-800 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Generating blueprint</span>
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-blue-400"
                  style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </span>
          </div>
          <style>{`
            @keyframes bounce {
              0%, 60%, 100% { transform: translateY(0); }
              30% { transform: translateY(-4px); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (isAgent) {
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          N
        </div>
        <div className="max-w-[75%] space-y-1">
          <div className="rounded-2xl rounded-tl-sm border border-slate-700 bg-slate-800 px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
              {turn.content}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin bubble
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-blue-700 px-4 py-3">
        <p className="text-sm leading-relaxed text-white">{turn.content}</p>
      </div>
      {turn.extracted_field && (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {FIELD_LABELS[turn.extracted_field] ?? turn.extracted_field}
        </span>
      )}
    </div>
  );
}

// Typing indicator shown while agent is "thinking"
export function AgentTypingBubble() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        N
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-slate-700 bg-slate-800 px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-slate-500"
              style={{ animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
        <style>{`
          @keyframes typingBounce {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
