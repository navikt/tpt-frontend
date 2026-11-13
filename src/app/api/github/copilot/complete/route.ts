import { fetchFromBackend } from "@/app/shared/server/backendProxy";
import type { CopilotOutcome } from "@/app/shared/types/copilotRemediation";
import { withCopilotOutcome } from "@/app/shared/utils/copilotRemediation";

function redirectTo(path: string, outcome: CopilotOutcome, status?: number) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: withCopilotOutcome(path, outcome, status),
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) {
    return redirectTo("/", params.get("error") === "access_denied" ? "cancelled" : "error");
  }

  try {
    const response = await fetchFromBackend(request, {
      path: "/remediations/copilot/callback",
      method: "POST",
      body: { code, state },
      mock: Response.json({ returnPath: "/", alreadyStarted: false }, { status: 201 }),
    });
    if (!response.ok) {
      console.error(`Copilot remediation callback failed (${response.status})`);
      await response.body?.cancel();
      return redirectTo("/", "error", response.status);
    }

    const result: unknown = await response.json();
    const returnPath = result && typeof result === "object" && "returnPath" in result
      ? String(result.returnPath)
      : "/";
    const alreadyStarted = result && typeof result === "object" && "alreadyStarted" in result
      ? result.alreadyStarted === true
      : false;
    return redirectTo(returnPath, alreadyStarted ? "alreadyStarted" : "started");
  } catch (error) {
    console.error("Copilot remediation callback failed:", error);
    return redirectTo("/", "error");
  }
}
