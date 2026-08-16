import { test, expect } from "@playwright/test";

test.describe("mobile 375px", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  for (const path of ["/", "/kelas", "/resources", "/doa", "/kontak"]) {
    test(`09 mobile 375px: no horizontal scroll on ${path}`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
});

test.describe("keyboard", () => {
  test("10 keyboard a11y: tab order + Enter on resources", async ({ page }) => {
    await page.goto("/resources");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Lewati ke konten utama" })).toBeFocused();
    await page.getByRole("link", { name: "Lewati ke konten utama" }).press("Enter");
    await expect(page.getByLabel("Cari materi")).toBeInViewport();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Cari materi")).toBeFocused();
    await page.getByLabel("Cari materi").fill("kaligrafi");
    await page.getByRole("button", { name: "Cari", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/\d+ materi/)).toBeVisible();
    const firstCardLink = page.locator("article h3 a").first();
    await firstCardLink.focus();
    await firstCardLink.press("Enter");
    await expect(page).toHaveURL(/\/resources\/[\w-]+$/);
  });
});
