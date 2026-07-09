// Nexus — GET /api/docs
// Swagger UI for the Nexus API. Loads Swagger UI assets from a CDN and renders
// the spec served at /api/openapi.json. Documentation only — no data access.
import { NextResponse } from "next/server";

const HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nexus API — Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>body { margin: 0; background: #fafafa; }</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/api/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        docExpansion: "list",
      });
    </script>
  </body>
</html>`;

export function GET() {
  return new NextResponse(HTML, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
