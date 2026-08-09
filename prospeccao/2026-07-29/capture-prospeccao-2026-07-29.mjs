import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const outDir = path.dirname(__filename);
const jsonPath = path.join(outDir, "qualification-capture.json");

async function screenshot(page, url, file, viewport) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  try {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(1800);
    await page.screenshot({ path: file, fullPage: false });
    return "captured";
  } catch (error) {
    return `failed: ${error.message}`;
  }
}

const rows = JSON.parse(await fs.readFile(jsonPath, "utf8"));
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const row of rows) {
  const page = await browser.newPage({
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  });
  const desktop = await screenshot(page, row["site atual"], row["print site atual desktop"], {
    width: 1366,
    height: 900,
  });
  const mobile = await screenshot(page, row["site atual"], row["print site atual mobile"], {
    width: 390,
    height: 844,
  });
  const maps = await screenshot(page, row["link Maps"], row["print Maps"], {
    width: 1366,
    height: 900,
  });
  await page.close();

  const result = { slug: row["slug sugerido"], desktop, mobile, maps };
  if ([desktop, mobile, maps].some((value) => value !== "captured")) failures.push(result);
  console.log(JSON.stringify(result));
}

await browser.close();
await fs.writeFile(path.join(outDir, "screenshot-failures.json"), JSON.stringify(failures, null, 2), "utf8");
console.log(JSON.stringify({ failures: failures.length, totalExpected: rows.length * 3 }, null, 2));
