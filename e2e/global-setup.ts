import { execSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { E2E2_EMAIL, E2E_PASSWORD, STORAGE_STATE_PATH } from "./utils/constants";
import { adminLogin } from "./fixtures";

export default async function globalSetup(): Promise<void> {
  const health = await fetch("http://localhost:3100/health").catch(() => null);
  if (!health || !health.ok) {
    throw new Error("API is not reachable at http://localhost:3100 — start it first: cd api && npm run dev");
  }
  execSync("npm --prefix ../api run e2e:bootstrap", { stdio: "inherit" });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: "http://localhost:3000" });
  page.on("response", (r) => {
    if (r.url().includes("/api/v1/")) {
      console.log("[gs] RESP:", r.request().method(), r.url().replace("http://localhost:3100", ""), r.status());
    }
  });
  page.on("pageerror", (e) => console.log("[gs] PAGEERROR:", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.log("[gs] CONSOLE ERR:", m.text().slice(0, 200));
  });
  page.on("framenavigated", (f) => console.log("[gs] NAV:", f.url()));
  await adminLogin(page, E2E2_EMAIL, E2E_PASSWORD);
  await page.context().storageState({ path: STORAGE_STATE_PATH });
  await browser.close();
  console.log("e2e global setup ok — storage state saved");
}
