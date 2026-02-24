import { NextRequest } from "next/server";
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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const cveId = body?.cveId;
  const workloadName = body?.workloadName;
  const environment = body?.environment;
  const packageName = body?.packageName;
  const packageEcosystem = body?.packageEcosystem;

  if (!cveId || !workloadName || !environment || !packageName || !packageEcosystem) {
    return new Response(
      "event: error\ndata: Missing required parameters\n\n",
      { status: 400, headers: { "Content-Type": "text/event-stream" } }
    );
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
        return new Response(
          "event: error\ndata: Authentication required\n\n",
          { status: 401, headers: { "Content-Type": "text/event-stream" } }
        );
      }

      const { tptBackendScope } = getServerEnv();
      const oboResult = await requestOboToken(accessToken, tptBackendScope!);
      if (!oboResult.ok) {
        return new Response(
          "event: error\ndata: Authentication failed\n\n",
          { status: 401, headers: { "Content-Type": "text/event-stream" } }
        );
      }
      backendToken = oboResult.token;
    }

    const backendResponse = await fetch(
      `${tptBackendUrl}/vulnerabilities/remediation`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${backendToken}`,
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cveId, workloadName, environment, packageName, packageEcosystem }),
      }
    );

    if (!backendResponse.ok || !backendResponse.body) {
      return new Response(
        `event: error\ndata: Backend error ${backendResponse.status}\n\n`,
        { status: backendResponse.status, headers: { "Content-Type": "text/event-stream" } }
      );
    }

    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Remediation stream error:", error);
    return new Response(
      "event: error\ndata: Internal server error\n\n",
      { status: 500, headers: { "Content-Type": "text/event-stream" } }
    );
  }
}
