import { test, expect } from "@playwright/test";

test("06 doa: featured card, filter chips, cards, share toast", async ({ page }) => {
  await page.goto("/doa");
  await expect(page.getByRole("heading", { level: 1, name: "Hafalkan Doa-Doa Kesayangan Ananda" })).toBeVisible();
  await expect(page.getByText("Doa Hari Ini")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(11);
  const chips = page.getByRole("group", { name: "Filter kategori doa" });
  await chips.getByRole("button", { name: /Sebelum Tidur/ }).click();
  await expect(chips.getByRole("button", { name: /Sebelum Tidur/ })).toHaveAttribute("aria-pressed", "true");
  const share = page.getByRole("button", { name: /^Bagikan/ }).first();
  await share.click();
  const toast = page.getByRole("status");
  await expect(toast).toContainText("Terima kasih!");
  await expect(toast.getByRole("link", { name: "Buka WhatsApp" })).toHaveAttribute("href", /wa\.me\//);
});
