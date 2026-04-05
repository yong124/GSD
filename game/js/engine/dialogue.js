const Dialogue = (() => {
  let _lines = [];
  let _index = 0;
  let _onDone = null;
  let _typing = false;
  let _timer = null;
  let _stageState = { Left: null, Center: null, Right: null };

  function passesCondition(line) {
    const condition = line?.condition;
    if (!condition?.flag_key) return true;
    const actual = State.getFlag(condition.flag_key);
    const expectedValues = Array.isArray(condition.flag_value) ? condition.flag_value : [condition.flag_value];
    return expectedValues.includes(actual);
  }

  function getCharacterName(line) {
    if (line.style === 'narration') return '';
    return line.speaker || Engine.data?.characters?.[line.speaker_id]?.display_name || '';
  }

  function getCharacterImage(line) {
    const char = Engine.data?.characters?.[line.speaker_id];
    const emoPath = Engine.data?.character_emotions?.[line.speaker_id]?.[line.emotion_type];
    return emoPath || char?.default_image_path || line.portrait || '';
  }

  function resetStage() {
    _stageState = { Left: null, Center: null, Right: null };
    UIManager.clearStandingAll();
  }

  function renderStage(line) {
    if (line.standing_slot && line.speaker_id) {
      _stageState[line.standing_slot] = {
        image: getCharacterImage(line),
        name: getCharacterName(line)
      };
    }

    const slots = ['Left', 'Center', 'Right'];
    slots.forEach(slotKey => {
      const staged = _stageState[slotKey];
      const isFocus = (line.standing_slot === slotKey);
      const isDim = line.focus_type === 'Speaker' && !isFocus;
      const motion = isFocus ? (line.enter_motion || line.idle_motion || '') : '';
      
      UIManager.setStandingSlot(slotKey, staged, isFocus, isDim, motion);
    });
  }

  function typeText(speaker, text, portrait, onComplete) {
    let currentText = '';
    _typing = true;
    UIManager.setClickHintVisible(false);

    let i = 0;
    clearInterval(_timer);
    _timer = setInterval(() => {
      if (i >= text.length) {
        clearInterval(_timer);
        _typing = false;
        UIManager.setClickHintVisible(true);
        if (onComplete) onComplete();
        return;
      }
      currentText += text[i++];
      UIManager.setDialogue(speaker, currentText, portrait);
    }, Config.TYPING?.DEFAULT_SPEED || 32);
  }

  function showLine(line) {
    renderStage(line);
    
    if (typeof Effects?.pulse === 'function') {
      Effects.pulse(line.fx_type || '', 950);
    }
    
    const speakerName = getCharacterName(line);
    const portrait = (line.style === 'narration' || !speakerName) ? null : getCharacterImage(line);
    const displaySpeaker = (line.style === 'narration' || !speakerName) ? '' : speakerName;

    typeText(displaySpeaker, line.text, portrait);
  }

  function advance() {
    if (_typing) {
      _typing = false;
      clearInterval(_timer);
      const line = _lines[_index];
      const speakerName = getCharacterName(line);
      const portrait = (line.style === 'narration' || !speakerName) ? null : getCharacterImage(line);
      const displaySpeaker = (line.style === 'narration' || !speakerName) ? '' : speakerName;
      UIManager.setDialogue(displaySpeaker, line.text, portrait);
      UIManager.setClickHintVisible(true);
      return;
    }

    _index++;
    State.dialogueIndex = _index;

    if (_index >= _lines.length) {
      UIManager.setDialogueBoxVisible(false);
      resetStage();
      if (_onDone) _onDone();
      return;
    }

    showLine(_lines[_index]);
  }

  return {
    init() {
      const db = document.getElementById(Config.SELECTORS.DIALOGUE_BOX);
      if (db) {
        db.addEventListener('click', () => {
          if (Choice.isVisible() || Save.isPanelOpen() || Evidence.isOpen()) return;
          Dialogue.advance();
        });
      }
      document.addEventListener('keydown', e => {
        if (InputManager.isTitleVisible?.() || Choice.isVisible() || Save.isPanelOpen() || Evidence.isOpen()) return;
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          Dialogue.advance();
        }
      });
    },

    start(lines, onDone, fromLabel, restoreProgress = false) {
      _lines = (lines || []).filter(passesCondition);
      
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

      UIManager.setDialogueBoxVisible(true);
      showLine(_lines[_index]);
    },

    advance,
    isTyping() { return _typing; }
  };
})();
