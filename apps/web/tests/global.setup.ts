import { expect, test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/");

  await expect(async () => {
    await page.getByRole("button", { name: /log in/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 1000 });
  }).toPass({
    timeout: 3000,
  });
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 5000 });

  await page.getByLabel(/.*email/i).fill("valentin@transcender.com");
  await page.getByPlaceholder("••••••••").fill("P@ssw0rd");
  await page.getByRole("button", { name: /.*login/i }).click();

  // wait
  await expect(
    page.getByRole("heading", { name: /.*leaderboard/i }),
  ).toBeVisible();

  // save state
  await page.context().storageState({ path: authFile });
});
