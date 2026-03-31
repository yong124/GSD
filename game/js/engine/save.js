/**
 * save.js — localStorage 저장/불러오기
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
        showToast('저장됐습니다.');
      } catch(e) {
        showToast('저장 실패.');
        console.error(e);
      }
    },

    load() {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) {
        showToast('저장 데이터가 없습니다.');
        return false;
      }
      State.deserialize(data);
      showToast('불러오기 완료.');
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
