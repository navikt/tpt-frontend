import {
  mockSlaOverduePayload,
  mockVulnerabilitiesPayload,
} from "@/app/mocks/mockPayloads";
import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function GET(request: Request) {
  const endpoint = new URL(request.url).searchParams.get("endpoint");
  const path = endpoint === "github"
    ? "/vulnerabilities/github/user"
    : endpoint === "sla" ? "/sla/overdue" : "/vulnerabilities/user";

  return proxyToBackend(request, {
    path,
    mode: "json",
    mock: endpoint === "sla" ? mockSlaOverduePayload : mockVulnerabilitiesPayload,
  });
}
