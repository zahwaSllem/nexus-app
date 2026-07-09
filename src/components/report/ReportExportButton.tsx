"use client";

import { useState } from "react";
import { isApiMode } from "@/lib/api/config";
import { ApiError } from "@/lib/api/client";
import { createExport } from "@/lib/api/exports-client";

// ─── Export data contract ─────────────────────────────────────────────────────
// Pages compute a serializable snapshot and hand it to this client component.

export type ExportDomain = {
  domain_id: string;
  domain_name: string;
  standardized_score: number;
  confidence: string;
  dimensions: { dimension_name: string; standardized_score: number; confidence: string }[];
};

export type ExportStrength = {
  title: string;
  score?: number;
  detail: string;
};

export type ReportExportData = {
  candidateName: string;
  reportType: string;
  releaseState: string;
  generatedAt: string;
  reportId?: string;
  domainScores: ExportDomain[];
  strengths: ExportStrength[];
  recommendations: string[];
  /** Admin report only — omitted on candidate exports. */
  governanceNotes?: string[];
};

/**
 * Opt-in, admin-only real export. When provided AND the app is in api mode, the
 * button first calls POST /api/reports/:reportId/export (audience: "admin") to
 * create a real, audit-logged export record, then renders the same client-side
 * print document as before (V1 backend export is a provisional stub — no real
 * PDF bytes are generated server-side either way). Omit this prop (as the
 * candidate report page does) to keep the button fully mock/client-only
 * regardless of data source mode.
 */
export type AdminApiExport = {
  reportId: string;
  audience: "admin";
};

// ─── HTML document builder ────────────────────────────────────────────────────
// Produces a clean, print-optimised standalone document. The browser's
// "Save as PDF" target in the print dialog turns this into the exported file.

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreBarColor(score: number): string {
  if (score >= 75) return "#10b981";
  if (score >= 65) return "#6366f1";
  if (score >= 50) return "#f59e0b";
  return "#94a3b8";
}

interface DocumentMeta {
  /** Banner shown at the top of the printable document. */
  banner: string;
}

function buildDocument(data: ReportExportData, meta: DocumentMeta): string {
  const domainsHtml = data.domainScores
    .map((d) => {
      const dims = d.dimensions
        .map(
          (dim) => `
          <div class="dim">
            <div class="dim-row">
              <span>${esc(dim.dimension_name)} <em>(${esc(dim.confidence)})</em></span>
              <strong>${dim.standardized_score}</strong>
            </div>
            <div class="bar"><span style="width:${Math.max(0, Math.min(100, dim.standardized_score))}%;background:${scoreBarColor(dim.standardized_score)}"></span></div>
          </div>`,
        )
        .join("");
      return `
        <div class="domain">
          <div class="domain-head">
            <span class="chip">${esc(d.domain_id)}</span>
            <span class="domain-name">${esc(d.domain_name)}</span>
            <span class="domain-score">${d.standardized_score}/100 · ${esc(d.confidence)}</span>
          </div>
          ${dims}
        </div>`;
    })
    .join("");

  const strengthsHtml = data.strengths.length
    ? data.strengths
        .map(
          (s) => `
        <li>
          <strong>${esc(s.title)}${s.score !== undefined ? ` — ${s.score}` : ""}</strong>
          <p>${esc(s.detail)}</p>
        </li>`,
        )
        .join("")
    : `<li><p class="muted">No strengths recorded.</p></li>`;

  const recsHtml = data.recommendations.length
    ? data.recommendations.map((r) => `<li><p>${esc(r)}</p></li>`).join("")
    : `<li><p class="muted">No recommendations recorded.</p></li>`;

  const governanceHtml = data.governanceNotes?.length
    ? `
      <section>
        <h2>Governance Notes</h2>
        <ol class="notes">
          ${data.governanceNotes.map((n) => `<li>${esc(n)}</li>`).join("")}
        </ol>
      </section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Nexus Report — ${esc(data.candidateName)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 48px; line-height: 1.5; }
  .mock-banner { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; font-size: 12px; padding: 8px 14px; border-radius: 8px; margin-bottom: 24px; }
  header { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
  .eyebrow { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #6366f1; font-weight: 700; margin: 0; }
  h1 { font-size: 24px; margin: 6px 0 4px; }
  .meta { font-size: 13px; color: #475569; margin: 0; }
  .release { display: inline-block; margin-top: 10px; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 999px; background: #f1f5f9; border: 1px solid #e2e8f0; }
  section { margin-bottom: 26px; page-break-inside: avoid; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .08em; color: #334155; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin: 0 0 12px; }
  .domain { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
  .domain-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .chip { font-family: ui-monospace, monospace; font-weight: 700; font-size: 12px; background: #eef2ff; color: #4338ca; padding: 2px 8px; border-radius: 6px; }
  .domain-name { font-weight: 600; font-size: 14px; }
  .domain-score { margin-left: auto; font-size: 12px; color: #475569; font-weight: 600; }
  .dim { margin: 8px 0; }
  .dim-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px; }
  .dim-row em { color: #94a3b8; font-style: normal; }
  .bar { height: 6px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
  .bar span { display: block; height: 6px; border-radius: 999px; }
  ul, ol { margin: 0; padding-left: 18px; }
  li { margin-bottom: 10px; }
  li strong { font-size: 13px; }
  li p { margin: 2px 0 0; font-size: 12px; color: #475569; }
  .notes li { font-size: 12px; color: #475569; }
  .muted { color: #94a3b8; }
  footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; }
  @media print { body { padding: 24px; } .mock-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="mock-banner">${esc(meta.banner)}</div>

  <header>
    <p class="eyebrow">${esc(data.reportType)}</p>
    <h1>${esc(data.candidateName)}</h1>
    <p class="meta">Generated ${esc(data.generatedAt)}${data.reportId ? ` · Report ${esc(data.reportId)}` : ""}</p>
    <span class="release">Release state: ${esc(data.releaseState)}</span>
  </header>

  <section>
    <h2>Domain Scores</h2>
    ${domainsHtml || '<p class="muted">No domain scores available.</p>'}
  </section>

  <section>
    <h2>Strengths</h2>
    <ul>${strengthsHtml}</ul>
  </section>

  <section>
    <h2>Recommendations</h2>
    <ul>${recsHtml}</ul>
  </section>

  ${governanceHtml}

  <footer>
    Nexus V1 · Scores are provisional. This document is a mock export for demonstration only and is
    not a normatively validated psychometric output.
  </footer>

  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.focus(); window.print(); }, 350);
    });
  </script>
</body>
</html>`;
}

const MOCK_BANNER = "Mock export: final PDF generation will be handled by backend.";
const API_BANNER =
  "Export recorded (server-side, audit-logged). PDF rendering is still a provisional stub in V1.";

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportExportButton({
  data,
  apiExport,
}: {
  data: ReportExportData;
  apiExport?: AdminApiExport;
}) {
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ exportId: string; checksum?: string } | null>(null);

  const useApiExport = Boolean(apiExport) && isApiMode();

  function handleExport() {
    if (loading) return;
    setBlocked(false);
    setError(null);
    setSuccess(null);
    setLoading(true);

    // Open synchronously within the click gesture to avoid popup blocking.
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) {
      setLoading(false);
      setBlocked(true);
      return;
    }
    win.document.write(
      "<!doctype html><title>Preparing report…</title><body style='font-family:sans-serif;color:#475569;padding:48px'>Preparing report…</body>",
    );

    if (useApiExport && apiExport) {
      createExport(apiExport.reportId, { audience: apiExport.audience })
        .then((status) => {
          const html = buildDocument(data, { banner: API_BANNER });
          win.document.open();
          win.document.write(html);
          win.document.close();
          setSuccess({ exportId: status.export_id, checksum: status.checksum });
        })
        .catch((err) => {
          win.close();
          setError(err instanceof ApiError ? err.message : "Failed to create export record.");
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // Mock path — brief delay simulates generation and surfaces the loading state.
    setTimeout(() => {
      const html = buildDocument(data, { banner: MOCK_BANNER });
      win.document.open();
      win.document.write(html);
      win.document.close();
      setLoading(false);
    }, 700);
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        aria-busy={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
      >
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            {useApiExport ? "Exporting…" : "Generating…"}
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10 2a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V3a1 1 0 011-1z" />
              <path d="M4 15a1 1 0 011 1v1h10v-1a1 1 0 112 0v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a1 1 0 011-1z" />
            </svg>
            Download PDF
          </>
        )}
      </button>
      <p className="max-w-[16rem] text-right text-[11px] leading-snug text-slate-400 dark:text-slate-500">
        {useApiExport
          ? "Creates a real, audit-logged export record. PDF rendering is still provisional in V1."
          : "Mock export: final PDF generation will be handled by backend."}
      </p>
      {blocked && (
        <p className="text-right text-[11px] font-medium text-red-500 dark:text-red-400">
          Pop-up blocked — allow pop-ups for this site, then try again.
        </p>
      )}
      {error && (
        <p className="max-w-[16rem] text-right text-[11px] font-medium text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="max-w-[16rem] text-right text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          Export recorded · {success.exportId.slice(0, 8)}
          {success.checksum ? `… · checksum ${success.checksum.slice(0, 8)}…` : "…"}
        </p>
      )}
    </div>
  );
}
