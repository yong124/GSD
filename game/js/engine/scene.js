/**
 * scene.js — 씬 전환 & 배경 스왑
 */
const Scene = (() => {
  let _data = null; // window.GAME_DATA.scenes

  // 씬 배경색 테마 (이미지 없을 때 CSS 그라디언트 폴백)
  // key는 scene_id에 포함될 수 있는 문자열 (부분 일치)
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
    // 어떤 테마 키가 씬 ID에 포함되는지 검사
    const themeKey = Object.keys(SCENE_THEMES).find(k => (sceneId || '').includes(k)) || 'default';
    el.style.background = SCENE_THEMES[themeKey];

    if (url) {
      // 이미지 로드 성공 시에만 배경 이미지 적용
      const img = new Image();
      img.onload = () => { el.style.backgroundImage = `url('${url}')`; };
      img.onerror = () => { /* 폴백 그라디언트 유지 */ };
      img.src = url;
    }
  }

  function showChapterCard(chapter, title, onDone) {
    const card  = document.getElementById('chapter-card');
    const num   = document.getElementById('chapter-number');
    const tit   = document.getElementById('chapter-title');

    num.textContent = `CHAPTER ${chapter}`;
    tit.textContent = title;
    card.classList.remove('hidden');

    setTimeout(() => {
      card.classList.add('hidden');
      if (onDone) onDone();
    }, 2800);
  }

  /** branches 배열을 순서대로 검사해 조건 맞는 next_scene 반환, 없으면 기본값 */
  function resolveNextScene(scene) {
    const branches = scene.branches || [];
    for (const branch of branches) {
      const actual = State.getFlag(branch.flag_key);
      // flag_value가 배열이면 OR 조건, 단일값이면 일치 비교
      const values = Array.isArray(branch.flag_value) ? branch.flag_value : [branch.flag_value];
      if (values.includes(actual)) {
        return branch.next_scene;
      }
    }
    return scene.next_scene;
  }

  function runScene(scene) {
    State.currentSceneId = scene.id;
    State.dialogueIndex  = 0;

    // 배경 변경 (이미지 없으면 테마 그라디언트)
    setBackground(scene.background || '', scene.id);

    // BGM 변경
    AudioManager.playBgm(scene.music || '');

    // 씬 이펙트 적용
    Effects.apply(scene.effect || '');

    // 자동 단서 수집
    Evidence.collectAuto(scene);

    // 대화 종료 후 처리
    function afterDialogue() {
      // 대화를 끝까지 읽으면 click 트리거 단서 수집
      Evidence.collectOnClick(scene);

      const choices = scene.choices || [];
      if (choices.length > 0) {
        Choice.show(choices, (chosen) => {
          const next = chosen.next_scene || scene.next_scene;
          if (next) Scene.load(next);
        });
      } else if (scene.next_scene) {
        Scene.load(resolveNextScene(scene));
      }
      // next_scene 없으면 씬 종료 (챕터 말미 등)
    }

    Dialogue.start(scene.dialogues || [], afterDialogue);
  }

  return {
    init(gameData) {
      _data = gameData.scenes;
    },

    load(sceneId) {
      const scene = _data[sceneId];
      if (!scene) {
        console.warn(`씬 없음: [${sceneId}] — 데이터가 변경되었거나 잘못된 ID입니다. 첫 씬으로 이동합니다.`);
        // 데이터 변경 후 세션 불일치 대응: 첫 씬으로 로드 시도
        const firstSceneId = Object.keys(_data)[0];
        if (firstSceneId && firstSceneId !== sceneId) {
          this.load(firstSceneId);
        }
        return;
      }

      const container = document.getElementById('game-container');

      // 챕터가 바뀌면 챕터 카드 표시
      const prevChapter = State.chapter;
      if (scene.chapter && scene.chapter !== prevChapter) {
        State.chapter = scene.chapter;
        // 페이드아웃 후 챕터 카드
        container.style.transition = 'opacity 0.5s';
        container.style.opacity = '0';
        setTimeout(() => {
          container.style.opacity = '1';
          showChapterCard(scene.chapter, scene.title, () => runScene(scene));
        }, 500);
      } else {
        // 일반 씬 전환 페이드
        container.style.transition = 'opacity 0.35s';
        container.style.opacity = '0';
        setTimeout(() => {
          container.style.opacity = '1';
          runScene(scene);
        }, 350);
      }

      // 자동저장
      Save.save();
    }
  };
})();
