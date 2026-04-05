const Save = (() => {
  const SLOT_COUNT = 3;
  const SAVE_KEY = n => `gyeongseong_save_${n}`;

  function getSlotInfo(n) {
    const raw = localStorage.getItem(SAVE_KEY(n));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.currentSceneId) return null;
      return {
        sceneId: parsed.currentSceneId || '',
        chapter: parsed.chapter || 1,
        timestamp: parsed.timestamp || '',
        state: raw,
      };
    } catch { return null; }
  }

  function getSavableState() {
    const state = State.dump();
    return state && state.currentSceneId ? state : null;
  }

  function formatTimestamp(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${min}`;
  }

  function getSceneTitle(sceneId) {
    const scenes = window.GAME_DATA?.scenes || {};
    return scenes[sceneId]?.title || sceneId || '';
  }

  let _pendingAction = null;

  function handleSlotClick(n) {
    if (_pendingAction === 'save') {
      const state = getSavableState();
      if (!state) {
        UIManager.showToast('장면이 시작된 뒤에 저장할 수 있습니다.', 'toast-save');
        hidePanel();
        return;
      }
      state.timestamp = new Date().toISOString();
      localStorage.setItem(SAVE_KEY(n), JSON.stringify(state));
      localStorage.setItem('gyeongseong_last_slot', n);
      UIManager.showToast(`슬롯 ${n}번에 저장을 완료했습니다.`, 'toast-save');
    } else {
      const info = getSlotInfo(n);
      if (info && info.state) {
        State.deserialize(info.state);
        localStorage.setItem('gyeongseong_last_slot', n);
        UIManager.showToast(`슬롯 ${n}번 기록을 불러왔습니다.`, 'toast-save');
        document.dispatchEvent(new Event('game:loaded'));
        Scene.load(State.currentSceneId, null, { restoreProgress: true });
      }
    }
    hidePanel();
  }

  function showSlotPanel(action) {
    _pendingAction = action;
    const lastSlot = parseInt(localStorage.getItem('gyeongseong_last_slot') || '1', 10);
    const title = action === 'save' ? '저장 슬롯 선택' : '불러오기 슬롯 선택';
    const subtitle = action === 'save'
      ? `마지막 자동저장 슬롯은 ${lastSlot}번입니다. 원하는 위치에 현재 진행을 남길 수 있습니다.`
      : `마지막 자동저장 슬롯은 ${lastSlot}번입니다. 저장된 지점으로 진행을 되돌립니다.`;

    const slotsData = [];
    for (let n = 1; n <= SLOT_COUNT; n++) {
      const info = getSlotInfo(n);
      slotsData.push({
        number: n,
        isEmpty: !info,
        isLastUsed: n === lastSlot,
        isDisabled: action === 'load' && !info,
        chapter: info?.chapter || 1,
        sceneTitle: getSceneTitle(info?.sceneId),
        timeText: formatTimestamp(info?.timestamp)
      });
    }

    UIManager.renderSaveSlotList(slotsData, handleSlotClick, title, subtitle);
    UIManager.setPanelVisible(Config.SELECTORS.SLOT_PANEL, true);
    UIManager.setPanelVisible('slot-overlay', true);
  }

  function hidePanel() {
    UIManager.setPanelVisible(Config.SELECTORS.SLOT_PANEL, false);
    UIManager.setPanelVisible('slot-overlay', false);
    _pendingAction = null;
  }

  return {
    init() {
      const saveBtn = document.getElementById('save-btn');
      const loadBtn = document.getElementById('load-btn');
      const closeBtn = document.getElementById('slot-panel-close');
      const cancelBtn = document.getElementById('slot-cancel');
      const overlay = document.getElementById('slot-overlay');

      if (saveBtn) saveBtn.addEventListener('click', () => Save.save(false));
      if (loadBtn) loadBtn.addEventListener('click', () => Save.load());
      if (closeBtn) closeBtn.addEventListener('click', hidePanel);
      if (cancelBtn) cancelBtn.addEventListener('click', hidePanel);
      if (overlay) overlay.addEventListener('click', hidePanel);

      console.log('[Save] Initialized');
    },

    save(silent = false) {
      if (silent) {
        const state = getSavableState();
        if (!state) return;
        const lastSlot = localStorage.getItem('gyeongseong_last_slot') || '1';
        state.timestamp = new Date().toISOString();
        localStorage.setItem(SAVE_KEY(lastSlot), JSON.stringify(state));
        return;
      }
      if (!getSavableState()) {
        UIManager.showToast('장면이 시작된 뒤에 저장할 수 있습니다.', 'toast-save');
        return;
      }
      showSlotPanel('save');
    },

    load() {
      showSlotPanel('load');
    },

    hasSave() {
      for (let n = 1; n <= SLOT_COUNT; n++) {
        if (localStorage.getItem(SAVE_KEY(n))) return true;
      }
      return false;
    },

    clear() {
      for (let n = 1; n <= SLOT_COUNT; n++) {
        localStorage.removeItem(SAVE_KEY(n));
      }
      localStorage.removeItem('gyeongseong_last_slot');
    },

    isPanelOpen() {
      const el = document.getElementById(Config.SELECTORS.SLOT_PANEL);
      return el && !el.classList.contains('hidden');
    },

    hidePanel
  };
})();
