const { chromium } = require('./node_modules/playwright');

const BASE_URL = 'http://127.0.0.1:4173/';
const ANSWERS = {
  callCorrect: 'QIpangyuCall_Correct',
  callErosion: 'QIpangyuCall_Erosion',
  callCredibility: 'QIpangyuCall_Credibility',
  ritualLead: 'QRitualLead_Correct',
  ritualAccident: 'QRitualAccident_Correct',
  ritualErasure: 'QRitualErasure_Correct',
  ritualBoth: 'QRitualErasure_Erosion',
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function openPage(browser, query = 'qa_scene=ch5_ritual_room&qa_evidence=all') {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    const rawSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = (fn, delay = 0, ...args) => rawSetTimeout(fn, Math.min(Number(delay) || 0, 20), ...args);
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${BASE_URL}?${query}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForFunction(() => typeof State !== 'undefined' && !!State.currentSceneId);
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important;}';
    document.head.appendChild(style);
    Config.TYPING.DEFAULT_SPEED = 1;
    UIManager.showChapterCard = (_chapter, _title, onDone) => setTimeout(() => onDone?.(), 0);
  });
  return { context, page, errors };
}

async function withPage(browser, name, run, query) {
  const { context, page, errors } = await openPage(browser, query);
  try {
    const detail = await run(page);
    assert(errors.length === 0, `${name}: page errors: ${errors.join(' | ')}`);
    return { name, ok: true, ...detail };
  } finally {
    await context.close();
  }
}

async function prepareCheckpoint(page, options = {}) {
  return page.evaluate(config => {
    State.reset();
    State.currentSceneId = config.sceneId;
    if (config.allEvidence !== false) {
      Object.values(GAME_DATA.scenes).forEach(scene => {
        (scene.evidence || []).forEach(evidence => {
          State.addEvidence(evidence.evidence_id);
          State.setBooleanState(`HasEvidence_${evidence.evidence_id}`, true);
        });
      });
    }
    Object.entries(config.gauges || {}).forEach(([id, value]) => State.setGauge(id, value));
    GAME_DATA.questions.forEach(question => { question.visible_condition_group_ids = []; });
    (config.answerOverrides || []).forEach(override => {
      Object.assign(GAME_DATA.question_answers.find(answer => answer.answer_id === override.answer_id), override);
    });

    window.__checkpointQa = { completed: 0, loads: [] };
    if (config.spyLoads) {
      window.__checkpointQa.originalLoad = Scene.load;
      Scene.load = (...args) => window.__checkpointQa.loads.push(args);
    }
    const base = GAME_DATA.scenes[config.baseSceneId];
    window.__checkpointQa.scene = {
      ...base,
      id: config.sceneId,
      forced_question_ids: config.questionIds,
      question_mode: config.mode || 'All',
      evidence_dialogues: { ...(base.evidence_dialogues || {}), ...(config.evidenceDialogues || {}) },
    };
    Choice.hide();
    const started = Evidence.startQuestionCheckpoint(
      window.__checkpointQa.scene,
      () => { window.__checkpointQa.completed += 1; }
    );
    return started;
  }, {
    baseSceneId: options.baseSceneId || 'ch5_ritual_room',
    sceneId: options.sceneId || 'qa_checkpoint',
    questionIds: options.questionIds || ['QRitualLead'],
    mode: options.mode || 'All',
    allEvidence: options.allEvidence,
    gauges: options.gauges || {},
    answerOverrides: options.answerOverrides || [],
    evidenceDialogues: options.evidenceDialogues || {},
    spyLoads: options.spyLoads || false,
  });
}

async function clickAnswer(page, answerId) {
  const clicked = await page.evaluate(id => {
    const answers = GAME_DATA.question_answers
      .filter(answer => answer.question_id === GAME_DATA.question_answers.find(item => item.answer_id === id)?.question_id)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    const button = document.querySelectorAll('#choice-box .choice-btn')[answers.findIndex(answer => answer.answer_id === id)];
    if (!button || button.disabled) return false;
    button.click();
    return true;
  }, answerId);
  assert(clicked, `answer not clickable: ${answerId}`);
  await page.waitForTimeout(40);
}

async function advanceDialogue(page) {
  await page.locator('#dialogue-box').click({ clickCount: 2 });
  await page.waitForTimeout(40);
}

async function testAutomaticCheckpoint(page) {
  let pickedSceneChoice = false;
  for (let step = 0; step < 220; step += 1) {
    const state = await page.evaluate(() => ({
      sceneId: State.currentSceneId,
      title: (document.querySelector('#choice-box .priority-title')?.textContent || '').trim(),
      answers: document.querySelectorAll('#choice-box .choice-btn').length,
      choiceVisible: !document.querySelector('#choice-box')?.classList.contains('hidden'),
      dialogueVisible: !document.querySelector('#dialogue-box')?.classList.contains('hidden'),
    }));
    if (state.title === '이판규는 누구에게 불려갔는가') {
      assert(state.sceneId === 'ch2_factory_shock' && state.answers === 3, 'forced question presentation mismatch');
      await clickAnswer(page, ANSWERS.callCorrect);
      await page.waitForFunction(() => State.currentSceneId === 'ch2_cafe');
      const completion = await page.evaluate(() => ({
        answered: State.getBooleanState('QuestionAnswered_ch2_factory_shock_QIpangyuCall'),
        completed: State.getBooleanState('QuestionCheckpointCompleted_ch2_factory_shock'),
        solved: State.getBooleanState('QuestionSolved_QIpangyuCall'),
        recorded: State.hasChoice('QIpangyuCall_Correct'),
        solvedCount: State.getNumericState('SolvedQuestionCount'),
      }));
      assert(completion.answered && completion.completed && completion.solved && completion.recorded, 'correct answer state missing');
      assert(completion.solvedCount === 1, 'correct answer reward was not applied once');
      return { completion };
    }
    assert(!state.sceneId || state.sceneId === 'ch2_factory_shock', 'scene exited before forced question');
    if (state.choiceVisible && !pickedSceneChoice) {
      await page.locator('#choice-box .choice-btn:not([disabled])').first().click();
      pickedSceneChoice = true;
    } else if (state.dialogueVisible) {
      await advanceDialogue(page);
    } else {
      await page.waitForTimeout(20);
    }
  }
  throw new Error('automatic checkpoint timeout');
}

async function testLocking(page) {
  assert(await prepareCheckpoint(page, {
    baseSceneId: 'ch2_factory_shock', sceneId: 'qa_lock', questionIds: ['QIpangyuCall'], allEvidence: false,
  }), 'locking checkpoint did not start');
  const result = await page.evaluate(() => ({
    disabled: document.querySelectorAll('#choice-box .choice-btn[disabled]').length,
    enabled: document.querySelectorAll('#choice-box .choice-btn:not([disabled])').length,
    styled: document.querySelectorAll('#choice-box .choice-btn[disabled].choice-locked').length,
  }));
  assert(result.disabled === 2 && result.enabled === 1 && result.styled === 2, 'required evidence locking mismatch');
  return result;
}

async function testWrongEffect(page) {
  await prepareCheckpoint(page, {
    baseSceneId: 'ch2_factory_shock', sceneId: 'qa_wrong', questionIds: ['QIpangyuCall'], gauges: { Credibility: 5 }, spyLoads: true,
  });
  await clickAnswer(page, ANSWERS.callCredibility);
  const result = await page.evaluate(() => ({
    credibility: State.getGauge('Credibility'),
    answered: State.getBooleanState('QuestionAnswered_qa_wrong_QIpangyuCall'),
    solved: State.getBooleanState('QuestionSolved_QIpangyuCall'),
    recorded: State.hasChoice('QIpangyuCall_Credibility'),
    completed: window.__checkpointQa.completed,
    loads: window.__checkpointQa.loads,
    resultText: document.querySelector('#system-toast')?.textContent || '',
  }));
  assert(result.credibility === 4 && result.answered && !result.solved && result.recorded, 'wrong answer effect/state mismatch');
  assert(result.completed === 1 && result.loads.length === 0 && result.resultText.includes('추측이 기록의 빈칸'), 'wrong result flow mismatch');
  return result;
}

async function testGameover(page, kind) {
  const configs = {
    erosion: { sceneId: 'qa_erosion', questions: ['QIpangyuCall'], gauges: { Erosion: 9 }, answer: ANSWERS.callErosion, target: 'scene_gameover_erosion' },
    credibility: { sceneId: 'qa_credibility', questions: ['QIpangyuCall'], gauges: { Credibility: 1 }, answer: ANSWERS.callCredibility, target: 'scene_gameover_credibility' },
    combined: { sceneId: 'qa_combined', questions: ['QRitualErasure'], gauges: { Erosion: 9, Credibility: 1 }, answer: ANSWERS.ritualBoth, target: 'scene_gameover_erosion' },
  };
  const config = configs[kind];
  await prepareCheckpoint(page, { sceneId: config.sceneId, questionIds: config.questions, gauges: config.gauges, spyLoads: true });
  await clickAnswer(page, config.answer);
  const result = await page.evaluate(() => ({
    erosion: State.getGauge('Erosion'),
    credibility: State.getGauge('Credibility'),
    loads: window.__checkpointQa.loads.map(args => args[0]),
    completed: window.__checkpointQa.completed,
  }));
  assert(result.loads.length === 1 && result.loads[0] === config.target, `${kind} gameover must load exactly once`);
  assert(result.completed === 0, `${kind} gameover must stop checkpoint completion`);
  if (kind === 'combined') assert(result.erosion === 10 && result.credibility === 0, 'combined effects missing');
  return result;
}

async function testAll(page) {
  const questionIds = await page.evaluate(() => Object.values(GAME_DATA.scenes)
    .flatMap(scene => scene.forced_question_ids || []));
  await prepareCheckpoint(page, { sceneId: 'qa_all', questionIds });
  const answerIds = await page.evaluate(ids => ids.map(questionId => GAME_DATA.question_answers
    .find(answer => answer.question_id === questionId && answer.is_correct)?.answer_id), questionIds);
  assert(answerIds.length === 10 && answerIds.every(Boolean), 'checkpoint correct answer coverage mismatch');
  for (const answerId of answerIds) await clickAnswer(page, answerId);
  const result = await page.evaluate(ids => ({
    completed: State.getBooleanState('QuestionCheckpointCompleted_qa_all'),
    answered: ids.map(id => State.getBooleanState(`QuestionAnswered_qa_all_${id}`)),
    count: State.getNumericState('SolvedQuestionCount'),
    callback: window.__checkpointQa.completed,
    proof: (() => {
      const rows = GAME_DATA.conditions.filter(condition => condition.condition_group_id === 'CG_Proof_All');
      const categories = rows.map(row => row.condition_target_id.split('|'));
      const expectedStateIds = [
        'QuestionSolved_QIpangyuCall', 'QuestionSolved_QIpangyuMadness', 'QuestionSolved_QCallPattern',
        'QuestionSolved_QSonggeumMissing', 'QuestionSolved_QSonggeumRunaway', 'QuestionSolved_QRoom4Purpose', 'QuestionSolved_QArchivePattern',
        'QuestionSolved_QRitualLead', 'QuestionSolved_QRitualAccident', 'QuestionSolved_QRitualErasure',
      ].sort();
      const reachableAfterCorrect = Scene.passesConditionGroup('CG_Proof_All');
      const lockedWithoutEachCategory = categories.map(category => {
        category.forEach(stateId => State.setBooleanState(stateId, false));
        const locked = !Scene.passesConditionGroup('CG_Proof_All');
        category.forEach(stateId => State.setBooleanState(stateId, true));
        return locked;
      });
      return {
        rows: rows.length,
        expectedStateIds,
        actualStateIds: categories.flat().sort(),
        categories,
        reachableAfterCorrect,
        lockedWithoutEachCategory,
      };
    })(),
  }), questionIds);
  assert(result.completed && result.answered.every(Boolean) && result.count === 10 && result.callback === 1, 'All mode mismatch');
  assert(result.proof.rows === 3, 'CG_Proof_All must contain three category rows');
  assert(JSON.stringify(result.proof.actualStateIds) === JSON.stringify(result.proof.expectedStateIds), 'CG_Proof_All solved-state membership mismatch');
  assert(result.proof.reachableAfterCorrect && result.proof.lockedWithoutEachCategory.every(Boolean), 'CG_Proof_All reachability mismatch');
  return result;
}

async function testAny(page) {
  const questionIds = ['QRitualLead', 'QRitualAccident'];
  await prepareCheckpoint(page, { sceneId: 'qa_any', questionIds, mode: 'Any' });
  await clickAnswer(page, ANSWERS.ritualLead);
  const result = await page.evaluate(() => ({
    completed: State.getBooleanState('QuestionCheckpointCompleted_qa_any'),
    first: State.getBooleanState('QuestionAnswered_qa_any_QRitualLead'),
    second: State.getBooleanState('QuestionAnswered_qa_any_QRitualAccident'),
    callback: window.__checkpointQa.completed,
  }));
  assert(result.completed && result.first && !result.second && result.callback === 1, 'Any mode mismatch');
  return result;
}

async function testNavigation(page) {
  await prepareCheckpoint(page, {
    baseSceneId: 'ch2_factory_shock', sceneId: 'qa_resume', questionIds: ['QIpangyuCall'], spyLoads: true,
    answerOverrides: [{ answer_id: ANSWERS.callCorrect, next_type: 'Resume', next_id: '' }],
  });
  await clickAnswer(page, ANSWERS.callCorrect);
  const resume = await page.evaluate(() => ({ callback: window.__checkpointQa.completed, loads: window.__checkpointQa.loads.length }));
  assert(resume.callback === 1 && resume.loads === 0, 'Resume navigation mismatch');

  await prepareCheckpoint(page, {
    sceneId: 'qa_dialog', questionIds: ['QRitualLead', 'QRitualAccident'],
    answerOverrides: [{ answer_id: ANSWERS.ritualLead, next_type: 'Dialog', next_id: 'qa_dialogue' }],
    evidenceDialogues: { qa_dialogue: [{ order: 1, text: '후속 추론 대사', style: 'narration' }] },
  });
  await clickAnswer(page, ANSWERS.ritualLead);
  const dialogueText = await page.locator('#dialogue-text').textContent();
  assert(dialogueText.includes('후속 추론 대사'), 'Dialog navigation did not play evidence dialogue');
  await advanceDialogue(page);
  assert((await page.locator('#choice-box .priority-title').textContent()).includes('즉흥적 광신'), 'Dialog did not continue checkpoint');
  await clickAnswer(page, ANSWERS.ritualAccident);
  const dialog = await page.evaluate(() => ({ completed: State.getBooleanState('QuestionCheckpointCompleted_qa_dialog'), callback: window.__checkpointQa.completed }));
  assert(dialog.completed && dialog.callback === 1, 'Dialog checkpoint completion mismatch');

  await prepareCheckpoint(page, {
    baseSceneId: 'ch2_factory_shock', sceneId: 'qa_scene_nav', questionIds: ['QIpangyuCall'], spyLoads: true,
    answerOverrides: [{ answer_id: ANSWERS.callCorrect, next_type: 'Scene', next_id: 'ch2_cafe' }],
  });
  await clickAnswer(page, ANSWERS.callCorrect);
  const scene = await page.evaluate(() => ({
    completed: State.getBooleanState('QuestionCheckpointCompleted_qa_scene_nav'),
    callback: window.__checkpointQa.completed,
    loads: window.__checkpointQa.loads.map(args => args[0]),
  }));
  assert(scene.completed && scene.callback === 0 && scene.loads.length === 1 && scene.loads[0] === 'ch2_cafe', 'Scene navigation mismatch');
  return { resume, dialog, scene };
}

async function testActualSaveResume(page) {
  let pickedChoice = false;
  for (let step = 0; step < 220; step += 1) {
    const state = await page.evaluate(() => ({
      title: (document.querySelector('#choice-box .priority-title')?.textContent || '').trim(),
      choiceVisible: !document.querySelector('#choice-box')?.classList.contains('hidden'),
      dialogueVisible: !document.querySelector('#dialogue-box')?.classList.contains('hidden'),
    }));
    if (state.title === '이판규는 누구에게 불려갔는가') break;
    if (state.choiceVisible && !pickedChoice) {
      await page.locator('#choice-box .choice-btn:not([disabled])').nth(1).click();
      pickedChoice = true;
    } else if (state.dialogueVisible) {
      await advanceDialogue(page);
    } else {
      await page.waitForTimeout(20);
    }
  }
  assert(pickedChoice, 'save resume setup did not apply the original scene choice');
  await page.waitForFunction(() => document.querySelector('#choice-box .priority-title')?.textContent.includes('이판규는 누구에게'));
  const beforeSave = await page.evaluate(() => ({
    erosion: State.getGauge('Erosion'),
    checkpoint: State.questionCheckpoint,
    choiceRecorded: State.hasChoice('Ch2FactoryShockFollowSong'),
  }));
  assert(beforeSave.erosion === 1 && beforeSave.choiceRecorded, 'original scene choice effect/setup mismatch');
  assert(beforeSave.checkpoint?.scene_id === 'ch2_factory_shock' && beforeSave.checkpoint?.next_scene_id === 'ch2_cafe', 'deferred checkpoint state missing');

  await page.evaluate(() => Save.save(false));
  await page.locator('#slot-list .slot-btn').first().click();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gyeongseong_save_1')));
  assert(stored.question_checkpoint?.scene_id === 'ch2_factory_shock', 'actual save slot omitted checkpoint continuation');

  await page.evaluate(() => State.setGauge('Erosion', 7));
  await page.evaluate(() => Save.load());
  await page.locator('#slot-list .slot-btn').first().click();
  await page.waitForFunction(() => (
    State.currentSceneId === 'ch2_factory_shock'
    && document.querySelector('#choice-box .priority-title')?.textContent.includes('이판규는 누구에게')
  ));
  const resumed = await page.evaluate(() => ({
    erosion: State.getGauge('Erosion'),
    dialogueVisible: !document.querySelector('#dialogue-box')?.classList.contains('hidden'),
    checkpoint: State.questionCheckpoint,
    originalChoiceButtons: Array.from(document.querySelectorAll('#choice-box .choice-btn'))
      .filter(button => button.textContent.includes('환청의 방향')).length,
  }));
  assert(resumed.erosion === 1 && !resumed.dialogueVisible && resumed.originalChoiceButtons === 0, 'Save.load replayed prior dialogue or choice effect');
  assert(resumed.checkpoint?.next_scene_id === 'ch2_cafe', 'Save.load lost deferred destination');

  await clickAnswer(page, ANSWERS.callCorrect);
  await page.waitForFunction(() => State.currentSceneId === 'ch2_cafe');
  const completed = await page.evaluate(() => ({
    erosion: State.getGauge('Erosion'),
    checkpoint: State.questionCheckpoint,
    completed: State.getBooleanState('QuestionCheckpointCompleted_ch2_factory_shock'),
    originalChoiceCount: State.getChoiceHistory().filter(id => id === 'Ch2FactoryShockFollowSong').length,
  }));
  assert(completed.erosion === 1 && completed.originalChoiceCount === 1, 'original choice effect was applied twice');
  assert(completed.completed && completed.checkpoint === null, 'completed checkpoint continuation was not cleared');

  await page.evaluate(() => Save.load());
  await page.locator('#slot-list .slot-btn').first().click();
  await page.waitForFunction(() => State.currentSceneId === 'ch2_cafe');
  const reloadedCompleted = await page.evaluate(() => ({
    sceneId: State.currentSceneId,
    checkpoint: State.questionCheckpoint,
    questionOpen: !document.querySelector('#choice-box')?.classList.contains('hidden')
      && (document.querySelector('#choice-box .priority-title')?.textContent.includes('이판규는 누구에게') || false),
  }));
  assert(!reloadedCompleted.questionOpen && reloadedCompleted.checkpoint === null, 'completed checkpoint reopened after actual load');
  return { beforeSave, storedCheckpoint: stored.question_checkpoint, resumed, completed, reloadedCompleted };
}

async function testQuestionVisibility(page) {
  const checkpoints = [
    ['ch2_factory_shock', ['QIpangyuCall']],
    ['ch2_well', ['QIpangyuMadness', 'QCallPattern']],
    ['ch3_room4_conclusion', ['QSonggeumMissing', 'QSonggeumRunaway', 'QRoom4Purpose']],
    ['ch4a_slum', ['QArchivePattern']],
    ['ch5_ritual_room', ['QRitualLead', 'QRitualAccident', 'QRitualErasure']],
  ];
  const snapshots = await page.evaluate(sequence => {
    State.reset();
    State.currentSceneId = GAME_DATA.first_scene;
    const renderIds = () => {
      Evidence.hide();
      document.getElementById('memo-btn').click();
      document.querySelector('#memo-tabs [data-tab="questions"]').click();
      return Array.from(document.querySelectorAll('#memo-list [data-question-id]')).map(node => node.dataset.questionId);
    };
    const result = [{ sceneId: 'before-all', ids: renderIds() }];
    sequence.forEach(([sceneId]) => {
      State.currentSceneId = sceneId;
      State.visitScene(sceneId);
      result.push({ sceneId, ids: renderIds() });
    });
    Evidence.hide();
    return result;
  }, checkpoints);
  assert(snapshots[0].ids.length === 0, 'questions visible before their checkpoints');
  const visible = new Set();
  checkpoints.forEach(([sceneId, questionIds], index) => {
    questionIds.forEach(questionId => {
      assert(!visible.has(questionId), `${questionId} was visible before ${sceneId}`);
      visible.add(questionId);
    });
    const actual = snapshots[index + 1].ids;
    assert(actual.length === visible.size && [...visible].every(questionId => actual.includes(questionId)), `${sceneId} visibility mismatch`);
  });
  assert(visible.size === 10 && snapshots.at(-1).ids.length === 10, 'not all checkpoint questions became visible');
  return snapshots;
}

async function testReadOnlyNotebook(page) {
  await prepareCheckpoint(page, {
    baseSceneId: 'ch2_factory_shock', sceneId: 'qa_notebook', questionIds: ['QIpangyuCall'], gauges: { Credibility: 5 },
  });
  await clickAnswer(page, ANSWERS.callCredibility);
  await page.locator('#memo-btn').click();
  await page.locator('#memo-tabs [data-tab="questions"]').click();
  const result = await page.evaluate(() => ({
    tabs: document.querySelectorAll('#memo-tabs .memo-tab').length,
    submitControls: document.querySelectorAll('#memo-list .question-evidence-btn, #memo-list .question-commit-btn').length,
    text: document.querySelector('#memo-list')?.textContent || '',
    relatedEvidence: document.querySelectorAll('#memo-list .question-chip').length,
  }));
  assert(result.tabs === 4 && result.submitControls === 0, 'notebook tabs or read-only controls mismatch');
  assert(result.text.includes('푸른 천은 이판규가') && result.text.includes('추측이 기록의 빈칸') && result.text.includes('미해결 기록'), 'failed answer record missing');
  assert(result.relatedEvidence > 0, 'related evidence missing from notebook');
  return { tabs: result.tabs, submitControls: result.submitControls, relatedEvidence: result.relatedEvidence };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    results.push(await withPage(browser, 'automatic-correct-resume', testAutomaticCheckpoint, 'qa_scene=ch2_factory_shock&qa_evidence=all'));
    results.push(await withPage(browser, 'required-evidence-locking', testLocking));
    results.push(await withPage(browser, 'wrong-answer-effect', testWrongEffect));
    results.push(await withPage(browser, 'erosion-gameover', page => testGameover(page, 'erosion')));
    results.push(await withPage(browser, 'credibility-gameover', page => testGameover(page, 'credibility')));
    results.push(await withPage(browser, 'combined-gameover-single-load', page => testGameover(page, 'combined')));
    results.push(await withPage(browser, 'all-mode', testAll));
    results.push(await withPage(browser, 'any-mode', testAny));
    results.push(await withPage(browser, 'answer-navigation', testNavigation));
    results.push(await withPage(browser, 'actual-save-api-resume', testActualSaveResume, 'qa_scene=ch2_factory_shock&qa_evidence=all'));
    results.push(await withPage(browser, 'checkpoint-question-visibility', testQuestionVisibility));
    results.push(await withPage(browser, 'read-only-notebook', testReadOnlyNotebook));
  } finally {
    await browser.close();
  }
  console.log(JSON.stringify({ ok: true, passed: results.length, results }, null, 2));
}

main().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exitCode = 1;
});
