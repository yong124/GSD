const { chromium } = require('../../.qa-node/node_modules/playwright');
const fs = require('fs');

const TRACE_PATH = 'G:/GSD/.qa-artifacts/.playtest-progress.json';
const RESULT_PATH = 'G:/GSD/.qa-artifacts/qa-full-run.json';
const SCREENSHOT_PATH = 'G:/GSD/.qa-artifacts/qa-final.png';

async function isVisible(page, selector) {
  const el = page.locator(selector);
  return el.count().then(async count => {
    if (!count) return false;
    return el.first().isVisible().catch(() => false);
  });
}

async function clickIfVisible(page, selector) {
  if (await isVisible(page, selector)) {
    await page.locator(selector).first().click();
    return true;
  }
  return false;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    const rawSetTimeout = window.setTimeout.bind(window);
    const rawSetInterval = window.setInterval.bind(window);

    window.setTimeout = (fn, delay = 0, ...args) => rawSetTimeout(fn, Math.min(Number(delay) || 0, 20), ...args);
    window.setInterval = (fn, delay = 0, ...args) => rawSetInterval(fn, Math.min(Number(delay) || 0, 5), ...args);
  });
  const page = await context.newPage();
  page.setDefaultTimeout(2500);
  const logs = [];
  const trace = [];

  page.on('console', msg => logs.push(`console:${msg.type()}:${msg.text()}`));
  page.on('pageerror', err => logs.push(`pageerror:${err.message}`));

  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = `
      *,
      *::before,
      *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
      }
    `;
    document.head.appendChild(style);

    if (window.Config?.TYPING) {
      window.Config.TYPING.DEFAULT_SPEED = 1;
    }

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
        }, 120);
      };
    }
  });
  await page.click('#new-game-btn');

  const startedAt = Date.now();
  let everLeftTitle = false;
  let endedBackOnTitle = false;

  for (let step = 0; step < 900; step++) {
    fs.writeFileSync(TRACE_PATH, JSON.stringify({
      step,
      traceCount: trace.length,
      lastTrace: trace.slice(-20),
      logs: logs.slice(-20)
    }, null, 2));
    const state = await page.evaluate(() => {
      const isVisible = selector => {
        const el = document.querySelector(selector);
        if (!el) return false;
        if (el.classList.contains('hidden')) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      };

      const titleVisible = isVisible('#title-screen');
      const slotVisible = isVisible('#slot-panel');
      const memoVisible = isVisible('#memo-panel');
      const chapterVisible = isVisible('#chapter-card.show');
      const choiceBtn = document.querySelector('#choice-box:not(.hidden) .choice-btn:not([disabled])');
      const dialogueBox = document.querySelector('#dialogue-box:not(.hidden)');
      const speaker = (document.querySelector('#speaker')?.textContent || '').trim();
      const text = (document.querySelector('#dialogue-text')?.textContent || '').trim();

      if (slotVisible) {
        document.getElementById('slot-cancel')?.click();
        return { titleVisible, action: 'close-slot' };
      }

      if (memoVisible) {
        document.getElementById('memo-close')?.click();
        return { titleVisible, action: 'close-memo' };
      }

      if (choiceBtn) {
        const choiceText = (choiceBtn.textContent || '').trim();
        choiceBtn.click();
        return { titleVisible, action: 'pick-choice', text: choiceText };
      }

      if (dialogueBox) {
        dialogueBox.click();
        dialogueBox.click();
        return { titleVisible, action: 'advance-dialogue', speaker, text: text.slice(0, 60) };
      }

      if (chapterVisible) {
        return { titleVisible, action: 'wait-chapter-card' };
      }

      return { titleVisible, action: 'idle-wait' };
    });

    if (!state.titleVisible) everLeftTitle = true;
    if (everLeftTitle && state.titleVisible) {
      endedBackOnTitle = true;
      break;
    }

    trace.push({ step, action: state.action, ...(state.speaker ? { speaker: state.speaker } : {}), ...(state.text ? { text: state.text } : {}) });
    await page.waitForTimeout(state.action === 'idle-wait' ? 20 : 10);
  }

  const result = {
    endedBackOnTitle,
    elapsedMs: Date.now() - startedAt,
    traceCount: trace.length,
    lastTrace: trace.slice(-15),
    logs,
  };

  fs.writeFileSync(RESULT_PATH, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  await browser.close();
  if (fs.existsSync(TRACE_PATH)) fs.unlinkSync(TRACE_PATH);

  if (!endedBackOnTitle) {
    process.exitCode = 1;
  }
}

run().catch(err => {
  console.error(err);
  if (fs.existsSync(TRACE_PATH)) fs.unlinkSync(TRACE_PATH);
  process.exitCode = 1;
});
