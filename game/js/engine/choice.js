/**
 * Choice UI renderer and flag writer.
 */
const Choice = (() => {
  const elBox  = () => document.getElementById('choice-box');
  const elList = () => document.getElementById('choice-list');

  function showChoiceToast(choiceText) {
    if (typeof Save?.toast === 'function') {
      Save.toast(`선택: ${choiceText}`, 'toast-choice');
    }
  }

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
          list.querySelectorAll('.choice-btn').forEach(node => {
            node.disabled = true;
          });
          btn.classList.add('choice-picked');
          if (choice.flag_key) {
            State.setFlag(choice.flag_key, choice.flag_value ?? true);
          }
          showChoiceToast(choice.text);
          setTimeout(() => {
            box.classList.add('hidden');
            if (onChoose) onChoose(choice);
          }, 180);
        });
        list.appendChild(btn);
      });

      box.classList.remove('hidden');
    },

    hide() {
      elList().innerHTML = '';
      elBox().classList.add('hidden');
    },

    isVisible() {
      return !elBox().classList.contains('hidden');
    }
  };
})();
