/**
 * localStorage save/load helpers.
 */
const Save = (() => {
  const SAVE_KEY = 'gyeongseong_save';

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

  return {
    toast: showToast,

    save(silent = false) {
      try {
        localStorage.setItem(SAVE_KEY, State.serialize());
        if (!silent) {
          showToast('저장했습니다.', 'toast-save');
        }
      } catch (e) {
        showToast('저장에 실패했습니다.', 'toast-error');
        console.error(e);
      }
    },

    load() {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) {
        showToast('저장 데이터가 없습니다.', 'toast-error');
        return false;
      }

      if (!State.deserialize(data)) {
        showToast('저장 데이터를 불러올 수 없습니다.', 'toast-error');
        return false;
      }

      showToast('불러오기를 완료했습니다.', 'toast-save');
      return true;
    },

    hasSave() {
      return !!localStorage.getItem(SAVE_KEY);
    },

    clear() {
      localStorage.removeItem(SAVE_KEY);
    },

    init() {
      document.getElementById('save-btn').addEventListener('click', () => Save.save(false));
      document.getElementById('load-btn').addEventListener('click', () => {
        if (Save.load()) {
          Scene.load(State.currentSceneId);
        }
      });
    }
  };
})();
