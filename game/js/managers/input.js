/**
 * input.js — Handles all keyboard and mouse input events.
 */
const InputManager = (() => {
  let _titleVisible = false;

  function init() {
    document.addEventListener('keydown', _handleKeyDown);
    console.log('[InputManager] Initialized');
  }

  function setTitleVisible(visible) {
    _titleVisible = visible;
  }

  function _handleKeyDown(e) {
    if (_titleVisible) {
      if (e.code === 'Escape' && Settings.isPanelOpen()) {
        e.preventDefault();
        Settings.hidePanel();
        return;
      }
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        Settings.isPanelOpen() ? Settings.hidePanel() : Settings.showPanel();
        return;
      }
      return;
    }

    // 1. Common Panel Escapes
    if (e.code === 'Escape') {
      if (Save.isPanelOpen()) {
        e.preventDefault();
        Save.hidePanel();
        return;
      }
      if (Settings.isPanelOpen()) {
        e.preventDefault();
        Settings.hidePanel();
        return;
      }
      if (Evidence.isOpen()) {
        e.preventDefault();
        Evidence.hide();
        return;
      }
    }

    // 2. Toggles & Actions
    if (Choice.isVisible()) return;

    // Memo (M)
    if (e.key === 'm' || e.key === 'M') {
      if (Save.isPanelOpen() || Settings.isPanelOpen()) return;
      e.preventDefault();
      const btn = document.getElementById('memo-btn');
      if (btn) btn.click();
      return;
    }

    // Settings (O)
    if (e.key === 'o' || e.key === 'O') {
      if (Save.isPanelOpen()) return;
      e.preventDefault();
      Settings.isPanelOpen() ? Settings.hidePanel() : Settings.showPanel();
      return;
    }

    if (Save.isPanelOpen() || Settings.isPanelOpen() || Evidence.isOpen()) return;

    // Quick Save (S)
    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      Save.save(false);
      return;
    }

    // Quick Load (L)
    if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      Save.load();
      return;
    }

    // Skip (X)
    if (e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      Dialogue.toggleSkip();
      return;
    }

    // Auto (A)
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      Dialogue.toggleAuto();
      return;
    }
  }

  function isTitleVisible() {
    return _titleVisible;
  }

  return {
    init,
    setTitleVisible,
    isTitleVisible
  };
})();
