import { test, expect } from "@playwright/test";

test("07 kontak: validation, consent gate, success panel with WhatsApp", async ({ page }) => {
  await page.goto("/kontak");
  await expect(page.getByRole("heading", { level: 1, name: "Yuk, Kenalan Dulu!" })).toBeVisible();
  await page.getByRole("button", { name: "Kirim Pertanyaan" }).click();
  await expect(page.getByText("Nama harus 2–150 karakter")).toBeVisible();
  await expect(page.getByText("Nomor HP tidak valid")).toBeVisible();
  await expect(page.getByText("Pilih usia ananda")).toBeVisible();
  await expect(page.getByText("Pilih program yang diminati")).toBeVisible();
  await expect(page.getByText("Pertanyaan minimal 10 karakter")).toBeVisible();
  await expect(page.getByText("Anda harus menyetujui Kebijakan Privasi")).toBeVisible();

  await page.getByLabel(/Nama Ayah\/Bunda/).fill("E2E Oma Test");
  await page.getByLabel(/Nomor WhatsApp/).fill("081234567890");
  await page.getByLabel(/Usia Ananda/).selectOption({ label: "5 tahun" });
  await page.getByLabel(/Program yang Diminati/).selectOption({ index: 1 });
  await page.getByLabel(/Pertanyaan/).fill("E2E question for the QA video suite.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Kirim Pertanyaan" }).click();
  await expect(page.getByRole("heading", { name: "Terima kasih!" })).toBeVisible();
  const wa = page.getByRole("link", { name: "Lanjut via WhatsApp" });
  await expect(wa).toHaveAttribute("href", /https:\/\/wa\.me\/6281234567890\?text=/);
  await expect(page.getByRole("button", { name: "Kirim pertanyaan lain" })).toBeVisible();
});
