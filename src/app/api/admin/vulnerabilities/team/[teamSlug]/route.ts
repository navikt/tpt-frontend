import {
  backendErrorResponse,
  proxyToBackend,
} from "@/app/shared/server/backendProxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamSlug: string }> },
) {
  try {
    const { teamSlug } = await params;
    if (!teamSlug) {
      return Response.json({
        error: "errors.badRequest",
        status: 400,
        isReportable: false,
      }, { status: 400 });
    }
    return proxyToBackend(request, {
      path: `/admin/vulnerabilities/team/${encodeURIComponent(teamSlug)}`,
      mode: "stream",
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
