import { test, expect } from "@playwright/test";

test("03 resources browse: search, chips, count, empty state, reset", async ({ page }) => {
  await page.goto("/resources");
  await expect(page.getByRole("heading", { level: 1, name: "Assalamu’alaikum, Ayah & Bunda!" })).toBeVisible();
  const search = page.getByLabel("Cari materi");
  await search.fill("kaligrafi");
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(page.getByText(/\d+ materi/)).toBeVisible();
  const chips = page.getByRole("group", { name: "Filter kategori materi" });
  await expect(chips.getByRole("button", { name: /^Semua/ })).toHaveAttribute("aria-pressed", "true");
  await chips.getByRole("button", { name: /^Mewarnai/ }).click();
  await expect(chips.getByRole("button", { name: /^Mewarnai/ })).toHaveAttribute("aria-pressed", "true");
  await search.fill("zzz-tidak-ada");
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(page.getByText("Tidak ada materi ditemukan")).toBeVisible();
  await page.getByRole("button", { name: "Hapus Filter" }).click();
  await expect(page.getByText("Tidak ada materi ditemukan")).toBeHidden();
});

test("04 resources download: card button → download event → toast", async ({ page }) => {
  await page.goto("/resources");
  const card = page.locator("article", { hasText: /[1-9]\d*× diunduh/ }).first();
  const title = await card.locator("h3 a").innerText();
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const download = card.getByRole("button", { name: new RegExp(`Unduh PDF ${escaped}`) });
  await expect(download).toBeVisible();
  await expect(card.getByText(/\d+(\.\d+)?× diunduh/)).toBeVisible();
  const dlPromise = page.waitForEvent("download");
  await download.click();
  const dl = await dlPromise;
  expect(dl.suggestedFilename()).toContain(".pdf");
  const toast = page.getByRole("status");
  await expect(toast).toContainText("Terima kasih!");
  await expect(toast).toContainText(`PDF ${title} siap diunduh.`);
  await expect(toast.getByRole("link", { name: "Bagikan via WhatsApp" })).toHaveAttribute("href", /wa\.me\//);
});

test("05 resource detail: thumbnail, meta, download button", async ({ page }) => {
  await page.goto("/resources");
  await page.locator("article").first().getByRole("link", { name: /^Pratinjau/ }).click();
  await page.waitForURL(/\/resources\/[\w-]+$/);
  const img = page.getByRole("img", { name: /^Thumbnail/ });
  await expect(img).toBeVisible();
  await expect(page.getByRole("button", { name: "Unduh PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lihat Pratinjau" })).toBeVisible();
  const dl = page.getByText("Nama file");
  await expect(dl).toBeVisible();
});
