import { NextRequest, NextResponse } from "next/server";
import { getToken, requestOboToken } from "@navikt/oasis";
import { mockVulnerabilitiesPayload } from "@/app/mocks/mockPayloads";

// Environment validation helper
function getServerEnv() {
  const tptBackendUrl = process.env.TPT_BACKEND_URL;
  const tptBackendScope = process.env.TPT_BACKEND_SCOPE;

  if (!tptBackendUrl) {
    throw new Error("TPT_BACKEND_URL not configured");
  }

  if (!tptBackendScope) {
    throw new Error("TPT_BACKEND_SCOPE not configured");
  }

  return { tptBackendUrl, tptBackendScope };
}

export async function GET(request: NextRequest) {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      mocksEnabled: process.env.MOCKS_ENABLED === "true",
      tptBackendUrl: process.env.TPT_BACKEND_URL,
      tptBackendScope: process.env.TPT_BACKEND_SCOPE,
    },
    request: {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    },
    response: null as any,
    error: null as string | null,
  };

  if (process.env.MOCKS_ENABLED === "true") {
    debugInfo.response = {
      source: "mock",
      data: mockVulnerabilitiesPayload,
    };
    return NextResponse.json({
      debug: debugInfo,
      message: "Debug endpoint - showing mock data",
    });
  }

  try {
    const { tptBackendUrl, tptBackendScope } = getServerEnv();

    const accessToken = getToken(request);
    if (!accessToken) {
      debugInfo.error = "No access token found";
      return NextResponse.json(
        {
          debug: debugInfo,
          message: "Debug endpoint - authentication required",
        },
        { status: 401 }
      );
    }

    const oboResult = await requestOboToken(accessToken, tptBackendScope);
    if (!oboResult.ok) {
      debugInfo.error = "OBO token request failed";
      return NextResponse.json(
        {
          debug: debugInfo,
          message: "Debug endpoint - authentication failed",
        },
        { status: 401 }
      );
    }

    // Fetch from multiple endpoints for comprehensive debug info
    const endpoints = [
      { name: "vulnerabilities", path: "/vulnerabilities/user" },
      { name: "config", path: "/config" },
      { name: "user", path: "/user" },
    ];

    const responses = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        const response = await fetch(`${tptBackendUrl}${endpoint.path}`, {
          headers: {
            Authorization: `Bearer ${oboResult.token}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.ok ? await response.json() : null;
        
        return {
          endpoint: endpoint.name,
          url: `${tptBackendUrl}${endpoint.path}`,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: data,
          success: response.ok,
        };
      })
    );

    debugInfo.response = {
      source: "backend",
      endpoints: responses.map((result) => 
        result.status === "fulfilled" 
          ? result.value 
          : { error: result.reason?.message || "Unknown error" }
      ),
    };

    return NextResponse.json({
      debug: debugInfo,
      message: "Debug endpoint - backend responses",
    });

  } catch (error) {
    debugInfo.error = error instanceof Error ? error.message : "Unknown error";
    console.error("Debug endpoint error:", error);
    
    return NextResponse.json(
      {
        debug: debugInfo,
        message: "Debug endpoint - internal server error",
      },
      { status: 500 }
    );
  }
}