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
  const EMOTION_TYPE_OPTIONS = ['Neutral', 'Tense', 'Uneasy', 'Afraid', 'Sad', 'Angry', 'Shaken', 'Trance', 'Crazy'];
  const STANDING_SLOT_OPTIONS = ['Left', 'Center', 'Right'];
  const FOCUS_TYPE_OPTIONS = ['Speaker', 'None', 'Dual'];
  const ENTER_MOTION_OPTIONS = ['None', 'FadeIn', 'SlideLeft', 'SlideRight'];
  const EXIT_MOTION_OPTIONS = ['None', 'FadeOut', 'SlideOutLeft', 'SlideOutRight'];
  const IDLE_MOTION_OPTIONS = ['None', 'Tremble', 'ShakeLight', 'ShakeHard'];
  const FX_TYPE_OPTIONS = ['None', 'Fog', 'BlueTrace', 'BloodSmear', 'Flicker', 'RitualGlow'];

  // ── 상태 ──────────────────────────────────────────────
  const state = {
    data: { first_scene: '', characters: {}, character_emotions: {}, questions: [], state_descriptors: [], scenes: {} },
    layout: {},       // { sceneId: { x, y } }
    selectedId: null,
    selectedIds: new Set(),
    panelTab: 'node',
    previewDialogueIndex: 0,
    filters: { query: '', chapter: '' },
    camera: { x: 100, y: 100, scale: 1 },
    wire: null,       // { fromId, pinType:'out'|'branch', branchIdx, x1, y1 }
    panning: null,    // { startX, startY, camX, camY }
    dragging: null,   // { nodeId, startMouseX, startMouseY, startNodeX, startNodeY }
    marquee: null,    // { startX, startY, currentX, currentY, additive }
    suppressViewportClick: false,
    dirty: false,
    history: [],      // undo 스택 (최대 30)
    future: [],       // redo 스택
  };

  // ── DOM 참조 ──────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const els = {};

  function bindElements() {
    els.viewport     = $('viewport');
    els.canvas       = $('canvas');
    els.wireLayer    = $('wire-layer');
    els.nodeLayer    = $('node-layer');
    els.marquee      = $('marquee-selection');
    els.panel        = $('panel');
    els.panelEmpty   = $('panel-empty');
    els.panelContent = $('panel-content');
    els.tabNodeEditor = $('tab-node-editor');
    els.tabCharacterEditor = $('tab-character-editor');
    els.panelTabSections = Array.from(document.querySelectorAll('[data-panel-tab]'));
    els.fieldTitle   = $('field-title');
    els.fieldBg      = $('field-background');
    els.fieldSearch  = $('field-search');
    els.fieldFilterChapter = $('field-filter-chapter');
    els.btnAutoLayout = $('btn-auto-layout');
    els.btnZoomOut = $('btn-zoom-out');
    els.btnZoomIn = $('btn-zoom-in');
    els.zoomLabel = $('zoom-label');
    els.fieldChapter = $('field-chapter');
    els.fieldMusic   = $('field-music');
    els.fieldEffect  = $('field-effect');
    els.fieldGoalKicker = $('field-goal-kicker');
    els.fieldGoalText = $('field-goal-text');
    els.fieldPriorityBudget = $('field-priority-budget');
    els.fieldPriorityDialogues = $('field-priority-dialogues');
    els.btnApplyPriorityDialogues = $('btn-apply-priority-dialogues');
    els.btnAddPriorityGroup = $('btn-add-priority-group');
    els.priorityDialogueList = $('priority-dialogue-list');
    els.priorityAfterList = $('priority-after-list');
    els.fieldSceneId = $('field-scene-id');
    els.evidenceList = $('evidence-list');
    els.characterList = $('character-list');
    els.characterEmotionList = $('character-emotion-list');
    els.questionList = $('question-list');
    els.stateDescriptorList = $('state-descriptor-list');
    els.analysisSummary = $('analysis-summary');
    els.validationSummary = $('validation-summary');
    els.validationList = $('validation-list');
    els.fieldBatchBackground = $('field-batch-background');
    els.btnApplyBatchBackground = $('btn-apply-batch-background');
    els.fieldBatchStyle = $('field-batch-style');
    els.btnApplyBatchStyle = $('btn-apply-batch-style');
    els.fieldBatchFlagOld = $('field-batch-flag-old');
    els.fieldBatchFlagNew = $('field-batch-flag-new');
    els.btnApplyBatchFlag = $('btn-apply-batch-flag');
    els.fieldBatchTextOld = $('field-batch-text-old');
    els.fieldBatchTextNew = $('field-batch-text-new');
    els.btnApplyBatchText = $('btn-apply-batch-text');
    els.btnSortScenes = $('btn-sort-scenes');
      els.previewBackground = $('preview-background');
      els.previewChapter = $('preview-chapter');
      els.previewSceneTitle = $('preview-scene-title');
      els.previewSpeaker = $('preview-speaker');
      els.previewText = $('preview-text');
      els.previewIndexLabel = $('preview-index-label');
      els.previewChoiceList = $('preview-choice-list');
      els.btnPreviewPrev = $('btn-preview-prev');
      els.btnPreviewNext = $('btn-preview-next');
    els.minimapCanvas = $('minimap-canvas');
    els.dialogueList = $('dialogue-list');
    els.choiceList   = $('choice-list');
    els.branchList   = $('branch-list');
    els.status       = $('status');
  }

  // ── 유틸 ──────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escapeAttr(s) {
    return String(s ?? '').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function renderSelectOptions(options, selectedValue, includeBlank = true) {
    const normalized = selectedValue ?? '';
    const items = [];
    if (includeBlank) {
      items.push(`<option value="">(none)</option>`);
    }
    options.forEach(option => {
      items.push(`<option value="${escapeAttr(option)}"${normalized === option ? ' selected' : ''}>${escapeHtml(option)}</option>`);
    });
    return items.join('');
  }
  function replaceEnumInputs(container, mappings) {
    mappings.forEach(({ field, options, includeBlank = true }) => {
      container.querySelectorAll(`input[data-field="${field}"]`).forEach(input => {
        const select = document.createElement('select');
        select.dataset.field = field;
        select.innerHTML = renderSelectOptions(options, input.value || '', includeBlank);
        input.replaceWith(select);
      });
    });
  }
  function replaceCharacterIdInputs(container, fieldName = 'CharacterID') {
    const characterIds = Object.keys(state.data.characters || {}).sort();
    container.querySelectorAll(`input[data-field="${fieldName}"]`).forEach(input => {
      const select = document.createElement('select');
      select.dataset.field = fieldName;
      select.innerHTML = renderSelectOptions(characterIds, input.value || '', false);
      if (!characterIds.includes(input.value || '')) {
        const custom = document.createElement('option');
        custom.value = input.value || '';
        custom.textContent = input.value || '(none)';
        custom.selected = true;
        select.prepend(custom);
      }
      input.replaceWith(select);
    });
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

  function ensurePrimarySelection() {
    if (state.selectedId && state.data.scenes[state.selectedId]) {
      state.selectedIds.add(state.selectedId);
      return;
    }
    const next = [...state.selectedIds].find(id => state.data.scenes[id]);
    state.selectedId = next || null;
    if (state.selectedId) state.selectedIds.add(state.selectedId);
  }

  function isSceneSelected(id) {
    return state.selectedIds.has(id);
  }

  function clearSelection() {
    state.selectedId = null;
    state.selectedIds = new Set();
    state.previewDialogueIndex = 0;
  }

  function setPanelTab(tab) {
    state.panelTab = tab === 'character' ? 'character' : 'node';
    renderPanel();
  }

  function applyPanelTabVisibility() {
    const activeTab = state.panelTab === 'character' ? 'character' : 'node';
    if (els.tabNodeEditor) els.tabNodeEditor.classList.toggle('active', activeTab === 'node');
    if (els.tabCharacterEditor) els.tabCharacterEditor.classList.toggle('active', activeTab === 'character');
    (els.panelTabSections || []).forEach(section => {
      section.classList.toggle('hidden', section.dataset.panelTab !== activeTab);
    });
  }

  function getSelectedSceneIds() {
    ensurePrimarySelection();
    return [...state.selectedIds].filter(id => state.data.scenes[id]);
  }

  function selectScene(id, options = {}) {
    const { additive = false, toggle = false, preservePreview = false } = options;
    if (!state.data.scenes[id]) return;

    if (toggle) {
      if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id);
        if (state.selectedId === id) {
          state.selectedId = [...state.selectedIds][0] || null;
        }
      } else {
        state.selectedIds.add(id);
        state.selectedId = id;
      }
    } else if (additive) {
      state.selectedIds.add(id);
      state.selectedId = id;
    } else {
      state.selectedId = id;
      state.selectedIds = new Set([id]);
    }

    ensurePrimarySelection();
    if (!preservePreview) state.previewDialogueIndex = 0;
    renderNodes();
    renderPanel();
    renderMinimap();
  }

  function updateMarqueeVisual() {
    if (!els.marquee) return;
    if (!state.marquee) {
      els.marquee.classList.add('hidden');
      return;
    }
    const { startX, startY, currentX, currentY } = state.marquee;
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    els.marquee.classList.remove('hidden');
    els.marquee.style.left = `${left}px`;
    els.marquee.style.top = `${top}px`;
    els.marquee.style.width = `${width}px`;
    els.marquee.style.height = `${height}px`;
  }

  function selectScenesInRect(rect, additive = false) {
    const visibleIds = getFilteredSceneIds();
    const nextSelected = additive ? new Set(state.selectedIds) : new Set();

    Object.entries(state.data.scenes || {}).forEach(([id, scene]) => {
      if (!visibleIds.has(id)) return;
      const pos = state.layout[id];
      if (!pos) return;
      const sceneRect = {
        left: pos.x,
        top: pos.y,
        right: pos.x + NODE_W,
        bottom: pos.y + nodeHeight(scene),
      };
      const intersects =
        sceneRect.left <= rect.right &&
        sceneRect.right >= rect.left &&
        sceneRect.top <= rect.bottom &&
        sceneRect.bottom >= rect.top;
      if (intersects) nextSelected.add(id);
    });

    state.selectedIds = nextSelected;
    state.selectedId = [...nextSelected].pop() || null;
    ensurePrimarySelection();
    renderNodes();
    renderPanel();
    renderMinimap();
  }

  // ── Undo 히스토리 ─────────────────────────────────────
  function snapshotState() {
    return JSON.stringify({
      data: state.data,
      layout: state.layout,
    });
  }

  function restoreSnapshot(snapshot) {
    const parsed = JSON.parse(snapshot);
    state.data = parsed.data || { first_scene: '', characters: {}, character_emotions: {}, questions: [], state_descriptors: [], scenes: {} };
    if (!state.data.characters) state.data.characters = {};
    if (!state.data.character_emotions) state.data.character_emotions = {};
    if (!Array.isArray(state.data.questions)) state.data.questions = [];
    if (!Array.isArray(state.data.state_descriptors)) state.data.state_descriptors = [];
    if (!state.data.scenes) state.data.scenes = {};
    state.layout = parsed.layout || {};
  }

  function pushHistory() {
    state.history.push(snapshotState());
    if (state.history.length > 30) state.history.shift();
    state.future = [];
  }
  function undo() {
    if (state.history.length === 0) { setStatus('더 이상 되돌릴 수 없습니다', true); return; }
    state.future.push(snapshotState());
    restoreSnapshot(state.history.pop());
    saveLayout();
    markDirty();
    render();
    state.selectedIds = new Set([...state.selectedIds].filter(id => state.data.scenes[id]));
    ensurePrimarySelection();
    renderPanel();
    setStatus('↩ 실행 취소');
  }
  function redo() {
    if (state.future.length === 0) { setStatus('더 이상 다시 실행할 수 없습니다', true); return; }
    state.history.push(snapshotState());
    restoreSnapshot(state.future.pop());
    saveLayout();
    markDirty();
    render();
    state.selectedIds = new Set([...state.selectedIds].filter(id => state.data.scenes[id]));
    ensurePrimarySelection();
    renderPanel();
    setStatus('↪ 다시 실행');
  }

  function isTyping() {
    const tag = document.activeElement?.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  }

  // ── 카메라 ────────────────────────────────────────────
  function applyCamera() {
    const { x, y, scale } = state.camera;
    els.canvas.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    if (els.zoomLabel) {
      els.zoomLabel.textContent = `${Math.round(scale * 100)}%`;
    }
    renderMinimap();
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

  function collectReachableScenes() {
    const scenes = state.data.scenes || {};
    const firstScene = state.data.first_scene;
    const reachable = new Set();
    const stack = [];

    if (firstScene && scenes[firstScene]) {
      stack.push(firstScene);
    }

    while (stack.length) {
      const id = stack.pop();
      if (reachable.has(id) || !scenes[id]) continue;
      reachable.add(id);
      const scene = scenes[id];
      if (scene.next_scene && scenes[scene.next_scene]) stack.push(scene.next_scene);
      (scene.branches || []).forEach(branch => {
        if (branch.next_scene && scenes[branch.next_scene]) stack.push(branch.next_scene);
      });
      (scene.choices || []).forEach(choice => {
        if (choice.next_scene && scenes[choice.next_scene]) stack.push(choice.next_scene);
      });
    }

    return reachable;
  }

  function isEndingScene(scene) {
    const hasDefaultNext = Boolean(scene.next_scene);
    const hasBranchNext = (scene.branches || []).some(branch => branch.next_scene);
    const hasChoiceNext = (scene.choices || []).some(choice => choice.next_scene);
    return !hasDefaultNext && !hasBranchNext && !hasChoiceNext;
  }

  // ── 노드 높이 계산 ────────────────────────────────────
  function nodeHeight(scene) {
    const branches = (scene.branches || []).length;
    const choices  = (scene.choices  || []).length;
    return NODE_HEADER_H + NODE_BODY_PAD * 2 + 16 + (branches + choices) * 24;
  }

  // ── 핀 위치 (canvas 좌표) ─────────────────────────────
  function pinPos(sceneId, pinType, idx) {
    const pos = state.layout[sceneId];
    if (!pos) return null;
    const scene = state.data.scenes[sceneId];
    const branchCount = (scene.branches || []).length;
    if (pinType === 'in') {
      return { x: pos.x, y: pos.y + NODE_HEADER_H / 2 };
    }
    if (pinType === 'out') {
      return { x: pos.x + NODE_W, y: pos.y + NODE_HEADER_H / 2 };
    }
    if (pinType === 'branch') {
      const baseY = pos.y + NODE_HEADER_H + NODE_BODY_PAD + 16 + idx * 24 + 12;
      return { x: pos.x + NODE_W, y: baseY };
    }
    if (pinType === 'choice') {
      const baseY = pos.y + NODE_HEADER_H + NODE_BODY_PAD + 16 + (branchCount + idx) * 24 + 12;
      return { x: pos.x + NODE_W, y: baseY };
    }
    return null;
  }

  // ── 레이아웃 저장/불러오기 ───────────────────────────
  function saveLayout() {
    try {
      const persisted = {};
      Object.entries(state.layout || {}).forEach(([sceneId, pos]) => {
        if (!state.data.scenes?.[sceneId]) return;
        if (!pos || !Number.isFinite(pos.x) || !Number.isFinite(pos.y)) return;
        persisted[sceneId] = { x: pos.x, y: pos.y };
      });
      localStorage.setItem('gyeongseong_node_layout', JSON.stringify(persisted));
    } catch(_) {}
  }
  function loadLayout() {
    try {
      const saved = JSON.parse(localStorage.getItem('gyeongseong_node_layout') || '{}');
      Object.assign(state.layout, saved);
    } catch(_) {}
  }

  // ── 베지어 경로 문자열 ────────────────────────────────
  function bezier(x1, y1, x2, y2) {
    const dx = Math.max(Math.abs(x2 - x1) * 0.5, 60);
    return `M${x1},${y1} C${x1+dx},${y1} ${x2-dx},${y2} ${x2},${y2}`;
  }

  function collectSceneSearchTokens(sceneId, scene) {
    const tokens = [
      sceneId,
      scene.title,
      String(scene.chapter ?? ''),
      scene.background,
      scene.music,
      scene.effect,
      scene.next_scene,
    ];

      (scene.dialogues || []).forEach(dialogue => {
        tokens.push(dialogue.label, dialogue.speaker, dialogue.speaker_id, dialogue.emotion_type, dialogue.text, dialogue.condition?.flag_key, dialogue.condition?.flag_value);
      });
    (scene.choices || []).forEach(choice => {
      tokens.push(choice.text, choice.flag_key, choice.flag_value, choice.next_scene, choice.next_dialogue);
    });
    (scene.branches || []).forEach(branch => {
      tokens.push(branch.flag_key, branch.flag_value, branch.next_scene);
    });
    (scene.evidence || []).forEach(evidence => {
      tokens.push(evidence.evidence_id || evidence.id, evidence.name, evidence.description);
    });

    return tokens
      .filter(value => value != null && value !== '')
      .map(value => String(value).toLowerCase());
  }

  function getFilteredSceneIds() {
    const query = (state.filters.query || '').trim().toLowerCase();
    const chapter = state.filters.chapter;
    const filtered = new Set();

    Object.entries(state.data.scenes || {}).forEach(([sceneId, scene]) => {
      if (chapter !== '' && String(scene.chapter ?? '') !== chapter) return;
      if (!query) {
        filtered.add(sceneId);
        return;
      }

      const tokens = collectSceneSearchTokens(sceneId, scene);
      if (tokens.some(token => token.includes(query))) {
        filtered.add(sceneId);
      }
    });

    return filtered;
  }

  function renderSearchFilterOptions() {
    const chapters = [...new Set(
      Object.values(state.data.scenes || {})
        .map(scene => scene.chapter)
        .filter(value => value != null && value !== '')
        .map(value => String(value))
    )].sort((a, b) => Number(a) - Number(b));

    const current = state.filters.chapter;
    els.fieldFilterChapter.innerHTML = [
      '<option value="">전체 챕터</option>',
      ...chapters.map(chapter =>
        `<option value="${escapeAttr(chapter)}"${chapter === current ? ' selected' : ''}>챕터 ${escapeHtml(chapter)}</option>`
      ),
    ].join('');
  }

  // ── 와이어 렌더링 ─────────────────────────────────────
  function renderWires() {
    // 기존 wire path들 제거 (temp wire 제외)
    els.wireLayer.querySelectorAll('.wire-path,.wire-label').forEach(el => el.remove());

    const scenes = state.data.scenes;
    const visibleIds = getFilteredSceneIds();

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
      if (!visibleIds.has(id)) return;
      const from = pinPos(id, 'out');
      if (from && scene.next_scene && scenes[scene.next_scene] && visibleIds.has(scene.next_scene)) {
        const to = pinPos(scene.next_scene, 'in');
        if (to) addWire(from.x, from.y, to.x, to.y, 'wire-next');
      }
      (scene.branches || []).forEach((branch, i) => {
        if (!branch.next_scene || !scenes[branch.next_scene] || !visibleIds.has(branch.next_scene)) return;
        const bfrom = pinPos(id, 'branch', i);
        const bto   = pinPos(branch.next_scene, 'in');
        if (bfrom && bto) {
          const label = branch.flag_key ? `${branch.flag_key}=${branch.flag_value ?? ''}` : null;
          addWire(bfrom.x, bfrom.y, bto.x, bto.y, 'wire-branch', label);
        }
      });
      (scene.choices || []).forEach((choice, i) => {
        if (!choice.next_scene || !scenes[choice.next_scene] || !visibleIds.has(choice.next_scene)) return;
        const cfrom = pinPos(id, 'choice', i);
        const cto   = pinPos(choice.next_scene, 'in');
        if (cfrom && cto) {
          const label = choice.text ? choice.text.slice(0, 12) : null;
          addWire(cfrom.x, cfrom.y, cto.x, cto.y, 'wire-choice', label);
        }
      });
    });
  }

  // ── 노드 렌더링 ───────────────────────────────────────
  function renderNodes() {
    els.nodeLayer.innerHTML = '';
    const scenes = state.data.scenes;
    const visibleIds = getFilteredSceneIds();
    const reachable = collectReachableScenes();

    Object.entries(scenes).forEach(([id, scene]) => {
      if (!visibleIds.has(id)) return;
      const pos = state.layout[id] || { x: 40, y: 40 };
      const isFirst = id === state.data.first_scene;
      const isSelected = isSceneSelected(id);
      const preview = scene.dialogues?.[0]?.text || '(대사 없음)';
      const branches = scene.branches || [];
      const choices  = scene.choices  || [];

      const node = document.createElement('div');
      node.className = `node${isSelected ? ' selected' : ''}${isFirst ? ' first-scene' : ''}${isEndingScene(scene) ? ' ending-scene' : ''}${!reachable.has(id) && id !== state.data.first_scene ? ' unreachable-scene' : ''}`;
      node.dataset.chapter = scene.chapter != null ? String(scene.chapter) : '';
      node.dataset.id = id;
      node.style.left = pos.x + 'px';
      node.style.top  = pos.y + 'px';

      // branch pin rows HTML
      const branchPins = branches.map((b, i) => {
        const label = b.flag_key ? `${b.flag_key}` : `branch ${i+1}`;
        return `<div class="pin-row" style="color:var(--text-dim);">
          <span>${escapeHtml(label)}</span>
          <div class="pin-branch" data-id="${escapeAttr(id)}" data-branch="${i}"></div>
        </div>`;
      }).join('');

      // choice pin rows HTML
      const choicePins = choices.map((c, i) => {
        const label = c.text ? c.text.slice(0, 12) : `choice ${i+1}`;
        return `<div class="pin-row" style="color:#88cc88;">
          <span>${escapeHtml(label)}</span>
          <div class="pin-choice" data-id="${escapeAttr(id)}" data-choice="${i}"></div>
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
          ${choicePins}
        </div>
        <div class="pin-out" data-id="${escapeAttr(id)}"></div>
      `;

      // 노드 선택
      node.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        if (e.target.classList.contains('pin-in') ||
            e.target.classList.contains('pin-out') ||
            e.target.classList.contains('pin-branch') ||
            e.target.classList.contains('pin-choice')) return;
        e.stopPropagation();
        e.preventDefault();
        const additive = e.ctrlKey || e.metaKey;
        const alreadySelected = isSceneSelected(id);
        if (!alreadySelected || additive) {
          selectScene(id, { additive, toggle: additive, preservePreview: alreadySelected });
        }

        // 노드 드래그 (헤더에서만)
        const dragIds = alreadySelected && !additive ? getSelectedSceneIds() : [id];
        state.dragging = {
          nodeId: id,
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          startPositions: dragIds.reduce((acc, sceneId) => {
            const scenePos = state.layout[sceneId] || { x: 40, y: 40 };
            acc[sceneId] = { x: scenePos.x, y: scenePos.y };
            return acc;
          }, {}),
          historyCaptured: false,
          moved: false,
        };
      });

      els.nodeLayer.appendChild(node);
    });
  }

  function render() {
    renderSearchFilterOptions();
    renderNodes();
    renderWires();
    renderMinimap();
  }

  function refreshMetaViews({ rerenderWires = false, rerenderValidation = false } = {}) {
    renderSearchFilterOptions();
    renderNodes();
    if (rerenderWires) renderWires();
    if (rerenderValidation) renderValidationPanel();
    renderAnalysisPanel();
    renderMinimap();
  }

  function getSceneBounds() {
    const entries = Object.entries(state.layout || {});
    if (entries.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 800 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    entries.forEach(([sceneId, pos]) => {
      const scene = state.data.scenes?.[sceneId];
      if (!scene) return;
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + NODE_W);
      maxY = Math.max(maxY, pos.y + nodeHeight(scene));
    });

    return {
      minX: Number.isFinite(minX) ? minX : 0,
      minY: Number.isFinite(minY) ? minY : 0,
      maxX: Number.isFinite(maxX) ? maxX : 1000,
      maxY: Number.isFinite(maxY) ? maxY : 800,
    };
  }

  function renderMinimap() {
    const canvas = els.minimapCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#111118';
    ctx.fillRect(0, 0, width, height);

    const bounds = getSceneBounds();
    const padding = 12;
    const worldW = Math.max(bounds.maxX - bounds.minX, 1);
    const worldH = Math.max(bounds.maxY - bounds.minY, 1);
    const scale = Math.min((width - padding * 2) / worldW, (height - padding * 2) / worldH);
    const offsetX = (width - worldW * scale) / 2;
    const offsetY = (height - worldH * scale) / 2;
    const visibleIds = getFilteredSceneIds();
    const reachable = collectReachableScenes();

    Object.entries(state.layout || {}).forEach(([sceneId, pos]) => {
      const scene = state.data.scenes?.[sceneId];
      if (!scene || !visibleIds.has(sceneId)) return;
      const x = offsetX + (pos.x - bounds.minX) * scale;
      const y = offsetY + (pos.y - bounds.minY) * scale;
      const w = Math.max(10, NODE_W * scale);
      const h = Math.max(8, nodeHeight(scene) * scale);

      let fill = '#7a6430';
      if (isEndingScene(scene)) fill = '#b06b45';
      else if (!reachable.has(sceneId) && sceneId !== state.data.first_scene) fill = '#55556a';
      else if (scene.chapter === 1) fill = '#6d8b72';
      else if (scene.chapter === 2) fill = '#9b8550';
      else if (scene.chapter === 3) fill = '#7a78af';
      else if (scene.chapter === 4) fill = '#9c6f8b';
      else if (scene.chapter === 5) fill = '#5f94a3';
      else if (scene.chapter === 6) fill = '#b36a5b';

      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
      if (state.selectedIds.has(sceneId)) {
        ctx.strokeStyle = '#f1d37b';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
      }
    });

    const viewportRect = els.viewport.getBoundingClientRect();
    const visibleWorldX = -state.camera.x / state.camera.scale;
    const visibleWorldY = -state.camera.y / state.camera.scale;
    const visibleWorldW = viewportRect.width / state.camera.scale;
    const visibleWorldH = viewportRect.height / state.camera.scale;

    const vx = offsetX + (visibleWorldX - bounds.minX) * scale;
    const vy = offsetY + (visibleWorldY - bounds.minY) * scale;
    const vw = visibleWorldW * scale;
    const vh = visibleWorldH * scale;
    ctx.strokeStyle = '#d4d0c8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vx, vy, vw, vh);
  }

  function setZoom(nextScale) {
    const scale = Math.max(0.2, Math.min(2.5, nextScale));
    const vr = els.viewport.getBoundingClientRect();
    const mx = vr.width / 2;
    const my = vr.height / 2;
    const prev = state.camera.scale;
    state.camera.x = mx - (mx - state.camera.x) * (scale / prev);
    state.camera.y = my - (my - state.camera.y) * (scale / prev);
    state.camera.scale = scale;
    applyCamera();
  }

  function resetAutoLayout() {
    pushHistory();
    state.layout = {};
    autoLayout();
    saveLayout();
    markDirty();
    render();
    setStatus('✓ 자동 정렬 적용 완료');
  }

  // ── 오른쪽 패널 ───────────────────────────────────────
  function renderPanel() {
    ensurePrimarySelection();
    const id = state.selectedId;
    const hasScene = Boolean(id && state.data.scenes[id]);
    renderCharacterList();
    renderCharacterEmotionList();
    renderQuestionList();
    renderStateDescriptorList();

    if (state.panelTab === 'character') {
      els.panelEmpty.classList.add('hidden');
      els.panelContent.classList.remove('hidden');
      applyPanelTabVisibility();
      return;
    }

    if (!hasScene) {
      els.panelEmpty.classList.remove('hidden');
      els.panelContent.classList.remove('hidden');
      applyPanelTabVisibility();
      (els.panelTabSections || []).forEach(section => {
        if (section.dataset.panelTab === 'node') section.classList.add('hidden');
      });
      return;
    }
    els.panelEmpty.classList.add('hidden');
    els.panelContent.classList.remove('hidden');
    applyPanelTabVisibility();

    const scene = state.data.scenes[id];

    els.fieldTitle.value = scene.title || '';
    els.fieldBg.value = scene.background || '';
    els.fieldChapter.value = scene.chapter ?? '';
    els.fieldMusic.value = scene.music || '';
    els.fieldEffect.value = scene.effect || '';
    els.fieldGoalKicker.value = scene.goal_kicker || '';
    els.fieldGoalText.value = scene.goal_text || '';
    els.fieldPriorityBudget.value = scene.priority_budget ?? '';
    els.fieldPriorityDialogues.value = scene.priority_dialogues
      ? JSON.stringify(scene.priority_dialogues, null, 2)
      : '';
    els.fieldSceneId.value = id;

    renderDialoguePreview(scene);
    renderDialogueList(scene);
    renderChoiceList(scene);
    renderPriorityDialogueList(scene);
    renderPriorityAfterList(scene);
    renderBranchList(scene);
    renderEvidenceList(scene);
    renderAnalysisPanel();
    renderValidationPanel();
  }

    function renderDialoguePreview(scene) {
      const dialogues = scene?.dialogues || [];
      const choices = scene?.choices || [];
      const total = dialogues.length;
      state.previewDialogueIndex = Math.max(0, Math.min(state.previewDialogueIndex, Math.max(total - 1, 0)));

      const line = total > 0 ? dialogues[state.previewDialogueIndex] : null;
      const previewBox = els.previewText.closest('.preview-dialogue-box');

      els.previewBackground.style.backgroundImage = scene?.background
        ? `linear-gradient(180deg, rgba(10, 10, 15, 0.25), rgba(10, 10, 15, 0.9)), url('../game/${scene.background}')`
        : '';
      els.previewChapter.textContent = scene?.chapter ? `CHAPTER ${scene.chapter}` : 'SCENE';
      els.previewSceneTitle.textContent = scene?.title || scene?.id || '씬 정보 없음';
    const previewSpeakerName =
      state.data.characters?.[line?.speaker_id]?.display_name || line?.speaker || '';
    els.previewSpeaker.textContent = previewSpeakerName;
      els.previewText.textContent = line?.text || '대사를 선택하거나 입력하면 여기서 바로 확인할 수 있습니다.';
      els.previewIndexLabel.textContent = total > 0 ? `${state.previewDialogueIndex + 1} / ${total}` : '0 / 0';
      els.btnPreviewPrev.disabled = total <= 1 || state.previewDialogueIndex === 0;
      els.btnPreviewNext.disabled = total <= 1 || state.previewDialogueIndex >= total - 1;
      previewBox.dataset.style = line?.style || (previewSpeakerName ? 'normal' : 'narration');
      els.previewChoiceList.innerHTML = choices.length
        ? choices.map(choice => `<div class="preview-choice-item">${escapeHtml(choice.text || '(빈 선택지)')}</div>`).join('')
        : '<div class="preview-choice-empty">이 씬에는 선택지가 없습니다.</div>';
    }

  // ── 씬 ID 변경 ───────────────────────────────────────
  function renameScene(oldId, newId) {
    newId = newId.trim();
    if (!newId || newId === oldId) return;
    pushHistory();
    if (state.data.scenes[newId]) {
      setStatus('오류: 이미 존재하는 ID', true);
      els.fieldSceneId.value = oldId;
      return;
    }
    // 씬 이동
    state.data.scenes[newId] = state.data.scenes[oldId];
    state.data.scenes[newId].id = newId;
    delete state.data.scenes[oldId];
    // 레이아웃 이동
    state.layout[newId] = state.layout[oldId];
    delete state.layout[oldId];
    // first_scene 갱신
    if (state.data.first_scene === oldId) state.data.first_scene = newId;
    // 참조 전체 갱신
    Object.values(state.data.scenes).forEach(scene => {
      if (scene.next_scene === oldId) scene.next_scene = newId;
      (scene.branches || []).forEach(b => { if (b.next_scene === oldId) b.next_scene = newId; });
      (scene.choices  || []).forEach(c => { if (c.next_scene === oldId) c.next_scene = newId; });
    });
    state.selectedIds.delete(oldId);
    state.selectedIds.add(newId);
    state.selectedId = newId;
    saveLayout();
    markDirty();
    render();
    renderPanel();
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

      card.querySelector('[data-action="up"]').addEventListener('click', () => { pushHistory(); onUp(i); });
      card.querySelector('[data-action="down"]').addEventListener('click', () => { pushHistory(); onDown(i); });
      card.querySelector('[data-action="delete"]').addEventListener('click', () => { pushHistory(); onDelete(i); });

      // 모든 input/textarea/select 변경 감지
      card.querySelectorAll('input,textarea,select').forEach(el => {
        const ev = el.tagName === 'SELECT' ? 'change' : 'input';
        const beginSnapshot = () => {
          if (card.dataset.historyCaptured === '1') return;
          pushHistory();
          card.dataset.historyCaptured = '1';
        };
        el.addEventListener('focus', beginSnapshot, { once: false });
        el.addEventListener(ev, () => {
          onChange(item, el.dataset.field, el.value);
        });
        el.addEventListener('blur', () => {
          card.dataset.historyCaptured = '0';
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
        <label><span>레이블 (점프 대상)</span>
          <input data-field="label" value="${escapeAttr(d.label || '')}" placeholder="예: after_choice_a"></label>
        <label><span>화자</span>
          <input data-field="speaker" value="${escapeAttr(d.speaker || '')}"></label>
        <label><span>SpeakerID</span>
          <input data-field="speaker_id" value="${escapeAttr(d.speaker_id || '')}" placeholder="?? Yuu"></label>
        <label><span>EmotionType</span>
          <input data-field="emotion_type" value="${escapeAttr(d.emotion_type || '')}" placeholder="?? Neutral"></label>
        <label><span>StandingSlot</span>
          <input data-field="standing_slot" value="${escapeAttr(d.standing_slot || '')}" placeholder="?? Left"></label>
        <label><span>FocusType</span>
          <input data-field="focus_type" value="${escapeAttr(d.focus_type || '')}" placeholder="?? Speaker"></label>
        <label><span>EnterMotion</span>
          <input data-field="enter_motion" value="${escapeAttr(d.enter_motion || '')}" placeholder="?? FadeIn"></label>
        <label><span>ExitMotion</span>
          <input data-field="exit_motion" value="${escapeAttr(d.exit_motion || '')}" placeholder="?? FadeOut"></label>
        <label><span>IdleMotion</span>
          <input data-field="idle_motion" value="${escapeAttr(d.idle_motion || '')}" placeholder="?? Tremble"></label>
        <label><span>FxType</span>
          <input data-field="fx_type" value="${escapeAttr(d.fx_type || '')}" placeholder="?? BlueTrace"></label>
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
        markDirty();
        render();
        renderDialoguePreview(scene);
        renderValidationPanel();
      }
    );

    cards.querySelectorAll('.pcard').forEach((card, index) => {
      const focusables = card.querySelectorAll('input, textarea, select');
      focusables.forEach(el => {
        el.addEventListener('focus', () => {
          state.previewDialogueIndex = index;
          renderDialoguePreview(scene);
        });
      });
    });

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

    replaceEnumInputs(cards, [
      { field: 'emotion_type', options: EMOTION_TYPE_OPTIONS },
      { field: 'standing_slot', options: STANDING_SLOT_OPTIONS },
      { field: 'focus_type', options: FOCUS_TYPE_OPTIONS },
      { field: 'enter_motion', options: ENTER_MOTION_OPTIONS },
      { field: 'exit_motion', options: EXIT_MOTION_OPTIONS },
      { field: 'idle_motion', options: IDLE_MOTION_OPTIONS },
      { field: 'fx_type', options: FX_TYPE_OPTIONS },
    ]);

    // speaker_id → 캐릭터 드롭다운 교체
    const characterIds = Object.keys(state.data.characters || {}).sort();
    cards.querySelectorAll('input[data-field="speaker_id"]').forEach(input => {
      const sel = document.createElement('select');
      sel.dataset.field = 'speaker_id';
      const blank = document.createElement('option');
      blank.value = ''; blank.textContent = '—';
      sel.appendChild(blank);
      characterIds.forEach(cid => {
        const opt = document.createElement('option');
        opt.value = cid;
        opt.textContent = state.data.characters[cid]?.display_name || cid;
        if (input.value === cid) opt.selected = true;
        sel.appendChild(opt);
      });
      input.replaceWith(sel);
    });

    // speaker_id 변경 시 emotion_type 선택지 연동
    cards.querySelectorAll('select[data-field="speaker_id"]').forEach(speakerSel => {
      speakerSel.addEventListener('change', () => {
        const sid = speakerSel.value;
        const card = speakerSel.closest('.pcard');
        const emotionSel = card?.querySelector('select[data-field="emotion_type"]');
        if (!emotionSel) return;
        const cur = emotionSel.value;
        const emotions = sid
          ? Object.keys((state.data.character_emotions || {})[sid] || {})
          : [];
        const opts = emotions.length > 0 ? emotions : EMOTION_TYPE_OPTIONS;
        emotionSel.innerHTML = '<option value="">—</option>' +
          opts.map(e => `<option value="${e}"${cur === e ? ' selected' : ''}>${e}</option>`).join('');
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
        <label><span>다음 씬 (없으면 현재 씬 유지)</span>
          <input data-field="next_scene" value="${escapeAttr(c.next_scene || '')}"></label>
        <label><span>조사 분기 키 (next_dialogue)</span>
          <input data-field="next_dialogue" value="${escapeAttr(c.next_dialogue || '')}" placeholder="예: after_choice_a"></label>
        <label><span>조사 비용 (priority_cost, 비워두면 일반 선택지)</span>
          <input data-field="priority_cost" type="number" min="0" step="1" value="${escapeAttr(c.priority_cost != null ? String(c.priority_cost) : '')}"></label>
        <label><span>플래그 키</span>
          <input data-field="flag_key" value="${escapeAttr(c.flag_key || '')}"></label>
        <label><span>플래그 값</span>
          <input data-field="flag_value" value="${escapeAttr(c.flag_value != null ? String(c.flag_value) : '')}"></label>
      `,
      () => { scene.choices.push(newChoice()); afterChange(); },
      (i) => { scene.choices.splice(i, 1); afterChange(); },
      (i) => { if (swap(scene.choices, i-1, i)) afterChange(); },
      (i) => { if (swap(scene.choices, i, i+1)) afterChange(); },
      (c, field, value) => { c[field] = value; markDirty(); renderWires(); renderValidationPanel(); }
    );

    els.choiceList.appendChild(cards);
  }

  function createPriorityDialogueLine() {
    return {
      order: 0,
      speaker: '',
      speaker_id: '',
      emotion_type: '',
      text: '',
      portrait: null,
      style: 'narration',
    };
  }

  function getNextPriorityGroupKey(scene) {
    const existing = new Set(Object.keys(scene.priority_dialogues || {}));
    const suggested = (scene.choices || [])
      .map(choice => String(choice.next_dialogue || '').trim())
      .filter(Boolean);

    const unusedSuggested = suggested.find(key => !existing.has(key));
    if (unusedSuggested) return unusedSuggested;

    let index = 1;
    let candidate = `priority_branch_${index}`;
    while (existing.has(candidate)) {
      index += 1;
      candidate = `priority_branch_${index}`;
    }
    return candidate;
  }

  function renamePriorityDialogueGroup(scene, oldKey, nextKey) {
    const trimmed = (nextKey || '').trim();
    if (!trimmed || trimmed === oldKey) return true;
    if (scene.priority_dialogues?.[trimmed]) return false;
    scene.priority_dialogues[trimmed] = scene.priority_dialogues[oldKey] || [];
    delete scene.priority_dialogues[oldKey];
    (scene.choices || []).forEach(choice => {
      if (choice.next_dialogue === oldKey) choice.next_dialogue = trimmed;
    });
    return true;
  }

  function renderPriorityDialogueList(scene) {
    scene.priority_dialogues = scene.priority_dialogues || {};
    els.priorityDialogueList.innerHTML = '';

    const groupEntries = Object.entries(scene.priority_dialogues);
    if (groupEntries.length === 0) {
      els.priorityDialogueList.innerHTML = '<div class="preview-choice-empty">등록된 조사 분기 대사가 없습니다.</div>';
      return;
    }

    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '10px';

    groupEntries.forEach(([groupKey, lines]) => {
      const groupCard = document.createElement('div');
      groupCard.className = 'pcard';

      const keyOptions = (scene.choices || [])
        .map(choice => String(choice.next_dialogue || '').trim())
        .filter(Boolean)
        .filter((key, index, array) => array.indexOf(key) === index)
        .map(key => `<option value="${escapeAttr(key)}"></option>`)
        .join('');

      groupCard.innerHTML = `
        <div class="pcard-toolbar">
          <span>조사 분기 키</span>
          <div class="actions">
            <button type="button" data-action="add-line">+</button>
            <button type="button" data-action="delete-group" class="danger">횞</button>
          </div>
        </div>
        <label><span>PriorityKey</span>
          <input data-role="group-key" list="priority-key-options-${escapeAttr(groupKey)}" value="${escapeAttr(groupKey)}" placeholder="예: inspect_wall">
          <datalist id="priority-key-options-${escapeAttr(groupKey)}">${keyOptions}</datalist>
        </label>
        <div class="priority-group-lines"></div>
      `;

      const groupKeyInput = groupCard.querySelector('[data-role="group-key"]');
      groupKeyInput.addEventListener('focus', pushHistory, { once: true });
      groupKeyInput.addEventListener('blur', () => {
        const nextKey = groupKeyInput.value.trim();
        if (!renamePriorityDialogueGroup(scene, groupKey, nextKey)) {
          setStatus('이미 존재하는 PriorityKey입니다', true);
          renderPanel();
          return;
        }
        markDirty();
        renderPanel();
      });

      groupCard.querySelector('[data-action="add-line"]').addEventListener('click', () => {
        pushHistory();
        scene.priority_dialogues[groupKey] = scene.priority_dialogues[groupKey] || [];
        scene.priority_dialogues[groupKey].push(createPriorityDialogueLine());
        afterChange();
      });

      groupCard.querySelector('[data-action="delete-group"]').addEventListener('click', () => {
        pushHistory();
        delete scene.priority_dialogues[groupKey];
        afterChange();
      });

      const lineWrap = groupCard.querySelector('.priority-group-lines');
      const lineCards = makeCard(
        '분기 대사',
        lines,
        (line) => `
          <label><span>화자</span>
            <input data-field="speaker" value="${escapeAttr(line.speaker || '')}"></label>
          <label><span>SpeakerID</span>
            <input data-field="speaker_id" value="${escapeAttr(line.speaker_id || '')}"></label>
          <label><span>EmotionType</span>
            <input data-field="emotion_type" value="${escapeAttr(line.emotion_type || '')}"></label>
          <label><span>스타일</span>
            <select data-field="style">
              ${STYLE_OPTIONS.map(s => `<option value="${s}"${(line.style || 'narration') === s ? ' selected' : ''}>${s}</option>`).join('')}
            </select></label>
          <label><span>텍스트</span>
            <textarea data-field="text">${escapeHtml(line.text || '')}</textarea></label>
        `,
        () => {
          scene.priority_dialogues[groupKey].push(createPriorityDialogueLine());
          afterChange();
        },
        (index) => {
          scene.priority_dialogues[groupKey].splice(index, 1);
          afterChange();
        },
        (index) => { if (swap(scene.priority_dialogues[groupKey], index - 1, index)) afterChange(); },
        (index) => { if (swap(scene.priority_dialogues[groupKey], index, index + 1)) afterChange(); },
        (line, field, value) => {
          line[field] = value || (field === 'style' ? 'narration' : '');
          markDirty();
          els.fieldPriorityDialogues.value = JSON.stringify(scene.priority_dialogues, null, 2);
        }
      );

      replaceEnumInputs(lineCards, [
        { field: 'emotion_type', options: EMOTION_TYPE_OPTIONS },
      ]);

      const characterIds = Object.keys(state.data.characters || {}).sort();
      lineCards.querySelectorAll('input[data-field="speaker_id"]').forEach(input => {
        const select = document.createElement('select');
        select.dataset.field = 'speaker_id';
        select.innerHTML = renderSelectOptions(characterIds, input.value || '', true);
        input.replaceWith(select);
      });

      lineWrap.appendChild(lineCards);
      wrap.appendChild(groupCard);
    });

    els.priorityDialogueList.appendChild(wrap);
  }

  // 조사 후 대사 목록
  function renderPriorityAfterList(scene) {
    if (!scene.priority_after_dialogues) scene.priority_after_dialogues = [];
    els.priorityAfterList.innerHTML = '';

    const cards = makeCard(
      '조사 후 대사', scene.priority_after_dialogues,
      (d) => `
        <label><span>화자</span>
          <input data-field="speaker" value="${escapeAttr(d.speaker || '')}"></label>
        <label><span>텍스트</span>
          <textarea data-field="text">${escapeHtml(d.text || '')}</textarea></label>
        <label><span>스타일</span>
          <input data-field="style" value="${escapeAttr(d.style || 'narration')}"></label>
      `,
      () => { scene.priority_after_dialogues.push({ order: scene.priority_after_dialogues.length + 1, speaker: '', text: '', style: 'narration', portrait: null }); afterChange(); },
      (i) => { scene.priority_after_dialogues.splice(i, 1); afterChange(); },
      (i) => { if (swap(scene.priority_after_dialogues, i-1, i)) afterChange(); },
      (i) => { if (swap(scene.priority_after_dialogues, i, i+1)) afterChange(); },
      (d, field, value) => { d[field] = value; markDirty(); }
    );

    els.priorityAfterList.appendChild(cards);
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
      (b, field, value) => { b[field] = value; markDirty(); render(); renderValidationPanel(); }
    );

    els.branchList.appendChild(cards);
  }

  // 단서 목록
  function renderEvidenceList(scene) {
    if (!scene.evidence) scene.evidence = [];
    els.evidenceList.innerHTML = '';

    const cards = makeCard(
      '단서', scene.evidence,
      (e) => `
        <label><span>단서 ID</span>
          <input data-field="evidence_id" value="${escapeAttr(e.evidence_id || e.id || '')}" placeholder="예: ev_note"></label>
        <label><span>이름</span>
          <input data-field="name" value="${escapeAttr(e.name || '')}"></label>
        <label><span>설명</span>
          <textarea data-field="description">${escapeHtml(e.description || '')}</textarea></label>
        <label><span>이미지</span>
          <input data-field="image" value="${escapeAttr(e.image || '')}"></label>
        <label><span>카테고리 ID</span>
          <input data-field="category_id" value="${escapeAttr(e.category_id || '')}" placeholder="예: ritual"></label>
        <label><span>카테고리명</span>
          <input data-field="category_title" value="${escapeAttr(e.category_title || '')}" placeholder="예: 의례와 공명"></label>
        <label><span>카테고리 설명</span>
          <input data-field="category_hint" value="${escapeAttr(e.category_hint || '')}" placeholder="예: 문, 무녀, 감응과 연결된 흔적"></label>
        <label><span>트리거</span>
          <select data-field="trigger">
            <option value="auto"${(e.trigger || 'auto') === 'auto' ? ' selected' : ''}>auto</option>
            <option value="click"${e.trigger === 'click' ? ' selected' : ''}>click</option>
          </select></label>
      `,
      () => { scene.evidence.push(newEvidence()); afterChange(); },
      (i) => { scene.evidence.splice(i, 1); afterChange(); },
      (i) => { if (swap(scene.evidence, i-1, i)) afterChange(); },
      (i) => { if (swap(scene.evidence, i, i+1)) afterChange(); },
      (evidence, field, value) => {
        if (field === 'evidence_id') {
          evidence.evidence_id = value;
          delete evidence.id;
        } else {
          evidence[field] = value;
        }
        markDirty();
        renderValidationPanel();
      }
    );

    els.evidenceList.appendChild(cards);
  }

  function getCharacterRows() {
    return Object.entries(state.data.characters || {}).map(([characterId, character]) => ({
      CharacterID: characterId,
      DisplayName: character?.display_name || '',
      DefaultEmotionType: character?.default_emotion_type || '',
      DefaultImagePath: character?.default_image_path || '',
      RoleText: character?.role_text || '',
      NotebookSummary1: character?.notebook_summary1 || '',
      NotebookSummary2: character?.notebook_summary2 || '',
    }));
  }

  function getCharacterEmotionRows() {
    const rows = [];
    Object.entries(state.data.character_emotions || {}).forEach(([characterId, emotionMap]) => {
      Object.entries(emotionMap || {}).forEach(([emotionType, imagePath]) => {
        rows.push({
          CharacterID: characterId,
          EmotionType: emotionType,
          ImagePath: imagePath || '',
        });
      });
    });
    return rows;
  }

  function getQuestionRows() {
    return (state.data.questions || []).map(question => ({
      QuestionID: question?.question_id || '',
      Title: question?.title || '',
      Detail: question?.detail || '',
      SortOrder: question?.sort_order ?? '',
      Category: question?.category || '',
      VisibleRuleID: question?.visible_rule_id || '',
      StateRuleID: question?.state_rule_id || '',
    }));
  }

  function getStateDescriptorRows() {
    return (state.data.state_descriptors || []).map(descriptor => ({
      DescriptorID: descriptor?.descriptor_id || '',
      TargetFlagID: descriptor?.target_flag_id || '',
      MinValue: descriptor?.min_value ?? '',
      MaxValue: descriptor?.max_value ?? '',
      Label: descriptor?.label || '',
      Detail: descriptor?.detail || '',
    }));
  }

  function syncCharacterEmotionBuckets() {
    Object.keys(state.data.character_emotions || {}).forEach(characterId => {
      if (!state.data.characters?.[characterId] && Object.keys(state.data.character_emotions[characterId] || {}).length === 0) {
        delete state.data.character_emotions[characterId];
      }
    });
  }

  function renameCharacterId(oldId, newId) {
    const trimmed = (newId || '').trim();
    if (!oldId || !trimmed || trimmed === oldId) return true;
    if (state.data.characters[trimmed]) return false;

    state.data.characters[trimmed] = state.data.characters[oldId] || {
      id: trimmed,
      display_name: '',
      default_emotion_type: '',
      default_image_path: '',
    };
    state.data.characters[trimmed].id = trimmed;
    delete state.data.characters[oldId];

    if (state.data.character_emotions?.[oldId]) {
      state.data.character_emotions[trimmed] = state.data.character_emotions[oldId];
      delete state.data.character_emotions[oldId];
    }

    Object.values(state.data.scenes || {}).forEach(scene => {
      (scene.dialogues || []).forEach(dialogue => {
        if (dialogue.speaker_id === oldId) dialogue.speaker_id = trimmed;
      });
    });

    return true;
  }

  function moveCharacterEmotion(oldCharacterId, oldEmotionType, nextCharacterId, nextEmotionType, imagePath) {
    const characterId = (nextCharacterId || '').trim();
    const emotionType = (nextEmotionType || '').trim();
    if (!characterId || !emotionType) return false;

    if (!state.data.character_emotions) state.data.character_emotions = {};
    if (!state.data.character_emotions[characterId]) state.data.character_emotions[characterId] = {};
    state.data.character_emotions[characterId][emotionType] = imagePath || '';

    if (oldCharacterId && state.data.character_emotions?.[oldCharacterId]) {
      delete state.data.character_emotions[oldCharacterId][oldEmotionType];
      if (Object.keys(state.data.character_emotions[oldCharacterId]).length === 0) {
        delete state.data.character_emotions[oldCharacterId];
      }
    }

    return true;
  }

  function renderCharacterList() {
    els.characterList.innerHTML = '';
    const rows = getCharacterRows();

    const cards = makeCard(
      'Character', rows,
      (row) => `
        <label><span>CharacterID</span>
          <input data-field="CharacterID" value="${escapeAttr(row.CharacterID || '')}" placeholder="예: Yuu"></label>
        <label><span>DisplayName</span>
          <input data-field="DisplayName" value="${escapeAttr(row.DisplayName || '')}" placeholder="예: 유웅룡"></label>
        <label><span>DefaultEmotionType</span>
          <input data-field="DefaultEmotionType" value="${escapeAttr(row.DefaultEmotionType || '')}" placeholder="예: Neutral"></label>
        <label><span>DefaultImagePath</span>
          <input data-field="DefaultImagePath" value="${escapeAttr(row.DefaultImagePath || '')}" placeholder="assets/standing/..."></label>
        <label><span>RoleText</span>
          <input data-field="RoleText" value="${escapeAttr(row.RoleText || '')}" placeholder="예: 증언자"></label>
        <label><span>NotebookSummary1</span>
          <textarea data-field="NotebookSummary1" rows="2">${escapeHtml(row.NotebookSummary1 || '')}</textarea></label>
        <label><span>NotebookSummary2</span>
          <textarea data-field="NotebookSummary2" rows="2">${escapeHtml(row.NotebookSummary2 || '')}</textarea></label>
      `,
      () => {
        const characterId = `Character${rows.length + 1}`;
        if (!state.data.characters) state.data.characters = {};
        state.data.characters[characterId] = {
          id: characterId,
          display_name: '',
          default_emotion_type: 'Neutral',
          default_image_path: '',
          role_text: '',
          notebook_summary1: '',
          notebook_summary2: '',
        };
        afterChange();
      },
      (i) => {
        const target = rows[i];
        if (!target) return;
        delete state.data.characters[target.CharacterID];
        delete state.data.character_emotions[target.CharacterID];
        Object.values(state.data.scenes || {}).forEach(scene => {
          (scene.dialogues || []).forEach(dialogue => {
            if (dialogue.speaker_id === target.CharacterID) dialogue.speaker_id = null;
          });
        });
        afterChange();
      },
      () => {},
      () => {},
      (row, field, value) => {
        const currentId = row.CharacterID;
        if (!state.data.characters[currentId]) {
          state.data.characters[currentId] = {
            id: currentId,
            display_name: '',
            default_emotion_type: '',
            default_image_path: '',
            role_text: '',
            notebook_summary1: '',
            notebook_summary2: '',
          };
        }

        if (field === 'CharacterID') {
          const nextId = (value || '').trim();
          if (!nextId) return;
          if (!renameCharacterId(currentId, nextId)) {
            setStatus('이미 존재하는 CharacterID입니다', true);
            renderPanel();
            return;
          }
          row.CharacterID = nextId;
          markDirty();
          renderPanel();
          return;
        } else {
          const target = state.data.characters[row.CharacterID];
          if (field === 'DisplayName') target.display_name = value || '';
          if (field === 'DefaultEmotionType') target.default_emotion_type = value || '';
          if (field === 'DefaultImagePath') target.default_image_path = value || '';
          if (field === 'RoleText') target.role_text = value || '';
          if (field === 'NotebookSummary1') target.notebook_summary1 = value || '';
          if (field === 'NotebookSummary2') target.notebook_summary2 = value || '';
        }

        markDirty();
        renderNodes();
        renderAnalysisPanel();
        renderValidationPanel();
      }
    );

    replaceEnumInputs(cards, [
      { field: 'DefaultEmotionType', options: EMOTION_TYPE_OPTIONS },
    ]);

    els.characterList.appendChild(cards);
  }

  function renderCharacterEmotionList() {
    els.characterEmotionList.innerHTML = '';
    const rows = getCharacterEmotionRows();

    const cards = makeCard(
      'CharacterEmotion', rows,
      (row) => `
        <label><span>CharacterID</span>
          <input data-field="CharacterID" value="${escapeAttr(row.CharacterID || '')}" placeholder="예: Yuu"></label>
        <label><span>EmotionType</span>
          <input data-field="EmotionType" value="${escapeAttr(row.EmotionType || '')}" placeholder="예: Neutral"></label>
        <label><span>ImagePath</span>
          <input data-field="ImagePath" value="${escapeAttr(row.ImagePath || '')}" placeholder="assets/standing/..."></label>
      `,
      () => {
        if (!state.data.character_emotions) state.data.character_emotions = {};
        if (!state.data.character_emotions.__NewCharacter__) state.data.character_emotions.__NewCharacter__ = {};
        state.data.character_emotions.__NewCharacter__.Neutral = '';
        afterChange();
      },
      (i) => {
        const target = rows[i];
        if (!target) return;
        if (state.data.character_emotions?.[target.CharacterID]) {
          delete state.data.character_emotions[target.CharacterID][target.EmotionType];
          if (Object.keys(state.data.character_emotions[target.CharacterID]).length === 0) {
            delete state.data.character_emotions[target.CharacterID];
          }
        }
        afterChange();
      },
      () => {},
      () => {},
      (row, field, value) => {
        const currentCharacterId = row.CharacterID;
        const currentEmotionType = row.EmotionType;

        if (field === 'ImagePath') {
          if (!state.data.character_emotions[currentCharacterId]) state.data.character_emotions[currentCharacterId] = {};
          state.data.character_emotions[currentCharacterId][currentEmotionType] = value || '';
        } else {
          const nextCharacterId = field === 'CharacterID' ? value : row.CharacterID;
          const nextEmotionType = field === 'EmotionType' ? value : row.EmotionType;
          const imagePath = state.data.character_emotions?.[currentCharacterId]?.[currentEmotionType] || row.ImagePath || '';
          if (!moveCharacterEmotion(currentCharacterId, currentEmotionType, nextCharacterId, nextEmotionType, imagePath)) {
            setStatus('CharacterID와 EmotionType은 비워둘 수 없습니다', true);
            renderPanel();
            return;
          }
          row.CharacterID = (nextCharacterId || '').trim();
          row.EmotionType = (nextEmotionType || '').trim();
          syncCharacterEmotionBuckets();
          markDirty();
          renderPanel();
          return;
        }

        syncCharacterEmotionBuckets();
        markDirty();
      }
    );

    replaceCharacterIdInputs(cards, 'CharacterID');
    replaceEnumInputs(cards, [
      { field: 'EmotionType', options: EMOTION_TYPE_OPTIONS, includeBlank: false },
    ]);

    els.characterEmotionList.appendChild(cards);
  }

  function renderQuestionList() {
    els.questionList.innerHTML = '';
    const rows = getQuestionRows();

    const cards = makeCard(
      'Question', rows,
      (row) => `
        <label><span>QuestionID</span>
          <input data-field="QuestionID" value="${escapeAttr(row.QuestionID || '')}" placeholder="예: QSonggeumMissing"></label>
        <label><span>Title</span>
          <input data-field="Title" value="${escapeAttr(row.Title || '')}" placeholder="질문 제목"></label>
        <label><span>Detail</span>
          <textarea data-field="Detail" rows="3">${escapeHtml(row.Detail || '')}</textarea></label>
        <label><span>SortOrder</span>
          <input data-field="SortOrder" type="number" min="0" step="1" value="${escapeAttr(row.SortOrder != null ? String(row.SortOrder) : '')}"></label>
        <label><span>Category</span>
          <input data-field="Category" value="${escapeAttr(row.Category || '')}" placeholder="예: Missing"></label>
        <label><span>VisibleRuleID</span>
          <input data-field="VisibleRuleID" value="${escapeAttr(row.VisibleRuleID || '')}" placeholder="예: QR_SonggeumOpen"></label>
        <label><span>StateRuleID</span>
          <input data-field="StateRuleID" value="${escapeAttr(row.StateRuleID || '')}" placeholder="예: QS_SonggeumMissing"></label>
      `,
      () => {
        state.data.questions = state.data.questions || [];
        state.data.questions.push(newQuestion());
        afterChange();
      },
      (i) => {
        state.data.questions.splice(i, 1);
        afterChange();
      },
      (i) => { if (swap(state.data.questions, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.questions, i, i + 1)) afterChange(); },
      (row, field, value) => {
        const target = state.data.questions.find(question => (question.question_id || '') === row.QuestionID) || state.data.questions.find((_, idx) => rows[idx] === row);
        if (!target) return;
        if (field === 'QuestionID') target.question_id = value || '';
        if (field === 'Title') target.title = value || '';
        if (field === 'Detail') target.detail = value || '';
        if (field === 'SortOrder') target.sort_order = value === '' ? null : Number.parseInt(value, 10);
        if (field === 'Category') target.category = value || '';
        if (field === 'VisibleRuleID') target.visible_rule_id = value || '';
        if (field === 'StateRuleID') target.state_rule_id = value || '';
        markDirty();
      }
    );

    els.questionList.appendChild(cards);
  }

  function renderStateDescriptorList() {
    els.stateDescriptorList.innerHTML = '';
    const rows = getStateDescriptorRows();

    const cards = makeCard(
      'StateDescriptor', rows,
      (row) => `
        <label><span>DescriptorID</span>
          <input data-field="DescriptorID" value="${escapeAttr(row.DescriptorID || '')}" placeholder="예: SD_Resonance_0"></label>
        <label><span>TargetFlagID</span>
          <input data-field="TargetFlagID" value="${escapeAttr(row.TargetFlagID || '')}" placeholder="예: ResonanceLevel"></label>
        <label><span>MinValue</span>
          <input data-field="MinValue" type="number" step="1" value="${escapeAttr(row.MinValue != null ? String(row.MinValue) : '')}"></label>
        <label><span>MaxValue</span>
          <input data-field="MaxValue" type="number" step="1" value="${escapeAttr(row.MaxValue != null ? String(row.MaxValue) : '')}"></label>
        <label><span>Label</span>
          <input data-field="Label" value="${escapeAttr(row.Label || '')}" placeholder="예: 전조"></label>
        <label><span>Detail</span>
          <textarea data-field="Detail" rows="3">${escapeHtml(row.Detail || '')}</textarea></label>
      `,
      () => {
        state.data.state_descriptors = state.data.state_descriptors || [];
        state.data.state_descriptors.push(newStateDescriptor());
        afterChange();
      },
      (i) => {
        state.data.state_descriptors.splice(i, 1);
        afterChange();
      },
      (i) => { if (swap(state.data.state_descriptors, i - 1, i)) afterChange(); },
      (i) => { if (swap(state.data.state_descriptors, i, i + 1)) afterChange(); },
      (row, field, value) => {
        const target = state.data.state_descriptors.find(descriptor => (descriptor.descriptor_id || '') === row.DescriptorID) || state.data.state_descriptors.find((_, idx) => rows[idx] === row);
        if (!target) return;
        if (field === 'DescriptorID') target.descriptor_id = value || '';
        if (field === 'TargetFlagID') target.target_flag_id = value || '';
        if (field === 'MinValue') target.min_value = value === '' ? null : Number(value);
        if (field === 'MaxValue') target.max_value = value === '' ? null : Number(value);
        if (field === 'Label') target.label = value || '';
        if (field === 'Detail') target.detail = value || '';
        markDirty();
      }
    );

    els.stateDescriptorList.appendChild(cards);
  }

  function afterChange() {
    markDirty();
    render();
    renderPanel();
  }

  // 기본 객체 생성
  function newDialogue() {
    return { order: 0, speaker: '', speaker_id: '', emotion_type: '', text: '', portrait: null, style: 'normal', condition: null };
  }
  function newChoice() {
    return { order: 0, text: '', next_scene: '', next_dialogue: '', priority_cost: '', flag_key: '', flag_value: '' };
  }
  function newBranch() {
    return { flag_key: '', flag_value: '', next_scene: '' };
  }
  function newEvidence() {
    return { evidence_id: '', trigger: 'auto', name: '', description: '', image: '', category_id: '', category_title: '', category_hint: '' };
  }
  function newCharacter() {
    return { CharacterID: '', DisplayName: '', DefaultEmotionType: 'Neutral', DefaultImagePath: '', RoleText: '', NotebookSummary1: '', NotebookSummary2: '' };
  }
  function newCharacterEmotion() {
    return { CharacterID: '', EmotionType: 'Neutral', ImagePath: '' };
  }
  function newQuestion() {
    return { question_id: '', title: '', detail: '', sort_order: null, category: '', visible_rule_id: '', state_rule_id: '' };
  }
  function newStateDescriptor() {
    return { descriptor_id: '', target_flag_id: '', min_value: 0, max_value: 0, label: '', detail: '' };
  }
  function newScene(id) {
    return {
      id, chapter: null, title: id, background: null, music: null, effect: null, next_scene: null,
      goal_kicker: null, goal_text: null,
      priority_budget: null, priority_dialogues: {}, priority_after_dialogues: [],
      branches: [], dialogues: [], choices: [], evidence: []
    };
  }

  function normalizeOrder(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function normalizeFlagValue(value) {
    if (value === '' || value == null) return null;
    return value;
  }

  function normalizeScene(sceneId, scene) {
    const normalizedDialogues = (scene.dialogues || []).map((dialogue, index) => {
      const condition = dialogue.condition?.flag_key
        ? {
            flag_key: dialogue.condition.flag_key,
            flag_value: normalizeFlagValue(dialogue.condition.flag_value),
          }
        : null;

      return {
        order: normalizeOrder(dialogue.order, index + 1),
        speaker: dialogue.speaker || '',
        speaker_id: dialogue.speaker_id || null,
        emotion_type: dialogue.emotion_type || null,
        standing_slot: dialogue.standing_slot || null,
        focus_type: dialogue.focus_type || null,
        enter_motion: dialogue.enter_motion || null,
        exit_motion: dialogue.exit_motion || null,
        idle_motion: dialogue.idle_motion || null,
        fx_type: dialogue.fx_type || null,
        text: dialogue.text || '',
        style: dialogue.style || 'normal',
        portrait: dialogue.portrait || null,
        label: dialogue.label || null,
        condition,
      };
    });

    const normalizedChoices = (scene.choices || []).map((choice, index) => {
      const c = {
        order: normalizeOrder(choice.order, index + 1),
        text: choice.text || '',
        flag_key: choice.flag_key || null,
        flag_value: normalizeFlagValue(choice.flag_value),
        next_scene: choice.next_scene || null,
        next_dialogue: choice.next_dialogue || null,
      };
      const cost = choice.priority_cost != null && choice.priority_cost !== ''
        ? Number.parseInt(choice.priority_cost, 10)
        : null;
      if (cost != null && Number.isFinite(cost)) c.priority_cost = cost;
      return c;
    });

    const normalizedPriorityDialogues = {};
    Object.entries(scene.priority_dialogues || {}).forEach(([groupKey, lines]) => {
      const trimmedKey = String(groupKey || '').trim();
      if (!trimmedKey) return;
      normalizedPriorityDialogues[trimmedKey] = (lines || []).map((line, index) => ({
        order: normalizeOrder(line.order, index + 1),
        speaker: line.speaker || '',
        speaker_id: line.speaker_id || null,
        emotion_type: line.emotion_type || null,
        text: line.text || '',
        style: line.style || 'narration',
        portrait: line.portrait || null,
      }));
    });

    const normalizedPriorityAfterDialogues = (scene.priority_after_dialogues || []).map((line, index) => ({
      order: normalizeOrder(line.order, index + 1),
      speaker: line.speaker || '',
      speaker_id: line.speaker_id || null,
      emotion_type: line.emotion_type || null,
      text: line.text || '',
      style: line.style || 'narration',
      portrait: line.portrait || null,
    }));

    const normalizedBranches = (scene.branches || []).map((branch, index) => ({
      order: normalizeOrder(branch.order, index + 1),
      flag_key: branch.flag_key || '',
      flag_value: normalizeFlagValue(branch.flag_value),
      next_scene: branch.next_scene || '',
    }));

    const normalizedEvidence = (scene.evidence || []).map((evidence) => ({
      evidence_id: evidence.evidence_id || evidence.id || '',
      trigger: evidence.trigger || 'auto',
      name: evidence.name || '',
      description: evidence.description || '',
      image: evidence.image || null,
      category_id: evidence.category_id || null,
      category_title: evidence.category_title || null,
      category_hint: evidence.category_hint || null,
    }));

    const result = {
      id: scene.id || sceneId,
      chapter: scene.chapter === '' || scene.chapter == null ? null : Number.parseInt(scene.chapter, 10),
      title: scene.title || sceneId,
      background: scene.background || null,
      music: scene.music || null,
      effect: scene.effect || null,
      goal_kicker: scene.goal_kicker || null,
      goal_text: scene.goal_text || null,
      next_scene: scene.next_scene || null,
      dialogues: normalizedDialogues,
      choices: normalizedChoices,
      evidence: normalizedEvidence,
      branches: normalizedBranches,
    };

    const budget = scene.priority_budget != null && scene.priority_budget !== ''
      ? Number.parseInt(scene.priority_budget, 10)
      : null;
    if (budget) result.priority_budget = budget;
    if (Object.keys(normalizedPriorityDialogues).length > 0)
      result.priority_dialogues = normalizedPriorityDialogues;
    if (normalizedPriorityAfterDialogues.length > 0)
      result.priority_after_dialogues = normalizedPriorityAfterDialogues;

    return result;
  }

  function buildExportData() {
    const normalizedScenes = {};
    Object.entries(state.data.scenes || {}).forEach(([sceneId, scene]) => {
      normalizedScenes[sceneId] = normalizeScene(sceneId, scene);
    });

    const firstScene = state.data.first_scene && normalizedScenes[state.data.first_scene]
      ? state.data.first_scene
      : Object.keys(normalizedScenes)[0] || null;

    return {
      first_scene: firstScene,
      characters: state.data.characters || {},
      character_emotions: state.data.character_emotions || {},
      questions: state.data.questions || [],
      state_descriptors: state.data.state_descriptors || [],
      scenes: normalizedScenes,
    };
  }

  function applyBatchBackground() {
    const nextBackground = (els.fieldBatchBackground.value || '').trim();
    if (!nextBackground) {
      setStatus('적용할 배경 경로를 입력하세요', true);
      return;
    }

    const targetIds = [...getFilteredSceneIds()];
    if (targetIds.length === 0) {
      setStatus('현재 필터 조건에 맞는 씬이 없습니다', true);
      return;
    }

    pushHistory();
    targetIds.forEach(sceneId => {
      const scene = state.data.scenes[sceneId];
      if (scene) scene.background = nextBackground;
    });
    markDirty();
    render();
    renderPanel();
    setStatus(`✓ ${targetIds.length}개 씬 배경 일괄 변경`);
  }

  function applyBatchStyle() {
    const nextStyle = (els.fieldBatchStyle.value || '').trim();
    if (!nextStyle) {
      setStatus('적용할 스타일을 선택하세요', true);
      return;
    }

    const targetIds = [...getFilteredSceneIds()];
    if (targetIds.length === 0) {
      setStatus('현재 필터 조건에 맞는 씬이 없습니다', true);
      return;
    }

    let changed = 0;
    pushHistory();
    targetIds.forEach(sceneId => {
      const scene = state.data.scenes[sceneId];
      (scene?.dialogues || []).forEach(dialogue => {
        dialogue.style = nextStyle;
        changed += 1;
      });
    });

    if (changed === 0) {
      state.history.pop();
      setStatus('변경할 대사가 없습니다', true);
      return;
    }

    markDirty();
    render();
    renderPanel();
    setStatus(`✓ ${changed}개 대사 스타일 일괄 변경`);
  }

  function replaceFlagKeyEverywhere() {
    const oldKey = (els.fieldBatchFlagOld.value || '').trim();
    const newKey = (els.fieldBatchFlagNew.value || '').trim();
    if (!oldKey || !newKey) {
      setStatus('기존/신규 플래그 키를 모두 입력하세요', true);
      return;
    }

    let changed = 0;
    pushHistory();

    Object.values(state.data.scenes || {}).forEach(scene => {
      (scene.dialogues || []).forEach(dialogue => {
        if (dialogue.condition?.flag_key === oldKey) {
          dialogue.condition.flag_key = newKey;
          changed += 1;
        }
      });
      (scene.branches || []).forEach(branch => {
        if (branch.flag_key === oldKey) {
          branch.flag_key = newKey;
          changed += 1;
        }
      });
      (scene.choices || []).forEach(choice => {
        if (choice.flag_key === oldKey) {
          choice.flag_key = newKey;
          changed += 1;
        }
      });
    });

    if (changed === 0) {
      state.history.pop();
      setStatus('치환된 플래그 키가 없습니다', true);
      return;
    }

    markDirty();
    render();
    renderPanel();
    setStatus(`✓ 플래그 키 ${changed}건 치환 완료`);
  }

  function replaceStringValue(source, from, to) {
    if (typeof source !== 'string' || source.length === 0) return { value: source, changed: 0 };
    let count = 0;
    const replaced = source.replaceAll(from, () => {
      count += 1;
      return to;
    });
    return { value: replaced, changed: count };
  }

  function replaceTextEverywhere() {
    const oldText = els.fieldBatchTextOld.value || '';
    const newText = els.fieldBatchTextNew.value || '';
    if (!oldText) {
      setStatus('기존 문자열을 입력하세요', true);
      return;
    }

    let changed = 0;
    pushHistory();

    Object.values(state.data.scenes || {}).forEach(scene => {
      ['title', 'background', 'music', 'effect'].forEach(field => {
        const result = replaceStringValue(scene[field], oldText, newText);
        scene[field] = result.value;
        changed += result.changed;
      });

      (scene.dialogues || []).forEach(dialogue => {
        ['speaker', 'text', 'portrait'].forEach(field => {
          const result = replaceStringValue(dialogue[field], oldText, newText);
          dialogue[field] = result.value;
          changed += result.changed;
        });
        if (dialogue.condition?.flag_value != null) {
          const result = replaceStringValue(dialogue.condition.flag_value, oldText, newText);
          dialogue.condition.flag_value = result.value;
          changed += result.changed;
        }
      });

      (scene.choices || []).forEach(choice => {
        ['text', 'flag_value'].forEach(field => {
          const result = replaceStringValue(choice[field], oldText, newText);
          choice[field] = result.value;
          changed += result.changed;
        });
      });

      (scene.branches || []).forEach(branch => {
        ['flag_value'].forEach(field => {
          const result = replaceStringValue(branch[field], oldText, newText);
          branch[field] = result.value;
          changed += result.changed;
        });
      });

      (scene.evidence || []).forEach(evidence => {
        ['name', 'description', 'image'].forEach(field => {
          const result = replaceStringValue(evidence[field], oldText, newText);
          evidence[field] = result.value;
          changed += result.changed;
        });
      });
    });

    if (changed === 0) {
      state.history.pop();
      setStatus('치환된 문자열이 없습니다', true);
      return;
    }

    markDirty();
    render();
    renderPanel();
    setStatus(`✓ 문자열 ${changed}건 치환 완료`);
  }

  function sortScenesByChapter() {
    const scenes = state.data.scenes || {};
    const sceneEntries = Object.entries(scenes);
    if (sceneEntries.length === 0) {
      setStatus('정렬할 씬이 없습니다', true);
      return;
    }

    pushHistory();

    sceneEntries.sort((a, b) => {
      const sceneA = a[1] || {};
      const sceneB = b[1] || {};
      const chapterA = sceneA.chapter == null ? Number.MAX_SAFE_INTEGER : Number(sceneA.chapter);
      const chapterB = sceneB.chapter == null ? Number.MAX_SAFE_INTEGER : Number(sceneB.chapter);
      if (chapterA !== chapterB) return chapterA - chapterB;
      const titleCompare = String(sceneA.title || a[0]).localeCompare(String(sceneB.title || b[0]), 'ko');
      if (titleCompare !== 0) return titleCompare;
      return a[0].localeCompare(b[0], 'ko');
    });

    state.data.scenes = Object.fromEntries(sceneEntries);
    state.layout = {};
    autoLayout();
    saveLayout();
    markDirty();
    render();
    renderPanel();
    setStatus('✓ 챕터 기준 정렬 보조 적용 완료');
  }

  function duplicateScene(id) {
    const scene = state.data.scenes[id];
    if (!scene) return;

    pushHistory();

    let nextId = `${id}_copy`;
    let suffix = 2;
    while (state.data.scenes[nextId]) {
      nextId = `${id}_copy_${suffix++}`;
    }

    const copied = JSON.parse(JSON.stringify(scene));
    copied.id = nextId;
    copied.title = copied.title ? `${copied.title} 복사본` : nextId;
    state.data.scenes[nextId] = copied;

    const pos = state.layout[id] || { x: 40, y: 40 };
    state.layout[nextId] = { x: pos.x + 48, y: pos.y + 48 };
    state.selectedId = nextId;
    state.selectedIds = new Set([nextId]);
    state.previewDialogueIndex = 0;
    saveLayout();
    markDirty();
    render();
    renderPanel();
    setStatus(`✓ 씬 복제: ${nextId}`);
  }

  function collectValidation() {
    const scenes = state.data.scenes || {};
    const firstScene = state.data.first_scene;
    const findings = [];
    const reachable = new Set();
    const stack = [];
    const evidenceOwners = new Map();
    const labelOwners = new Map();
    const sceneIdOwners = new Map();

    if (firstScene && scenes[firstScene]) {
      stack.push(firstScene);
      while (stack.length) {
        const id = stack.pop();
        if (reachable.has(id) || !scenes[id]) continue;
        reachable.add(id);
        const scene = scenes[id];
        if (scene.next_scene && scenes[scene.next_scene]) stack.push(scene.next_scene);
        (scene.branches || []).forEach(branch => {
          if (branch.next_scene && scenes[branch.next_scene]) stack.push(branch.next_scene);
        });
        (scene.choices || []).forEach(choice => {
          if (choice.next_scene && scenes[choice.next_scene]) stack.push(choice.next_scene);
        });
      }
    }

    Object.entries(scenes).forEach(([sceneKey, scene]) => {
      const declaredId = scene.id || sceneKey;
      const dialogueLabels = new Set(
        (scene.dialogues || [])
          .map(dialogue => dialogue.label)
          .filter(Boolean)
      );
      if (!sceneIdOwners.has(declaredId)) sceneIdOwners.set(declaredId, []);
      sceneIdOwners.get(declaredId).push(sceneKey);

      if (scene.next_scene && !scenes[scene.next_scene]) {
        findings.push({
          type: 'error',
          sceneId: sceneKey,
          title: '기본 다음 씬 누락',
          body: `${sceneKey}의 next_scene이 "${scene.next_scene}"를 가리키지만 해당 씬이 없습니다.`,
        });
      }

      (scene.choices || []).forEach((choice, index) => {
        if (choice.next_scene && !scenes[choice.next_scene]) {
          findings.push({
            type: 'error',
            sceneId: sceneKey,
            title: '선택지 연결 누락',
            body: `${sceneKey}의 선택지 ${index + 1}이 "${choice.next_scene}"를 가리키지만 해당 씬이 없습니다.`,
          });
        }
        if (choice.next_dialogue && !dialogueLabels.has(choice.next_dialogue)) {
          findings.push({
            type: 'error',
            sceneId: sceneKey,
            title: '선택지 대사 점프 누락',
            body: `${sceneKey}의 선택지 ${index + 1}이 "${choice.next_dialogue}" 라벨로 점프하지만 해당 라벨이 이 씬에 없습니다.`,
          });
        }
      });

      (scene.branches || []).forEach((branch, index) => {
        if (branch.next_scene && !scenes[branch.next_scene]) {
          findings.push({
            type: 'error',
            sceneId: sceneKey,
            title: '분기 연결 누락',
            body: `${sceneKey}의 분기 ${index + 1}이 "${branch.next_scene}"를 가리키지만 해당 씬이 없습니다.`,
          });
        }
      });

      (scene.evidence || []).forEach((evidence, index) => {
        const evidenceId = evidence.evidence_id || evidence.id;
        if (!evidenceId) return;
        if (!evidenceOwners.has(evidenceId)) evidenceOwners.set(evidenceId, []);
        evidenceOwners.get(evidenceId).push(`${sceneKey}#${index + 1}`);
      });

      (scene.dialogues || []).forEach((dialogue, index) => {
        if (!dialogue.label) return;
        if (!labelOwners.has(dialogue.label)) labelOwners.set(dialogue.label, []);
        labelOwners.get(dialogue.label).push(`${sceneKey}#${index + 1}`);
      });
    });

    sceneIdOwners.forEach((owners, id) => {
      if (owners.length > 1) {
        findings.push({
          type: 'error',
          sceneId: owners[0],
          title: '중복 SceneID',
          body: `"${id}"가 ${owners.join(', ')}에 중복 선언되어 있습니다.`,
        });
      }
    });

    evidenceOwners.forEach((owners, id) => {
      if (owners.length > 1) {
        findings.push({
          type: 'error',
          title: '중복 EvidenceID',
          body: `"${id}"가 ${owners.join(', ')}에서 중복 사용되고 있습니다.`,
        });
      }
    });

    labelOwners.forEach((owners, label) => {
      if (owners.length > 1) {
        findings.push({
          type: 'warn',
          title: '중복 Label',
          body: `"${label}"가 ${owners.join(', ')}에서 중복 사용되고 있습니다.`,
        });
      }
    });

    Object.keys(scenes).forEach(sceneId => {
      if (sceneId !== firstScene && !reachable.has(sceneId)) {
        findings.push({
          type: 'warn',
          sceneId,
          title: '미참조 씬',
          body: `${sceneId}는 first_scene에서 도달할 수 없습니다.`,
        });
      }
    });

    if (firstScene && !scenes[firstScene]) {
      findings.push({
        type: 'error',
        title: 'first_scene 누락',
        body: `first_scene이 "${firstScene}"로 지정되어 있지만 실제 씬 데이터에 없습니다.`,
      });
    }

    return findings;
  }

  function renderValidationPanel() {
    const findings = collectValidation();
    const scoped = state.selectedId
      ? findings.filter(item => !item.sceneId || item.sceneId === state.selectedId)
      : findings;

    const errorCount = findings.filter(item => item.type === 'error').length;
    const warnCount = findings.filter(item => item.type === 'warn').length;
    els.validationSummary.textContent =
      findings.length === 0
        ? '현재 구조 검수 기준으로 확인된 문제는 없습니다.'
        : `전체 ${findings.length}건 검사 결과: 오류 ${errorCount}건, 경고 ${warnCount}건`;

    els.validationList.innerHTML = '';

    if (scoped.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'validation-item';
      empty.innerHTML = '<strong>현재 씬 기준 문제 없음</strong>선택된 씬과 직접 관련된 오류나 경고가 없습니다.';
      els.validationList.appendChild(empty);
      return;
    }

    scoped.forEach(item => {
      const box = document.createElement('div');
      box.className = `validation-item ${item.type}`;
      box.innerHTML = `<strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.body)}`;
      els.validationList.appendChild(box);
    });
  }

  function renderAnalysisPanel() {
    const sceneId = state.selectedId;
    if (!sceneId || !state.data.scenes[sceneId]) {
      els.analysisSummary.textContent = '';
      return;
    }

    const scene = state.data.scenes[sceneId];
    const incoming = [];
    Object.entries(state.data.scenes || {}).forEach(([otherId, otherScene]) => {
      if (otherId === sceneId) return;
      if (otherScene.next_scene === sceneId) incoming.push(`${otherId} (기본)`);
      (otherScene.branches || []).forEach((branch, index) => {
        if (branch.next_scene === sceneId) incoming.push(`${otherId} (분기 ${index + 1})`);
      });
      (otherScene.choices || []).forEach((choice, index) => {
        if (choice.next_scene === sceneId) incoming.push(`${otherId} (선택지 ${index + 1})`);
      });
    });

    const readsFlags = new Set();
    (scene.dialogues || []).forEach(dialogue => {
      if (dialogue.condition?.flag_key) readsFlags.add(dialogue.condition.flag_key);
    });
    (scene.branches || []).forEach(branch => {
      if (branch.flag_key) readsFlags.add(branch.flag_key);
    });

    const writesFlags = new Set();
    (scene.choices || []).forEach(choice => {
      if (choice.flag_key) writesFlags.add(choice.flag_key);
    });

    const nextTargets = [];
    if (scene.next_scene) nextTargets.push(`기본: ${scene.next_scene}`);
    (scene.branches || []).forEach((branch, index) => {
      if (branch.next_scene) nextTargets.push(`분기 ${index + 1}: ${branch.next_scene}`);
    });
    (scene.choices || []).forEach((choice, index) => {
      if (choice.next_scene) nextTargets.push(`선택지 ${index + 1}: ${choice.next_scene}`);
    });

    const reachable = collectReachableScenes();
    const lines = [
      `엔딩 씬: ${isEndingScene(scene) ? '예' : '아니오'}`,
      `도달 가능: ${reachable.has(sceneId) || sceneId === state.data.first_scene ? '예' : '아니오'}`,
      `이전 연결: ${incoming.length ? incoming.join(', ') : '없음'}`,
      `다음 연결: ${nextTargets.length ? nextTargets.join(', ') : '없음'}`,
      `읽는 플래그: ${readsFlags.size ? [...readsFlags].join(', ') : '없음'}`,
      `쓰는 플래그: ${writesFlags.size ? [...writesFlags].join(', ') : '없음'}`,
    ];

    els.analysisSummary.innerHTML = lines.map(line => `<div>${escapeHtml(line)}</div>`).join('');
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

  function connect(fromId, pinType, idx, toId) {
    if (fromId === toId) return;
    const scene = state.data.scenes[fromId];
    pushHistory();
    if (!scene) return;
    if (pinType === 'out') {
      scene.next_scene = toId;
    } else if (pinType === 'branch') {
      if (scene.branches?.[idx] !== undefined) scene.branches[idx].next_scene = toId;
    } else if (pinType === 'choice') {
      if (scene.choices?.[idx] !== undefined) scene.choices[idx].next_scene = toId;
    }
    saveLayout();
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
      if (!state.data.characters) state.data.characters = {};
      if (!state.data.character_emotions) state.data.character_emotions = {};
      if (!Array.isArray(state.data.questions)) state.data.questions = [];
      if (!Array.isArray(state.data.state_descriptors)) state.data.state_descriptors = [];
      if (!state.data.scenes) state.data.scenes = {};
      state.layout = {};
      state.history = [];
      state.future = [];
      state.dirty = false;
      state.selectedIds = new Set();
      state.filters = { query: '', chapter: '' };
      els.fieldSearch.value = '';
      autoLayout();
      loadLayout();
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
    const payload = buildExportData();
    state.data = payload;
    const json = JSON.stringify(payload, null, 2);
    const content = `window.GAME_DATA = ${json};\n`;
    const blob = new Blob([content], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'game_data.js';
    a.click();
    URL.revokeObjectURL(a.href);
    state.dirty = false;
    setStatus('✓ 내보내기 완료');
    render();
    renderPanel();
  }

  // ── 씬 추가 ───────────────────────────────────────────
  function addScene() {
    pushHistory();
    const id = uid();
    state.data.scenes[id] = newScene(id);
    const vr = els.viewport.getBoundingClientRect();
    const center = toCanvas(vr.left + vr.width / 2, vr.top + vr.height / 2);
    state.layout[id] = { x: center.x - NODE_W / 2, y: center.y - 40 };
    saveLayout();
    selectScene(id);
    markDirty();
    render();
  }

  // ── 씬 삭제 ───────────────────────────────────────────
  function deleteScene(id) {
    if (!state.data.scenes[id]) return;
    pushHistory();
    delete state.data.scenes[id];
    delete state.layout[id];
    // 참조 정리
    Object.values(state.data.scenes).forEach(scene => {
      if (scene.next_scene === id) scene.next_scene = null;
      (scene.branches || []).forEach(b => { if (b.next_scene === id) b.next_scene = ''; });
      (scene.choices  || []).forEach(c => { if (c.next_scene === id) c.next_scene = ''; });
    });
    state.selectedIds.delete(id);
    ensurePrimarySelection();
    saveLayout();
    markDirty();
    render();
    renderPanel();
  }

  function deleteSelectedScenes() {
    const selected = getSelectedSceneIds();
    if (selected.length === 0) return;
    pushHistory();
    selected.forEach(id => {
      if (!state.data.scenes[id]) return;
      delete state.data.scenes[id];
      delete state.layout[id];
    });
    Object.values(state.data.scenes).forEach(scene => {
      if (selected.includes(scene.next_scene)) scene.next_scene = null;
      (scene.branches || []).forEach(b => { if (selected.includes(b.next_scene)) b.next_scene = ''; });
      (scene.choices || []).forEach(c => { if (selected.includes(c.next_scene)) c.next_scene = ''; });
    });
    clearSelection();
    saveLayout();
    markDirty();
    render();
    renderPanel();
    setStatus(`✓ 씬 ${selected.length}개 삭제`);
  }

  // ── 이벤트 바인딩 ─────────────────────────────────────
  function bindEvents() {
    // 툴바
    $('btn-add-node').addEventListener('click', addScene);
    $('btn-undo').addEventListener('click', undo);
    $('btn-redo').addEventListener('click', redo);
    $('btn-load').addEventListener('click', loadData);
    $('btn-export').addEventListener('click', exportData);
    els.fieldSearch.addEventListener('input', () => {
      state.filters.query = els.fieldSearch.value;
      render();
    });
    els.fieldFilterChapter.addEventListener('change', () => {
      state.filters.chapter = els.fieldFilterChapter.value;
      render();
    });
    els.btnAutoLayout.addEventListener('click', resetAutoLayout);
    els.btnZoomOut.addEventListener('click', () => setZoom(state.camera.scale * 0.9));
    els.btnZoomIn.addEventListener('click', () => setZoom(state.camera.scale * 1.1));
    els.btnApplyBatchBackground.addEventListener('click', applyBatchBackground);
    els.btnApplyBatchStyle.addEventListener('click', applyBatchStyle);
    els.btnApplyBatchFlag.addEventListener('click', replaceFlagKeyEverywhere);
    els.btnApplyBatchText.addEventListener('click', replaceTextEverywhere);
    els.btnSortScenes.addEventListener('click', sortScenesByChapter);
    if (els.tabNodeEditor) els.tabNodeEditor.addEventListener('click', () => setPanelTab('node'));
    if (els.tabCharacterEditor) els.tabCharacterEditor.addEventListener('click', () => setPanelTab('character'));
    $('btn-duplicate-scene').addEventListener('click', () => {
      if (state.selectedId) duplicateScene(state.selectedId);
    });
    $('btn-delete-scene').addEventListener('click', () => {
      const selected = getSelectedSceneIds();
      if (selected.length > 1) deleteSelectedScenes();
      else if (state.selectedId) deleteScene(state.selectedId);
    });
    $('btn-add-dialogue').addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      pushHistory();
      if (!scene.dialogues) scene.dialogues = [];
      scene.dialogues.push(newDialogue());
      state.previewDialogueIndex = scene.dialogues.length - 1;
      afterChange();
    });
    $('btn-add-choice').addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      pushHistory();
      if (!scene.choices) scene.choices = [];
      scene.choices.push(newChoice());
      afterChange();
    });
    $('btn-add-branch').addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      pushHistory();
      if (!scene.branches) scene.branches = [];
      scene.branches.push(newBranch());
      afterChange();
    });
    $('btn-add-evidence').addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      pushHistory();
      if (!scene.evidence) scene.evidence = [];
      scene.evidence.push(newEvidence());
      afterChange();
    });
    $('btn-add-character').addEventListener('click', () => {
      pushHistory();
      const row = newCharacter();
      let suffix = Object.keys(state.data.characters || {}).length + 1;
      do {
        row.CharacterID = `Character${suffix++}`;
      } while (state.data.characters?.[row.CharacterID]);
      if (!state.data.characters) state.data.characters = {};
      state.data.characters[row.CharacterID] = {
        id: row.CharacterID,
        display_name: row.DisplayName,
        default_emotion_type: row.DefaultEmotionType,
        default_image_path: row.DefaultImagePath,
      };
      afterChange();
    });
    $('btn-add-character-emotion').addEventListener('click', () => {
      pushHistory();
      const row = newCharacterEmotion();
      row.CharacterID = Object.keys(state.data.characters || {})[0] || 'Character1';
      if (!state.data.character_emotions) state.data.character_emotions = {};
      if (!state.data.character_emotions[row.CharacterID]) state.data.character_emotions[row.CharacterID] = {};
      let emotionType = row.EmotionType;
      let suffix = 2;
      while (state.data.character_emotions[row.CharacterID][emotionType] != null) {
        emotionType = `Neutral${suffix++}`;
      }
      state.data.character_emotions[row.CharacterID][emotionType] = row.ImagePath;
      afterChange();
    });
    $('btn-add-question').addEventListener('click', () => {
      pushHistory();
      state.data.questions = state.data.questions || [];
      const row = newQuestion();
      let suffix = state.data.questions.length + 1;
      do {
        row.question_id = `Question${suffix++}`;
      } while (state.data.questions.some(question => question.question_id === row.question_id));
      state.data.questions.push(row);
      afterChange();
    });
    $('btn-add-state-descriptor').addEventListener('click', () => {
      pushHistory();
      state.data.state_descriptors = state.data.state_descriptors || [];
      const row = newStateDescriptor();
      let suffix = state.data.state_descriptors.length + 1;
      do {
        row.descriptor_id = `Descriptor${suffix++}`;
      } while (state.data.state_descriptors.some(descriptor => descriptor.descriptor_id === row.descriptor_id));
      state.data.state_descriptors.push(row);
      afterChange();
    });

    // 패널 필드
    els.fieldTitle.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.title = els.fieldTitle.value;
      markDirty();
      refreshMetaViews({ rerenderValidation: true });
    });
    els.fieldBg.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.background = els.fieldBg.value;
      markDirty();
      renderDialoguePreview(scene);
      refreshMetaViews();
    });
    els.fieldChapter.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.chapter = els.fieldChapter.value === '' ? null : Number.parseInt(els.fieldChapter.value, 10);
      markDirty();
      refreshMetaViews({ rerenderValidation: true });
    });
    els.fieldMusic.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.music = els.fieldMusic.value || null;
      markDirty();
      refreshMetaViews();
    });
    els.fieldEffect.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.effect = els.fieldEffect.value || null;
      markDirty();
      refreshMetaViews();
    });
    els.fieldGoalKicker.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.goal_kicker = els.fieldGoalKicker.value || null;
      markDirty();
      refreshMetaViews();
    });
    els.fieldGoalText.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      scene.goal_text = els.fieldGoalText.value || null;
      markDirty();
      refreshMetaViews();
    });

    els.fieldPriorityBudget.addEventListener('input', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      const v = els.fieldPriorityBudget.value;
      scene.priority_budget = v === '' ? null : Number.parseInt(v, 10);
      markDirty();
    });

    els.priorityAfterList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      const card = btn.closest('.card');
      const idx = card ? Number(card.dataset.index) : -1;
      const action = btn.dataset.action;
      pushHistory();
      if (action === 'add-priority-after') {
        scene.priority_after_dialogues = scene.priority_after_dialogues || [];
        scene.priority_after_dialogues.push({ order: scene.priority_after_dialogues.length + 1, speaker: '', text: '', style: 'narration', portrait: null });
      } else if (action === 'del' && idx >= 0) {
        scene.priority_after_dialogues.splice(idx, 1);
      }
      afterChange();
    });

    document.getElementById('btn-add-priority-after').addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene) return;
      pushHistory();
      scene.priority_after_dialogues = scene.priority_after_dialogues || [];
      scene.priority_after_dialogues.push({ order: scene.priority_after_dialogues.length + 1, speaker: '', text: '', style: 'narration', portrait: null });
      afterChange();
    });

    if (els.btnApplyPriorityDialogues) {
      const replacement = els.btnApplyPriorityDialogues.cloneNode(true);
      els.btnApplyPriorityDialogues.replaceWith(replacement);
      els.btnApplyPriorityDialogues = replacement;
      els.btnApplyPriorityDialogues.addEventListener('click', () => {
        const scene = state.data.scenes[state.selectedId];
        if (!scene) return;
        const raw = els.fieldPriorityDialogues.value.trim();
        if (!raw) {
          scene.priority_dialogues = null;
          markDirty();
          renderPanel();
          return;
        }
        try {
          scene.priority_dialogues = JSON.parse(raw);
          markDirty();
          renderPanel();
          setStatus('priority_dialogues applied');
        } catch (e) {
          setStatus('Priority dialogue JSON parse error: ' + e.message, true);
        }
      });
    }

    if (els.btnAddPriorityGroup) {
      els.btnAddPriorityGroup.addEventListener('click', () => {
        const scene = state.data.scenes[state.selectedId];
        if (!scene) return;
        pushHistory();
        scene.priority_dialogues = scene.priority_dialogues || {};
        const nextKey = getNextPriorityGroupKey(scene);
        scene.priority_dialogues[nextKey] = [createPriorityDialogueLine()];
        afterChange();
      });
    }

    els.fieldTitle.addEventListener('focus', pushHistory);
    els.fieldBg.addEventListener('focus', pushHistory);
    els.fieldChapter.addEventListener('focus', pushHistory);
    els.fieldMusic.addEventListener('focus', pushHistory);
    els.fieldEffect.addEventListener('focus', pushHistory);
    els.fieldGoalKicker.addEventListener('focus', pushHistory);
    els.fieldGoalText.addEventListener('focus', pushHistory);
    els.fieldPriorityBudget.addEventListener('focus', pushHistory);
    els.fieldSceneId.addEventListener('focus', pushHistory);

    els.btnPreviewPrev.addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      if (!scene?.dialogues?.length) return;
      state.previewDialogueIndex = Math.max(0, state.previewDialogueIndex - 1);
      renderDialoguePreview(scene);
    });

    els.btnPreviewNext.addEventListener('click', () => {
      const scene = state.data.scenes[state.selectedId];
      const total = scene?.dialogues?.length || 0;
      if (total === 0) return;
      state.previewDialogueIndex = Math.min(total - 1, state.previewDialogueIndex + 1);
      renderDialoguePreview(scene);
    });

    els.fieldSceneId.addEventListener('blur', () => {
      if (state.selectedId) renameScene(state.selectedId, els.fieldSceneId.value);
    });
    els.fieldSceneId.addEventListener('keydown', e => {
      if (e.key === 'Enter') els.fieldSceneId.blur();
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

    // 빈 공간 드래그: 기본은 다중 선택, Alt+드래그는 패닝
    els.viewport.addEventListener('mousedown', e => {
      if (e.button !== 0 && e.button !== 2) return;
      const clickedPin = e.target.closest('.pin-in, .pin-out, .pin-branch, .pin-choice');
      const clickedNode = e.target.closest('.node');
      const clickedWorkspace = e.target === els.viewport || e.target === els.canvas ||
        e.target === els.nodeLayer || e.target === els.wireLayer || !!e.target.closest('svg');
      if (e.button === 2 && clickedPin) return;
      if (e.button === 0 && !clickedWorkspace) return;
      if (e.button === 2 && !clickedWorkspace && !clickedNode) return;
      e.preventDefault();
      if (e.button === 2) {
        state.panning = { startX: e.clientX, startY: e.clientY,
                          camX: state.camera.x, camY: state.camera.y };
        return;
      }
      const start = toCanvas(e.clientX, e.clientY);
      state.marquee = {
        startX: start.x,
        startY: start.y,
        currentX: start.x,
        currentY: start.y,
        additive: e.ctrlKey || e.metaKey,
      };
      updateMarqueeVisual();
    });

    // 노드 드래그 / 와이어 드래그 / 패닝 mousemove
    document.addEventListener('mousemove', e => {
      if (state.panning) {
        state.camera.x = state.panning.camX + (e.clientX - state.panning.startX);
        state.camera.y = state.panning.camY + (e.clientY - state.panning.startY);
        applyCamera();
      }
      if (state.dragging) {
        const { startMouseX, startMouseY, startPositions } = state.dragging;
        const dx = (e.clientX - startMouseX) / state.camera.scale;
        const dy = (e.clientY - startMouseY) / state.camera.scale;
        if (!state.dragging.historyCaptured && (Math.abs(dx) > 0 || Math.abs(dy) > 0)) {
          pushHistory();
          state.dragging.historyCaptured = true;
        }
        Object.entries(startPositions).forEach(([sceneId, startPos]) => {
          state.layout[sceneId] = { x: startPos.x + dx, y: startPos.y + dy };
          const el = els.nodeLayer.querySelector(`[data-id="${sceneId}"]`);
          if (el) {
            el.style.left = state.layout[sceneId].x + 'px';
            el.style.top  = state.layout[sceneId].y + 'px';
          }
        });
        state.dragging.moved = true;
        renderWires();
      }
      if (state.marquee) {
        const current = toCanvas(e.clientX, e.clientY);
        state.marquee.currentX = current.x;
        state.marquee.currentY = current.y;
        updateMarqueeVisual();
      }
    });

    document.addEventListener('mouseup', () => {
      if (state.dragging?.moved) saveLayout();
      if (state.marquee) {
        const rect = {
          left: Math.min(state.marquee.startX, state.marquee.currentX),
          top: Math.min(state.marquee.startY, state.marquee.currentY),
          right: Math.max(state.marquee.startX, state.marquee.currentX),
          bottom: Math.max(state.marquee.startY, state.marquee.currentY),
        };
        const width = rect.right - rect.left;
        const height = rect.bottom - rect.top;
        if (width > 4 || height > 4) {
          selectScenesInRect(rect, state.marquee.additive);
          state.suppressViewportClick = true;
        }
      }
      state.panning  = null;
      state.dragging = null;
      state.marquee = null;
      updateMarqueeVisual();
    });

    // 핀 클릭 → 와이어 드래그
    els.nodeLayer.addEventListener('mousedown', e => {
      const pin = e.target.closest('.pin-out, .pin-branch, .pin-choice');
      if (!pin) return;
      e.stopPropagation();
      e.preventDefault();
      const fromId = pin.dataset.id;
      if (pin.classList.contains('pin-out')) {
        startWireDrag(fromId, 'out', null, e.clientX, e.clientY);
      } else if (pin.classList.contains('pin-branch')) {
        startWireDrag(fromId, 'branch', parseInt(pin.dataset.branch, 10), e.clientX, e.clientY);
      } else if (pin.classList.contains('pin-choice')) {
        startWireDrag(fromId, 'choice', parseInt(pin.dataset.choice, 10), e.clientX, e.clientY);
      }
    });

    // 핀 우클릭 → 와이어 삭제
    els.nodeLayer.addEventListener('contextmenu', e => {
      e.preventDefault();
      const pin = e.target.closest('.pin-out, .pin-branch, .pin-choice');
      if (!pin) return;
      const id = pin.dataset.id;
      const scene = state.data.scenes[id];
      if (!scene) return;
      if (pin.classList.contains('pin-out')) {
        pushHistory();
        scene.next_scene = null;
      } else if (pin.classList.contains('pin-branch')) {
        pushHistory();
        const b = scene.branches?.[+pin.dataset.branch];
        if (b) b.next_scene = '';
      } else if (pin.classList.contains('pin-choice')) {
        pushHistory();
        const c = scene.choices?.[+pin.dataset.choice];
        if (c) c.next_scene = '';
      }
      markDirty(); render();
      if (state.selectedId === id) renderPanel();
    });

    // viewport 클릭 시 선택 해제
    els.viewport.addEventListener('contextmenu', e => {
      if (!e.target.closest('.pin-in, .pin-out, .pin-branch, .pin-choice')) {
        e.preventDefault();
      }
    });

    els.viewport.addEventListener('click', e => {
      if (state.suppressViewportClick) {
        state.suppressViewportClick = false;
        return;
      }
      if (e.target === els.viewport || e.target === els.canvas || e.target === els.nodeLayer) {
        clearSelection();
        renderNodes();
        renderPanel();
        renderMinimap();
      }
    });

    // 단축키
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.key === 's') { e.preventDefault(); exportData(); return; }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); return; }
      const selected = getSelectedSceneIds();
      if (e.key === 'Delete' && !isTyping() && selected.length) {
        if (selected.length > 1) deleteSelectedScenes();
        else deleteScene(state.selectedId);
        return;
      }
      if (e.key === 'Escape') {
        clearSelection();
        renderNodes();
        renderPanel();
        renderMinimap();
      }
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
