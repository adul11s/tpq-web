// Records a ~75s product tour of the live site (public pages + admin CMS).
// Usage: node scripts/demo-video.mjs [baseURL]
// Output: demo-output/video.webm (converted to docs/media/demo.mp4 + demo.gif separately)

import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, readdirSync } from "node:fs";

const BASE = process.argv[2] ?? process.env.DEMO_BASE_URL ?? "https://tpq-qurani-portfolio.vercel.app";
const OUT = "demo-output";

const wait = (page, ms) => page.waitForTimeout(ms);

async function step(page, label, fn) {
  const started = Date.now();
  try {
    await fn();
    console.log(`ok   ${label} (${Math.round((Date.now() - started) / 1000)}s)`);
  } catch (err) {
    console.log(`skip ${label}: ${err.message.split("\n")[0]}`);
  }
}

// Visible cursor + click ripple so the recording shows intent.
const CURSOR_JS = () => {
  const dot = document.createElement("div");
  dot.id = "__demo_cursor";
  dot.style.cssText =
    "position:fixed;z-index:2147483647;width:18px;height:18px;border-radius:50%;" +
    "background:rgba(16,185,129,.85);box-shadow:0 0 0 4px rgba(16,185,129,.25);" +
    "pointer-events:none;transform:translate(-50%,-50%);transition:width .1s,height .1s;left:-40px;top:-40px";
  document.documentElement.appendChild(dot);
  window.addEventListener("mousemove", (e) => {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
  }, true);
  window.addEventListener("mousedown", () => {
    dot.style.width = "28px";
    dot.style.height = "28px";
  }, true);
  window.addEventListener("mouseup", () => {
    dot.style.width = "18px";
    dot.style.height = "18px";
  }, true);
};

async function glide(page, x, y) {
  await page.mouse.move(x, y, { steps: 12 });
  await wait(page, 350);
}

async function clickLink(page, name) {
  const loc = page.getByRole("link", { name }).first();
  const box = await loc.boundingBox();
  if (box) await glide(page, box.x + box.width / 2, box.y + box.height / 2);
  await loc.click();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
    locale: "id-ID",
  });
  await context.addInitScript(CURSOR_JS);
  const page = await context.newPage();
  page.setDefaultTimeout(12000);

  await step(page, "home", async () => {
    await page.goto(BASE, { waitUntil: "domcontentloaded" });
    await wait(page, 4500);
    await glide(page, 640, 300);
    await page.mouse.wheel(0, 500);
    await wait(page, 2500);
  });

  await step(page, "kelas", async () => {
    await page.goto(`${BASE}/id/kelas`, { waitUntil: "domcontentloaded" });
    await wait(page, 3500);
    await page.mouse.wheel(0, 420);
    await wait(page, 2500);
  });

  await step(page, "resources", async () => {
    await page.goto(`${BASE}/id/resources`, { waitUntil: "domcontentloaded" });
    await wait(page, 3500);
    await glide(page, 640, 420);
    await page.mouse.wheel(0, 380);
    await wait(page, 2000);
    const firstCard = page.locator("article, [data-testid=resource-card]").first();
    if (await firstCard.count()) {
      const box = await firstCard.boundingBox();
      if (box) await glide(page, box.x + box.width / 2, box.y + 40);
    }
    await wait(page, 1500);
  });

  await step(page, "doa", async () => {
    await page.goto(`${BASE}/id/doa`, { waitUntil: "domcontentloaded" });
    await wait(page, 3000);
    await page.mouse.wheel(0, 380);
    await wait(page, 2000);
  });

  await step(page, "english", async () => {
    await page.goto(`${BASE}/en`, { waitUntil: "domcontentloaded" });
    await wait(page, 3000);
  });

  await step(page, "kontak", async () => {
    await page.goto(`${BASE}/id/kontak`, { waitUntil: "domcontentloaded" });
    await wait(page, 2500);
    await page.mouse.wheel(0, 300);
    await wait(page, 1800);
  });

  await step(page, "admin login", async () => {
    await page.goto(`${BASE}/admin/login`, { waitUntil: "domcontentloaded" });
    await wait(page, 1800);
    await page.getByLabel(/email/i).fill("admin@tpq.id");
    await wait(page, 500);
    await page.getByLabel(/password|kata sandi/i).fill("admin123");
    await wait(page, 600);
    await page.getByRole("button", { name: /masuk|login/i }).click();
    await page.waitForURL(/\/admin(?!\/login)/, { timeout: 25000 });
    await wait(page, 2500);
  });

  await step(page, "admin dashboard", async () => {
    await page.mouse.wheel(0, 300);
    await wait(page, 3000);
    await page.mouse.wheel(0, -300);
    await wait(page, 1200);
  });

  await step(page, "admin konten", async () => {
    await clickLink(page, /Konten/);
    await wait(page, 3000);
    await page.mouse.wheel(0, 320);
    await wait(page, 2200);
  });

  await step(page, "admin materi", async () => {
    const materi = page.getByRole("link", { name: /Materi/ }).first();
    if (await materi.count()) {
      const box = await materi.boundingBox();
      if (box) await glide(page, box.x + box.width / 2, box.y + box.height / 2);
      await materi.click();
      await wait(page, 3000);
      await page.mouse.wheel(0, 260);
      await wait(page, 2000);
    }
  });

  await step(page, "admin inquiry", async () => {
    await page.goto(`${BASE}/admin/inquiry`, { waitUntil: "domcontentloaded" });
    await wait(page, 3000);
    await page.mouse.wheel(0, 260);
    await wait(page, 2200);
  });

  await step(page, "admin aktivitas", async () => {
    await page.goto(`${BASE}/admin/aktivitas`, { waitUntil: "domcontentloaded" });
    await wait(page, 2500);
    await page.mouse.wheel(0, 240);
    await wait(page, 2000);
  });

  await step(page, "closing", async () => {
    await page.goto(`${BASE}/id`, { waitUntil: "domcontentloaded" });
    await wait(page, 2500);
    await glide(page, 640, 240);
    await wait(page, 1500);
  });

  const video = page.video();
  await context.close();
  await browser.close();
  const tmpPath = await video.path();
  mkdirSync("docs/media", { recursive: true });
  renameSync(tmpPath, "docs/media/demo.webm");
  console.log("saved docs/media/demo.webm");
  console.log("recordings in demo-output:", readdirSync(OUT).length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
