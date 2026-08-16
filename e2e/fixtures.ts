import { expect, type Page } from "@playwright/test";
import { E2E_TOTP_SECRET } from "./utils/constants";
import { generate } from "otplib";

export async function adminLogin(
  page: Page,
  email: string,
  password: string,
  opts: { totpSecret?: string; backupCode?: string } = {},
): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/kata sandi/i).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  // REQUIRE_2FA=off → straight to /admin; on → verify page (totp or backup).
  // Predicate (not a bare regex): /\/admin(\/login\/verify)?/ would match the
  // login page itself ("/admin/login") and race the in-flight login POST.
  await page.waitForURL(
    (url) => /\/admin(\/dashboard)?$/.test(url.pathname) || url.pathname === "/admin/login/verify"
  );
  if (page.url().includes("/admin/login/verify")) {
    // QA FND-11: ?email= is dropped on soft nav, so the verify form shows its
    // own email field — wait for it to appear (post-hydration) before refilling
    const emailInput = page.getByLabel(/email/i);
    const needsEmail = await emailInput.waitFor({ state: "visible", timeout: 15000 }).then(() => true).catch(() => false);
    if (needsEmail) await emailInput.fill(email);
    if (opts.backupCode) {
      await page.getByRole("button", { name: /pakai kode cadangan/i }).click();
      await page.getByLabel(/kode cadangan/i).fill(opts.backupCode);
    } else {
      const code = await generate({ secret: opts.totpSecret ?? E2E_TOTP_SECRET });
      await page.getByLabel(/kode totp/i).fill(code);
    }
    await page.getByRole("button", { name: "Verifikasi" }).click();
  }
  // QA FND-12: hard navigation re-probes /me so AuthGate releases the dashboard
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin(\/dashboard)?$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}
