const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawn } = require('child_process');

const ROOT = 'G:/GSD';
const QA_DIR = path.join(ROOT, '.qa-node');
const OUT_DIR = path.join(ROOT, '.qa-artifacts');
const GAME_DATA_PATH = path.join(ROOT, 'game', 'data', 'game_data.js');

const QA_SCENES = String(process.env.QA_SCENES || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);
const QA_LIMIT = Number(process.env.QA_LIMIT || '0');
const QA_CONCURRENCY = Math.max(1, Number(process.env.QA_CONCURRENCY || '4'));
const QA_INCLUDE_BOOT = String(process.env.QA_INCLUDE_BOOT || '1').trim() !== '0';
const QA_INCLUDE_CHOICES = String(process.env.QA_INCLUDE_CHOICES || '1').trim() !== '0';
const QA_INCLUDE_EVIDENCE = String(process.env.QA_INCLUDE_EVIDENCE || '1').trim() !== '0';

if (process.stdout) {
  process.stdout.on('error', error => {
    if (error && error.code !== 'EPIPE') {
      throw error;
    }
  });
}

if (process.stderr) {
  process.stderr.on('error', error => {
    if (error && error.code !== 'EPIPE') {
      throw error;
    }
  });
}

function loadGameData() {
  const code = fs.readFileSync(GAME_DATA_PATH, 'utf8');
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  return ctx.window.GAME_DATA;
}

function getTargetScenes(data) {
  let scenes = Object.values(data.scenes || {}).filter(scene => scene && scene.id);
  if (QA_SCENES.length > 0) {
    const wanted = new Set(QA_SCENES);
    scenes = scenes.filter(scene => wanted.has(scene.id));
  }
  if (QA_LIMIT > 0) {
    scenes = scenes.slice(0, QA_LIMIT);
  }
  return scenes.sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function outputFileFor(type, sceneId, actionIndex, evidenceIndex) {
  if (type === 'boot') return path.join(OUT_DIR, `boot-${sceneId}.json`);
  if (type === 'choice') {
    const suffix = Number.isInteger(actionIndex) && actionIndex >= 0 ? `-${actionIndex}` : '';
    return path.join(OUT_DIR, `choice-${sceneId}${suffix}.json`);
  }
  if (type === 'evidence') return path.join(OUT_DIR, `evidence-${sceneId}-${actionIndex}-${evidenceIndex}.json`);
  throw new Error(`unknown-output-type:${type}`);
}

function runNode(scriptName, extraEnv) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [path.join(QA_DIR, scriptName)], {
      cwd: ROOT,
      env: { ...process.env, ...extraEnv },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => {
      stdout += String(chunk);
    });
    child.stderr.on('data', chunk => {
      stderr += String(chunk);
    });
    child.on('close', code => {
      resolve({ code, stdout, stderr });
    });
  });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function runBoot(sceneId) {
  const script = 'scene_boot_check.js';
  const outPath = outputFileFor('boot', sceneId);
  const startedAt = new Date().toISOString();
  const exec = await runNode(script, {
    QA_SCENE: sceneId,
    QA_OUT_PATH: outPath,
    QA_SHOT_PATH: outPath.replace(/\.json$/i, '.png'),
  });
  const json = fs.existsSync(outPath)
    ? readJson(outPath)
    : { ok: false, sceneId, error: 'missing-output', stdout: exec.stdout, stderr: exec.stderr };
  return {
    type: 'boot',
    sceneId,
    ok: !!json.ok,
    startedAt,
    finishedAt: new Date().toISOString(),
    result: json,
    code: exec.code,
    stderr: exec.stderr.trim(),
  };
}

async function discoverScene(sceneId) {
  const script = 'scene_choice_runner.js';
  const outPath = outputFileFor('choice', sceneId, -1);
  const exec = await runNode(script, {
    QA_SCENE: sceneId,
    QA_OUT_PATH: outPath,
    QA_SHOT_PATH: outPath.replace(/\.json$/i, '.png'),
  });
  const json = fs.existsSync(outPath)
    ? readJson(outPath)
    : { ok: false, sceneId, error: 'missing-output', stdout: exec.stdout, stderr: exec.stderr };
  return {
    sceneId,
    ok: !!json.ok,
    state: json.state || json.after || null,
    raw: json,
    code: exec.code,
    stderr: exec.stderr.trim(),
  };
}

async function runChoice(sceneId, actionIndex) {
  const outPath = outputFileFor('choice', sceneId, actionIndex);
  const startedAt = new Date().toISOString();
  const exec = await runNode('scene_choice_runner.js', {
    QA_SCENE: sceneId,
    QA_ACTION_INDEX: String(actionIndex),
    QA_OUT_PATH: outPath,
    QA_SHOT_PATH: outPath.replace(/\.json$/i, '.png'),
  });
  const json = fs.existsSync(outPath)
    ? readJson(outPath)
    : { ok: false, sceneId, actionIndex, error: 'missing-output', stdout: exec.stdout, stderr: exec.stderr };
  return {
    type: 'choice',
    sceneId,
    actionIndex,
    ok: !!json.ok,
    startedAt,
    finishedAt: new Date().toISOString(),
    result: json,
    code: exec.code,
    stderr: exec.stderr.trim(),
  };
}

async function runEvidence(sceneId, actionIndex, evidenceIndex) {
  const outPath = outputFileFor('evidence', sceneId, actionIndex, evidenceIndex);
  const startedAt = new Date().toISOString();
  const exec = await runNode('evidence_choice_runner.js', {
    QA_SCENE: sceneId,
    QA_ACTION_INDEX: String(actionIndex),
    QA_EVIDENCE_INDEX: String(evidenceIndex),
    QA_OUT_PATH: outPath,
    QA_SHOT_PATH: outPath.replace(/\.json$/i, '.png'),
  });
  const json = fs.existsSync(outPath)
    ? readJson(outPath)
    : { ok: false, sceneId, actionIndex, evidenceIndex, error: 'missing-output', stdout: exec.stdout, stderr: exec.stderr };
  return {
    type: 'evidence',
    sceneId,
    actionIndex,
    evidenceIndex,
    ok: !!json.ok,
    startedAt,
    finishedAt: new Date().toISOString(),
    result: json,
    code: exec.code,
    stderr: exec.stderr.trim(),
  };
}

async function runPool(items, worker, onItemDone) {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(QA_CONCURRENCY, items.length || 1) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      const result = await worker(item);
      onItemDone(result);
    }
  });
  await Promise.all(workers);
}

async function main() {
  ensureOutDir();
  const data = loadGameData();
  const scenes = getTargetScenes(data);
  const summaryPath = path.join(OUT_DIR, 'qa-fast-batch-summary.json');
  const summary = {
    startedAt: new Date().toISOString(),
    sceneCount: scenes.length,
    concurrency: QA_CONCURRENCY,
    includeBoot: QA_INCLUDE_BOOT,
    includeChoices: QA_INCLUDE_CHOICES,
    includeEvidence: QA_INCLUDE_EVIDENCE,
    boot: [],
    choices: [],
    evidence: [],
    failures: [],
  };

  const writeSummary = () => {
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  };

  writeSummary();

  const sceneIds = scenes.map(scene => scene.id);
  const bootPassed = new Set();

  if (QA_INCLUDE_BOOT) {
    await runPool(sceneIds, runBoot, result => {
      summary.boot.push(result);
      if (result.ok) {
        bootPassed.add(result.sceneId);
      } else {
        summary.failures.push({
          type: 'boot',
          sceneId: result.sceneId,
          error: result.result?.error || result.stderr || 'boot-failed',
        });
      }
      console.log(`[boot] ${result.sceneId}: ${result.ok ? 'PASS' : 'FAIL'}${result.result?.state?.kind ? ` (${result.result.state.kind})` : ''}`);
      writeSummary();
    });
  } else {
    sceneIds.forEach(sceneId => bootPassed.add(sceneId));
  }

  const discoverableScenes = sceneIds.filter(sceneId => bootPassed.has(sceneId));
  const discoveries = [];

  if (QA_INCLUDE_CHOICES || QA_INCLUDE_EVIDENCE) {
    await runPool(discoverableScenes, discoverScene, result => {
      discoveries.push(result);
      if (!result.ok) {
        summary.failures.push({
          type: 'discover',
          sceneId: result.sceneId,
          error: result.raw?.error || result.stderr || 'discover-failed',
        });
      }
      console.log(`[discover] ${result.sceneId}: ${result.ok ? 'PASS' : 'FAIL'}${result.state?.kind ? ` (${result.state.kind})` : ''}`);
      writeSummary();
    });
  }

  const choiceJobs = [];
  const evidenceJobs = [];

  for (const discovery of discoveries) {
    if (!discovery.ok || !discovery.state) continue;
    const options = Array.isArray(discovery.state.options) ? discovery.state.options : [];

    if (QA_INCLUDE_CHOICES && discovery.state.kind === 'choice') {
      options.forEach((_option, actionIndex) => {
        choiceJobs.push({ sceneId: discovery.sceneId, actionIndex });
      });
    }

    if (QA_INCLUDE_EVIDENCE && discovery.state.kind === 'evidence') {
      options.forEach((_option, evidenceIndex) => {
        evidenceJobs.push({ sceneId: discovery.sceneId, actionIndex: -1, evidenceIndex });
      });
    }
  }

  if (choiceJobs.length > 0) {
    await runPool(choiceJobs, job => runChoice(job.sceneId, job.actionIndex), result => {
      summary.choices.push(result);
      if (!result.ok) {
        summary.failures.push({
          type: 'choice',
          sceneId: result.sceneId,
          actionIndex: result.actionIndex,
          error: result.result?.error || result.stderr || 'choice-failed',
        });
      }

      if (QA_INCLUDE_EVIDENCE && result.ok && result.result?.after?.kind === 'evidence') {
        const options = Array.isArray(result.result.after.options) ? result.result.after.options : [];
        options.forEach((_option, evidenceIndex) => {
          evidenceJobs.push({
            sceneId: result.sceneId,
            actionIndex: result.actionIndex,
            evidenceIndex,
          });
        });
      }

      console.log(`[choice] ${result.sceneId}[${result.actionIndex}]: ${result.ok ? 'PASS' : 'FAIL'}`);
      writeSummary();
    });
  }

  if (QA_INCLUDE_EVIDENCE && evidenceJobs.length > 0) {
    const dedupedEvidenceJobs = Array.from(
      new Map(
        evidenceJobs.map(job => [`${job.sceneId}|${job.actionIndex}|${job.evidenceIndex}`, job])
      ).values()
    );

    await runPool(dedupedEvidenceJobs, job => runEvidence(job.sceneId, job.actionIndex, job.evidenceIndex), result => {
      summary.evidence.push(result);
      if (!result.ok) {
        summary.failures.push({
          type: 'evidence',
          sceneId: result.sceneId,
          actionIndex: result.actionIndex,
          evidenceIndex: result.evidenceIndex,
          error: result.result?.error || result.stderr || 'evidence-failed',
        });
      }
      console.log(`[evidence] ${result.sceneId}[${result.actionIndex}:${result.evidenceIndex}]: ${result.ok ? 'PASS' : 'FAIL'}`);
      writeSummary();
    });
  }

  summary.finishedAt = new Date().toISOString();
  summary.bootPassCount = summary.boot.filter(item => item.ok).length;
  summary.choicePassCount = summary.choices.filter(item => item.ok).length;
  summary.evidencePassCount = summary.evidence.filter(item => item.ok).length;
  summary.failureCount = summary.failures.length;
  writeSummary();

  console.log(JSON.stringify({
    sceneCount: summary.sceneCount,
    bootPassCount: summary.bootPassCount,
    choicePassCount: summary.choicePassCount,
    evidencePassCount: summary.evidencePassCount,
    failureCount: summary.failureCount,
    summaryPath,
  }, null, 2));

  if (summary.failureCount > 0) {
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
