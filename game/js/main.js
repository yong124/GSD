/**
 * main.js — 초기화: game_data.js 로드 → 엔진 시작
 */
(function () {
  let _titleVisible = true;

  function $(id) {
    return document.getElementById(id);
  }

  function hideTitleScreen() {
    _titleVisible = false;
    InputManager.setTitleVisible(false);
    $('title-screen').classList.add('hidden');
  }

  function showTitleScreen() {
    const hasSave = Save.hasSave();
    _titleVisible = true;
    InputManager.setTitleVisible(true);
    $('title-screen').classList.remove('hidden');
    $('continue-btn').disabled = !hasSave;
    $('continue-btn').setAttribute('aria-disabled', String(!hasSave));
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

    // 엔진 시그널 수신
    document.addEventListener('game:ending', () => {
      Save.clear();
      State.reset();
      Evidence.resetSession();
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
