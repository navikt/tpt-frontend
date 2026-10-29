import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function GET(request: Request) {
  return proxyToBackend(request, {
    path: "/admin/teams/overview",
    mode: "json",
  });
}
