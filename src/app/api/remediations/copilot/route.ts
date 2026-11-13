import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function GET(request: Request) {
  return proxyToBackend(request, {
    path: "/remediations/copilot",
    mode: "json",
    forwardQuery: true,
    mock: { enabled: true, remediations: [] },
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "errors.badRequest", status: 400 }, { status: 400 });
  }

  return proxyToBackend(request, {
    path: "/remediations/copilot",
    method: "POST",
    mode: "json",
    body,
    mock: { authorizeUrl: "/api/github/copilot/callback?code=mock&state=mock" },
  });
}
