/**
 * Scene transition and background controller.
 */
const Scene = (() => {
  let _data = null;
  let _firstSceneId = null;
  let _hudContext = null;
  let _conditions = [];
  let _choiceGroups = new Map();
  let _investigations = new Map();
  let _gauges = [];
  let _gaugeStates = [];
  const _gaugeListeners = new Map();

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
    UIManager.showChapterCard(chapter, title, onDone);
  }

  function showSceneBanner(scene) {
    UIManager.showBanner(scene);
  }

  function showSceneGoal(scene) {
    const goal = getSceneGoal(scene);
    if (goal) UIManager.showGoal(goal);
  }

  function getSceneGoal(scene) {
    if (scene.goal_text) {
      return {
        kicker: scene.goal_kicker || '장면 목표',
        text: scene.goal_text,
      };
    }
    return null;
  }

  function updateHud(scene) {
    UIManager.updateHUD(scene, _hudContext);
  }

  function triggerEnding(delayMs = 1500) {
    setTimeout(() => document.dispatchEvent(new Event('game:ending')), delayMs);
  }

  function getGaugeStates(gaugeId) {
    return _gaugeStates.filter(row => row?.gauge_id === gaugeId);
  }

  function handleGaugeStateChange(event) {
    UIManager.updateGaugeHUD?.(event?.gaugeId, event?.value, event?.previousState, event?.state);
    const triggerSceneId = event?.state?.trigger_scene_id;
    if (!triggerSceneId) return;
    Scene.load(triggerSceneId);
  }

  function bindGaugeStateListeners() {
    _gaugeListeners.forEach((listener, gaugeId) => {
      State.off(`gauge:state:${gaugeId}`, listener);
    });
    _gaugeListeners.clear();

    (_gauges || []).forEach(gauge => {
      const gaugeId = gauge?.gauge_id;
      if (!gaugeId) return;
      const listener = event => handleGaugeStateChange(event);
      _gaugeListeners.set(gaugeId, listener);
      State.on(`gauge:state:${gaugeId}`, listener);
    });
  }

  function loadResolvedNext(scene) {
    const nextSceneId = resolveNextScene(scene);
    if (nextSceneId) {
      Scene.load(nextSceneId);
      return;
    }
    triggerEnding();
  }

  function parseConditionValue(value) {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) return value;
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    const text = String(value).trim();
    if (text === '') return null;
    if (text === 'true') return true;
    if (text === 'false') return false;
    const numeric = Number(text);
    return Number.isNaN(numeric) ? text : numeric;
  }

  function compareConditionValue(actual, compareType, expected) {
    if (Array.isArray(expected)) {
      if (compareType === 'NotEqual') return !expected.includes(actual);
      return expected.includes(actual);
    }
    switch (compareType) {
      case 'NotEqual':
        return actual !== expected;
      case 'Greater':
        return Number(actual) > Number(expected);
      case 'GreaterEqual':
      case 'Gte':
        return Number(actual) >= Number(expected);
      case 'Less':
        return Number(actual) < Number(expected);
      case 'LessEqual':
        return Number(actual) <= Number(expected);
      case 'Equal':
      default:
        return actual === expected;
    }
  }

  function getRevealedCharacterSet(context = {}) {
    const scenes = _data || {};
    const currentSceneId = context.sceneId || State.currentSceneId;
    if (!scenes || !currentSceneId) return new Set();

    const sceneEntries = Object.entries(scenes);
    const currentSceneIndex = sceneEntries.findIndex(([sceneId]) => sceneId === currentSceneId);
    if (currentSceneIndex < 0) return new Set();

    const revealed = new Set();
    sceneEntries.forEach(([sceneId, scene], index) => {
      const dialogues = Array.isArray(scene?.dialogues) ? scene.dialogues : [];
      const limit = sceneId === currentSceneId
        ? Math.max(0, context.sceneProgressIndex ?? ((Number(State.dialogueIndex) || 0) + 1))
        : (index < currentSceneIndex ? dialogues.length : 0);

      dialogues.slice(0, limit).forEach(line => {
        if (line?.speaker_id) revealed.add(line.speaker_id);
      });
    });

    return revealed;
  }

  function getSceneProgressIndex(sceneId = State.currentSceneId) {
    const scenes = _data || {};
    if (!sceneId || !scenes[sceneId]) return -1;
    return Object.keys(scenes).findIndex(id => id === sceneId);
  }

  function resolveConditionActualValue(condition, context = {}) {
    const type = condition?.condition_type;
    const targetId = condition?.condition_target_id;
    switch (type) {
      case 'GaugeValue':
        return Number(State.getGauge(targetId) || 0);
      case 'Trust': {
        const characterId = targetId && String(targetId).endsWith('Trust') ? String(targetId).replace(/Trust$/, '') : targetId;
        return Number(State.getTrust?.(characterId) || 0);
      }
      case 'EvidenceOwned':
        return State.getEvidenceOwned(targetId);
      case 'ChoiceSelected': {
        const choiceIds = String(targetId || '')
          .split('|')
          .map(value => value.trim())
          .filter(Boolean);
        if (choiceIds.length === 0) return false;
        return choiceIds.some(choiceId => State.hasChoice(choiceId));
      }
      case 'RevealedCharacter':
        return getRevealedCharacterSet(context).has(targetId);
      case 'SceneProgressIndex':
        return context.sceneProgressIndex ?? Number(State.dialogueIndex || 0);
      case 'SceneVisited':
        return State.hasVisitedScene?.(targetId) === true;
      default:
        return null;
    }
  }

  function passesConditionGroup(conditionGroupId, context = {}) {
    if (!conditionGroupId) return true;
    const rows = _conditions.filter(row => row?.condition_group_id === conditionGroupId);
    if (rows.length === 0) return true;
    return rows.every(row => compareConditionValue(
      resolveConditionActualValue(row, context),
      row?.compare_type,
      parseConditionValue(row?.condition_value)
    ));
  }

  function passesConditionRef(item, context = {}) {
    if (!item?.condition_group_id) return true;
    return passesConditionGroup(item.condition_group_id, context);
  }

  function getChoiceGroup(choiceGroupId) {
    return choiceGroupId ? (_choiceGroups.get(choiceGroupId) || null) : null;
  }

  function getChoiceGroupType(choice) {
    const group = getChoiceGroup(choice?.choice_group_id);
    if (group?.type) return group.type;
    return 'Normal';
  }

  function getSceneChoicesByType(scene, type) {
    const context = { sceneId: scene?.id };
    const sceneChoices = Array.isArray(scene?.choices) ? scene.choices : [];
    return sceneChoices.filter(choice => {
      if (!passesConditionRef(choice, context)) return false;
      const groupType = getChoiceGroupType(choice);
      if (type === 'Investigation') return groupType === 'Investigation';
      if (type === 'Normal') return groupType === 'Normal';
      return false;
    }).map(choice => ({
      ...choice,
      choice_group_type: getChoiceGroupType(choice),
    }));
  }

  function getAvailableChoices(scene, type = 'Normal') {
    return getSceneChoicesByType(scene, type);
  }

  function resolveInvestigation(scene) {
    if (scene?.investigation_id) {
      return _investigations.get(scene.investigation_id) || null;
    }

    const investigationChoices = getSceneChoicesByType(scene, 'Investigation');
    if (investigationChoices.length > 0) {
      const group = getChoiceGroup(investigationChoices[0]?.choice_group_id);
      return {
        investigation_id: scene?.investigation_id || investigationChoices[0]?.choice_group_id || scene?.id,
        title: scene?.title || '조사 장면',
        hint: '남은 조사 기회 안에서 무엇을 먼저 확인할지 정하세요.',
        budget: group?.max_selectable ?? 1,
        choice_group_id: group?.choice_group_id || investigationChoices[0]?.choice_group_id || null,
      };
    }

    return null;
  }

  function hasPriorityMode(scene, choices = null) {
    const visibleChoices = Array.isArray(choices) ? choices : getAvailableChoices(scene, 'Investigation');
    const investigation = resolveInvestigation(scene);
    return !!investigation && (Number(investigation.budget) || 0) > 0 && visibleChoices.length > 0;
  }

  function getAvailableEvidenceChoiceGroups(scene) {
    const context = { sceneId: scene?.id };
    const groupedEvidenceChoices = (scene?.choices || []).filter(choice => {
      if (!passesConditionRef(choice, context)) return false;
      const group = getChoiceGroup(choice?.choice_group_id);
      const answerType = group?.answer_type || (getChoiceGroupType(choice) === 'Evidence' ? 'Evidence' : 'Text');
      if (answerType !== 'Evidence') return false;
      return true;
    });
    if (groupedEvidenceChoices.length > 0) {
      const grouped = new Map();
      groupedEvidenceChoices.forEach(choice => {
        const key = choice?.choice_group_id || `__ungrouped_${choice?.order || 0}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(choice);
      });

      return [...grouped.values()]
        .map(groupChoices => [...groupChoices].sort((a, b) => (a?.order || 0) - (b?.order || 0)))
        .sort((a, b) => ((a[0]?.order || 0) - (b[0]?.order || 0)));
    }

    const legacyChoices = (scene.evidence_choices || []).filter(choice => {
      if (!passesConditionRef(choice, context)) return false;
      const evidenceId = choice?.evidence_id;
      if (!evidenceId) return false;
      return State.getEvidenceOwned(evidenceId);
    });
    return legacyChoices.length > 0 ? [legacyChoices] : [];
  }

  function playContainerTransition(durationMs, onDone) {
    const container = document.getElementById('game-container');
    if (!container) {
      onDone();
      return;
    }
    container.style.transition = `opacity ${durationMs / 1000}s`;
    container.style.opacity = '0';
    setTimeout(() => {
      container.style.opacity = '1';
      onDone();
    }, durationMs);
  }

  function resolveNextScene(scene) {
    const branches = scene.branches || [];
    for (const branch of branches) {
      if (branch?.condition_group_id && passesConditionGroup(branch.condition_group_id, { sceneId: scene?.id })) {
        return branch.next_scene || branch.next_scene_id;
      }
    }
    const defaultBranch = branches.find(branch => !branch?.condition_group_id);
    return defaultBranch?.next_scene || null;
  }

  function resolveChoiceNavigation(choice) {
    const nextType = choice?.next_type || null;
    const nextId = choice?.next_id || null;
    if (nextType === 'Scene') {
      return { nextScene: nextId || null, nextDialogue: null };
    }
    if (nextType === 'Dialog') {
      return { nextScene: null, nextDialogue: nextId || null };
    }
    return { nextScene: null, nextDialogue: null };
  }

  function runScene(scene, fromLabel, restoreProgress = false) {
    // Clear leftover overlays from the previous scene before the new flow starts.
    Choice?.hide?.();
    UIManager.hideEvidenceInventory?.();
    UIManager.setChoiceBoxVisible(false);
    UIManager.setDialogueBoxVisible(true);

    State.currentSceneId = scene.id;
    State.visitScene?.(scene.id);
    _hudContext = null;
    if (!restoreProgress || fromLabel) {
      State.dialogueIndex = 0;
    }

    setBackground(scene.background || '', scene.id);
    AudioManager.playBgm(scene.music || '');
    Effects.apply(scene.effect || '');
    Evidence.collectAuto(scene);
    UIManager.showBanner(scene);
    UIManager.showGoal(getSceneGoal(scene));
    UIManager.updateHUD(scene, _hudContext);

    Save.save(true);

    function afterDialogue() {
      Evidence.collectOnClick(scene);
      const choices = getAvailableChoices(scene, 'Normal');
      const investigationChoices = getAvailableChoices(scene, 'Investigation');
      const evidenceChoiceGroups = getAvailableEvidenceChoiceGroups(scene);
      const investigation = resolveInvestigation(scene);

      const continueAfterEvidence = () => {
        if (hasPriorityMode(scene, investigationChoices)) {
          Choice.showPriority({ ...scene, choices: investigationChoices, investigation }, () => {
            loadResolvedNext(scene);
          });
        } else if (choices.length > 0) {
          Choice.show(choices, chosen => {
            const { nextScene, nextDialogue } = resolveChoiceNavigation(chosen);
            if (nextScene) {
              Scene.load(nextScene, nextDialogue);
            } else if (nextDialogue) {
              const branchLines = (scene.evidence_dialogues || {})[nextDialogue || ''] || [];
              if (branchLines.length > 0) {
                Dialogue.start(branchLines, () => {
                  loadResolvedNext(scene);
                }, null);
              } else {
                Dialogue.start(scene.dialogues || [], afterDialogue, nextDialogue);
              }
            } else {
              loadResolvedNext(scene);
            }
          });
        } else {
          loadResolvedNext(scene);
        }
      };

      const runEvidenceGroup = index => {
        if (index >= evidenceChoiceGroups.length) {
          continueAfterEvidence();
          return;
        }

        const evidenceChoices = evidenceChoiceGroups[index];
        Choice.showEvidence(scene, evidenceChoices, chosen => {
          const { nextDialogue } = resolveChoiceNavigation(chosen);
          const branchLines = (scene.evidence_dialogues || {})[nextDialogue || ''] || [];
          if (branchLines.length > 0) {
            Dialogue.start(branchLines, () => runEvidenceGroup(index + 1), null);
          } else if (nextDialogue) {
            Dialogue.start(scene.dialogues || [], () => runEvidenceGroup(index + 1), nextDialogue);
          } else {
            runEvidenceGroup(index + 1);
          }
        });
      };

      if (evidenceChoiceGroups.length > 0) {
        runEvidenceGroup(0);
        return;
      }

      continueAfterEvidence();
    }

    Dialogue.start(scene.dialogues || [], afterDialogue, fromLabel, restoreProgress && !fromLabel);
  }

  return {
    init(gameData) {
      _data = gameData.scenes;
      _firstSceneId = gameData.first_scene || Object.keys(gameData.scenes || {})[0] || null;
      _conditions = Array.isArray(gameData.conditions) ? gameData.conditions : [];
      _choiceGroups = new Map((gameData.choice_groups || []).map(item => [item.choice_group_id, item]));
      _investigations = new Map((gameData.investigations || []).map(item => [item.investigation_id, item]));
      _gauges = Array.isArray(gameData.gauges) ? gameData.gauges : [];
      _gaugeStates = Array.isArray(gameData.gauge_states) ? gameData.gauge_states : [];
      bindGaugeStateListeners();
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

      const prevChapter = State.chapter;

      if (scene.chapter && scene.chapter !== prevChapter) {
        State.chapter = scene.chapter;
        playContainerTransition(500, () => {
          showChapterCard(scene.chapter, scene.title, () => runScene(scene, fromLabel, restoreProgress));
        });
      } else {
        playContainerTransition(350, () => runScene(scene, fromLabel, restoreProgress));
      }
    },

    getHudContext() {
      return _hudContext;
    },

    setHudContext(context) {
      _hudContext = context || null;
      UIManager.updateHUD(State.currentSceneId ? _data?.[State.currentSceneId] : null, _hudContext);
    },

    passesConditionGroup(conditionGroupId, context = {}) {
      return passesConditionGroup(conditionGroupId, context);
    },

    passesConditionRef(item, context = {}) {
      return passesConditionRef(item, context);
    },

    getRevealedCharacterIds(context = {}) {
      return Array.from(getRevealedCharacterSet(context));
    },

    getSceneProgressIndex(sceneId = State.currentSceneId) {
      return getSceneProgressIndex(sceneId);
    }
  };
})();
