import { test, expect } from "@playwright/test";
import { API_BASE } from "../utils/constants";

test("06 doa: featured card, filter chips, cards, share toast", async ({ page }) => {
  const res = await fetch(`${API_BASE}/api/v1/prayer-guides`);
  const body = await res.json();
  const guides = body.data ?? body;
  await page.goto("/doa");
  await expect(page.getByRole("heading", { level: 1, name: "Hafalkan Doa-Doa Kesayangan Ananda" })).toBeVisible();
  await expect(page.getByText("Doa Hari Ini")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(guides.length + 1);
  const chips = page.getByRole("group", { name: "Filter kategori doa" });
  await chips.getByRole("button", { name: /Sebelum Tidur/ }).click();
  await expect(chips.getByRole("button", { name: /Sebelum Tidur/ })).toHaveAttribute("aria-pressed", "true");
  const share = page.getByRole("button", { name: /^Bagikan/ }).first();
  await share.click();
  const toast = page.getByRole("status");
  await expect(toast).toContainText("Terima kasih!");
  await expect(toast.getByRole("link", { name: "Buka WhatsApp" })).toHaveAttribute("href", /wa\.me\//);
});
