/**
 * main.js — 초기화: game_data.js 로드 → 엔진 시작
 */
(function () {
  let _titleVisible = true;

  function $(id) {
    return document.getElementById(id);
  }

  function parseCsvList(raw) {
    return String(raw || '')
      .split(',')
      .map(value => value.trim())
      .filter(Boolean);
  }

  function parsePairMap(raw) {
    return parseCsvList(raw).reduce((acc, entry) => {
      const separatorIndex = entry.indexOf(':');
      if (separatorIndex <= 0) return acc;
      const key = entry.slice(0, separatorIndex).trim();
      const value = entry.slice(separatorIndex + 1).trim();
      if (key) acc[key] = value;
      return acc;
    }, {});
  }

  function getAllEvidenceIds(data) {
    const seen = new Set();
    Object.values(data?.scenes || {}).forEach(scene => {
      (scene?.evidence || []).forEach(evidence => {
        const evidenceId = evidence?.evidence_id || evidence?.id;
        if (evidenceId) seen.add(evidenceId);
      });
    });
    return [...seen];
  }

  function getQaConfig(data) {
    const params = new URLSearchParams(window.location.search);
    const sceneId = (params.get('qa_scene') || '').trim();
    if (!sceneId) return null;

    const dialogId = (params.get('qa_dialog_id') || '').trim() || null;
    const evidenceParam = (params.get('qa_evidence') || '').trim();
    const evidenceIds = evidenceParam === 'all'
      ? getAllEvidenceIds(data)
      : parseCsvList(evidenceParam);

    return {
      sceneId,
      dialogId,
      evidenceIds,
      facts: parsePairMap(params.get('qa_facts') || params.get('qa_flags')),
      gauges: parsePairMap(params.get('qa_gauges')),
      trusts: parsePairMap(params.get('qa_trusts')),
      choices: parseCsvList(params.get('qa_choices')),
    };
  }

  function applyQaState(data, config) {
    if (!config?.sceneId) return false;
    const targetScene = data?.scenes?.[config.sceneId];
    if (!targetScene) {
      console.warn(`[QA] Unknown scene id: ${config.sceneId}`);
      return false;
    }

    AudioManager.enable();
    Save.clear();
    State.reset();
    Evidence.resetSession();
    State.chapter = targetScene.chapter || 0;

    Object.entries(config.facts || {}).forEach(([factKey, rawValue]) => {
      if (!factKey) return;
      const normalizedValue = rawValue === 'true'
        ? true
        : rawValue === 'false'
          ? false
          : Number.isNaN(Number(rawValue))
            ? rawValue
            : Number(rawValue);
      if (typeof normalizedValue === 'boolean') {
        State.setBooleanState(factKey, normalizedValue);
      } else if (typeof normalizedValue === 'number') {
        State.setNumericState(factKey, normalizedValue);
      } else {
        State.setFactState(factKey, normalizedValue);
      }
    });

    Object.entries(config.gauges || {}).forEach(([gaugeId, rawValue]) => {
      if (!gaugeId) return;
      State.setGauge(gaugeId, Number(rawValue || 0));
    });

    Object.entries(config.trusts || {}).forEach(([characterId, rawValue]) => {
      if (!characterId) return;
      State.setNumericState(`${characterId}Trust`, Number(rawValue || 0));
    });

    (config.choices || []).forEach(choiceId => {
      State.recordChoice(choiceId);
    });

    (config.evidenceIds || []).forEach(evidenceId => {
      if (!evidenceId) return;
      State.addEvidence(evidenceId);
      State.setBooleanState(`HasEvidence_${evidenceId}`, true);
    });

    hideTitleScreen();
    Choice.hide();
    UIManager.hideEvidenceInventory?.();
    UIManager.setChoiceBoxVisible(false);
    UIManager.setDialogueBoxVisible(true);
    Scene.load(config.sceneId, config.dialogId);

    setTimeout(() => {
      UIManager.showToast(`QA 씬 진입: ${config.sceneId}`, 'toast-save');
    }, 60);

    return true;
  }

  function buildQaSceneUrl(sceneId, options = {}) {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('qa_scene', sceneId);
    if (options.dialogId) url.searchParams.set('qa_dialog_id', options.dialogId);
    if (options.evidence === 'all') url.searchParams.set('qa_evidence', 'all');
    if (options.facts) url.searchParams.set('qa_facts', options.facts);
    if (options.gauges) url.searchParams.set('qa_gauges', options.gauges);
    if (options.trusts) url.searchParams.set('qa_trusts', options.trusts);
    if (options.choices) url.searchParams.set('qa_choices', options.choices);
    return url.toString();
  }

  function hideTitleScreen() {
    _titleVisible = false;
    InputManager.setTitleVisible(false);
    $('title-screen').classList.add('hidden');
    UIManager.updateGaugeHUD?.();
  }

  function showTitleScreen() {
    const hasSave = Save.hasSave();
    _titleVisible = true;
    InputManager.setTitleVisible(true);
    Choice.hide();
    UIManager.hideEvidenceInventory?.();
    UIManager.setChoiceBoxVisible(false);
    UIManager.setDialogueBoxVisible(false);
    $('title-screen').classList.remove('hidden');
    $('continue-btn').disabled = !hasSave;
    $('continue-btn').setAttribute('aria-disabled', String(!hasSave));
    UIManager.updateGaugeHUD?.();
  }

  function startNewGame(data) {
    AudioManager.enable();
    Save.clear();
    State.reset();
    Evidence.resetSession();
    State.chapter = 0;
    hideTitleScreen();
    Choice.hide();
    Scene.load(data.first_scene);
  }

  function continueGame(data) {
    AudioManager.enable();
    if (!Save.hasSave()) {
      showTitleScreen();
      return;
    }
    Save.load();
  }

  function initTitleScreen(data) {
    $('new-game-btn').addEventListener('click', () => startNewGame(data));
    $('continue-btn').addEventListener('click', () => continueGame(data));

    document.addEventListener('keydown', e => {
      if (!_titleVisible) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (Save.hasSave()) {
          continueGame(data);
        } else {
          startNewGame(data);
        }
      }
    });

    showTitleScreen();
  }

  function init() {
    const data = window.GAME_DATA;
    if (!data) {
      document.body.innerHTML = `
        <div style="color:#c8a84b; background:#0a0a0f; padding:40px; font-family:monospace; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; gap:16px;">
          <div style="font-size:18px">⚠ game_data.js 파일이 없습니다.</div>
          <div style="font-size:13px; color:#7a6e5a;">python export_to_json.py 를 실행해 데이터를 먼저 생성하세요.</div>
        </div>`;
      return;
    }

    // [Refactor] Centralized engine bootstrap
    Engine.init(data);

    InputManager.setTitleVisible(true);
    initTitleScreen(data);
    window.QA = {
      buildSceneUrl: (sceneId, options = {}) => buildQaSceneUrl(sceneId, options),
      start: (sceneId, options = {}) => applyQaState(data, {
        sceneId,
        dialogId: options.dialogId || null,
        evidenceIds: options.evidence === 'all' ? getAllEvidenceIds(data) : parseCsvList(options.evidence),
        facts: options.facts || {},
        gauges: options.gauges || {},
        trusts: options.trusts || {},
        choices: options.choices || [],
      }),
      parseLocation: () => getQaConfig(data),
    };

    const qaConfig = getQaConfig(data);
    if (qaConfig) {
      const started = applyQaState(data, qaConfig);
      if (!started) showTitleScreen();
    }

    // 엔진 시그널 수신
    document.addEventListener('game:ending', () => {
      Save.clear();
      State.reset();
      Evidence.resetSession();
      Choice.hide();
      UIManager.hideEvidenceInventory?.();
      UIManager.setChoiceBoxVisible(false);
      UIManager.setDialogueBoxVisible(false);
      showTitleScreen();
    });

    document.addEventListener('game:loaded', () => hideTitleScreen());
  }

  // DOM 준비 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
