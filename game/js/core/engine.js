/**
 * engine.js — The central orchestrator for the Gyeongseong Game Engine.
 * Responsible for initializing all managers and coordinating the main loop.
 */
const Engine = (() => {
  let _initialized = false;
  let _data = null;

  function $(id) {
    return document.getElementById(id);
  }

  /**
   * Boot the engine with game data.
   */
  function init(gameData) {
    if (_initialized) return;
    if (!gameData) {
      console.error('[Engine] Missing game data.');
      return;
    }

    _data = gameData;

    try {
      // 1. Initialize core state
      State.init();
      
      // 2. Initialize subsystems
      UIManager.init();
      InputManager.init();
      AudioManager.init();
      Evidence.index(_data.scenes);
      Evidence.init();
      Dialogue.init();
      Save.init();
      
      // 3. Hydrate session
      Evidence.hydrateSession();
      
      // 4. Scene system initialization
      Scene.init(_data);

      _initialized = true;
      console.log(`[Engine] Initialized version ${Config.VERSION}`);
      
      // Emit signal
      document.dispatchEvent(new CustomEvent('engine:ready', { detail: { data: _data } }));
      
    } catch (err) {
      console.error('[Engine] Bootstrap failed:', err);
      _showFatalError(err);
    }
  }

  function _showFatalError(err) {
    const root = document.body;
    root.innerHTML = `
      <div style="color:#8a1a1a; background:#000; padding:40px; font-family:monospace; height:100vh;">
        <h3>[FATAL ERROR] Engine Bootstrap Failed</h3>
        <p>${err.message}</p>
        <pre style="font-size:12px; color:#555;">${err.stack}</pre>
        <button onclick="location.reload()">RELOAD</button>
      </div>
    `;
  }

  return {
    init,
    get data() { return _data; },
    get isReady() { return _initialized; },
    utils: { $ }
  };
})();
