const Evidence = (() => {
  let _allEvidence = {};
  let _seenEvidence = new Set();
  let _activeTab = 'status';

  function getEvidenceCategory(ev) {
    return {
      key: ev?.category_id || 'trace',
      title: ev?.category_title || '현장 물증',
      hint: ev?.category_hint || '현장에서 직접 붙잡은 흔적',
    };
  }

  function updateBadge() {
    const unread = State.getEvidence().filter(id => !_seenEvidence.has(id)).length;
    UIManager.updateMemoBadge(unread);
  }

  function markAllRead() {
    State.getEvidence().forEach(id => _seenEvidence.add(id));
    updateBadge();
  }

  function prepareMemoData() {
    const ids = State.getEvidence();
    const groups = new Map();

    ids.forEach(id => {
      const ev = _allEvidence[id];
      if (!ev) return;
      const category = getEvidenceCategory(ev);
      if (!groups.has(category.key)) {
        groups.set(category.key, { ...category, items: [] });
      }
      groups.get(category.key).items.push({
        ...ev,
        isRead: _seenEvidence.has(ev.evidence_id)
      });
    });

    return Array.from(groups.values());
  }

  function getCurrentSceneGoal() {
    const sceneId = State.currentSceneId;
    const scene = Engine.data?.scenes?.[sceneId];
    if (!scene?.goal_text) return null;
    return {
      kicker: scene.goal_kicker || '현재 목표',
      text: scene.goal_text
    };
  }

  function resolveStateDescriptor(targetFlagId, rawValue, fallbackResolver) {
    const descriptors = (Engine.data?.state_descriptors || [])
      .filter(descriptor => descriptor?.target_flag_id === targetFlagId)
      .sort((a, b) => Number(a?.min_value || 0) - Number(b?.min_value || 0));

    const numericValue = Number(rawValue || 0);
    const matched = descriptors.find(descriptor => {
      const min = Number(descriptor?.min_value);
      const max = Number(descriptor?.max_value);
      return Number.isFinite(min) && Number.isFinite(max) && numericValue >= min && numericValue <= max;
    });

    if (matched) {
      return {
        value: matched.label || '',
        detail: matched.detail || ''
      };
    }

    return fallbackResolver();
  }

  function getResonanceState() {
    const value = Number(State.getFlag('ResonanceLevel') || 0);
    return resolveStateDescriptor('ResonanceLevel', value, () => {
      if (value >= 3) return { value: '침식', detail: '현실과 공명의 경계가 크게 흔들리고 있습니다.' };
      if (value >= 2) return { value: '심화', detail: '위험을 감수한 만큼 비현실의 결이 짙어졌습니다.' };
      if (value >= 1) return { value: '전조', detail: '조사 과정 곳곳에서 공명의 낌새가 드러납니다.' };
      return { value: '안정', detail: '아직은 현실 감각이 우세한 상태입니다.' };
    });
  }

  function getTrustState() {
    const trust = Number(State.getFlag('SongsoonTrust') || 0);
    const trusted = State.getFlag('TrustedSongsoon') === true;
    return resolveStateDescriptor('SongsoonTrust', trust, () => {
      if (trust >= 2 || trusted) return { value: '신뢰', detail: '송순이 등을 돌리지 않고 같은 방향을 보고 있습니다.' };
      if (trust >= 1) return { value: '동행', detail: '경계는 남아 있지만 함께 움직일 정도의 틈은 생겼습니다.' };
      return { value: '경계', detail: '섣부른 추궁은 관계를 닫아버릴 가능성이 큽니다.' };
    });
  }

  function getInvestigationState() {
    const investigation = Number(State.getFlag('InvestigationScore') || 0);
    const readScore = Number(State.getFlag('ReadRitualScore') || 0);
    const combined = investigation + readScore;
    return resolveStateDescriptor('InvestigationProgress', combined, () => {
      if (combined >= 4) return { value: '심층', detail: '표면을 지나 사건의 구조와 의식을 함께 추적하는 단계입니다.' };
      if (combined >= 2) return { value: '접근', detail: '단서가 서로 이어지기 시작했고 질문의 결이 또렷해졌습니다.' };
      if (combined >= 1) return { value: '추적', detail: '사건의 외곽선을 따라가며 주요 흔적을 모으는 단계입니다.' };
      return { value: '초기', detail: '아직 증언과 단서가 충분히 엮이지 않은 상태입니다.' };
    });
  }

  function parseRuleValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    const text = String(value).trim();
    if (text === '') return null;
    if (text === 'true') return true;
    if (text === 'false') return false;
    const numeric = Number(text);
    return Number.isNaN(numeric) ? text : numeric;
  }

  function getRuleFactValue(rule, context) {
    const factType = rule?.fact_type;
    const factKey = rule?.fact_key;
    switch (factType) {
      case 'RevealedCharacter':
        return context.revealedCharacters.has(factKey);
      case 'HasEvidence':
        return State.getFlag(`HasEvidence_${factKey}`) === true;
      case 'SceneProgressIndex':
        return context.sceneProgressIndex;
      case 'FlagValue':
        return State.getFlag(factKey);
      default:
        return null;
    }
  }

  function compareRuleValue(actualValue, operator, expectedValue) {
    if (operator === 'Gte') {
      return Number(actualValue) >= Number(expectedValue);
    }
    return actualValue === expectedValue;
  }

  function getRulesById(ruleId, ruleKind = null) {
    return (Engine.data?.rules || [])
      .filter(rule => rule?.rule_id === ruleId && (!ruleKind || rule?.rule_kind === ruleKind))
      .slice()
      .sort((a, b) => Number(a?.priority || 0) - Number(b?.priority || 0));
  }

  function evaluateQuestionVisible(ruleId, context) {
    const rules = getRulesById(ruleId, 'Visible');
    if (rules.length === 0) return true;
    return rules.some(rule => compareRuleValue(
      getRuleFactValue(rule, context),
      rule.operator,
      parseRuleValue(rule.value)
    ));
  }

  function evaluateQuestionState(ruleId, context) {
    const rules = getRulesById(ruleId, 'State');
    if (rules.length === 0) return '추적 중';
    const matched = rules.find(rule => compareRuleValue(
      getRuleFactValue(rule, context),
      rule.operator,
      parseRuleValue(rule.value)
    ));
    return matched?.result_value || '추적 중';
  }

  function getStatusCards() {
    const resonance = getResonanceState();
    const trust = getTrustState();
    const investigation = getInvestigationState();
    return [
      { label: '공명', value: resonance.value, detail: resonance.detail },
      { label: '신뢰', value: trust.value, detail: trust.detail },
      { label: '조사', value: investigation.value, detail: investigation.detail },
      { label: '단서', value: `${State.getEvidence().length}건`, detail: '지금까지 추적해 붙든 기록과 흔적의 수입니다.' }
    ];
  }

  function getCharacterState(characterId) {
    if (characterId === 'Songsoon') return getTrustState().value;
    if (characterId === 'Yuu') return getInvestigationState().value;
    if (['Ipangyu', 'Haesim', 'Songgeum'].includes(characterId)) return getResonanceState().value;
    if (characterId === 'Editor') return State.getFlag('CalledEditor') ? '연결됨' : '거리 유지';
    return '추적 중';
  }

  function isNotebookCharacter(characterId) {
    const character = Engine.data?.characters?.[characterId] || {};
    return Boolean(
      character.role_text ||
      character.notebook_summary1 ||
      character.notebook_summary2
    );
  }

  function getRevealedCharacterIds() {
    const scenes = Engine.data?.scenes;
    const currentSceneId = State.currentSceneId;
    if (!scenes || !currentSceneId) return [];

    const sceneEntries = Object.entries(scenes);
    const currentSceneIndex = sceneEntries.findIndex(([sceneId]) => sceneId === currentSceneId);
    if (currentSceneIndex < 0) return [];

    const revealed = new Set();

    sceneEntries.forEach(([sceneId, scene], index) => {
      const dialogues = Array.isArray(scene?.dialogues) ? scene.dialogues : [];
      const limit = sceneId === currentSceneId
        ? Math.max(0, (Number(State.dialogueIndex) || 0) + 1)
        : (index < currentSceneIndex ? dialogues.length : 0);

      dialogues.slice(0, limit).forEach(line => {
        if (line?.speaker_id && isNotebookCharacter(line.speaker_id)) {
          revealed.add(line.speaker_id);
        }
      });
    });

    return Array.from(revealed);
  }

  function getCharacterEntries() {
    const revealedIds = getRevealedCharacterIds();

    return revealedIds.map(characterId => {
      const character = Engine.data?.characters?.[characterId] || {};
      const facts = [
        character.notebook_summary1,
        character.notebook_summary2,
      ].filter(Boolean);

      if (!character.role_text && facts.length === 0) return null;
      const displayName = character.display_name || characterId;
      return {
        name: displayName,
        role: character.role_text || '',
        state: getCharacterState(characterId),
        facts
      };
    }).filter(Boolean);
  }

  function getSceneProgressIndex() {
    const scenes = Engine.data?.scenes;
    const currentSceneId = State.currentSceneId;
    if (!scenes || !currentSceneId) return -1;
    return Object.keys(scenes).findIndex(sceneId => sceneId === currentSceneId);
  }

  function getQuestionEntries() {
    const revealedCharacters = new Set(getRevealedCharacterIds());
    const sceneProgressIndex = getSceneProgressIndex();
    const context = {
      revealedCharacters,
      sceneProgressIndex,
    };

    const dataQuestions = (Engine.data?.questions || []).slice().sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0));
    if (dataQuestions.length > 0) {
      return dataQuestions
        .filter(question => evaluateQuestionVisible(question.visible_rule_id, context))
        .map(question => {
        return {
          title: question.title || '',
          state: evaluateQuestionState(question.state_rule_id, context),
          detail: question.detail || '',
        };
      });
    }
    return [];
  }

  function renderNotebook() {
    const scene = Engine.data?.scenes?.[State.currentSceneId];
    UIManager.renderNotebook({
      metaText: `단서 ${State.getEvidence().length}건 · ${scene?.title || State.currentSceneId || '대기 중'}`,
      statusCards: getStatusCards(),
      goal: getCurrentSceneGoal(),
      characters: getCharacterEntries(),
      evidenceGroups: prepareMemoData(),
      questions: getQuestionEntries()
    }, _activeTab, (tab) => {
      _activeTab = tab;
      renderNotebook();
    });
  }

  return {
    index(scenes) {
      Object.values(scenes).forEach(scene => {
        (scene.evidence || []).forEach(ev => {
          _allEvidence[ev.evidence_id] = ev;
        });
      });
    },

    collect(evidenceId) {
      const ev = _allEvidence[evidenceId];
      if (!ev) return;
      const isNew = State.addEvidence(evidenceId);
      if (isNew) {
        UIManager.showToast(`단서 획득: 『${ev.name}』`, 'toast-save');
        State.setFlag(`HasEvidence_${evidenceId}`, true);
        updateBadge();
        if (this.isOpen()) renderNotebook();
      }
    },

    collectAuto(scene) {
      (scene.evidence || []).forEach(ev => {
        if (ev.trigger === 'auto' || ev.trigger === 1) this.collect(ev.evidence_id);
      });
    },

    collectOnClick(scene) {
      (scene.evidence || []).forEach(ev => {
        if (ev.trigger === 'click' || ev.trigger === 2) this.collect(ev.evidence_id);
      });
    },

    hydrateSession() {
      _seenEvidence = new Set(State.getEvidence());
      updateBadge();
      if (this.isOpen()) renderNotebook();
    },

    resetSession() {
      _seenEvidence = new Set();
      this.hide();
      updateBadge();
    },

    hide() {
      UIManager.setPanelVisible(Config.SELECTORS.MEMO_PANEL, false);
    },

    isOpen() {
      const el = document.getElementById(Config.SELECTORS.MEMO_PANEL);
      return el && !el.classList.contains('hidden');
    },

    init() {
      const btn = document.getElementById('memo-btn');
      const close = document.getElementById('memo-close');

      if (btn) {
        btn.addEventListener('click', () => {
          const isOpen = this.isOpen();
          if (!isOpen) {
            renderNotebook();
            UIManager.setPanelVisible(Config.SELECTORS.MEMO_PANEL, true);
            markAllRead();
          } else {
            this.hide();
          }
        });
      }
      if (close) close.addEventListener('click', () => this.hide());
      State.on('change', () => {
        if (this.isOpen()) renderNotebook();
      });
      State.on('loaded', () => {
        if (this.isOpen()) renderNotebook();
      });
      State.on('reset', () => {
        _activeTab = 'status';
      });
      updateBadge();
    }
  };
})();
