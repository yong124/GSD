const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('./node_modules/playwright');

const ROOT = 'G:/GSD';
const GAME_DATA_PATH = path.join(ROOT, 'game', 'data', 'game_data.js');
const OUT_DIR = path.join(ROOT, '.qa-artifacts');
const OUT_PATH = String(process.env.QA_OUT_PATH || path.join(OUT_DIR, 'qa-choice-coverage.json')).trim();
const QA_SCENES = String(process.env.QA_SCENES || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const QA_LIMIT = Number(process.env.QA_LIMIT || '0');
const QA_PATH_DEPTH = Number(process.env.QA_PATH_DEPTH || '5');
const QA_INCLUDE_EVIDENCE = String(process.env.QA_INCLUDE_EVIDENCE || '1').trim() !== '0';
const QA_STRICT_EVIDENCE = String(process.env.QA_STRICT_EVIDENCE || '0').trim() === '1';

function loadGameData() {
  const code = fs.readFileSync(GAME_DATA_PATH, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.window.GAME_DATA;
}

function getChoiceScenes(data) {
  let scenes = Object.values(data.scenes || {}).filter(
    scene => Array.isArray(scene.choices) && scene.choices.length > 0
  );
  if (QA_SCENES.length > 0) {
    const wanted = new Set(QA_SCENES);
    scenes = scenes.filter(scene => wanted.has(scene.id));
  }
  if (QA_LIMIT > 0) {
    scenes = scenes.slice(0, QA_LIMIT);
  }
  return scenes;
}

function stateSignature(state) {
  const options = (state.options || []).join(' || ');
  return `${state.kind}|${state.currentSceneId}|${state.dialogueIndex}|${options}`;
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

    const choiceTexts = Array.from(document.querySelectorAll('#choice-box .choice-btn'))
      .map(el => (el.textContent || '').trim())
      .filter(Boolean);

    const evidenceTexts = Array.from(document.querySelectorAll('#evidence-inventory .inventory-list-item'))
      .map(el => (el.querySelector('span:last-child')?.textContent || '').trim())
      .filter(Boolean);

    return {
      titleVisible,
      dialogueVisible,
      choiceVisible,
      evidenceVisible,
      currentSceneId: window.State?.currentSceneId || null,
      dialogueIndex: Number(window.State?.dialogueIndex || 0),
      dialogueText: (document.querySelector('#dialogue-text')?.textContent || '').trim(),
      options: evidenceVisible ? evidenceTexts : (choiceVisible ? choiceTexts : []),
      kind: titleVisible ? 'title' : evidenceVisible ? 'evidence' : choiceVisible ? 'choice' : dialogueVisible ? 'dialogue' : 'idle',
    };
  });
}

async function clickDialogue(page) {
  await page.evaluate(() => {
    const box = document.querySelector('#dialogue-box');
    if (!box || box.classList.contains('hidden')) return;
    box.click();
    box.click();
  });
}

async function advanceUntilInteractive(page, maxSteps = 320) {
  let sameCount = 0;
  let prevMarker = '';

  for (let step = 0; step < maxSteps; step += 1) {
    const state = await readUiState(page);
    const marker = `${state.kind}|${state.currentSceneId}|${state.dialogueIndex}|${state.dialogueText}|${(state.options || []).join('||')}`;

    if (state.kind === 'choice' || state.kind === 'evidence' || state.kind === 'title') {
      return { ok: true, state };
    }

    if (state.kind === 'dialogue') {
      await clickDialogue(page);
      await page.waitForTimeout(15);
      sameCount = 0;
      prevMarker = marker;
      continue;
    }

    sameCount = marker === prevMarker ? sameCount + 1 : 0;
    prevMarker = marker;

    if (sameCount >= 30) {
      return { ok: false, error: 'idle-loop', state };
    }

    await page.waitForTimeout(20);
  }

  return { ok: false, error: 'advance-timeout', state: await readUiState(page) };
}

async function clickAction(page, state, actionText) {
  if (state.kind === 'choice') {
    return page.evaluate(target => {
      const found = Array.from(document.querySelectorAll('#choice-box .choice-btn'))
        .find(btn => ((btn.textContent || '').trim()) === target);
      if (!found) return false;
      found.click();
      return true;
    }, actionText);
  }

  if (state.kind === 'evidence') {
    return page.evaluate(target => {
      const items = Array.from(document.querySelectorAll('#evidence-inventory .inventory-list-item'));
      const found = items.find(item => (((item.querySelector('span:last-child')?.textContent) || '').trim()) === target);
      if (!found) return false;
      found.click();
      document.querySelector('#evidence-inventory-submit')?.click();
      return true;
    }, actionText);
  }

  return false;
}

async function bootScene(page, sceneId) {
  const url = `http://127.0.0.1:4173/?qa_scene=${encodeURIComponent(sceneId)}&qa_evidence=all`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(300);
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

  return advanceUntilInteractive(page);
}

async function runPath(page, sceneId, pathChoices) {
  const boot = await bootScene(page, sceneId);
  if (!boot.ok) return boot;

  let state = boot.state;
  const traversed = [];

  for (const actionText of pathChoices) {
    if (state.kind !== 'choice' && state.kind !== 'evidence') {
      return { ok: false, error: 'path-hit-noninteractive', state, traversed };
    }

    if (!(state.options || []).includes(actionText)) {
      return {
        ok: false,
        error: 'action-not-found',
        actionText,
        available: state.options || [],
        state,
        traversed,
      };
    }

    const beforeSig = stateSignature(state);
    const clicked = await clickAction(page, state, actionText);
    if (!clicked) return { ok: false, error: 'click-failed', actionText, state, traversed };

    await page.waitForTimeout(30);
    const advanced = await advanceUntilInteractive(page);
    if (!advanced.ok) {
      return { ok: false, error: advanced.error, actionText, state: advanced.state, traversed };
    }

    state = advanced.state;
    traversed.push({
      actionText,
      afterKind: state.kind,
      afterSceneId: state.currentSceneId,
      afterOptions: state.options || [],
    });

    if (beforeSig === stateSignature(state)) {
      if (nodeStateAllowsSoftEvidence(state)) {
        return {
          ok: true,
          warning: 'same-state-after-click',
          noProgress: true,
          actionText,
          state,
          traversed,
        };
      }
      return { ok: false, error: 'same-state-after-click', actionText, state, traversed };
    }
  }

  return { ok: true, state, traversed };
}

function nodeStateAllowsSoftEvidence(state) {
  return state?.kind === 'evidence' && !QA_STRICT_EVIDENCE;
}

function screenshotPath(sceneId, index) {
  return path.join(OUT_DIR, `fail-${sceneId}-${index}.png`);
}

function writePartial(summary) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(summary, null, 2));
}

async function auditScene(page, scene) {
  const sceneResult = {
    sceneId: scene.id,
    title: scene.title,
    root: null,
    testedActions: [],
    failures: [],
  };

  const root = await runPath(page, scene.id, []);
  if (!root.ok) {
    sceneResult.root = { ok: false, error: root.error, state: root.state || null };
    sceneResult.failures.push({
      path: [],
      actionText: null,
      error: root.error,
      state: root.state || null,
    });
    return sceneResult;
  }

  sceneResult.root = {
    ok: true,
    kind: root.state.kind,
    currentSceneId: root.state.currentSceneId,
    options: root.state.options || [],
  };

  const queue = [{ path: [], state: root.state }];
  const seen = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    const nodeState = current.state;

    if (nodeState.kind !== 'choice' && nodeState.kind !== 'evidence') continue;

    const nodeKey = `${current.path.join(' > ')} => ${stateSignature(nodeState)}`;
    if (seen.has(nodeKey)) continue;
    seen.add(nodeKey);

    for (const actionText of nodeState.options || []) {
      const nextPath = [...current.path, actionText];
      const result = await runPath(page, scene.id, nextPath);
      const record = {
        path: current.path,
        actionText,
        ok: result.ok,
        endKind: result.state?.kind || null,
        endSceneId: result.state?.currentSceneId || null,
        endOptions: result.state?.options || [],
        error: result.ok ? null : result.error,
        warning: result.warning || null,
        noProgress: !!result.noProgress,
      };
      sceneResult.testedActions.push(record);

      if (!result.ok) {
        sceneResult.failures.push({
          path: current.path,
          actionText,
          error: result.error,
          state: result.state || null,
        });
        continue;
      }

      const canQueueChoice = result.state.kind === 'choice';
      const canQueueEvidence = QA_INCLUDE_EVIDENCE && result.state.kind === 'evidence' && !result.noProgress;
      if ((canQueueChoice || canQueueEvidence) && nextPath.length < QA_PATH_DEPTH) {
        queue.push({ path: nextPath, state: result.state });
      }
    }
  }

  return sceneResult;
}

async function main() {
  const data = loadGameData();
  const scenes = getChoiceScenes(data);
  const startedAt = new Date().toISOString();

  const summary = {
    startedAt,
    sceneCount: scenes.length,
    completedSceneCount: 0,
    actionCount: 0,
    failureCount: 0,
    scenes: [],
  };

  writePartial(summary);

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

  for (const scene of scenes) {
    console.log(`[start] ${scene.id}`);
    const sceneResult = await auditScene(page, scene);
    summary.scenes.push(sceneResult);
    summary.completedSceneCount += 1;
    summary.actionCount += sceneResult.testedActions.length;
    summary.failureCount += sceneResult.failures.length;

    const startFailureIndex = summary.failureCount - sceneResult.failures.length + 1;
    for (let i = 0; i < sceneResult.failures.length; i += 1) {
      const shot = screenshotPath(scene.id, startFailureIndex + i);
      await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
      sceneResult.failures[i].screenshot = shot;
    }

    writePartial(summary);
    console.log(`[scene ${summary.completedSceneCount}/${summary.sceneCount}] ${scene.id}: actions=${sceneResult.testedActions.length}, failures=${sceneResult.failures.length}`);
  }

  summary.finishedAt = new Date().toISOString();
  writePartial(summary);
  await browser.close();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
