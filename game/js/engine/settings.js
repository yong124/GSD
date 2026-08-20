const Settings = (() => {
  const KEY = 'gyeongseong_ui_settings';
  const TEXT_SPEED_MS = { slow: 46, normal: 32, fast: 14 };

  let _textSpeed = 'normal';

  function loadTextSpeed() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return 'normal';
      const parsed = JSON.parse(raw);
      return TEXT_SPEED_MS[parsed.textSpeed] ? parsed.textSpeed : 'normal';
    } catch {
      return 'normal';
    }
  }

  function saveTextSpeed() {
    localStorage.setItem(KEY, JSON.stringify({ textSpeed: _textSpeed }));
  }

  function applyTextSpeed() {
    Config.TYPING.DEFAULT_SPEED = TEXT_SPEED_MS[_textSpeed] || TEXT_SPEED_MS.normal;
  }

  function syncControls() {
    const audio = AudioManager.getSettings();
    const bgmSlider = document.getElementById('settings-bgm-volume');
    const sfxSlider = document.getElementById('settings-sfx-volume');
    const bgmValue = document.getElementById('settings-bgm-value');
    const sfxValue = document.getElementById('settings-sfx-value');
    const muteBox = document.getElementById('settings-mute');

    if (bgmSlider) bgmSlider.value = Math.round(audio.bgmVolume * 100);
    if (sfxSlider) sfxSlider.value = Math.round(audio.sfxVolume * 100);
    if (bgmValue) bgmValue.textContent = `${Math.round(audio.bgmVolume * 100)}%`;
    if (sfxValue) sfxValue.textContent = `${Math.round(audio.sfxVolume * 100)}%`;
    if (muteBox) muteBox.checked = audio.muted;

    document.querySelectorAll('.settings-speed-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.speed === _textSpeed);
    });
  }

  function showPanel() {
    syncControls();
    document.getElementById('settings-panel')?.classList.remove('hidden');
    document.getElementById('settings-overlay')?.classList.remove('hidden');
  }

  function hidePanel() {
    document.getElementById('settings-panel')?.classList.add('hidden');
    document.getElementById('settings-overlay')?.classList.add('hidden');
  }

  function isPanelOpen() {
    const el = document.getElementById('settings-panel');
    return !!el && !el.classList.contains('hidden');
  }

  return {
    init() {
      _textSpeed = loadTextSpeed();
      applyTextSpeed();

      const btn = document.getElementById('settings-btn');
      const closeBtn = document.getElementById('settings-close');
      const overlay = document.getElementById('settings-overlay');
      const bgmSlider = document.getElementById('settings-bgm-volume');
      const sfxSlider = document.getElementById('settings-sfx-volume');
      const muteBox = document.getElementById('settings-mute');

      if (btn) btn.addEventListener('click', () => (isPanelOpen() ? hidePanel() : showPanel()));
      if (closeBtn) closeBtn.addEventListener('click', hidePanel);
      if (overlay) overlay.addEventListener('click', hidePanel);

      if (bgmSlider) {
        bgmSlider.addEventListener('input', () => {
          AudioManager.setBgmVolume(Number(bgmSlider.value) / 100);
          syncControls();
        });
      }
      if (sfxSlider) {
        sfxSlider.addEventListener('input', () => {
          AudioManager.setSfxVolume(Number(sfxSlider.value) / 100);
          syncControls();
        });
      }
      if (muteBox) {
        muteBox.addEventListener('change', () => {
          AudioManager.setMuted(muteBox.checked);
        });
      }

      document.querySelectorAll('.settings-speed-btn').forEach(el => {
        el.addEventListener('click', () => {
          _textSpeed = el.dataset.speed;
          applyTextSpeed();
          saveTextSpeed();
          syncControls();
        });
      });

      console.log('[Settings] Initialized');
    },

    showPanel,
    hidePanel,
    isPanelOpen
  };
})();
