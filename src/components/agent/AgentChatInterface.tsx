"use client";

import { useEffect, useRef, useState } from "react";
import type { AgentTurn, AgentTranscript } from "@/lib/types/nexus";
import { AgentChatBubble, AgentTypingBubble } from "./AgentChatBubble";

interface AgentChatInterfaceProps {
  transcript: AgentTranscript;
  onComplete: () => void;
}

export function AgentChatInterface({ transcript, onComplete }: AgentChatInterfaceProps) {
  const agentTurns = transcript.turns.filter((t) => t.role === "agent");
  const adminScriptedTurns = transcript.turns.filter((t) => t.role === "admin");

  const [displayedTurns, setDisplayedTurns] = useState<AgentTurn[]>([agentTurns[0]]);
  const [adminInput, setAdminInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);

  // Refs to avoid stale closures in timeouts
  const nextAgentIdxRef = useRef(1);
  const adminTurnCountRef = useRef(0);
  const agentTurnsRef = useRef(agentTurns);
  const adminScriptedRef = useRef(adminScriptedTurns);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom whenever turns change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedTurns, isTyping]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = adminInput.trim();
    if (!text || isTyping || interviewComplete) return;

    // Build admin turn with extracted_field from scripted turn at same position
    const scriptedAdmin = adminScriptedRef.current[adminTurnCountRef.current];
    const adminTurn: AgentTurn = {
      id: `admin-${Date.now()}`,
      role: "admin",
      content: text,
      timestamp: new Date().toISOString(),
      extracted_field: scriptedAdmin?.extracted_field,
    };

    adminTurnCountRef.current += 1;
    setAdminInput("");
    setDisplayedTurns((prev) => [...prev, adminTurn]);
    setIsTyping(true);

    setTimeout(() => {
      const idx = nextAgentIdxRef.current;
      const nextTurn = agentTurnsRef.current[idx];

      if (!nextTurn) {
        setIsTyping(false);
        setInterviewComplete(true);
        return;
      }

      if (nextTurn.is_generating) {
        // Show generating turn, then after delay replace with the final turn
        setDisplayedTurns((prev) => [...prev, nextTurn]);
        nextAgentIdxRef.current = idx + 1;

        setTimeout(() => {
          const finalTurn = agentTurnsRef.current[idx + 1];
          if (finalTurn) {
            setDisplayedTurns((prev) => [...prev.slice(0, -1), finalTurn]);
            nextAgentIdxRef.current = idx + 2;
          }
          setIsTyping(false);
          setInterviewComplete(true);
        }, 1800);
      } else {
        setDisplayedTurns((prev) => [...prev, nextTurn]);
        nextAgentIdxRef.current = idx + 1;
        setIsTyping(false);

        if (idx + 1 >= agentTurnsRef.current.length) {
          setInterviewComplete(true);
        }
      }
    }, 1500);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 pb-4">
          {displayedTurns.map((turn) => (
            <AgentChatBubble key={turn.id} turn={turn} />
          ))}
          {isTyping && <AgentTypingBubble />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="mt-4 border-t border-slate-200 dark:border-slate-800/60 pt-4">
        {interviewComplete ? (
          /* Interview complete CTA */
          <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-5">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Interview complete — blueprint ready
            </div>
            <p className="text-center text-xs text-slate-500">
              The agent has collected all required context. Review the generated Role Blueprint on the next step.
            </p>
            <button
              type="button"
              onClick={onComplete}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand-lg active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Review Role Blueprint
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ) : (
          /* Message composer */
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                disabled={isTyping}
                placeholder={isTyping ? "Agent is responding…" : "Type your response…"}
                className="w-full rounded-xl border border-slate-700/60 bg-white dark:bg-slate-800/60 px-4 py-3 pr-[88px] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all duration-150 focus:border-indigo-500/60 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!adminInput.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:from-indigo-700 hover:to-violet-700 hover:shadow-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[10px] text-slate-600 dark:text-slate-500">Enter to send</span>
              {adminInput.length > 0 && (
                <span className="text-[10px] text-slate-500">{adminInput.length} chars</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
