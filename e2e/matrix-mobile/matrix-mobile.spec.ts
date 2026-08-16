import { test, expect } from "@playwright/test";

// QA Module C / F5 (N8): Chrome-Android via Pixel 5 device emulation
// (393×851), 5 key pages.
const PAGES: Array<{ path: string; h1: RegExp }> = [
  { path: "/", h1: /Assalamu[’']alaikum/ },
  { path: "/kelas", h1: /Belajar Sesuai Tahap Usia/ },
  { path: "/resources", h1: /Assalamu[’']alaikum/ },
  { path: "/doa", h1: /Hafalkan Doa-Doa/ },
  { path: "/kontak", h1: /Yuk, Kenalan/ },
];

for (const { path, h1 } of PAGES) {
  test(`mobile Android (Pixel 5): ${path} renders without horizontal scroll`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
}
