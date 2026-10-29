import { mockGoldenPathChecks } from "@/app/mocks/mockPayloads";
import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function GET(request: Request) {
  return proxyToBackend(request, {
    path: "/checks",
    mode: "stream",
    mock: mockGoldenPathChecks,
  });
}
