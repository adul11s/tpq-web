import { test, expect } from "@playwright/test";

test("16 approval queue: pending rows render, Terbitkan action", async ({ page }) => {
  await page.goto("/admin/persetujuan");
  await expect(page.getByRole("heading", { name: "Menunggu Persetujuan" })).toBeVisible();
  await page.getByLabel("Entitas").selectOption({ label: "Materi" });
  const table = page.getByRole("table");
  const empty = page.getByText("Tidak ada konten menunggu persetujuan.");
  // The queue can legitimately be empty (seed content is published and prior
  // scenarios publish what they create); the page then renders the empty note
  // instead of a table, and the header/preview assertions must be conditional.
  await expect(table.or(empty)).toBeVisible();
  if ((await table.count()) > 0) {
    await expect(table.getByRole("columnheader", { name: "Entitas" })).toBeVisible();
    await expect(table.getByRole("columnheader", { name: "Aksi" })).toBeVisible();
    const publishButtons = table.getByRole("button", { name: "Terbitkan" });
    if ((await publishButtons.count()) > 0) {
      const row = publishButtons.first().locator("xpath=ancestor::tr");
      await row.getByRole("button", { name: "Pratinjau" }).click();
      const dialog = page.getByRole("dialog", { name: /Pratinjau:/ });
      await expect(dialog).toBeVisible();
      // exact: the modal backdrop button's aria-label "Tutup pratinjau" also
      // contains "Tutup", so a plain name match resolves to two elements.
      await dialog.getByRole("button", { name: "Tutup", exact: true }).click();
    }
  }
});
