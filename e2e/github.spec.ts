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

    // Filter button confirms the toolbar has loaded
    await expect(page.getByRole("button", { name: /filter/i })).toBeVisible();
    // At least one repository row is rendered
    await expect(page.getByText("navikt/test-repo").first()).toBeVisible();
  });

  test("fresh data: update button uses secondary (muted) variant", async ({ page }) => {
    await page.route("**/api/github", (route) =>
      route.fulfill({ json: freshFixture() })
    );
    await page.route("**/api/config", (route) =>
      route.fulfill({ json: { thresholds: { critical: 75, high: 50, medium: 25 } } })
    );

    await page.goto("/nb/github");
    await expect(page.getByRole("button", { name: /filter/i })).toBeVisible();

    // When fresh the refresh button is icon-only (no accessible text) — locate by position
    const toolbar = page.locator(".aksel-hstack").first();
    const refreshButton = toolbar.getByRole("button").nth(1);
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
    await expect(page.getByRole("button", { name: /filter/i })).toBeVisible();

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
    await expect(page.getByRole("button", { name: /filter/i })).toBeVisible();

    const toolbar = page.locator(".aksel-hstack").first();
    const refreshButton = toolbar.getByRole("button").nth(1);
    await refreshButton.click();

    await expect(refreshButton).toBeDisabled();
  });
});
