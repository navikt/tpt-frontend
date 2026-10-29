import { mockSlaOverduePayload } from "@/app/mocks/mockPayloads";
import { proxyToBackend } from "@/app/shared/server/backendProxy";

export function GET(request: Request) {
  return proxyToBackend(request, {
    path: "/sla/overdue",
    mode: "json",
    mock: mockSlaOverduePayload,
  });
}
