import { mockGithubPayload } from "@/app/mocks/mockPayloads";
import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function GET(request: Request) {
  return proxyToBackend(request, {
    path: "/vulnerabilities/github/user",
    mode: "json",
    mock: mockGithubPayload,
  });
}
