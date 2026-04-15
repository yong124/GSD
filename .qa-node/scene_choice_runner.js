const fs = require('fs');
const path = require('path');
const { chromium } = require('./node_modules/playwright');

const ROOT = 'G:/GSD';
const OUT_DIR = path.join(ROOT, '.qa-artifacts');
const sceneId = String(process.env.QA_SCENE || 'ch1_court').trim();
const actionText = String(process.env.QA_ACTION || '').trim();
const actionIndex = Number(process.env.QA_ACTION_INDEX || '-1');
const qaFacts = String(process.env.QA_FACTS || '').trim();
const qaGauges = String(process.env.QA_GAUGES || '').trim();
const qaTrusts = String(process.env.QA_TRUSTS || '').trim();
const qaChoices = String(process.env.QA_CHOICES || '').trim();

function buildQaUrl() {
  const url = new URL('http://127.0.0.1:4173/');
  url.searchParams.set('qa_scene', sceneId);
  url.searchParams.set('qa_evidence', 'all');
  if (qaFacts) url.searchParams.set('qa_facts', qaFacts);
  if (qaGauges) url.searchParams.set('qa_gauges', qaGauges);
  if (qaTrusts) url.searchParams.set('qa_trusts', qaTrusts);
  if (qaChoices) url.searchParams.set('qa_choices', qaChoices);
  return url.toString();
}

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

function stateSignature(state) {
  return `${state.kind}|${state.currentSceneId}|${state.dialogueIndex}|${(state.options || []).join(' || ')}|${state.dialogueText}`;
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

async function advanceUntilInteractive(page, maxSteps = 180) {
  for (let step = 0; step < maxSteps; step += 1) {
    const state = await readUiState(page);
    if (state.kind === 'choice' || state.kind === 'evidence' || state.kind === 'title') {
      return { ok: true, step, state };
    }
    if (state.kind === 'dialogue') {
      await advanceDialogue(page);
      await page.waitForTimeout(20);
      continue;
    }
    await page.waitForTimeout(20);
  }
  return { ok: false, error: 'first-interaction-timeout', state: await readUiState(page) };
}

async function clickAction(page, state, target) {
  if (state.kind === 'choice') {
    return page.evaluate(action => {
      const found = Array.from(document.querySelectorAll('#choice-box .choice-btn'))
        .find(btn => ((btn.textContent || '').trim()) === action);
      if (!found) return false;
      found.click();
      return true;
    }, target);
  }

  if (state.kind === 'evidence') {
    return page.evaluate(action => {
      const found = Array.from(document.querySelectorAll('#evidence-inventory .inventory-list-item'))
        .find(item => (((item.querySelector('span:last-child')?.textContent) || '').trim()) === action);
      if (!found) return false;
      found.click();
      document.querySelector('#evidence-inventory-submit')?.click();
      return true;
    }, target);
  }

  return false;
}

async function main() {
  ensureOutDir();
  const suffix = actionIndex >= 0 ? `-${actionIndex}` : '';
  const outPath = String(process.env.QA_OUT_PATH || path.join(OUT_DIR, `choice-${sceneId}${suffix}.json`)).trim();
  const shotPath = String(process.env.QA_SHOT_PATH || path.join(OUT_DIR, `choice-${sceneId}${suffix}.png`)).trim();

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

  await page.goto(buildQaUrl(), {
    waitUntil: 'domcontentloaded',
    timeout: 15000,
  });
  await page.waitForTimeout(300);
  await speedUpUi(page);

  const initial = await advanceUntilInteractive(page);
  let result;

  if (!initial.ok) {
    result = { ok: false, sceneId, actionText, phase: 'boot', error: initial.error, state: initial.state, logs };
  } else if (!actionText && actionIndex < 0) {
    result = { ok: true, sceneId, phase: 'discover', state: initial.state, logs };
  } else {
    const resolvedActionText = actionText || initial.state.options?.[actionIndex] || '';
    if (!resolvedActionText) {
      result = {
        ok: false,
        sceneId,
        actionText,
        actionIndex,
        phase: 'discover',
        error: 'action-not-found',
        state: initial.state,
        logs,
      };
    } else if (!(initial.state.options || []).includes(resolvedActionText)) {
      result = {
        ok: false,
        sceneId,
        actionText: resolvedActionText,
        actionIndex,
        phase: 'discover',
        error: 'action-not-found',
        state: initial.state,
        logs,
      };
    } else {
      const before = initial.state;
      const beforeSig = stateSignature(before);
      const clicked = await clickAction(page, before, resolvedActionText);
      if (!clicked) {
        result = { ok: false, sceneId, actionText: resolvedActionText, actionIndex, phase: 'click', error: 'click-failed', before, logs };
      } else {
        await page.waitForTimeout(30);
        const after = await advanceUntilInteractive(page);
        if (!after.ok) {
          result = { ok: false, sceneId, actionText: resolvedActionText, actionIndex, phase: 'advance', error: after.error, before, after: after.state, logs };
        } else {
          result = {
            ok: stateSignature(after.state) !== beforeSig,
            sceneId,
            actionText: resolvedActionText,
            actionIndex,
            phase: 'advance',
            before,
            after: after.state,
            error: stateSignature(after.state) !== beforeSig ? null : 'same-state-after-click',
            logs,
          };
        }
      }
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log(JSON.stringify({
    ok: result.ok,
    sceneId,
    actionText,
    phase: result.phase,
    error: result.error || null,
    beforeKind: result.before?.kind || result.state?.kind || null,
    afterKind: result.after?.kind || null,
    afterOptions: result.after?.options || result.state?.options || [],
  }, null, 2));

  await browser.close();
  if (!result.ok) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
