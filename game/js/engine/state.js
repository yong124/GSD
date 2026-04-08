const State = (() => {
  const LEGACY_GAUGE_FLAG_MAP = {
    ResonanceLevel: 'Erosion',
    InvestigationScore: 'Credibility',
    ReadRitualScore: 'ReadRitualScore',
    SolvedQuestionCount: 'SolvedQuestionCount',
  };
  const GAUGE_LEGACY_FLAG_MAP = {
    Erosion: 'ResonanceLevel',
    Credibility: 'InvestigationScore',
    ReadRitualScore: 'ReadRitualScore',
    SolvedQuestionCount: 'SolvedQuestionCount',
  };

  function getGaugeDefinitions() {
    return Array.isArray(window.GAME_DATA?.gauges) ? window.GAME_DATA.gauges : [];
  }

  function getGaugeDefinition(gaugeId) {
    return getGaugeDefinitions().find(gauge => gauge?.gauge_id === gaugeId) || null;
  }

  function getGaugeStateRows(gaugeId) {
    const rows = Array.isArray(window.GAME_DATA?.gauge_states) ? window.GAME_DATA.gauge_states : [];
    return rows.filter(row => row?.gauge_id === gaugeId);
  }

  function getGaugeDefaultValue(gaugeId) {
    const definition = getGaugeDefinition(gaugeId);
    if (!definition) return 0;
    return Number.isFinite(Number(definition.default_value)) ? Number(definition.default_value) : 0;
  }

  function clampGaugeValue(gaugeId, value) {
    const definition = getGaugeDefinition(gaugeId);
    const numericValue = Number(value);
    const fallbackValue = Number.isFinite(numericValue) ? numericValue : getGaugeDefaultValue(gaugeId);
    if (!definition) return fallbackValue;

    const minValue = Number.isFinite(Number(definition.min_value)) ? Number(definition.min_value) : fallbackValue;
    const maxValue = Number.isFinite(Number(definition.max_value)) ? Number(definition.max_value) : fallbackValue;
    return Math.max(minValue, Math.min(maxValue, fallbackValue));
  }

  function getGaugeStateForValue(gaugeId, value) {
    return getGaugeStateRows(gaugeId).find(row => {
      const minValue = Number(row?.min_value);
      const maxValue = Number(row?.max_value);
      return value >= minValue && value <= maxValue;
    }) || null;
  }

  function buildDefaultGauges(source = {}) {
    const gauges = {};
    getGaugeDefinitions().forEach(definition => {
      const gaugeId = definition?.gauge_id;
      if (!gaugeId) return;
      const rawValue = source[gaugeId];
      gauges[gaugeId] = clampGaugeValue(gaugeId, rawValue ?? getGaugeDefaultValue(gaugeId));
    });
    return gauges;
  }

  let _state = {
    currentSceneId: null,
    dialogueIndex: 0,
    flags: {},
    gauges: {},
    trusts: {},
    visited_scenes: [],
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
      _state.gauges = buildDefaultGauges(_state.gauges);
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

      const mirroredGaugeId = LEGACY_GAUGE_FLAG_MAP[key];
      if (mirroredGaugeId) {
        const prevGaugeValue = this.getGauge(mirroredGaugeId);
        const nextGaugeValue = clampGaugeValue(mirroredGaugeId, Number(value || 0));
        _state.gauges[mirroredGaugeId] = nextGaugeValue;
        if (prevGaugeValue !== nextGaugeValue) {
          _emit(`change:gauge:${mirroredGaugeId}`, nextGaugeValue);
          _emit('change', { key: `gauge:${mirroredGaugeId}`, value: nextGaugeValue });
        }
      }

      if (typeof key === 'string' && key.endsWith('Trust')) {
        const characterId = key.replace(/Trust$/, '');
        _state.trusts[characterId] = Number(value || 0);
      }

      if (typeof key === 'string' && key.startsWith('QuestionSolved_') && value === true) {
        this.recordChoice(key);
      }

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

    getTrust(characterId) {
      if (!characterId) return 0;
      const trustValue = _state.trusts?.[characterId];
      if (trustValue !== undefined) return Number(trustValue) || 0;
      return Number(this.getFlag(`${characterId}Trust`) || 0);
    },

    addTrust(characterId, delta) {
      if (!characterId) return 0;
      const nextValue = this.getTrust(characterId) + Number(delta || 0);
      _state.trusts[characterId] = nextValue;
      this.setFlag(`${characterId}Trust`, nextValue);
      return nextValue;
    },

    visitScene(sceneId) {
      if (!sceneId) return false;
      if (_state.visited_scenes.includes(sceneId)) return false;
      _state.visited_scenes.push(sceneId);
      _emit('scene:visited', sceneId);
      return true;
    },

    hasVisitedScene(sceneId) {
      return !!sceneId && _state.visited_scenes.includes(sceneId);
    },

    getGauge(gaugeId) {
      if (!gaugeId) return 0;
      if (!Object.prototype.hasOwnProperty.call(_state.gauges, gaugeId)) {
        _state.gauges[gaugeId] = buildDefaultGauges(_state.gauges)[gaugeId] ?? getGaugeDefaultValue(gaugeId);
      }
      return clampGaugeValue(gaugeId, _state.gauges[gaugeId]);
    },

    setGauge(gaugeId, value) {
      if (!gaugeId) return 0;
      const prevValue = this.getGauge(gaugeId);
      const nextValue = clampGaugeValue(gaugeId, value);
      _state.gauges[gaugeId] = nextValue;

      const mirroredFlagKey = GAUGE_LEGACY_FLAG_MAP[gaugeId];
      if (mirroredFlagKey) {
        const prevFlagValue = _state.flags[mirroredFlagKey];
        _state.flags[mirroredFlagKey] = nextValue;
        if (prevFlagValue !== nextValue) {
          _emit(`change:${mirroredFlagKey}`, nextValue);
          _emit('change', { key: mirroredFlagKey, value: nextValue });
        }
      }

      if (prevValue !== nextValue) {
        _emit(`change:gauge:${gaugeId}`, nextValue);
        _emit('change', { key: `gauge:${gaugeId}`, value: nextValue });
      }
      return nextValue;
    },

    addGauge(gaugeId, delta) {
      if (!gaugeId) return 0;
      const prevValue = this.getGauge(gaugeId);
      const prevState = getGaugeStateForValue(gaugeId, prevValue);
      const nextValue = this.setGauge(gaugeId, prevValue + Number(delta || 0));
      const nextState = getGaugeStateForValue(gaugeId, nextValue);

      if ((prevState?.label || null) !== (nextState?.label || null) || (prevState?.min_value ?? null) !== (nextState?.min_value ?? null) || (prevState?.max_value ?? null) !== (nextState?.max_value ?? null)) {
        _emit(`gauge:state:${gaugeId}`, {
          gaugeId,
          value: nextValue,
          previousState: prevState,
          state: nextState,
        });
      }
      return nextValue;
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
          gauges: buildDefaultGauges(parsed.gauges && typeof parsed.gauges === 'object' ? parsed.gauges : {}),
          trusts: parsed.trusts && typeof parsed.trusts === 'object' ? parsed.trusts : {},
          visited_scenes: Array.isArray(parsed.visited_scenes) ? parsed.visited_scenes : [],
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
        gauges: buildDefaultGauges(),
        trusts: {},
        visited_scenes: [],
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
