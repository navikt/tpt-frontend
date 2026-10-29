import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function POST(request: Request) {
  return proxyToBackend(request, {
    path: "/datacollector",
    method: "POST",
    mode: "stream",
    mock: new Response(null, { status: 202 }),
  });
}
