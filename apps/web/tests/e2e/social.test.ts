import { test, expect } from "@playwright/test";

test.describe("Social Page Flows", () => {
  test("User can log in and view the friend request screen", async ({
    page,
  }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "valentin@transcender.com");
    await page.fill('input[name="password"]', "P@ssw0rd");
    await page.click('button[type="submit"]');

    await page.goto("/profile/me/social");

    await expect(page.getByText("Friend Requests")).toBeVisible();
    await expect(page.getByText("Suggested Players")).toBeVisible();

    const requestBtn = page.locator('button:has-text("Request")').first();
    await expect(requestBtn).toBeVisible();
  });
});
