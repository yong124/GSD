/**
 * ui.js — Manages all HUD, Banner, and Overlay updates.
 */
const UIManager = (() => {
  const $ = id => document.getElementById(id);

  function init() {
    // Reactive updates
    State.on('change', () => {
      applyStateMood();
      // We don't have the current scene context here, 
      // so we use a flag or just update mood/state readout.
      _updateHUDStatsOnly();
    });

    State.on('evidence:added', () => _updateHUDStatsOnly());

    console.log('[UIManager] Initialized');
  }

  function _updateHUDStatsOnly() {
    const evidenceEl = $('hud-evidence-count');
    const stateEl = $('hud-state-readout');
    if (evidenceEl) evidenceEl.textContent = `단서 ${State.getEvidence().length}건`;
    if (stateEl) stateEl.textContent = _getStateReadout();
  }

  /**
   * Update the in-game HUD with scene and state data.
   */
  function updateHUD(scene, hudContext = null) {
    const titleEl = $('hud-scene-title');
    const chapterEl = $('hud-chapter');
    const evidenceEl = $('hud-evidence-count');
    const stateEl = $('hud-state-readout');
    const focusRow = $('hud-focus-row');
    const focusKicker = $('hud-focus-kicker');
    const focusText = $('hud-focus-text');
    const container = $(Config.SELECTORS.GAME_CONTAINER);

    if (!titleEl || !container) return;

    titleEl.textContent = scene?.title || '';
    chapterEl.textContent = scene?.chapter ? `CHAPTER ${scene.chapter}` : '';
    evidenceEl.textContent = `단서 ${State.getEvidence().length}건`;
    stateEl.textContent = _getStateReadout();

    focusRow.classList.toggle('hidden', !hudContext);
    focusKicker.textContent = hudContext?.kicker || '';
    focusText.textContent = hudContext?.text || '';
    container.classList.toggle('hud-priority-active', hudContext?.mode === 'priority');

    applyStateMood();
  }

  function _getStateReadout() {
    const parts = [];
    const resonance = Number(State.getFlag('ResonanceLevel') || 0);
    const trust = Number(State.getFlag('SongsoonTrust') || 0);
    const investigation = Number(State.getFlag('InvestigationScore') || 0);

    if (investigation >= 3) parts.push('조사 집착');
    else if (investigation >= 1) parts.push('조사 진행');

    if (trust >= 2) parts.push('송순 신뢰');
    else if (trust >= 1) parts.push('동행 유지');

    if (resonance >= 2) parts.push('침식 짙음');
    else if (resonance >= 1) parts.push('침식 전조');

    return parts.join(' · ') || '추적 중';
  }

  function applyStateMood() {
    const container = $(Config.SELECTORS.GAME_CONTAINER);
    const resonance = Number(State.getFlag('ResonanceLevel') || 0);
    const trust = Number(State.getFlag('SongsoonTrust') || 0);
    if (!container) return;

    container.classList.remove('state-resonance-low', 'state-resonance-high', 'state-trust-high');

    if (resonance >= 2) container.classList.add('state-resonance-high');
    else if (resonance >= 1) container.classList.add('state-resonance-low');

    if (trust >= 2) container.classList.add('state-trust-high');
  }

  function showBanner(scene) {
    const el = $('scene-banner');
    const kicker = $('scene-banner-kicker');
    const title = $('scene-banner-title');
    if (!el || !scene?.title) return;

    kicker.textContent = scene.chapter ? `CHAPTER ${scene.chapter}` : 'INVESTIGATION';
    title.textContent = scene.title;

    el.classList.remove('hidden');
    el.classList.add('show');

    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hidden');
    }, Config.TRANSITION.SCENE_BANNER);
  }

  function showGoal(goalData) {
    const el = $('scene-goal');
    const kicker = $('scene-goal-kicker');
    const text = $('scene-goal-text');
    if (!el || !goalData) return;

    kicker.textContent = goalData.kicker;
    text.textContent = goalData.text;

    el.classList.remove('hidden');
    el.classList.add('show');

    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hidden');
    }, Config.TRANSITION.SCENE_BANNER);
  }

  function showToast(message, type = 'save') {
    const el = $('system-toast');
    if (!el) return;

    el.textContent = message;
    el.className = `toast-${type} show`;

    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.classList.remove('show');
    }, Config.TRANSITION.SYSTEM_TOAST);
  }

  function setDialogueBoxVisible(visible) {
    const el = $(Config.SELECTORS.DIALOGUE_BOX);
    if (el) el.classList.toggle('hidden', !visible);
  }

  function setDialogue(speaker, text, portrait = null) {
    const elSpeaker = $('speaker-name');
    const elText = $('dialogue-text');
    const elPortrait = $('portrait-img');

    if (elSpeaker) elSpeaker.textContent = speaker || '';
    if (elText) elText.textContent = text || '';
    if (elPortrait) {
      if (portrait) {
        elPortrait.src = portrait;
        elPortrait.classList.remove('hidden');
      } else {
        elPortrait.classList.add('hidden');
      }
    }
  }

  function setClickHintVisible(visible) {
    const el = $('click-hint');
    if (el) el.classList.toggle('hidden-hint', !visible);
  }

  function showChapterCard(chapter, title, onDone) {
    const card = $('chapter-card');
    const num = $('chapter-number');
    const tit = $('chapter-title');
    if (!card) return;

    if (num) num.textContent = `CHAPTER ${chapter}`;
    if (tit) tit.textContent = title;
    
    card.classList.remove('hidden');
    card.classList.add('show');

    setTimeout(() => {
      card.classList.remove('show');
      card.classList.add('hidden');
      if (onDone) onDone();
    }, 2800);
  }

  function setStandingSlot(slotIndex, data, isFocus, isDim, motionClass) {
    const slotEl = document.querySelector(`.standing-slot[data-slot="${slotIndex}"]`);
    if (!slotEl) return;

    const img = slotEl.querySelector('.standing-img');
    slotEl.classList.toggle('is-visible', !!data);
    slotEl.classList.toggle('is-focus', !!isFocus);
    slotEl.classList.toggle('is-dim', !!isDim);

    if (data && img) {
      img.src = data.image || '';
      img.alt = data.name || '';
    }

    if (motionClass) {
      slotEl.classList.add(motionClass);
      setTimeout(() => slotEl.classList.remove(motionClass), 600);
    }
  }

  function clearStandingAll() {
    document.querySelectorAll('.standing-slot').forEach(slot => {
      slot.classList.remove('is-visible', 'is-focus', 'is-dim');
      const img = slot.querySelector('.standing-img');
      if (img) img.removeAttribute('src');
    });
  }

  function renderChoiceList(choices, onPick, meta = null) {
    const list = $('choice-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (meta) {
      if (meta.kicker || meta.title || meta.hint) {
        const header = document.createElement('div');
        header.className = 'priority-header';
        header.innerHTML = `
          <div class="priority-kicker">${meta.kicker || ''}</div>
          <div class="priority-title">${meta.title || ''}</div>
          <div class="priority-hint">${meta.hint || ''}</div>
        `;
        list.appendChild(header);
      }
      if (meta.indicator) {
        const indicator = document.createElement('div');
        indicator.className = 'priority-indicator';
        indicator.textContent = meta.indicator;
        list.appendChild(indicator);
      }
    }

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = `choice-btn ${choice.type || 'choice-decision'}`;
      btn.textContent = choice.text;
      
      btn.addEventListener('click', () => {
        list.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
        btn.classList.add('choice-picked');
        onPick(choice, btn);
      });
      list.appendChild(btn);
    });
  }

  function setChoiceBoxVisible(visible) {
    const el = $(Config.SELECTORS.CHOICE_BOX);
    if (el) el.classList.toggle('hidden', !visible);
  }

  function setPanelVisible(selectorId, visible) {
    const el = $(selectorId);
    if (el) el.classList.toggle('hidden', !visible);
  }

  function renderSaveSlotList(slots, onPick, title, subtitle) {
    const list = $('slot-list');
    const elTitle = $('slot-panel-title');
    const elSubtitle = $('slot-panel-subtitle');
    if (!list) return;

    if (elTitle) elTitle.textContent = title || '';
    if (elSubtitle) elSubtitle.textContent = subtitle || '';
    
    list.innerHTML = '';
    slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.className = `slot-btn ${slot.isEmpty ? 'slot-empty' : ''} ${slot.isLastUsed ? 'slot-last-used' : ''}`;
      
      const tagHtml = slot.isLastUsed ? '<span class="slot-tag">자동저장</span>' : '';
      if (!slot.isEmpty) {
        btn.innerHTML = `
          <span class="slot-name">슬롯 ${slot.number}  ·  CH${slot.chapter}  ${slot.sceneTitle}${tagHtml}</span>
          <span class="slot-info">${slot.timeText || ''}</span>
        `;
      } else {
        btn.innerHTML = `
          <span class="slot-name">슬롯 ${slot.number}${tagHtml}</span>
          <span class="slot-info">비어있음</span>
        `;
        if (slot.isDisabled) {
          btn.disabled = true;
          btn.style.opacity = '0.4';
        }
      }

      btn.addEventListener('click', () => onPick(slot.number));
      list.appendChild(btn);
    });
  }

  function updateMemoBadge(unreadCount) {
    const btn = $('memo-btn');
    const badge = $('memo-badge');
    if (!btn || !badge) return;

    btn.classList.toggle('has-unread', unreadCount > 0);
    badge.classList.toggle('hidden', unreadCount === 0);
    badge.textContent = unreadCount > 9 ? '9+' : String(unreadCount);
  }

  function renderMemo(groups) {
    const list = $('memo-list');
    const meta = $('memo-meta');
    if (!list) return;

    if (meta) {
      const totalCount = groups.reduce((acc, g) => acc + g.items.length, 0);
      meta.textContent = totalCount === 0 ? '추적 중인 흔적이 없습니다.' : `분별된 흔적 ${totalCount}건`;
    }

    if (groups.length === 0) {
      list.innerHTML = '<div class="memo-empty">아직 획득한 단서가 없습니다.</div>';
      return;
    }

    list.innerHTML = groups.map(group => {
      const itemsHtml = group.items.map(ev => {
        const imgHtml = ev.image ? `<img class="memo-item-img" src="${ev.image}" alt="${ev.name}">` : '';
        const unreadClass = ev.isRead ? '' : ' memo-item-unread';
        return `
          <div class="memo-item${unreadClass}">
            ${imgHtml}
            <div class="memo-item-name">${ev.name}</div>
            <div class="memo-item-desc">${ev.description}</div>
          </div>`;
      }).join('');

      return `
        <section class="memo-group">
          <div class="memo-group-header">
            <div class="memo-group-title">${group.title}</div>
            <div class="memo-group-hint">${group.hint}</div>
          </div>
          ${itemsHtml}
        </section>`;
    }).join('');
  }

  function renderNotebook(data, activeTab, handlers = {}) {
    const list = $('memo-list');
    const meta = $('memo-meta');
    const tabButtons = Array.from(document.querySelectorAll('#memo-tabs .memo-tab'));
    if (!list) return;

    if (meta) {
      meta.textContent = data?.metaText || '';
    }

    tabButtons.forEach(btn => {
      const isActive = btn.dataset.tab === activeTab;
      btn.classList.toggle('is-active', isActive);
      btn.onclick = () => {
        if (!isActive && handlers.onTabChange) handlers.onTabChange(btn.dataset.tab);
      };
    });

    if (activeTab === 'status') {
      const cards = (data?.statusCards || []).map(card => `
        <div class="status-card">
          <div class="status-label">${card.label}</div>
          <div class="status-value">${card.value}</div>
          <div class="status-detail">${card.detail || ''}</div>
        </div>
      `).join('');

      const goalHtml = data?.goal?.text ? `
        <div class="notebook-goal">
          <div class="notebook-goal-kicker">${data.goal.kicker || '현재 목표'}</div>
          <div class="notebook-goal-text">${data.goal.text}</div>
        </div>
      ` : '';

      list.innerHTML = `
        <section class="notebook-pane">
          <div class="memo-section-title">현재 상태</div>
          <div class="status-grid">${cards}</div>
          ${goalHtml}
        </section>
      `;
      return;
    }

    if (activeTab === 'characters') {
      const cards = (data?.characters || []).map(character => `
        <article class="character-card">
          <div class="character-card-header">
            <div class="character-name">${character.name}</div>
            <div class="character-role">${character.role}</div>
          </div>
          <div class="character-state">${character.state}</div>
          <div class="character-facts">
            ${(character.facts || []).map(fact => `<div class="character-fact">${fact}</div>`).join('')}
          </div>
        </article>
      `).join('');

      list.innerHTML = cards
        ? `<section class="notebook-pane"><div class="memo-section-title">관계 인물</div><div class="character-grid">${cards}</div></section>`
        : '<div class="memo-empty">정리된 인물 정보가 없습니다.</div>';
      return;
    }

      if (activeTab === 'questions') {
      const questions = data?.questions || [];
      if (questions.length === 0) {
        list.innerHTML = '<div class="memo-empty">현재 정리된 질문이 없습니다.</div>';
        return;
      }

      const selectedQuestion = questions.find(item => item.questionId === data?.selectedQuestionId) || questions[0];
      const selectedEvidenceIds = data?.selectedQuestionEvidenceIds || [];
      const questionCards = questions.map(item => `
        <button class="question-card question-select ${item.questionId === selectedQuestion?.questionId ? 'is-selected' : ''}" data-question-id="${item.questionId}">
          <div class="question-title">${item.title}</div>
          <div class="question-state ${item.isSolved ? 'is-solved' : ''}">${item.state}</div>
          <div class="question-detail">${item.detail}</div>
        </button>
      `).join('');

      const isContradictionQuestion = selectedQuestion?.resolutionType === 'Contradiction';
      const isConnectionQuestion = !isContradictionQuestion && (((selectedQuestion?.solutionEvidenceIds || []).length > 1) || selectedQuestion?.solutionMode === 'All');
      const evidenceOptions = (selectedQuestion?.ownedEvidence || []).map(item => `
        <button class="question-evidence-btn ${selectedEvidenceIds.includes(item.evidenceId) ? 'is-selected' : ''}" data-question-id="${selectedQuestion.questionId}" data-evidence-id="${item.evidenceId}">
          <span class="question-evidence-name">${item.name}</span>
          <span class="question-evidence-tag">${isContradictionQuestion ? '반박' : (isConnectionQuestion ? '연결' : '제출')}</span>
        </button>
      `).join('');

      const relatedEvidence = (selectedQuestion?.relatedEvidence || []).map(item => `
        <span class="question-chip ${item.isOwned ? 'is-owned' : 'is-missing'}">${item.name}</span>
      `).join('');

      const resolutionHtml = selectedQuestion ? `
        <section class="question-resolution">
          <div class="memo-section-title">질문 정리</div>
          <div class="question-resolution-title">${selectedQuestion.title}</div>
          <div class="question-resolution-state ${selectedQuestion.isSolved ? 'is-solved' : ''}">${selectedQuestion.state}</div>
          <div class="question-resolution-detail">${selectedQuestion.isSolved && selectedQuestion.resolvedDetail ? selectedQuestion.resolvedDetail : selectedQuestion.detail}</div>
          ${isContradictionQuestion && !selectedQuestion.isSolved ? `
            <div class="question-contradiction-card">
              <div class="question-contradiction-kicker">${selectedQuestion.contradictionPrompt || '모순 판별'}</div>
              <div class="question-contradiction-statement">${selectedQuestion.contradictionStatement || ''}</div>
            </div>
          ` : ''}
          <div class="question-resolution-subtitle">관련 단서</div>
          <div class="question-chip-list">${relatedEvidence || '<span class="question-chip is-missing">연결 단서 없음</span>'}</div>
          <div class="question-resolution-subtitle">${isContradictionQuestion ? '모순을 드러낼 근거 제시' : (isConnectionQuestion ? '보유 단서를 연결해 정리' : '보유 단서로 정리')}</div>
          ${selectedQuestion.isSolved
            ? '<div class="question-resolution-empty">이미 정리한 질문입니다.</div>'
            : (evidenceOptions
              ? `<div class="question-evidence-list">${evidenceOptions}</div>${isConnectionQuestion ? `
                <button class="question-commit-btn" data-question-id="${selectedQuestion.questionId}">
                  선택한 단서를 근거로 질문 정리
                </button>
              ` : ''}`
              : '<div class="question-resolution-empty">아직 이 질문을 정리할 단서를 확보하지 못했습니다.</div>')}
        </section>
      ` : '';

      list.innerHTML = `
        <section class="notebook-pane">
          <div class="memo-section-title">남은 질문</div>
          <div class="question-list">${questionCards}</div>
        </section>
        ${resolutionHtml}
      `;

      list.querySelectorAll('.question-select').forEach(btn => {
        btn.addEventListener('click', () => handlers.onQuestionSelect?.(btn.dataset.questionId));
      });
      list.querySelectorAll('.question-evidence-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (isConnectionQuestion) {
            handlers.onQuestionEvidenceToggle?.(btn.dataset.questionId, btn.dataset.evidenceId);
          } else {
            handlers.onQuestionSubmit?.(btn.dataset.questionId, btn.dataset.evidenceId);
          }
        });
      });
      list.querySelectorAll('.question-commit-btn').forEach(btn => {
        btn.addEventListener('click', () => handlers.onQuestionEvidenceCommit?.(btn.dataset.questionId));
      });
      return;
    }

    renderMemo(data?.evidenceGroups || []);
  }

  return {
    init,
    updateHUD,
    applyStateMood,
    showBanner,
    showGoal,
    showToast,
    setDialogue,
    setDialogueBoxVisible,
    setClickHintVisible,
    setStandingSlot,
    clearStandingAll,
    renderChoiceList,
    setChoiceBoxVisible,
    setPanelVisible,
    renderSaveSlotList,
    updateMemoBadge,
    renderMemo,
    renderNotebook,
    showChapterCard
  };
})();
