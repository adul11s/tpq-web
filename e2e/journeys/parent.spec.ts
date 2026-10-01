import { test, expect } from "@playwright/test";
import { pace, readBridge } from "./helpers";

test.setTimeout(540_000);

test("parent journey: public portal, single take (bridge creds from admin journey)", async ({
  page,
}) => {
  const bridge = readBridge();
  expect(bridge.email).toBe("parent-journey@tpq.id");
  expect(bridge.password).toBeTruthy();
  expect(bridge.studentId).toBeTruthy();
  expect(bridge.periodId).toBe(1);

  // 1. Public portal login with admin-generated password
  await page.goto("/parent/login");
  await expect(page.getByRole("heading", { name: "Masuk Orang Tua" })).toBeVisible();
  await pace(page, 900);
  await page.getByLabel(/email/i).fill(bridge.email as string);
  await page.getByLabel(/kata sandi/i).fill(bridge.password as string);
  await page.getByRole("button", { name: "Masuk" }).click();

  // 2. Forced password change
  await expect(page).toHaveURL(/\/parent\/ganti-password/);
  await expect(page.getByRole("heading", { name: /Ganti Kata Sandi/ })).toBeVisible();
  await pace(page, 900);
  await page.getByLabel("Kata Sandi Baru", { exact: true }).fill("parent-whisky-2026");
  await page.getByLabel("Ulangi Kata Sandi Baru").fill("parent-whisky-2026");
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(page).toHaveURL(/\/parent\/anak/);
  await pace(page, 2200);

  // 3. Children list → rapor page
  await expect(page.getByRole("heading", { name: /Anak Saya/ })).toBeVisible();
  const card = page.getByText(/Aisyah Putri Ramadhani/).first();
  await expect(card).toBeVisible();
  await pace(page, 1200);
  await page.getByRole("button", { name: "Lihat Rapor" }).click();

  // 4. Rapor detail: view, download, PDF preview
  await expect(page.getByRole("heading", { name: /Rapor Aisyah/ })).toBeVisible();
  await expect(page.getByText(/2026\/2027/).first()).toBeVisible();
  await pace(page, 1800);
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Unduh PDF" }).click();
  const download = await dl;
  expect(download.suggestedFilename()).toMatch(/rapor.*\.pdf/i);
  await pace(page, 1800);
  const preview = page.getByRole("button", { name: /Lihat PDF|Pratinjau/ });
  if ((await preview.count()) > 0) {
    await preview.click();
    await expect(page.getByRole("dialog").locator("iframe")).toBeVisible({ timeout: 30_000 });
    await pace(page, 1800);
    await page.getByRole("button", { name: /Tutup|Close/ }).click();
    await pace(page, 600);
  } else {
    await page.getByRole("button", { name: /Unduh PDF/ }).click();
    await pace(page, 1200);
  }

  // 5. Security: a different child's rapor is denied
  await page.goto(`/parent/rapor/999999/${bridge.periodId}`);
  await expect(page.getByText(/akses ditolak/)).toBeVisible();
  await pace(page, 1800);

  // 6. Logout
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/parent\/login/);
  await pace(page, 1000);
});