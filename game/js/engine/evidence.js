const Evidence = (() => {
  let _allEvidence = {};
  let _seenEvidence = new Set();
  let _activeTab = 'status';

  const CHARACTER_NOTES = {
    Yuu: {
      role: '기록자',
      facts: [
        '법정에서 시작된 실종 사건을 끝까지 물고 늘어지는 기자.',
        '기록과 은폐의 경계에서 사건을 붙들고 있다.'
      ]
    },
    Songsoon: {
      role: '증언자',
      facts: [
        '낙원 안쪽 사정을 알고 있지만 쉽게 입을 열지 않는다.',
        '신뢰를 얻을수록 더 깊은 증언에 접근할 수 있다.'
      ]
    },
    Ipangyu: {
      role: '문턱의 죄수',
      facts: [
        '광기와 교리 사이를 오가며 사건의 단어를 흘리는 인물.',
        '헛소리처럼 들리지만 사건의 방향을 먼저 암시한다.'
      ]
    },
    Okryeon: {
      role: '생존자',
      facts: [
        '낙원에서 벌어진 일을 견디고 살아남은 여급.',
        '압박보다 보호에 가까운 태도에서 더 많은 진실이 새어 나온다.'
      ]
    },
    Haesim: {
      role: '의식의 중심',
      facts: [
        '공명과 의식의 중심축에 선 인물.',
        '신념인지 광기인지 분간하기 어려운 확신을 가진다.'
      ]
    },
    Songgeum: {
      role: '실종자',
      facts: [
        '사건의 핵심에서 사라진 여급.',
        '사람들이 입을 다무는 이유가 이 인물과 맞물려 있다.'
      ]
    },
    Editor: {
      role: '기록의 문지기',
      facts: [
        '무엇이 기사로 남고 무엇이 묻히는지 결정하는 편집장.',
        '바깥에 흔적을 남길지 말지의 축과 연결된다.'
      ]
    }
  };

  function getEvidenceCategory(ev) {
    if (ev?.category_id || ev?.category_title || ev?.category_hint) {
      return {
        key: ev.category_id || 'trace',
        title: ev.category_title || '현장 물증',
        hint: ev.category_hint || '현장에서 직접 붙잡은 흔적',
      };
    }

    const id = ev?.evidence_id || '';
    const name = ev?.name || '';
    const desc = ev?.description || '';
    const text = `${id} ${name} ${desc}`;

    if (/Ritual|Mask|Hanbok|Diary|Score|Note|의례|무녀|감응|문/.test(text)) {
      return { key: 'ritual', title: '의례와 공명', hint: '문, 무녀, 감응과 연결된 흔적' };
    }
    if (/OldArticles|기사|기록|일기|편집장/.test(text)) {
      return { key: 'record', title: '기록과 기사', hint: '지워졌거나 남겨진 문장들' };
    }
    return { key: 'trace', title: '현장 물증', hint: '현장에서 직접 붙잡은 흔적' };
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

  function evaluateQuestionVisible(ruleId, context) {
    switch (ruleId) {
      case 'QR_IpangyuSeen':
        return context.revealedCharacters.has('Ipangyu');
      case 'QR_SonggeumOpen':
        return context.hasDiary || context.hasOldArticles || context.sceneProgressIndex >= 24 || context.revealedCharacters.has('Songgeum');
      case 'QR_RitualOpen':
        return context.readRitualScore >= 1 || context.revealedCharacters.has('Haesim') || context.sceneProgressIndex >= 31;
      default:
        return true;
    }
  }

  function evaluateQuestionState(ruleId, context) {
    switch (ruleId) {
      case 'QS_IpangyuCall':
        return context.resonanceLevel >= 1 ? '공명 전조 확인' : '불명';
      case 'QS_SonggeumMissing':
        return context.hasDiary ? '단서 확보' : '추적 중';
      case 'QS_RitualLead':
        return context.readRitualScore >= 1 ? '의식 구조 접근' : '추적 중';
      default:
        return '추적 중';
    }
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
      CHARACTER_NOTES[characterId] ||
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
      const note = CHARACTER_NOTES[characterId] || {};
      const facts = [
        character.notebook_summary1,
        character.notebook_summary2,
      ].filter(Boolean);

      if (!note) return null;
      const displayName = character.display_name || characterId;
      return {
        name: displayName,
        role: character.role_text || note.role || '',
        state: getCharacterState(characterId),
        facts: facts.length > 0 ? facts : (note.facts || [])
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
    const hasDiary = State.getFlag('HasEvidence_EvDiary') === true;
    const hasOldArticles = State.getFlag('HasEvidence_EvOldArticles') === true;
    const readRitualScore = Number(State.getFlag('ReadRitualScore') || 0);
    const resonanceLevel = Number(State.getFlag('ResonanceLevel') || 0);
    const context = {
      revealedCharacters,
      sceneProgressIndex,
      hasDiary,
      hasOldArticles,
      readRitualScore,
      resonanceLevel,
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

    return [
      {
        title: '이판규는 누구에게 불려갔는가',
        state: resonanceLevel >= 1 ? '공명 전조 확인' : '불명',
        detail: '광기처럼 보이는 말들이 실제로는 사건의 중심을 향한 반응일 수 있습니다.',
        isVisible: revealedCharacters.has('Ipangyu')
      },
      {
        title: '송금은 왜 사라졌는가',
        state: hasDiary ? '단서 확보' : '추적 중',
        detail: '송금이 자발적으로 사라진 것인지, 의식의 일부로 지워진 것인지가 핵심입니다.',
        isVisible: hasDiary || hasOldArticles || sceneProgressIndex >= 24 || revealedCharacters.has('Songgeum')
      },
      {
        title: '낙원의 의식은 누가 주도했는가',
        state: readRitualScore >= 1 ? '의식 구조 접근' : '추적 중',
        detail: '무녀, 악보, 기록, 기사 사이를 연결해 의식의 실제 주체를 좁혀야 합니다.',
        isVisible: readRitualScore >= 1 || revealedCharacters.has('Haesim') || sceneProgressIndex >= 31
      }
    ].filter(item => item.isVisible);
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
