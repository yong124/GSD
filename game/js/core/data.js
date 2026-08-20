/**
 * data.js — thin read wrapper around window.GAME_DATA.
 * No caching, no state: centralizes the field names other modules used to
 * reach into window.GAME_DATA for directly, so a schema change only touches
 * one file.
 */
const Data = (() => {
  function raw() {
    return window.GAME_DATA || {};
  }

  function getGauges() {
    return Array.isArray(raw().gauges) ? raw().gauges : [];
  }

  function getGaugeStates(gaugeId) {
    return (raw().gauge_states || []).filter(row => row?.gauge_id === gaugeId);
  }

  function getChoiceGroup(choiceGroupId) {
    return (raw().choice_groups || []).find(group => group?.choice_group_id === choiceGroupId) || null;
  }

  function getEffectsByGroup(effectGroupId) {
    if (!effectGroupId) return [];
    return (raw().effects || []).filter(effect => effect?.effect_group_id === effectGroupId);
  }

  function getCharacter(characterId) {
    return raw().characters?.[characterId] || null;
  }

  function getScenes() {
    return raw().scenes || {};
  }

  function getScene(sceneId) {
    return getScenes()[sceneId] || null;
  }

  return {
    getGauges,
    getGaugeStates,
    getChoiceGroup,
    getEffectsByGroup,
    getCharacter,
    getScenes,
    getScene
  };
})();
