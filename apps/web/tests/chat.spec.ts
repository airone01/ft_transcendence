import { expect, test } from "@playwright/test";

test.describe("Global Chat", () => {
  test("should allow user to send a message", async ({ page }) => {
    await page.goto("/chat");

    // connected to ws?
    const input = page.getByPlaceholder(/.*type a message/i);
    await expect(input).toBeVisible();

    const uniqueMessage = `Hello World E2E ${Date.now()}`;
    await input.fill(uniqueMessage);
    await page.getByRole("button", { name: /send/i }).click();

    // msg should appear in chat log
    const chatLog = page.locator(".overflow-y-auto");
    await expect(chatLog).toContainText(uniqueMessage);

    // input should be cleared
    await expect(input).toHaveValue("");
  });
});
