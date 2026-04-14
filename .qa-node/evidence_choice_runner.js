const fs = require('fs');
const path = require('path');
const { chromium } = require('./node_modules/playwright');

const ROOT = 'G:/GSD';
const OUT_DIR = path.join(ROOT, '.qa-artifacts');
const sceneId = String(process.env.QA_SCENE || 'ch2_well').trim();
const actionIndex = Number(process.env.QA_ACTION_INDEX || '-1');
const evidenceIndex = Number(process.env.QA_EVIDENCE_INDEX || '0');
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

function stateSignature(state) {
  return `${state.kind}|${state.currentSceneId}|${state.dialogueIndex}|${(state.options || []).join(' || ')}|${state.dialogueText}`;
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

async function speedUpUi(page) {
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important;animation-delay:0s!important;}';
    document.head.appendChild(style);
    if (window.Config?.TYPING) window.Config.TYPING.DEFAULT_SPEED = 1;
    if (window.UIManager?.showChapterCard) {
      window.UIManager.showChapterCard = (_chapter, _title, onDone) => {
        setTimeout(() => onDone && onDone(), 20);
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

async function advanceUntilInteractive(page, maxSteps = 220) {
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
  return { ok: false, error: 'interaction-timeout', state: await readUiState(page) };
}

async function clickChoiceByIndex(page, index) {
  return page.evaluate(choiceIndex => {
    const choices = Array.from(document.querySelectorAll('#choice-box .choice-btn'));
    const target = choices[choiceIndex];
    if (!target) return null;
    const text = (target.textContent || '').trim();
    target.click();
    return text;
  }, index);
}

async function submitEvidenceByIndex(page, index) {
  return page.evaluate(evidenceIdx => {
    const items = Array.from(document.querySelectorAll('#evidence-inventory .inventory-list-item'));
    const target = items[evidenceIdx];
    if (!target) return null;
    const text = (target.querySelector('span:last-child')?.textContent || '').trim();
    target.click();
    document.querySelector('#evidence-inventory-submit')?.click();
    return text;
  }, index);
}

async function main() {
  ensureOutDir();
  const outPath = path.join(OUT_DIR, `evidence-${sceneId}-${actionIndex}-${evidenceIndex}.json`);
  const shotPath = path.join(OUT_DIR, `evidence-${sceneId}-${actionIndex}-${evidenceIndex}.png`);

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
    result = { ok: false, sceneId, actionIndex, evidenceIndex, phase: 'boot', error: initial.error, state: initial.state, logs };
  } else {
    let state = initial.state;
    let pickedChoiceText = null;

    if (actionIndex >= 0) {
      if (state.kind !== 'choice') {
        result = { ok: false, sceneId, actionIndex, evidenceIndex, phase: 'pre-choice', error: 'choice-not-visible', state, logs };
      } else {
        pickedChoiceText = await clickChoiceByIndex(page, actionIndex);
        if (!pickedChoiceText) {
          result = { ok: false, sceneId, actionIndex, evidenceIndex, phase: 'pre-choice', error: 'choice-index-not-found', state, logs };
        } else {
          await page.waitForTimeout(30);
          const postChoice = await advanceUntilInteractive(page);
          if (!postChoice.ok) {
            result = { ok: false, sceneId, actionIndex, evidenceIndex, phase: 'post-choice', error: postChoice.error, state: postChoice.state, logs };
          } else {
            state = postChoice.state;
          }
        }
      }
    }

    if (!result) {
      if (state.kind !== 'evidence') {
        result = { ok: false, sceneId, actionIndex, evidenceIndex, pickedChoiceText, phase: 'pre-evidence', error: 'evidence-not-visible', state, logs };
      } else {
        const before = state;
        const beforeSig = stateSignature(before);
        const pickedEvidenceText = await submitEvidenceByIndex(page, evidenceIndex);
        if (!pickedEvidenceText) {
          result = { ok: false, sceneId, actionIndex, evidenceIndex, pickedChoiceText, phase: 'submit', error: 'evidence-index-not-found', state, logs };
        } else {
          await page.waitForTimeout(30);
          const after = await advanceUntilInteractive(page);
          if (!after.ok) {
            result = {
              ok: false,
              sceneId,
              actionIndex,
              evidenceIndex,
              pickedChoiceText,
              pickedEvidenceText,
              phase: 'advance',
              error: after.error,
              before,
              after: after.state,
              logs,
            };
          } else {
            result = {
              ok: stateSignature(after.state) !== beforeSig,
              sceneId,
              actionIndex,
              evidenceIndex,
              pickedChoiceText,
              pickedEvidenceText,
              phase: 'advance',
              error: stateSignature(after.state) !== beforeSig ? null : 'same-state-after-submit',
              before,
              after: after.state,
              logs,
            };
          }
        }
      }
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log(JSON.stringify({
    ok: result.ok,
    sceneId,
    actionIndex,
    evidenceIndex,
    pickedChoiceText: result.pickedChoiceText || null,
    pickedEvidenceText: result.pickedEvidenceText || null,
    phase: result.phase,
    error: result.error || null,
    afterKind: result.after?.kind || result.state?.kind || null,
    afterOptions: result.after?.options || result.state?.options || [],
  }, null, 2));

  await browser.close();
  if (!result.ok) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
