(function () {
  'use strict';

  function renderGaugeList(ctx) {
    const { els, state, makeCard, rebindCardCollection, replaceEnumInputs, escapeAttr, markDirty, afterChange, swap, newGauge } = ctx;
    els.gaugeList.innerHTML = '';
    const rows = (state.data.gauges || []).map(item => ({
      GaugeID: item?.gauge_id || '',
      Label: item?.label || '',
      MinValue: item?.min_value ?? '',
      MaxValue: item?.max_value ?? '',
      DefaultValue: item?.default_value ?? '',
      HudVisible: item?.hud_visible === true ? 'true' : item?.hud_visible === false ? 'false' : '',
      HudOrder: item?.hud_order ?? '',
    }));

    const handleGaugeChange = (row, field, value) => {
      const target = state.data.gauges.find(item => (item.gauge_id || '') === row.GaugeID) || state.data.gauges.find((_, idx) => rows[idx] === row);
      if (!target) return;
      if (field === 'GaugeID') target.gauge_id = value || '';
      if (field === 'Label') target.label = value || '';
      if (field === 'MinValue') target.min_value = value === '' ? null : Number(value);
      if (field === 'MaxValue') target.max_value = value === '' ? null : Number(value);
      if (field === 'DefaultValue') target.default_value = value === '' ? null : Number(value);
      if (field === 'HudVisible') target.hud_visible = value === '' ? null : value === 'true';
      if (field === 'HudOrder') target.hud_order = value === '' ? null : Number.parseInt(value, 10);
      markDirty();
    };

    const cards = makeCard(
      'Gauge', rows,
      (row) => `
        <label><span>GaugeID</span>
          <input data-field="GaugeID" value="${escapeAttr(row.GaugeID || '')}" placeholder="예: Erosion"></label>
        <label><span>Label</span>
          <input data-field="Label" value="${escapeAttr(row.Label || '')}" placeholder="예: 침식"></label>
        <label><span>MinValue</span>
          <input data-field="MinValue" type="number" step="1" value="${escapeAttr(row.MinValue != null ? String(row.MinValue) : '')}"></label>
        <label><span>MaxValue</span>
          <input data-field="MaxValue" type="number" step="1" value="${escapeAttr(row.MaxValue != null ? String(row.MaxValue) : '')}"></label>
        <label><span>DefaultValue</span>
          <input data-field="DefaultValue" type="number" step="1" value="${escapeAttr(row.DefaultValue != null ? String(row.DefaultValue) : '')}"></label>
        <label><span>HudVisible</span>
          <input data-field="HudVisible" value="${escapeAttr(row.HudVisible || '')}" placeholder="true / false"></label>
        <label><span>HudOrder</span>
          <input data-field="HudOrder" type="number" step="1" value="${escapeAttr(row.HudOrder != null ? String(row.HudOrder) : '')}"></label>
      `,
      () => { state.data.gauges.push(newGauge()); afterChange(); },
      (i) => { state.data.gauges.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.gauges, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.gauges, i, i + 1)) afterChange(); },
      handleGaugeChange
    );

    replaceEnumInputs(cards, [
      { field: 'HudVisible', options: ['true', 'false'], includeBlank: true },
    ]);

    rebindCardCollection(cards, rows, handleGaugeChange);
    els.gaugeList.appendChild(cards);
  }

  function renderGaugeStateList(ctx) {
    const { els, state, makeCard, rebindCardCollection, replaceComboboxInputs, getDataOptions, escapeAttr, escapeHtml, markDirty, afterChange, swap, newGaugeState } = ctx;
    els.gaugeStateList.innerHTML = '';
    const rows = (state.data.gauge_states || []).map((item, index) => ({
      RowKey: `${item?.gauge_id || ''}::${index}`,
      GaugeID: item?.gauge_id || '',
      MinValue: item?.min_value ?? '',
      MaxValue: item?.max_value ?? '',
      Label: item?.label || '',
      HudColor: item?.hud_color || '',
      Detail: item?.detail || '',
      TriggerSceneID: item?.trigger_scene_id || '',
    }));

    const handleGaugeStateChange = (row, field, value) => {
      const target = state.data.gauge_states.find((item, index) => `${item?.gauge_id || ''}::${index}` === row.RowKey) || state.data.gauge_states.find((_, idx) => rows[idx] === row);
      if (!target) return;
      if (field === 'GaugeID') target.gauge_id = value || '';
      if (field === 'MinValue') target.min_value = value === '' ? null : Number(value);
      if (field === 'MaxValue') target.max_value = value === '' ? null : Number(value);
      if (field === 'Label') target.label = value || '';
      if (field === 'HudColor') target.hud_color = value || '';
      if (field === 'Detail') target.detail = value || '';
      if (field === 'TriggerSceneID') target.trigger_scene_id = value || null;
      markDirty();
    };

    const cards = makeCard(
      'GaugeState', rows,
      (row) => `
        <label><span>GaugeID</span>
          <input data-field="GaugeID" value="${escapeAttr(row.GaugeID || '')}" placeholder="예: Erosion"></label>
        <label><span>MinValue</span>
          <input data-field="MinValue" type="number" step="1" value="${escapeAttr(row.MinValue != null ? String(row.MinValue) : '')}"></label>
        <label><span>MaxValue</span>
          <input data-field="MaxValue" type="number" step="1" value="${escapeAttr(row.MaxValue != null ? String(row.MaxValue) : '')}"></label>
        <label><span>Label</span>
          <input data-field="Label" value="${escapeAttr(row.Label || '')}" placeholder="예: 안정"></label>
        <label><span>HudColor</span>
          <input data-field="HudColor" value="${escapeAttr(row.HudColor || '')}" placeholder="예: #6a9f6a"></label>
        <label><span>Detail</span>
          <textarea data-field="Detail" rows="2">${escapeHtml(row.Detail || '')}</textarea></label>
        <label><span>TriggerSceneID</span>
          <input data-field="TriggerSceneID" value="${escapeAttr(row.TriggerSceneID || '')}" placeholder="예: ch5_ritual"></label>
      `,
      () => { state.data.gauge_states.push(newGaugeState()); afterChange(); },
      (i) => { state.data.gauge_states.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.gauge_states, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.gauge_states, i, i + 1)) afterChange(); },
      handleGaugeStateChange
    );

    replaceComboboxInputs(cards, [
      { field: 'GaugeID', options: () => getDataOptions('gaugeIds') },
      { field: 'TriggerSceneID', options: () => getDataOptions('sceneIds') },
    ]);

    rebindCardCollection(cards, rows, handleGaugeStateChange);
    els.gaugeStateList.appendChild(cards);
  }

  function renderEffectList(ctx) {
    const { els, state, makeCard, rebindCardCollection, replaceEnumInputs, replaceComboboxInputs, getDataOptions, escapeAttr, markDirty, afterChange, swap, newEffect, editorDataUi } = ctx;
    els.effectList.innerHTML = '';
    const rows = (state.data.effects || []).map((item, index) => ({
      RowKey: `${item?.effect_group_id || ''}::${index}`,
      EffectGroupID: item?.effect_group_id || '',
      EffectType: item?.effect_type || '',
      GaugeID: item?.gauge_id || '',
      GaugeDelta: item?.gauge_delta ?? '',
      EvidenceID: item?.evidence_id || '',
      TrustCharacterID: item?.trust_character_id || '',
      TrustDelta: item?.trust_delta ?? '',
    }));

    const handleEffectChange = (row, field, value) => {
      const target = state.data.effects.find((item, index) => `${item?.effect_group_id || ''}::${index}` === row.RowKey) || state.data.effects.find((_, idx) => rows[idx] === row);
      if (!target) return;
      if (field === 'EffectGroupID') target.effect_group_id = value || '';
      if (field === 'EffectType') target.effect_type = value || '';
      if (field === 'GaugeID') target.gauge_id = value || null;
      if (field === 'GaugeDelta') target.gauge_delta = value === '' ? null : Number(value);
      if (field === 'EvidenceID') target.evidence_id = value || null;
      if (field === 'TrustCharacterID') target.trust_character_id = value || null;
      if (field === 'TrustDelta') target.trust_delta = value === '' ? null : Number(value);
      markDirty();
    };

    const cards = makeCard(
      'Effect', rows,
      (row) => `
        <label><span>EffectGroupID</span>
          <input data-field="EffectGroupID" value="${escapeAttr(row.EffectGroupID || '')}" placeholder="예: eff_choice"></label>
        <label><span>EffectType</span>
          <input data-field="EffectType" value="${escapeAttr(row.EffectType || '')}" placeholder="예: GaugeChange"></label>
        <label><span>GaugeID</span>
          <input data-field="GaugeID" value="${escapeAttr(row.GaugeID || '')}" placeholder="예: Credibility"></label>
        <label><span>GaugeDelta</span>
          <input data-field="GaugeDelta" type="number" step="1" value="${escapeAttr(row.GaugeDelta != null ? String(row.GaugeDelta) : '')}"></label>
        <label><span>EvidenceID</span>
          <input data-field="EvidenceID" value="${escapeAttr(row.EvidenceID || '')}" placeholder="예: EvDiary"></label>
        <label><span>TrustCharacterID</span>
          <input data-field="TrustCharacterID" value="${escapeAttr(row.TrustCharacterID || '')}" placeholder="예: Songsoon"></label>
        <label><span>TrustDelta</span>
          <input data-field="TrustDelta" type="number" step="1" value="${escapeAttr(row.TrustDelta != null ? String(row.TrustDelta) : '')}"></label>
      `,
      () => { state.data.effects.push(newEffect()); afterChange(); },
      (i) => { state.data.effects.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.effects, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.effects, i, i + 1)) afterChange(); },
      handleEffectChange
    );

    replaceEnumInputs(cards, [
      { field: 'EffectType', options: editorDataUi.EFFECT_TYPE_OPTIONS || ['GaugeChange', 'EvidenceGive', 'TrustChange'], includeBlank: false },
    ]);
    replaceComboboxInputs(cards, [
      { field: 'GaugeID', options: () => getDataOptions('gaugeIds') },
      { field: 'EvidenceID', options: () => getDataOptions('evidenceIds') },
      { field: 'TrustCharacterID', options: () => getDataOptions('characterIds') },
    ]);

    rebindCardCollection(cards, rows, handleEffectChange);
    els.effectList.appendChild(cards);
  }

  function renderCharacterList(ctx) {
    const {
      els,
      state,
      makeCard,
      rebindCardCollection,
      replaceEnumInputs,
      escapeAttr,
      escapeHtml,
      markDirty,
      afterChange,
      setStatus,
      renderPanel,
      renderNodes,
      renderAnalysisPanel,
      renderValidationPanel,
      renameCharacterId,
      emotionTypeOptions,
      attachAssetPreviews,
    } = ctx;

    els.characterList.innerHTML = '';
    const rows = Object.entries(state.data.characters || {}).map(([characterId, character]) => ({
      CharacterID: characterId,
      DisplayName: character?.display_name || '',
      DefaultEmotionType: character?.default_emotion_type || '',
      DefaultImagePath: character?.default_image_path || '',
      RoleText: character?.role_text || '',
      NotebookSummary1: character?.notebook_summary1 || '',
      NotebookSummary2: character?.notebook_summary2 || '',
    }));

    const handleCharacterChange = (row, field, value) => {
      const currentId = row.CharacterID;
      if (!state.data.characters[currentId]) {
        state.data.characters[currentId] = {
          id: currentId,
          display_name: '',
          default_emotion_type: '',
          default_image_path: '',
          role_text: '',
          notebook_summary1: '',
          notebook_summary2: '',
        };
      }

      if (field === 'CharacterID') {
        const nextId = (value || '').trim();
        if (!nextId) return;
        if (!renameCharacterId(currentId, nextId)) {
          setStatus('이미 존재하는 CharacterID입니다', true);
          renderPanel();
          return;
        }
        row.CharacterID = nextId;
        markDirty();
        renderPanel();
        return;
      }

      const target = state.data.characters[row.CharacterID];
      if (field === 'DisplayName') target.display_name = value || '';
      if (field === 'DefaultEmotionType') target.default_emotion_type = value || '';
      if (field === 'DefaultImagePath') target.default_image_path = value || '';
      if (field === 'RoleText') target.role_text = value || '';
      if (field === 'NotebookSummary1') target.notebook_summary1 = value || '';
      if (field === 'NotebookSummary2') target.notebook_summary2 = value || '';

      markDirty();
      renderNodes();
      renderAnalysisPanel();
      renderValidationPanel();
    };

    const cards = makeCard(
      'Character', rows,
      (row) => `
        <label><span>CharacterID</span>
          <input data-field="CharacterID" value="${escapeAttr(row.CharacterID || '')}" placeholder="예: Yuu"></label>
        <label><span>DisplayName</span>
          <input data-field="DisplayName" value="${escapeAttr(row.DisplayName || '')}" placeholder="예: 유웅룡"></label>
        <label><span>DefaultEmotionType</span>
          <input data-field="DefaultEmotionType" value="${escapeAttr(row.DefaultEmotionType || '')}" placeholder="예: Neutral"></label>
        <label><span>DefaultImagePath</span>
          <input data-field="DefaultImagePath" value="${escapeAttr(row.DefaultImagePath || '')}" placeholder="assets/standing/...">
          <img data-preview-for="DefaultImagePath" class="asset-thumb hidden" alt="캐릭터 이미지 미리보기"></label>
        <label><span>RoleText</span>
          <input data-field="RoleText" value="${escapeAttr(row.RoleText || '')}" placeholder="예: 증언자"></label>
        <label><span>NotebookSummary1</span>
          <textarea data-field="NotebookSummary1" rows="2">${escapeHtml(row.NotebookSummary1 || '')}</textarea></label>
        <label><span>NotebookSummary2</span>
          <textarea data-field="NotebookSummary2" rows="2">${escapeHtml(row.NotebookSummary2 || '')}</textarea></label>
      `,
      () => {
        const characterId = `Character${rows.length + 1}`;
        if (!state.data.characters) state.data.characters = {};
        state.data.characters[characterId] = {
          id: characterId,
          display_name: '',
          default_emotion_type: 'Neutral',
          default_image_path: '',
          role_text: '',
          notebook_summary1: '',
          notebook_summary2: '',
        };
        afterChange();
      },
      (i) => {
        const target = rows[i];
        if (!target) return;
        delete state.data.characters[target.CharacterID];
        delete state.data.character_emotions[target.CharacterID];
        Object.values(state.data.scenes || {}).forEach(scene => {
          (scene.dialogues || []).forEach(dialogue => {
            if (dialogue.speaker_id === target.CharacterID) dialogue.speaker_id = null;
          });
        });
        afterChange();
      },
      () => {},
      () => {},
      handleCharacterChange
    );

    replaceEnumInputs(cards, [
      { field: 'DefaultEmotionType', options: emotionTypeOptions },
    ]);

    rebindCardCollection(cards, rows, handleCharacterChange);
    attachAssetPreviews(cards, ['DefaultImagePath']);
    els.characterList.appendChild(cards);
  }

  function renderCharacterEmotionList(ctx) {
    const {
      els,
      state,
      makeCard,
      rebindCardCollection,
      replaceEnumInputs,
      replaceCharacterIdInputs,
      escapeAttr,
      markDirty,
      afterChange,
      setStatus,
      renderPanel,
      moveCharacterEmotion,
      syncCharacterEmotionBuckets,
      emotionTypeOptions,
      attachAssetPreviews,
    } = ctx;

    els.characterEmotionList.innerHTML = '';
    const rows = [];
    Object.entries(state.data.character_emotions || {}).forEach(([characterId, emotionMap]) => {
      Object.entries(emotionMap || {}).forEach(([emotionType, imagePath]) => {
        rows.push({
          CharacterID: characterId,
          EmotionType: emotionType,
          ImagePath: imagePath || '',
        });
      });
    });

    const handleCharacterEmotionChange = (row, field, value) => {
      const currentCharacterId = row.CharacterID;
      const currentEmotionType = row.EmotionType;

      if (field === 'ImagePath') {
        if (!state.data.character_emotions[currentCharacterId]) state.data.character_emotions[currentCharacterId] = {};
        state.data.character_emotions[currentCharacterId][currentEmotionType] = value || '';
      } else {
        const nextCharacterId = field === 'CharacterID' ? value : row.CharacterID;
        const nextEmotionType = field === 'EmotionType' ? value : row.EmotionType;
        const imagePath = state.data.character_emotions?.[currentCharacterId]?.[currentEmotionType] || row.ImagePath || '';
        if (!moveCharacterEmotion(currentCharacterId, currentEmotionType, nextCharacterId, nextEmotionType, imagePath)) {
          setStatus('CharacterID와 EmotionType은 비워둘 수 없습니다', true);
          renderPanel();
          return;
        }
        row.CharacterID = (nextCharacterId || '').trim();
        row.EmotionType = (nextEmotionType || '').trim();
        syncCharacterEmotionBuckets();
        markDirty();
        renderPanel();
        return;
      }

      syncCharacterEmotionBuckets();
      markDirty();
    };

    const cards = makeCard(
      'CharacterEmotion', rows,
      (row) => `
        <label><span>CharacterID</span>
          <input data-field="CharacterID" value="${escapeAttr(row.CharacterID || '')}" placeholder="예: Yuu"></label>
        <label><span>EmotionType</span>
          <input data-field="EmotionType" value="${escapeAttr(row.EmotionType || '')}" placeholder="예: Neutral"></label>
        <label><span>ImagePath</span>
          <input data-field="ImagePath" value="${escapeAttr(row.ImagePath || '')}" placeholder="assets/standing/...">
          <img data-preview-for="ImagePath" class="asset-thumb hidden" alt="감정 이미지 미리보기"></label>
      `,
      () => {
        if (!state.data.character_emotions) state.data.character_emotions = {};
        if (!state.data.character_emotions.__NewCharacter__) state.data.character_emotions.__NewCharacter__ = {};
        state.data.character_emotions.__NewCharacter__.Neutral = '';
        afterChange();
      },
      (i) => {
        const target = rows[i];
        if (!target) return;
        if (state.data.character_emotions?.[target.CharacterID]) {
          delete state.data.character_emotions[target.CharacterID][target.EmotionType];
          if (Object.keys(state.data.character_emotions[target.CharacterID]).length === 0) {
            delete state.data.character_emotions[target.CharacterID];
          }
        }
        afterChange();
      },
      () => {},
      () => {},
      handleCharacterEmotionChange
    );

    replaceCharacterIdInputs(cards, 'CharacterID');
    replaceEnumInputs(cards, [
      { field: 'EmotionType', options: emotionTypeOptions, includeBlank: false },
    ]);

    rebindCardCollection(cards, rows, handleCharacterEmotionChange);
    attachAssetPreviews(cards, ['ImagePath']);
    els.characterEmotionList.appendChild(cards);
  }

  function renderEvidenceCategoryList(ctx) {
    const {
      els,
      state,
      makeCard,
      escapeAttr,
      escapeHtml,
      markDirty,
      afterChange,
      swap,
      newEvidenceCategory,
    } = ctx;

    els.evidenceCategoryList.innerHTML = '';
    const rows = (state.data.evidence_categories || []).map(item => ({
      CategoryID: item?.category_id || '',
      CategoryTitle: item?.category_title || '',
      CategoryHint: item?.category_hint || '',
    }));

    const cards = makeCard(
      'EvidenceCategory', rows,
      (row) => `
        <label><span>CategoryID</span>
          <input data-field="CategoryID" value="${escapeAttr(row.CategoryID || '')}" placeholder="예: ritual"></label>
        <label><span>CategoryTitle</span>
          <input data-field="CategoryTitle" value="${escapeAttr(row.CategoryTitle || '')}" placeholder="예: 의례와 공명"></label>
        <label><span>CategoryHint</span>
          <textarea data-field="CategoryHint" rows="2">${escapeHtml(row.CategoryHint || '')}</textarea></label>
      `,
      () => { state.data.evidence_categories.push(newEvidenceCategory()); afterChange(); },
      (i) => { state.data.evidence_categories.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.evidence_categories, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.evidence_categories, i, i + 1)) afterChange(); },
      (row, field, value) => {
        const target = state.data.evidence_categories.find(item => (item.category_id || '') === row.CategoryID) || state.data.evidence_categories.find((_, idx) => rows[idx] === row);
        if (!target) return;
        if (field === 'CategoryID') target.category_id = value || '';
        if (field === 'CategoryTitle') target.category_title = value || '';
        if (field === 'CategoryHint') target.category_hint = value || '';
        markDirty();
      }
    );

    els.evidenceCategoryList.appendChild(cards);
  }

  function renderQuestionList(ctx) {
    const {
      els,
      state,
      makeCard,
      rebindCardCollection,
      replaceEnumInputs,
      replaceComboboxInputs,
      replaceMultiSelectInputs,
      getDataOptions,
      escapeAttr,
      escapeHtml,
      markDirty,
      afterChange,
      swap,
      newQuestion,
      setStatus,
      questionResolutionTypeOptions,
      questionSolutionModeOptions,
      questionRewardModeOptions,
    } = ctx;

    els.questionList.innerHTML = '';
    const rows = (state.data.questions || []).map(question => ({
      QuestionID: question?.question_id || '',
      Title: question?.title || '',
      Detail: question?.detail || '',
      SortOrder: question?.sort_order ?? '',
      Category: question?.category || '',
      ResolutionType: question?.resolution_type || 'Evidence',
      VisibleConditionGroupIDs: Array.isArray(question?.visible_condition_group_ids) ? question.visible_condition_group_ids.join(', ') : '',
      RelatedEvidenceIDs: Array.isArray(question?.related_evidence_ids) ? question.related_evidence_ids.join(', ') : '',
      SolutionEvidenceIDs: Array.isArray(question?.solution_evidence_ids) ? question.solution_evidence_ids.join(', ') : '',
      SolutionMode: question?.solution_mode || '',
      ContradictionPrompt: question?.contradiction_prompt || '',
      ContradictionStatement: question?.contradiction_statement || '',
      SolvedStateID: question?.solved_state_id || '',
      ResolvedDetail: question?.resolved_detail || '',
      SuccessToast: question?.success_toast || '',
      FailureToast: question?.failure_toast || '',
      RewardStateID: question?.reward_state_id || '',
      RewardValue: question?.reward_value ?? '',
      RewardMode: question?.reward_mode || '',
    }));

    const createStateCondition = () => ({
      condition_group_id: '',
      result_value: '',
      priority: null,
    });

    const findQuestionTarget = (row) => (
      state.data.questions.find(question => (question.question_id || '') === row.QuestionID)
      || state.data.questions.find((_, idx) => rows[idx] === row)
    );

    const handleQuestionChange = (row, field, value) => {
      const target = findQuestionTarget(row);
      if (!target) return;
      if (field === 'QuestionID') target.question_id = value || '';
      if (field === 'Title') target.title = value || '';
      if (field === 'Detail') target.detail = value || '';
      if (field === 'SortOrder') target.sort_order = value === '' ? null : Number.parseInt(value, 10);
      if (field === 'Category') target.category = value || '';
      if (field === 'ResolutionType') target.resolution_type = value || 'Evidence';
      if (field === 'VisibleConditionGroupIDs') {
        target.visible_condition_group_ids = String(value || '').split(',').map(part => part.trim()).filter(Boolean);
      }
      if (field === 'RelatedEvidenceIDs') target.related_evidence_ids = String(value || '').split(',').map(part => part.trim()).filter(Boolean);
      if (field === 'SolutionEvidenceIDs') target.solution_evidence_ids = String(value || '').split(',').map(part => part.trim()).filter(Boolean);
      if (field === 'SolutionMode') target.solution_mode = value || '';
      if (field === 'ContradictionPrompt') target.contradiction_prompt = value || '';
      if (field === 'ContradictionStatement') target.contradiction_statement = value || '';
      if (field === 'SolvedStateID') target.solved_state_id = value || '';
      if (field === 'ResolvedDetail') target.resolved_detail = value || '';
      if (field === 'SuccessToast') target.success_toast = value || '';
      if (field === 'FailureToast') target.failure_toast = value || '';
      if (field === 'RewardStateID') target.reward_state_id = value || '';
      if (field === 'RewardValue') target.reward_value = value === '' ? null : (/^-?\d+(\.\d+)?$/.test(String(value)) ? Number(value) : value);
      if (field === 'RewardMode') target.reward_mode = value || '';
      markDirty();
    };

    const renderQuestionStateConditions = (card, row) => {
      const host = card.querySelector('[data-role="question-state-conditions"]');
      if (!host) return;
      const target = findQuestionTarget(row);
      if (!target) {
        host.innerHTML = '';
        return;
      }
      target.state_conditions = Array.isArray(target.state_conditions) ? target.state_conditions : [];
      host.innerHTML = '';

      const conditionRows = target.state_conditions.map((item, index) => ({
        RowKey: `${row.QuestionID || 'question'}::${index}`,
        ConditionGroupID: item?.condition_group_id || '',
        ResultValue: item?.result_value || '',
        Priority: item?.priority ?? '',
      }));

      const handleStateConditionChange = (conditionRow, field, value) => {
        const stateCondition = target.state_conditions.find((item, index) => `${row.QuestionID || 'question'}::${index}` === conditionRow.RowKey)
          || target.state_conditions.find((_, index) => conditionRows[index] === conditionRow);
        if (!stateCondition) return;
        if (field === 'ConditionGroupID') stateCondition.condition_group_id = value || '';
        if (field === 'ResultValue') stateCondition.result_value = value || '';
        if (field === 'Priority') stateCondition.priority = value === '' ? null : Number.parseInt(value, 10);
        markDirty();
      };

      const stateConditionCards = makeCard(
        'StateCondition',
        conditionRows,
        (conditionRow) => `
          <label><span>ConditionGroupID</span>
            <input data-field="ConditionGroupID" value="${escapeAttr(conditionRow.ConditionGroupID || '')}" placeholder="예: CG_QS_SonggeumMissing_01"></label>
          <label><span>ResultValue</span>
            <input data-field="ResultValue" value="${escapeAttr(conditionRow.ResultValue || '')}" placeholder="예: 해결됨"></label>
          <label><span>Priority</span>
            <input data-field="Priority" type="number" step="1" value="${escapeAttr(conditionRow.Priority != null ? String(conditionRow.Priority) : '')}" placeholder="예: 1"></label>
        `,
        () => { target.state_conditions.push(createStateCondition()); afterChange(); },
        (index) => { target.state_conditions.splice(index, 1); afterChange(); },
        (index) => { if (swap(target.state_conditions, index - 1, index)) afterChange(); },
        (index) => { if (swap(target.state_conditions, index, index + 1)) afterChange(); },
        handleStateConditionChange
      );

      replaceComboboxInputs(stateConditionCards, [
        { field: 'ConditionGroupID', options: () => getDataOptions('conditionGroupIds') },
      ]);
      rebindCardCollection(stateConditionCards, conditionRows, handleStateConditionChange);
      host.appendChild(stateConditionCards);
    };

    const cards = makeCard(
      'Question', rows,
      (row) => `
        <label><span>QuestionID</span>
          <input data-field="QuestionID" value="${escapeAttr(row.QuestionID || '')}" placeholder="예: QSonggeumMissing"></label>
        <label><span>Title</span>
          <input data-field="Title" value="${escapeAttr(row.Title || '')}" placeholder="질문 제목"></label>
        <label><span>Detail</span>
          <textarea data-field="Detail" rows="3">${escapeHtml(row.Detail || '')}</textarea></label>
        <label><span>SortOrder</span>
          <input data-field="SortOrder" type="number" min="0" step="1" value="${escapeAttr(row.SortOrder != null ? String(row.SortOrder) : '')}"></label>
        <label><span>Category</span>
          <input data-field="Category" value="${escapeAttr(row.Category || '')}" placeholder="예: Missing"></label>
        <label><span>ResolutionType</span>
          <input data-field="ResolutionType" value="${escapeAttr(row.ResolutionType || 'Evidence')}" placeholder="Evidence / Contradiction"></label>
        <label><span>VisibleConditionGroupIDs</span>
          <input data-field="VisibleConditionGroupIDs" value="${escapeAttr(row.VisibleConditionGroupIDs || '')}" placeholder="예: CG_QSonggeumOpen_01, CG_QSonggeumOpen_02"></label>
        <div class="nested-card-group">
          <div class="section-label">StateConditions</div>
          <div data-role="question-state-conditions"></div>
        </div>
        <label><span>RelatedEvidenceIDs</span>
          <input data-field="RelatedEvidenceIDs" value="${escapeAttr(row.RelatedEvidenceIDs || '')}" placeholder="예: EvDiary, EvOldArticles"></label>
        <label><span>SolutionEvidenceIDs</span>
          <input data-field="SolutionEvidenceIDs" value="${escapeAttr(row.SolutionEvidenceIDs || '')}" placeholder="예: EvRitualScore, EvRitualNote"></label>
        <label><span>SolutionMode</span>
          <input data-field="SolutionMode" value="${escapeAttr(row.SolutionMode || '')}" placeholder="Any / All"></label>
        <label><span>ContradictionPrompt</span>
          <textarea data-field="ContradictionPrompt" rows="2">${escapeHtml(row.ContradictionPrompt || '')}</textarea></label>
        <label><span>ContradictionStatement</span>
          <textarea data-field="ContradictionStatement" rows="3">${escapeHtml(row.ContradictionStatement || '')}</textarea></label>
        <label><span>SolvedStateID</span>
          <input data-field="SolvedStateID" value="${escapeAttr(row.SolvedStateID || '')}" placeholder="예: QuestionSolved_QSonggeumMissing"></label>
        <label><span>ResolvedDetail</span>
          <textarea data-field="ResolvedDetail" rows="3">${escapeHtml(row.ResolvedDetail || '')}</textarea></label>
        <label><span>SuccessToast</span>
          <textarea data-field="SuccessToast" rows="2">${escapeHtml(row.SuccessToast || '')}</textarea></label>
        <label><span>FailureToast</span>
          <textarea data-field="FailureToast" rows="2">${escapeHtml(row.FailureToast || '')}</textarea></label>
        <label><span>RewardStateID</span>
          <input data-field="RewardStateID" value="${escapeAttr(row.RewardStateID || '')}" placeholder="예: InvestigationScore"></label>
        <label><span>RewardValue</span>
          <input data-field="RewardValue" value="${escapeAttr(row.RewardValue != null ? String(row.RewardValue) : '')}" placeholder="예: 1"></label>
        <label><span>RewardMode</span>
          <input data-field="RewardMode" value="${escapeAttr(row.RewardMode || '')}" placeholder="Set / Add"></label>
      `,
      () => { state.data.questions.push(newQuestion()); afterChange(); },
      (i) => { state.data.questions.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.questions, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.questions, i, i + 1)) afterChange(); },
      handleQuestionChange
    );

    replaceEnumInputs(cards, [
      { field: 'ResolutionType', options: questionResolutionTypeOptions, includeBlank: false },
      { field: 'SolutionMode', options: questionSolutionModeOptions, includeBlank: true },
      { field: 'RewardMode', options: questionRewardModeOptions, includeBlank: true },
    ]);
    replaceMultiSelectInputs(cards, [
      { field: 'VisibleConditionGroupIDs', options: () => getDataOptions('conditionGroupIds'), size: 6 },
      { field: 'RelatedEvidenceIDs', options: () => getDataOptions('evidenceIds'), size: 6 },
      { field: 'SolutionEvidenceIDs', options: () => getDataOptions('evidenceIds'), size: 6 },
    ]);
    replaceComboboxInputs(cards, [
      { field: 'SolvedStateID', options: () => getDataOptions('booleanStateIds') },
      { field: 'RewardStateID', options: () => getDataOptions('numericStateIds') },
    ]);

    rebindCardCollection(cards, rows, handleQuestionChange);
    cards.querySelectorAll('.pcard').forEach((card, index) => {
      renderQuestionStateConditions(card, rows[index]);
    });
    els.questionList.appendChild(cards);
  }

  function renderConditionList(ctx) {
    const {
      els,
      state,
      makeCard,
      rebindCardCollection,
      replaceEnumInputs,
      replaceComboboxInputs,
      renderSelectOptions,
      escapeAttr,
      markDirty,
      afterChange,
      swap,
      newCondition,
      editorDataUi,
      conditionTypeOptions,
      compareTypeOptions,
    } = ctx;

    els.conditionList.innerHTML = '';
    const rows = (state.data.conditions || []).map(item => ({
      ConditionID: item?.condition_id || '',
      ConditionGroupID: item?.condition_group_id || '',
      ConditionType: item?.condition_type || '',
      ConditionTargetID: item?.condition_target_id ?? '',
      CompareType: item?.compare_type || '',
      ConditionValue: item?.condition_value ?? '',
    }));

    const handleConditionChange = (row, field, value) => {
      const target = state.data.conditions.find(item => (item.condition_id || '') === row.ConditionID) || state.data.conditions.find((_, idx) => rows[idx] === row);
      if (!target) return;
      if (field === 'ConditionID') target.condition_id = value || '';
      if (field === 'ConditionGroupID') target.condition_group_id = value || '';
      if (field === 'ConditionType') target.condition_type = value || '';
      if (field === 'ConditionTargetID') target.condition_target_id = value === '' ? null : value;
      if (field === 'CompareType') target.compare_type = value || '';
      if (field === 'ConditionValue') target.condition_value = value === '' ? null : value;
      markDirty();
      if (field === 'ConditionType' || field === 'CompareType') renderConditionList(ctx);
    };

    const booleanConditionTypes = new Set(['ChoiceSelected', 'EvidenceOwned', 'RevealedCharacter', 'SceneVisited']);
    const numericConditionTypes = new Set(['GaugeValue', 'Trust', 'SceneProgressIndex']);

    const applyConditionValueInputs = (container) => {
      container.querySelectorAll('.pcard').forEach(card => {
        const typeSelect = card.querySelector('[data-field="ConditionType"]');
        const valueInput = card.querySelector('[data-field="ConditionValue"]');
        if (!typeSelect || !valueInput) return;
        const conditionType = typeSelect.value || '';

        if (booleanConditionTypes.has(conditionType)) {
          const select = document.createElement('select');
          select.dataset.field = 'ConditionValue';
          select.innerHTML = renderSelectOptions(['true', 'false'], valueInput.value || '', true);
          valueInput.replaceWith(select);
          return;
        }

        if (numericConditionTypes.has(conditionType) && valueInput.tagName === 'INPUT') {
          valueInput.type = 'number';
          valueInput.step = '1';
          valueInput.placeholder = '예: 1';
          return;
        }

        if (valueInput.tagName === 'INPUT') {
          valueInput.type = 'text';
        }
      });
    };

    const cards = makeCard(
      'Condition', rows,
      (row) => `
        <label><span>ConditionID</span>
          <input data-field="ConditionID" value="${escapeAttr(row.ConditionID || '')}" placeholder="예: C0001"></label>
        <label><span>ConditionGroupID</span>
          <input data-field="ConditionGroupID" value="${escapeAttr(row.ConditionGroupID || '')}" placeholder="예: CG_SonggeumOpen"></label>
        <label><span>ConditionType</span>
          <input data-field="ConditionType" value="${escapeAttr(row.ConditionType || '')}" placeholder="예: EvidenceOwned"></label>
        <label><span>ConditionTargetID</span>
          <input data-field="ConditionTargetID" value="${escapeAttr(row.ConditionTargetID != null ? String(row.ConditionTargetID) : '')}" placeholder="예: EvDiary"></label>
        <label><span>CompareType</span>
          <input data-field="CompareType" value="${escapeAttr(row.CompareType || '')}" placeholder="예: Equal"></label>
        <label><span>ConditionValue</span>
          <input data-field="ConditionValue" value="${escapeAttr(row.ConditionValue != null ? String(row.ConditionValue) : '')}" placeholder="예: true"></label>
      `,
      () => { state.data.conditions.push(newCondition()); afterChange(); },
      (i) => { state.data.conditions.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.conditions, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.conditions, i, i + 1)) afterChange(); },
      handleConditionChange
    );

    replaceEnumInputs(cards, [
      { field: 'ConditionType', options: conditionTypeOptions, includeBlank: false },
      { field: 'CompareType', options: compareTypeOptions, includeBlank: false },
    ]);

    cards.querySelectorAll('.pcard').forEach(card => {
      const typeSelect = card.querySelector('[data-field="ConditionType"]');
      const targetInput = card.querySelector('[data-field="ConditionTargetID"]');
      if (!typeSelect || !targetInput) return;
      const options = typeof editorDataUi.getConditionTargetOptions === 'function'
        ? editorDataUi.getConditionTargetOptions(state.data, typeSelect.value)
        : [];
      if (options.length === 0) return;
      replaceComboboxInputs(card, [
        { field: 'ConditionTargetID', options },
      ]);
    });

    applyConditionValueInputs(cards);

    rebindCardCollection(cards, rows, handleConditionChange);
    els.conditionList.appendChild(cards);
  }

  function renderChoiceGroupList(ctx) {
    const {
      els,
      state,
      makeCard,
      rebindCardCollection,
      replaceEnumInputs,
      replaceComboboxInputs,
      getDataOptions,
      escapeAttr,
      markDirty,
      afterChange,
      swap,
      newChoiceGroup,
      choiceGroupTypeOptions,
    } = ctx;

    els.choiceGroupList.innerHTML = '';
    const rows = (state.data.choice_groups || []).map(item => ({
      ChoiceGroupID: item?.choice_group_id || '',
      Type: item?.type || 'Normal',
      ConditionGroupID: item?.condition_group_id || '',
      MaxSelectable: item?.max_selectable ?? '',
    }));

    const handleChoiceGroupChange = (row, field, value) => {
      const target = state.data.choice_groups.find(item => (item.choice_group_id || '') === row.ChoiceGroupID) || state.data.choice_groups.find((_, idx) => rows[idx] === row);
      if (!target) return;
      if (field === 'ChoiceGroupID') target.choice_group_id = value || '';
      if (field === 'Type') target.type = value || 'Normal';
      if (field === 'ConditionGroupID') target.condition_group_id = value || '';
      if (field === 'MaxSelectable') target.max_selectable = value === '' ? null : Number.parseInt(value, 10);
      markDirty();
    };

    const cards = makeCard(
      'ChoiceGroup', rows,
      (row) => `
        <label><span>ChoiceGroupID</span>
          <input data-field="ChoiceGroupID" value="${escapeAttr(row.ChoiceGroupID || '')}" placeholder="예: CG_CafeInvestigation"></label>
        <label><span>Type</span>
          <input data-field="Type" value="${escapeAttr(row.Type || '')}" placeholder="예: Investigation"></label>
        <label><span>ConditionGroupID</span>
          <input data-field="ConditionGroupID" value="${escapeAttr(row.ConditionGroupID || '')}" placeholder="예: CG_Visible"></label>
        <label><span>MaxSelectable</span>
          <input data-field="MaxSelectable" type="number" min="0" step="1" value="${escapeAttr(row.MaxSelectable != null ? String(row.MaxSelectable) : '')}"></label>
      `,
      () => { state.data.choice_groups.push(newChoiceGroup()); afterChange(); },
      (i) => { state.data.choice_groups.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.choice_groups, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.choice_groups, i, i + 1)) afterChange(); },
      handleChoiceGroupChange
    );

    replaceEnumInputs(cards, [
      { field: 'Type', options: choiceGroupTypeOptions, includeBlank: false },
    ]);
    replaceComboboxInputs(cards, [
      { field: 'ConditionGroupID', options: () => getDataOptions('conditionGroupIds') },
    ]);
    rebindCardCollection(cards, rows, handleChoiceGroupChange);
    els.choiceGroupList.appendChild(cards);
  }

  function renderInvestigationList(ctx) {
    const {
      els,
      state,
      makeCard,
      rebindCardCollection,
      replaceComboboxInputs,
      getDataOptions,
      escapeAttr,
      escapeHtml,
      markDirty,
      afterChange,
      swap,
      newInvestigation,
    } = ctx;

    els.investigationList.innerHTML = '';
    const rows = (state.data.investigations || []).map(item => ({
      InvestigationID: item?.investigation_id || '',
      Title: item?.title || '',
      Hint: item?.hint || '',
      Budget: item?.budget ?? '',
      ChoiceGroupID: item?.choice_group_id || '',
    }));

    const handleInvestigationChange = (row, field, value) => {
      const target = state.data.investigations.find(item => (item.investigation_id || '') === row.InvestigationID) || state.data.investigations.find((_, idx) => rows[idx] === row);
      if (!target) return;
      if (field === 'InvestigationID') target.investigation_id = value || '';
      if (field === 'Title') target.title = value || '';
      if (field === 'Hint') target.hint = value || '';
      if (field === 'Budget') target.budget = value === '' ? null : Number.parseInt(value, 10);
      if (field === 'ChoiceGroupID') target.choice_group_id = value || '';
      markDirty();
    };

    const cards = makeCard(
      'Investigation', rows,
      (row) => `
        <label><span>InvestigationID</span>
          <input data-field="InvestigationID" value="${escapeAttr(row.InvestigationID || '')}" placeholder="예: INV_Cafe"></label>
        <label><span>Title</span>
          <input data-field="Title" value="${escapeAttr(row.Title || '')}" placeholder="조사 제목"></label>
        <label><span>Hint</span>
          <textarea data-field="Hint" rows="2">${escapeHtml(row.Hint || '')}</textarea></label>
        <label><span>Budget</span>
          <input data-field="Budget" type="number" min="0" step="1" value="${escapeAttr(row.Budget != null ? String(row.Budget) : '')}"></label>
        <label><span>ChoiceGroupID</span>
          <input data-field="ChoiceGroupID" value="${escapeAttr(row.ChoiceGroupID || '')}" placeholder="예: CG_CafeInvestigation"></label>
      `,
      () => { state.data.investigations.push(newInvestigation()); afterChange(); },
      (i) => { state.data.investigations.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.investigations, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.investigations, i, i + 1)) afterChange(); },
      handleInvestigationChange
    );

    replaceComboboxInputs(cards, [
      { field: 'ChoiceGroupID', options: () => getDataOptions('choiceGroupIds') },
    ]);
    rebindCardCollection(cards, rows, handleInvestigationChange);
    els.investigationList.appendChild(cards);
  }

  function renderStateDescriptorList(ctx) {
    const {
      els,
      state,
      makeCard,
      rebindCardCollection,
      replaceEnumInputs,
      replaceComboboxInputs,
      escapeAttr,
      escapeHtml,
      markDirty,
      afterChange,
      swap,
      newStateDescriptor,
      stateTypeOptions,
      stateDescriptorTypeOptions,
    } = ctx;

    els.stateDescriptorList.innerHTML = '';
    const rows = (state.data.state_descriptors || []).map(descriptor => ({
      DescriptorID: descriptor?.descriptor_id || '',
      TargetStateType: descriptor?.target_state_type || 'Numeric',
      TargetStateID: descriptor?.target_state_id || '',
      MinValue: descriptor?.min_value ?? '',
      MaxValue: descriptor?.max_value ?? '',
      Label: descriptor?.label || '',
      Detail: descriptor?.detail || '',
    }));

    const handleStateDescriptorChange = (row, field, value) => {
      const target = state.data.state_descriptors.find(descriptor => (descriptor.descriptor_id || '') === row.DescriptorID) || state.data.state_descriptors.find((_, idx) => rows[idx] === row);
      if (!target) return;
      if (field === 'DescriptorID') target.descriptor_id = value || '';
      if (field === 'TargetStateType') {
        target.target_state_type = value || 'Numeric';
        target.target_state_id = '';
      }
      if (field === 'TargetStateID') target.target_state_id = value || '';
      if (field === 'MinValue') target.min_value = value === '' ? null : Number(value);
      if (field === 'MaxValue') target.max_value = value === '' ? null : Number(value);
      if (field === 'Label') target.label = value || '';
      if (field === 'Detail') target.detail = value || '';
      markDirty();
      if (field === 'TargetStateType') renderStateDescriptorList(ctx);
    };

    const cards = makeCard(
      'StateDescriptor', rows,
      (row) => `
        <label><span>DescriptorID</span>
          <input data-field="DescriptorID" value="${escapeAttr(row.DescriptorID || '')}" placeholder="예: SD_Resonance_0"></label>
        <label><span>TargetStateType</span>
          <input data-field="TargetStateType" value="${escapeAttr(row.TargetStateType || 'Numeric')}" placeholder="Numeric / Derived"></label>
        <label><span>TargetStateID</span>
          <input data-field="TargetStateID" value="${escapeAttr(row.TargetStateID || '')}" placeholder="예: ResonanceLevel"></label>
        <label><span>MinValue</span>
          <input data-field="MinValue" type="number" step="1" value="${escapeAttr(row.MinValue != null ? String(row.MinValue) : '')}"></label>
        <label><span>MaxValue</span>
          <input data-field="MaxValue" type="number" step="1" value="${escapeAttr(row.MaxValue != null ? String(row.MaxValue) : '')}"></label>
        <label><span>Label</span>
          <input data-field="Label" value="${escapeAttr(row.Label || '')}" placeholder="예: 전조"></label>
        <label><span>Detail</span>
          <textarea data-field="Detail" rows="3">${escapeHtml(row.Detail || '')}</textarea></label>
      `,
      () => { state.data.state_descriptors.push(newStateDescriptor()); afterChange(); },
      (i) => { state.data.state_descriptors.splice(i, 1); afterChange(); },
      (i) => { if (swap(state.data.state_descriptors, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.state_descriptors, i, i + 1)) afterChange(); },
      handleStateDescriptorChange
    );

    replaceEnumInputs(cards, [
      { field: 'TargetStateType', options: stateDescriptorTypeOptions, includeBlank: false },
    ]);
    cards.querySelectorAll('.pcard').forEach((card, index) => {
      const row = rows[index];
      replaceComboboxInputs(card, [
        { field: 'TargetStateID', options: () => stateTypeOptions(row?.TargetStateType || 'Numeric') },
      ]);
    });
    rebindCardCollection(cards, rows, handleStateDescriptorChange);
    els.stateDescriptorList.appendChild(cards);
  }

  window.EditorDataPanels = {
    renderCharacterList,
    renderCharacterEmotionList,
    renderConditionList,
    renderChoiceGroupList,
    renderEvidenceCategoryList,
    renderInvestigationList,
    renderQuestionList,
    renderStateDescriptorList,
    renderGaugeList,
    renderGaugeStateList,
    renderEffectList,
  };
})();
