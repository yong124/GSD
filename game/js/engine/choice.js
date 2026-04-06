const Choice = (() => {
  const PICK_DELAY_MS = 180;

  function getChoiceId(choice) {
    return choice?.choice_id || '';
  }

  function describeChoiceImpact(choice, isPriority = false) {
    if (!choice) return '선택의 파장이 남습니다.';
    const stateType = choice.state_type || '';
    if (isPriority) return '조사 방향이 또렷해집니다.';
    if (choice.trust_character_id && Number(choice.trust_value || 0) !== 0) return '인물 사이의 거리가 달라집니다.';
    if (Number(choice.resonance_value || 0) !== 0) return '공명의 기색이 더 짙어집니다.';
    if (choice.evidence_id) return '붙든 단서가 새로운 반응을 끌어냅니다.';
    if (choice.impact_text) return choice.impact_text;

    switch (stateType) {
      case 'SongsoonTrust':
        return '송순과의 거리가 미세하게 달라집니다.';
      case 'InvestigationScore':
      case 'ReadRitualScore':
        return '조사 감각이 한층 또렷해집니다.';
      case 'ResonanceLevel':
        return '공명의 기색이 더 짙어집니다.';
      default:
        return '선택의 파장이 조용히 남습니다.';
    }
  }

  function getChoiceType(choice, isPriority = false) {
    if (isPriority) return 'choice-investigation';
    if (choice?.choice_group_type === 'Evidence') return 'choice-evidence';
    if (choice?.trust_character_id && Number(choice?.trust_value || 0) !== 0) return 'choice-relationship';
    if (Number(choice?.resonance_value || 0) !== 0) return 'choice-risk';
    if (choice?.evidence_id) return 'choice-investigation';
    const stateType = choice?.state_type || '';
    if (stateType === 'SongsoonTrust') return 'choice-relationship';
    if (stateType === 'InvestigationScore' || stateType === 'ReadRitualScore') return 'choice-investigation';
    if (stateType === 'ResonanceLevel') return 'choice-risk';
    return 'choice-decision';
  }

  function applyChoiceEffects(choice, mode = 'normal') {
    if (!choice) return;

    State.recordChoice(getChoiceId(choice));

    if (choice?.trust_character_id && Number(choice.trust_value || 0) !== 0) {
      const trustKey = `${choice.trust_character_id}Trust`;
      const currentTrust = Number(State.getFlag(trustKey) || 0);
      State.setFlag(trustKey, currentTrust + Number(choice.trust_value || 0));
    }

    if (Number(choice?.resonance_value || 0) !== 0) {
      const currentResonance = Number(State.getFlag('ResonanceLevel') || 0);
      State.setFlag('ResonanceLevel', currentResonance + Number(choice.resonance_value || 0));
    }

    if (choice?.evidence_id && mode !== 'evidence' && typeof Evidence?.collect === 'function') {
      Evidence.collect(choice.evidence_id);
    }
    if (choice?.state_type) {
      State.setFlag(choice.state_type, choice.state_value ?? true);
    }
  }

  function showChoiceImpact(choice, isPriority = false) {
    if (typeof UIManager?.showToast !== 'function' || !choice) return;
    UIManager.showToast(`선택: ${choice.text}\n${describeChoiceImpact(choice, isPriority)}`, 'toast-impact');
  }

  function finishChoice(callback, picked) {
    setTimeout(() => {
      UIManager.setChoiceBoxVisible(false);
      if (callback) callback(picked);
    }, PICK_DELAY_MS);
  }

  function mapChoices(choices, isPriority = false) {
    return (choices || []).map(choice => ({
      ...choice,
      type: getChoiceType(choice, isPriority),
    }));
  }

  function getPriorityMeta(scene, budget, spent) {
    const remaining = Math.max(0, budget - spent);
    const title = scene.title || '조사 장면';
    return {
      kicker: '조사 중',
      title,
      hint: scene.hint || '남은 조사 기회 안에서 무엇을 먼저 확인할지 정하세요.',
      indicator: `남은 조사 기회  ${remaining} / ${budget}`,
      hudText: `${title} · ${remaining} / ${budget}`,
    };
  }

  function getEvidenceMeta(scene, count) {
    return {
      kicker: '증거 제시',
      title: scene.evidence_prompt_title || '지금 내밀 단서를 고른다',
      hint: scene.evidence_prompt_hint || '지금 가진 단서 가운데, 이 장면을 흔들 근거를 직접 내밀어 보세요.',
      indicator: `제시 가능 단서  ${count}건`,
    };
  }

  return {
    show(choices, onChoose) {
      UIManager.setDialogueBoxVisible(false);
      const mappedChoices = mapChoices(choices);
      
      UIManager.renderChoiceList(mappedChoices, (picked) => {
        applyChoiceEffects(picked, 'normal');
        showChoiceImpact(picked);
        finishChoice(onChoose, picked);
      });

      UIManager.setChoiceBoxVisible(true);
    },

    showPriority(scene, onDone) {
      UIManager.setDialogueBoxVisible(false);
      const choices = mapChoices(scene.choices, true);
      const budget = scene?.investigation?.budget ?? 0;
      const priorityDialogues = scene.investigation?.priority_dialogues || {};
      let spent = 0;
      const pickedSet = new Set();

      const render = () => {
        const remaining = choices
          .filter(c => !pickedSet.has(c.order))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (remaining.length === 0 || spent >= budget) {
          Choice.hide();
          if (onDone) onDone();
          return;
        }

        const meta = getPriorityMeta(scene.investigation || scene, budget, spent);

        UIManager.updateHUD(scene, {
          mode: 'priority',
          kicker: meta.kicker,
          text: meta.hudText,
        });

        UIManager.renderChoiceList(remaining, (choice) => {
          applyChoiceEffects(choice, 'investigation');
          showChoiceImpact(choice, true);
          pickedSet.add(choice.order);
          spent += 1;
          
          setTimeout(() => {
            const branchKey = choice.next_type === 'Dialog' ? choice.next_id : '';
            const branchLines = (priorityDialogues || {})[branchKey || ''] || [];
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
      const mappedChoices = mapChoices(evidenceChoices);
      const meta = getEvidenceMeta(scene, mappedChoices.length);

      UIManager.renderChoiceList(mappedChoices, (picked) => {
        applyChoiceEffects(picked, 'evidence');
        showChoiceImpact(picked);
        finishChoice(onChoose, picked);
      }, meta);

      UIManager.setChoiceBoxVisible(true);
    },

    hide() {
      UIManager.updateHUD(null, null);
      UIManager.setChoiceBoxVisible(false);
    },

    isVisible() {
      const el = document.getElementById(Config.SELECTORS.CHOICE_BOX);
      return el && !el.classList.contains('hidden');
    }
  };
})();
