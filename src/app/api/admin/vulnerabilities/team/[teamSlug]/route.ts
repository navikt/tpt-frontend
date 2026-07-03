import { NextRequest, NextResponse } from "next/server";
import { getToken, requestOboToken } from "@navikt/oasis";
import { isLocalDev, createLocalDevToken } from "@/app/utils/localDevAuth";

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

  return out;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamSlug: string }> }
) {
  try {
    const { teamSlug } = await params;

    if (!teamSlug) {
      return NextResponse.json(
        { error: "teamSlug is required" },
        { status: 400 }
      );
    }

    const { tptBackendUrl } = getServerEnv();

    let backendToken: string;

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

    const backendUrl = `${tptBackendUrl}/admin/vulnerabilities/team/${encodeURIComponent(
      teamSlug
    )}`;

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: request.signal,
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch vulnerabilities for team ${teamSlug}: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        { error: "errors.fetchVulnerabilitiesError" },
        { status: response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json(
        { error: "errors.internalError" },
        { status: 500 }
      );
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: pickPassthroughHeaders(response.headers),
    });
  } catch (error) {
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
