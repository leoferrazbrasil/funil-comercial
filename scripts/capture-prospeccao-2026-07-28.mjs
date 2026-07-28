import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const root = process.cwd();
const date = '2026-07-28';
const outDir = path.join(root, 'prospeccao', date);
const jsonPath = path.join(outDir, 'qualification-capture.json');

const rows = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

async function screenshot(page, url, file, viewport) {
  try {
    const existing = await fs.stat(file);
    if (existing.size > 1000) return 'skipped';
  } catch {}
  await page.setViewport(viewport);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 18000 });
  } catch {
    await page.goto(url, { waitUntil: 'load', timeout: 12000 }).catch(() => {});
  }
  await new Promise((resolve) => setTimeout(resolve, 600));
  await fs.mkdir(path.dirname(file), { recursive: true });
  await page.screenshot({ path: file, fullPage: false });
  return 'captured';
}

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setUserAgent(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36',
);

const failures = [];
for (const row of rows) {
  const slug = row['slug sugerido'];
  const desktop = row['print site atual desktop'];
  const mobile = row['print site atual mobile'];
  const maps = row['print Maps'];
  try {
    await screenshot(page, row['site atual'], desktop, { width: 1366, height: 900, deviceScaleFactor: 1 });
  } catch (error) {
    failures.push({ slug, kind: 'desktop', message: error.message });
  }
  try {
    await screenshot(page, row['site atual'], mobile, {
      width: 390,
      height: 844,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
  } catch (error) {
    failures.push({ slug, kind: 'mobile', message: error.message });
  }
  try {
    await screenshot(page, row['link Maps'], maps, { width: 1366, height: 900, deviceScaleFactor: 1 });
  } catch (error) {
    failures.push({ slug, kind: 'maps', message: error.message });
  }
  console.log(`${slug}: screenshots attempted`);
}

await browser.close();
await fs.writeFile(path.join(outDir, 'screenshot-failures.json'), JSON.stringify(failures, null, 2), 'utf8');
console.log(JSON.stringify({ rows: rows.length, failures: failures.length }, null, 2));
