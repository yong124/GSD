const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const VALIDATOR = path.join(ROOT, 'content', 'tools', 'validate_game_data.py');

function loadGameData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'game', 'data', 'game_data.js'), 'utf8'), context);
  return JSON.parse(JSON.stringify(context.window.GAME_DATA));
}

function runValidator(filePath) {
  const result = spawnSync('py', [VALIDATOR, filePath], { cwd: ROOT, encoding: 'utf8' });
  return { status: result.status, output: `${result.stdout || ''}${result.stderr || ''}` };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsd-question-answer-validator-'));
  try {
    const noneData = loadGameData();
    noneData.question_answers[0].next_type = 'None';
    const nonePath = path.join(tempDir, 'none.json');
    fs.writeFileSync(nonePath, JSON.stringify(noneData));
    const none = runValidator(nonePath);
    assert(none.status === 1 && none.output.includes('[QuestionAnswer.next_type]') && none.output.includes('None'), 'validator accepted NextType None');

    const badDialogData = loadGameData();
    badDialogData.question_answers[0].next_type = 'Dialog';
    badDialogData.question_answers[0].next_id = 'missing_dialog_target';
    const badDialogPath = path.join(tempDir, 'bad-dialog.json');
    fs.writeFileSync(badDialogPath, JSON.stringify(badDialogData));
    const badDialog = runValidator(badDialogPath);
    assert(badDialog.status === 1 && badDialog.output.includes('missing EvidenceDialogID'), 'validator accepted missing Dialog target');

    console.log(JSON.stringify({
      ok: true,
      none: { status: none.status, matched: '[QuestionAnswer.next_type]' },
      badDialog: { status: badDialog.status, matched: 'missing EvidenceDialogID' },
    }, null, 2));
  } finally {
    fs.rmSync(tempDir, { recursive: true });
  }
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exitCode = 1;
}
