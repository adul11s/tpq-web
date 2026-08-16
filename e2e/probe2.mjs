import { chromium } from "@playwright/test";
import { generate } from "otplib";

for (let run = 1; run <= 6; run++) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: "http://localhost:3000" });
  const log = [];
  page.on("response", (r) => {
    if (r.url().includes("/api/v1/")) {
      log.push(`${r.request().method()} ${r.url().replace("http://localhost:3100", "")} -> ${r.status()}`);
    }
  });
  try {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill("e2e2@tpq.id");
    await page.getByLabel(/kata sandi/i).fill("E2E-pass-123");
    await page.getByRole("button", { name: "Masuk" }).click();
    await page.getByRole("button", { name: "Verifikasi" }).waitFor({ state: "visible", timeout: 20000 });
    const emailInput = page.getByLabel(/email/i);
    const needsEmail = await emailInput.waitFor({ state: "visible", timeout: 15000 }).then(() => true).catch(() => false);
    if (needsEmail) await emailInput.fill("e2e2@tpq.id");
    await page.getByLabel(/kode totp/i).fill(await generate({ secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP" }));
    await page.getByRole("button", { name: "Verifikasi" }).click();
    await page.goto("/admin");
    const ok = await page.getByRole("heading", { name: "Dashboard" }).waitFor({ state: "visible", timeout: 10000 }).then(() => true).catch(() => false);
    console.log(`RUN ${run}: ${ok ? "PASS" : "FAIL"} | url=${page.url()} | ${log.join(" ; ")}`);
  } catch (e) {
    console.log(`RUN ${run}: EXCEPTION ${(e && e.message || String(e)).slice(0, 120)} | url=${page.url()} | ${log.join(" ; ")}`);
  }
  await browser.close();
}
