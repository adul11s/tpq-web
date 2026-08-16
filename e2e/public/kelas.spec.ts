import { test, expect } from "@playwright/test";

test("02 kelas tabs: PAUD/TK/TPA panels with jadwal, biaya, pengajar", async ({ page }) => {
  await page.goto("/kelas");
  await expect(page.getByRole("heading", { level: 1, name: "Belajar Sesuai Tahap Usia Ananda" })).toBeVisible();
  const tablist = page.getByRole("tablist", { name: "Pilih jenjang kelas" });
  for (const level of ["PAUD", "TK", "TPA"]) {
    await tablist.getByRole("tab", { name: new RegExp(level) }).click();
    const panel = page.getByRole("tabpanel", { name: new RegExp(level) });
    await expect(panel).toBeVisible();
    await expect(panel.getByText("Yang Dipelajari")).toBeVisible();
    await expect(panel.getByRole("table").getByRole("columnheader", { name: "Hari" })).toBeVisible();
    await expect(panel.getByText(/Beasiswa tersedia untuk anak yatim & dhuafa/)).toBeVisible();
    await expect(panel.getByRole("link", { name: new RegExp(`Daftar ke ${level}`) })).toBeVisible();
    await expect(panel.getByRole("link", { name: "Chat WhatsApp" }).first()).toHaveAttribute("href", /wa\.me\//);
  }
  await expect(page.getByText("Konsultasi gratis dulu?").locator("visible=true")).toBeVisible();
});
