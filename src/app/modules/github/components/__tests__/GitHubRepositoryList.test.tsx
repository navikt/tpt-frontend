import { vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { GitHubRepositoryList } from "../GitHubRepositoryList";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("../QuickWinsPanel", () => ({
  QuickWinsPanel: () => null,
}));

vi.mock("../GitHubRepositoryListItem", () => ({
  GitHubRepositoryListItem: () => null,
}));

const baseProps = {
  repositories: [],
  onRefresh: vi.fn(),
  isRefreshing: false,
  isSyncing: false,
  refreshError: false,
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
