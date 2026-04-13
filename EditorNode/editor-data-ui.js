(function () {
  'use strict';

  const DATA_TABS = [
    { id: 'characters', label: '캐릭터' },
    { id: 'character-emotions', label: '감정' },
    { id: 'conditions', label: '조건' },
    { id: 'gauges', label: '게이지' },
    { id: 'gauge-states', label: '게이지상태' },
    { id: 'effects', label: '이펙트' },
    { id: 'choice-groups', label: '선택그룹' },
    { id: 'evidence-categories', label: '단서분류' },
    { id: 'investigations', label: '조사' },
    { id: 'questions', label: '질문' },
    { id: 'state-descriptors', label: '상태' },
  ];

  const CONDITION_TYPE_OPTIONS = [
    'GaugeValue',
    'Trust',
    'EvidenceOwned',
    'ChoiceSelected',
    'RevealedCharacter',
    'SceneProgressIndex',
    'SceneVisited',
  ];

  const NUMERIC_STATE_OPTIONS = [
    'ResonanceLevel',
    'InvestigationScore',
    'SongsoonTrust',
    'ReadRitualScore',
    'SolvedQuestionCount',
  ];
  const DERIVED_STATE_OPTIONS = ['InvestigationProgress'];
  const STATE_DESCRIPTOR_TYPE_OPTIONS = ['Numeric', 'Derived'];

  const ANSWER_TYPE_OPTIONS = ['Text', 'Evidence'];
  const EFFECT_TYPE_OPTIONS = ['GaugeChange', 'EvidenceGive', 'TrustChange'];
  const QUESTION_SOLUTION_MODE_OPTIONS = ['Any', 'All'];
  const QUESTION_REWARD_MODE_OPTIONS = ['Set', 'Add'];

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort();
  }

  function collectChoiceIds(data) {
    const ids = [];
    Object.values(data?.scenes || {}).forEach(scene => {
      (scene?.choices || []).forEach(choice => {
        if (choice?.choice_id) ids.push(choice.choice_id);
      });
    });
    (data?.questions || []).forEach(question => {
      if (question?.solved_state_id) ids.push(question.solved_state_id);
    });
    return uniqueSorted(ids);
  }

  function collectDialogIds(data) {
    const ids = [];
    Object.values(data?.scenes || {}).forEach(scene => {
      (scene?.dialogues || []).forEach(dialogue => {
        if (dialogue?.dialog_id) ids.push(dialogue.dialog_id);
      });
    });
    return uniqueSorted(ids);
  }

  function collectSceneIds(data) {
    return Object.keys(data?.scenes || {}).sort();
  }

  function collectCharacterIds(data) {
    return Object.keys(data?.characters || {}).sort();
  }

  function collectEvidenceIds(data) {
    const ids = [];
    Object.values(data?.scenes || {}).forEach(scene => {
      (scene?.evidence || []).forEach(evidence => {
        if (evidence?.evidence_id || evidence?.id) ids.push(evidence.evidence_id || evidence.id);
      });
    });
    return uniqueSorted(ids);
  }

  function collectConditionGroupIds(data) {
    return uniqueSorted((data?.conditions || []).map(condition => condition?.condition_group_id));
  }

  function collectChoiceGroupIds(data) {
    return uniqueSorted((data?.choice_groups || []).map(item => item?.choice_group_id));
  }

  function collectInvestigationIds(data) {
    return uniqueSorted((data?.investigations || []).map(item => item?.investigation_id));
  }

  function collectEvidenceCategoryIds(data) {
    return uniqueSorted((data?.evidence_categories || []).map(item => item?.category_id));
  }

  function collectGaugeIds(data) {
    return uniqueSorted((data?.gauges || []).map(item => item?.gauge_id));
  }

  function collectBooleanStateIds(data) {
    const ids = [];
    (data?.questions || []).forEach(question => {
      if (question?.solved_state_id) ids.push(question.solved_state_id);
    });
    return uniqueSorted(ids);
  }

  function collectNumericStateIds(data) {
    const ids = [...NUMERIC_STATE_OPTIONS];
    (data?.questions || []).forEach(question => {
      if (question?.reward_state_id) ids.push(question.reward_state_id);
    });
    return uniqueSorted(ids);
  }

  function collectDerivedStateIds(data) {
    const ids = [...DERIVED_STATE_OPTIONS];
    (data?.state_descriptors || []).forEach(descriptor => {
      if ((descriptor?.target_state_type || '') === 'Derived' && descriptor?.target_state_id) ids.push(descriptor.target_state_id);
    });
    return uniqueSorted(ids);
  }

  function collectStateDescriptorTargetIds(data, targetType) {
    const ids = targetType === 'Derived' ? collectDerivedStateIds(data) : collectNumericStateIds(data);
    (data?.state_descriptors || []).forEach(descriptor => {
      if ((descriptor?.target_state_type || 'Numeric') === (targetType || 'Numeric') && descriptor?.target_state_id) ids.push(descriptor.target_state_id);
    });
    return uniqueSorted(ids);
  }

  function collectEffectGroupIds(data) {
    return uniqueSorted((data?.effects || []).map(item => item?.effect_group_id));
  }

  function getConditionTargetOptions(data, conditionType) {
    switch (conditionType) {
      case 'Trust':
      case 'RevealedCharacter':
        return collectCharacterIds(data);
      case 'EvidenceOwned':
        return collectEvidenceIds(data);
      case 'ChoiceSelected':
        return collectChoiceIds(data);
      case 'GaugeValue':
        return collectGaugeIds(data);
      case 'SceneVisited':
        return collectSceneIds(data);
      default:
        return [];
    }
  }

  window.EditorDataUI = {
    DATA_TABS,
    CONDITION_TYPE_OPTIONS,
    NUMERIC_STATE_OPTIONS,
    DERIVED_STATE_OPTIONS,
    STATE_DESCRIPTOR_TYPE_OPTIONS,
    ANSWER_TYPE_OPTIONS,
    EFFECT_TYPE_OPTIONS,
    QUESTION_SOLUTION_MODE_OPTIONS,
    QUESTION_REWARD_MODE_OPTIONS,
    collectChoiceIds,
    collectDialogIds,
    collectSceneIds,
    collectCharacterIds,
    collectEvidenceIds,
    collectConditionGroupIds,
    collectChoiceGroupIds,
    collectInvestigationIds,
    collectEvidenceCategoryIds,
    collectGaugeIds,
    collectBooleanStateIds,
    collectNumericStateIds,
    collectDerivedStateIds,
    collectStateDescriptorTargetIds,
    collectEffectGroupIds,
    getConditionTargetOptions,
  };
})();
