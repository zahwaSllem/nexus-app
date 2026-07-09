// Nexus — Report export helpers (server-only)
// ─────────────────────────────────────────────────────────────────────────────
// V1 PROVISIONAL export. Real PDF binary generation is deferred; instead we
// serialize the SAME report JSON the report APIs already return (admin_view for
// the admin audience, candidate_view for the candidate audience), checksum it
// (sha256), and record a report_exports row. No bytes are written to storage —
// storage_url is a provisional reference, and `provisional: true` says so on the
// wire. Permissions + audit are fully enforced (see the route handlers).
//
// GOVERNANCE: a candidate export can only ever carry the candidate-safe view.
// The admin_view is never serialized for a candidate audience — by construction.
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "node:crypto";
import type { ReportExport } from "@prisma/client";
import {
  ExportStatusResponseSchema,
  type ExportStatusResponseDTO,
} from "@/lib/api/schemas";

export const EXPORT_FORMAT = "pdf";

/** Provisional storage reference (no real object is written in V1). */
export function makeStorageUrl(exportId: string): string {
  return `provisional://nexus/exports/${exportId}.${EXPORT_FORMAT}`;
}

/** sha256 hex of the exact JSON payload being "exported". */
export function checksumOf(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

/** Prisma ReportExport row → export status DTO (provisional stub). */
export function toExportStatusDTO(row: ReportExport): ExportStatusResponseDTO {
  return ExportStatusResponseSchema.parse({
    export_id: row.export_id,
    report_id: row.report_id,
    status: "ready",
    audience: row.audience,
    storage_url: row.storage_url,
    checksum: row.checksum,
    generated_at: row.generated_at.toISOString(),
    provisional: true,
    format: EXPORT_FORMAT,
  });
}
