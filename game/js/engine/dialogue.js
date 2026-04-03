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
  let _stageState = {};

  const elBox = () => document.getElementById('dialogue-box');
  const elSpeaker = () => document.getElementById('speaker-name');
  const elText = () => document.getElementById('dialogue-text');
  const elPortrait = () => document.getElementById('portrait-img');
  const elHint = () => document.getElementById('click-hint');
  const elStage = () => document.getElementById('standing-stage');
  const MOTION_CLASSES = ['motion-fade-in', 'motion-slide-left', 'motion-slide-right', 'motion-tremble', 'motion-shake-light', 'motion-shake-hard'];

  function getCharacterName(line) {
    const characterId = line?.speaker_id || '';
    const character = window.GAME_DATA?.characters?.[characterId];
    return character?.display_name || line?.speaker || '';
  }

  function getCharacterImage(line) {
    const characterId = line?.speaker_id || '';
    const emotionType = line?.emotion_type || '';
    const emotionMap = window.GAME_DATA?.character_emotions?.[characterId] || {};
    return emotionMap[emotionType] || line?.portrait || '';
  }

  function resetStage() {
    _stageState = {};
    const stage = elStage();
    if (!stage) return;
    stage.querySelectorAll('.standing-slot').forEach(slot => {
      slot.classList.remove('is-visible', 'is-focus', 'is-dim', ...MOTION_CLASSES);
      const img = slot.querySelector('.standing-img');
      if (img) {
        img.removeAttribute('src');
        img.alt = '';
      }
    });
  }

  function toMotionClass(motionName) {
    if (!motionName) return '';
    return `motion-${String(motionName).trim().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase()}`;
  }

  function clearSlotMotion(slotEl) {
    slotEl.classList.remove(...MOTION_CLASSES);
  }

  function applySlotMotion(slotEl, motionName, duration = 520) {
    const motionClass = toMotionClass(motionName);
    if (!motionClass || !MOTION_CLASSES.includes(motionClass)) return;
    clearSlotMotion(slotEl);
    slotEl.classList.add(motionClass);
    setTimeout(() => {
      slotEl.classList.remove(motionClass);
    }, duration);
  }

  function renderStage(line) {
    const stage = elStage();
    if (!stage) return;

    const incomingSlot = line?.standing_slot || null;
    const incomingSpeakerId = line?.speaker_id || null;
    const shouldAnimateEnter =
      incomingSlot &&
      incomingSpeakerId &&
      line?.enter_motion &&
      _stageState[incomingSlot]?.speakerId !== incomingSpeakerId;

    if (line?.speaker_id && line?.standing_slot) {
      _stageState[line.standing_slot] = {
        speakerId: line.speaker_id,
        name: getCharacterName(line),
        imagePath: getCharacterImage(line),
      };
    }

    const focusSlot = line?.focus_type === 'Speaker' ? line?.standing_slot : null;
    stage.querySelectorAll('.standing-slot').forEach(slotEl => {
      const slotKey = slotEl.dataset.slot;
      const img = slotEl.querySelector('.standing-img');
      const staged = _stageState[slotKey];

      slotEl.classList.remove('is-visible', 'is-focus', 'is-dim');

      if (!staged || !staged.imagePath) {
        clearSlotMotion(slotEl);
        if (img) {
          img.removeAttribute('src');
          img.alt = '';
        }
        return;
      }

      img.src = staged.imagePath;
      img.alt = staged.name || '';
      slotEl.classList.add('is-visible');

      if (focusSlot) {
        slotEl.classList.add(slotKey === focusSlot ? 'is-focus' : 'is-dim');
      }

      if (slotKey === incomingSlot && shouldAnimateEnter) {
        applySlotMotion(slotEl, line.enter_motion, 520);
      } else if (slotKey === focusSlot && line?.idle_motion) {
        applySlotMotion(slotEl, line.idle_motion, 620);
      }
    });
  }

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
    renderStage(line);
    Effects.pulse(line.fx_type || '', 950);
    const speakerName = getCharacterName(line);

    if (line.style === 'narration' || !speakerName) {
      box.className = 'narration';
      elSpeaker().textContent = '';
      setPortrait('', '');
    } else {
      box.className = (line.style && line.style !== 'normal') ? line.style : '';
      elSpeaker().textContent = speakerName;
      setPortrait(speakerName, getCharacterImage(line));
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
      resetStage();

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
