import { NextRequest, NextResponse } from "next/server";
import { getToken, requestOboToken } from "@navikt/oasis";
import { mockVulnerabilitiesPayload } from "@/app/mocks/mockPayloads";
import { isLocalDev, createLocalDevToken } from "@/app/utils/localDevAuth";
import {
  parseProblemDetails,
  getErrorMessageKey,
  isAbortError,
} from "@/app/shared/utils/errorHandling";

// Environment validation helper
function getServerEnv() {
  const tptBackendUrl = process.env.TPT_BACKEND_URL;
  const tptBackendScope = process.env.TPT_BACKEND_SCOPE;

  if (!tptBackendUrl) {
    throw new Error("TPT_BACKEND_URL not configured");
  }

  if (!isLocalDev() && !tptBackendScope) {
    throw new Error("TPT_BACKEND_SCOPE not configured");
  }

  return { tptBackendUrl, tptBackendScope };
}

function pickPassthroughHeaders(headers: Headers) {
  const out = new Headers();

  const contentType = headers.get("content-type");
  if (contentType) out.set("content-type", contentType);

  const cacheControl = headers.get("cache-control");
  if (cacheControl) out.set("cache-control", cacheControl);

  const requestId =
    headers.get("x-request-id") ?? headers.get("x-correlation-id");
  if (requestId) out.set("x-request-id", requestId);

  return out;
}

export async function GET(request: NextRequest) {
  if (process.env.MOCKS_ENABLED === "true") {
    console.log("mocks enabled - returning mock data");
    return NextResponse.json(mockVulnerabilitiesPayload);
  }

  try {
    const { tptBackendUrl } = getServerEnv();

    let backendToken: string;

    // In local dev mode, create a mock token instead of using OBO flow
    if (isLocalDev()) {
      const email = process.env.LOCAL_DEV_EMAIL || "lokal.utvikler@nav.no";
      console.log("Local dev mode enabled - using mock token for:", email);
      backendToken = createLocalDevToken(email);
    } else {
      const accessToken = getToken(request);
      if (!accessToken) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      const { tptBackendScope } = getServerEnv();
      const oboResult = await requestOboToken(accessToken, tptBackendScope!);
      if (!oboResult.ok) {
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 }
        );
      }
      backendToken = oboResult.token;
    }

    const backendUrl = `${tptBackendUrl}/vulnerabilities/user`;

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: request.signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);

      console.error(
        `Backend error: ${response.status} ${response.statusText}`,
        errorBody
      );

      // Try to parse RFC 9457 Problem Details
      const problemDetails = parseProblemDetails(errorBody);

      if (problemDetails) {
        // Backend returned Problem Details - use them directly
        return NextResponse.json(
          {
            ...problemDetails,
            isReportable: response.status >= 500,
          },
          { status: response.status }
        );
      }

      // Fallback to generic error handling
      const errorMessage = getErrorMessageKey(
        response.status,
        "errors.fetchApplicationsError"
      );

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          details: errorBody?.message || errorBody?.error,
          isReportable: response.status >= 500,
        },
        { status: response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "errors.internalError" },
        { status: 500 }
      );
    }

    // Stream through instead of buffering + parsing JSON on the server.
    return new NextResponse(response.body, {
      status: 200,
      headers: pickPassthroughHeaders(response.headers),
    });
  } catch (error) {
    if (isAbortError(error)) {
      // Client disconnected (e.g. navigated away) before we could respond.
      return NextResponse.json(
        { error: "errors.internalError" },
        { status: 499 }
      );
    }

    console.error("Internal server error:", error);

    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("network"));

    return NextResponse.json(
      {
        error: isNetworkError ? "errors.networkError" : "errors.internalError",
      },
      { status: 500 }
    );
  }
}
