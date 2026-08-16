import { test, expect } from "@playwright/test";

test("01 home render: hero, stats, sections, CTA band, footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: /Assalamu[’']alaikum/ })).toBeVisible();
  await expect(page.getByText("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ").first()).toBeVisible();
  for (const stat of ["10+", "120+", "99"]) {
    await expect(page.getByText(stat, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Mengapa Memilih TPQ Qur'ani?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Program Belajar" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Pusat Materi & Unduhan Gratis" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kata Wali Santri" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Siap Memulai Perjalanan Qur'ani Ananda?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Lihat Materi Gratis" })).toHaveAttribute("href", "/resources");
  await expect(page.getByRole("link", { name: "Chat WhatsApp" })).toHaveAttribute("href", /https:\/\/wa\.me\//);
  await expect(page.getByRole("navigation", { name: "Navigasi utama" }).getByRole("link", { name: "Beranda", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText(/Seluruh hak cipta dilindungi/)).toBeVisible();
});
