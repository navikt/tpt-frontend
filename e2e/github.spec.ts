import { test, expect } from "@playwright/test";
import type { VulnerabilitiesResponse } from "../src/app/shared/types/vulnerabilities";

const repo = {
  nameWithOwner: "navikt/test-repo",
  vulnerabilities: [
    {
      identifier: "CVE-2025-0001",
      packageName: "pkg:npm/example@1.0.0",
      riskScore: 80,
    },
  ],
};

function freshFixture(): VulnerabilitiesResponse {
  return {
    userRole: "DEVELOPER",
    teams: [
      {
        team: "test-team",
        lastSyncedAt: new Date().toISOString(),
        workloads: [],
        repositories: [repo],
      },
    ],
  };
}

function staleFixture(): VulnerabilitiesResponse {
  const staleDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
  return {
    userRole: "DEVELOPER",
    teams: [
      {
        team: "test-team",
        lastSyncedAt: staleDate.toISOString(),
        workloads: [],
        repositories: [repo],
      },
    ],
  };
}

// Clear IndexedDB cache between tests so stale/fresh state doesn't bleed across runs
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    indexedDB.deleteDatabase("tpt-cache");
  });
  await page.route("**/api/applications", (route) =>
    route.fulfill({ json: freshFixture() })
  );
  // Keep the event connection pending so backend errors cannot end a refresh.
  await page.route("**/api/events", () => {});
});

test.describe("GitHub page — update button", () => {
  test("smoke: page loads and update button is visible", async ({ page }) => {
    await page.route("**/api/github", (route) =>
      route.fulfill({ json: freshFixture() })
    );
    await page.route("**/api/config", (route) =>
      route.fulfill({ json: { thresholds: { critical: 75, high: 50, medium: 25 } } })
    );

    await page.goto("/nb/github");

    // The repository-level filter is gone — the global navbar filter is used instead
    await expect(page.getByRole("button", { name: "Filtrer repositories" })).toHaveCount(0);
    await expect(page.getByText("navikt/test-repo", { exact: true })).toBeVisible();
    await expect(page.getByText("test-team/test-repo", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Oppdater", exact: true })).toBeVisible();
  });

  test("fresh data: update button uses secondary (muted) variant", async ({ page }) => {
    await page.route("**/api/github", (route) =>
      route.fulfill({ json: freshFixture() })
    );
    await page.route("**/api/config", (route) =>
      route.fulfill({ json: { thresholds: { critical: 75, high: 50, medium: 25 } } })
    );

    await page.goto("/nb/github");
    await expect(page.getByText("navikt/test-repo", { exact: true })).toBeVisible();

    const refreshButton = page.getByRole("button", { name: "Oppdater", exact: true });
    await expect(refreshButton).toHaveAttribute("data-variant", "secondary");
    await expect(refreshButton).toBeEnabled();
  });

  test("stale data: automatically refreshes and disables the update button", async ({
    page,
  }) => {
    await page.route("**/api/github", (route) =>
      route.fulfill({ json: staleFixture() })
    );
    await page.route("**/api/config", (route) =>
      route.fulfill({ json: { thresholds: { critical: 75, high: 50, medium: 25 } } })
    );
    await page.route("**/api/github/refresh", () => {});
    const refreshRequest = page.waitForRequest("**/api/github/refresh");

    await page.goto("/nb/github");
    await refreshRequest;
    await expect(page.getByText("navikt/test-repo", { exact: true })).toBeVisible();

    const refreshButton = page.getByRole("button", { name: "Oppdater", exact: true });
    await expect(refreshButton).toBeDisabled();
    await expect(page.getByRole("status")).toContainText("Henter informasjon fra GitHub...");
  });

  test("click refresh: button enters loading/disabled state", async ({ page }) => {
    await page.route("**/api/github", (route) =>
      route.fulfill({ json: freshFixture() })
    );
    await page.route("**/api/config", (route) =>
      route.fulfill({ json: { thresholds: { critical: 75, high: 50, medium: 25 } } })
    );
    // Never fulfill the refresh call so the loading state persists long enough to assert
    await page.route("**/api/github/refresh", () => {});

    await page.goto("/nb/github");
    await expect(page.getByText("navikt/test-repo", { exact: true })).toBeVisible();

    const refreshButton = page.getByRole("button", { name: "Oppdater", exact: true });
    const refreshRequest = page.waitForRequest("**/api/github/refresh");
    await refreshButton.click();
    await refreshRequest;

    await expect(refreshButton).toBeDisabled();
    await expect(page.getByRole("status")).toContainText("Henter informasjon fra GitHub...");
  });
});
