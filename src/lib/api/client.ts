// Nexus — Frontend API client
// ─────────────────────────────────────────────────────────────────────────────
// A single fetch helper for every backend call. It:
//   • prepends API_BASE_URL (empty → same-origin),
//   • sends credentials (the Auth.js session cookie) on every request,
//   • serializes a JSON body + sets Content-Type when a body is given,
//   • parses JSON responses (tolerates empty/no-content bodies),
//   • normalizes ALL failures into a typed ApiError with a stable `code`.
//
// This module is UI-agnostic and side-effect free at import time. It is NOT wired
// into any page yet — the service modules that use it are dormant until the
// data-source toggle flips to "api".
// ─────────────────────────────────────────────────────────────────────────────

import { API_BASE_URL } from "@/lib/api/config";

/** Stable, UI-friendly error codes derived from HTTP status. */
export type ApiErrorCode =
  | "bad_request" // 400
  | "unauthenticated" // 401
  | "forbidden" // 403
  | "not_found" // 404
  | "conflict" // 409
  | "unprocessable" // 422
  | "server_error" // 5xx
  | "network_error" // fetch threw (offline, CORS, DNS…)
  | "http_error"; // any other non-2xx

/** The normalized shape every caller can rely on. */
export interface ApiErrorShape {
  status: number; // HTTP status (0 for network errors)
  code: ApiErrorCode;
  message: string;
  issues?: unknown; // Zod issues[] from the backend, when present
  body?: unknown; // the raw parsed error body, for debugging
}

export class ApiError extends Error implements ApiErrorShape {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly issues?: unknown;
  readonly body?: unknown;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = shape.status;
    this.code = shape.code;
    this.issues = shape.issues;
    this.body = shape.body;
  }
}

/** Map an HTTP status to a stable error code. Exported for unit testing. */
export function statusToCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthenticated";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 422:
      return "unprocessable";
    default:
      if (status >= 500) return "server_error";
      return "http_error";
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** JSON-serializable request body. Sets Content-Type: application/json. */
  json?: unknown;
  /** Raw body passthrough (rarely needed); prefer `json`. */
  body?: BodyInit | null;
  /**
   * Query params appended to the path. Values are coerced with String(); an
   * undefined/null value is skipped. Typed as `unknown` so callers can pass their
   * own strongly-typed query interfaces without an index signature.
   */
  query?: Record<string, unknown>;
}

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const base = `${API_BASE_URL}${path}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/**
 * The one fetch helper. Returns the parsed JSON body typed as T, or throws an
 * ApiError. `credentials: "include"` guarantees the session cookie is sent.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { json, query, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  let body = options.body ?? undefined;
  if (json !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }
  finalHeaders.set("Accept", "application/json");

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      ...rest,
      body,
      headers: finalHeaders,
      credentials: "include", // always send the session cookie
    });
  } catch (cause) {
    throw new ApiError({
      status: 0,
      code: "network_error",
      message: cause instanceof Error ? cause.message : "Network request failed",
    });
  }

  // Parse JSON when present; tolerate empty bodies (e.g. 204).
  const raw = await res.text();
  let parsed: unknown = undefined;
  if (raw.length > 0) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw; // non-JSON payload — keep the text
    }
  }

  if (!res.ok) {
    const errBody = parsed as { error?: string; message?: string; issues?: unknown } | undefined;
    throw new ApiError({
      status: res.status,
      code: statusToCode(res.status),
      message:
        errBody?.error ??
        errBody?.message ??
        `Request failed with status ${res.status}`,
      issues: errBody?.issues,
      body: parsed,
    });
  }

  return parsed as T;
}
