// Nexus — Report Exports API client (admin or candidate)
// Maps to:
//   POST /api/reports/:reportId/export
//   GET  /api/exports/:exportId
// NOT wired into any page yet. V1 exports are a provisional stub (no real PDF bytes).
import { apiFetch } from "@/lib/api/client";
import type {
  CreateExportRequest,
  ExportStatusResponseDTO,
} from "@/lib/api/schemas";

/** POST /api/reports/:reportId/export — create a (provisional) export. */
export function createExport(
  reportId: string,
  body: CreateExportRequest,
): Promise<ExportStatusResponseDTO> {
  return apiFetch<ExportStatusResponseDTO>(
    `/api/reports/${encodeURIComponent(reportId)}/export`,
    { method: "POST", json: body },
  );
}

/** GET /api/exports/:exportId — an export's status + provisional reference. */
export function getExport(exportId: string): Promise<ExportStatusResponseDTO> {
  return apiFetch<ExportStatusResponseDTO>(
    `/api/exports/${encodeURIComponent(exportId)}`,
  );
}
