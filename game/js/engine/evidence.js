const Evidence = (() => {
  let _allEvidence = {};
  let _evidenceCategories = {};
  let _seenEvidence = new Set();
  let _activeTab = 'status';
  let _selectedQuestionId = null;

  function getEvidenceCategory(ev) {
    const category = _evidenceCategories[ev?.category_id];
    if (!category && ev?.category_id) {
      console.warn(`[Evidence] category_id '${ev.category_id}' not found in EvidenceCategoryTable (evidence: ${ev.evidence_id})`);
    }
    return {
      key: ev?.category_id || 'trace',
      title: category?.category_title || '현장 물증',
      hint: category?.category_hint || '현장에서 직접 붙잡은 흔적',
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

  function resolveStateDescriptor(targetStateId, rawValue, fallbackResolver) {
    const descriptors = (Engine.data?.state_descriptors || [])
      .filter(descriptor => descriptor?.target_state_id === targetStateId)
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
    const value = State.getResonanceValue();
    return resolveStateDescriptor('ResonanceLevel', value, () => {
      if (value >= 3) return { value: '침식', detail: '현실과 공명의 경계가 크게 흔들리고 있습니다.' };
      if (value >= 2) return { value: '심화', detail: '위험을 감수한 만큼 비현실의 결이 짙어졌습니다.' };
      if (value >= 1) return { value: '전조', detail: '조사 과정 곳곳에서 공명의 낌새가 드러납니다.' };
      return { value: '안정', detail: '아직은 현실 감각이 우세한 상태입니다.' };
    });
  }

  function getTrustState() {
    const trust = State.getSongsoonTrustValue();
    return resolveStateDescriptor('SongsoonTrust', trust, () => {
      if (trust >= 2) return { value: '신뢰', detail: '송순이 등을 돌리지 않고 같은 방향을 보고 있습니다.' };
      if (trust >= 1) return { value: '동행', detail: '경계는 남아 있지만 함께 움직일 정도의 틈은 생겼습니다.' };
      return { value: '경계', detail: '섣부른 추궁은 관계를 닫아버릴 가능성이 큽니다.' };
    });
  }

  function getInvestigationState() {
    const combined = State.getDerivedStateValue('InvestigationProgress');
    return resolveStateDescriptor('InvestigationProgress', combined, () => {
      if (combined >= 4) return { value: '심층', detail: '표면을 지나 사건의 구조와 의식을 함께 추적하는 단계입니다.' };
      if (combined >= 2) return { value: '접근', detail: '단서가 서로 이어지기 시작했고 질문의 결이 또렷해졌습니다.' };
      if (combined >= 1) return { value: '추적', detail: '사건의 외곽선을 따라가며 주요 흔적을 모으는 단계입니다.' };
      return { value: '초기', detail: '아직 증언과 단서가 충분히 엮이지 않은 상태입니다.' };
    });
  }

  function parseConditionValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean' || typeof value === 'number') return value;
    const text = String(value).trim();
    if (text === '') return null;
    if (text === 'true') return true;
    if (text === 'false') return false;
    const numeric = Number(text);
    return Number.isNaN(numeric) ? text : numeric;
  }

  function evaluateQuestionVisible(conditionGroupIds, context) {
    const ids = Array.isArray(conditionGroupIds)
      ? conditionGroupIds.filter(Boolean)
      : [conditionGroupIds].filter(Boolean);
    if (ids.length === 0) return true;
    return ids.some(conditionGroupId => Scene.passesConditionGroup(conditionGroupId, context));
  }

  function evaluateQuestionState(stateConditions, context) {
    const rows = Array.isArray(stateConditions) ? stateConditions.slice() : [];
    const matched = rows
      .sort((a, b) => Number(a?.priority || 0) - Number(b?.priority || 0))
      .find(entry => entry?.condition_group_id && Scene.passesConditionGroup(entry.condition_group_id, context));
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
    if (characterId === 'Editor') return State.getBooleanState('CalledEditor') ? '연결됨' : '거리 유지';
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

  function getCharacterEntries() {
    const revealedIds = typeof Scene?.getRevealedCharacterIds === 'function'
      ? Scene.getRevealedCharacterIds().filter(isNotebookCharacter)
      : [];

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

  function getQuestionEntries() {
    const revealedCharacters = new Set(
      typeof Scene?.getRevealedCharacterIds === 'function'
        ? Scene.getRevealedCharacterIds()
        : []
    );
    const sceneProgressIndex = typeof Scene?.getSceneProgressIndex === 'function'
      ? Scene.getSceneProgressIndex()
      : -1;
    const context = {
      revealedCharacters,
      sceneProgressIndex,
    };

    const dataQuestions = (Engine.data?.questions || []).slice().sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0));
    if (dataQuestions.length > 0) {
      return dataQuestions
        .filter(question => evaluateQuestionVisible(question.visible_condition_group_ids, context))
        .map(question => {
        const recordedAnswer = (Engine.data?.question_answers || []).find(answer => (
          answer?.question_id === question.question_id && State.hasChoice(answer.answer_id)
        )) || null;
        const relatedEvidenceIds = [...new Set([
          ...(Array.isArray(question.related_evidence_ids) ? question.related_evidence_ids : []),
          ...(Array.isArray(recordedAnswer?.required_evidence_ids) ? recordedAnswer.required_evidence_ids : []),
        ])];
        const relatedEvidence = relatedEvidenceIds.map(evidenceId => {
          const ev = _allEvidence[evidenceId];
          return {
            evidenceId,
            name: ev?.name || evidenceId,
            isOwned: State.getEvidenceOwned(evidenceId),
          };
        });
        const ownedEvidence = relatedEvidence.filter(item => item.isOwned);
        const solvedStateId = question.solved_state_id || '';
        const isSolved = solvedStateId ? State.isQuestionSolved(solvedStateId) : false;
        const solutionEvidenceIds = Array.isArray(question.solution_evidence_ids)
          ? question.solution_evidence_ids.filter(Boolean)
          : [];
        return {
          questionId: question.question_id || '',
          title: question.title || '',
          state: evaluateQuestionState(question.state_conditions, context),
          detail: question.detail || '',
          category: question.category || '',
          resolutionType: question.resolution_type || 'Evidence',
          isSolved,
          isAnswered: !!recordedAnswer,
          resolvedDetail: question.resolved_detail || '',
          recordedAnswerText: recordedAnswer?.answer_text || '',
          recordedResultText: recordedAnswer?.result_text || '',
          successToast: question.success_toast || '',
          failureToast: question.failure_toast || '',
          solutionEvidenceIds,
          solutionMode: question.solution_mode || (solutionEvidenceIds.length > 1 ? 'All' : 'Any'),
          contradictionPrompt: question.contradiction_prompt || '',
          contradictionStatement: question.contradiction_statement || '',
          solvedStateId,
          rewardStateId: question.reward_state_id || '',
          rewardValue: question.reward_value,
          rewardMode: question.reward_mode || 'Set',
          relatedEvidence,
          ownedEvidence,
        };
      });
    }
    return [];
  }

  function applyQuestionReward(question) {
    if (!question?.rewardStateId) return;
    if (question.rewardMode === 'Add') {
      State.incrementNumericState(question.rewardStateId, question.rewardValue);
      return;
    }
    State.setNumericState(question.rewardStateId, question.rewardValue);
  }

  function incrementSolvedQuestionCount() {
    State.incrementNumericState('SolvedQuestionCount', 1);
  }

  function startQuestionCheckpoint(scene, onComplete) {
    const sceneId = scene?.id;
    const questionIds = Array.isArray(scene?.forced_question_ids) ? scene.forced_question_ids : [];
    const completedStateId = `QuestionCheckpointCompleted_${sceneId}`;
    if (!sceneId || questionIds.length === 0 || State.getBooleanState(completedStateId)) return false;

    const questions = getQuestionEntries();
    const pending = questionIds.filter(questionId => !State.getBooleanState(`QuestionAnswered_${sceneId}_${questionId}`));
    if (pending.length === 0 || (scene.question_mode === 'Any' && pending.length < questionIds.length)) {
      State.setBooleanState(completedStateId, true);
      return false;
    }

    UIManager.setPanelVisible(Config.SELECTORS.MEMO_PANEL, false);
    UIManager.setDialogueBoxVisible(false);
    UIManager.setChoiceBoxVisible(true);

    const finish = () => {
      State.setBooleanState(completedStateId, true);
      UIManager.setChoiceBoxVisible(false);
      if (onComplete) onComplete();
    };

    const showQuestion = index => {
      if (index >= pending.length) {
        finish();
        return;
      }
      UIManager.setDialogueBoxVisible(false);
      UIManager.setChoiceBoxVisible(true);

      const questionId = pending[index];
      const question = questions.find(item => item.questionId === questionId);
      const answers = (Engine.data?.question_answers || [])
        .filter(answer => answer?.question_id === questionId)
        .sort((a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0));
      if (!question || answers.length === 0) {
        console.error(`[Evidence] Missing forced question or answers: ${sceneId} -> ${questionId}`);
        UIManager.showToast('질문 데이터를 찾지 못해 진행할 수 없습니다.', 'error');
        return;
      }

      const choices = answers.map(answer => {
        const required = Array.isArray(answer.required_evidence_ids) ? answer.required_evidence_ids.filter(Boolean) : [];
        const locked = required.some(evidenceId => !State.getEvidenceOwned(evidenceId));
        return {
          ...answer,
          text: answer.answer_text || answer.answer_id,
          type: locked ? 'choice-decision choice-locked' : 'choice-decision',
          locked,
          lockedHint: locked ? '필요한 단서를 아직 확보하지 못했습니다.' : '',
        };
      });
      if (!choices.some(choice => !choice.locked)) {
        console.error(`[Evidence] All forced answers are locked: ${sceneId} -> ${questionId}`);
        UIManager.showToast('선택할 수 있는 답변이 없어 진행할 수 없습니다.', 'error');
        return;
      }

      UIManager.renderChoiceList(choices, answer => {
        State.recordChoice(answer.answer_id);
        State.setBooleanState(`QuestionAnswered_${sceneId}_${questionId}`, true);

        if (answer.is_correct && !question.isSolved) {
          if (question.solvedStateId) State.markQuestionSolved(question.solvedStateId);
          incrementSolvedQuestionCount();
          applyQuestionReward(question);
        }

        UIManager.showToast(answer.result_text || '추론 결과가 기록되었습니다.', 'impact');
        Choice.applyEffectGroup(answer.effect_group_id);
        if (State.getGauge('Erosion') >= 10 || State.getGauge('Credibility') <= 0) return;

        const advance = () => {
          if (scene.question_mode === 'Any') finish();
          else showQuestion(index + 1);
        };
        if (answer.next_type === 'Scene' && answer.next_id) {
          State.setBooleanState(completedStateId, true);
          UIManager.setChoiceBoxVisible(false);
          Scene.load(answer.next_id);
          return;
        }
        if (answer.next_type === 'Dialog' && answer.next_id) {
          const lines = (scene.evidence_dialogues || {})[answer.next_id] || [];
          if (lines.length > 0) {
            UIManager.setChoiceBoxVisible(false);
            UIManager.setDialogueBoxVisible(true);
            Dialogue.start(lines, advance, null);
            return;
          }
          console.error(`[Evidence] Missing forced answer dialogue: ${sceneId} -> ${answer.next_id}`);
          UIManager.showToast('답변 후속 대사를 찾지 못해 진행할 수 없습니다.', 'error');
          return;
        }
        if (answer.next_type === 'Resume') {
          advance();
          return;
        }
        console.error(`[Evidence] Invalid forced answer navigation: ${answer.answer_id} -> ${answer.next_type}`);
        UIManager.showToast('답변의 다음 진행 설정이 올바르지 않습니다.', 'error');
      }, {
        kicker: '추론',
        title: question.title,
        hint: `${questionIds.indexOf(questionId) + 1} / ${questionIds.length} · 단서와 진술을 바탕으로 결론을 고르십시오.`,
      });
    };

    showQuestion(0);
    return true;
  }

  function renderNotebook() {
    const scene = Engine.data?.scenes?.[State.currentSceneId];
    const questions = getQuestionEntries();
    if (!questions.find(item => item.questionId === _selectedQuestionId)) {
      _selectedQuestionId = questions[0]?.questionId || null;
    }

    UIManager.renderNotebook({
      metaText: `단서 ${State.getEvidence().length}건 · ${scene?.title || State.currentSceneId || '대기 중'}`,
      statusCards: getStatusCards(),
      goal: getCurrentSceneGoal(),
      characters: getCharacterEntries(),
      evidenceGroups: prepareMemoData(),
      questions,
      selectedQuestionId: _selectedQuestionId,
    }, _activeTab, {
      onTabChange: (tab) => {
        _activeTab = tab;
        renderNotebook();
      },
      onQuestionSelect: (questionId) => {
        _selectedQuestionId = questionId;
        renderNotebook();
      }
    });
  }

  return {
    startQuestionCheckpoint,

    index(scenes) {
      _evidenceCategories = {};
      (Engine.data?.evidence_categories || []).forEach(category => {
        if (category?.category_id) {
          _evidenceCategories[category.category_id] = category;
        }
      });
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
        State.setBooleanState(`HasEvidence_${evidenceId}`, true);
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
      State.on('change', () => {
        if (this.isOpen()) renderNotebook();
      });

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
