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
        return new Response("datacollector: error\ndata: Authentication required\n\n", {
          status: 401,
        });
      }

      const { tptBackendScope } = getServerEnv();
      const oboResult = await requestOboToken(accessToken, tptBackendScope!);
      if (!oboResult.ok) {
        return new Response("event: error\ndata: Authentication failed\n\n", {
          status: 401,
        });
      }
      backendToken = oboResult.token;
    }

    const backendResponse = await fetch(`${tptBackendUrl}/checks`, {
      headers: {
        Authorization: `Bearer ${backendToken}`,
        Accept: "application/json",
      },
      signal: request.signal,
      method: "GET",
    });

    if (backendResponse.status !== 202 || !backendResponse.body) {
      return new Response(
        `event: error\ndata: Backend error ${backendResponse.status}\n\n`,
        {
          status: backendResponse.status,
          headers: { "Content-Type": "text/plain" },
        }
      );
    }

    return new Response(backendResponse.body, {
      headers: {
        "Content-Type": "application/json",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const isAbort =
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("aborted"));

    if (isAbort) {
      return new Response(null, { status: 499 });
    }

    console.error("Datacollector error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(`datacollector: error\ndata: Internal server error: ${message}\n\n`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
