import { test, expect } from "@playwright/test";

// QA Module C / F5 (N8): viewport matrix across browser engines (chromium =
// Chrome/Edge, webkit = Safari) against the dev stack. The mobile project
// covers Chrome-Android (Pixel 5 emulation); 375px coverage lives in the
// public project's mobile spec.
const PATHS: Array<{ path: string; h1: RegExp }> = [
  { path: "/", h1: /Assalamu[’']alaikum/ },
  { path: "/resources", h1: /Assalamu[’']alaikum/ },
  { path: "/kontak", h1: /Yuk, Kenalan/ },
];

for (const width of [320, 393, 768]) {
  for (const { path, h1 } of PATHS) {
    test(`C-R viewport ${width}px: ${path} renders without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  }
}

test("C-R-12 low-end Android: 3G throttle, skeleton then content on /resources", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "CDP network emulation is chromium-only");
  await page.setViewportSize({ width: 320, height: 568 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 800,
    downloadThroughput: 75_000,
    uploadThroughput: 25_000,
  });
  await page.goto("/resources");
  await expect(page.getByRole("heading", { level: 1, name: /Assalamu[’']alaikum/ })).toBeVisible();
  await expect(page.locator("article").first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/\d+ materi/)).toBeVisible({ timeout: 60_000 });
});
