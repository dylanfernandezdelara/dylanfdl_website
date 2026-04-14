import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = 'http://localhost:3000';
const artifactsDir = '/workspace/artifacts';
const videoDir = path.join(artifactsDir, 'videos');
const screenshotPath = path.join(artifactsDir, 'filters-page.png');
const reportPath = path.join(artifactsDir, 'filter-validation-report.json');

await fs.mkdir(videoDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1512, height: 982 },
  recordVideo: { dir: videoDir, size: { width: 1512, height: 982 } },
});
const page = await context.newPage();

await page.goto(`${baseUrl}/about`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1200);

const candidateLabels = ['All', 'Projects', 'Music'];
const labelVisibility = {};

for (const label of candidateLabels) {
  const exactRoleLocator = page.getByRole('button', { name: new RegExp(`^${label}$`, 'i') });
  const looseRoleLocator = page.getByRole('button', { name: new RegExp(label, 'i') });
  const tabLocator = page.getByRole('tab', { name: new RegExp(label, 'i') });
  const textLocator = page.getByText(new RegExp(`^${label}$`, 'i'));

  labelVisibility[label] = {
    exactButtons: await exactRoleLocator.count(),
    matchingButtons: await looseRoleLocator.count(),
    matchingTabs: await tabLocator.count(),
    textNodes: await textLocator.count(),
  };
}

const interactionLog = [];
for (const label of candidateLabels) {
  const clickable = page
    .getByRole('button', { name: new RegExp(`^${label}$`, 'i') })
    .or(page.getByRole('tab', { name: new RegExp(`^${label}$`, 'i') }));

  const count = await clickable.count();
  if (count > 0) {
    await clickable.first().click({ timeout: 5000 });
    interactionLog.push({ label, clicked: true });
    await page.waitForTimeout(900);
  } else {
    interactionLog.push({ label, clicked: false });
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(400);
  }
}

await page.screenshot({ path: screenshotPath, fullPage: true });

const currentUrl = page.url();

await context.close();
await browser.close();

const videoFiles = await fs.readdir(videoDir);
const videoPath = videoFiles.find((f) => f.endsWith('.webm'))
  ? path.join(videoDir, videoFiles.find((f) => f.endsWith('.webm')))
  : null;

const report = {
  baseUrl,
  currentUrl,
  labelVisibility,
  interactionLog,
  screenshotPath,
  videoPath,
};

await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report, null, 2));
