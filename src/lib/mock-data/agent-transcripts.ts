import type { AgentTranscript, RoleContext } from "@/lib/types/nexus";

// ─── Transcript A: Junior Software Engineer (IC) ──────────────────────────────

const ROLE_CONTEXT_A: RoleContext = {
  role_title: "Junior Software Engineer",
  job_family: "Engineering",
  job_level: "IC",
  industry: "Technology",
  use_case: "hiring_support_validated_blueprint",
  key_responsibilities: [
    "Write and review code across the product stack",
    "Collaborate with product and design on feature delivery",
    "Debug production issues and improve system reliability",
  ],
  decision_authority_level: "low",
  team_scope: "Member of a 6-person product engineering team",
  environmental_notes: "Fast-paced startup; daily standups; high code-review culture; some ambiguity in requirements",
};

export const TRANSCRIPT_A: AgentTranscript = {
  conversation_id: "conv-001",
  turns: [
    {
      id: "t001",
      role: "agent",
      content: "Hello! I'm the Nexus Assessment Agent. I'll help you build a scientifically grounded assessment blueprint for your role. This should take about 5–7 minutes.\n\nLet's start with the basics. What is the job title you're hiring or assessing for?",
      timestamp: "2026-06-10T09:00:00Z",
    },
    {
      id: "t002",
      role: "admin",
      content: "Junior Software Engineer",
      timestamp: "2026-06-10T09:00:30Z",
      extracted_field: "role_title",
    },
    {
      id: "t003",
      role: "agent",
      content: "Got it — Junior Software Engineer. Which job family best describes this role?\n\n- Engineering\n- Product\n- Operations\n- Other",
      timestamp: "2026-06-10T09:00:32Z",
    },
    {
      id: "t004",
      role: "admin",
      content: "Engineering",
      timestamp: "2026-06-10T09:01:00Z",
      extracted_field: "job_family",
    },
    {
      id: "t005",
      role: "agent",
      content: "And what is the seniority level? For context: IC = Individual Contributor with no direct reports.",
      timestamp: "2026-06-10T09:01:02Z",
    },
    {
      id: "t006",
      role: "admin",
      content: "IC, it's an entry-level role. No direct reports.",
      timestamp: "2026-06-10T09:01:25Z",
      extracted_field: "job_level",
    },
    {
      id: "t007",
      role: "agent",
      content: "Understood. What is the primary purpose of this assessment?\n\n- Hiring Support: evaluate candidates for this specific role\n- Developmental: support an existing employee's growth",
      timestamp: "2026-06-10T09:01:27Z",
    },
    {
      id: "t008",
      role: "admin",
      content: "Hiring. We're screening candidates.",
      timestamp: "2026-06-10T09:01:50Z",
      extracted_field: "use_case",
    },
    {
      id: "t009",
      role: "agent",
      content: "What are the 2–3 most important responsibilities this person will own? Be as specific as you can.",
      timestamp: "2026-06-10T09:01:52Z",
    },
    {
      id: "t010",
      role: "admin",
      content: "Writing and reviewing code, working with product on features, and debugging production issues.",
      timestamp: "2026-06-10T09:02:30Z",
      extracted_field: "key_responsibilities",
    },
    {
      id: "t011",
      role: "agent",
      content: "How much decision-making authority does this role carry? For example: low (executes decisions made by others), moderate (makes local decisions with guidance), or high (owns outcomes independently).",
      timestamp: "2026-06-10T09:02:32Z",
    },
    {
      id: "t012",
      role: "admin",
      content: "Low to moderate. They work within defined sprints and escalate blockers. Not a lot of independent decision-making yet.",
      timestamp: "2026-06-10T09:03:00Z",
      extracted_field: "decision_authority_level",
    },
    {
      id: "t013",
      role: "agent",
      content: "What does the working environment feel like — structured and predictable, or fast-moving and ambiguous?",
      timestamp: "2026-06-10T09:03:02Z",
    },
    {
      id: "t014",
      role: "admin",
      content: "Fast-paced startup environment. Requirements change often. High code review standards. Daily standups.",
      timestamp: "2026-06-10T09:03:35Z",
      extracted_field: "environmental_notes",
    },
    {
      id: "t015",
      role: "agent",
      content: "That's everything I need. Let me now generate your Role Blueprint and Assessment Blueprint.\n\nI'm selecting domains, dimensions, and assessment items from the Nexus Question Bank — this will take a moment.",
      timestamp: "2026-06-10T09:03:37Z",
      is_generating: true,
    },
    {
      id: "t016",
      role: "agent",
      content: "Your blueprint is ready.\n\n**Selected domains:** D1 (Personality Architecture) · D2 (Cognitive Architecture) · D4 (Emotional and Social Functioning)\n\n**Why this selection:**\n- D1 covers execution discipline, learning orientation, and interpersonal behavior — core foundations for IC technical roles\n- D2 covers numerical reasoning, learning agility, and decision complexity — directly relevant to code-based problem solving\n- D4 covers resilience and relationship management — important for navigating code reviews and team collaboration\n- D3 and D5 are excluded: D3 is deferred to Phase 2 (governance restriction) and D5 requires synthesis validation not yet complete\n\n**22 items selected** · Estimated duration: 30–40 minutes\n\nPlease review the full blueprint on the next screen.",
      timestamp: "2026-06-10T09:03:55Z",
    },
  ],
  extracted_context: ROLE_CONTEXT_A,
  completed: true,
};

// ─── Transcript B: Operations Manager ────────────────────────────────────────

const ROLE_CONTEXT_B: RoleContext = {
  role_title: "Operations Manager",
  job_family: "Operations",
  job_level: "Manager",
  industry: "Logistics",
  use_case: "developmental",
  key_responsibilities: [
    "Oversee daily warehouse and dispatch operations",
    "Manage a team of 12 frontline staff",
    "Improve process efficiency and reduce operational errors",
  ],
  decision_authority_level: "moderate",
  team_scope: "Direct management of 12 staff; reports to Head of Operations",
  environmental_notes: "High-volume logistics environment; regulated; time-pressured; stakeholder complexity with suppliers, drivers, and senior leadership",
};

export const TRANSCRIPT_B: AgentTranscript = {
  conversation_id: "conv-002",
  turns: [
    {
      id: "t101",
      role: "agent",
      content: "Hello! I'm the Nexus Assessment Agent. I'll build a scientifically grounded assessment blueprint for your role in about 5–7 minutes.\n\nWhat is the job title you're assessing for?",
      timestamp: "2026-06-10T10:00:00Z",
    },
    {
      id: "t102",
      role: "admin",
      content: "Operations Manager",
      timestamp: "2026-06-10T10:00:25Z",
      extracted_field: "role_title",
    },
    {
      id: "t103",
      role: "agent",
      content: "Operations Manager — noted. Which job family fits best?\n\n- Operations\n- General Management\n- Engineering\n- Other",
      timestamp: "2026-06-10T10:00:27Z",
    },
    {
      id: "t104",
      role: "admin",
      content: "Operations",
      timestamp: "2026-06-10T10:00:45Z",
      extracted_field: "job_family",
    },
    {
      id: "t105",
      role: "agent",
      content: "What seniority level applies here?",
      timestamp: "2026-06-10T10:00:47Z",
    },
    {
      id: "t106",
      role: "admin",
      content: "Manager. They have a team of about 12 people reporting to them.",
      timestamp: "2026-06-10T10:01:10Z",
      extracted_field: "job_level",
    },
    {
      id: "t107",
      role: "agent",
      content: "What is the primary purpose of this assessment?\n\n- Hiring Support: screen candidates for this role\n- Developmental: support an existing manager's growth",
      timestamp: "2026-06-10T10:01:12Z",
    },
    {
      id: "t108",
      role: "admin",
      content: "Developmental. This is for our existing ops managers. We want to identify growth areas.",
      timestamp: "2026-06-10T10:01:40Z",
      extracted_field: "use_case",
    },
    {
      id: "t109",
      role: "agent",
      content: "What are the 2–3 most critical responsibilities this manager owns?",
      timestamp: "2026-06-10T10:01:42Z",
    },
    {
      id: "t110",
      role: "admin",
      content: "Managing daily warehouse and dispatch operations, leading their team of 12, and driving process improvements to reduce errors and cost.",
      timestamp: "2026-06-10T10:02:20Z",
      extracted_field: "key_responsibilities",
    },
    {
      id: "t111",
      role: "agent",
      content: "How much independent decision-making authority does this manager have — low, moderate, or high?",
      timestamp: "2026-06-10T10:02:22Z",
    },
    {
      id: "t112",
      role: "admin",
      content: "Moderate. They own daily operational decisions but escalate anything with major budget or compliance implications.",
      timestamp: "2026-06-10T10:02:55Z",
      extracted_field: "decision_authority_level",
    },
    {
      id: "t113",
      role: "agent",
      content: "Finally — describe the working environment. How much pressure, ambiguity, or regulatory constraint is typical?",
      timestamp: "2026-06-10T10:02:57Z",
    },
    {
      id: "t114",
      role: "admin",
      content: "High-volume logistics. Very time-pressured, especially around peak periods. Heavily regulated — drivers, health and safety, compliance. Complex stakeholder environment: suppliers, drivers, and senior leadership all have competing demands.",
      timestamp: "2026-06-10T10:03:45Z",
      extracted_field: "environmental_notes",
    },
    {
      id: "t115",
      role: "agent",
      content: "Perfect. Generating your Role Blueprint and Assessment Blueprint now.",
      timestamp: "2026-06-10T10:03:47Z",
      is_generating: true,
    },
    {
      id: "t116",
      role: "agent",
      content: "Your blueprint is ready.\n\n**Selected domains:** D1 (Personality Architecture) · D2 (Cognitive Architecture) · D4 (Emotional and Social Functioning)\n\n**Why this selection:**\n- D1 covers conscientiousness, interpersonal orientation, emotional steadiness, and integrity — foundational for a manager in a regulated, high-accountability environment\n- D2 covers decision complexity, learning agility, and verbal reasoning — important for prioritization and handling ambiguous operational challenges\n- D4 covers resilience, relationship management, and social awareness — directly relevant to managing 12 staff and navigating stakeholder complexity\n- Leadership Expression (D5) is excluded: it is deferred to Phase 2 and requires multi-method evidence before use in any selection or development context\n\n**26 items selected** · Estimated duration: 35–45 minutes\n\nReview the full blueprint on the next screen.",
      timestamp: "2026-06-10T10:04:05Z",
    },
  ],
  extracted_context: ROLE_CONTEXT_B,
  completed: true,
};

export const AGENT_TRANSCRIPTS = [TRANSCRIPT_A, TRANSCRIPT_B];

export function getTranscriptById(id: string): AgentTranscript | undefined {
  return AGENT_TRANSCRIPTS.find((t) => t.conversation_id === id);
}
