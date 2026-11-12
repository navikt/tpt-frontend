// @vitest-environment node

import { getToken, requestOboToken } from "@navikt/oasis";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as copilotCallback } from "../github/copilot/callback/route";
import { GET as completeCopilotRemediation } from "../github/copilot/complete/route";
import { POST as startCopilotRemediation } from "../remediations/copilot/route";

vi.mock("@navikt/oasis", () => ({
  getToken: vi.fn(),
  requestOboToken: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

function callback(query: string) {
  return copilotCallback(new Request(`https://tpt.nav.no/api/github/copilot/callback${query}`));
}

function complete(query: string) {
  return completeCopilotRemediation(new Request(`http://localhost/api/github/copilot/complete${query}`));
}

describe("Copilot remediation routes", () => {
  beforeEach(() => {
    vi.stubEnv("MOCKS_ENABLED", "false");
    vi.stubEnv("LOCAL_DEV", "false");
    vi.stubEnv("TPT_BACKEND_URL", "http://backend");
    vi.stubEnv("TPT_BACKEND_SCOPE", "backend-scope");
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(getToken).mockReturnValue("access-token");
    vi.mocked(requestOboToken).mockResolvedValue({ ok: true, token: "backend-token" });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("forwards the start request body to the backend", async () => {
    fetchMock.mockResolvedValue(Response.json({ authorizeUrl: "https://github.com/login/oauth/authorize" }));
    const body = { repository: "navikt/app", vulnerabilityIdentifier: "CVE-1", returnPath: "/nb", force: false };

    const response = await startCopilotRemediation(new Request("http://localhost/api/remediations/copilot", {
      method: "POST",
      body: JSON.stringify(body),
    }));

    const init = fetchMock.mock.calls[0]?.[1];
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://backend/remediations/copilot");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(body);
    expect(await response.json()).toEqual({ authorizeUrl: "https://github.com/login/oauth/authorize" });
  });

  it("completes the authorization and redirects back to the return path", async () => {
    fetchMock.mockResolvedValue(Response.json(
      { taskUrl: "https://github.com/navikt/app/tasks/1", returnPath: "/nb/github?team=a", alreadyStarted: false },
      { status: 201 },
    ));

    const response = await complete("?code=abc&state=xyz");

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://backend/remediations/copilot/callback");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ code: "abc", state: "xyz" });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/nb/github?team=a&copilot=started");
  });

  it("reports an already started task", async () => {
    fetchMock.mockResolvedValue(Response.json({ returnPath: "/nb", alreadyStarted: true }));

    const response = await complete("?code=abc&state=xyz");

    expect(response.headers.get("location")).toBe("/nb?copilot=alreadyStarted");
  });

  it("never redirects to another origin", async () => {
    fetchMock.mockResolvedValue(Response.json({ returnPath: "//evil.example.com", alreadyStarted: false }, { status: 201 }));

    const response = await complete("?code=abc&state=xyz");

    expect(response.headers.get("location")).toBe("/?copilot=started");
  });

  it("redirects with the backend status when starting the task fails", async () => {
    fetchMock.mockResolvedValue(Response.json({ title: "Forbidden" }, { status: 403 }));

    const response = await complete("?code=abc&state=xyz");

    expect(response.headers.get("location")).toBe("/?copilot=error&copilotStatus=403");
  });

  it("reports a cancelled GitHub sign-in without calling the backend", async () => {
    const response = await complete("?error=access_denied&state=xyz");

    expect(response.headers.get("location")).toBe("/?copilot=cancelled");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards only the OAuth parameters from the public callback to the internal completion route", () => {
    vi.stubEnv("COPILOT_COMPLETE_URL", "https://tpt.ansatt.nav.no/api/github/copilot/complete");

    const response = callback("?code=abc&state=xyz&returnPath=//evil.example.com");

    expect(response.status).toBe(303);
    expect(response.headers.get("location"))
      .toBe("https://tpt.ansatt.nav.no/api/github/copilot/complete?code=abc&state=xyz");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards a cancelled GitHub sign-in to the completion route", () => {
    const response = callback("?error=access_denied&state=xyz");

    expect(response.headers.get("location")).toBe("/api/github/copilot/complete?state=xyz&error=access_denied");
  });
});
