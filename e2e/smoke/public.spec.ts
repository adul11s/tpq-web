import { expect, test } from "@playwright/test";

test("public pages declare their language in the initial HTML", async ({ page, request }) => {
  for (const [path, lang] of [["/", "id"], ["/en", "en"], ["/en/resources", "en"], ["/admin/login", "id"]]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(await response.text()).toMatch(new RegExp(`<html[^>]*lang="${lang}"`));
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test("preview traps keyboard focus and returns it to the trigger", async ({ page }) => {
  await page.goto("/resources");
  await page.locator("article h3 a").first().click();
  const trigger = page.getByRole("button", { name: "Lihat Pratinjau" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Tutup", exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("missing content is a real 404", async ({ request }) => {
  for (const path of ["/resources/does-not-exist", "/kelas/does-not-exist"]) {
    expect((await request.get(path)).status()).toBe(404);
  }
});

test("contact form rejects an empty inquiry", async ({ page }) => {
  await page.goto("/kontak");
  await page.getByRole("button", { name: "Kirim Pertanyaan" }).click();
  await expect(page.getByText("Nama harus 2–150 karakter")).toBeVisible();
  await expect(page.getByText("Anda harus menyetujui Kebijakan Privasi")).toBeVisible();
});
