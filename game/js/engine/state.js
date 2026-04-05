const State = (() => {
  let _state = {
    currentSceneId: null,
    dialogueIndex: 0,
    flags: {},
    evidence: [],
    choice_history: [],
    chapter: 1,
  };

  const _listeners = {};

  function _emit(event, data) {
    if (!_listeners[event]) return;
    _listeners[event].forEach(cb => cb(data));
  }

  return {
    init() {
      console.log('[State] Initialized');
    },

    on(event, callback) {
      if (!_listeners[event]) _listeners[event] = [];
      _listeners[event].push(callback);
    },

    off(event, callback) {
      if (!_listeners[event]) return;
      _listeners[event] = _listeners[event].filter(cb => cb !== callback);
    },

    get currentSceneId()  { return _state.currentSceneId; },
    set currentSceneId(v) { _state.currentSceneId = v; },

    get dialogueIndex()   { return _state.dialogueIndex; },
    set dialogueIndex(v)  { _state.dialogueIndex = v; },

    get chapter()  { return _state.chapter; },
    set chapter(v) { _state.chapter = v; },

    setFlag(key, value) {
      const prev = _state.flags[key];
      _state.flags[key] = value;
      if (prev !== value) {
        _emit(`change:${key}`, value);
        _emit('change', { key, value });
      }
    },

    getFlag(key) {
      return _state.flags[key] ?? null;
    },

    hasFlag(key) {
      return key in _state.flags;
    },

    addEvidence(id) {
      if (!_state.evidence.includes(id)) {
        _state.evidence.push(id);
        _emit('evidence:added', id);
        return true;
      }
      return false;
    },

    recordChoice(choiceId) {
      if (!choiceId) return false;
      if (!_state.choice_history.includes(choiceId)) {
        _state.choice_history.push(choiceId);
        _emit('choice:selected', choiceId);
        return true;
      }
      return false;
    },

    hasChoice(choiceId) {
      return _state.choice_history.includes(choiceId);
    },

    getChoiceHistory() {
      return [..._state.choice_history];
    },

    getEvidence() {
      return [..._state.evidence];
    },

    serialize() {
      return JSON.stringify(_state);
    },

    deserialize(json) {
      try {
        const parsed = JSON.parse(json);
        _state = {
          currentSceneId: parsed.currentSceneId ?? null,
          dialogueIndex: parsed.dialogueIndex ?? 0,
          flags: parsed.flags && typeof parsed.flags === 'object' ? parsed.flags : {},
          evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
          choice_history: Array.isArray(parsed.choice_history) ? parsed.choice_history : [],
          chapter: Number.isFinite(parsed.chapter) ? parsed.chapter : 1,
        };
        _emit('loaded', _state);
        return true;
      } catch (e) {
        console.error('State.deserialize failed:', e);
        return false;
      }
    },

    reset() {
      _state = {
        currentSceneId: null,
        dialogueIndex: 0,
        flags: {},
        evidence: [],
        choice_history: [],
        chapter: 1,
      };
      _emit('reset');
    },

    dump() {
      return { ..._state };
    }
  };
})();
