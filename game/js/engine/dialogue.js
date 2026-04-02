/**
 * Dialogue typing and progression controller.
 */
const Dialogue = (() => {
  const TYPING_SPEED = 32;

  let _lines = [];
  let _index = 0;
  let _typing = false;
  let _timer = null;
  let _onDone = null;

  const elBox = () => document.getElementById('dialogue-box');
  const elSpeaker = () => document.getElementById('speaker-name');
  const elText = () => document.getElementById('dialogue-text');
  const elPortrait = () => document.getElementById('portrait-img');
  const elHint = () => document.getElementById('click-hint');

  function typeText(text, onComplete) {
    const el = elText();
    el.textContent = '';
    el.classList.add('typing-cursor');
    _typing = true;
    elHint().classList.add('hidden-hint');

    let i = 0;
    clearInterval(_timer);
    _timer = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(_timer);
        _typing = false;
        el.classList.remove('typing-cursor');
        elHint().classList.remove('hidden-hint');
        if (onComplete) onComplete();
      }
    }, TYPING_SPEED);
  }

  function setPortrait(speaker, portraitUrl) {
    const wrap = document.getElementById('portrait-wrap');
    const img = elPortrait();
    const old = wrap.querySelector('.portrait-placeholder');

    if (old) old.remove();

    if (portraitUrl) {
      img.src = portraitUrl;
      img.style.display = '';
    } else if (speaker) {
      img.src = '';
      img.style.display = 'none';

      const ph = document.createElement('div');
      ph.className = 'portrait-placeholder';
      ph.textContent = speaker.charAt(0);
      wrap.appendChild(ph);
    } else {
      img.src = '';
      img.style.display = 'none';
    }
  }

  function showLine(line) {
    const box = elBox();

    if (line.style === 'narration' || !line.speaker) {
      box.className = 'narration';
      elSpeaker().textContent = '';
      setPortrait('', '');
    } else {
      box.className = (line.style && line.style !== 'normal') ? line.style : '';
      elSpeaker().textContent = line.speaker;
      setPortrait(line.speaker, line.portrait || '');
    }

    typeText(line.text);
  }

  function advance() {
    if (_typing) {
      clearInterval(_timer);
      _typing = false;
      const line = _lines[_index - 1];
      elText().textContent = line ? line.text : '';
      elText().classList.remove('typing-cursor');
      elHint().classList.remove('hidden-hint');
      return;
    }

    if (_index >= _lines.length) {
      if (_onDone) _onDone();
      return;
    }

    showLine(_lines[_index]);
    State.dialogueIndex = _index;
    _index++;
  }

  return {
    start(lines, onDone, fromLabel, restoreProgress = false) {
      _lines = (lines || []).filter(line => {
        if (!line.condition) return true;
        const actual = State.getFlag(line.condition.flag_key);
        const values = Array.isArray(line.condition.flag_value)
          ? line.condition.flag_value
          : [line.condition.flag_value];
        return values.includes(actual);
      });

      if (fromLabel) {
        const idx = _lines.findIndex(l => l.label === fromLabel);
        _index = idx >= 0 ? idx : 0;
      } else if (restoreProgress) {
        const savedIndex = Number.isInteger(State.dialogueIndex) ? State.dialogueIndex : 0;
        _index = Math.max(0, Math.min(savedIndex, Math.max(_lines.length - 1, 0)));
      } else {
        _index = 0;
      }

      _onDone = onDone;

      if (_lines.length === 0 || _index >= _lines.length) {
        if (_onDone) _onDone();
        return;
      }

      advance();
    },

    advance,

    init() {
      const box = document.getElementById('dialogue-box');
      box.addEventListener('click', () => Dialogue.advance());
      document.addEventListener('keydown', e => {
        const titleVisible = !document.getElementById('title-screen').classList.contains('hidden');
        if (titleVisible || Choice.isVisible()) return;
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          Dialogue.advance();
        }
      });
    }
  };
})();
