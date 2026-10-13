import { NextRequest, NextResponse } from "next/server";
import { getToken, requestOboToken } from "@navikt/oasis";
import { mockSecurityStatusPayload } from "@/app/mocks/mockPayloads";
import { isLocalDev, createLocalDevToken } from "@/app/utils/localDevAuth";
import { isAbortError } from "@/app/shared/utils/errorHandling";

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
    return NextResponse.json(mockSecurityStatusPayload);
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

    const { searchParams } = new URL(request.url);
    const backendUrl = new URL(`${tptBackendUrl}/security-status`);
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${backendToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(mockSecurityStatusPayload);
      }
      return NextResponse.json(
        { error: "errors.fetchSecurityStatusError" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (isAbortError(error)) {
      return NextResponse.json(
        { error: "errors.internalError" },
        { status: 499 }
      );
    }

    if (isLocalDev()) {
      return NextResponse.json(mockSecurityStatusPayload);
    }

    console.error("Internal server error fetching security-status:", error);
    return NextResponse.json(
      { error: "errors.fetchSecurityStatusError" },
      { status: 500 }
    );
  }
}
