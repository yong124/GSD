/**
 * effects.js — 씬 이펙트 트리거
 * scene.effect 값에 따라 CSS 클래스 적용
 *
 * 지원 이펙트:
 *   flicker    — 조명 깜빡임 (감응 전조)
 *   resonance  — 청색 오버레이 (감응 중)
 *   shake      — 화면 흔들림 (공포)
 *   blood      — 붉은 오버레이 (이해심 등장)
 *   none / ''  — 이펙트 없음
 */
const Effects = (() => {
  const EFFECT_CLASSES = ['effect-flicker', 'effect-resonance', 'effect-shake', 'effect-blood'];
  const MOMENTARY_EFFECT_CLASSES = ['effect-blue-trace', 'effect-ritual-glow', 'effect-blood-smear', 'effect-flicker'];
  const container = () => document.getElementById('game-container');
  let _momentaryTimer = null;

  function clearAll() {
    EFFECT_CLASSES.forEach(cls => container().classList.remove(cls));
    document.getElementById('effect-overlay').style.opacity = '0';
  }

  function clearMomentary() {
    MOMENTARY_EFFECT_CLASSES.forEach(cls => container().classList.remove(cls));
    if (_momentaryTimer) {
      clearTimeout(_momentaryTimer);
      _momentaryTimer = null;
    }
  }

  return {
    apply(effectNameOrId) {
      clearAll();
      if (!effectNameOrId) return;

      // Enum ID 지원 (숫자로 들어올 경우)
      const ID_MAP = {
        1: 'flicker',
        2: 'resonance',
        3: 'shake',
        4: 'blood'
      };
      
      const effectName = typeof effectNameOrId === 'number' 
        ? ID_MAP[effectNameOrId] 
        : String(effectNameOrId).toLowerCase();

      const cls = `effect-${effectName}`;
      if (!EFFECT_CLASSES.includes(cls)) return;

      container().classList.add(cls);

      // 일회성 이펙트(flicker, shake)는 애니메이션 후 자동 제거
      if (effectName === 'flicker' || effectName === 'shake') {
        const el = document.getElementById('bg-layer');
        el.addEventListener('animationend', () => {
          container().classList.remove(cls);
        }, { once: true });
      }
    },

    pulse(effectName, duration = 900) {
      clearMomentary();
      if (!effectName) return;

      const normalized = `effect-${String(effectName).trim().replace(/_/g, '-').toLowerCase()}`;
      if (!MOMENTARY_EFFECT_CLASSES.includes(normalized)) return;

      container().classList.add(normalized);
      _momentaryTimer = setTimeout(() => {
        container().classList.remove(normalized);
        _momentaryTimer = null;
      }, duration);
    },

    clear: clearAll,
  };
})();
