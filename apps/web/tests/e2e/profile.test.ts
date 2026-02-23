import { test, expect } from "@playwright/test";

test.describe("Profile Page Smoke Tests", () => {
  test("Profile page loads complex components without crashing", async ({
    page,
  }) => {
    const response = await page.goto("/profile/1");

    expect(response?.status()).toBe(200);

    await expect(page.getByText("Performance")).toBeVisible();
    await expect(page.getByText("Win Ratio")).toBeVisible();

    await expect(page.getByText("ELO Progression")).toBeVisible();

    await expect(page.getByText("Match History")).toBeVisible();

    const chartContainer = page.locator(".layerchart");
    if ((await chartContainer.count()) > 0) {
      await expect(chartContainer).toBeVisible();
    }
  });
});
