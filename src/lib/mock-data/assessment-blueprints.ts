import type { AssessmentBlueprint } from "@/lib/types/nexus";

// ─── Assessment Blueprint A — Junior Software Engineer ────────────────────────
// 22 items selected from D1/D2/D4. Each ContextualizedItem has:
// - item_id: immutable link to BankItem in question-bank.ts
// - original_text: verbatim copy from BankItem.item_text (never modified)
// - contextualized_text: agent-generated for engineering/IC/startup context
// - contextualization_rationale: why this item was selected

export const ASSESSMENT_BLUEPRINT_A: AssessmentBlueprint = {
  assessment_blueprint_id: "abp-001",
  role_blueprint_id: "bp-001",
  total_items: 22,
  estimated_duration_min: 35,
  method_mix: {
    likert: 9,
    contextual_self_report: 5,
    forced_choice: 4,
    cognitive_multiple_choice: 4,
    sjt: 0,
  },
  domain_coverage: [
    { domain_id: "D1", domain_name: "Personality Architecture", dimension_ids: ["D1-CE", "D1-EO", "D1-ES", "D1-IO"], item_count: 13 },
    { domain_id: "D2", domain_name: "Cognitive Architecture", dimension_ids: ["D2-DC", "D2-LA", "D2-NR"], item_count: 4 },
    { domain_id: "D4", domain_name: "Interpersonal and Emotional Functioning", dimension_ids: ["D4-RC", "D4-RM"], item_count: 5 },
  ],
  agent_selection_rationale: "For an IC Software Engineer in a fast-paced startup, the assessment prioritizes conscientiousness and follow-through (sprint delivery), exploratory openness and learning agility (new tools, ambiguous requirements), emotional steadiness (code-review pressure), and interpersonal orientation (cross-functional collaboration). Cognitive items focus on numerical reasoning and decision complexity given the analytical nature of engineering work. D4 resilience and relationship management items address the demands of code review culture and debugging setbacks.",
  generated_at: "2026-06-08T09:04:00Z",
  contextualized_items: [
    {
      item_id: "NEX-GMB-001",
      original_text: "I often struggle to keep my commitments when unexpected tasks come up.",
      contextualized_text: "When an urgent bug report or an unplanned pull request review comes in, I often struggle to keep my existing commitments on time.",
      contextualization_rationale: "Reliability under interruption is a core delivery trait for IC engineers in a sprint-based environment.",
      display_order: 1,
    },
    {
      item_id: "NEX-GMB-004",
      original_text: "I avoid leaving tasks unfinished at the end of the day.",
      contextualized_text: "I avoid leaving tickets or code tasks in an ambiguous state at the end of my working day.",
      contextualization_rationale: "Follow-through on sprint tasks directly affects team velocity and handoff quality.",
      display_order: 2,
    },
    {
      item_id: "NEX-GMB-007",
      original_text: "Choose the statement that is more like you at work.",
      contextualized_text: "Choose the statement that is more like you when working on engineering tasks.",
      contextualization_rationale: "Forced-choice captures the execution vs. adaptability trade-off relevant to sprint work.",
      display_order: 3,
    },
    {
      item_id: "NEX-GMB-009",
      original_text: "I resist distractions and stay focused on work until it is done.",
      contextualized_text: "When working on a coding task or debugging a problem, I resist distractions — such as Slack notifications or side conversations — and stay focused until I reach a clear stopping point.",
      contextualization_rationale: "Self-discipline under developer workflow conditions; adapted for IC technical focus.",
      display_order: 4,
    },
    {
      item_id: "NEX-GMB-013",
      original_text: "I find it challenging to stay calm and effective when project details are unclear or incomplete.",
      contextualized_text: "When a ticket or feature specification is vague or incomplete, I find it challenging to stay calm and work effectively without more context.",
      contextualization_rationale: "Ambiguity tolerance is directly relevant to startup engineering where requirements evolve mid-sprint.",
      display_order: 5,
    },
    {
      item_id: "NEX-GMB-017",
      original_text: "I often come up with new ideas to improve how we do our work.",
      contextualized_text: "I often come up with ideas to improve our development workflow, tooling, or code quality practices.",
      contextualization_rationale: "Creativity in the IC engineering context means contributing to process and technical improvement.",
      display_order: 6,
    },
    {
      item_id: "NEX-GMB-021",
      original_text: "I look for opportunities to learn new skills or knowledge related to my job.",
      contextualized_text: "I actively seek out opportunities to learn new programming concepts, frameworks, or engineering practices relevant to my work.",
      contextualization_rationale: "Learning appetite is a strong predictor of developer growth and ramp-up speed.",
      display_order: 7,
    },
    {
      item_id: "NEX-GMB-023",
      original_text: "Choose the statement that is more like you at work.",
      contextualized_text: "Choose the statement that is more like you when starting a new engineering task with incomplete information.",
      contextualization_rationale: "Captures the ambiguity tolerance vs. information-gathering trade-off common in engineering decisions.",
      display_order: 8,
    },
    {
      item_id: "NEX-GMB-025",
      original_text: "I often feel unsettled and unclear-headed when unexpected problems arise at work.",
      contextualized_text: "When a production incident occurs or a critical bug is reported unexpectedly, I often feel unsettled and struggle to think clearly about next steps.",
      contextualization_rationale: "Composure under production pressure is a fundamental trait for engineers in customer-facing systems.",
      display_order: 9,
    },
    {
      item_id: "NEX-GMB-029",
      original_text: "Choose the statement that is more like you at work.",
      contextualized_text: "Choose the statement that is more like you when working under technical pressure.",
      contextualization_rationale: "Reveals the composure vs. recovery speed trade-off relevant to incident response.",
      display_order: 10,
    },
    {
      item_id: "NEX-GMB-053",
      original_text: "I keep disagreements professional and avoid personal attacks when conflicts arise.",
      contextualized_text: "When a code review leads to a disagreement about approach or quality, I keep the discussion professional and focused on the code rather than making it personal.",
      contextualization_rationale: "Code review culture requires constructive disagreement management.",
      display_order: 11,
    },
    {
      item_id: "NEX-GMB-055",
      original_text: "I notice when coworkers are having a hard time and offer support.",
      contextualized_text: "I notice when a teammate is blocked or struggling on a task and offer to help or pair with them.",
      contextualization_rationale: "Collaborative support is a key contribution in an interdependent engineering team.",
      display_order: 12,
    },
    {
      item_id: "NEX-GMB-057",
      original_text: "Choose the statement that is more like you at work.",
      contextualized_text: "Choose the statement that is more like you when you notice a conflict or tension within the engineering team.",
      contextualization_rationale: "Reveals conflict-handling style in a collaborative technical setting.",
      display_order: 13,
    },
    {
      item_id: "NEX-GMB-090",
      original_text: "You have three urgent tasks but time to complete only one fully. Which should you prioritize?",
      contextualized_text: "You have three urgent engineering tasks — a critical bug fix, a feature PR review, and a design discussion — but only enough time to fully complete one. Which should you prioritize?",
      contextualization_rationale: "Prioritization under constraint is directly tested through engineering task selection scenarios.",
      display_order: 14,
    },
    {
      item_id: "NEX-GMB-096",
      original_text: "When project data is incomplete, what is the best way to handle the uncertainty?",
      contextualized_text: "When requirements or technical specifications for a feature are incomplete, what is the best way to handle the uncertainty?",
      contextualization_rationale: "Uncertainty handling in engineering contexts — incomplete specs are a daily reality.",
      display_order: 15,
    },
    {
      item_id: "NEX-GMB-099",
      original_text: "A team shifts to a new software tool with minimal disruption to their workflow. What is the best explanation?",
      contextualized_text: "An engineering team adopts a new deployment pipeline with minimal disruption to their release cadence. What best explains this?",
      contextualization_rationale: "Adaptation speed item framed in a software tooling context directly relevant to IC engineers.",
      display_order: 16,
    },
    {
      item_id: "NEX-GMB-114",
      original_text: "Sales figures for five months are: 120, 135, 150, 165, 180. What is the pattern and the next expected month's sales?",
      contextualized_text: "Error counts over five sprints are: 12, 11, 10, 9, 8. What is the pattern and what should the next sprint's error count be if the trend continues?",
      contextualization_rationale: "Numerical pattern recognition framed with engineering metrics makes the task more ecologically valid for the role.",
      display_order: 17,
    },
    {
      item_id: "NEX-GMB-219",
      original_text: "It often takes me a long time to get back to normal productivity after a setback at work.",
      contextualized_text: "After a failed deployment or a significant bug that goes to production, it often takes me a long time to get back to my normal productivity.",
      contextualization_rationale: "Bounce-back speed from engineering failures is a real resilience demand for IC developers.",
      display_order: 18,
    },
    {
      item_id: "NEX-GMB-221",
      original_text: "I maintain effort on long-term work goals despite challenges and distractions.",
      contextualized_text: "I maintain steady effort toward sprint goals even when blockers, production incidents, or ad hoc requests compete for my attention.",
      contextualization_rationale: "Endurance in a high-interruption engineering environment is a key performance differentiator.",
      display_order: 19,
    },
    {
      item_id: "NEX-GMB-224",
      original_text: "I continue trying to solve problems even when initial attempts fail.",
      contextualized_text: "When I hit a bug or technical problem that resists my first few debugging attempts, I keep trying different approaches rather than escalating or giving up.",
      contextualization_rationale: "Persistence in debugging is a fundamental IC engineering competency.",
      display_order: 20,
    },
    {
      item_id: "NEX-GMB-232",
      original_text: "When disagreements arise, I address them promptly by discussing the issue directly with those involved.",
      contextualized_text: "When I disagree with a code review comment or an architectural decision, I address it directly by discussing it with the person involved rather than letting it fester.",
      contextualization_rationale: "Conflict handling in code review and technical discussions is a relationship management skill for engineers.",
      display_order: 21,
    },
    {
      item_id: "NEX-GMB-239",
      original_text: "I share relevant information openly to build trust within my team.",
      contextualized_text: "I proactively share updates, blockers, or technical context with my team rather than waiting to be asked — including in standups and asynchronous channels.",
      contextualization_rationale: "Transparent information sharing is a core trust-building behavior in distributed or async engineering teams.",
      display_order: 22,
    },
  ],
};

// ─── Assessment Blueprint B — Operations Manager ─────────────────────────────
// 26 items covering D1/D2/D4 with logistics/management contextualization.

export const ASSESSMENT_BLUEPRINT_B: AssessmentBlueprint = {
  assessment_blueprint_id: "abp-002",
  role_blueprint_id: "bp-002",
  total_items: 26,
  estimated_duration_min: 40,
  method_mix: {
    likert: 9,
    contextual_self_report: 7,
    forced_choice: 4,
    cognitive_multiple_choice: 4,
    sjt: 2,
  },
  domain_coverage: [
    { domain_id: "D1", domain_name: "Personality Architecture", dimension_ids: ["D1-CE", "D1-ES", "D1-IN", "D1-IO"], item_count: 13 },
    { domain_id: "D2", domain_name: "Cognitive Architecture", dimension_ids: ["D2-DC", "D2-VR"], item_count: 6 },
    { domain_id: "D4", domain_name: "Interpersonal and Emotional Functioning", dimension_ids: ["D4-RC", "D4-RM", "D4-SO"], item_count: 7 },
  ],
  agent_selection_rationale: "For an Operations Manager in a high-pressure logistics environment, the assessment emphasises conscientiousness and time discipline (execution reliability), emotional steadiness and integrity (regulated environment with high failure cost), and interpersonal orientation (team leadership). Cognitive items prioritise decision complexity and verbal reasoning given the stakeholder communication and prioritisation demands. D4 items cover resilience under peak-period pressure, relationship management with a diverse team, and social awareness for managing 12 direct reports.",
  generated_at: "2026-06-10T10:04:00Z",
  contextualized_items: [
    {
      item_id: "NEX-GMB-001",
      original_text: "I often struggle to keep my commitments when unexpected tasks come up.",
      contextualized_text: "When an unexpected operational issue or staff absence arises during a busy shift, I often struggle to keep the commitments I made to my team or management.",
      contextualization_rationale: "Reliability under operational disruption is central to a manager's credibility with their team.",
      display_order: 1,
    },
    {
      item_id: "NEX-GMB-004",
      original_text: "I avoid leaving tasks unfinished at the end of the day.",
      contextualized_text: "I avoid ending my shift with unresolved operational issues or incomplete handovers that could affect the next shift.",
      contextualization_rationale: "Shift handover quality is a critical execution discipline in logistics operations.",
      display_order: 2,
    },
    {
      item_id: "NEX-GMB-007",
      original_text: "Choose the statement that is more like you at work.",
      contextualized_text: "Choose the statement that is more like you when managing your operations team's work.",
      contextualization_rationale: "Captures the task closure vs. adaptive flexibility trade-off in a manager's daily prioritization.",
      display_order: 3,
    },
    {
      item_id: "NEX-GMB-011",
      original_text: "I start meetings and work tasks at the scheduled time without delay.",
      contextualized_text: "I start team briefings and operational handovers at the scheduled time without delay, even when the shift is busy.",
      contextualization_rationale: "Time discipline in logistics management directly affects dispatch timing and staff confidence.",
      display_order: 4,
    },
    {
      item_id: "NEX-GMB-031",
      original_text: "I maintain steady performance when facing tight deadlines.",
      contextualized_text: "I maintain steady performance during peak dispatch windows or end-of-day targets even when multiple issues compete for my attention.",
      contextualization_rationale: "Pressure stability under time-critical operational targets is a core manager trait in logistics.",
      display_order: 5,
    },
    {
      item_id: "NEX-GMB-035",
      original_text: "I handle high-pressure situations without losing my calm.",
      contextualized_text: "I handle high-pressure situations — such as a vehicle breakdown during a major dispatch run — without losing my composure or the trust of my team.",
      contextualization_rationale: "Stress tolerance during operational crises is essential for a manager whose team looks to them for direction.",
      display_order: 6,
    },
    {
      item_id: "NEX-GMB-029",
      original_text: "Choose the statement that is more like you at work.",
      contextualized_text: "Choose the statement that is more like you when under operational pressure during a peak period.",
      contextualization_rationale: "Reveals composure vs. recovery trade-off under logistics management pressure.",
      display_order: 7,
    },
    {
      item_id: "NEX-GMB-037",
      original_text: "I sometimes fail to follow through on my commitments when unexpected challenges arise.",
      contextualized_text: "When a compliance deadline or a commitment to the Head of Operations is disrupted by an unexpected incident, I sometimes fail to follow through.",
      contextualization_rationale: "Accountability under disruption is measured with restrictions due to its use in a regulated context.",
      display_order: 8,
    },
    {
      item_id: "NEX-GMB-041",
      original_text: "I clearly communicate facts even when the truth is difficult to share.",
      contextualized_text: "I clearly communicate operational setbacks or compliance issues to senior management even when the news is difficult to share.",
      contextualization_rationale: "Honesty in reporting is a regulated-environment requirement for this role.",
      display_order: 9,
    },
    {
      item_id: "NEX-GMB-047",
      original_text: "You discover a coworker has been improperly billing expenses. What is the strongest response?",
      contextualized_text: "You discover that a driver in your team has been falsifying vehicle check records. What is the strongest response?",
      contextualization_rationale: "Integrity orientation in a regulated context — falsification of safety records is a direct compliance risk.",
      display_order: 10,
    },
    {
      item_id: "NEX-GMB-053",
      original_text: "I keep disagreements professional and avoid personal attacks when conflicts arise.",
      contextualized_text: "When a conflict arises between two members of my warehouse team, I keep the conversation professional and focused on the work issue rather than making it personal.",
      contextualization_rationale: "Conflict restraint for a manager leading 12 frontline staff is a daily interpersonal demand.",
      display_order: 11,
    },
    {
      item_id: "NEX-GMB-055",
      original_text: "I notice when coworkers are having a hard time and offer support.",
      contextualized_text: "I notice when a member of my team is under strain — from workload, personal issues, or conflict — and offer appropriate support or a private conversation.",
      contextualization_rationale: "Empathy in frontline management prevents attrition and supports team safety culture.",
      display_order: 12,
    },
    {
      item_id: "NEX-GMB-057",
      original_text: "Choose the statement that is more like you at work.",
      contextualized_text: "Choose the statement that is more like you when managing a conflict within your team.",
      contextualization_rationale: "Captures direct conflict resolution vs. harmony-preservation preference in a people-management context.",
      display_order: 13,
    },
    {
      item_id: "NEX-GMB-087",
      original_text: "You must choose a vendor based on cost, quality, and delivery time. Which factor best indicates the overall best choice?",
      contextualized_text: "You must choose between two logistics partners for a new route. One offers lower cost but inconsistent delivery times; the other is more expensive but reliable. Which factor best guides your decision?",
      contextualization_rationale: "Multi-criteria vendor selection is a real operational decision this manager would face.",
      display_order: 14,
    },
    {
      item_id: "NEX-GMB-090",
      original_text: "You have three urgent tasks but time to complete only one fully. Which should you prioritize?",
      contextualized_text: "During a peak shift, you have three urgent demands: a safety incident report due within the hour, a driver calling in sick requiring coverage, and a supplier complaint escalation. You can only address one fully right now. Which do you prioritize?",
      contextualization_rationale: "Prioritization under constraint framed with logistics-specific operational scenarios.",
      display_order: 15,
    },
    {
      item_id: "NEX-GMB-135",
      original_text: "A company claims that increasing remote work options will improve productivity because employees have more flexibility. Which is the safest conclusion?",
      contextualized_text: "A report argues that introducing flexible shift scheduling for warehouse staff will improve productivity because staff will feel more in control. Which is the safest conclusion from this claim?",
      contextualization_rationale: "Argument evaluation in a management context — testing whether the manager can assess causal claims about operational changes.",
      display_order: 16,
    },
    {
      item_id: "NEX-GMB-141",
      original_text: "A report says sales increased after expanding the marketing budget. What is the most reasonable inference?",
      contextualized_text: "After introducing a new driver induction programme, error rates on vehicle check forms dropped by 30%. What is the most reasonable inference?",
      contextualization_rationale: "Inference from operational data framed with logistics-specific metrics.",
      display_order: 17,
    },
    {
      item_id: "NEX-GMB-219",
      original_text: "It often takes me a long time to get back to normal productivity after a setback at work.",
      contextualized_text: "After a serious operational incident or a significant team failure, it often takes me a long time to get back to managing my team at my normal effectiveness.",
      contextualization_rationale: "Bounce-back speed from operational setbacks is critical for a manager whose team needs stability.",
      display_order: 18,
    },
    {
      item_id: "NEX-GMB-221",
      original_text: "I maintain effort on long-term work goals despite challenges and distractions.",
      contextualized_text: "I maintain focus on longer-term operational improvement goals — like reducing error rates or improving on-time delivery — even when daily crises constantly pull my attention.",
      contextualization_rationale: "Endurance for a manager means sustaining strategic focus under daily firefighting pressure.",
      display_order: 19,
    },
    {
      item_id: "NEX-GMB-228",
      original_text: "I handle criticism or setbacks without losing confidence in my work abilities.",
      contextualized_text: "When senior management criticises my team's operational performance or a KPI target is missed, I handle the feedback without losing confidence in my management approach.",
      contextualization_rationale: "Setback tolerance in a management accountability context.",
      display_order: 20,
    },
    {
      item_id: "NEX-GMB-223",
      original_text: "You receive critical feedback on a project you led that was not successful. What is the strongest response?",
      contextualized_text: "Your operations team missed its on-time dispatch target for three consecutive weeks. Your Head of Operations provides critical feedback about your management approach. What is the strongest response?",
      contextualization_rationale: "Resilience and accountability in response to performance feedback — directly calibrated to a manager's operational KPI failure.",
      display_order: 21,
    },
    {
      item_id: "NEX-GMB-232",
      original_text: "When disagreements arise, I address them promptly by discussing the issue directly with those involved.",
      contextualized_text: "When a conflict arises between two team members on the warehouse floor, I address it promptly by speaking directly with those involved rather than waiting for it to escalate.",
      contextualization_rationale: "Conflict handling speed is critical for a manager whose team's safety culture depends on clear norms.",
      display_order: 22,
    },
    {
      item_id: "NEX-GMB-235",
      original_text: "I adjust my communication style to suit the audience's preferences and concerns.",
      contextualized_text: "I adjust how I communicate depending on whether I am speaking to a driver on the floor, a supplier representative, or the Head of Operations — recognising that each audience has different needs.",
      contextualization_rationale: "Influence tone adaptability across a highly diverse stakeholder audience is a core management competency in logistics.",
      display_order: 23,
    },
    {
      item_id: "NEX-GMB-236",
      original_text: "A team member shares that they feel excluded from important decisions. How should you respond to best manage the relationship?",
      contextualized_text: "A senior driver tells you they feel excluded from decisions about route changes that directly affect their working conditions. How should you respond to best manage this relationship?",
      contextualization_rationale: "Inclusion and relationship repair with frontline staff is a real management scenario in logistics operations.",
      display_order: 24,
    },
    {
      item_id: "NEX-GMB-248",
      original_text: "I reflect on my role in team conflicts to improve future interactions.",
      contextualized_text: "After a team conflict or a difficult disciplinary conversation, I reflect on my role in how it unfolded to improve how I handle similar situations in the future.",
      contextualization_rationale: "Self-reflection after conflict is a developmental competency important for managers seeking to improve their leadership impact.",
      display_order: 25,
    },
    {
      item_id: "NEX-GMB-255",
      original_text: "I try to see situations from my coworkers' perspectives before responding.",
      contextualized_text: "Before responding to a team member's complaint or pushback, I try to understand their perspective — considering the pressures of their specific shift role or working conditions.",
      contextualization_rationale: "Perspective taking for a frontline manager with 12 diverse staff in physically demanding roles.",
      display_order: 26,
    },
  ],
};

export const ASSESSMENT_BLUEPRINTS = [ASSESSMENT_BLUEPRINT_A, ASSESSMENT_BLUEPRINT_B];

export function getAssessmentBlueprintById(id: string): AssessmentBlueprint | undefined {
  return ASSESSMENT_BLUEPRINTS.find((ab) => ab.assessment_blueprint_id === id);
}

export function getAssessmentBlueprintByRoleBlueprint(roleBlueprintId: string): AssessmentBlueprint | undefined {
  return ASSESSMENT_BLUEPRINTS.find((ab) => ab.role_blueprint_id === roleBlueprintId);
}
