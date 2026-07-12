import { expect, test } from "@playwright/test";

test("landing preview completes and respects primary navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Make the moment mutual/ })).toBeVisible();
  await page.getByRole("button", { name: /Co-sign the moment/ }).first().click();
  await expect(page.getByText("Made mutual").first()).toBeVisible();
  await Promise.all([
    page.waitForURL(/\/app$/, { timeout: 20_000 }),
    page.getByRole("link", { name: /Create a CoSign/ }).first().click()
  ]);
});

test("application shows a truthful unconfigured state", async ({ page }) => {
  await page.goto("/app/celo");
  await expect(page.getByRole("heading", { name: /Contract connection pending/ })).toBeVisible();
  await expect(page.getByText(/No demo records/)).toBeVisible();
});
