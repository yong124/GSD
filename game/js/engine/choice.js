const Choice = (() => {
  function describeChoiceImpact(choice, isPriority = false) {
    if (!choice) return '선택의 파장이 남습니다.';
    const key = choice.flag_key || '';
    if (isPriority) return '조사 방향이 또렷해집니다.';

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
    const key = choice?.flag_key || '';
    if (['SongsoonTrust', 'TrustedSongsoon', 'OkryunPushed'].includes(key)) return 'choice-relationship';
    if (['InvestigationScore', 'ReadRitualScore', 'FoundOldArticles'].includes(key)) return 'choice-investigation';
    if (['ResonanceLevel', 'TouchedRoomWall', 'FinalChoice'].includes(key)) return 'choice-risk';
    return 'choice-decision';
  }

  return {
    show(choices, onChoose) {
      UIManager.setDialogueBoxVisible(false);
      const mappedChoices = choices.map(c => ({ ...c, type: getChoiceType(c) }));
      
      UIManager.renderChoiceList(mappedChoices, (picked) => {
        if (picked.flag_key) {
          State.setFlag(picked.flag_key, picked.flag_value ?? true);
        }
        if (typeof UIManager?.showToast === 'function') {
          UIManager.showToast(`선택: ${picked.text}\n${describeChoiceImpact(picked)}`, 'toast-impact');
        }
        setTimeout(() => {
          UIManager.setChoiceBoxVisible(false);
          if (onChoose) onChoose(picked);
        }, 180);
      });

      UIManager.setChoiceBoxVisible(true);
    },

    showPriority(scene, onDone) {
      UIManager.setDialogueBoxVisible(false);
      const choices = (scene.choices || []).map(c => ({ ...c, type: getChoiceType(c, true) }));
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

        const meta = {
          kicker: '조사 중',
          title: scene.priority_title || scene.title || '조사 장면',
          hint: scene.priority_hint || '남은 조사 기회 안에서 무엇을 먼저 확인할지 정하세요.',
          indicator: `남은 조사 기회  ${budget - spent} / ${budget}`,
        };

        UIManager.updateHUD(scene, {
          mode: 'priority',
          kicker: '조사 중',
          text: `${meta.title} · ${budget - spent} / ${budget}`,
        });

        UIManager.renderChoiceList(remaining, (choice) => {
          if (choice.flag_key) {
            State.setFlag(choice.flag_key, choice.flag_value ?? true);
          }
          if (typeof UIManager?.showToast === 'function') {
            UIManager.showToast(`선택: ${choice.text}\n${describeChoiceImpact(choice, true)}`, 'toast-impact');
          }
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
          }, 180);
        }, meta);

        UIManager.setChoiceBoxVisible(true);
      };

      render();
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
