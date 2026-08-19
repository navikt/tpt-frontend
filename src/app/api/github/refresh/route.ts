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

export async function GET(request: NextRequest) {
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

    const response = await fetch(
      `${tptBackendUrl}/vulnerabilities/github/refresh`,
      {
        headers: {
          Authorization: `Bearer ${backendToken}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to trigger GitHub refresh" },
        { status: response.status }
      );
    }

    return NextResponse.json({}, { status: 202 });
  } catch (error) {
    console.error("Internal server error: ", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
