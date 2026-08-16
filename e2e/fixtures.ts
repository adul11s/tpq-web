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
  await expect(page.getByRole("button", { name: "Verifikasi" })).toBeVisible();
  if (await page.getByLabel(/email/i).isVisible().catch(() => false)) {
    await page.getByLabel(/email/i).fill(email);
  }
  if (opts.backupCode) {
    await page.getByRole("button", { name: /pakai kode cadangan/i }).click();
    await page.getByLabel(/kode cadangan/i).fill(opts.backupCode);
  } else {
    const code = await generate({ secret: opts.totpSecret ?? E2E_TOTP_SECRET });
    await page.getByLabel(/kode totp/i).fill(code);
  }
  await page.getByRole("button", { name: "Verifikasi" }).click();
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin(\/dashboard)?$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}
