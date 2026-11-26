import { test, expect } from "@playwright/test";
import en from "../messages/en.json";
import nb from "../messages/nb.json";
import type { VulnerabilitiesResponse } from "../src/app/shared/types/vulnerabilities";

test.beforeEach(async ({ page }) => {
  const data: VulnerabilitiesResponse = {
    userRole: "DEVELOPER",
    teams: [{
      team: "test-team",
      lastSyncedAt: new Date().toISOString(),
      workloads: [],
    }],
  };
  await page.route("**/api/applications", (route) => route.fulfill({ json: data }));
  await page.route("**/api/config", (route) =>
    route.fulfill({ json: { thresholds: { critical: 75, high: 50, medium: 25 } } }),
  );
  await page.route("**/api/user", (route) => route.fulfill({ json: { email: "test@example.com" } }));
  await page.route("**/api/telemetry-config", (route) => route.fulfill({ json: { enabled: false } }));
  await page.route("**/api/events", () => {});
});

for (const [locale, messages] of [["en", en], ["nb", nb]] as const) {
  test(`start page fits at 1440x900 with aligned cards in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${locale}?welcome=true`);
    await expect(page.getByRole("button", { name: messages.welcome.selectPrompt })).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await expect(page.getByText(messages.banner.underDevelopment)).toHaveCount(0);

    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    expect(dimensions.width).toBeLessThanOrEqual(1440);
    expect(dimensions.height).toBeLessThanOrEqual(900);

    const cards = await Promise.all(
      (["compliance", "prioritization", "github"] as const).map(async (tab) => {
        const card = page.getByRole("region", { name: messages.dataSource[tab].title, exact: true });
        const bounds = await card.boundingBox();
        const divider = await card.getByRole("separator").boundingBox();
        if (!bounds || !divider) throw new Error(`Missing ${tab} card or divider`);
        return { height: bounds.height, dividerY: divider.y };
      }),
    );
    expect(Math.max(...cards.map((card) => card.height)) - Math.min(...cards.map((card) => card.height)))
      .toBeLessThanOrEqual(1);
    expect(Math.max(...cards.map((card) => card.dividerY)) - Math.min(...cards.map((card) => card.dividerY)))
      .toBeLessThanOrEqual(1);
  });

  test(`start page stacks at 390px and keeps keyboard selection and disclosure in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}?welcome=true`);
    await expect(page.getByRole("button", { name: messages.welcome.selectPrompt })).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const views = page.getByRole("group", { name: messages.welcome.heading });
    const buttons = await views.getByRole("button", { pressed: false }).all();
    expect(buttons).toHaveLength(4);
    const boxes = await Promise.all(buttons.map(async (button) => {
      const box = await button.boundingBox();
      if (!box) throw new Error("Missing view button");
      return box;
    }));
    expect(new Set(boxes.map((box) => box.x)).size).toBe(1);
    expect(new Set(boxes.map((box) => box.y)).size).toBe(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

    const developer = views.getByRole("button", { name: new RegExp(`^${messages.welcome.roles.DEVELOPER.title}`) });
    await developer.focus();
    await page.keyboard.press("Space");
    await expect(developer).toHaveAttribute("aria-pressed", "true");
    const continueLabel = messages.welcome.selectButton.replace("{role}", messages.welcome.roles.DEVELOPER.title);
    await expect(page.getByRole("button", { name: continueLabel, exact: true })).toBeEnabled();

    const compliance = page.getByRole("region", { name: messages.dataSource.compliance.title, exact: true });
    await compliance.getByRole("button", { name: messages.dataSource.about }).click();
    await expect(compliance.getByText(messages.dataSource.compliance.usage)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
}
