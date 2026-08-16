import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ baseURL: "http://localhost:3001" });
await page.goto("/admin/login");
await page.getByLabel(/email/i).fill("e2e@tpq.id");
await page.getByLabel(/kata sandi/i).fill("E2E-pass-123");
await page.getByRole("button", { name: "Masuk" }).click();
await page.waitForTimeout(8000);
console.log("URL after login:", page.url());
