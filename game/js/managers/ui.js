/**
 * ui.js - Manages HUD, banner, overlays, and notebook panels.
 */
const UIManager = (() => {
  const $ = id => document.getElementById(id);
  const _gaugeListeners = new Map();

  function getGaugeDefinitions() {
    return Array.isArray(window.GAME_DATA?.gauges) ? window.GAME_DATA.gauges : [];
  }

  function getGaugeDefinition(gaugeId) {
    return getGaugeDefinitions().find(gauge => gauge?.gauge_id === gaugeId) || null;
  }

  function getGaugeStateRows(gaugeId) {
    return (window.GAME_DATA?.gauge_states || []).filter(row => row?.gauge_id === gaugeId);
  }

  function getGaugeStateForValue(gaugeId, value) {
    return getGaugeStateRows(gaugeId).find(row => {
      const minValue = Number(row?.min_value);
      const maxValue = Number(row?.max_value);
      return value >= minValue && value <= maxValue;
    }) || null;
  }

  function getGaugePercent(gauge, value) {
    const minValue = Number(gauge?.min_value || 0);
    const maxValue = Number(gauge?.max_value || 0);
    if (maxValue <= minValue) return 0;
    return Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));
  }

  function bindGaugeListeners() {
    _gaugeListeners.forEach((listener, gaugeId) => {
      State.off(`change:gauge:${gaugeId}`, listener);
    });
    _gaugeListeners.clear();

    getGaugeDefinitions().forEach(gauge => {
      const gaugeId = gauge?.gauge_id;
      if (!gaugeId) return;
      const listener = value => updateGaugeHUD(gaugeId, value);
      _gaugeListeners.set(gaugeId, listener);
      State.on(`change:gauge:${gaugeId}`, listener);
    });
  }

  function init() {
    bindGaugeListeners();
    State.on('change', () => {
      applyStateMood();
      _updateHUDStatsOnly();
    });
    State.on('evidence:added', () => _updateHUDStatsOnly());
    State.on('loaded', () => {
      bindGaugeListeners();
      updateGaugeHUD();
    });
    State.on('reset', () => {
      bindGaugeListeners();
      updateGaugeHUD();
    });

    document.addEventListener('keydown', e => {
      if (e.code === 'Escape' && isEvidenceInventoryVisible()) {
        e.preventDefault();
        hideEvidenceInventory();
        setChoiceBoxVisible(false);
      }
    });

    const closeBtn = $('evidence-inventory-close');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      hideEvidenceInventory();
      setChoiceBoxVisible(false);
    });

    const backdrop = $('evidence-inventory-backdrop');
    if (backdrop) backdrop.addEventListener('click', () => {
      hideEvidenceInventory();
      setChoiceBoxVisible(false);
    });

    console.log('[UIManager] Initialized');
  }

  function _updateHUDStatsOnly() {
    const evidenceEl = $('hud-evidence-count');
    const stateEl = $('hud-state-readout');
    if (evidenceEl) evidenceEl.textContent = `단서 ${State.getEvidence().length}건`;
    if (stateEl) stateEl.textContent = _getStateReadout();
  }

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

    if (focusRow) focusRow.classList.toggle('hidden', !hudContext);
    if (focusKicker) focusKicker.textContent = hudContext?.kicker || '';
    if (focusText) focusText.textContent = hudContext?.text || '';
    container.classList.toggle('hud-priority-active', hudContext?.mode === 'priority');

    renderGaugeHUD();
    applyStateMood();
  }

  function getVisibleGaugeRows() {
    return getGaugeDefinitions()
      .filter(gauge => gauge?.hud_visible)
      .sort((a, b) => Number(a?.hud_order || 0) - Number(b?.hud_order || 0))
      .map(gauge => {
        const value = Number(State.getGauge?.(gauge.gauge_id) ?? gauge.default_value ?? 0);
        const currentState = getGaugeStateForValue(gauge.gauge_id, value);
        return { gauge, value, currentState, pct: getGaugePercent(gauge, value) };
      });
  }

  function getGaugeDisplayLabel(gauge) {
    if (!gauge) return '';
    if (gauge.gauge_id === 'Credibility') return '\ud3c9\ud310';
    return gauge.label || gauge.gauge_id || '';
  }

  function getGaugeStateDisplayLabel(gaugeId, state, value = 0) {
    if (gaugeId === 'Credibility') {
      const numericValue = Number(value || 0);
      if (numericValue <= 0) return '\uc2e4\uac01';
      if (numericValue <= 2) return '\ud754\ub4e4\ub9bc';
      return '\uc548\uc815';
    }
    return state?.label || '';
  }

  function renderGaugeHUD() {
    const container = $('hud-gauges');
    const gameContainer = $(Config.SELECTORS.GAME_CONTAINER);
    const titleScreen = $('title-screen');
    if (!container || !gameContainer) return;

    const rows = getVisibleGaugeRows();
    const titleVisible = titleScreen && !titleScreen.classList.contains('hidden');
    container.innerHTML = rows.map(row => `
      <div class="hud-gauge-card" data-gauge-id="${row.gauge.gauge_id}">
        <span class="hud-gauge-label">${getGaugeDisplayLabel(row.gauge)}</span>
        <div class="hud-gauge-bar">
          <div class="hud-gauge-fill" style="width:${row.pct}%; background:${row.currentState?.hud_color || '#6a9f6a'}"></div>
        </div>
        <span class="hud-gauge-value">
          <span class="hud-gauge-status">${getGaugeStateDisplayLabel(row.gauge.gauge_id, row.currentState, row.value)}</span>
          ${row.value}/${Number(row.gauge.max_value ?? 0)}
        </span>
      </div>
    `).join('');
    gameContainer.classList.toggle('hud-hidden', !!titleVisible);
  }

  function updateGaugeHUD(gaugeId = null, value = null, previousState = null, nextState = null) {
    const container = $('hud-gauges');
    const titleScreen = $('title-screen');
    const gameContainer = $(Config.SELECTORS.GAME_CONTAINER);
    const titleVisible = titleScreen && !titleScreen.classList.contains('hidden');

    if (!container || !gameContainer) return;

    if (!gaugeId || !container.querySelector(`[data-gauge-id="${gaugeId}"]`)) {
      renderGaugeHUD();
    } else {
      const gauge = getGaugeDefinition(gaugeId);
      if (!gauge?.hud_visible) return;

      const nextValue = Number(value ?? State.getGauge?.(gaugeId) ?? gauge.default_value ?? 0);
      const currentState = nextState || getGaugeStateForValue(gaugeId, nextValue);
      const gaugeEl = container.querySelector(`[data-gauge-id="${gaugeId}"]`);
      if (!gaugeEl) {
        renderGaugeHUD();
      } else {
        const fill = gaugeEl.querySelector('.hud-gauge-fill');
        const status = gaugeEl.querySelector('.hud-gauge-status');
        const valueEl = gaugeEl.querySelector('.hud-gauge-value');
        const stateText = getGaugeStateDisplayLabel(gaugeId, currentState, nextValue);
        if (fill) {
          fill.style.width = `${getGaugePercent(gauge, nextValue)}%`;
          fill.style.background = currentState?.hud_color || '#6a9f6a';
        }
        if (status) status.textContent = stateText;
        if (valueEl) valueEl.innerHTML = `<span class="hud-gauge-status">${stateText}</span>${nextValue}/${Number(gauge.max_value ?? 0)}`;
      }
    }

    gameContainer.classList.toggle('hud-hidden', !!titleVisible);

    if (nextState && (previousState?.label || '') !== (nextState?.label || '')) {
      const gauge = getGaugeDefinition(gaugeId);
      const gaugeLabel = gauge?.label || gaugeId || '게이지';
      const prevLabel = previousState?.label || '이전';
      const nextLabel = nextState?.label || '현재';
      showToast(`[${gaugeLabel}] 상태 변화: ${prevLabel} -> ${nextLabel}`, 'toast-impact');
    }
  }

  function _getStateReadout() {
    const parts = [];
    const erosion = Number(State.getGauge?.('Erosion') || State.getFlag('ResonanceLevel') || 0);
    const trust = Number(State.getTrust?.('Songsoon') || State.getFlag('SongsoonTrust') || 0);
    const credibility = Number(State.getGauge?.('Credibility') || State.getFlag('InvestigationScore') || 0);

    if (credibility >= 3) parts.push('조사 진척');
    else if (credibility >= 1) parts.push('조사 진행');

    if (trust >= 2) parts.push('속순 신뢰');
    else if (trust >= 1) parts.push('동행 유지');

    if (erosion >= 2) parts.push('침식 심화');
    else if (erosion >= 1) parts.push('침식 전조');

    return parts.join(' · ') || '추적 중';
  }

  function applyStateMood() {
    const container = $(Config.SELECTORS.GAME_CONTAINER);
    const resonance = Number(State.getFlag('ResonanceLevel') || State.getGauge?.('Erosion') || 0);
    const trust = Number(State.getFlag('SongsoonTrust') || State.getTrust?.('Songsoon') || 0);
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
      btn.textContent = choice.text || choice.evidence_id || '';
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

  function showEvidenceInventory(entries, meta, onPick) {
    const panel = $('evidence-inventory');
    const backdrop = $('evidence-inventory-backdrop');
    const list = $('evidence-inventory-list');
    const title = $('evidence-inventory-title');
    const hint = $('evidence-inventory-hint');
    const detailImg = $('evidence-inventory-detail-img');
    const detailNoImg = $('evidence-inventory-detail-no-img');
    const detailTitle = $('evidence-inventory-detail-title');
    const detailDesc = $('evidence-inventory-detail-desc');
    const submitBtn = $('evidence-inventory-submit');
    if (!panel || !list) return;

    if (title) title.textContent = meta?.title || '증거 제시';
    if (hint) hint.textContent = meta?.hint || '';

    let selectedId = entries && entries.length > 0 ? entries[0].evidence_id : null;

    function selectEntry(id) {
      selectedId = id;
      list.querySelectorAll('.inventory-list-item').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.evidenceId === id);
      });
      const entry = (entries || []).find(e => e.evidence_id === id);
      if (!entry) return;
      if (detailImg && detailNoImg) {
        if (entry.image) {
          detailImg.src = entry.image;
          detailImg.alt = entry.text;
          detailImg.classList.remove('hidden');
          detailNoImg.classList.add('hidden');
        } else {
          detailImg.classList.add('hidden');
          detailNoImg.classList.remove('hidden');
        }
      }
      if (detailTitle) detailTitle.textContent = entry.text;
      if (detailDesc) detailDesc.textContent = entry.detail || '';
    }

    if (!entries || entries.length === 0) {
      list.innerHTML = '<div class="memo-empty" style="padding:20px 18px">제시할 단서가 없습니다</div>';
      if (detailTitle) detailTitle.textContent = '';
      if (detailDesc) detailDesc.textContent = '';
      if (detailImg) detailImg.classList.add('hidden');
      if (detailNoImg) detailNoImg.classList.remove('hidden');
      if (submitBtn) submitBtn.disabled = true;
    } else {
      list.innerHTML = entries.map(entry => `
        <button class="inventory-list-item" data-evidence-id="${entry.evidence_id}">
          ${entry.image
            ? `<img class="inventory-list-thumb" src="${entry.image}" alt="${entry.text}">`
            : `<span class="inventory-list-no-thumb">◈</span>`}
          <span>${entry.text}</span>
        </button>
      `).join('');
      list.querySelectorAll('.inventory-list-item').forEach(btn => {
        btn.addEventListener('click', () => selectEntry(btn.dataset.evidenceId));
      });
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.onclick = () => { if (selectedId) onPick?.(selectedId); };
      }
      selectEntry(selectedId);
    }

    if (backdrop) backdrop.classList.remove('hidden');
    panel.classList.remove('hidden');
  }

  function hideEvidenceInventory() {
    const panel = $('evidence-inventory');
    const backdrop = $('evidence-inventory-backdrop');
    if (panel) panel.classList.add('hidden');
    if (backdrop) backdrop.classList.add('hidden');
  }

  function isEvidenceInventoryVisible() {
    const panel = $('evidence-inventory');
    return !!panel && !panel.classList.contains('hidden');
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
      const tagHtml = slot.isLastUsed ? '<span class="slot-tag">최근</span>' : '';
      if (!slot.isEmpty) {
        btn.innerHTML = `
          <span class="slot-name">슬롯 ${slot.number} · CH${slot.chapter} ${slot.sceneTitle}${tagHtml}</span>
          <span class="slot-info">${slot.timeText || ''}</span>
        `;
      } else {
        btn.innerHTML = `
          <span class="slot-name">슬롯 ${slot.number}${tagHtml}</span>
          <span class="slot-info">비어 있음</span>
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
      meta.textContent = totalCount === 0 ? '추적 중인 단서가 없습니다.' : `분류된 단서 ${totalCount}건`;
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

    if (meta) meta.textContent = data?.metaText || '';
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
        : '<div class="memo-empty">정리할 인물 정보가 없습니다.</div>';
      return;
    }

    if (activeTab === 'questions') {
      const questions = data?.questions || [];
      if (questions.length === 0) {
        list.innerHTML = '<div class="memo-empty">현재 정리할 질문이 없습니다.</div>';
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
              <div class="question-contradiction-kicker">${selectedQuestion.contradictionPrompt || '모순 제시'}</div>
              <div class="question-contradiction-statement">${selectedQuestion.contradictionStatement || ''}</div>
            </div>
          ` : ''}
          <div class="question-resolution-subtitle">관련 단서</div>
          <div class="question-chip-list">${relatedEvidence || '<span class="question-chip is-missing">연결 단서 없음</span>'}</div>
          <div class="question-resolution-subtitle">${isContradictionQuestion ? '모순을 드러낼 근거 제시' : (isConnectionQuestion ? '보유 단서를 연결해 정리' : '보유 단서로 정리')}</div>
          ${selectedQuestion.isSolved
            ? '<div class="question-resolution-empty">이미 정리된 질문입니다.</div>'
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
          <div class="memo-section-title">현재 질문</div>
          <div class="question-list">${questionCards}</div>
        </section>
        ${resolutionHtml}
      `;

      list.querySelectorAll('.question-select').forEach(btn => {
        btn.addEventListener('click', () => handlers.onQuestionSelect?.(btn.dataset.questionId));
      });
      list.querySelectorAll('.question-evidence-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (isConnectionQuestion) handlers.onQuestionEvidenceToggle?.(btn.dataset.questionId, btn.dataset.evidenceId);
          else handlers.onQuestionSubmit?.(btn.dataset.questionId, btn.dataset.evidenceId);
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
    showChapterCard,
    renderGaugeHUD,
    updateGaugeHUD,
    showEvidenceInventory,
    hideEvidenceInventory,
    isEvidenceInventoryVisible,
  };
})();
