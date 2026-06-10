import type {
  BankItem,
  ItemResponse,
  ScoredResult,
  DomainScore,
  DimensionScore,
  ConfidenceBand,
  DisplayState,
  QCFlag,
  ValidityState,
  ReleaseState,
} from "@/lib/types/nexus";

// ─── Mock scoring engine ───────────────────────────────────────────────────────
// Follows ScoringSpecification.md structure.
// This is a deterministic mock — it applies the correct rules from the spec
// but does not run real GGUM or IRT models.
//
// Rules applied:
// 1. Reverse scoring: reversed = 6 - raw for non-cognitive items with reverse_scored = true
// 2. Cognitive/SJT: 1 if selected == keyed_answer, else 0
// 3. Forced-choice: +1 to dimension A (pole A selected) or dimension B (pole B selected)
//    using a hardcoded polarity map below
// 4. Facet/dimension mean: mean of scored item values in that dimension
// 5. Domain mean: mean of dimension scores in that domain
// 6. Standardize to 0–100 using a linear provisional transform:
//    - Non-cognitive: raw mean (1–5) → standardized = (raw_mean - 1) / 4 * 100
//    - Cognitive/SJT: proportion correct * 100
// 7. Standard error: mock SE assigned per domain (proxy for calibration status)
// 8. Confidence band: SE ≤ 0.25 → HIGH, 0.25–0.35 → MODERATE, 0.35–0.45 → LOW, >0.45 → UNACCEPTABLE
// 9. Display state: Validation(O) × Confidence(O) × Permission(O) — all binary
// 10. QC flags: straightlining check on non-cognitive items; reverse inconsistency check
// 11. Validity state and release state derived from flag severity and completion ratio
//
// Forced-choice polarity map: option A = 1 (scores primary dimension), option B = 0
// This is a provisional placeholder — real polarity maps belong in a config table.

const FORCED_CHOICE_POLARITY: Record<string, { a_scores: string; b_scores: string }> = {
  "NEX-GMB-007": { a_scores: "D1-CE", b_scores: "D1-EO" },
  "NEX-GMB-008": { a_scores: "D1-CE", b_scores: "D1-CE" },
  "NEX-GMB-023": { a_scores: "D1-CE", b_scores: "D1-EO" },
  "NEX-GMB-029": { a_scores: "D1-ES", b_scores: "D1-ES" },
  "NEX-GMB-057": { a_scores: "D1-IO", b_scores: "D1-IO" },
  "NEX-GMB-067": { a_scores: "D1-SA", b_scores: "D1-SA" },
};

// Mock SE by domain — proxy for V1 calibration status
const MOCK_SE_BY_DOMAIN: Record<string, number> = {
  D1: 0.22,
  D2: 0.30,
  D3: 0.42, // pilot — effectively LOW
  D4: 0.27,
  D5: 0.48, // blocked — would be UNACCEPTABLE
};

// Domains with operational_blocked status — never scored
const BLOCKED_DOMAINS = new Set(["D3", "D5"]);

// ─── Main scoring function ────────────────────────────────────────────────────

export function mockScore(
  responses: ItemResponse[],
  items: BankItem[],
  sessionId: string
): ScoredResult {
  const scoringRunId = `score-${Date.now()}`;
  const completionRatio = responses.length / items.length;

  // Step 1: Score each item
  const itemScores = scoreItems(responses, items);

  // Step 2: Group scored items by domain → dimension
  const byDomain = groupByDomain(itemScores, items);

  // Step 3: Compute dimension and domain scores
  const domainScores = computeDomainScores(byDomain);

  // Step 4: Run QC checks
  const qcFlags = runQCChecks(responses, items, itemScores);

  // Step 5: Determine validity state and release state
  const { validityState, releaseState } = deriveValidityAndRelease(
    completionRatio,
    qcFlags,
    domainScores
  );

  return {
    scoring_run_id: scoringRunId,
    session_id: sessionId,
    bank_version: "final",
    norm_version: "provisional",
    scoring_version: "1.0.0-provisional",
    synthesis_weight_version: "1.0.0-provisional",
    validity_state: validityState,
    release_state: releaseState,
    domain_scores: domainScores,
    qc_flags: qcFlags,
    completion_ratio: Math.round(completionRatio * 100) / 100,
    scored_at: new Date().toISOString(),
  };
}

// ─── Item scoring ──────────────────────────────────────────────────────────────

type ItemScore = {
  item_id: string;
  dimension_id: string;
  domain_id: string;
  method_family: BankItem["method_family"];
  scored_value: number;
  was_reversed: boolean;
};

function scoreItems(responses: ItemResponse[], items: BankItem[]): ItemScore[] {
  const itemMap = new Map(items.map((i) => [i.item_id, i]));
  const scores: ItemScore[] = [];

  for (const response of responses) {
    const item = itemMap.get(response.item_id);
    if (!item) continue;
    if (BLOCKED_DOMAINS.has(item.domain_id)) continue;

    let scored_value: number;
    let was_reversed = false;

    if (response.method_family === "likert" || response.method_family === "contextual_self_report") {
      const raw = response.value;
      if (item.reverse_scored) {
        scored_value = 6 - raw;
        was_reversed = true;
      } else {
        scored_value = raw;
      }
    } else if (response.method_family === "cognitive_multiple_choice" || response.method_family === "sjt") {
      scored_value = response.selected_option === item.keyed_answer ? 1 : 0;
    } else if (response.method_family === "forced_choice") {
      // Option A → 1 (A pole), option B → 0
      scored_value = response.selected_option === "A" ? 1 : 0;
    } else {
      scored_value = 0;
    }

    scores.push({
      item_id: item.item_id,
      dimension_id: item.dimension_id,
      domain_id: item.domain_id,
      method_family: item.method_family,
      scored_value,
      was_reversed,
    });
  }

  return scores;
}

// ─── Group by domain → dimension ──────────────────────────────────────────────

type DomainGrouped = Record<
  string,
  { domain_name: string; dimensions: Record<string, { dimension_name: string; scores: ItemScore[] }> }
>;

function groupByDomain(itemScores: ItemScore[], items: BankItem[]): DomainGrouped {
  const itemMeta = new Map(items.map((i) => [i.item_id, i]));
  const grouped: DomainGrouped = {};

  for (const score of itemScores) {
    const meta = itemMeta.get(score.item_id);
    if (!meta) continue;

    if (!grouped[score.domain_id]) {
      grouped[score.domain_id] = { domain_name: meta.domain_name, dimensions: {} };
    }
    if (!grouped[score.domain_id].dimensions[score.dimension_id]) {
      grouped[score.domain_id].dimensions[score.dimension_id] = {
        dimension_name: meta.dimension_name,
        scores: [],
      };
    }
    grouped[score.domain_id].dimensions[score.dimension_id].scores.push(score);
  }

  return grouped;
}

// ─── Compute dimension and domain scores ──────────────────────────────────────

function computeDomainScores(grouped: DomainGrouped): DomainScore[] {
  const domainScores: DomainScore[] = [];

  for (const [domainId, domainData] of Object.entries(grouped)) {
    const se = MOCK_SE_BY_DOMAIN[domainId] ?? 0.30;
    const dimensionScores: DimensionScore[] = [];

    for (const [dimId, dimData] of Object.entries(domainData.dimensions)) {
      const scores = dimData.scores;
      if (scores.length === 0) continue;

      const mean = scores.reduce((sum, s) => sum + s.scored_value, 0) / scores.length;

      // Determine if dimension is cognitive (proportion-correct scale) or noncognitive (1–5 scale)
      const isCognitive = scores.some(
        (s) => s.method_family === "cognitive_multiple_choice" || s.method_family === "sjt"
      );

      // Provisional linear transform to 0–100
      const standardizedScore = isCognitive
        ? Math.round(mean * 100)
        : Math.round(((mean - 1) / 4) * 100);

      const confidence = classifyConfidence(se);
      const displayState = determineDisplayState(domainId, confidence);
      const reverseCount = scores.filter((s) => s.was_reversed).length;

      dimensionScores.push({
        dimension_id: dimId,
        dimension_name: dimData.dimension_name,
        domain_id: domainId,
        raw_score: Math.round(mean * 100) / 100,
        standardized_score: Math.min(100, Math.max(0, standardizedScore)),
        standard_error: se,
        confidence,
        display_state: displayState,
        item_count: scores.length,
        reverse_items_applied: reverseCount,
      });
    }

    if (dimensionScores.length === 0) continue;

    const visibleDims = dimensionScores.filter(
      (d) => d.display_state !== "hidden" && d.display_state !== "blocked"
    );
    const domainStandardized =
      visibleDims.length > 0
        ? Math.round(
            visibleDims.reduce((sum, d) => sum + d.standardized_score, 0) / visibleDims.length
          )
        : 0;

    const domainConfidence = classifyConfidence(se);

    domainScores.push({
      domain_id: domainId,
      domain_name: domainData.domain_name,
      standardized_score: domainStandardized,
      confidence: domainConfidence,
      dimensions: dimensionScores,
    });
  }

  return domainScores;
}

// ─── Confidence classification ────────────────────────────────────────────────

function classifyConfidence(se: number): ConfidenceBand {
  if (se <= 0.25) return "HIGH";
  if (se <= 0.35) return "MODERATE";
  if (se <= 0.45) return "LOW";
  return "UNACCEPTABLE";
}

// ─── Display state determination ─────────────────────────────────────────────
// Simplified version of AutomatedReportingStandard.md formula:
// DisplayState = f(Validation, Confidence, Permission, Use)

function determineDisplayState(domainId: string, confidence: ConfidenceBand): DisplayState {
  if (BLOCKED_DOMAINS.has(domainId)) return "blocked";

  switch (confidence) {
    case "HIGH": return "visible";
    case "MODERATE": return "visible_with_caution";
    case "LOW": return "downgraded";
    case "UNACCEPTABLE": return "hidden";
  }
}

// ─── QC checks ────────────────────────────────────────────────────────────────

function runQCChecks(
  responses: ItemResponse[],
  items: BankItem[],
  _itemScores: ItemScore[]
): QCFlag[] {
  const flags: QCFlag[] = [];
  const itemMap = new Map(items.map((i) => [i.item_id, i]));

  // 1. Straightlining check — all same value across non-cognitive items
  const nonCognitiveResponses = responses.filter(
    (r) => r.method_family === "likert" || r.method_family === "contextual_self_report"
  ) as Array<{ item_id: string; method_family: string; value: number; latency_ms: number }>;

  if (nonCognitiveResponses.length >= 5) {
    const values = nonCognitiveResponses.map((r) => r.value);
    const unique = new Set(values).size;
    const straightlineRatio = values.filter((v) => v === values[0]).length / values.length;

    if (unique === 1) {
      flags.push({
        flag_code: "straightlining_detected",
        severity: "high",
        description: "All non-cognitive items answered with the same value. Response pattern suggests disengaged or invalid responding.",
      });
    } else if (straightlineRatio >= 0.75) {
      flags.push({
        flag_code: "straightlining_watch",
        severity: "moderate",
        description: `${Math.round(straightlineRatio * 100)}% of non-cognitive responses share the same value. Possible acquiescent responding.`,
      });
    }
  }

  // 2. Reverse inconsistency check — flag when positive and reverse items in same dimension strongly disagree
  const reversePairs: Array<[string, string]> = [
    ["NEX-GMB-001", "NEX-GMB-004"], // D1-CE: reverse vs. positive
    ["NEX-GMB-025", "NEX-GMB-031"], // D1-ES: reverse vs. positive
    ["NEX-GMB-219", "NEX-GMB-221"], // D4-RC: reverse vs. positive
  ];

  for (const [reverseId, positiveId] of reversePairs) {
    const reverseResp = responses.find((r) => r.item_id === reverseId);
    const positiveResp = responses.find((r) => r.item_id === positiveId);
    if (!reverseResp || !positiveResp) continue;

    const rv = "value" in reverseResp ? reverseResp.value : 0;
    const pv = "value" in positiveResp ? positiveResp.value : 0;

    // Reverse item: low score = more of the trait. Positive item: high score = more of the trait.
    // Inconsistency: if reverse item is very high (1, 2) AND positive item is also very high (4, 5) → agree with both = inconsistent
    const reverseItem = itemMap.get(reverseId);
    if (reverseItem?.reverse_scored) {
      const correctedReverse = 6 - rv;
      if (Math.abs(correctedReverse - pv) >= 3) {
        flags.push({
          flag_code: "reverse_consistency_watch",
          severity: "low",
          description: `Minor inconsistency detected between ${reverseId} (reverse-scored) and ${positiveId}. Response pattern is within acceptable range but flagged for monitoring.`,
          affected_domain: reverseItem.domain_id,
        });
        break; // Only flag once
      }
    }
  }

  // 3. Latency anomaly — unrealistically fast responses
  const fastResponses = responses.filter((r) => r.latency_ms < 500).length;
  if (fastResponses > responses.length * 0.3) {
    flags.push({
      flag_code: "latency_anomaly",
      severity: "moderate",
      description: `${fastResponses} responses completed in under 500ms. Unusually fast response pattern may indicate disengaged responding.`,
    });
  }

  return flags;
}

// ─── Validity and release state ───────────────────────────────────────────────

function deriveValidityAndRelease(
  completionRatio: number,
  qcFlags: QCFlag[],
  domainScores: DomainScore[]
): { validityState: ValidityState; releaseState: ReleaseState } {
  const highSeverityFlags = qcFlags.filter((f) => f.severity === "high").length;
  const moderateSeverityFlags = qcFlags.filter((f) => f.severity === "moderate").length;

  const lowConfidenceDimensions = domainScores
    .flatMap((d) => d.dimensions)
    .filter((dim) => dim.confidence === "LOW" || dim.confidence === "UNACCEPTABLE").length;

  if (completionRatio < 0.85) {
    return { validityState: "INCOMPLETE", releaseState: "Assessment incomplete" };
  }

  if (highSeverityFlags >= 2 || (highSeverityFlags === 1 && moderateSeverityFlags >= 2)) {
    return {
      validityState: "VALID_BUT_UNINTERPRETABLE",
      releaseState: "Invalid for interpretation",
    };
  }

  if (highSeverityFlags === 1 || moderateSeverityFlags >= 2 || lowConfidenceDimensions >= 3) {
    return { validityState: "PASS_WITH_LIMITS", releaseState: "Partial Release" };
  }

  if (moderateSeverityFlags === 1 || lowConfidenceDimensions >= 1) {
    return { validityState: "PASS_WITH_LIMITS", releaseState: "Released with Caution" };
  }

  return { validityState: "VALID", releaseState: "Released" };
}

// ─── Convenience: build empty responses for testing ───────────────────────────

export function buildMockResponses(items: BankItem[]): ItemResponse[] {
  const result: ItemResponse[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const latency = 3000 + Math.floor(Math.random() * 12000);

    if (item.method_family === "likert") {
      const value = ([3, 4, 4, 5, 3, 4, 3, 4, 5, 4][i % 10] as 1 | 2 | 3 | 4 | 5);
      result.push({ item_id: item.item_id, method_family: "likert", value, latency_ms: latency });
      continue;
    }

    if (item.method_family === "contextual_self_report") {
      const value = ([4, 3, 4, 5, 3, 4, 4, 3, 5, 4][i % 10] as 1 | 2 | 3 | 4 | 5);
      result.push({ item_id: item.item_id, method_family: "contextual_self_report", value, latency_ms: latency });
      continue;
    }

    if (item.method_family === "forced_choice") {
      const selected_option: "A" | "B" = i % 2 === 0 ? "A" : "B";
      result.push({ item_id: item.item_id, method_family: "forced_choice", selected_option, latency_ms: latency });
      continue;
    }

    if (item.method_family === "cognitive_multiple_choice") {
      const options: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];
      const keyed = (item.keyed_answer ?? "A") as "A" | "B" | "C" | "D" | "E";
      const selected_option = Math.random() < 0.70 ? keyed : options[Math.floor(Math.random() * options.length)];
      result.push({ item_id: item.item_id, method_family: "cognitive_multiple_choice", selected_option, latency_ms: latency });
      continue;
    }

    if (item.method_family === "sjt") {
      const options: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];
      const keyed = (item.keyed_answer ?? "A") as "A" | "B" | "C" | "D" | "E";
      const selected_option = Math.random() < 0.70 ? keyed : options[Math.floor(Math.random() * options.length)];
      result.push({ item_id: item.item_id, method_family: "sjt", selected_option, latency_ms: latency });
      continue;
    }
  }

  return result;
}
