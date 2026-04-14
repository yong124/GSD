const fs = require('fs');
const path = require('path');
const { chromium } = require('./node_modules/playwright');

const ROOT = 'G:/GSD';
const OUT_DIR = path.join(ROOT, '.qa-artifacts');
const DEFAULT_SCENE_ID = 'ch1_court';
const sceneId = String(process.env.QA_SCENE || DEFAULT_SCENE_ID).trim();

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
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

    const choiceVisible = visible('#choice-box');
    const evidenceVisible = visible('#evidence-inventory');
    const titleVisible = visible('#title-screen');
    const dialogueVisible = visible('#dialogue-box');

    return {
      ready: !!window.GAME_DATA,
      currentSceneId: window.State?.currentSceneId || null,
      dialogueIndex: Number(window.State?.dialogueIndex || 0),
      kind: titleVisible ? 'title' : evidenceVisible ? 'evidence' : choiceVisible ? 'choice' : dialogueVisible ? 'dialogue' : 'idle',
      dialogueText: (document.querySelector('#dialogue-text')?.textContent || '').trim(),
      options: choiceVisible
        ? Array.from(document.querySelectorAll('#choice-box .choice-btn')).map(el => (el.textContent || '').trim()).filter(Boolean)
        : evidenceVisible
          ? Array.from(document.querySelectorAll('#evidence-inventory .inventory-list-item')).map(el => (el.querySelector('span:last-child')?.textContent || '').trim()).filter(Boolean)
          : [],
    };
  });
}

async function speedUpUi(page) {
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important;animation-delay:0s!important;}';
    document.head.appendChild(style);

    if (window.Config?.TYPING) window.Config.TYPING.DEFAULT_SPEED = 1;

    if (window.UIManager?.showChapterCard) {
      window.UIManager.showChapterCard = (chapter, title, onDone) => {
        const card = document.getElementById('chapter-card');
        const num = document.getElementById('chapter-number');
        const tit = document.getElementById('chapter-title');
        if (num) num.textContent = `CHAPTER ${chapter}`;
        if (tit) tit.textContent = title;
        if (card) {
          card.classList.remove('hidden');
          card.classList.add('show');
        }
        setTimeout(() => {
          if (card) {
            card.classList.remove('show');
            card.classList.add('hidden');
          }
          if (onDone) onDone();
        }, 50);
      };
    }
  });
}

async function advanceDialogue(page) {
  await page.evaluate(() => {
    const box = document.querySelector('#dialogue-box');
    if (!box || box.classList.contains('hidden')) return;
    box.click();
    box.click();
  });
}

async function run() {
  ensureOutDir();
  const outPath = path.join(OUT_DIR, `boot-${sceneId}.json`);
  const shotPath = path.join(OUT_DIR, `boot-${sceneId}.png`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    const rawSetTimeout = window.setTimeout.bind(window);
    const rawSetInterval = window.setInterval.bind(window);
    window.setTimeout = (fn, delay = 0, ...args) => rawSetTimeout(fn, Math.min(Number(delay) || 0, 20), ...args);
    window.setInterval = (fn, delay = 0, ...args) => rawSetInterval(fn, Math.min(Number(delay) || 0, 5), ...args);
  });

  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const logs = [];
  page.on('console', msg => logs.push(`console:${msg.type()}:${msg.text()}`));
  page.on('pageerror', err => logs.push(`pageerror:${err.message}`));

  await page.goto(`http://127.0.0.1:4173/?qa_scene=${encodeURIComponent(sceneId)}&qa_evidence=all`, {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });

  await page.waitForTimeout(300);
  await speedUpUi(page);

  let result = null;
  for (let step = 0; step < 180; step += 1) {
    const state = await readUiState(page);
    if (state.kind === 'choice' || state.kind === 'evidence') {
      result = { ok: true, sceneId, step, state, logs };
      break;
    }

    if (state.kind === 'dialogue') {
      await advanceDialogue(page);
      await page.waitForTimeout(20);
      continue;
    }

    if (state.kind === 'idle') {
      await page.waitForTimeout(20);
      continue;
    }

    result = { ok: false, sceneId, step, state, logs, error: `unexpected-state:${state.kind}` };
    break;
  }

  if (!result) {
    result = {
      ok: false,
      sceneId,
      error: 'first-interaction-timeout',
      state: await readUiState(page),
      logs,
    };
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log(JSON.stringify({
    ok: result.ok,
    sceneId,
    step: result.step ?? null,
    kind: result.state?.kind || null,
    optionCount: result.state?.options?.length || 0,
    options: result.state?.options || [],
    error: result.error || null,
  }, null, 2));

  await browser.close();
  if (!result.ok) process.exitCode = 1;
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
