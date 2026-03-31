/**
 * dialogue.js — 대화 타이핑 이펙트 & 화자 표시
 */
const Dialogue = (() => {
  const TYPING_SPEED = 32; // ms per char

  let _lines    = [];
  let _index    = 0;
  let _typing   = false;
  let _timer    = null;
  let _onDone   = null; // 대화 전체 완료 시 콜백

  const elBox     = () => document.getElementById('dialogue-box');
  const elSpeaker = () => document.getElementById('speaker-name');
  const elText    = () => document.getElementById('dialogue-text');
  const elPortrait= () => document.getElementById('portrait-img');
  const elHint    = () => document.getElementById('click-hint');

  function typeText(text, onComplete) {
    const el = elText();
    el.textContent = '';
    el.classList.add('typing-cursor');
    _typing = true;
    elHint().classList.add('hidden-hint');

    let i = 0;
    clearInterval(_timer);
    _timer = setInterval(() => {
      el.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(_timer);
        _typing = false;
        el.classList.remove('typing-cursor');
        elHint().classList.remove('hidden-hint');
        if (onComplete) onComplete();
      }
    }, TYPING_SPEED);
  }

  function setPortrait(speaker, portraitUrl) {
    const wrap = document.getElementById('portrait-wrap');
    const img  = elPortrait();

    // 기존 플레이스홀더 제거
    const old = wrap.querySelector('.portrait-placeholder');
    if (old) old.remove();

    if (portraitUrl) {
      img.src = portraitUrl;
      img.style.display = '';
    } else if (speaker) {
      img.src = '';
      img.style.display = 'none';
      // 이니셜 플레이스홀더
      const ph = document.createElement('div');
      ph.className = 'portrait-placeholder';
      ph.textContent = speaker.charAt(0);
      wrap.appendChild(ph);
    } else {
      img.src = '';
      img.style.display = 'none';
    }
  }

  function showLine(line) {
    const box = elBox();

    // 내레이션 vs 일반 대화 스타일
    if (line.style === 'narration' || !line.speaker) {
      box.className = 'narration';
      elSpeaker().textContent = '';
      setPortrait('', '');
    } else {
      box.className = (line.style && line.style !== 'normal') ? line.style : '';
      elSpeaker().textContent = line.speaker;
      setPortrait(line.speaker, line.portrait || '');
    }

    typeText(line.text);
  }

  function advance() {
    if (_typing) {
      // 타이핑 중이면 즉시 전체 출력
      clearInterval(_timer);
      _typing = false;
      const line = _lines[_index - 1]; // 이미 증가된 상태
      elText().textContent = line ? line.text : '';
      elText().classList.remove('typing-cursor');
      elHint().classList.remove('hidden-hint');
      return;
    }

    if (_index >= _lines.length) {
      // 대화 끝
      if (_onDone) _onDone();
      return;
    }

    showLine(_lines[_index]);
    _index++;
  }

  return {
    /**
     * 대화 라인 배열 세팅 후 시작
     * @param {Array}    lines   — dialogues 배열
     * @param {Function} onDone  — 모든 대화 종료 후 콜백
     */
    start(lines, onDone) {
      // condition 필드가 있는 줄은 플래그 조건이 맞을 때만 포함
      _lines = (lines || []).filter(line => {
        if (!line.condition) return true;
        const actual = State.getFlag(line.condition.flag_key);
        const values = Array.isArray(line.condition.flag_value)
          ? line.condition.flag_value
          : [line.condition.flag_value];
        return values.includes(actual);
      });
      _index  = 0;
      _onDone = onDone;

      if (_lines.length === 0) {
        if (_onDone) _onDone();
        return;
      }
      advance(); // 첫 줄 표시
    },

    /** 클릭/스페이스로 진행 */
    advance,

    init() {
      const box = document.getElementById('dialogue-box');
      box.addEventListener('click', () => Dialogue.advance());
      document.addEventListener('keydown', e => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          Dialogue.advance();
        }
      });
    }
  };
})();
