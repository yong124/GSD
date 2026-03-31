/**
 * state.js — 전역 게임 상태 관리
 * 모든 엔진 모듈이 이 객체를 통해 상태를 읽고 씁니다.
 */
const State = (() => {
  let _state = {
    currentSceneId: null,
    dialogueIndex: 0,
    flags: {},        // { flag_key: flag_value }
    evidence: [],     // 획득한 단서 ID 목록
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
        return true; // 새로 획득
      }
      return false;
    },
    getEvidence() {
      return [..._state.evidence];
    },

    /** 저장용 직렬화 (dialogueIndex는 씬 단위 복원이므로 제외) */
    serialize() {
      const { dialogueIndex, ..._save } = _state;
      return JSON.stringify(_save);
    },

    /** 불러오기용 복원 */
    deserialize(json) {
      try {
        _state = JSON.parse(json);
      } catch(e) {
        console.error('State.deserialize 실패:', e);
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

    /** 개발용 디버그 출력 */
    dump() {
      return { ..._state };
    }
  };
})();
