import { test, expect } from "@playwright/test";
import { API_BASE } from "../utils/constants";

test("19 inquiry inbox: pipeline, status change, admin note, CSV export", async ({ page, request }) => {
  const settings = await request.get(`${API_BASE}/api/v1/site-settings`);
  expect(settings.ok()).toBeTruthy();
  const settingsBody = (await settings.json()) as { privacy_policy_version: string | null };
  const create = await request.post(`${API_BASE}/api/v1/inquiries`, {
    data: {
      parent_name: "E2E Inbox Probe",
      phone: "081234567890",
      child_age: "6",
      message: "E2E inbox pipeline check.",
      consent_given: true,
      privacy_policy_version: settingsBody.privacy_policy_version ?? "1.0",
    },
  });
  expect(create.ok()).toBeTruthy();

  await page.goto("/admin/inquiry");
  await expect(page.getByRole("heading", { name: "Kotak Masuk Inquiry" })).toBeVisible();
  const pipeline = page.getByRole("group", { name: "Pipeline inquiry" });
  await pipeline.getByRole("button", { name: /^New/ }).click();
  const row = page.getByRole("row", { name: /E2E Inbox Probe/ });
  await expect(row).toBeVisible();
  // Note first: changing the status removes the row from the "New" filter view
  // (the table only shows rows of the active pipeline column), so the note
  // textarea would detach mid-fill if the status were changed before it.
  await row.getByLabel("Catatan admin untuk E2E Inbox Probe").fill("E2E catatan admin.");
  await row.getByRole("button", { name: "Simpan Catatan untuk E2E Inbox Probe" }).click();
  await row.getByLabel("Status E2E Inbox Probe").selectOption({ label: "Contacted" });
  await pipeline.getByRole("button", { name: /^Contacted/ }).click();
  await expect(page.getByRole("row", { name: /E2E Inbox Probe/ })).toBeVisible();

  const dlPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor CSV" }).click();
  const dl = await dlPromise;
  expect(dl.suggestedFilename()).toBe("inquiries.csv");
});
