import { NextRequest, NextResponse } from "next/server";
import { getToken, requestOboToken } from "@navikt/oasis";
import { mockVulnerabilityDetails } from "@/app/mocks/mockPayloads";
import { isLocalDev, createLocalDevToken } from "@/app/utils/localDevAuth";
import { parseProblemDetails, getErrorMessageKey } from "@/app/shared/utils/errorHandling";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workloadId: string; identifier: string }> }
) {
  const { workloadId, identifier } = await params;

  if (process.env.MOCKS_ENABLED === "true") {
    const key = `${workloadId}/${identifier}`;
    const detail = mockVulnerabilityDetails[key];
    if (!detail) {
      return NextResponse.json(
        { error: "Vulnerability not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(detail);
  }

  try {
    const { tptBackendUrl } = getServerEnv();

    let backendToken: string;

    if (isLocalDev()) {
      const email = process.env.LOCAL_DEV_EMAIL || "lokal.utvikler@nav.no";
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

    const backendUrl = `${tptBackendUrl}/vulnerabilities/workload/${encodeURIComponent(workloadId)}/${encodeURIComponent(identifier)}`;

    const response = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);

      const problemDetails = parseProblemDetails(errorBody);

      if (problemDetails) {
        return NextResponse.json(
          { ...problemDetails, isReportable: response.status >= 500 },
          { status: response.status }
        );
      }

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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal server error:", error);

    const isNetworkError =
      error instanceof Error &&
      (error.message.includes("fetch failed") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("network"));

    return NextResponse.json(
      { error: isNetworkError ? "errors.networkError" : "errors.internalError" },
      { status: 500 }
    );
  }
}
