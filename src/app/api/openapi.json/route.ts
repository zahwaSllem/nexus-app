// Nexus — GET /api/openapi.json
// Serves the OpenAPI 3.0 spec for the implemented API surface. Public (docs only).
import { NextResponse } from "next/server";
import { buildOpenApiSpec } from "@/lib/api/openapi";

export function GET() {
  return NextResponse.json(buildOpenApiSpec());
}
