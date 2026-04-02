/**
 * Global game state store.
 */
const State = (() => {
  let _state = {
    currentSceneId: null,
    dialogueIndex: 0,
    flags: {},
    evidence: [],
    chapter: 1,
  };

  return {
    get currentSceneId()  { return _state.currentSceneId; },
    set currentSceneId(v) { _state.currentSceneId = v; },

    get dialogueIndex()   { return _state.dialogueIndex; },
    set dialogueIndex(v)  { _state.dialogueIndex = v; },

    get chapter()  { return _state.chapter; },
    set chapter(v) { _state.chapter = v; },

    setFlag(key, value) {
      _state.flags[key] = value;
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
        return true;
      }
      return false;
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
          chapter: Number.isFinite(parsed.chapter) ? parsed.chapter : 1,
        };
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
        chapter: 1,
      };
    },

    dump() {
      return { ..._state };
    }
  };
})();
