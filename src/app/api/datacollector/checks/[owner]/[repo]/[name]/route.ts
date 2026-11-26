import {
  backendErrorResponse,
  proxyToBackend,
} from "@/app/shared/server/backendProxy";

const badRequest = () =>
  Response.json({
    error: "errors.badRequest",
    status: 400,
    isReportable: false,
  }, { status: 400 });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string; name: string }> },
) {
  try {
    const { owner, repo, name } = await params;
    if (!owner || !repo || !name) return badRequest();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest();
    }
    if (!body || typeof body !== "object" || !("suppress" in body) || typeof body.suppress !== "boolean") {
      return badRequest();
    }

    return proxyToBackend(request, {
      path: `/checks/${[owner, repo, name].map(encodeURIComponent).join("/")}`,
      method: "PATCH",
      mode: "stream",
      body: { suppress: body.suppress },
      mock: new Response(null, { status: 204 }),
    });
  } catch (error) {
    return backendErrorResponse(error);
  }
}
