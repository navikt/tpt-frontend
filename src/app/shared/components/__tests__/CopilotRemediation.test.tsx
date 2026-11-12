import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CopilotRemediationsResponse } from "@/app/shared/types/copilotRemediation";
import { CopilotFixButton, CopilotRemediationsProvider } from "../CopilotRemediation";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/nb",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const fetchMock = vi.fn<typeof fetch>();
const vulnerability = { identifier: "CVE-2026-0001", packageName: "lib-a" };

function renderButton(remediations: CopilotRemediationsResponse, props = {}) {
  fetchMock.mockResolvedValue(Response.json(remediations));
  return render(
    <CopilotRemediationsProvider repository="navikt/app-a">
      <CopilotFixButton vulnerability={{ ...vulnerability, ...props }} />
    </CopilotRemediationsProvider>,
  );
}

describe("CopilotFixButton", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows the fix button when the feature is enabled and no task exists", async () => {
    renderButton({ enabled: true, remediations: [] });

    expect(await screen.findByRole("button", { name: "fixButton" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/remediations/copilot?repository=navikt%2Fapp-a", expect.anything());
  });

  it("is hidden when the feature is disabled", async () => {
    renderButton({ enabled: false, remediations: [] });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "fixButton" })).not.toBeInTheDocument();
  });

  it("is hidden when a Dependabot pull request exists", async () => {
    renderButton(
      { enabled: true, remediations: [] },
      { dependabotUpdatePullRequestUrl: "https://github.com/navikt/app-a/pull/1" },
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "fixButton" })).not.toBeInTheDocument();
  });

  it("links to the started task and offers to start again", async () => {
    renderButton({
      enabled: true,
      remediations: [{
        repository: "navikt/app-a",
        vulnerabilityIdentifier: "CVE-2026-0001",
        packageName: "lib-a",
        status: "STARTED",
        taskUrl: "https://github.com/navikt/app-a/tasks/1",
        requestedAt: "2026-11-01T12:00:00Z",
      }],
    });

    expect(await screen.findByRole("link", { name: "taskStarted" }))
      .toHaveAttribute("href", "https://github.com/navikt/app-a/tasks/1");
    expect(screen.getByRole("button", { name: "startAgain" })).toBeInTheDocument();
  });

  it("shows an error message when the start request is rejected", async () => {
    renderButton({ enabled: true, remediations: [] });
    const button = await screen.findByRole("button", { name: "fixButton" });
    fetchMock.mockResolvedValueOnce(Response.json({ title: "Conflict" }, { status: 409 }));

    await userEvent.click(button);

    expect(await screen.findByText("errors.conflict")).toBeInTheDocument();
    const [, init] = fetchMock.mock.lastCall ?? [];
    expect(JSON.parse(String(init?.body))).toMatchObject({
      repository: "navikt/app-a",
      vulnerabilityIdentifier: "CVE-2026-0001",
      packageName: "lib-a",
      force: false,
    });
  });
});
