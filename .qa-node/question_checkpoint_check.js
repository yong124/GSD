const { chromium } = require('./node_modules/playwright');

const URL = 'http://127.0.0.1:4173/?qa_scene=ch2_factory_shock&qa_evidence=all';
const QUESTION_TITLE = '이판규는 누구에게 불려갔는가';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    const rawSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = (fn, delay = 0, ...args) => rawSetTimeout(fn, Math.min(Number(delay) || 0, 20), ...args);
  });

  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.textContent = '*,*::before,*::after{transition-duration:0s!important;animation-duration:0s!important;}';
    document.head.appendChild(style);
    if (typeof Config !== 'undefined' && Config.TYPING) Config.TYPING.DEFAULT_SPEED = 1;
    if (typeof UIManager !== 'undefined' && UIManager.showChapterCard) {
      UIManager.showChapterCard = (_chapter, _title, onDone) => setTimeout(() => onDone?.(), 20);
    }
  });

  let pickedSceneChoice = false;
  let result = null;
  for (let step = 0; step < 220; step += 1) {
    result = await page.evaluate(expectedTitle => {
      const choiceBox = document.querySelector('#choice-box');
      const visible = choiceBox && !choiceBox.classList.contains('hidden');
      const title = (choiceBox?.querySelector('.priority-title')?.textContent || '').trim();
      const answers = visible
        ? Array.from(choiceBox.querySelectorAll('.choice-btn')).map(button => (button.textContent || '').trim())
        : [];
      return {
        ok: visible && title === expectedTitle && answers.length === 3,
        sceneId: typeof State !== 'undefined' ? State.currentSceneId : null,
        title,
        answers,
      };
    }, QUESTION_TITLE);
    if (result.ok || (result.sceneId && result.sceneId !== 'ch2_factory_shock')) break;

    const action = await page.evaluate(alreadyPicked => {
      const choiceBox = document.querySelector('#choice-box');
      if (!alreadyPicked && choiceBox && !choiceBox.classList.contains('hidden')) {
        choiceBox.querySelector('.choice-btn:not(.choice-locked)')?.click();
        return 'choice';
      }
      const dialogueBox = document.querySelector('#dialogue-box');
      if (dialogueBox && !dialogueBox.classList.contains('hidden')) {
        dialogueBox.click();
        dialogueBox.click();
        return 'dialogue';
      }
      return 'wait';
    }, pickedSceneChoice);
    if (action === 'choice') pickedSceneChoice = true;
    await page.waitForTimeout(20);
  }

  const presented = { ...result };
  let completion = null;
  if (presented.ok) {
    await page.locator('#choice-box .choice-btn:not([disabled])').first().click();
    for (let step = 0; step < 100; step += 1) {
      completion = await page.evaluate(() => ({
        sceneId: State.currentSceneId,
        answered: State.getBooleanState('QuestionAnswered_ch2_factory_shock_QIpangyuCall'),
        completed: State.getBooleanState('QuestionCheckpointCompleted_ch2_factory_shock'),
        solved: State.getBooleanState('QuestionSolved_QIpangyuCall'),
        recorded: State.hasChoice('QIpangyuCall_Correct'),
        solvedCount: State.getNumericState('SolvedQuestionCount'),
      }));
      if (completion.sceneId === 'ch2_cafe') break;
      await page.waitForTimeout(20);
    }
  }

  const completed = completion?.sceneId === 'ch2_cafe'
    && completion.answered
    && completion.completed
    && completion.solved
    && completion.recorded
    && completion.solvedCount === 1;
  const output = { ...presented, ok: presented.ok && completed, completion, errors };
  console.log(JSON.stringify(output, null, 2));
  await browser.close();
  if (!output.ok || errors.length > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
