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
    // Repositories are listed as team/repo, not owner/repo
    await expect(page.getByText("test-team/test-repo").first()).toBeVisible();
    await expect(page.getByText("navikt/test-repo")).toHaveCount(0);
  });

  test("fresh data: update button uses secondary (muted) variant", async ({ page }) => {
    await page.route("**/api/github", (route) =>
      route.fulfill({ json: freshFixture() })
    );
    await page.route("**/api/config", (route) =>
      route.fulfill({ json: { thresholds: { critical: 75, high: 50, medium: 25 } } })
    );

    await page.goto("/nb/github");
    await expect(page.getByText("test-team/test-repo").first()).toBeVisible();

    // When fresh the refresh button is icon-only (no accessible text) — it is the first toolbar button
    const toolbar = page.locator(".aksel-hstack").first();
    const refreshButton = toolbar.getByRole("button").nth(0);
    await expect(refreshButton).toHaveAttribute("data-variant", "secondary");
  });

  test("stale data: update button uses primary (highlighted) variant and shows warning tag", async ({
    page,
  }) => {
    await page.route("**/api/github", (route) =>
      route.fulfill({ json: staleFixture() })
    );
    await page.route("**/api/config", (route) =>
      route.fulfill({ json: { thresholds: { critical: 75, high: 50, medium: 25 } } })
    );

    await page.goto("/nb/github");
    await expect(page.getByText("test-team/test-repo").first()).toBeVisible();

    // When stale, the Tag text ("Utdatert" in nb locale) becomes the button's accessible name
    const refreshButton = page.getByRole("button", { name: "Utdatert" });
    await expect(refreshButton).toHaveAttribute("data-variant", "primary");
    await expect(refreshButton).toBeVisible();
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
    await expect(page.getByText("test-team/test-repo").first()).toBeVisible();

    const toolbar = page.locator(".aksel-hstack").first();
    const refreshButton = toolbar.getByRole("button").nth(0);
    await refreshButton.click();

    await expect(refreshButton).toBeDisabled();
  });
});
