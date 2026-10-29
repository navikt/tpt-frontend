// @vitest-environment node

import { getToken, requestOboToken } from "@navikt/oasis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { proxyToBackend } from "../backendProxy";

vi.mock("@navikt/oasis", () => ({
  getToken: vi.fn(),
  requestOboToken: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();
const options = { path: "/vulnerabilities/user", mode: "json" } as const;

function request(query = "") {
  return new Request(`http://localhost/api/applications${query}`);
}

describe("backend proxy", () => {
  beforeEach(() => {
    vi.stubEnv("MOCKS_ENABLED", "false");
    vi.stubEnv("LOCAL_DEV", "false");
    vi.stubEnv("TPT_BACKEND_URL", "http://backend");
    vi.stubEnv("TPT_BACKEND_SCOPE", "backend-scope");
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(getToken).mockReturnValue("access-token");
    vi.mocked(requestOboToken).mockResolvedValue({ ok: true, token: "backend-token" });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("serves JSON mocks without backend configuration or authentication", async () => {
    vi.stubEnv("MOCKS_ENABLED", "true");
    vi.stubEnv("TPT_BACKEND_URL", undefined);
    const response = await proxyToBackend(request(), { ...options, mock: { teams: [] } });

    expect(await response.json()).toEqual({ teams: [] });
    expect(getToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("preserves a mock Response, including its empty accepted body", async () => {
    vi.stubEnv("MOCKS_ENABLED", "true");
    const response = await proxyToBackend(request(), {
      ...options,
      mock: new Response(null, { status: 202 }),
    });

    expect(response.status).toBe(202);
    expect(response.body).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a custom mock Response unchanged rather than parsing or filtering it", async () => {
    vi.stubEnv("MOCKS_ENABLED", "true");
    const mock = new Response("Mock failure", { status: 503, headers: { "x-mock": "true" } });

    const response = await proxyToBackend(request(), { ...options, mock });

    expect(response).toBe(mock);
    expect(await response.text()).toBe("Mock failure");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps calling the backend when mocks are enabled but no mock exists", async () => {
    vi.stubEnv("MOCKS_ENABLED", "true");
    fetchMock.mockResolvedValue(Response.json({ teams: [] }));
    const incoming = request();

    const response = await proxyToBackend(incoming, options);

    expect(await response.json()).toEqual({ teams: [] });
    expect(requestOboToken).toHaveBeenCalledWith("access-token", "backend-scope");
    expect(fetchMock).toHaveBeenCalledWith("http://backend/vulnerabilities/user", {
      method: "GET",
      headers: expect.any(Headers),
      cache: "no-store",
      signal: incoming.signal,
    });
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("authorization"))
      .toBe("Bearer backend-token");
  });

  it("uses the configured local user without requiring an OBO scope", async () => {
    vi.stubEnv("LOCAL_DEV", "true");
    vi.stubEnv("LOCAL_DEV_EMAIL", "developer@example.org");
    vi.stubEnv("TPT_BACKEND_SCOPE", undefined);
    fetchMock.mockResolvedValue(Response.json({ teams: [] }));

    expect((await proxyToBackend(request(), options)).status).toBe(200);
    const authorization = new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("authorization");
    const payload = authorization?.split(".")[1];
    expect(payload).toBeDefined();
    expect(JSON.parse(Buffer.from(payload ?? "", "base64url").toString())).toMatchObject({
      preferred_username: "developer@example.org",
    });
    expect(getToken).not.toHaveBeenCalled();
    expect(requestOboToken).not.toHaveBeenCalled();
  });

  it("rejects a missing access token before fetching", async () => {
    vi.mocked(getToken).mockReturnValue(null);
    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "errors.unauthorized", status: 401, isReportable: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["result", "exception"])("returns 401 for a failed OBO %s", async (failure) => {
    if (failure === "result") {
      vi.mocked(requestOboToken).mockResolvedValue({ ok: false, error: new Error("exchange failed") });
    } else {
      vi.mocked(requestOboToken).mockRejectedValue(new Error("exchange failed"));
    }

    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "errors.unauthorized", status: 401, isReportable: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it.each(["TPT_BACKEND_URL", "TPT_BACKEND_SCOPE"])("reports missing %s as a configuration failure", async (name) => {
    vi.stubEnv(name, undefined);
    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "errors.internalError", status: 500, isReportable: true,
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it.each([403, 503])("preserves backend Problem Details and extensions for %i", async (status) => {
    const problem = {
      type: "https://example.org/problems/backend",
      title: "Backend failure",
      status,
      detail: "Details from the backend",
      instance: "/vulnerabilities/user",
      traceId: "trace-id",
      extra: { retry: false },
    };
    fetchMock.mockResolvedValue(Response.json(problem, {
      status,
      headers: { "content-type": "application/problem+json", "x-request-id": "request-id" },
    }));

    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(status);
    expect(response.headers.get("content-type")).toBe("application/problem+json");
    expect(response.headers.get("x-request-id")).toBe("request-id");
    expect(await response.json()).toEqual({ ...problem, isReportable: status >= 500 });
  });

  it("maps legacy JSON errors to i18n keys while retaining details", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "Invalid input" }, { status: 400 }));
    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "errors.badRequest", status: 400, details: "Invalid input", isReportable: false,
    });
  });

  it("maps non-JSON backend failures without exposing the response body", async () => {
    fetchMock.mockResolvedValue(new Response("<html>unavailable</html>", { status: 502 }));
    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "errors.badGateway", status: 502, isReportable: true,
    });
    expect(console.error).toHaveBeenCalled();
  });

  it.each([
    [new TypeError("fetch failed"), "errors.networkError"],
    [new Error("Unexpected sensitive internal details"), "errors.internalError"],
  ])("normalizes proxy failures: %s", async (error, key) => {
    fetchMock.mockRejectedValue(error);
    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: key, status: 500, isReportable: true });
    expect(console.error).toHaveBeenCalled();
  });

  it.each(["AbortError", "ResponseAborted"])("returns non-reportable 499 for %s", async (name) => {
    const error = new Error("Client disconnected");
    error.name = name;
    fetchMock.mockRejectedValue(error);

    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(499);
    expect(await response.json()).toEqual({
      error: "errors.internalError", status: 499, isReportable: false,
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("forwards repeated query parameters only when requested", async () => {
    vi.stubEnv("TPT_BACKEND_URL", "http://backend/");
    fetchMock.mockImplementation(async () => Response.json({ teams: [] }));

    await proxyToBackend(request("?team=a&team=b&name=a%26b"), { ...options, forwardQuery: true });
    await proxyToBackend(request("?team=a"), options);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://backend/vulnerabilities/user?team=a&team=b&name=a%26b",
      "http://backend/vulnerabilities/user",
    ]);
  });

  it("passes streams through without waiting for completion and only forwards allowed headers", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"teams":['));
      },
    });
    fetchMock.mockResolvedValue(new Response(stream, {
      status: 206,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
        "x-correlation-id": "correlation-id",
        "set-cookie": "backend-session=private",
      },
    }));

    const response = await proxyToBackend(request(), { ...options, mode: "stream" });

    expect(response.body).toBe(stream);
    expect(response.status).toBe(206);
    expect(Object.fromEntries(response.headers)).toEqual({
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-request-id": "correlation-id",
    });
    const reader = response.body?.getReader();
    expect(await reader?.read()).toMatchObject({ done: false });
    await reader?.cancel();
  });

  it("forwards POST and accepts a bodyless 202 response", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }));

    const response = await proxyToBackend(request(), { ...options, method: "POST", mode: "stream" });

    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(response.status).toBe(202);
    expect(response.body).toBeNull();
  });

  it.each([
    new Response(null),
    new Response("not JSON", { headers: { "content-type": "application/json" } }),
  ])("reports an unusable backend success response as an internal error", async (backend) => {
    fetchMock.mockResolvedValue(backend);
    const response = await proxyToBackend(request(), options);

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "errors.internalError", status: 500, isReportable: true,
    });
    expect(console.error).toHaveBeenCalled();
  });

  it("passes SSE data through with streaming headers", async () => {
    const event = 'event: sync_complete\ndata: {"team":"example"}\n\n';
    fetchMock.mockResolvedValue(new Response(event));

    const response = await proxyToBackend(request(), { path: "/events", mode: "sse" });

    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get("accept")).toBe("text/event-stream");
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.headers.get("cache-control")).toBe("no-cache");
    expect(response.headers.get("connection")).toBe("keep-alive");
    expect(response.headers.get("x-accel-buffering")).toBe("no");
    expect(await response.text()).toBe(event);
  });

  it("frames authentication failures as SSE error events", async () => {
    vi.mocked(getToken).mockReturnValue(null);
    const response = await proxyToBackend(request(), { path: "/events", mode: "sse" });

    expect(response.status).toBe(401);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(await response.text()).toBe(
      'event: error\ndata: {"error":"errors.unauthorized","status":401,"isReportable":false}\n\n',
    );
  });

  it("frames backend Problem Details as an SSE error event", async () => {
    const problem = { title: "Unavailable", status: 503, detail: "Try again later" };
    fetchMock.mockResolvedValue(Response.json(problem, { status: 503 }));

    const response = await proxyToBackend(request(), { path: "/events", mode: "sse" });

    expect(response.status).toBe(503);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(await response.text()).toBe(
      `event: error\ndata: ${JSON.stringify({ ...problem, isReportable: true })}\n\n`,
    );
  });
});
