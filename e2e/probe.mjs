import { chromium } from "@playwright/test";
import { generate } from "otplib";

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("response", (r) => {
  if (r.url().includes("/api/v1/")) console.log("RESP:", r.request().method(), r.url(), r.status(), r.request().postData()?.slice(0, 120));
});
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

await page.goto("http://localhost:3000/admin/login");
await page.getByLabel(/email/i).fill("e2e2@tpq.id");
await page.getByLabel(/kata sandi/i).fill("E2E-pass-123");
await page.getByRole("button", { name: "Masuk" }).click();
await page.waitForTimeout(1500);
console.log("URL:", page.url());
const emailVisible = await page.getByLabel(/email/i).isVisible().catch(() => false);
console.log("email input visible:", emailVisible);
if (emailVisible) await page.getByLabel(/email/i).fill("e2e2@tpq.id");
await page.getByLabel(/kode totp/i).fill(await generate({ secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP" }));
await page.getByRole("button", { name: "Verifikasi" }).click();
await page.waitForTimeout(1500);
console.log("URL after verify:", page.url());
await browser.close();
