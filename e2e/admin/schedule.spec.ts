import { test, expect } from "@playwright/test";

test("18 schedule editor: add class + schedule row, save, list shows row", async ({ page }) => {
  await page.goto("/admin/konten/classes");
  await page.getByRole("link", { name: "Buat Baru" }).click();
  // Kode is letters-only per the create schema (/^[A-Za-z]+$/); the plan's
  // "E2E1" (and even "E2E") contains digits and fails client-side validation,
  // which blocks the submit.
  await page.getByLabel("Kode").fill("ETE");
  // exact: the optional "Nama (EN)" label also contains "Nama".
  await page.getByLabel("Nama", { exact: true }).fill("E2E Kelas Test");
  await page.getByLabel("Usia minimal").fill("3");
  await page.getByLabel("Usia maksimal").fill("4");
  await page.getByRole("button", { name: "Tambah Jadwal" }).click();
  const row = page.getByRole("group", { name: "Jadwal baris 1" });
  await row.getByLabel("Hari").selectOption({ label: "Senin" });
  await row.getByLabel("Waktu mulai").fill("08:00");
  await row.getByLabel("Waktu selesai").fill("10:00");
  await row.getByLabel("Kegiatan").fill("E2E Mengaji");
  await expect(page.getByText("Senin · 08.00–10.00 WIB")).toBeVisible();
  await page.getByRole("button", { name: "Simpan Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/konten\/classes$/);
  const tableRow = page.getByRole("row", { name: /E2E/ });
  await expect(tableRow).toBeVisible();
  await expect(tableRow.getByText("Draft")).toBeVisible();
});
