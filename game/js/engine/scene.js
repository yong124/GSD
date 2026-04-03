/**
 * Scene transition and background controller.
 */
const Scene = (() => {
  let _data = null;
  let _firstSceneId = null;
  let _hudContext = null;

  const SCENE_THEMES = {
    court:       'linear-gradient(160deg, #0d1520 0%, #1a2535 50%, #0d1015 100%)',
    editor:      'linear-gradient(160deg, #1a120a 0%, #2a1f10 50%, #120d05 100%)',
    newsroom:    'linear-gradient(160deg, #1a120a 0%, #2a1f10 50%, #120d05 100%)',
    hospital:    'linear-gradient(160deg, #0a1210 0%, #102018 50%, #050e0c 100%)',
    factory:     'linear-gradient(160deg, #0e0e12 0%, #1a1a22 50%, #08080e 100%)',
    cafe:        'linear-gradient(160deg, #1a0a10 0%, #2a1020 50%, #0e0508 100%)',
    storage:     'linear-gradient(160deg, #120a08 0%, #1e1008 50%, #0a0604 100%)',
    slum:        'linear-gradient(160deg, #0a0e0a 0%, #141a10 50%, #060a06 100%)',
    underground: 'linear-gradient(160deg, #050510 0%, #0a0a20 50%, #020208 100%)',
    default:     'linear-gradient(160deg, #0a0a0f 0%, #12121e 100%)',
  };

  function setBackground(url, sceneId) {
    const el = document.getElementById('bg-layer');
    const themeKey = Object.keys(SCENE_THEMES).find(k => (sceneId || '').includes(k)) || 'default';

    el.style.background = SCENE_THEMES[themeKey];
    el.style.backgroundImage = '';

    if (url) {
      const img = new Image();
      img.onload = () => { el.style.backgroundImage = `url('${url}')`; };
      img.onerror = () => {};
      img.src = url;
    }
  }

  function showChapterCard(chapter, title, onDone) {
    const card = document.getElementById('chapter-card');
    const num = document.getElementById('chapter-number');
    const tit = document.getElementById('chapter-title');

    num.textContent = `CHAPTER ${chapter}`;
    tit.textContent = title;
    card.classList.remove('hidden');

    setTimeout(() => {
      card.classList.add('hidden');
      if (onDone) onDone();
    }, 2800);
  }

  function showSceneBanner(scene) {
    const el = document.getElementById('scene-banner');
    const kicker = document.getElementById('scene-banner-kicker');
    const title = document.getElementById('scene-banner-title');

    kicker.textContent = scene.chapter ? `CHAPTER ${scene.chapter}` : 'SCENE';
    title.textContent = scene.title || scene.id || '';
    el.classList.remove('hidden');
    el.classList.add('show');

    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hidden');
    }, 2200);
  }

  function getSceneGoal(scene) {
    if (scene.goal_text) {
      return {
        kicker: scene.goal_kicker || '장면 목표',
        text: scene.goal_text,
      };
    }

    const choices = scene.choices || [];
    if ((scene.priority_budget || 0) > 0 && choices.length > 0) {
      return {
        kicker: '조사 목표',
        text: '남은 조사 기회 안에서 무엇을 먼저 확인할지 가려냅니다.',
      };
    }
    if (choices.length > 0) {
      return {
        kicker: '결정 목표',
        text: '다음 행동 방식을 정하고 그 대가를 감수합니다.',
      };
    }
    if ((scene.evidence || []).length > 0) {
      return {
        kicker: '기록 목표',
        text: '현장에 남은 흔적과 기록을 놓치지 않고 붙듭니다.',
      };
    }
    return null;
  }

  function showSceneGoal(scene) {
    const meta = getSceneGoal(scene);
    const el = document.getElementById('scene-goal');
    const kicker = document.getElementById('scene-goal-kicker');
    const text = document.getElementById('scene-goal-text');

    if (!el || !kicker || !text) return;

    clearTimeout(el._timer);
    if (!meta) {
      el.classList.remove('show');
      el.classList.add('hidden');
      return;
    }

    kicker.textContent = meta.kicker;
    text.textContent = meta.text;
    el.classList.remove('hidden');
    el.classList.add('show');

    el._timer = setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hidden');
    }, 2600);
  }

  function getStateReadout() {
    const parts = [];
    const resonance = Number(State.getFlag('ResonanceLevel') || 0);
    const trust = Number(State.getFlag('SongsoonTrust') || 0);
    const investigation = Number(State.getFlag('InvestigationScore') || 0);

    if (investigation >= 3) parts.push('조사 집착');
    else if (investigation >= 1) parts.push('조사 진행');

    if (trust >= 2 || State.getFlag('TrustedSongsoon') === true) parts.push('송순 신뢰');
    else if (trust >= 1) parts.push('동행 유지');

    if (resonance >= 2) parts.push('공명 짙음');
    else if (resonance >= 1) parts.push('공명 전조');

    return parts.join(' · ') || '추적 중';
  }

  function applyStateMood() {
    const container = document.getElementById('game-container');
    const resonance = Number(State.getFlag('ResonanceLevel') || 0);
    const trust = Number(State.getFlag('SongsoonTrust') || 0);
    const trusted = State.getFlag('TrustedSongsoon') === true;

    container.classList.remove('state-resonance-low', 'state-resonance-high', 'state-trust-high');

    if (resonance >= 2) container.classList.add('state-resonance-high');
    else if (resonance >= 1) container.classList.add('state-resonance-low');

    if (trust >= 2 || trusted) container.classList.add('state-trust-high');
  }

  function updateHud(scene) {
    const titleEl = document.getElementById('hud-scene-title');
    const chapterEl = document.getElementById('hud-chapter');
    const evidenceEl = document.getElementById('hud-evidence-count');
    const stateEl = document.getElementById('hud-state-readout');
    const focusRow = document.getElementById('hud-focus-row');
    const focusKicker = document.getElementById('hud-focus-kicker');
    const focusText = document.getElementById('hud-focus-text');
    const container = document.getElementById('game-container');

    if (!titleEl || !chapterEl || !evidenceEl || !stateEl || !focusRow || !focusKicker || !focusText || !container) return;

    titleEl.textContent = scene?.title || '';
    chapterEl.textContent = scene?.chapter ? `CHAPTER ${scene.chapter}` : '';
    evidenceEl.textContent = `단서 ${State.getEvidence().length}건`;
    stateEl.textContent = getStateReadout();
    focusRow.classList.toggle('hidden', !_hudContext);
    focusKicker.textContent = _hudContext?.kicker || '';
    focusText.textContent = _hudContext?.text || '';
    container.classList.toggle('hud-priority-active', _hudContext?.mode === 'priority');
    applyStateMood();
  }

  function resolveNextScene(scene) {
    const branches = scene.branches || [];
    for (const branch of branches) {
      const actual = State.getFlag(branch.flag_key);
      const values = Array.isArray(branch.flag_value) ? branch.flag_value : [branch.flag_value];
      if (values.includes(actual)) {
        return branch.next_scene;
      }
    }
    return scene.next_scene;
  }

  function runScene(scene, fromLabel, restoreProgress = false) {
    State.currentSceneId = scene.id;
    _hudContext = null;
    if (!restoreProgress || fromLabel) {
      State.dialogueIndex = 0;
    }

    setBackground(scene.background || '', scene.id);
    AudioManager.playBgm(scene.music || '');
    Effects.apply(scene.effect || '');
    Evidence.collectAuto(scene);
    showSceneBanner(scene);
    showSceneGoal(scene);
    updateHud(scene);

    Save.save(true);

    function afterDialogue() {
      Evidence.collectOnClick(scene);

      const priorityBudget = scene.priority_budget || 0;
      const choices = scene.choices || [];

      if (priorityBudget > 0 && choices.some(c => c.priority_cost != null)) {
        // 조사 우선순위 모드
        const afterLines = scene.priority_after_dialogues || [];
        Choice.showPriority(scene, () => {
          const goNext = () => {
            const next = resolveNextScene(scene);
            if (next) {
              Scene.load(next);
            } else {
              setTimeout(() => document.dispatchEvent(new Event('game:ending')), 1500);
            }
          };
          if (afterLines.length > 0) {
            Dialogue.start(afterLines, goNext, null);
          } else {
            goNext();
          }
        });
      } else if (choices.length > 0) {
        Choice.show(choices, chosen => {
          const nextScene    = chosen.next_scene || null;
          const nextDialogue = chosen.next_dialogue || null;
          if (nextScene) {
            Scene.load(nextScene, nextDialogue);
          } else if (nextDialogue) {
            // 같은 씬 내 특정 대사로 점프
            Dialogue.start(scene.dialogues || [], afterDialogue, nextDialogue);
          } else {
            Scene.load(resolveNextScene(scene));
          }
        });
      } else {
        const next = resolveNextScene(scene);
        if (next) {
          Scene.load(next);
        } else {
          // 엔딩: 저장 초기화 후 타이틀 복귀
          setTimeout(() => {
            document.dispatchEvent(new Event('game:ending'));
          }, 1500);
        }
      }
    }

    Dialogue.start(scene.dialogues || [], afterDialogue, fromLabel, restoreProgress && !fromLabel);
  }

  return {
    init(gameData) {
      _data = gameData.scenes;
      _firstSceneId = gameData.first_scene || Object.keys(gameData.scenes || {})[0] || null;
    },

    load(sceneId, fromLabel, options = {}) {
      const { restoreProgress = false } = options;
      const scene = _data[sceneId];
      if (!scene) {
        console.warn(`Missing scene: [${sceneId}] Falling back to first scene.`);
        if (_firstSceneId && _firstSceneId !== sceneId) {
          this.load(_firstSceneId, null, { restoreProgress: false });
        }
        return;
      }

      const container = document.getElementById('game-container');
      const prevChapter = State.chapter;

      if (scene.chapter && scene.chapter !== prevChapter) {
        State.chapter = scene.chapter;
        container.style.transition = 'opacity 0.5s';
        container.style.opacity = '0';
        setTimeout(() => {
          container.style.opacity = '1';
          showChapterCard(scene.chapter, scene.title, () => runScene(scene, fromLabel, restoreProgress));
        }, 500);
      } else {
        container.style.transition = 'opacity 0.35s';
        container.style.opacity = '0';
        setTimeout(() => {
          container.style.opacity = '1';
          runScene(scene, fromLabel, restoreProgress);
        }, 350);
      }
    },

    getHudContext() {
      return _hudContext;
    },

    setHudContext(context) {
      _hudContext = context || null;
    }
  };
})();

window.refreshGameHUD = function () {
  const sceneId = State.currentSceneId;
  const scene = sceneId ? Scene && window.GAME_DATA?.scenes?.[sceneId] : null;
  const titleEl = document.getElementById('hud-scene-title');
  const chapterEl = document.getElementById('hud-chapter');
  const evidenceEl = document.getElementById('hud-evidence-count');
  const stateEl = document.getElementById('hud-state-readout');
  const focusRow = document.getElementById('hud-focus-row');
  const focusKicker = document.getElementById('hud-focus-kicker');
  const focusText = document.getElementById('hud-focus-text');
  const container = document.getElementById('game-container');

  if (!titleEl || !chapterEl || !evidenceEl || !stateEl || !focusRow || !focusKicker || !focusText || !container) return;

  const hudCtx = Scene.getHudContext();

  titleEl.textContent = scene?.title || '';
  chapterEl.textContent = scene?.chapter ? `CHAPTER ${scene.chapter}` : '';
  evidenceEl.textContent = `단서 ${State.getEvidence().length}건`;

  const resonance = Number(State.getFlag('ResonanceLevel') || 0);
  const trust = Number(State.getFlag('SongsoonTrust') || 0);
  const investigation = Number(State.getFlag('InvestigationScore') || 0);
  const trusted = State.getFlag('TrustedSongsoon') === true;
  const parts = [];
  if (investigation >= 3) parts.push('조사 집착');
  else if (investigation >= 1) parts.push('조사 진행');
  if (trust >= 2 || trusted) parts.push('송순 신뢰');
  else if (trust >= 1) parts.push('동행 유지');
  if (resonance >= 2) parts.push('공명 짙음');
  else if (resonance >= 1) parts.push('공명 전조');
  stateEl.textContent = parts.join(' · ') || '추적 중';
  focusRow.classList.toggle('hidden', !hudCtx);
  focusKicker.textContent = hudCtx?.kicker || '';
  focusText.textContent = hudCtx?.text || '';

  container.classList.remove('state-resonance-low', 'state-resonance-high', 'state-trust-high');
  container.classList.toggle('hud-priority-active', hudCtx?.mode === 'priority');
  if (resonance >= 2) container.classList.add('state-resonance-high');
  else if (resonance >= 1) container.classList.add('state-resonance-low');
  if (trust >= 2 || trusted) container.classList.add('state-trust-high');
};

window.setGameHUDContext = function (context) {
  Scene.setHudContext(context);
  if (typeof window.refreshGameHUD === 'function') {
    window.refreshGameHUD();
  }
};
