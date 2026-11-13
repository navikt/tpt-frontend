import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { GitHubRepositoryList } from "../GitHubRepositoryList";
import type { RepositoryMetrics } from "../../hooks/useRepositoryMetrics";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("../QuickWinsPanel", () => ({
  QuickWinsPanel: () => null,
}));

const baseProps = {
  repositories: [],
  onRefresh: vi.fn(),
  isRefreshing: false,
  isSyncing: false,
  refreshError: false,
};

const repository: RepositoryMetrics = {
  nameWithOwner: "example-org/repo-a",
  team: "team-a",
  vulnerabilities: [],
  aggregateRiskScore: 0,
  vulnerabilityCount: 0,
  highPriorityCount: 0,
  mediumPriorityCount: 0,
  lowPriorityCount: 0,
  fixesReadyCount: 0,
  riskLevel: "none",
};

function getRefreshButton() {
  return screen.getByRole("button", { name: "refresh" });
}

describe("GitHubRepositoryList — toolbar", () => {
  it("does not render a repository filter button", () => {
    render(<GitHubRepositoryList {...baseProps} />);
    expect(screen.queryByText("filterModal.title")).not.toBeInTheDocument();
  });
});

describe("GitHubRepositoryList — repository names", () => {
  it("displays the GitHub owner and repository instead of the team", () => {
    render(<GitHubRepositoryList {...baseProps} repositories={[repository]} />);

    expect(screen.getByText("example-org/repo-a")).toBeInTheDocument();
    expect(screen.queryByText("team-a/repo-a")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href", "https://github.com/example-org/repo-a"
    );
  });

  it.each(["EXAMPLE-ORG/repo-a", "repo-a"])("finds repositories by %s", async (query) => {
    const user = userEvent.setup();
    render(<GitHubRepositoryList {...baseProps} repositories={[repository]} />);

    await user.type(screen.getByRole("textbox"), query);

    expect(screen.getByText("example-org/repo-a")).toBeInTheDocument();
    expect(screen.queryByText("noSearchResults")).not.toBeInTheDocument();
  });

  it("does not treat the team as the GitHub owner when searching", async () => {
    const user = userEvent.setup();
    render(<GitHubRepositoryList {...baseProps} repositories={[repository]} />);

    await user.type(screen.getByRole("textbox"), "team-a/repo-a");

    expect(screen.queryByText("example-org/repo-a")).not.toBeInTheDocument();
    expect(screen.getByText("noSearchResults")).toBeInTheDocument();
  });
});

describe("GitHubRepositoryList — update button", () => {
  it("renders an accessible secondary refresh button", () => {
    render(<GitHubRepositoryList {...baseProps} />);
    expect(getRefreshButton()).toHaveAttribute("data-variant", "secondary");
  });

  it.each(["isRefreshing", "isSyncing"] as const)(
    "announces progress while %s",
    (state) => {
      render(<GitHubRepositoryList {...baseProps} {...{ [state]: true }} />);
      expect(screen.getByRole("status")).toHaveTextContent("fetchingFromGitHub");
      expect(getRefreshButton()).toBeDisabled();
    }
  );

  it("shows a refresh failure", () => {
    render(<GitHubRepositoryList {...baseProps} refreshError />);
    expect(screen.getByRole("alert")).toHaveTextContent("refreshError");
    expect(getRefreshButton()).toBeEnabled();
  });

  it("does not show progress when idle", () => {
    render(<GitHubRepositoryList {...baseProps} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("is disabled while refreshing", () => {
    render(<GitHubRepositoryList {...baseProps} isRefreshing={true} />);
    expect(getRefreshButton()).toBeDisabled();
  });

  it("is disabled while syncing", () => {
    render(<GitHubRepositoryList {...baseProps} isSyncing={true} />);
    expect(getRefreshButton()).toBeDisabled();
  });

  it("calls onRefresh when clicked", async () => {
    const onRefresh = vi.fn();
    const user = userEvent.setup();
    render(<GitHubRepositoryList {...baseProps} onRefresh={onRefresh} />);
    await user.click(getRefreshButton());
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
