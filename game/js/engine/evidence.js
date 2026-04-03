const Evidence = (() => {
  let _allEvidence = {};
  let _seenEvidence = new Set();

  function getEvidenceCategory(ev) {
    const id = ev?.evidence_id || '';
    const name = ev?.name || '';
    const desc = ev?.description || '';
    const text = `${id} ${name} ${desc}`;

    if (/Ritual|Mask|Hanbok|Diary|Score|Note|의례|무녀|감응|문/.test(text)) {
      return { key: 'ritual', title: '의례와 공명', hint: '문, 무녀, 감응과 연결된 흔적' };
    }
    if (/OldArticles|기사|기록|일기|편집장/.test(text)) {
      return { key: 'record', title: '기록과 기사', hint: '지워졌거나 남겨진 문장들' };
    }
    return { key: 'trace', title: '현장 물증', hint: '현장에서 직접 붙잡은 흔적' };
  }

  function updateBadge() {
    const unread = State.getEvidence().filter(id => !_seenEvidence.has(id)).length;
    UIManager.updateMemoBadge(unread);
  }

  function markAllRead() {
    State.getEvidence().forEach(id => _seenEvidence.add(id));
    updateBadge();
  }

  function prepareMemoData() {
    const ids = State.getEvidence();
    const groups = new Map();

    ids.forEach(id => {
      const ev = _allEvidence[id];
      if (!ev) return;
      const category = getEvidenceCategory(ev);
      if (!groups.has(category.key)) {
        groups.set(category.key, { ...category, items: [] });
      }
      groups.get(category.key).items.push({
        ...ev,
        isRead: _seenEvidence.has(ev.evidence_id)
      });
    });

    return Array.from(groups.values());
  }

  return {
    index(scenes) {
      Object.values(scenes).forEach(scene => {
        (scene.evidence || []).forEach(ev => {
          _allEvidence[ev.evidence_id] = ev;
        });
      });
    },

    collect(evidenceId) {
      const ev = _allEvidence[evidenceId];
      if (!ev) return;
      const isNew = State.addEvidence(evidenceId);
      if (isNew) {
        UIManager.showToast(`단서 획득: 『${ev.name}』`, 'toast-save');
        State.setFlag(`HasEvidence_${evidenceId}`, true);
        updateBadge();
      }
    },

    collectAuto(scene) {
      (scene.evidence || []).forEach(ev => {
        if (ev.trigger === 'auto' || ev.trigger === 1) this.collect(ev.evidence_id);
      });
    },

    collectOnClick(scene) {
      (scene.evidence || []).forEach(ev => {
        if (ev.trigger === 'click' || ev.trigger === 2) this.collect(ev.evidence_id);
      });
    },

    hydrateSession() {
      _seenEvidence = new Set(State.getEvidence());
      updateBadge();
    },

    resetSession() {
      _seenEvidence = new Set();
      this.hide();
      updateBadge();
    },

    hide() {
      UIManager.setPanelVisible(Config.SELECTORS.MEMO_PANEL, false);
    },

    isOpen() {
      const el = document.getElementById(Config.SELECTORS.MEMO_PANEL);
      return el && !el.classList.contains('hidden');
    },

    init() {
      const btn = document.getElementById('memo-btn');
      const close = document.getElementById('memo-close');

      if (btn) {
        btn.addEventListener('click', () => {
          const isOpen = this.isOpen();
          if (!isOpen) {
            UIManager.renderMemo(prepareMemoData());
            UIManager.setPanelVisible(Config.SELECTORS.MEMO_PANEL, true);
            markAllRead();
          } else {
            this.hide();
          }
        });
      }
      if (close) close.addEventListener('click', () => this.hide());
      updateBadge();
    }
  };
})();
