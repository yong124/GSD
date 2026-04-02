/**
 * Scene transition and background controller.
 */
const Scene = (() => {
  let _data = null;

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

  function runScene(scene, fromLabel) {
    State.currentSceneId = scene.id;
    State.dialogueIndex = 0;

    setBackground(scene.background || '', scene.id);
    AudioManager.playBgm(scene.music || '');
    Effects.apply(scene.effect || '');
    Evidence.collectAuto(scene);
    showSceneBanner(scene);

    Save.save(true);

    function afterDialogue() {
      Evidence.collectOnClick(scene);

      const choices = scene.choices || [];
      if (choices.length > 0) {
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

    Dialogue.start(scene.dialogues || [], afterDialogue, fromLabel);
  }

  return {
    init(gameData) {
      _data = gameData.scenes;
    },

    load(sceneId, fromLabel) {
      const scene = _data[sceneId];
      if (!scene) {
        console.warn(`Missing scene: [${sceneId}] Falling back to first scene.`);
        const firstSceneId = Object.keys(_data)[0];
        if (firstSceneId && firstSceneId !== sceneId) {
          this.load(firstSceneId);
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
          showChapterCard(scene.chapter, scene.title, () => runScene(scene, fromLabel));
        }, 500);
      } else {
        container.style.transition = 'opacity 0.35s';
        container.style.opacity = '0';
        setTimeout(() => {
          container.style.opacity = '1';
          runScene(scene, fromLabel);
        }, 350);
      }
    }
  };
})();
