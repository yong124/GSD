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
      const category = GAME_DATA.conditions
        .find(condition => condition.condition_group_id === 'CG_Proof_All')
        ?.condition_target_id.split('|');
      const reachableAfterCorrect = Scene.passesConditionGroup('CG_Proof_All');
      category.forEach(stateId => State.setBooleanState(stateId, false));
      const lockedWithoutCategory = !Scene.passesConditionGroup('CG_Proof_All');
      category.forEach(stateId => State.setBooleanState(stateId, true));
      return { reachableAfterCorrect, lockedWithoutCategory };
    })(),
  }), questionIds);
  assert(result.completed && result.answered.every(Boolean) && result.count === 10 && result.callback === 1, 'All mode mismatch');
  assert(result.proof.reachableAfterCorrect && result.proof.lockedWithoutCategory, 'CG_Proof_All reachability mismatch');
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

async function testSerializedResume(page) {
  const questionIds = ['QRitualLead', 'QRitualAccident'];
  const correctAnswerIds = [ANSWERS.ritualLead, ANSWERS.ritualAccident];
  await prepareCheckpoint(page, { sceneId: 'qa_saved', questionIds });
  await clickAnswer(page, ANSWERS.ritualLead);
  const serialized = await page.evaluate(() => State.serialize());
  const resumed = await page.evaluate(saved => {
    State.reset();
    State.deserialize(saved);
    window.__checkpointQa.completed = 0;
    return Evidence.startQuestionCheckpoint(window.__checkpointQa.scene, () => { window.__checkpointQa.completed += 1; });
  }, serialized);
  assert(resumed, 'serialized partial checkpoint did not resume');
  assert((await page.locator('#choice-box .priority-title').textContent()).includes('즉흥적 광신'), 'serialized resume repeated answered question');
  const partial = await page.evaluate(() => ({
    answered: State.getBooleanState('QuestionAnswered_qa_saved_QRitualLead'),
    solved: State.getBooleanState('QuestionSolved_QRitualLead'),
    recorded: State.hasChoice('QRitualLead_Correct'),
  }));
  assert(partial.answered && partial.solved && partial.recorded, 'serialized partial checkpoint facts missing');
  await clickAnswer(page, ANSWERS.ritualAccident);
  const result = await page.evaluate(() => ({
    first: State.getBooleanState('QuestionAnswered_qa_saved_QRitualLead'),
    second: State.getBooleanState('QuestionAnswered_qa_saved_QRitualAccident'),
    completed: State.getBooleanState('QuestionCheckpointCompleted_qa_saved'),
    firstSolved: State.getBooleanState('QuestionSolved_QRitualLead'),
    secondSolved: State.getBooleanState('QuestionSolved_QRitualAccident'),
    firstRecorded: State.hasChoice('QRitualLead_Correct'),
    callback: window.__checkpointQa.completed,
  }));
  assert(result.first && result.second && result.completed && result.firstSolved && result.secondSolved && result.firstRecorded && result.callback === 1, 'serialized resume state mismatch');
  const replay = await page.evaluate(({ saved, questionIds, correctAnswerIds }) => {
    State.reset();
    State.deserialize(saved);
    window.__checkpointQa.completed = 0;
    const started = Evidence.startQuestionCheckpoint(window.__checkpointQa.scene, () => { window.__checkpointQa.completed += 1; });
    return {
      started,
      completed: State.getBooleanState('QuestionCheckpointCompleted_qa_saved'),
      answered: questionIds.map(questionId => State.getBooleanState(`QuestionAnswered_qa_saved_${questionId}`)),
      solved: questionIds.map(questionId => State.getBooleanState(`QuestionSolved_${questionId}`)),
      recorded: correctAnswerIds.map(answerId => State.hasChoice(answerId)),
      callback: window.__checkpointQa.completed,
    };
  }, { saved: await page.evaluate(() => State.serialize()), questionIds, correctAnswerIds });
  assert(!replay.started && replay.completed && replay.answered.every(Boolean) && replay.solved.every(Boolean) && replay.recorded.every(Boolean) && replay.callback === 0, 'completed serialized checkpoint repeated or lost facts');
  return { ...result, partial, replay };
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
    results.push(await withPage(browser, 'serialized-state-resume', testSerializedResume));
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
