import { mockSecurityStatusPayload } from "@/app/mocks/mockPayloads";
import {
  backendErrorResponse,
  fetchFromBackend,
} from "@/app/shared/server/backendProxy";
import { isAbortError } from "@/app/shared/utils/errorHandling";
import { isLocalDev } from "@/app/utils/localDevAuth";

export async function GET(request: Request) {
  try {
    const response = await fetchFromBackend(request, {
      path: "/security-status",
      forwardQuery: true,
      mock: mockSecurityStatusPayload,
    });
    if (!response.ok) {
      if (response.status === 404 && isLocalDev()) {
        console.warn("Local security-status endpoint not found; returning mock data");
        await response.body?.cancel();
        return Response.json(mockSecurityStatusPayload);
      }
      return backendErrorResponse(response);
    }
    return Response.json(await response.json());
  } catch (error) {
    if (isLocalDev() && !isAbortError(error)) {
      console.warn("Local security-status request failed; returning mock data:", error);
      return Response.json(mockSecurityStatusPayload);
    }
    return backendErrorResponse(error);
  }
}
