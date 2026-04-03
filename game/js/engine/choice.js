/**
 * Choice UI renderer and flag writer.
 */
const Choice = (() => {
  const elBox  = () => document.getElementById('choice-box');
  const elList = () => document.getElementById('choice-list');

  function describeChoiceImpact(choice, isPriority = false) {
    if (!choice) return '선택의 파장이 남습니다.';
    const key = choice.flag_key || '';

    if (isPriority) {
      return '조사 방향이 또렷해집니다.';
    }

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

  function showChoiceToast(choiceText, detail, variant = 'toast-choice') {
    if (typeof Save?.toast === 'function') {
      Save.toast(`선택: ${choiceText}\n${detail}`, variant);
    }
  }

  function buildPriorityMeta(scene, left) {
    return {
      kicker: '조사 중',
      title: scene.priority_title || scene.title || '조사 장면',
      hint: scene.priority_hint || '남은 조사 기회 안에서 무엇을 먼저 확인할지 정하세요.',
      indicator: `남은 조사 기회  ${left} / ${scene.priority_budget || 0}`,
    };
  }

  function getChoiceType(choice, isPriority = false) {
    if (isPriority) return 'choice-investigation';
    const key = choice?.flag_key || '';

    if (['SongsoonTrust', 'TrustedSongsoon', 'OkryunPushed'].includes(key)) {
      return 'choice-relationship';
    }
    if (['InvestigationScore', 'ReadRitualScore', 'FoundOldArticles'].includes(key)) {
      return 'choice-investigation';
    }
    if (['ResonanceLevel', 'TouchedRoomWall', 'FinalChoice'].includes(key)) {
      return 'choice-risk';
    }
    return 'choice-decision';
  }

  return {
    show(choices, onChoose) {
      const box  = elBox();
      const list = elList();

      list.innerHTML = '';
      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = `choice-btn ${getChoiceType(choice)}`;
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
          list.querySelectorAll('.choice-btn').forEach(node => {
            node.disabled = true;
          });
          btn.classList.add('choice-picked');
          if (choice.flag_key) {
            State.setFlag(choice.flag_key, choice.flag_value ?? true);
            if (typeof window.refreshGameHUD === 'function') {
              window.refreshGameHUD();
            }
          }
          showChoiceToast(choice.text, describeChoiceImpact(choice), 'toast-impact');
          setTimeout(() => {
            box.classList.add('hidden');
            if (onChoose) onChoose(choice);
          }, 180);
        });
        list.appendChild(btn);
      });

      box.classList.remove('hidden');
    },

    /**
     * 조사 우선순위 모드.
     * @param {Array}  choices          - 선택지 배열 (priority_cost, next_dialogue 포함)
     * @param {number} budget           - 허용 조사 횟수
     * @param {Object} priorityDialogues - { [next_dialogue key]: dialogue[] }
     * @param {Function} onDone         - 예산 소진 또는 전부 선택 시 호출
     */
    showPriority(scene, onDone) {
      const choices = scene.choices || [];
      const budget = scene.priority_budget || 0;
      const priorityDialogues = scene.priority_dialogues || {};
      let spent = 0;
      const picked = new Set();

      const renderChoices = () => {
        const remaining = choices
          .filter(c => !picked.has(c.order))
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        if (remaining.length === 0 || spent >= budget) {
          elBox().classList.add('hidden');
          elList().innerHTML = '';
          if (onDone) onDone();
          return;
        }

        const box  = elBox();
        const list = elList();
        list.innerHTML = '';

        const meta = buildPriorityMeta(scene, budget - spent);
        const header = document.createElement('div');
        header.className = 'priority-header';
        header.innerHTML = `
          <div class="priority-kicker">${meta.kicker}</div>
          <div class="priority-title">${meta.title}</div>
          <div class="priority-hint">${meta.hint}</div>
        `;
        list.appendChild(header);

        const indicator = document.createElement('div');
        indicator.className = 'priority-indicator';
        indicator.textContent = meta.indicator;
        list.appendChild(indicator);

        remaining.forEach(choice => {
          const btn = document.createElement('button');
          btn.className = `choice-btn priority-choice ${getChoiceType(choice, true)}`;
          btn.textContent = choice.text;
          btn.addEventListener('click', () => {
            list.querySelectorAll('.choice-btn').forEach(n => { n.disabled = true; });
            btn.classList.add('choice-picked');
            if (choice.flag_key) {
              State.setFlag(choice.flag_key, choice.flag_value ?? true);
              if (typeof window.refreshGameHUD === 'function') {
                window.refreshGameHUD();
              }
            }
            showChoiceToast(choice.text, describeChoiceImpact(choice, true), 'toast-impact');
            picked.add(choice.order);
            spent += choice.priority_cost != null ? choice.priority_cost : 1;
            setTimeout(() => {
              box.classList.add('hidden');
              const branchLines = (priorityDialogues || {})[choice.next_dialogue || ''] || [];
              if (branchLines.length > 0) {
                Dialogue.start(branchLines, renderChoices, null);
              } else {
                renderChoices();
              }
            }, 180);
          });
          list.appendChild(btn);
        });

        box.classList.remove('hidden');
      };

      renderChoices();
    },

    hide() {
      elList().innerHTML = '';
      elBox().classList.add('hidden');
    },

    isVisible() {
      return !elBox().classList.contains('hidden');
    }
  };
})();
