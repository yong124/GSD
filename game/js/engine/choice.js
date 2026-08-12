const Choice = (() => {
  const PICK_DELAY_MS = 180;

  function getChoiceId(choice) {
    return choice?.choice_id || '';
  }

  function getChoiceGroup(choice) {
    const groups = window.GAME_DATA?.choice_groups || [];
    return groups.find(group => group?.choice_group_id === choice?.choice_group_id) || null;
  }

  function getChoiceAnswerType(choice) {
    return getChoiceGroup(choice)?.answer_type || 'Text';
  }

  function getEffectsByGroup(effectGroupId) {
    if (!effectGroupId) return [];
    return (window.GAME_DATA?.effects || []).filter(effect => effect?.effect_group_id === effectGroupId);
  }

  function applyEffectGroup(effectGroupId) {
    const effects = getEffectsByGroup(effectGroupId);
    effects.forEach(effect => {
      switch (effect?.effect_type) {
        case 'GaugeChange':
          if (effect?.gauge_id) State.addGauge(effect.gauge_id, Number(effect.gauge_delta || 0));
          break;
        case 'EvidenceGive':
        case 'EvidenceGain':
          if (effect?.evidence_id && typeof Evidence?.collect === 'function') Evidence.collect(effect.evidence_id);
          break;
        case 'TrustChange':
          if (effect?.trust_character_id) State.addTrust?.(effect.trust_character_id, Number(effect.trust_delta || 0));
          break;
        default:
          break;
      }
    });
    return effects;
  }

  function formatSignedValue(value) {
    const numeric = Number(value || 0);
    return numeric > 0 ? `+${numeric}` : `${numeric}`;
  }

  function describeEffect(effect) {
    if (!effect) return '';
    if (effect.effect_type === 'GaugeChange') {
      const labels = { Credibility: '평판', Erosion: '침식' };
      return `${labels[effect.gauge_id] || effect.gauge_id} ${formatSignedValue(effect.gauge_delta)}`;
    }
    if (effect.effect_type === 'TrustChange') {
      const character = window.GAME_DATA?.characters?.[effect.trust_character_id];
      return `${character?.display_name || effect.trust_character_id} 신뢰 ${formatSignedValue(effect.trust_delta)}`;
    }
    if ((effect.effect_type === 'EvidenceGive' || effect.effect_type === 'EvidenceGain') && effect.evidence_id) {
      return '단서 획득';
    }
    return '';
  }

  function describeChoiceImpact(choice, effects = [], isPriority = false) {
    if (!choice) return '선택의 파장을 알 수 없습니다.';
    const changes = effects.map(describeEffect).filter(Boolean);
    if (changes.length > 0) return changes.join(' · ');
    if (choice.impact_text) return choice.impact_text;
    if (isPriority) return '조사 방향이 미세하게 바뀝니다.';
    if (choice.evidence_id) return '관련된 증거 반응이 열립니다.';
    return '선택의 파장은 조용히 남습니다.';
  }

  function getChoiceType(choice, isPriority = false) {
    const base = (() => {
      if (isPriority) return 'choice-investigation';
      if (getChoiceAnswerType(choice) === 'Evidence' || choice?.choice_group_type === 'Evidence') return 'choice-evidence';
      if (choice?.evidence_id) return 'choice-investigation';
      return 'choice-decision';
    })();
    return choice?.locked ? `${base} choice-locked` : base;
  }

  function applyChoiceEffects(choice) {
    if (!choice) return [];
    State.recordChoice(getChoiceId(choice));
    return choice?.effect_group_id ? applyEffectGroup(choice.effect_group_id) : [];
  }

  function showChoiceImpact(choice, effects = [], isPriority = false) {
    if (typeof UIManager?.showToast !== 'function' || !choice) return;
    UIManager.showToast(`결과: ${describeChoiceImpact(choice, effects, isPriority)}`, 'toast-impact');
  }

  function finishChoice(callback, picked) {
    setTimeout(() => {
      UIManager.setChoiceBoxVisible(false);
      UIManager.hideEvidenceInventory?.();
      if (callback) callback(picked);
    }, PICK_DELAY_MS);
  }

  function mapChoices(choices, isPriority = false) {
    return (choices || []).map(choice => ({
      ...choice,
      type: getChoiceType(choice, isPriority),
    }));
  }

  function getPriorityMeta(investigation, budget, spent) {
    const remaining = Math.max(0, budget - spent);
    const title = investigation.title || '조사 장면';
    return {
      kicker: '조사 중',
      title,
      hint: investigation.hint || '남은 조사 기회 안에서 무엇을 먼저 확인할지 정하세요.',
      indicator: `남은 조사 기회 ${remaining} / ${budget}`,
      hudText: `${title} · ${remaining} / ${budget}`,
    };
  }

  function getEvidenceMeta(scene, count) {
    return {
      kicker: '증거 제시',
      title: scene.evidence_prompt_title || '지금 내밀 증거를 고른다',
      hint: scene.evidence_prompt_hint || '지금 가진 단서 가운데, 이 장면에서 직접 내밀 증거를 고르세요.',
      indicator: `제시 가능한 증거 ${count}건`,
    };
  }

  function buildEvidenceEntries(evidenceChoices = []) {
    const evidenceById = new Map();
    (window.GAME_DATA?.scenes ? Object.values(window.GAME_DATA.scenes) : []).forEach(scene => {
      (scene?.evidence || []).forEach(evidence => {
        const evidenceId = evidence?.evidence_id || evidence?.id;
        if (evidenceId && !evidenceById.has(evidenceId)) evidenceById.set(evidenceId, evidence);
      });
    });

    return State.getEvidence().map(evidenceId => {
      const matchedChoice = evidenceChoices.find(choice => choice?.evidence_id === evidenceId) || null;
      const evidence = evidenceById.get(evidenceId) || {};
      return {
        evidence_id: evidenceId,
        text: evidence?.name || evidenceId,
        detail: evidence?.description || '',
        image: evidence?.image || '',
        matchedChoice,
      };
    });
  }

  return {
    applyEffectGroup,

    show(choices, onChoose) {
      UIManager.setDialogueBoxVisible(false);
      const mappedChoices = mapChoices(choices);

      UIManager.renderChoiceList(mappedChoices, picked => {
        const effects = applyChoiceEffects(picked);
        showChoiceImpact(picked, effects);
        finishChoice(onChoose, picked);
      });

      UIManager.setChoiceBoxVisible(true);
    },

    showPriority(scene, onDone) {
      UIManager.setDialogueBoxVisible(false);
      const choices = mapChoices(scene.choices, true);
      const budget = scene?.investigation?.budget ?? 0;
      const priorityDialogues = scene.investigation_dialogues || {};
      const sourceSceneId = scene?.id || State.currentSceneId || null;
      let spent = 0;
      const pickedSet = new Set();

      const isSceneStillActive = () => !sourceSceneId || State.currentSceneId === sourceSceneId;

      const render = () => {
        if (!isSceneStillActive()) {
          Choice.hide();
          return;
        }

        const remaining = choices
          .filter(c => !pickedSet.has(c.order))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (remaining.length === 0 || spent >= budget) {
          Choice.hide();
          if (onDone) onDone(null);
          return;
        }

        const meta = getPriorityMeta(scene.investigation || scene, budget, spent);

        UIManager.updateHUD(scene, {
          mode: 'priority',
          kicker: meta.kicker,
          text: meta.hudText,
        });

        UIManager.renderChoiceList(remaining, choice => {
          if (!isSceneStillActive()) {
            Choice.hide();
            return;
          }

          const effects = applyChoiceEffects(choice);
          showChoiceImpact(choice, effects, true);
          pickedSet.add(choice.order);
          spent += 1;

          setTimeout(() => {
            if (!isSceneStillActive()) {
              Choice.hide();
              return;
            }

            const branchKey = choice.next_type === 'Dialog' ? choice.next_id : '';
            const branchLines = (priorityDialogues || {})[branchKey || ''] || [];
            if (choice.next_type === 'Scene' && choice.next_id) {
              Choice.hide();
              if (onDone) onDone(choice);
              return;
            }
            if (branchLines.length > 0) {
              UIManager.setChoiceBoxVisible(false);
              Dialogue.start(branchLines, render, null);
            } else {
              render();
            }
          }, PICK_DELAY_MS);
        }, meta);

        UIManager.setChoiceBoxVisible(true);
      };

      render();
    },

    showEvidence(scene, evidenceChoices, onChoose) {
      UIManager.setDialogueBoxVisible(false);
      const choiceGroup = getChoiceGroup(evidenceChoices[0]) || null;
      const isGate = !!choiceGroup?.is_gate;

      const attempt = () => {
        const evidenceEntries = buildEvidenceEntries(evidenceChoices);
        const meta = getEvidenceMeta(scene, evidenceEntries.length);

        const evidenceOptions = evidenceEntries.map(entry => ({
          text: entry.text,
          desc: entry.detail || '',
          type: 'choice-evidence',
          evidence_id: entry.evidence_id,
        }));

        UIManager.renderChoiceList(evidenceOptions, pickedOption => {
          const pickedEvidenceId = pickedOption.evidence_id;
          const matchedChoice = evidenceChoices.find(choice => choice?.evidence_id === pickedEvidenceId) || null;
          const fallbackChoice = choiceGroup?.default_dialog_id
            ? {
                text: pickedEvidenceId,
                next_type: 'Dialog',
                next_id: choiceGroup.default_dialog_id,
                effect_group_id: choiceGroup.default_effect_group_id || null,
              }
            : null;
          const picked = matchedChoice || fallbackChoice;
          if (!picked) return;

          const isWrongPick = isGate && !matchedChoice?.is_correct;
          if (isWrongPick) {
            const effects = picked.effect_group_id ? applyEffectGroup(picked.effect_group_id) : [];
            showChoiceImpact({ ...picked, text: matchedChoice?.text || pickedEvidenceId }, effects);
            const branchLines = (scene.evidence_dialogues || {})[picked.next_id || ''] || [];
            if (branchLines.length > 0) {
              UIManager.setChoiceBoxVisible(false);
              Dialogue.start(branchLines, attempt, null);
            } else {
              attempt();
            }
            return;
          }

          const effects = matchedChoice ? applyChoiceEffects(picked) : [];
          showChoiceImpact({ ...picked, text: matchedChoice?.text || pickedEvidenceId }, effects);
          finishChoice(onChoose, picked);
        }, meta);

        UIManager.setChoiceBoxVisible(true);
      };

      attempt();
    },

    hide() {
      UIManager.updateHUD(null, null);
      UIManager.hideEvidenceInventory?.();
      UIManager.setChoiceBoxVisible(false);
    },

    isVisible() {
      const el = document.getElementById(Config.SELECTORS.CHOICE_BOX);
      const inventoryVisible = UIManager.isEvidenceInventoryVisible?.() || false;
      return !!(el && !el.classList.contains('hidden')) || inventoryVisible;
    }
  };
})();
