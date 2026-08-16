import { execSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { E2E2_EMAIL, E2E_PASSWORD, STORAGE_STATE_PATH, API_BASE } from "./utils/constants";
import { adminLogin } from "./fixtures";

export default async function globalSetup(): Promise<void> {
  const health = await fetch(`${API_BASE}/health`).catch(() => null);
  if (!health || !health.ok) {
    throw new Error(`API is not reachable at ${API_BASE} — start it first (e.g. cd api && npm run dev)`);
  }
  execSync("npm --prefix ../api run e2e:bootstrap", { stdio: "inherit" });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000" });
  await adminLogin(page, E2E2_EMAIL, E2E_PASSWORD);
  await page.context().storageState({ path: STORAGE_STATE_PATH });
  await browser.close();
  console.log("e2e global setup ok — storage state saved");
}
