import { test, expect } from "@playwright/test";

test("14 konten CRUD: create draft resource, edit, publish, archive, status filter", async ({ page }) => {
  await page.goto("/admin/konten/resources");
  await expect(page.getByRole("heading", { name: "Materi" })).toBeVisible();
  await page.getByRole("link", { name: "Buat Baru" }).click();
  await expect(page.getByRole("heading", { name: "Buat Materi Baru" })).toBeVisible();

  await page.getByLabel("Judul").fill("E2E Materi Test");
  await page.getByLabel("Kategori").selectOption({ label: "Doa Harian" });
  await page.getByLabel("Kelompok usia").selectOption({ label: "Semua" });
  await page.getByLabel("Deskripsi").fill("E2E description for the QA video suite.");

  await page.getByLabel("File materi").click();
  const picker = page.getByRole("dialog", { name: "Pilih Media" });
  await picker.getByLabel("Cari media").fill(".pdf");
  await picker.locator("li button").first().click();
  // Dev: MediaPicker item click closes the dialog itself (setOpen(false)),
  // so the plan's post-pick "Tutup" click would target a detached element.

  await page.getByLabel("Thumbnail").click();
  const picker2 = page.getByRole("dialog", { name: "Pilih Media" });
  await picker2.locator("li button").first().click();

  await page.getByRole("button", { name: "Simpan Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/konten\/resources$/);
  const row = page.getByRole("row", { name: /E2E Materi Test/ });
  await expect(row).toBeVisible();
  await expect(row.getByText("Draft")).toBeVisible();

  // Dev: EntityTable renders Edit as a <button> (Button onClick), not a link.
  await row.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Deskripsi").fill("E2E description updated.");
  await page.getByRole("button", { name: "Simpan Draft" }).click();
  await expect(page).toHaveURL(/\/admin\/konten\/resources$/);

  await page.getByRole("button", { name: "Terbitkan" }).first().click();
  await expect(page.getByRole("row", { name: /E2E Materi Test/ }).getByText("Publik")).toBeVisible();

  await page.getByRole("button", { name: "Arsipkan" }).first().click();
  await expect(page.getByRole("row", { name: /E2E Materi Test/ }).getByText("Arsip")).toBeVisible();

  const filter = page.getByRole("group", { name: "Filter status" });
  await filter.getByRole("button", { name: "Draft" }).click();
  await expect(page.getByRole("row", { name: /E2E Materi Test/ })).toBeHidden();
  await filter.getByRole("button", { name: "Arsip" }).click();
  await expect(page.getByRole("row", { name: /E2E Materi Test/ })).toBeVisible();
});

test("15 publish → visible on public site", async ({ page }) => {
  await page.goto("/admin/konten/resources");
  await page.getByRole("link", { name: "Buat Baru" }).click();
  await page.getByLabel("Judul").fill("E2E Materi Publik");
  await page.getByLabel("Kategori").selectOption({ label: "Bacaan" });
  await page.getByLabel("Kelompok usia").selectOption({ label: "Semua" });
  await page.getByLabel("File materi").click();
  const picker = page.getByRole("dialog", { name: "Pilih Media" });
  await picker.getByLabel("Cari media").fill(".pdf");
  await picker.locator("li button").first().click();
  await page.getByLabel("Thumbnail").click();
  const picker2 = page.getByRole("dialog", { name: "Pilih Media" });
  await picker2.locator("li button").first().click();
  await page.getByRole("button", { name: "Simpan Draft" }).click();
  await page.getByRole("button", { name: "Terbitkan" }).first().click();

  const publicPage = await page.context().newPage();
  await publicPage.goto("/resources");
  await publicPage.getByLabel("Cari materi").fill("E2E Materi Publik");
  // exact: the clear-search button's name "Hapus pencarian" also contains "cari".
  await publicPage.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(publicPage.getByRole("heading", { name: "E2E Materi Publik" })).toBeVisible();
  await expect(publicPage.locator("article").getByRole("link", { name: /^Pratinjau E2E Materi Publik/ })).toBeVisible();
  await publicPage.close();
});
