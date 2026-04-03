/**
 * evidence.js — 단서 수집 & 메모장 UI
 */
const Evidence = (() => {
  let _allEvidence = {}; // evidence_id → evidence 객체 (game_data에서 로드)
  let _seenEvidence = new Set();

  function showToast(name) {
    const el = document.getElementById('evidence-toast');
    el.textContent = `단서 획득: 『${name}』`;
    el.classList.remove('hidden');
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.classList.add('hidden'), 400);
    }, 3000);
  }

  function updateMemoBadge() {
    const btn = document.getElementById('memo-btn');
    const badge = document.getElementById('memo-badge');
    if (!btn || !badge) return;

    const unread = State.getEvidence().filter(id => !_seenEvidence.has(id)).length;
    btn.classList.toggle('has-unread', unread > 0);
    badge.classList.toggle('hidden', unread === 0);
    badge.textContent = unread > 9 ? '9+' : String(unread);
    if (typeof window.refreshGameHUD === 'function') {
      window.refreshGameHUD();
    }
  }

  function markAllRead() {
    State.getEvidence().forEach(id => _seenEvidence.add(id));
    updateMemoBadge();
  }

  function renderMemo() {
    const list = document.getElementById('memo-list');
    const ids = State.getEvidence();
    if (ids.length === 0) {
      list.innerHTML = '<div class="memo-empty">아직 획득한 단서가 없습니다.</div>';
      return;
    }
    list.innerHTML = ids.map(id => {
      const ev = _allEvidence[id];
      if (!ev) return '';
      const imgHtml = ev.image
        ? `<img class="memo-item-img" src="${ev.image}" alt="${ev.name}">`
        : '';
      return `
        <div class="memo-item">
          ${imgHtml}
          <div class="memo-item-name">${ev.name}</div>
          <div class="memo-item-desc">${ev.description}</div>
        </div>`;
    }).join('');
  }

  function registerEvidenceFlag(evidenceId) {
    if (!evidenceId) return;
    State.setFlag(`HasEvidence_${evidenceId}`, true);
  }

  return {
    /** game_data에서 모든 씬의 evidence를 인덱싱 */
    index(scenes) {
      Object.values(scenes).forEach(scene => {
        (scene.evidence || []).forEach(ev => {
          _allEvidence[ev.evidence_id] = ev;
        });
      });
    },

    /** 씬 진입 시 해당 씬의 auto 단서 자동 획득 */
    collectAuto(scene) {
      (scene.evidence || []).forEach(ev => {
        // trigger: 'auto' 또는 Enum ID 1 지원
        if (ev.trigger === 'auto' || ev.trigger === 1) {
          const isNew = State.addEvidence(ev.evidence_id);
          registerEvidenceFlag(ev.evidence_id);
          if (isNew) showToast(ev.name);
          updateMemoBadge();
        }
      });
    },

    /** 수동 획득 (클릭 트리거용 — Sprint 2 이후 활용) */
    collect(evidenceId) {
      const ev = _allEvidence[evidenceId];
      if (!ev) return;
      const isNew = State.addEvidence(evidenceId);
      registerEvidenceFlag(evidenceId);
      if (isNew) showToast(ev.name);
      updateMemoBadge();
    },

    /** 씬 대화 종료 시 trigger=2(click) 단서 수집 */
    collectOnClick(scene) {
      (scene.evidence || []).forEach(ev => {
        if (ev.trigger === 'click' || ev.trigger === 2) {
          const isNew = State.addEvidence(ev.evidence_id);
          registerEvidenceFlag(ev.evidence_id);
          if (isNew) showToast(ev.name);
          updateMemoBadge();
        }
      });
    },

    hydrateSession() {
      _seenEvidence = new Set(State.getEvidence());
      updateMemoBadge();
    },

    resetSession() {
      _seenEvidence = new Set();
      updateMemoBadge();
    },

    init() {
      const btn   = document.getElementById('memo-btn');
      const panel = document.getElementById('memo-panel');
      const close = document.getElementById('memo-close');

      btn.addEventListener('click', () => {
        renderMemo();
        const willOpen = panel.classList.contains('hidden');
        panel.classList.toggle('hidden');
        if (willOpen) {
          markAllRead();
        }
      });
      close.addEventListener('click', () => {
        panel.classList.add('hidden');
      });
      updateMemoBadge();
    }
  };
})();
