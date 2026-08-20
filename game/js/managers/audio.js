/**
 * audio.js — 씬 BGM/SFX 재생 관리
 */
const AudioManager = (() => {
  const SETTINGS_KEY = 'gyeongseong_audio_settings';
  const DEFAULTS = { bgmVolume: 0.35, sfxVolume: 0.5, muted: false };

  let _bgm = null;
  let _currentSrc = '';
  let _enabled = false;
  let _settings = loadSettings();

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return {
        bgmVolume: clamp01(parsed.bgmVolume, DEFAULTS.bgmVolume),
        sfxVolume: clamp01(parsed.sfxVolume, DEFAULTS.sfxVolume),
        muted: !!parsed.muted,
      };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings));
  }

  function clamp01(value, fallback) {
    const num = Number(value);
    if (Number.isNaN(num)) return fallback;
    return Math.max(0, Math.min(1, num));
  }

  function ensureBgm() {
    if (_bgm) return _bgm;
    _bgm = new Audio();
    _bgm.loop = true;
    _bgm.preload = 'auto';
    _bgm.volume = _settings.muted ? 0 : _settings.bgmVolume;
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
    },

    playSfx(src) {
      if (!src || !_enabled || _settings.muted) return;
      const sfx = new Audio(src);
      sfx.volume = _settings.sfxVolume;
      sfx.play().catch(err => {
        console.warn('SFX 재생 실패:', src, err);
      });
    },

    getSettings() {
      return { ..._settings };
    },

    setBgmVolume(value) {
      _settings.bgmVolume = clamp01(value, _settings.bgmVolume);
      if (_bgm && !_settings.muted) _bgm.volume = _settings.bgmVolume;
      saveSettings();
    },

    setSfxVolume(value) {
      _settings.sfxVolume = clamp01(value, _settings.sfxVolume);
      saveSettings();
    },

    setMuted(muted) {
      _settings.muted = !!muted;
      if (_bgm) _bgm.volume = _settings.muted ? 0 : _settings.bgmVolume;
      saveSettings();
    }
  };
})();
