const { chromium } = require('../../.qa-node/node_modules/playwright');
const fs = require('fs');

const sceneId = (process.env.QA_SCENE || '').trim();
const dialogId = (process.env.QA_DIALOG_ID || '').trim();
const evidenceMode = (process.env.QA_EVIDENCE || '').trim();
const autoAdvanceMs = Number(process.env.QA_AUTO_ADVANCE_MS || '0');
const stopWhen = (process.env.QA_STOP_WHEN || '').trim();

const resultSuffix = sceneId || 'unknown';
const RESULT_PATH = `G:/GSD/.qa-artifacts/qa-scene-${resultSuffix}.json`;
const SCREENSHOT_PATH = `G:/GSD/.qa-artifacts/qa-scene-${resultSuffix}.png`;

function buildUrl() {
  const url = new URL('http://127.0.0.1:4173/');
  if (sceneId) url.searchParams.set('qa_scene', sceneId);
  if (dialogId) url.searchParams.set('qa_dialog_id', dialogId);
  if (evidenceMode) url.searchParams.set('qa_evidence', evidenceMode);
  return url.toString();
}

async function isVisible(page, selector) {
  const el = page.locator(selector);
  const count = await el.count();
  if (!count) return false;
  return el.first().isVisible().catch(() => false);
}

async function advanceUi(page) {
  return page.evaluate(() => {
    const visible = selector => {
      const el = document.querySelector(selector);
      if (!el) return false;
      if (el.classList.contains('hidden')) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };

    const choiceBtn = document.querySelector('#choice-box:not(.hidden) .choice-btn:not([disabled])');
    if (choiceBtn) {
      choiceBtn.click();
      return 'choice';
    }

    const dialogueBox = document.querySelector('#dialogue-box:not(.hidden)');
    if (dialogueBox) {
      dialogueBox.click();
      dialogueBox.click();
      return 'dialogue';
    }

    const inventoryBtn = document.querySelector('#evidence-inventory:not(.hidden) .inventory-choice:not([disabled])');
    if (inventoryBtn) {
      inventoryBtn.click();
      return 'evidence';
    }

    return 'idle';
  });
}

async function readUiState(page) {
  return page.evaluate(() => {
    const visible = selector => {
      const el = document.querySelector(selector);
      if (!el) return false;
      if (el.classList.contains('hidden')) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };

    return {
      titleVisible: visible('#title-screen'),
      dialogueVisible: visible('#dialogue-box'),
      choiceVisible: visible('#choice-box'),
      evidenceVisible: visible('#evidence-inventory'),
      savePanelVisible: visible('#slot-panel'),
      choiceTexts: Array.from(document.querySelectorAll('#choice-box .choice-btn')).map(el => (el.textContent || '').trim()).filter(Boolean),
      evidenceTexts: Array.from(document.querySelectorAll('#evidence-inventory .inventory-choice-title')).map(el => (el.textContent || '').trim()).filter(Boolean),
    };
  });
}

async function run() {
  if (!sceneId) {
    throw new Error('QA_SCENE environment variable is required.');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const logs = [];

  page.on('console', msg => logs.push(`console:${msg.type()}:${msg.text()}`));
  page.on('pageerror', err => logs.push(`pageerror:${err.message}`));

  await page.goto(buildUrl(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  if (autoAdvanceMs > 0) {
    const endAt = Date.now() + autoAdvanceMs;
    while (Date.now() < endAt) {
      const uiState = await readUiState(page);
      if (stopWhen === 'evidence' && uiState.evidenceVisible) break;
      if (stopWhen === 'choice' && uiState.choiceVisible) break;
      if (stopWhen === 'dialogue' && uiState.dialogueVisible) break;
      await advanceUi(page);
      await page.waitForTimeout(80);
    }
  }

  const result = await page.evaluate(() => {
    const visible = selector => {
      const el = document.querySelector(selector);
      if (!el) return false;
      if (el.classList.contains('hidden')) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    };

    const getState = () => {
      if (typeof State === 'undefined' || typeof State.dump !== 'function') return null;
      return State.dump();
    };

    return {
      state: getState(),
      titleVisible: visible('#title-screen'),
      dialogueVisible: visible('#dialogue-box'),
      choiceVisible: visible('#choice-box'),
      evidenceVisible: visible('#evidence-inventory'),
      savePanelVisible: visible('#slot-panel'),
      hudTitle: (document.getElementById('hud-scene-title')?.textContent || '').trim(),
      chapterCardClass: document.getElementById('chapter-card')?.className || '',
      dialogueText: (document.getElementById('dialogue-text')?.textContent || '').trim(),
      choiceTexts: Array.from(document.querySelectorAll('#choice-box .choice-btn')).map(el => (el.textContent || '').trim()).filter(Boolean),
      evidenceTexts: Array.from(document.querySelectorAll('#evidence-inventory .inventory-choice-title')).map(el => (el.textContent || '').trim()).filter(Boolean),
      toast: (document.getElementById('system-toast')?.textContent || '').trim(),
    };
  });

  const payload = {
    sceneId,
    dialogId: dialogId || null,
    evidenceMode: evidenceMode || null,
    autoAdvanceMs,
    url: buildUrl(),
    result,
    logs,
  };

  fs.writeFileSync(RESULT_PATH, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
