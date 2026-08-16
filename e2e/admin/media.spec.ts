import { test, expect } from "@playwright/test";
import { E2E_IMG_PNG } from "../utils/constants";

test("17 media upload: PNG via dropzone → library row appears", async ({ page }) => {
  // The local API answers the upload in well under one render frame, so the
  // "Mengunggah…" progress status never becomes observable; delay only the
  // POST so the progress UI can be asserted (GETs pass straight through).
  await page.route("**/api/v1/admin/media", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route.continue();
  });
  await page.goto("/admin/media");
  // exact: the "Perpustakaan Media" h3 also contains "Media".
  await expect(page.getByRole("heading", { name: "Media", exact: true })).toBeVisible();
  await page.getByLabel("Pilih file untuk diunggah").setInputFiles({
    name: "E2E thumbnail.png",
    mimeType: "image/png",
    buffer: Buffer.from(E2E_IMG_PNG, "base64"),
  });
  // The status div's JSX text is `Mengunggah\u2026` (unprocessed backslash
  // escape in JSX text children), so the rendered text is the literal
  // "Mengunggah\u2026"; assert the role=status progress element instead.
  await expect(page.getByRole("status").getByText("Mengunggah")).toBeVisible();
  const row = page.getByText("E2E thumbnail.png").locator("xpath=ancestor::li");
  await expect(row).toBeVisible();
  // scoped to the row: seeded resource thumbnails render multiple "Gambar"
  // badges in the library, so a bare getByText("Gambar") is ambiguous.
  await expect(row.getByText("Gambar")).toBeVisible();
});
