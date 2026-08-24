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
  onFilterClick: vi.fn(),
  activeFilterCount: 0,
  onRefresh: vi.fn(),
  isRefreshing: false,
  isSyncing: false,
  isDataStale: false,
};

// The refresh button is always the second button in the toolbar (after Filter).
// When fresh it is icon-only (no accessible name); when stale the Tag text becomes its name.
function getRefreshButton() {
  const buttons = screen.getAllByRole("button");
  // buttons[0] = Filter, buttons[1] = refresh (icon-only or stale), buttons[2] = quickWinsOnly
  return buttons[1];
}

describe("GitHubRepositoryList — update button", () => {
  it("renders with secondary variant when data is fresh", () => {
    render(<GitHubRepositoryList {...baseProps} isDataStale={false} />);
    expect(getRefreshButton()).toHaveAttribute("data-variant", "secondary");
  });

  it("renders with primary variant when data is stale", () => {
    render(<GitHubRepositoryList {...baseProps} isDataStale={true} />);
    expect(getRefreshButton()).toHaveAttribute("data-variant", "primary");
  });

  it("shows the dataStale warning tag when data is stale", () => {
    render(<GitHubRepositoryList {...baseProps} isDataStale={true} />);
    expect(screen.getByText("dataStale")).toBeInTheDocument();
  });

  it("does not show the dataStale warning tag when data is fresh", () => {
    render(<GitHubRepositoryList {...baseProps} isDataStale={false} />);
    expect(screen.queryByText("dataStale")).not.toBeInTheDocument();
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
