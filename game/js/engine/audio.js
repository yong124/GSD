/**
 * audio.js — 씬 BGM 재생 관리
 */
const AudioManager = (() => {
  let _bgm = null;
  let _currentSrc = '';
  let _enabled = false;

  function ensureBgm() {
    if (_bgm) return _bgm;
    _bgm = new Audio();
    _bgm.loop = true;
    _bgm.preload = 'auto';
    _bgm.volume = 0.7;
    return _bgm;
  }

  return {
    init() {
      ensureBgm();
    },

    enable() {
      _enabled = true;
    },

    playBgm(src) {
      const bgm = ensureBgm();

      if (!src) {
        bgm.pause();
        _currentSrc = '';
        return;
      }

      if (_currentSrc !== src) {
        bgm.pause();
        bgm.src = src;
        _currentSrc = src;
      }

      if (!_enabled) return;

      bgm.play().catch(err => {
        console.warn('BGM 재생 실패:', err);
      });
    },

    stopBgm() {
      const bgm = ensureBgm();
      bgm.pause();
      _currentSrc = '';
    }
  };
})();
