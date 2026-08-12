const fs = require('fs');
const vm = require('vm');
const { chromium } = require('./node_modules/playwright');

const BASE_URL = process.env.EDITOR_QA_URL || 'http://127.0.0.1:8000/EditorNode/index.html?qa=1';

function loadGameData() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('game/data/game_data.js', 'utf8'), context);
  return JSON.parse(JSON.stringify(context.window.GAME_DATA));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForFunction(() => !!window.EditorNodeQA);
    const result = await page.evaluate(data => {
      const clone = value => structuredClone(value);
      const dialogAnswer = data.question_answers.find(answer => answer.question_id === 'QCallPattern');
      dialogAnswer.next_type = 'Dialog';
      dialogAnswer.next_id = 'dlg_songsoon_open';
      const evidenceDialoguesBefore = Object.fromEntries(Object.entries(data.scenes)
        .map(([sceneId, scene]) => [sceneId, clone(scene.evidence_dialogues)]));

      EditorNodeQA.setData(data);
      const exported = EditorNodeQA.buildExportData();
      const evidenceDialoguesAfter = Object.fromEntries(Object.entries(exported.scenes)
        .map(([sceneId, scene]) => [sceneId, clone(scene.evidence_dialogues)]));
      const validFindings = EditorNodeQA.collectValidation();

      const badDialogData = clone(data);
      badDialogData.scenes.qa_second_owner = {
        id: 'qa_second_owner',
        chapter: 2,
        title: 'QA owner',
        dialogues: [],
        choices: [],
        evidence: [],
        branches: [],
        forced_question_ids: ['QCallPattern'],
        question_mode: 'All',
        evidence_dialogues: {},
      };
      EditorNodeQA.setData(badDialogData);
      const badDialogFindings = EditorNodeQA.collectValidation();

      const noneData = clone(data);
      noneData.question_answers.find(answer => answer.question_id === 'QCallPattern').next_type = 'None';
      EditorNodeQA.setData(noneData);
      const noneFindings = EditorNodeQA.collectValidation();

      return {
        evidenceDialoguesPreserved: JSON.stringify(evidenceDialoguesAfter) === JSON.stringify(evidenceDialoguesBefore),
        realDialogTargetPreserved: !!exported.scenes.ch2_well.evidence_dialogues.dlg_songsoon_open,
        validDialogErrors: validFindings.filter(item => item.title === '답변 대사 참조 누락').map(item => item.body),
        badDialogErrors: badDialogFindings.filter(item => item.title === '답변 대사 참조 누락').map(item => item.body),
        noneErrors: noneFindings.filter(item => item.title === '답변 다음 타입 오류').map(item => item.body),
      };
    }, loadGameData());

    assert(errors.length === 0, `EditorNode page errors: ${errors.join(' | ')}`);
    assert(result.evidenceDialoguesPreserved && result.realDialogTargetPreserved, 'EditorNode export lost evidence_dialogues');
    assert(result.validDialogErrors.length === 0, `valid Dialog target rejected: ${result.validDialogErrors.join(' | ')}`);
    assert(result.badDialogErrors.some(error => error.includes('qa_second_owner')), 'Dialog target was not checked in every owning checkpoint scene');
    assert(result.noneErrors.some(error => error.includes('None')), 'EditorNode accepted QuestionAnswer NextType None');
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exitCode = 1;
});
