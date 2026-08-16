import { test, expect } from "@playwright/test";

test("21 aktivitas: audit log renders actions + CSV export", async ({ page }) => {
  await page.goto("/admin/aktivitas");
  await expect(page.getByRole("heading", { name: "Aktivitas" })).toBeVisible();
  const table = page.getByRole("table");
  await expect(table.getByRole("columnheader", { name: "Aksi" })).toBeVisible();
  await expect(table.getByRole("columnheader", { name: "Entitas" })).toBeVisible();
  await expect(table.locator("tbody tr").first()).toBeVisible();
  await page.getByLabel("Aksi").selectOption({ label: "Masuk" });
  await expect(table.locator("tbody tr").first()).toContainText("Masuk");
  const dlPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor CSV" }).click();
  const dl = await dlPromise;
  expect(dl.suggestedFilename()).toBe("audit.csv");
});
