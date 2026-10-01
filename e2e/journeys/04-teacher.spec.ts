import { test, expect } from "@playwright/test";
import { pace, loginSimple, logoutAdmin } from "./helpers";

test.setTimeout(420_000);

test("teacher journey: hafalan recorder + attendance, single take", async ({ page }) => {
  // 1. Login (teacher = CMS login, no 2FA)
  await loginSimple(page, "teacher@tpq.id", "teacher123");
  await pace(page, 1000);
  await page.goto("/admin/sms/hafalan");

  // 2. Hafalan recorder: mark surah progression + fluency for own class (teacher is
  // class-scoped to classes[0] — no class <select> is rendered)
  await expect(page.getByRole("heading", { name: "Hafalan", level: 2 })).toBeVisible();
  await pace(page, 900);
  await expect(page.getByText("TPA Qur'ani")).toBeVisible();
  await expect(page.locator("#hafalan-class-id")).toHaveCount(0);
  await expect(page.getByText(/Al-Fatihah|An-Nas|Al-Ikhlas/).first()).toBeVisible();
  await pace(page, 800);
  const surahBtn = page
    .locator('button[aria-label*="Muhammad Fathir Ramadhan"]')
    .filter({ hasText: /Belum|Sedang/ })
    .first();
  await surahBtn.click();
  await pace(page, 700);
  await page
    .locator('button[aria-label*="Muhammad Fathir Ramadhan"]')
    .filter({ hasText: "Sedang" })
    .first()
    .click();
  await pace(page, 700);
  await expect(
    page.locator('button[aria-label*="Muhammad Fathir Ramadhan"]').filter({ hasText: "Tuntas" }).first(),
  ).toBeVisible();
  const fluencyBtn = page
    .locator('button[aria-label*="kelancaran"]')
    .filter({ hasText: /Kurang Lancar|Lancar/ })
    .first();
  await fluencyBtn.click();
  await pace(page, 1500);

  // 3. Attendance: today's date + Hadir + summary chips
  await page.getByRole("link", { name: "Absensi" }).click();
  await page.waitForURL(/\/admin\/sms\/absensi$/);
  await expect(page.getByRole("heading", { name: "Absensi", level: 2 })).toBeVisible();
  await pace(page, 900);
  const today = new Date().toISOString().slice(0, 10);
  await page.getByLabel("Tanggal").fill(today);
  await expect(page.getByText("TPA Qur'ani")).toBeVisible();
  await expect(page.locator("#attendance-class-id")).toHaveCount(0);
  await expect(page.getByRole("row", { name: /Muhammad Fathir Ramadhan/ })).toBeVisible();
  await page.getByLabel(/Status Muhammad Fathir Ramadhan/).selectOption({ label: "Hadir" });
  await page.getByRole("button", { name: "Simpan Absensi" }).click();
  await expect(page.getByText("Hadir: 1")).toBeVisible({ timeout: 30_000 });
  await pace(page, 1600);

  // 4. Limits: no management screens, no admin-only menu entries
  for (const forbidden of ["Santri", "Pendaftaran Kelas", "Rapor", "Persetujuan", "Pengguna", "Aktivitas", "Pengaturan"]) {
    await expect(page.getByRole("link", { name: forbidden })).toHaveCount(0);
  }
  await expect(page.getByRole("link", { name: "Hafalan" })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Absensi" })).toHaveCount(1);
  await pace(page, 1300);

  // 5. Logout
  await logoutAdmin(page);
  await pace(page, 1000);
});