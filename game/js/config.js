/**
 * config.js — Global constants and configurations
 */
const Config = (() => {
  return {
    VERSION: '1.2.0-refactor',
    
    // Typing parameters
    TYPING: {
      DEFAULT_SPEED: 32,
      FAST_SPEED: 8,
      SKIP_DELAY: 150
    },

    // Visual timings (ms)
    TRANSITION: {
      FADE_DURATION: 400,
      SCENE_BANNER: 2600,
      TOAST_DURATION: 2500,
      SYSTEM_TOAST: 3000
    },

    // UI elements
    SELECTORS: {
      GAME_CONTAINER: 'game-container',
      DIALOGUE_BOX: 'dialogue-box',
      CHOICE_BOX: 'choice-box',
      HUD: 'investigation-hud',
      TITLE_SCREEN: 'title-screen',
      MEMO_PANEL: 'memo-panel',
      SLOT_PANEL: 'slot-panel'
    }
  };
})();
