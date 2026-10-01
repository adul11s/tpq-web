import { test, expect } from "@playwright/test";
import { E2E_IMG_PNG } from "../utils/constants";
import { pace, loginSimple, logoutAdmin, saveBridge, type JourneyBridge } from "./helpers";

test.setTimeout(960_000);

test("admin journey: full capability, single take (REQUIRE_2FA=1)", async ({ page }) => {
  const bridge: JourneyBridge = {};
  await page.route("**/api/v1/admin/users/parents", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const data = route.request().postDataJSON() as { email?: string; initial_password?: string };
    bridge.email = data.email;
    bridge.password = data.initial_password;
    await route.continue();
  });
  await page.route("**/api/v1/admin/students", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    const resp = await route.fetch();
    bridge.studentId = (await resp.json()).id as number;
    await route.fulfill({ response: resp });
  });

  // 1. Login
  await loginSimple(page, "admin@tpq.id", "admin123");
  await pace(page, 1200);

  // 2. Dashboard tour
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await pace(page, 2600);

  // 3. Konten: create a resource draft with PDF + thumbnail, publish, public check
  await page.getByRole("link", { name: "Konten" }).click();
  await page.waitForURL(/\/admin\/konten$/);
  await pace(page, 900);
  await page.getByRole("link", { name: /Materi/ }).click();
  await page.waitForURL(/\/admin\/konten\/resources$/);
  await expect(page.getByRole("heading", { name: "Materi" })).toBeVisible();
  await pace(page, 800);
  await page.getByRole("link", { name: "Buat Baru" }).click();
  await expect(page.getByRole("heading", { name: "Buat Materi Baru" })).toBeVisible();
  await pace(page, 700);
  await page.getByLabel("Judul").fill("Materi Menulis Hijaiyah (Demo Admin)");
  await page.getByLabel("Kategori").selectOption({ label: "Mewarnai" });
  await page.getByLabel("Kelompok usia").selectOption({ label: "PAUD 3–4" });
  await page.getByLabel("Deskripsi").fill("Materi latihan menulis huruf hijaiyah untuk santri PAUD.");
  await page.getByLabel("File materi").click();
  const picker = page.getByRole("dialog", { name: "Pilih Media" });
  await picker.getByLabel("Cari media").fill(".pdf");
  await pace(page, 700);
  await picker.locator("li button").first().click();
  await page.getByLabel("Thumbnail").click();
  const picker2 = page.getByRole("dialog", { name: "Pilih Media" });
  await picker2.locator("li button").first().click();
  await pace(page, 500);
  await page.getByRole("button", { name: "Simpan Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/konten\/resources$/);
  const row = page.getByRole("row", { name: /Materi Menulis Hijaiyah \(Demo Admin\)/ });
  await expect(row).toBeVisible();
  await expect(row.getByText("Draft")).toBeVisible();
  await pace(page, 1000);
  await row.getByRole("button", { name: "Terbitkan" }).click();
  await expect(row.getByText("Publik")).toBeVisible({ timeout: 30_000 });
  await pace(page, 1500);
  const publicPage = await page.context().newPage();
  await publicPage.goto("/resources");
  await publicPage.getByLabel("Cari materi").fill("Materi Menulis Hijaiyah");
  await publicPage.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(
    publicPage.getByRole("link", { name: /Materi Menulis Hijaiyah \(Demo Admin\)/ }).first(),
  ).toBeVisible({ timeout: 30_000 });
  await pace(publicPage, 2000);
  await publicPage.close();

  // 4. Media library: list + upload
  await page.goto("/admin/media");
  await expect(page.getByRole("heading", { name: "Media", exact: true })).toBeVisible();
  await pace(page, 800);
  await page.getByLabel("Pilih file untuk diunggah").setInputFiles({
    name: "thumbnail-demo.png",
    mimeType: "image/png",
    buffer: Buffer.from(E2E_IMG_PNG, "base64"),
  });
  await expect(page.getByText("thumbnail-demo.png")).toBeVisible({ timeout: 30_000 });
  await pace(page, 1200);

  // 5. Schedule editor: add a row to the PAUD class
  await page.goto("/admin/konten/classes");
  await expect(page.getByRole("row", { name: /PAUD/ }).first()).toBeVisible();
  await pace(page, 800);
  await page.getByRole("row", { name: /PAUD/ }).first().getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Tambah Jadwal" }).click();
  const row1 = page.getByRole("group", { name: /Jadwal baris/ }).last();
  await row1.getByLabel("Hari").selectOption({ label: "Senin" });
  await row1.getByLabel("Waktu mulai").fill("07:30");
  await row1.getByLabel("Waktu selesai").fill("09:00");
  await row1.getByLabel("Kegiatan").fill("Mengaji & Hafalan");
  await page.getByRole("button", { name: "Simpan Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/konten\/classes$/);
  await pace(page, 1500);

  // 6. Approval queue: publish the CM-created draft (admin-only power)
  await page.goto("/admin/persetujuan");
  await expect(page.getByRole("heading", { name: /Menunggu Persetujuan/ })).toBeVisible();
  const cmDraft = page.getByRole("row", { name: /Mewarnai Kaligrafi Asmaul Husna/ });
  await expect(cmDraft).toBeVisible();
  await cmDraft.getByRole("button", { name: "Terbitkan" }).click();
  await expect(cmDraft).toBeHidden({ timeout: 30_000 });
  await pace(page, 1500);
  await page.goto("/admin/konten/resources");
  await expect(
    page.getByRole("row", { name: /Mewarnai Kaligrafi Asmaul Husna \(Draft Latihan CM\)/ }).getByText("Publik"),
  ).toBeVisible({ timeout: 30_000 });
  await pace(page, 1500);

  // 7. Inquiry inbox: pipeline, note, status, WhatsApp handoff, CSV export
  await page.goto("/admin/inquiry");
  await expect(page.getByRole("heading", { name: "Kotak Masuk Inquiry" })).toBeVisible();
  await pace(page, 800);
  await page.getByRole("group", { name: "Pipeline inquiry" }).getByRole("button", { name: /^New/ }).click();
  const inquiryRow = page.getByRole("row", { name: /Ibu Sarah Rahmawati/ });
  await expect(inquiryRow).toBeVisible();
  await pace(page, 600);
  await inquiryRow.getByLabel(/Catatan admin untuk Ibu Sarah Rahmawati/).fill("Sudah dihubungi via WhatsApp pada 17 Agustus.");
  await inquiryRow.getByRole("button", { name: /Simpan Catatan/ }).click();
  await pace(page, 800);
  await inquiryRow.getByLabel(/Status Ibu Sarah Rahmawati/).selectOption({ label: "Contacted" });
  await page.getByRole("group", { name: "Pipeline inquiry" }).getByRole("button", { name: /^Contacted/ }).click();
  await expect(page.getByRole("row", { name: /Ibu Sarah Rahmawati/ })).toBeVisible();
  await expect(
    page.getByRole("row", { name: /Ibu Sarah Rahmawati/ }).getByRole("link", { name: "Lanjut via WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me\//);
  await pace(page, 1000);
  const csvDl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor CSV" }).click();
  expect((await csvDl).suggestedFilename()).toBe("inquiries.csv");
  await pace(page, 1200);

  // 8. Pengguna: provision a parent (initial password shown once)
  await page.goto("/admin/pengguna");
  await expect(page.getByRole("heading", { name: "Pengguna" })).toBeVisible();
  await pace(page, 900);
  await page.getByRole("button", { name: "Tambah Orang Tua" }).click();
  await page.getByLabel("Email").fill("parent-journey@tpq.id");
  await page.getByLabel(/Nama Lengkap/i).fill("Bpk/Ibu Wali Aisyah");
  await page.getByRole("button", { name: "Buat Akun" }).click();
  const success = page.getByLabel("Akun orang tua berhasil dibuat");
  await expect(success).toBeVisible({ timeout: 30_000 });
  await expect(success.getByLabel("Kata sandi awal")).not.toHaveValue("");
  await pace(page, 2200);
  await success.getByRole("link", { name: "Buka WhatsApp" }).click();
  await pace(page, 1500);
  await success.getByRole("button").filter({ hasText: /^Tutup$/ }).click();

  // 9. Aktivitas: audit log + CSV export
  await page.goto("/admin/aktivitas");
  await expect(page.getByRole("heading", { name: /Aktivitas/ })).toBeVisible();
  await pace(page, 900);
  const auditDl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor CSV" }).click();
  await auditDl;
  await pace(page, 1400);

  // 10. Pengaturan: JSON gate + invalid-JSON feedback
  await page.goto("/admin/pengaturan");
  await expect(page.getByRole("heading", { name: "Pengaturan Situs" })).toBeVisible();
  await pace(page, 900);
  const waField = page.getByLabel("Nilai whatsapp");
  const before = await waField.inputValue();
  await waField.fill('{"a":');
  await page.getByRole("button", { name: "Simpan whatsapp" }).click();
  await expect(page.getByText(/tidak valid/i)).toBeVisible();
  await pace(page, 1000);
  // Restore the raw textarea content; JSON.stringify here would double-encode the
  // already-JSON value and corrupt site_settings.whatsapp a little more per run.
  await waField.fill(before);
  await page.getByRole("button", { name: "Simpan whatsapp" }).click();
  await expect(page.getByText("Tersimpan")).toBeVisible();
  await pace(page, 1400);

  // 11. SMS — students CRUD: add a student
  await page.goto("/admin/sms/students");
  await expect(page.getByRole("heading", { name: "Santri" })).toBeVisible();
  await pace(page, 900);
  await page.getByRole("button", { name: "Tambah Santri" }).click();
  await page.getByLabel(/Nama Lengkap/i).fill("Aisyah Putri Ramadhani");
  await page.getByLabel(/Tanggal lahir|Lahir/).fill("2020-05-14");
  await page.getByLabel("Kelas").selectOption({ label: "PAUD Qur'ani" });
  await page.getByRole("button", { name: "Simpan Santri" }).click();
  const studentRow = page.getByRole("row", { name: /Aisyah Putri Ramadhani/ });
  await expect(studentRow).toBeVisible({ timeout: 30_000 });
  await pace(page, 1200);
  await studentRow.getByRole("button", { name: "Tautkan Ortu" }).click();
  await page.getByLabel("Cari email orang tua").fill("parent-journey@tpq.id");
  const linkTautkan = page
    .locator("li")
    .filter({ hasText: "parent-journey@tpq.id" })
    .first()
    .getByRole("button", { name: "Tautkan" });
  await expect(linkTautkan).toBeVisible({ timeout: 15_000 });
  await pace(page, 500);
  await linkTautkan.click({ timeout: 15_000 });
  await expect(page.getByText(/parent-journey@tpq.id/).first()).toBeVisible();
  await pace(page, 1300);
  await page.getByRole("button", { name: "Tutup" }).click();

  // 12. Enrollments: class x academic year
  await page.goto("/admin/sms/enrollments");
  await expect(page.getByRole("heading", { name: "Pendaftaran Kelas" })).toBeVisible();
  await pace(page, 800);
  await page.getByLabel("Santri").selectOption({ label: "Aisyah Putri Ramadhani" });
  await page.getByLabel("Kelas").selectOption({ label: "PAUD Qur'ani" });
  await page.getByLabel("Tahun Ajaran *").selectOption("2026/2027 · Aktif");
  await page.getByRole("button", { name: "Daftarkan" }).click();
  await expect(page.getByRole("row", { name: /Aisyah Putri Ramadhani/ })).toBeVisible({
    timeout: 30_000,
  });
  await pace(page, 1400);

  // 13. Hafalan recorder: mark surah tuntas + fluency
  await page.goto("/admin/sms/hafalan");
  await expect(page.getByRole("heading", { name: "Hafalan" })).toBeVisible();
  await pace(page, 800);
  await page.getByLabel("Kelas").selectOption({ label: "PAUD Qur'ani" });
  await expect(page.getByText(/An-Nas|al-Fatihah|al-Ikhlas/).first()).toBeVisible();
  await pace(page, 700);
  const surahBtn = page
    .locator('button[aria-label*="Aisyah Putri Ramadhani"]')
    .filter({ hasText: /Belum|Sedang/ })
    .first();
  await surahBtn.click();
  await pace(page, 700);
  await page
    .locator('button[aria-label*="Aisyah Putri Ramadhani"]')
    .filter({ hasText: "Sedang" })
    .first()
    .click();
  await pace(page, 700);
  await expect(
    page.locator('button[aria-label*="Aisyah Putri Ramadhani"]').filter({ hasText: "Tuntas" }).first(),
  ).toBeVisible();
  const fluencyBtn = page
    .locator('button[aria-label*="kelancaran"]')
    .filter({ hasText: /Kurang Lancar|Lancar/ })
    .first();
  await fluencyBtn.click();
  await pace(page, 1400);

  // 14. Attendance: today + statuses + summary
  await page.goto("/admin/sms/absensi");
  await expect(page.getByRole("heading", { name: "Absensi" })).toBeVisible();
  await pace(page, 800);
  const today = new Date().toISOString().slice(0, 10);
  await page.getByLabel("Tanggal").fill(today);
  await page.getByLabel("Kelas").selectOption({ label: "PAUD Qur'ani" });
  await expect(page.getByRole("row", { name: /Aisyah Putri Ramadhani/ })).toBeVisible();
  await page.getByLabel(/Status Aisyah Putri Ramadhani/).selectOption({ label: "Hadir" });
  await page.getByRole("button", { name: "Simpan Absensi" }).click();
  await expect(page.getByText("Hadir: 1")).toBeVisible({ timeout: 30_000 });
  await pace(page, 1600);

  // 15. Rapor: narrative → lock period → generate PDF → documents
  await page.goto("/admin/sms/rapor");
  await expect(page.getByRole("heading", { name: "Rapor", exact: true })).toBeVisible();
  await pace(page, 900);
  await page.getByLabel("Periode").selectOption("2026/2027 · Ganjil (Terbuka)");
  await page.getByLabel("Santri").selectOption({ label: "Aisyah Putri Ramadhani" });
  await page.getByLabel("Narasi Perkembangan").fill(
    "Ananda memperlihatkan kemajuan dalam menghafal surat-surat pendek. Sudah mampu meniru gerakan wudhu dengan bimbingan.",
  );
  await page.getByLabel("Catatan Guru").fill("Terus semangat, Aisyah! Latihan membaca surat pendek setiap hari.");
  await pace(page, 700);
  await page.getByRole("button", { name: "Kunci" }).click();
  const lockDialog = page.getByRole("dialog", { name: /Konfirmasi: Kunci periode/ });
  await lockDialog.getByRole("button", { name: "Konfirmasi" }).click();
  await expect(page.getByText("Terkunci")).toBeVisible({ timeout: 30_000 });
  await pace(page, 1500);
  await page.getByRole("button", { name: "Generate PDF" }).click();
  await expect(page.getByRole("table").getByText("Aisyah Putri Ramadhani")).toBeVisible({
    timeout: 60_000,
  });
  await pace(page, 1800);

  // 16. Logout
  await logoutAdmin(page);
  await pace(page, 1000);

  saveBridge({ ...bridge, periodId: 1 });
  console.log("bridge:", JSON.stringify(bridge));
});