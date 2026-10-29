import { getToken, requestOboToken } from "@navikt/oasis";
import {
  getErrorMessageKey,
  isAbortError,
  isNetworkError,
  parseProblemDetails,
} from "@/app/shared/utils/errorHandling";
import {
  createLocalDevToken,
  getLocalDevEmail,
  isLocalDev,
} from "@/app/utils/localDevAuth";

type BackendMode = "json" | "stream" | "sse";

interface BackendFetchOptions {
  path: string;
  method?: "GET" | "POST";
  forwardQuery?: boolean;
  mode?: BackendMode;
  mock?: unknown;
}

interface BackendProxyOptions extends BackendFetchOptions {
  mode: BackendMode;
}

class BackendAuthenticationError extends Error {}

const sseHeaders = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};

function getMockResponse(mock: unknown) {
  if (process.env.MOCKS_ENABLED !== "true" || mock === undefined) return undefined;
  return mock instanceof Response ? mock : Response.json(mock);
}

function pickPassthroughHeaders(headers: Headers) {
  const result = new Headers();
  for (const name of ["content-type", "cache-control"]) {
    const value = headers.get(name);
    if (value) result.set(name, value);
  }
  const requestId = headers.get("x-request-id") ?? headers.get("x-correlation-id");
  if (requestId) result.set("x-request-id", requestId);
  return result;
}

function errorResponse(
  body: object,
  status: number,
  mode: BackendMode,
  headers = new Headers(),
) {
  if (mode === "sse") {
    for (const [name, value] of Object.entries(sseHeaders)) {
      headers.set(name, value);
    }
    return new Response(`event: error\ndata: ${JSON.stringify(body)}\n\n`, {
      status,
      headers,
    });
  }
  return Response.json(body, { status, headers });
}

function proxyFailureResponse(error: unknown, mode: BackendMode) {
  const status = error instanceof BackendAuthenticationError
    ? 401
    : isAbortError(error) ? 499 : 500;
  if (status === 500) console.error("Backend proxy request failed:", error);

  return errorResponse({
    error: status === 401
      ? "errors.unauthorized"
      : isNetworkError(error) ? "errors.networkError" : "errors.internalError",
    status,
    isReportable: status >= 500,
  }, status, mode);
}

export async function fetchFromBackend(
  request: Request,
  options: BackendFetchOptions,
): Promise<Response> {
  const mock = getMockResponse(options.mock);
  if (mock) return mock;

  const baseUrl = process.env.TPT_BACKEND_URL;
  if (!baseUrl) throw new Error("TPT_BACKEND_URL not configured");

  let token: string;
  if (isLocalDev()) {
    token = createLocalDevToken(getLocalDevEmail());
  } else {
    const scope = process.env.TPT_BACKEND_SCOPE;
    if (!scope) throw new Error("TPT_BACKEND_SCOPE not configured");

    const accessToken = getToken(request);
    if (!accessToken) throw new BackendAuthenticationError("Authentication required");

    let result;
    try {
      result = await requestOboToken(accessToken, scope);
    } catch (error) {
      if (isAbortError(error)) throw error;
      console.error("Backend token exchange failed");
      throw new BackendAuthenticationError("Authentication failed");
    }
    if (!result.ok) {
      console.error("Backend token exchange failed");
      throw new BackendAuthenticationError("Authentication failed");
    }
    token = result.token;
  }

  const url = new URL(`${baseUrl.replace(/\/+$/, "")}${options.path}`);
  if (options.forwardQuery) {
    new URL(request.url).searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    Accept: options.mode === "sse" ? "text/event-stream" : "application/json",
  });
  if (options.mode === "sse") headers.set("Cache-Control", "no-cache");

  return fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    cache: "no-store",
    signal: request.signal,
  });
}

export async function backendErrorResponse(
  error: unknown,
  mode: BackendMode = "json",
): Promise<Response> {
  if (!(error instanceof Response)) return proxyFailureResponse(error, mode);

  try {
    const text = await error.text();
    let body: unknown;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch (parseError) {
        if (!(parseError instanceof SyntaxError)) throw parseError;
        console.error(`Backend returned a non-JSON error (${error.status})`);
      }
    }
    console.error(`Backend request failed (${error.status})`);

    const headers = pickPassthroughHeaders(error.headers);
    const problem = parseProblemDetails(body);
    if (problem) {
      headers.set("content-type", "application/problem+json");
      return errorResponse({
        ...problem,
        isReportable: error.status >= 500,
      }, error.status, mode, headers);
    }

    headers.set("content-type", "application/json");
    const details = body && typeof body === "object"
      ? ("message" in body && typeof body.message === "string" ? body.message
        : "error" in body && typeof body.error === "string" ? body.error : undefined)
      : undefined;
    return errorResponse({
      error: getErrorMessageKey(error.status, "errors.internalError"),
      status: error.status,
      details,
      isReportable: error.status >= 500,
    }, error.status, mode, headers);
  } catch (cause) {
    return proxyFailureResponse(cause, mode);
  }
}

export async function proxyToBackend(
  request: Request,
  options: BackendProxyOptions,
): Promise<Response> {
  try {
    const mock = getMockResponse(options.mock);
    if (mock) return mock;

    const response = await fetchFromBackend(request, options);
    if (!response.ok) return backendErrorResponse(response, options.mode);

    if (!response.body) {
      if ([202, 204, 205].includes(response.status)) {
        return new Response(null, {
          status: response.status,
          headers: pickPassthroughHeaders(response.headers),
        });
      }
      throw new Error("Backend response has no body");
    }

    if (options.mode === "sse") {
      return new Response(response.body, {
        status: response.status,
        headers: sseHeaders,
      });
    }

    const headers = pickPassthroughHeaders(response.headers);
    if (options.mode === "stream") {
      return new Response(response.body, { status: response.status, headers });
    }

    const body: unknown = await response.json();
    headers.set("content-type", "application/json");
    return Response.json(body, { status: response.status, headers });
  } catch (error) {
    return backendErrorResponse(error, options.mode);
  }
}
