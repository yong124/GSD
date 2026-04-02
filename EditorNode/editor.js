(function () {
  'use strict';

  // ── 상수 ──────────────────────────────────────────────
  const NODE_W = 180;
  const NODE_HEADER_H = 32;
  const NODE_BODY_PAD = 10;
  const NODE_X_GAP = 260;
  const NODE_Y_GAP = 140;
  const PIN_R = 6; // pin radius

  const STYLE_OPTIONS = ['normal', 'narration', 'thought', 'crazy', 'scared', 'magic'];

  // ── 상태 ──────────────────────────────────────────────
  const state = {
    data: { first_scene: '', scenes: {} },
    layout: {},       // { sceneId: { x, y } }
    selectedId: null,
    camera: { x: 100, y: 100, scale: 1 },
    wire: null,       // { fromId, pinType:'out'|'branch', branchIdx, x1, y1 }
    panning: null,    // { startX, startY, camX, camY }
    dragging: null,   // { nodeId, startMouseX, startMouseY, startNodeX, startNodeY }
    dirty: false,
  };

  // ── DOM 참조 ──────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const els = {};

  function bindElements() {
    els.viewport    = $('viewport');
    els.canvas      = $('canvas');
    els.wireLayer   = $('wire-layer');
    els.nodeLayer   = $('node-layer');
    els.panel       = $('panel');
    els.panelEmpty  = $('panel-empty');
    els.panelContent= $('panel-content');
    els.fieldTitle  = $('field-title');
    els.fieldBg     = $('field-background');
    els.dialogueList= $('dialogue-list');
    els.choiceList  = $('choice-list');
    els.branchList  = $('branch-list');
    els.status      = $('status');
  }

  // ── 유틸 ──────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escapeAttr(s) {
    return String(s ?? '').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function uid() {
    return 'scene_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  }
  function setStatus(msg, err) {
    els.status.textContent = msg;
    els.status.style.color = err ? '#cc6666' : '#6a9f6a';
  }
  function markDirty() {
    state.dirty = true;
    setStatus('● 미저장 변경사항');
  }

  // ── 카메라 ────────────────────────────────────────────
  function applyCamera() {
    const { x, y, scale } = state.camera;
    els.canvas.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
  }

  // viewport → canvas 좌표 변환
  function toCanvas(clientX, clientY) {
    const vr = els.viewport.getBoundingClientRect();
    const { x, y, scale } = state.camera;
    return {
      x: (clientX - vr.left - x) / scale,
      y: (clientY - vr.top  - y) / scale,
    };
  }

  // ── 자동 레이아웃 (BFS) ───────────────────────────────
  function autoLayout() {
    const scenes = state.data.scenes;
    const firstId = state.data.first_scene;
    if (!firstId || !scenes[firstId]) return;

    const visited = new Set();
    const queue = [{ id: firstId, col: 0, row: 0 }];
    const colRows = {}; // col → next row index

    while (queue.length) {
      const { id, col } = queue.shift();
      if (visited.has(id)) continue;
      visited.add(id);

      if (!(id in state.layout)) {
        const row = colRows[col] ?? 0;
        colRows[col] = row + 1;
        state.layout[id] = { x: col * NODE_X_GAP + 40, y: row * NODE_Y_GAP + 40 };
      }

      const scene = scenes[id];
      if (!scene) continue;

      const nexts = [];
      if (scene.next_scene && scenes[scene.next_scene]) nexts.push(scene.next_scene);
      (scene.branches || []).forEach(b => {
        if (b.next_scene && scenes[b.next_scene]) nexts.push(b.next_scene);
      });
      (scene.choices || []).forEach(c => {
        if (c.next_scene && scenes[c.next_scene]) nexts.push(c.next_scene);
      });

      nexts.forEach(nid => {
        if (!visited.has(nid)) queue.push({ id: nid, col: col + 1 });
      });
    }

    // 방문 못한 씬 (고립된 노드) 처리
    let orphanRow = Object.keys(colRows).length > 0
      ? Math.max(...Object.values(colRows)) : 0;
    Object.keys(scenes).forEach(id => {
      if (!(id in state.layout)) {
        state.layout[id] = { x: 40, y: (orphanRow++) * NODE_Y_GAP + 40 };
      }
    });
  }

  // ── 노드 높이 계산 ────────────────────────────────────
  function nodeHeight(scene) {
    const branches = (scene.branches || []).length;
    return NODE_HEADER_H + NODE_BODY_PAD * 2 + 16 + branches * 24;
  }

  // ── 핀 위치 (canvas 좌표) ─────────────────────────────
  function pinPos(sceneId, pinType, branchIdx) {
    const pos = state.layout[sceneId];
    if (!pos) return null;
    const scene = state.data.scenes[sceneId];
    const h = nodeHeight(scene);
    if (pinType === 'in') {
      return { x: pos.x, y: pos.y + NODE_HEADER_H / 2 };
    }
    if (pinType === 'out') {
      return { x: pos.x + NODE_W, y: pos.y + NODE_HEADER_H / 2 };
    }
    if (pinType === 'branch') {
      const baseY = pos.y + NODE_HEADER_H + NODE_BODY_PAD + 16 + branchIdx * 24 + 12;
      return { x: pos.x + NODE_W, y: baseY };
    }
    return null;
  }

  // ── 베지어 경로 문자열 ────────────────────────────────
  function bezier(x1, y1, x2, y2) {
    const dx = Math.max(Math.abs(x2 - x1) * 0.5, 60);
    return `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`;
  }

  // ── 와이어 렌더링 ─────────────────────────────────────
  function renderWires() {
    // 기존 wire path들 제거 (temp wire 제외)
    els.wireLayer.querySelectorAll('.wire-path,.wire-label').forEach(el => el.remove());

    const scenes = state.data.scenes;

    function addWire(x1, y1, x2, y2, cls, label) {
      if (!x1 && x1 !== 0) return;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', `wire-path ${cls}`);
      path.setAttribute('d', bezier(x1, y1, x2, y2));
      els.wireLayer.appendChild(path);
      if (label) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - 6;
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'wire-label');
        text.setAttribute('x', mx);
        text.setAttribute('y', my);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = label;
        els.wireLayer.appendChild(text);
      }
    }

    Object.entries(scenes).forEach(([id, scene]) => {
      const from = pinPos(id, 'out');
      if (from && scene.next_scene && scenes[scene.next_scene]) {
        const to = pinPos(scene.next_scene, 'in');
        if (to) addWire(from.x, from.y, to.x, to.y, 'wire-next');
      }
      (scene.branches || []).forEach((branch, i) => {
        if (!branch.next_scene || !scenes[branch.next_scene]) return;
        const bfrom = pinPos(id, 'branch', i);
        const bto   = pinPos(branch.next_scene, 'in');
        if (bfrom && bto) {
          const label = branch.flag_key ? `${branch.flag_key}=${branch.flag_value ?? ''}` : null;
          addWire(bfrom.x, bfrom.y, bto.x, bto.y, 'wire-branch', label);
        }
      });
    });
  }

  // ── 노드 렌더링 ───────────────────────────────────────
  function renderNodes() {
    els.nodeLayer.innerHTML = '';
    const scenes = state.data.scenes;

    Object.entries(scenes).forEach(([id, scene]) => {
      const pos = state.layout[id] || { x: 40, y: 40 };
      const isFirst = id === state.data.first_scene;
      const isSelected = id === state.selectedId;
      const preview = scene.dialogues?.[0]?.text || '(대사 없음)';
      const branches = scene.branches || [];

      const node = document.createElement('div');
      node.className = `node${isSelected ? ' selected' : ''}${isFirst ? ' first-scene' : ''}`;
      node.dataset.id = id;
      node.style.left = pos.x + 'px';
      node.style.top  = pos.y + 'px';

      // branch pin rows HTML
      const branchPins = branches.map((b, i) => {
        const topY = NODE_HEADER_H + NODE_BODY_PAD + 16 + i * 24;
        const label = b.flag_key ? `${b.flag_key}` : `branch ${i+1}`;
        return `<div class="branch-row" style="position:relative;height:24px;line-height:24px;font-size:9px;color:var(--text-dim);padding-right:14px;text-align:right;">
          ${escapeHtml(label)}
          <div class="pin-branch" data-id="${escapeAttr(id)}" data-branch="${i}"
               style="top:${topY}px;"></div>
        </div>`;
      }).join('');

      node.innerHTML = `
        <div class="pin-in" data-id="${escapeAttr(id)}"></div>
        <div class="node-header">
          <span>${escapeHtml(scene.title || id)}</span>
          <span class="node-id">${escapeHtml(id)}</span>
        </div>
        <div class="node-body">
          <div class="node-preview">${escapeHtml(preview)}</div>
          ${branchPins}
        </div>
        <div class="pin-out" data-id="${escapeAttr(id)}"></div>
      `;

      // 노드 선택
      node.addEventListener('mousedown', e => {
        if (e.target.classList.contains('pin-in') ||
            e.target.classList.contains('pin-out') ||
            e.target.classList.contains('pin-branch')) return;
        e.stopPropagation();
        selectScene(id);

        // 노드 드래그 (헤더에서만)
        if (e.target.closest('.node-header')) {
          state.dragging = {
            nodeId: id,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            startNodeX: pos.x,
            startNodeY: pos.y,
          };
        }
      });

      els.nodeLayer.appendChild(node);
    });
  }

  function render() {
    renderNodes();
    renderWires();
  }

  // ── 씬 선택 → 패널 ───────────────────────────────────
  function selectScene(id) {
    state.selectedId = id;
    renderNodes();
    renderPanel();
  }

  // ── 오른쪽 패널 ───────────────────────────────────────
  function renderPanel() {
    const id = state.selectedId;
    if (!id || !state.data.scenes[id]) {
      els.panelEmpty.classList.remove('hidden');
      els.panelContent.classList.add('hidden');
      return;
    }
    els.panelEmpty.classList.add('hidden');
    els.panelContent.classList.remove('hidden');

    const scene = state.data.scenes[id];

    // 제목 / 배경
    els.fieldTitle.value = scene.title || '';
    els.fieldBg.value = scene.background || '';

    renderDialogueList(scene);
    renderChoiceList(scene);
    renderBranchList(scene);
  }

  function makeCard(labelText, items, template, onAdd, onDelete, onUp, onDown, onChange) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '6px';

    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'pcard';
      card.innerHTML = `
        <div class="pcard-toolbar">
          <span>${labelText} ${i + 1}</span>
          <div class="actions">
            <button data-action="up">↑</button>
            <button data-action="down">↓</button>
            <button data-action="delete" class="danger">×</button>
          </div>
        </div>
        ${template(item, i)}
      `;

      card.querySelector('[data-action="up"]').addEventListener('click', () => onUp(i));
      card.querySelector('[data-action="down"]').addEventListener('click', () => onDown(i));
      card.querySelector('[data-action="delete"]').addEventListener('click', () => onDelete(i));

      // 모든 input/textarea/select 변경 감지
      card.querySelectorAll('input,textarea,select').forEach(el => {
        const ev = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(ev, () => {
          onChange(item, el.dataset.field, el.value);
        });
      });

      wrap.appendChild(card);
    });

    return wrap;
  }

  function swap(arr, i, j) {
    if (i < 0 || j >= arr.length) return false;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return true;
  }

  // 대사 목록
  function renderDialogueList(scene) {
    if (!scene.dialogues) scene.dialogues = [];
    els.dialogueList.innerHTML = '';

    const cards = makeCard(
      '대사', scene.dialogues,
      (d) => `
        <label><span>화자</span>
          <input data-field="speaker" value="${escapeAttr(d.speaker || '')}"></label>
        <label><span>스타일</span>
          <select data-field="style">
            ${STYLE_OPTIONS.map(s => `<option value="${s}"${(d.style||'normal')===s?' selected':''}>${s}</option>`).join('')}
          </select></label>
        <label><span>초상화</span>
          <input data-field="portrait" value="${escapeAttr(d.portrait || '')}">
          ${d.portrait ? `<img class="portrait-thumb" src="../game/${escapeAttr(d.portrait)}" alt="">` : ''}
        </label>
        <label><span>텍스트</span>
          <textarea data-field="text">${escapeHtml(d.text || '')}</textarea></label>
        <label><span>조건 키</span>
          <input data-field="cond_key" value="${escapeAttr(d.condition?.flag_key || '')}"></label>
        <label><span>조건 값</span>
          <input data-field="cond_value" value="${escapeAttr(d.condition?.flag_value != null ? String(d.condition.flag_value) : '')}"></label>
      `,
      () => { scene.dialogues.splice(0, 0, newDialogue()); afterChange(); },
      (i) => { scene.dialogues.splice(i, 1); afterChange(); },
      (i) => { if (swap(scene.dialogues, i-1, i)) afterChange(); },
      (i) => { if (swap(scene.dialogues, i, i+1)) afterChange(); },
      (d, field, value) => {
        if (field === 'cond_key' || field === 'cond_value') {
          if (!d.condition) d.condition = { flag_key: null, flag_value: null };
          if (field === 'cond_key')   d.condition.flag_key   = value || null;
          if (field === 'cond_value') d.condition.flag_value = value || null;
          if (!d.condition.flag_key && d.condition.flag_value == null) d.condition = null;
        } else {
          d[field] = value || (field === 'style' ? 'normal' : '');
        }
        markDirty(); render();
      }
    );

    // portrait 썸네일 실시간 업데이트
    cards.querySelectorAll('[data-field="portrait"]').forEach(input => {
      input.addEventListener('input', () => {
        let thumb = input.parentElement.querySelector('.portrait-thumb');
        if (thumb) {
          thumb.src = input.value ? `../game/${input.value}` : '';
          thumb.hidden = !input.value;
        } else if (input.value) {
          const img = document.createElement('img');
          img.className = 'portrait-thumb';
          img.alt = '';
          img.src = `../game/${input.value}`;
          input.parentElement.appendChild(img);
        }
      });
    });

    els.dialogueList.appendChild(cards);
  }

  // 선택지 목록
  function renderChoiceList(scene) {
    if (!scene.choices) scene.choices = [];
    els.choiceList.innerHTML = '';

    const cards = makeCard(
      '선택지', scene.choices,
      (c) => `
        <label><span>텍스트</span>
          <input data-field="text" value="${escapeAttr(c.text || '')}"></label>
        <label><span>다음 씬</span>
          <input data-field="next_scene" value="${escapeAttr(c.next_scene || '')}"></label>
        <label><span>플래그 키</span>
          <input data-field="flag_key" value="${escapeAttr(c.flag_key || '')}"></label>
        <label><span>플래그 값</span>
          <input data-field="flag_value" value="${escapeAttr(c.flag_value != null ? String(c.flag_value) : '')}"></label>
      `,
      () => { scene.choices.push(newChoice()); afterChange(); },
      (i) => { scene.choices.splice(i, 1); afterChange(); },
      (i) => { if (swap(scene.choices, i-1, i)) afterChange(); },
      (i) => { if (swap(scene.choices, i, i+1)) afterChange(); },
      (c, field, value) => { c[field] = value; markDirty(); renderWires(); }
    );

    els.choiceList.appendChild(cards);
  }

  // 분기 목록
  function renderBranchList(scene) {
    if (!scene.branches) scene.branches = [];
    els.branchList.innerHTML = '';

    const cards = makeCard(
      '분기', scene.branches,
      (b) => `
        <label><span>플래그 키</span>
          <input data-field="flag_key" value="${escapeAttr(b.flag_key || '')}"></label>
        <label><span>플래그 값</span>
          <input data-field="flag_value" value="${escapeAttr(b.flag_value != null ? String(b.flag_value) : '')}"></label>
        <label><span>다음 씬</span>
          <input data-field="next_scene" value="${escapeAttr(b.next_scene || '')}"></label>
      `,
      () => { scene.branches.push(newBranch()); afterChange(); },
      (i) => { scene.branches.splice(i, 1); afterChange(); },
      (i) => { if (swap(scene.branches, i-1, i)) afterChange(); },
      (i) => { if (swap(scene.branches, i, i+1)) afterChange(); },
      (b, field, value) => { b[field] = value; markDirty(); render(); }
    );

    els.branchList.appendChild(cards);
  }

  function afterChange() {
    markDirty();
    render();
    renderPanel();
  }

  // 기본 객체 생성
  function newDialogue() {
    return { order: 0, speaker: '', text: '', portrait: null, style: 'normal', condition: null };
  }
  function newChoice() {
    return { order: 0, text: '', next_scene: '', flag_key: '', flag_value: '' };
  }
  function newBranch() {
    return { flag_key: '', flag_value: '', next_scene: '' };
  }
  function newScene(id) {
    return {
      id, title: id, background: null, next_scene: null,
      branches: [], dialogues: [], choices: [], evidence: []
    };
  }

  // ── 와이어 드래그 ─────────────────────────────────────
  function startWireDrag(fromId, pinType, branchIdx, clientX, clientY) {
    const from = pinPos(fromId, pinType, branchIdx);
    if (!from) return;
    state.wire = { fromId, pinType, branchIdx, x1: from.x, y1: from.y };

    // 임시 path 생성
    let tempPath = els.wireLayer.querySelector('#wire-temp');
    if (!tempPath) {
      tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempPath.id = 'wire-temp';
      tempPath.setAttribute('class', 'wire-temp');
      els.wireLayer.appendChild(tempPath);
    }

    function onMove(e) {
      const c = toCanvas(e.clientX, e.clientY);
      tempPath.setAttribute('d', bezier(from.x, from.y, c.x, c.y));
    }

    function onUp(e) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      tempPath.remove();

      // 드롭 대상이 pin-in 인지 확인
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const pinIn = target?.closest('.pin-in');
      if (pinIn) {
        const toId = pinIn.dataset.id;
        connect(fromId, pinType, branchIdx, toId);
      }
      state.wire = null;
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function connect(fromId, pinType, branchIdx, toId) {
    if (fromId === toId) return;
    const scene = state.data.scenes[fromId];
    if (!scene) return;
    if (pinType === 'out') {
      scene.next_scene = toId;
    } else if (pinType === 'branch') {
      if (scene.branches && scene.branches[branchIdx] !== undefined) {
        scene.branches[branchIdx].next_scene = toId;
      }
    }
    markDirty();
    render();
    if (state.selectedId === fromId) renderPanel();
  }

  // ── 불러오기 ──────────────────────────────────────────
  function loadData() {
    // 기존 스크립트 태그 제거
    const old = document.getElementById('_game_data_script');
    if (old) old.remove();
    delete window.GAME_DATA;

    const script = document.createElement('script');
    script.id = '_game_data_script';
    script.src = '../game/data/game_data.js?t=' + Date.now();
    script.onload = () => {
      if (!window.GAME_DATA) {
        setStatus('오류: GAME_DATA 없음', true);
        return;
      }
      state.data = window.GAME_DATA;
      state.layout = {};
      autoLayout();
      state.selectedId = null;
      render();
      renderPanel();
      setStatus('✓ 불러오기 완료');
    };
    script.onerror = () => setStatus('오류: game_data.js 를 찾을 수 없습니다', true);
    document.head.appendChild(script);
  }

  // ── 내보내기 ──────────────────────────────────────────
  function exportData() {
    const json = JSON.stringify(state.data, null, 2);
    const content = `window.GAME_DATA = ${json};\n`;
    const blob = new Blob([content], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'game_data.js';
    a.click();
    URL.revokeObjectURL(a.href);
    state.dirty = false;
    setStatus('✓ 내보내기 완료');
  }

  // ── 씬 추가 ───────────────────────────────────────────
  function addScene() {
    const id = uid();
    state.data.scenes[id] = newScene(id);
    const vr = els.viewport.getBoundingClientRect();
    const center = toCanvas(vr.left + vr.width / 2, vr.top + vr.height / 2);
    state.layout[id] = { x: center.x - NODE_W / 2, y: center.y - 40 };
    selectScene(id);
    markDirty();
    render();
  }

  // ── 씬 삭제 ───────────────────────────────────────────
  function deleteScene(id) {
    if (!state.data.scenes[id]) return;
    delete state.data.scenes[id];
    delete state.layout[id];
    // 참조 정리
    Object.values(state.data.scenes).forEach(scene => {
      if (scene.next_scene === id) scene.next_scene = null;
      (scene.branches || []).forEach(b => { if (b.next_scene === id) b.next_scene = ''; });
      (scene.choices  || []).forEach(c => { if (c.next_scene === id) c.next_scene = ''; });
    });
    if (state.selectedId === id) {
      state.selectedId = null;
      renderPanel();
    }
    markDirty();
    render();
  }

  // ── 이벤트 바인딩 ─────────────────────────────────────
  function bindEvents() {
    // 툴바
    $('btn-add-node').addEventListener('click', addScene);
    $('btn-load').addEventListener('click', loadData);
    $('btn-export').addEventListener('click', exportData);
    $('btn-delete-scene').addEventListener('click', () => {
      if (state.selectedId) deleteScene(state.selectedId);
    });
    $('btn-add-dialogue').addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      if (!scene.dialogues) scene.dialogues = [];
      scene.dialogues.push(newDialogue());
      afterChange();
    });
    $('btn-add-choice').addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      if (!scene.choices) scene.choices = [];
      scene.choices.push(newChoice());
      afterChange();
    });
    $('btn-add-branch').addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      if (!scene.branches) scene.branches = [];
      scene.branches.push(newBranch());
      afterChange();
    });

    // 패널 필드
    els.fieldTitle.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.title = els.fieldTitle.value;
      markDirty(); renderNodes();
    });
    els.fieldBg.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.background = els.fieldBg.value;
      markDirty();
    });

    // 캔버스 줌 (마우스 휠)
    els.viewport.addEventListener('wheel', e => {
      e.preventDefault();
      const { scale, x, y } = state.camera;
      const vr = els.viewport.getBoundingClientRect();
      const mx = e.clientX - vr.left;
      const my = e.clientY - vr.top;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.2, Math.min(2.5, scale * delta));
      state.camera.x = mx - (mx - x) * (newScale / scale);
      state.camera.y = my - (my - y) * (newScale / scale);
      state.camera.scale = newScale;
      applyCamera();
    }, { passive: false });

    // 패닝 (빈 공간 드래그)
    els.viewport.addEventListener('mousedown', e => {
      if (e.target !== els.viewport && e.target !== els.canvas &&
          e.target !== els.nodeLayer && e.target !== els.wireLayer &&
          !e.target.closest('svg')) return;
      e.preventDefault();
      state.panning = { startX: e.clientX, startY: e.clientY,
                        camX: state.camera.x, camY: state.camera.y };
    });

    // 노드 드래그 / 와이어 드래그 / 패닝 mousemove
    document.addEventListener('mousemove', e => {
      if (state.panning) {
        state.camera.x = state.panning.camX + (e.clientX - state.panning.startX);
        state.camera.y = state.panning.camY + (e.clientY - state.panning.startY);
        applyCamera();
      }
      if (state.dragging) {
        const { nodeId, startMouseX, startMouseY, startNodeX, startNodeY } = state.dragging;
        const dx = (e.clientX - startMouseX) / state.camera.scale;
        const dy = (e.clientY - startMouseY) / state.camera.scale;
        state.layout[nodeId] = { x: startNodeX + dx, y: startNodeY + dy };
        const el = els.nodeLayer.querySelector(`[data-id="${nodeId}"]`);
        if (el) {
          el.style.left = state.layout[nodeId].x + 'px';
          el.style.top  = state.layout[nodeId].y + 'px';
        }
        renderWires();
      }
    });

    document.addEventListener('mouseup', () => {
      state.panning  = null;
      state.dragging = null;
    });

    // 핀 클릭 → 와이어 드래그
    els.nodeLayer.addEventListener('mousedown', e => {
      const pin = e.target.closest('.pin-out, .pin-branch');
      if (!pin) return;
      e.stopPropagation();
      e.preventDefault();
      const fromId = pin.dataset.id;
      if (pin.classList.contains('pin-out')) {
        startWireDrag(fromId, 'out', null, e.clientX, e.clientY);
      } else {
        const branchIdx = parseInt(pin.dataset.branch, 10);
        startWireDrag(fromId, 'branch', branchIdx, e.clientX, e.clientY);
      }
    });

    // viewport 클릭 시 선택 해제
    els.viewport.addEventListener('click', e => {
      if (e.target === els.viewport || e.target === els.canvas || e.target === els.nodeLayer) {
        state.selectedId = null;
        renderNodes();
        els.panelEmpty.classList.remove('hidden');
        els.panelContent.classList.add('hidden');
      }
    });

    // Ctrl+S 저장
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); exportData(); }
    });
  }

  // ── 초기화 ────────────────────────────────────────────
  function init() {
    bindElements();
    bindEvents();
    applyCamera();
    renderPanel();
    setStatus('game_data.js를 불러오세요');
    // 서버 환경이면 자동 로드 시도
    if (location.protocol !== 'file:') loadData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
