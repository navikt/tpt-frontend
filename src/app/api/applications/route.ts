import { mockVulnerabilitiesPayload } from "@/app/mocks/mockPayloads";
import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function GET(request: Request) {
  return proxyToBackend(request, {
    path: "/vulnerabilities/user",
    mode: "stream",
    mock: mockVulnerabilitiesPayload,
  });
}
