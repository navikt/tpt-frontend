import { NextRequest, NextResponse } from "next/server";
import { getToken, requestOboToken } from "@navikt/oasis";
import { mockVulnerabilitiesPayload } from "@/app/mocks/mockPayloads";
import { isLocalDev, createLocalDevToken } from "@/app/utils/localDevAuth";

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

export async function GET(request: NextRequest) {
  if (process.env.MOCKS_ENABLED === "true") {
    console.log("mocks enabled - returning mock data for GitHub");
    // For now, return the same mock data structure
    // In production, this would be different data from the GitHub endpoint
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

    const backendUrl = `${tptBackendUrl}/vulnerabilities/github/user`;

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub repositories" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal server error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
