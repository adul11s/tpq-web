import { test, expect } from "@playwright/test";
import { E2E_IMG_PNG } from "../utils/constants";
import { pace, loginSimple, logoutAdmin } from "./helpers";

test.setTimeout(540_000);

test("cm journey: content manager full capability, single take", async ({ page }) => {
  // 1. Login (password-only, no 2FA)
  await loginSimple(page, "content@tpq.id", "content123");
  await pace(page, 1200);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await pace(page, 2400);

  // 2. Konten: edit an existing published printable (revert-to-draft behavior)
  await page.getByRole("link", { name: "Konten" }).click();
  await page.waitForURL(/\/admin\/konten$/);
  await pace(page, 800);
  await page.getByRole("link", { name: /Materi/ }).click();
  await page.waitForURL(/\/admin\/konten\/resources$/);
  await pace(page, 900);
  const row = page.getByRole("row", { name: /Kaligrafi Bismillah \(Panjang\)/ }).first();
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Deskripsi").fill(
    "Kaligrafi Bismillah versi panjang untuk latihan menulis. Diperbarui oleh tim konten.",
  );
  await page.getByRole("button", { name: "Simpan Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/konten\/resources$/);
  await expect(row.getByText(/Draft|Publik/)).toBeVisible({ timeout: 30_000 });
  await pace(page, 1500);

  // 3. Upload a new printable via Media library
  await page.goto("/admin/media");
  await expect(page.getByRole("heading", { name: "Media", exact: true })).toBeVisible();
  await pace(page, 800);
  await page.getByLabel("Pilih file untuk diunggah").setInputFiles({
    name: "poster-jadwal-hafalan.png",
    mimeType: "image/png",
    buffer: Buffer.from(E2E_IMG_PNG, "base64"),
  });
  await expect(page.getByText("poster-jadwal-hafalan.png")).toBeVisible({ timeout: 30_000 });
  await pace(page, 1300);

  // 4. Prayer guides: edit an existing entry
  await page.goto("/admin/konten/prayer_guides");
  await expect(page.getByRole("row").first()).toBeVisible();
  await pace(page, 800);
  await page.getByRole("row").nth(1).getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Transliterasi").fill("Alhamdulillahil ladzi ath'amana wa saqana (contoh)");
  await page.getByRole("button", { name: "Simpan Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/konten\/prayer_guides$/);
  await pace(page, 1400);

  // 5. Inquiry inbox: reply cue (>24 jam) + WhatsApp handoff
  await page.goto("/admin/inquiry");
  await expect(page.getByRole("heading", { name: "Kotak Masuk Inquiry" })).toBeVisible();
  const inquiryRow = page.getByRole("row", { name: /Ibu Sarah Rahmawati/ });
  await expect(inquiryRow).toBeVisible();
  await expect(inquiryRow.getByText("> 24 jam")).toBeVisible();
  await pace(page, 900);
  await inquiryRow.getByLabel(/Catatan admin untuk Ibu Sarah Rahmawati/).fill(
    "Menunggu balasan wali santri, follow-up besok.",
  );
  await inquiryRow.getByRole("button", { name: /Simpan Catatan/ }).click();
  await pace(page, 800);
  await expect(
    inquiryRow.getByRole("link", { name: "Lanjut via WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me\//);
  await pace(page, 1200);

  // 6. Limits: no Publish button on drafts, no admin-only menu entries
  await page.goto("/admin/konten/resources");
  await page.getByRole("row", { name: /Materi Menulis Hijaiyah \(Demo Admin\)/ }).first().getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("button", { name: /Terbitkan|Publish/ })).toHaveCount(0);
  await page.goto("/admin/konten/resources");
  await pace(page, 600);
  for (const forbidden of ["Persetujuan", "Pengguna", "Aktivitas", "Pengaturan", "Rapor"]) {
    await expect(page.getByRole("link", { name: forbidden })).toHaveCount(0);
  }
  for (const allowed of ["Konten", "Media", "Inquiry"]) {
    await expect(page.getByRole("link", { name: allowed })).toHaveCount(1);
  }
  await pace(page, 1000);

  // 7. Logout
  await logoutAdmin(page);
  await pace(page, 1000);
});