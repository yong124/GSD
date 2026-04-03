/**
 * localStorage save/load helpers — 3-slot system.
 */
const Save = (() => {
  const SLOT_COUNT = 3;
  const SAVE_KEY = n => `gyeongseong_save_${n}`;

  // 구버전 단일 슬롯 마이그레이션
  function migrateLegacy() {
    const legacy = localStorage.getItem('gyeongseong_save');
    if (!legacy) return;
    if (!localStorage.getItem(SAVE_KEY(1))) {
      localStorage.setItem(SAVE_KEY(1), legacy);
    }
    localStorage.removeItem('gyeongseong_save');
  }

  function showToast(msg, variant = '') {
    const el = document.getElementById('system-toast');
    el.classList.remove('toast-save', 'toast-error', 'toast-choice');
    if (variant) el.classList.add(variant);
    el.textContent = msg;
    el.classList.remove('hidden');
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.classList.add('hidden'), 300);
    }, 2000);
  }

  function getSlotInfo(n) {
    const raw = localStorage.getItem(SAVE_KEY(n));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return {
        sceneId: parsed.currentSceneId || '',
        chapter: parsed.chapter || 1,
        timestamp: parsed.timestamp || '',
        state: raw,
      };
    } catch {
      return null;
    }
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

  function showSlotPanel(action) {
    _pendingAction = action;
    const panel = document.getElementById('slot-panel');
    const overlay = document.getElementById('slot-overlay');
    const title = document.getElementById('slot-panel-title');
    const subtitle = document.getElementById('slot-panel-subtitle');
    const list = document.getElementById('slot-list');
    const lastSlot = parseInt(localStorage.getItem('gyeongseong_last_slot') || '1', 10);

    title.textContent = action === 'save' ? '저장 슬롯 선택' : '불러오기 슬롯 선택';
    subtitle.textContent = action === 'save'
      ? `마지막 자동저장 슬롯은 ${lastSlot}번입니다. 원하는 위치에 현재 진행을 남길 수 있습니다.`
      : `마지막 자동저장 슬롯은 ${lastSlot}번입니다. 저장된 지점으로 진행을 되돌립니다.`;
    list.innerHTML = '';

    for (let n = 1; n <= SLOT_COUNT; n++) {
      const info = getSlotInfo(n);
      const btn = document.createElement('button');
      btn.className = 'slot-btn' + (info ? '' : ' slot-empty') + (n === lastSlot ? ' slot-last-used' : '');
      btn.dataset.slot = n;
      const tagHtml = n === lastSlot ? '<span class="slot-tag">자동저장</span>' : '';

      if (info) {
        const sceneTitle = getSceneTitle(info.sceneId);
        btn.innerHTML = `
          <span class="slot-name">슬롯 ${n}  ·  CH${info.chapter}  ${sceneTitle}${tagHtml}</span>
          <span class="slot-info">${formatTimestamp(info.timestamp)}</span>
        `;
      } else {
        btn.innerHTML = `
          <span class="slot-name">슬롯 ${n}${tagHtml}</span>
          <span class="slot-info">비어있음</span>
        `;
        if (action === 'load') {
          btn.disabled = true;
          btn.style.opacity = '0.4';
          btn.style.cursor = 'default';
        }
      }

      btn.addEventListener('click', () => {
        if (action === 'save') saveToSlot(n);
        else loadFromSlot(n);
        hideSlotPanel();
      });

      list.appendChild(btn);
    }

    overlay.classList.remove('hidden');
    panel.classList.remove('hidden');
  }

  function hideSlotPanel() {
    document.getElementById('slot-panel').classList.add('hidden');
    document.getElementById('slot-overlay').classList.add('hidden');
    _pendingAction = null;
  }

  function saveToSlot(n, silent = false) {
    try {
      const stateJson = JSON.parse(State.serialize());
      stateJson.timestamp = new Date().toISOString();
      localStorage.setItem(SAVE_KEY(n), JSON.stringify(stateJson));
      localStorage.setItem('gyeongseong_last_slot', String(n));
      if (!silent) showToast(`슬롯 ${n}에 저장했습니다.`, 'toast-save');
    } catch (e) {
      showToast('저장에 실패했습니다.', 'toast-error');
      console.error(e);
    }
  }

  function loadFromSlot(n) {
    const raw = localStorage.getItem(SAVE_KEY(n));
    if (!raw) {
      showToast('저장 데이터가 없습니다.', 'toast-error');
      return false;
    }
    if (!State.deserialize(raw)) {
      showToast('저장 데이터를 불러올 수 없습니다.', 'toast-error');
      return false;
    }
    if (typeof Evidence?.hydrateSession === 'function') {
      Evidence.hydrateSession();
    }
    showToast(`슬롯 ${n}에서 불러왔습니다.`, 'toast-save');
    document.dispatchEvent(new Event('game:loaded'));
    Scene.load(State.currentSceneId, null, { restoreProgress: true });
    return true;
  }

  return {
    toast: showToast,

    save(silent = false) {
      if (silent) {
        // 자동저장: 마지막으로 사용한 슬롯 또는 슬롯 1
        const lastSlot = parseInt(localStorage.getItem('gyeongseong_last_slot') || '1', 10);
        saveToSlot(lastSlot, true);
      } else {
        showSlotPanel('save');
      }
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

    hidePanel: hideSlotPanel,

    isPanelOpen() {
      const panel = document.getElementById('slot-panel');
      return !!panel && !panel.classList.contains('hidden');
    },

    clear() {
      for (let n = 1; n <= SLOT_COUNT; n++) {
        localStorage.removeItem(SAVE_KEY(n));
      }
    },

    init() {
      migrateLegacy();

      document.getElementById('save-btn').addEventListener('click', () => Save.save(false));
      document.getElementById('load-btn').addEventListener('click', () => Save.load());
      document.getElementById('slot-cancel').addEventListener('click', hideSlotPanel);
      document.getElementById('slot-overlay').addEventListener('click', hideSlotPanel);
    }
  };
})();
