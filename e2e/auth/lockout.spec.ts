import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";
import { E2E429_EMAIL } from "../utils/constants";

// QA F6 / A-SR-05 / D-SE-07: login rate bucket (5/15min per email|ip) →
// 6th attempt returns 429. Uses the dedicated e2e429 user so the other
// E2E users' buckets stay untouched. Flag-independent (login rate limiting
// applies with REQUIRE_2FA on or off).
test("login rate limit: 6th failed attempt shows the 429 message", async ({ page }) => {
  test.setTimeout(180_000);
  execSync("npm --prefix ../api run e2e:reset-login-rate-limit", { stdio: "ignore" });
  await page.goto("/admin/login");
  for (let i = 0; i < 5; i++) {
    await page.getByLabel(/email/i).fill(E2E429_EMAIL);
    await page.getByLabel(/kata sandi/i).fill("wrong-password");
    await page.getByRole("button", { name: "Masuk" }).click();
    await expect(page.getByText("Invalid credentials")).toBeVisible({ timeout: 60_000 });
  }
  await page.getByLabel(/email/i).fill(E2E429_EMAIL);
  await page.getByLabel(/kata sandi/i).fill("wrong-password");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByText("Terlalu banyak percobaan login, coba lagi nanti")).toBeVisible({ timeout: 60_000 });
});
