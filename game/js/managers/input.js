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
    if (_titleVisible) return;

    // 1. Common Panel Escapes
    if (e.code === 'Escape') {
      if (Save.isPanelOpen()) {
        e.preventDefault();
        Save.hidePanel();
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
      if (Save.isPanelOpen()) return;
      e.preventDefault();
      const btn = document.getElementById('memo-btn');
      if (btn) btn.click();
      return;
    }

    if (Save.isPanelOpen() || Evidence.isOpen()) return;

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
