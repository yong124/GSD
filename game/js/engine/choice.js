const Choice = (() => {
  const PICK_DELAY_MS = 180;

  function describeChoiceImpact(choice, isPriority = false) {
    if (!choice) return '선택의 파장이 남습니다.';
    const key = choice.flag_key || '';
    if (isPriority) return '조사 방향이 또렷해집니다.';
    if (choice.evidence_id) return '붙든 단서가 새로운 반응을 끌어냅니다.';

    switch (key) {
      case 'SongsoonTrust':
      case 'TrustedSongsoon':
        return '송순과의 거리가 미세하게 달라집니다.';
      case 'InvestigationScore':
      case 'ReadRitualScore':
      case 'FoundOldArticles':
        return '조사 감각이 한층 또렷해집니다.';
      case 'ResonanceLevel':
      case 'TouchedRoomWall':
        return '공명의 기색이 더 짙어집니다.';
      case 'CalledEditor':
        return choice.flag_value ? '바깥에 남길 흔적을 만들었습니다.' : '둘만의 증언으로 끝까지 내려갑니다.';
      case 'FinalChoice':
        return '마지막 결단의 무게가 기울기 시작합니다.';
      default:
        return '선택의 파장이 조용히 남습니다.';
    }
  }

  function getChoiceType(choice, isPriority = false) {
    if (isPriority) return 'choice-investigation';
    if (choice?.evidence_id) return 'choice-evidence';
    const key = choice?.flag_key || '';
    if (['SongsoonTrust', 'TrustedSongsoon', 'OkryunPushed'].includes(key)) return 'choice-relationship';
    if (['InvestigationScore', 'ReadRitualScore', 'FoundOldArticles'].includes(key)) return 'choice-investigation';
    if (['ResonanceLevel', 'TouchedRoomWall', 'FinalChoice'].includes(key)) return 'choice-risk';
    return 'choice-decision';
  }

  function applyChoiceFlag(choice) {
    if (choice?.flag_key) {
      State.setFlag(choice.flag_key, choice.flag_value ?? true);
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
    const title = scene.priority_title || scene.title || '조사 장면';
    return {
      kicker: '조사 중',
      title,
      hint: scene.priority_hint || '남은 조사 기회 안에서 무엇을 먼저 확인할지 정하세요.',
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
        applyChoiceFlag(picked);
        showChoiceImpact(picked);
        finishChoice(onChoose, picked);
      });

      UIManager.setChoiceBoxVisible(true);
    },

    showPriority(scene, onDone) {
      UIManager.setDialogueBoxVisible(false);
      const choices = mapChoices(scene.choices, true);
      const budget = scene.priority_budget || 0;
      const priorityDialogues = scene.priority_dialogues || {};
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

        const meta = getPriorityMeta(scene, budget, spent);

        UIManager.updateHUD(scene, {
          mode: 'priority',
          kicker: meta.kicker,
          text: meta.hudText,
        });

        UIManager.renderChoiceList(remaining, (choice) => {
          applyChoiceFlag(choice);
          showChoiceImpact(choice, true);
          pickedSet.add(choice.order);
          spent += choice.priority_cost != null ? choice.priority_cost : 1;
          
          setTimeout(() => {
            const branchLines = (priorityDialogues || {})[choice.next_dialogue || ''] || [];
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
        applyChoiceFlag(picked);
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
