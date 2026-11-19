import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../../../../messages/en.json";
import { getKvItem, setKvItem } from "@/app/shared/utils/indexedDbCache";
import VulnerabilitiesToLookAt from "../VulnerabilitiesToLookAt";

vi.mock("@/app/shared/utils/indexedDbCache", () => ({
  getKvItem: vi.fn(),
  setKvItem: vi.fn(),
  KV_KEYS: { USER_PREFERENCES: "userPreferences" },
}));

vi.mock("@/app/contexts/VulnerabilitiesContext", () => ({
  useVulnerabilitiesContext: () => ({
    isLoading: false,
    applicationFilters: {},
    data: {
      teams: [{
        team: "team-a",
        workloads: [
          {
            id: "app-dev",
            name: "app",
            environment: "dev-gcp",
            vulnerabilities: [
              { identifier: "CVE-2026-1234", packageName: "express", riskScore: 80 },
              { identifier: "CVE-2026-5678", packageName: "express", riskScore: 80 },
              { identifier: "CVE-2026-9012", packageName: "pkg:deb/debian/libssl3@3", riskScore: 80 },
            ],
          },
          {
            id: "app-prod",
            name: "app",
            environment: "prod-gcp",
            vulnerabilities: [
              { identifier: "CVE-2026-1234", packageName: "express", riskScore: 80 },
              { identifier: "CVE-2026-1234", packageName: "lodash", riskScore: 80 },
            ],
          },
        ],
      }],
    },
  }),
}));

function renderList() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <VulnerabilitiesToLookAt
        bucketName="Immediately"
        minThreshold={75}
        maxThreshold={101}
        selectedTeams={["team-a"]}
      />
    </NextIntlClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getKvItem).mockResolvedValue(null);
});

it("always groups by action and defaults to packages", async () => {
  const user = userEvent.setup();
  renderList();

  expect(screen.queryByText("Group by action")).not.toBeInTheDocument();
  expect(screen.getByRole("radio", { name: "Group by package" })).toBeChecked();
  await user.click(screen.getByRole("button", { name: "Open all" }));

  expect(screen.getByText("Rebuild base image")).toBeInTheDocument();
  expect(screen.getByText("Update dependencies")).toBeInTheDocument();
  expect(screen.getByText("express (2 vulnerabilities)")).toBeInTheDocument();
  expect(screen.getByText("lodash (1 vulnerability)")).toBeInTheDocument();
});

it("groups by CVE within actions without losing packages when merging environments", async () => {
  const user = userEvent.setup();
  renderList();
  await user.click(screen.getByRole("button", { name: "Open all" }));
  await user.click(screen.getByRole("radio", { name: "Group by CVE" }));

  expect(screen.getByText("Rebuild base image")).toBeInTheDocument();
  expect(screen.getByText("Update dependencies")).toBeInTheDocument();
  expect(screen.getByText("CVE-2026-1234 (2 packages)")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "CVE-2026-1234 (express)" })).toHaveAttribute(
    "href", "/en/app-dev/CVE-2026-1234?pkg=express"
  );
  expect(screen.getByRole("link", { name: "CVE-2026-1234 (lodash)" })).toHaveAttribute(
    "href", "/en/app-dev/CVE-2026-1234?pkg=lodash"
  );
  await waitFor(() => expect(setKvItem).toHaveBeenLastCalledWith(
    "userPreferences", { showAllBuckets: false, vulnerabilityGrouping: "cve" }
  ));

  await user.click(screen.getByRole("radio", { name: "Group by package" }));
  expect(screen.getByText("express (2 vulnerabilities)")).toBeInTheDocument();
  expect(screen.queryByText("CVE-2026-1234 (2 packages)")).not.toBeInTheDocument();
});

it.each([
  ["action", "Group by package"],
  ["package", "Group by package"],
  ["cve", "Group by CVE"],
])("loads the saved %s preference with a valid selection", async (stored, label) => {
  vi.mocked(getKvItem).mockResolvedValue({
    showAllBuckets: true,
    vulnerabilityGrouping: stored,
  });
  renderList();

  await waitFor(() => expect(screen.getByRole("radio", { name: label })).toBeChecked());
  await waitFor(() => expect(setKvItem).toHaveBeenLastCalledWith(
    "userPreferences",
    { showAllBuckets: true, vulnerabilityGrouping: stored === "cve" ? "cve" : "package" }
  ));
});
