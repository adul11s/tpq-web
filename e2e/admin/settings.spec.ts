import { test, expect } from "@playwright/test";

test("22 settings: edit whatsapp → reflected on public kontak page, then restored", async ({ page }) => {
  const settings = await page.request.get("/api/admin/site_settings");
  expect(settings.ok()).toBeTruthy();
  const body = (await settings.json()) as { site_settings: Array<{ key: string; value: unknown }> };
  const before = (body.site_settings.find((s) => s.key === "whatsapp")?.value as string) ?? "";

  await page.goto("/admin/pengaturan");
  await expect(page.getByRole("heading", { name: "Pengaturan Situs" })).toBeVisible();
  const waField = page.getByLabel("Nilai whatsapp");
  await waField.fill('"628888888888"');
  await page.getByRole("button", { name: "Simpan whatsapp" }).click();
  await expect(page.getByText("Tersimpan")).toBeVisible();

  const publicPage = await page.context().newPage();
  await publicPage.goto("/kontak");
  await expect(publicPage.getByRole("link", { name: "Chat WhatsApp" }).first()).toHaveAttribute(
    "href",
    /https:\/\/wa\.me\/628888888888/,
    { timeout: 30_000 },
  );
  await publicPage.close();

  await waField.fill(JSON.stringify(before));
  await page.getByRole("button", { name: "Simpan whatsapp" }).click();
  await expect(page.getByText("Tersimpan")).toBeVisible();
});
