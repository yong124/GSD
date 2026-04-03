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

    if (trust >= 2 || State.getFlag('TrustedSongsoon') === true) parts.push('송순 신뢰');
    else if (trust >= 1) parts.push('동행 유지');

    if (resonance >= 2) parts.push('공명 짙음');
    else if (resonance >= 1) parts.push('공명 전조');

    return parts.join(' · ') || '추적 중';
  }

  function applyStateMood() {
    const container = $(Config.SELECTORS.GAME_CONTAINER);
    const resonance = Number(State.getFlag('ResonanceLevel') || 0);
    const trust = Number(State.getFlag('SongsoonTrust') || 0);
    const trusted = State.getFlag('TrustedSongsoon') === true;

    if (!container) return;

    container.classList.remove('state-resonance-low', 'state-resonance-high', 'state-trust-high');

    if (resonance >= 2) container.classList.add('state-resonance-high');
    else if (resonance >= 1) container.classList.add('state-resonance-low');

    if (trust >= 2 || trusted) container.classList.add('state-trust-high');
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

  return {
    init,
    updateHUD,
    applyStateMood,
    showBanner,
    showGoal,
    showToast
  };
})();
