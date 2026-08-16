import { test, expect } from "@playwright/test";
import { E2E_EMAIL } from "../utils/constants";

test("20 users: 2FA reset, deactivate, activate — E2E user only", async ({ page }) => {
  await page.goto("/admin/pengguna");
  await expect(page.getByRole("heading", { name: "Pengguna" })).toBeVisible();
  const row = page.getByRole("row", { name: new RegExp(E2E_EMAIL) });
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: "Reset 2FA" }).click();
  await page.getByRole("dialog", { name: /Konfirmasi:/ }).getByRole("button", { name: "Konfirmasi" }).click();
  await expect(page.getByText("2FA direset, pengguna harus daftar ulang")).toBeVisible();
  await expect(row.getByText("—")).toBeVisible();

  await row.getByRole("button", { name: "Nonaktifkan" }).click();
  await page.getByRole("dialog", { name: /Konfirmasi:/ }).getByRole("button", { name: "Konfirmasi" }).click();
  await expect(page.getByText("Pengguna berhasil dinonaktifkan")).toBeVisible();
  await expect(row.getByText("Nonaktif", { exact: true })).toBeVisible();

  await row.getByRole("button", { name: "Aktifkan kembali" }).click();
  await page.getByRole("dialog", { name: /Konfirmasi:/ }).getByRole("button", { name: "Konfirmasi" }).click();
  await expect(page.getByText("Pengguna berhasil diaktifkan kembali")).toBeVisible();
  await expect(row.getByText("Aktif", { exact: true })).toBeVisible();
  await expect(page.getByText("Semua tindakan tercatat di Aktivitas")).toBeVisible();
});
