import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("response", (r) => {
  if (r.url().includes("/api/v1/") || r.url().includes("_rsc")) {
    console.log("RESP:", r.request().method(), r.url().replace("http://localhost:3000", "").replace("http://localhost:3100", ""), r.status());
  }
});
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 150)); });
await page.goto("http://localhost:3000/admin/login");
await page.getByLabel(/email/i).fill("e2e2@tpq.id");
await page.getByLabel(/kata sandi/i).fill("E2E-pass-123");
await page.getByRole("button", { name: "Masuk" }).click();
await page.waitForTimeout(4000);
console.log("URL:", page.url());
console.log("MAIN:", (await page.evaluate(() => document.querySelector("main")?.innerText.slice(0, 200))));
await browser.close();
