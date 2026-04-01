/**
 * Choice UI renderer and flag writer.
 */
const Choice = (() => {
  const elBox  = () => document.getElementById('choice-box');
  const elList = () => document.getElementById('choice-list');

  return {
    show(choices, onChoose) {
      const box  = elBox();
      const list = elList();

      list.innerHTML = '';
      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => {
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
    },

    isVisible() {
      return !elBox().classList.contains('hidden');
    }
  };
})();
