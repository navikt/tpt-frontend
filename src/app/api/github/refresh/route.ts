import {
  backendErrorResponse,
  fetchFromBackend,
} from "@/app/shared/server/backendProxy";

export async function GET(request: Request) {
  try {
    const response = await fetchFromBackend(request, {
      path: "/vulnerabilities/github/refresh",
    });
    if (!response.ok) return backendErrorResponse(response);
    await response.body?.cancel();
    return Response.json({}, { status: 202 });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
