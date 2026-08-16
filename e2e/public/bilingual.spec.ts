import { test, expect } from "@playwright/test";

test("08 bilingual: /en renders, lang switcher, hreflang present", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("heading", { level: 1, name: /Dear Parents/ })).toBeVisible();
  const nav = page.getByLabel("Main navigation");
  for (const label of ["Home", "Class Profiles", "Downloads", "Daily Prayers", "Contact"]) {
    await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeVisible();
  const hreflangs = await page.locator('link[hreflang]').evaluateAll((els) => els.map((e) => e.getAttribute("hreflang")));
  expect(hreflangs).toContain("id");
  expect(hreflangs).toContain("en");
  await page.goto("/en/resources");
  await page.getByRole("link", { name: "ID" }).click();
  await expect(page).toHaveURL(/\/resources$/);
  await expect(page.getByRole("heading", { level: 1, name: "Assalamu’alaikum, Ayah & Bunda!" })).toBeVisible();
});
