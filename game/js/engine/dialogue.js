const Dialogue = (() => {
  let _lines = [];
  let _index = 0;
  let _typing = false;
  let _timer = null;
  let _onDone = null;
  let _stageState = {};

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
    UIManager.clearStandingAll();
  }

  function toMotionClass(motionName) {
    if (!motionName) return '';
    return `motion-${String(motionName).trim().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase()}`;
  }

  function renderStage(line) {
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
    
    // slots are 1, 2, 3 usually
    [1, 2, 3].forEach(slotKey => {
      const staged = _stageState[slotKey];
      const isFocus = focusSlot ? (String(slotKey) === String(focusSlot)) : false;
      const isDim = focusSlot ? !isFocus : false;
      
      let motion = null;
      if (staged) {
        if (String(slotKey) === String(incomingSlot) && shouldAnimateEnter) {
          motion = toMotionClass(line.enter_motion);
        } else if (isFocus && line?.idle_motion) {
          motion = toMotionClass(line.idle_motion);
        }
      }

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
      currentText += text[i++];
      UIManager.setDialogue(speaker, currentText, portrait);
      if (i >= text.length) {
        clearInterval(_timer);
        _typing = false;
        UIManager.setClickHintVisible(true);
        if (onComplete) onComplete();
      }
    }, Config.TYPING.DEFAULT_SPEED || 32);
  }

  function showLine(line) {
    renderStage(line);
    // Effects check
    if (typeof EffectManager?.pulse === 'function') {
      EffectManager.pulse(line.fx_type || '', 950);
    }
    
    const speakerName = getCharacterName(line);
    const portrait = (line.style === 'narration' || !speakerName) ? null : getCharacterImage(line);
    const displaySpeaker = (line.style === 'narration' || !speakerName) ? '' : speakerName;

    typeText(displaySpeaker, line.text, portrait);
  }

  function advance() {
    if (_typing) {
      clearInterval(_timer);
      _typing = false;
      const line = _lines[_index - 1];
      if (line) {
        const speakerName = getCharacterName(line);
        const portrait = (line.style === 'narration' || !speakerName) ? null : getCharacterImage(line);
        const displaySpeaker = (line.style === 'narration' || !speakerName) ? '' : speakerName;
        UIManager.setDialogue(displaySpeaker, line.text, portrait);
      }
      UIManager.setClickHintVisible(true);
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

      UIManager.setDialogueBoxVisible(true);
      advance();
    },

    advance,

    init() {
      const box = document.getElementById(Config.SELECTORS.DIALOGUE_BOX);
      if (box) {
        box.addEventListener('click', () => {
          if (Save.isPanelOpen() || Evidence.isOpen()) return;
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
    }
  };
})();
