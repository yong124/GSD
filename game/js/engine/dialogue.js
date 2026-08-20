const Dialogue = (() => {
  let _lines = [];
  let _index = 0;
  let _onDone = null;
  let _typing = false;
  let _timer = null;
  let _stageState = { Left: null, Center: null, Right: null };
  let _skipMode = false;
  let _autoMode = false;
  let _autoTimer = null;

  function passesCondition(line) {
    if (!line?.condition_group_id || typeof Scene?.passesConditionGroup !== 'function') return true;
    return Scene.passesConditionGroup(line.condition_group_id, {
      sceneId: State.currentSceneId,
      sceneProgressIndex: _index + 1,
    });
  }

  function getCharacterName(line) {
    if (line.style === 'narration') return '';
    return Engine.data?.characters?.[line.speaker_id]?.display_name || '';
  }

  function getCharacterImage(line) {
    const char = Engine.data?.characters?.[line.speaker_id];
    const emoPath = Engine.data?.character_emotions?.[line.speaker_id]?.[line.emotion_type];
    return emoPath || char?.default_image_path || '';
  }

  // 화자가 이미 스탠딩 스테이지에 올라가 있으면 대사창 헤드샷은 중복이므로 생략한다.
  // (renderStage가 _stageState를 먼저 갱신하므로, 이 시점의 _stageState는 현재 라인 기준이다.)
  function isSpeakerOnStage(line) {
    if (!line.speaker_id) return false;
    if (line.standing_slot) return true;
    const img = getCharacterImage(line);
    if (!img) return false;
    return Object.values(_stageState).some(s => s && s.image && s.image === img);
  }

  function resetStage() {
    _stageState = { Left: null, Center: null, Right: null };
    UIManager.clearStandingAll();
    UIManager.setCgImage(null);
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

  function scheduleAutoAdvance(delay) {
    clearTimeout(_autoTimer);
    _autoTimer = setTimeout(() => {
      if (Choice.isVisible() || Save.isPanelOpen() || Evidence.isOpen()) return;
      advance();
    }, delay);
  }

  function markCurrentLineSeenAndSchedule(wasSeenAtStart) {
    State.markLineSeen(State.currentSceneId, _index);
    if (_skipMode && wasSeenAtStart) {
      scheduleAutoAdvance(Config.TYPING?.SKIP_DELAY || 150);
    } else if (_autoMode) {
      scheduleAutoAdvance(Config.TYPING?.AUTO_DELAY || 1400);
    }
  }

  function typeText(speaker, text, portrait, onComplete) {
    clearInterval(_timer);
    clearTimeout(_autoTimer);

    const wasSeen = State.hasSeenLine(State.currentSceneId, _index);
    if (_skipMode && wasSeen) {
      _typing = false;
      UIManager.setDialogue(speaker, text, portrait);
      UIManager.setClickHintVisible(true);
      if (onComplete) onComplete(wasSeen);
      return;
    }

    let currentText = '';
    _typing = true;
    UIManager.setClickHintVisible(false);

    let i = 0;
    _timer = setInterval(() => {
      if (i >= text.length) {
        clearInterval(_timer);
        _typing = false;
        UIManager.setClickHintVisible(true);
        if (onComplete) onComplete(wasSeen);
        return;
      }
      currentText += text[i++];
      UIManager.setDialogue(speaker, currentText, portrait);
    }, Config.TYPING?.DEFAULT_SPEED || 32);
  }

  function showLine(line) {
    renderStage(line);

    UIManager.setCgImage(line.cg_image || null);

    if (typeof Effects?.pulse === 'function') {
      Effects.pulse(line.fx_type || '', 950);
    }
    if (line.sfx && typeof AudioManager?.playSfx === 'function') {
      AudioManager.playSfx(line.sfx);
    }
    if (line?.effect_group_id && typeof Choice?.applyEffectGroup === 'function') {
      Choice.applyEffectGroup(line.effect_group_id);
    }

    const speakerName = getCharacterName(line);
    const portrait = (line.style === 'narration' || !speakerName || isSpeakerOnStage(line)) ? null : getCharacterImage(line);
    const displaySpeaker = (line.style === 'narration' || !speakerName) ? '' : speakerName;

    State.pushBacklog({ speaker: displaySpeaker, text: line.text });

    typeText(displaySpeaker, line.text, portrait, markCurrentLineSeenAndSchedule);
  }

  function advance() {
    clearTimeout(_autoTimer);

    if (_typing) {
      _typing = false;
      clearInterval(_timer);
      const line = _lines[_index];
      const speakerName = getCharacterName(line);
      const portrait = (line.style === 'narration' || !speakerName || isSpeakerOnStage(line)) ? null : getCharacterImage(line);
      const displaySpeaker = (line.style === 'narration' || !speakerName) ? '' : speakerName;
      UIManager.setDialogue(displaySpeaker, line.text, portrait);
      UIManager.setClickHintVisible(true);
      markCurrentLineSeenAndSchedule(State.hasSeenLine(State.currentSceneId, _index));
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

  function updateModeButtons() {
    const skipBtn = document.getElementById('skip-btn');
    const autoBtn = document.getElementById('auto-btn');
    if (skipBtn) skipBtn.classList.toggle('is-active', _skipMode);
    if (autoBtn) autoBtn.classList.toggle('is-active', _autoMode);
  }

  function setSkipMode(value) {
    _skipMode = !!value;
    if (_skipMode) _autoMode = false;
    clearTimeout(_autoTimer);
    updateModeButtons();
  }

  function setAutoMode(value) {
    _autoMode = !!value;
    if (_autoMode) _skipMode = false;
    clearTimeout(_autoTimer);
    updateModeButtons();
    if (_autoMode && !_typing) scheduleAutoAdvance(Config.TYPING?.AUTO_DELAY || 1400);
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

      const skipBtn = document.getElementById('skip-btn');
      const autoBtn = document.getElementById('auto-btn');
      if (skipBtn) skipBtn.addEventListener('click', () => setSkipMode(!_skipMode));
      if (autoBtn) autoBtn.addEventListener('click', () => setAutoMode(!_autoMode));

      State.on('reset', () => {
        clearTimeout(_autoTimer);
        _skipMode = false;
        _autoMode = false;
        updateModeButtons();
      });
    },

    start(lines, onDone, fromDialogId, restoreProgress = false) {
      _lines = (lines || []).filter(passesCondition);

      if (fromDialogId) {
        const idx = _lines.findIndex(l => l.dialog_id === fromDialogId);
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
    isTyping() { return _typing; },
    toggleSkip() { setSkipMode(!_skipMode); },
    toggleAuto() { setAutoMode(!_autoMode); },
    isSkip() { return _skipMode; },
    isAuto() { return _autoMode; },
  };
})();
