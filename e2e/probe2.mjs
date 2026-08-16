import { chromium } from "@playwright/test";
import { generate } from "otplib";

const browser = await chromium.launch();
const page = await browser.newPage({ baseURL: "http://localhost:3000" });
page.on("response", (r) => {
  if (r.url().includes("/api/v1/")) console.log("RESP:", r.request().method(), r.url().replace("http://localhost:3100", ""), r.status());
});
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

// mirror of fixtures.ts adminLogin (current version)
try {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill("e2e2@tpq.id");
  await page.getByLabel(/kata sandi/i).fill("E2E-pass-123");
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.getByRole("button", { name: "Verifikasi" }).waitFor({ state: "visible", timeout: 15000 });
  const emailInput = page.getByLabel(/email/i);
  const needsEmail = await emailInput.waitFor({ state: "visible", timeout: 2000 }).then(() => true).catch(() => false);
  console.log("needsEmail:", needsEmail);
  if (needsEmail) await emailInput.fill("e2e2@tpq.id");
  await page.getByLabel(/kode totp/i).fill(await generate({ secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP" }));
  await page.getByRole("button", { name: "Verifikasi" }).click();
  await page.goto("/admin");
  const url = page.url();
  console.log("FINAL URL:", url);
  console.log("dashboard heading visible:", await page.getByRole("heading", { name: "Dashboard" }).isVisible().catch(() => false));
} catch (e) {
  console.log("FAILED:", (e && e.message || String(e)).slice(0, 300));
}
await browser.close();
