const { chromium } = require('../../.qa-node/node_modules/playwright');
const fs = require('fs');

const RESULT_PATH = 'G:/GSD/.qa-artifacts/qa-save-flow.json';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const logs = [];

  page.on('console', msg => logs.push(`console:${msg.type()}:${msg.text()}`));
  page.on('pageerror', err => logs.push(`pageerror:${err.message}`));

  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });

  // Early save should be blocked before the first scene actually starts.
  await page.click('#new-game-btn');
  await page.waitForTimeout(600);
  await page.click('#save-btn');
  await page.waitForTimeout(250);

  const earlySave = {
    panelVisible: await page.locator('#slot-panel').isVisible(),
    slot1: await page.evaluate(() => localStorage.getItem('gyeongseong_save_1')),
    toast: await page.locator('#system-toast').textContent(),
  };

  await page.reload({ waitUntil: 'networkidle' });

  // Normal save/load after the first scene is live.
  await page.click('#new-game-btn');
  await page.waitForTimeout(3600);
  await page.click('#save-btn');
  await page.waitForTimeout(250);
  await page.locator('#slot-list .slot-btn').nth(0).click();
  await page.waitForTimeout(250);

  const savedSlot = await page.evaluate(() => localStorage.getItem('gyeongseong_save_1'));

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  await page.click('#continue-btn');
  await page.waitForTimeout(250);
  await page.locator('#slot-list .slot-btn').nth(0).click();
  await page.waitForTimeout(1400);

  const loadResult = {
    titleVisible: await page.locator('#title-screen').isVisible(),
    dialogueVisible: await page.locator('#dialogue-box').isVisible(),
    toast: await page.locator('#system-toast').textContent(),
  };

  const result = {
    earlySave,
    savedSlot,
    loadResult,
    logs,
  };

  fs.writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
