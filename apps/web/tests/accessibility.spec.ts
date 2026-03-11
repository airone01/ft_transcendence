import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.describe("WCAG 2.1 AA Accessibility Checks", () => {
  test("Statistics page should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(tags)
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("Global Chat page should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    await page.goto("/chat");

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(tags)
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
