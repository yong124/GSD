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
    $('title-screen').classList.add('hidden');
  }

  function showTitleScreen() {
    const hasSave = Save.hasSave();
    _titleVisible = true;
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
    if (!Save.load()) {
      showTitleScreen();
      return;
    }
    hideTitleScreen();
    Scene.load(State.currentSceneId || data.first_scene, null, { restoreProgress: true });
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

  function initHotkeys() {
    document.addEventListener('keydown', e => {
      if (_titleVisible) return;

      if (e.code === 'Escape') {
        if (Save.isPanelOpen()) {
          e.preventDefault();
          Save.hidePanel();
          return;
        }
        if (Evidence.isOpen()) {
          e.preventDefault();
          Evidence.hide();
          return;
        }
      }

      if (Choice.isVisible()) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        document.getElementById('memo-btn').click();
        return;
      }

      if (Save.isPanelOpen() || Evidence.isOpen()) return;

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        Save.save(false);
        return;
      }

      if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        Save.load();
      }
    });
  }

  function init() {
    if (!window.GAME_DATA) {
      document.body.innerHTML = `
        <div style="
          color:#c8a84b; background:#0a0a0f;
          font-family:monospace; padding:40px;
          height:100vh; display:flex; flex-direction:column;
          justify-content:center; align-items:center; gap:16px;
        ">
          <div style="font-size:18px">⚠ game_data.js 파일이 없습니다.</div>
          <div style="font-size:13px; color:#7a6e5a;">
            content/tools/ 폴더에서 아래 명령을 실행하세요:<br><br>
            <code style="color:#e8d08a;">python export_to_json.py</code>
          </div>
        </div>`;
      return;
    }

    const data = window.GAME_DATA;

    // 엔진 초기화
    Scene.init(data);
    AudioManager.init();
    Evidence.index(data.scenes);
    Dialogue.init();
    Evidence.init();
    Save.init();
    Evidence.hydrateSession();
    initTitleScreen(data);
    initHotkeys();

    // 엔딩 이벤트 수신
    document.addEventListener('game:ending', () => {
      Save.clear();
      State.reset();
      Evidence.resetSession();
      showTitleScreen();
    });
  }

  // DOM 준비 후 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
