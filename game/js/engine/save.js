/**
 * localStorage save/load helpers.
 */
const Save = (() => {
  const SAVE_KEY = 'gyeongseong_save';

  function showToast(msg) {
    const el = document.getElementById('system-toast');
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
    save() {
      try {
        localStorage.setItem(SAVE_KEY, State.serialize());
        showToast('??λ릱?듬땲??');
      } catch (e) {
        showToast('????ㅽ뙣.');
        console.error(e);
      }
    },

    load() {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) {
        showToast('????곗씠?곌? ?놁뒿?덈떎.');
        return false;
      }

      if (!State.deserialize(data)) {
        showToast('????곗씠???遺덈윭?ㅼ??놁뒿?덈떎.');
        return false;
      }

      showToast('遺덈윭?ㅺ린 ?꾨즺.');
      return true;
    },

    hasSave() {
      return !!localStorage.getItem(SAVE_KEY);
    },

    clear() {
      localStorage.removeItem(SAVE_KEY);
    },

    init() {
      document.getElementById('save-btn').addEventListener('click', () => Save.save());
      document.getElementById('load-btn').addEventListener('click', () => {
        if (Save.load()) {
          Scene.load(State.currentSceneId);
        }
      });
    }
  };
})();
