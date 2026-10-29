import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function GET(request: Request) {
  return proxyToBackend(request, {
    path: "/events",
    mode: "sse",
  });
}
