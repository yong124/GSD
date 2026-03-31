/**
 * choice.js — 선택지 렌더링 & 플래그 기록
 */
const Choice = (() => {
  const elBox  = () => document.getElementById('choice-box');
  const elList = () => document.getElementById('choice-list');

  return {
    /**
     * 선택지 표시
     * @param {Array}    choices   — choices 배열 [{text, flag_key, flag_value, next_scene}]
     * @param {Function} onChoose  — (choice) => void
     */
    show(choices, onChoose) {
      const box  = elBox();
      const list = elList();

      list.innerHTML = '';
      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
          // 플래그 기록
          if (choice.flag_key) {
            State.setFlag(choice.flag_key, choice.flag_value ?? true);
          }
          box.classList.add('hidden');
          if (onChoose) onChoose(choice);
        });
        list.appendChild(btn);
      });

      box.classList.remove('hidden');
    },

    hide() {
      elBox().classList.add('hidden');
    }
  };
})();
