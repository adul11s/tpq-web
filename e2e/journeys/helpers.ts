import { expect, type Page } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

export const PACE = 700;

export async function pace(page: Page, ms = PACE): Promise<void> {
  await page.waitForTimeout(ms);
}

export interface JourneyBridge {
  email?: string;
  password?: string;
  studentId?: number;
  periodId?: number;
}

const BRIDGE_PATH = "/tmp/tpq-journey-bridge.json";

export function readBridge(): JourneyBridge {
  try {
    return JSON.parse(readFileSync(BRIDGE_PATH, "utf8")) as JourneyBridge;
  } catch {
    return {};
  }
}

export function saveBridge(bridge: JourneyBridge): void {
  writeFileSync(BRIDGE_PATH, JSON.stringify(bridge, null, 2));
}

export async function loginSimple(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/kata sandi/i).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/admin(\/dashboard)?$/);
  // Note: no heading assertion here — role landings differ (admin/teacher/parent
  // dashboards), and "Panel Admin" only exists on the login page itself.
}

export async function logoutAdmin(page: Page): Promise<void> {
  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
}