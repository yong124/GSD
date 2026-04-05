(function () {
  'use strict';

  const DATA_TABS = [
    { id: 'characters', label: '캐릭터' },
    { id: 'character-emotions', label: '감정' },
    { id: 'conditions', label: '조건' },
    { id: 'choice-groups', label: '선택그룹' },
    { id: 'evidence-categories', label: '단서분류' },
    { id: 'investigations', label: '조사' },
    { id: 'questions', label: '질문' },
    { id: 'state-descriptors', label: '상태' },
    { id: 'rules', label: '룰' },
  ];

  const CONDITION_TYPE_OPTIONS = [
    'Trust',
    'EvidenceOwned',
    'ChoiceSelected',
    'RevealedCharacter',
    'SceneProgressIndex',
    'ReadRitualScore',
    'ResonanceLevel',
    'InvestigationScore',
    'SongsoonTrust',
    'StateValue',
  ];

  const STATE_TYPE_OPTIONS = [
    'ReadRitualScore',
    'ResonanceLevel',
    'InvestigationScore',
    'SongsoonTrust',
  ];

  const RULE_FACT_TYPE_OPTIONS = ['RevealedCharacter', 'HasEvidence', 'SceneProgressIndex', 'FlagValue'];

  function collectChoiceIds(data) {
    const ids = [];
    Object.values(data?.scenes || {}).forEach(scene => {
      (scene?.choices || []).forEach(choice => {
        if (choice?.choice_id) ids.push(choice.choice_id);
      });
    });
    return [...new Set(ids)].sort();
  }

  function collectDialogIds(data) {
    const ids = [];
    Object.values(data?.scenes || {}).forEach(scene => {
      (scene?.dialogues || []).forEach(dialogue => {
        if (dialogue?.dialog_id) ids.push(dialogue.dialog_id);
      });
    });
    return [...new Set(ids)].sort();
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
    return [...new Set(ids)].sort();
  }

  function collectRuleIds(data) {
    const ids = (data?.rules || []).map(rule => rule?.rule_id).filter(Boolean);
    return [...new Set(ids)].sort();
  }

  function collectConditionGroupIds(data) {
    const ids = (data?.conditions || []).map(condition => condition?.condition_group_id).filter(Boolean);
    return [...new Set(ids)].sort();
  }

  function collectChoiceGroupIds(data) {
    const ids = (data?.choice_groups || []).map(item => item?.choice_group_id).filter(Boolean);
    return [...new Set(ids)].sort();
  }

  function collectInvestigationIds(data) {
    const ids = (data?.investigations || []).map(item => item?.investigation_id).filter(Boolean);
    return [...new Set(ids)].sort();
  }

  function collectEvidenceCategoryIds(data) {
    const ids = (data?.evidence_categories || []).map(item => item?.category_id).filter(Boolean);
    return [...new Set(ids)].sort();
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
      case 'StateValue':
        return STATE_TYPE_OPTIONS.slice();
      default:
        return [];
    }
  }

  window.EditorDataUI = {
    DATA_TABS,
    CONDITION_TYPE_OPTIONS,
    STATE_TYPE_OPTIONS,
    RULE_FACT_TYPE_OPTIONS,
    collectChoiceIds,
    collectDialogIds,
    collectSceneIds,
    collectCharacterIds,
    collectEvidenceIds,
    collectRuleIds,
    collectConditionGroupIds,
    collectChoiceGroupIds,
    collectInvestigationIds,
    collectEvidenceCategoryIds,
    getConditionTargetOptions,
  };
})();
