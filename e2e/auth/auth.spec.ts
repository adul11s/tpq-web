import { test, expect } from "@playwright/test";
import { execSync } from "node:child_process";
import { generate } from "otplib";
import { E2E_EMAIL, E2E_PASSWORD } from "../utils/constants";
import { setAuthStore, getAuthStore } from "../utils/auth-store";

const VERIFY_2FA_URL = "http://localhost:3100/api/v1/admin/auth/verify-2fa";

// QA D-SE-12 mode probe: REQUIRE_2FA=off → login answers {challenge:null} and
// sets the session directly (password-only); the 2FA flows only exist with the
// flag on. The probe counts as one login against the rate bucket — the
// beforeEach reset keeps the suite well under 5/15min.
let challengeIsNull = false;
test.beforeAll(async ({ request }) => {
  const res = await request.post("http://localhost:3100/api/v1/admin/auth/login", {
    data: { email: E2E_EMAIL, password: E2E_PASSWORD },
  });
  const body = (await res.json()) as { challenge: "totp" | "enroll" | null };
  challengeIsNull = body.challenge === null;
});

// Each scenario performs 2-3 login-bucket POSTs (login + enroll/confirm or
// verify-2fa; api/src/routes/admin/auth.ts); the login bucket allows 5 per
// 15min per email|ip, so reset it before every test (same local-dev reset
// precedent as the e2e bootstrap — api commit 19db2fd).
test.beforeEach(() => {
  execSync("npm --prefix ../api run e2e:reset-login-rate-limit", { stdio: "ignore" });
});

test("11 admin login password-only (REQUIRE_2FA=off)", async ({ page }) => {
  test.skip(!challengeIsNull, "REQUIRE_2FA off required — password-only login applies only with REQUIRE_2FA=0");
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(E2E_EMAIL);
  await page.getByLabel(/kata sandi/i).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Masuk" }).click();
  // D-SE-12 off-behavior: no verify page — the login lands straight on /admin
  await expect(page).toHaveURL(/\/admin(\/dashboard)?$/);
  // QA FND-12: the soft nav doesn't re-probe /me, so a hard navigation
  // releases AuthGate and shows the dashboard
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  // While off, the 2FA endpoint is rejected even with a valid session
  const res = await page.request.post(VERIFY_2FA_URL, {
    data: { email: E2E_EMAIL, token: "000000" },
  });
  expect(res.status()).toBe(403);
  const body = (await res.json()) as { error?: string };
  expect(body.error).toBe("Verifikasi dua langkah tidak aktif");
});

test("12 admin 2FA enrollment wizard (QR → backup codes → confirm)", async ({ page }) => {
  test.skip(challengeIsNull, "REQUIRE_2FA=true required — run the API with REQUIRE_2FA=1 (SECURITY S1 gate)");
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(E2E_EMAIL);
  await page.getByLabel(/kata sandi/i).fill(E2E_PASSWORD);
  const enrollResp = page.waitForResponse((r) => r.url().includes("/admin/auth/enroll") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin\/login\/enroll/);

  // QA FND-11: useQueryParams drops ?email= on soft nav, so the wizard sits
  // on its email step; re-entering the email starts enrollment
  const emailHeading = page.getByRole("heading", { name: "Email" });
  const needsEmailStep = await emailHeading.waitFor({ state: "visible", timeout: 15000 }).then(() => true).catch(() => false);
  if (needsEmailStep) {
    await page.getByLabel(/email/i).fill(E2E_EMAIL);
    await page.getByRole("button", { name: "Mulai" }).click();
  }

  await expect(page.getByRole("heading", { name: "Amankan Akun Anda" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Pindai kode QR/ })).toBeVisible();
  await page.getByRole("button", { name: "Saya sudah memindai" }).click();

  await expect(page.getByRole("heading", { name: "Kode Cadangan Anda" })).toBeVisible();
  const codes: string[] = await page.locator("ol li").allInnerTexts();
  expect(codes).toHaveLength(8);
  for (const c of codes) expect(c).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
  const enrollBody = (await (await enrollResp).json()) as { secret: string };
  setAuthStore({ secret: enrollBody.secret, backupCodes: codes });

  await page.getByRole("checkbox", { name: "Saya sudah menyimpan kode cadangan di tempat aman." }).check();
  await page.getByRole("button", { name: "Lanjut" }).click();

  await expect(page.getByRole("heading", { name: "Verifikasi Kode Pertama" })).toBeVisible();
  await page.getByLabel(/kode totp/i).fill(await generate({ secret: enrollBody.secret }));
  const confirmResp = page.waitForResponse((r) => r.url().includes("/admin/auth/enroll-confirm") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Verifikasi & Aktifkan" }).click();
  await confirmResp;
  // QA FND-12: SessionProvider doesn't re-probe /me after login; a hard
  // navigation re-probes so AuthGate releases the dashboard
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin(\/dashboard)?$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("13 admin login via TOTP challenge", async ({ page }) => {
  test.skip(challengeIsNull, "REQUIRE_2FA=true required — run the API with REQUIRE_2FA=1 (SECURITY S1 gate)");
  const store = getAuthStore();
  expect(store.secret).toBeTruthy();
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(E2E_EMAIL);
  await page.getByLabel(/kata sandi/i).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin\/login\/verify/);
  // QA FND-11: ?email= lost on soft nav, so the form shows its email field
  const emailInput = page.getByLabel(/email/i);
  const needsEmail = await emailInput.waitFor({ state: "visible", timeout: 15000 }).then(() => true).catch(() => false);
  if (needsEmail) await emailInput.fill(E2E_EMAIL);
  await page.getByLabel(/kode totp/i).fill(await generate({ secret: store.secret }));
  const verifyResp = page.waitForResponse((r) => r.url().includes("/admin/auth/verify-2fa") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Verifikasi" }).click();
  await verifyResp;
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin(\/dashboard)?$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("14 admin login via backup code", async ({ page }) => {
  test.skip(challengeIsNull, "REQUIRE_2FA=true required — run the API with REQUIRE_2FA=1 (SECURITY S1 gate)");
  const store = getAuthStore();
  expect(store.backupCodes.length).toBeGreaterThan(0);
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(E2E_EMAIL);
  await page.getByLabel(/kata sandi/i).fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin\/login\/verify/);
  // QA FND-11: ?email= lost on soft nav, so the form shows its email field
  const emailInput = page.getByLabel(/email/i);
  const needsEmail = await emailInput.waitFor({ state: "visible", timeout: 15000 }).then(() => true).catch(() => false);
  if (needsEmail) await emailInput.fill(E2E_EMAIL);
  await page.getByRole("button", { name: "Pakai kode cadangan" }).click();
  await page.getByLabel(/kode cadangan/i).fill(store.backupCodes[0]);
  const verifyResp = page.waitForResponse((r) => r.url().includes("/admin/auth/verify-2fa") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Verifikasi" }).click();
  await verifyResp;
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin(\/dashboard)?$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});
