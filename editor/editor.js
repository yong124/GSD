(function () {
  const STORAGE_KEY = 'adv_editor_autosave_v1';

  const state = {
    projectName: 'current game data',
    data: null,
    assetCatalog: new Set(),
    selectedSceneId: null,
    sceneSearch: '',
    dirty: false,
    previewIndex: 0,
  };

  const els = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindElements();
    bindEvents();
    hydrateInitialState();
    render();
  }

  function bindElements() {
    const ids = [
      'project-name', 'dirty-indicator', 'scene-search', 'scene-list',
      'add-scene-btn', 'duplicate-scene-btn', 'delete-scene-btn',
      'empty-state', 'editor-content',
      'scene-id', 'scene-chapter', 'scene-title', 'scene-effect',
      'scene-background', 'scene-music', 'scene-next',
      'background-thumb',
      'add-dialogue-btn', 'dialogue-list',
      'add-choice-btn', 'choice-list',
      'add-evidence-btn', 'evidence-list',
      'add-branch-btn', 'branch-list',
      'preview-background', 'preview-speaker', 'preview-text', 'preview-choices',
      'preview-prev-btn', 'preview-next-btn', 'preview-nav-label',
      'validation-count', 'validation-list', 'quick-picks',
      'flag-panel',
      'new-project-btn', 'load-default-btn', 'save-json-btn', 'open-json-btn',
      'open-json-input', 'export-btn',
      'scene-options', 'background-options', 'music-options',
      'portrait-options', 'evidence-image-options'
    ];

    ids.forEach(id => {
      els[id] = document.getElementById(id);
    });
  }

  function bindEvents() {
    els['scene-search'].addEventListener('input', e => {
      state.sceneSearch = e.target.value.trim().toLowerCase();
      renderSceneList();
    });

    els['new-project-btn'].addEventListener('click', handleNewProject);
    els['load-default-btn'].addEventListener('click', loadDefaultProject);
    els['save-json-btn'].addEventListener('click', saveJsonFile);
    els['open-json-btn'].addEventListener('click', () => els['open-json-input'].click());
    els['open-json-input'].addEventListener('change', handleOpenJson);
    els['export-btn'].addEventListener('click', exportGameData);

    els['add-scene-btn'].addEventListener('click', addScene);
    els['duplicate-scene-btn'].addEventListener('click', duplicateScene);
    els['delete-scene-btn'].addEventListener('click', deleteScene);
    els['add-dialogue-btn'].addEventListener('click', addDialogue);
    els['add-choice-btn'].addEventListener('click', addChoice);
    els['add-evidence-btn'].addEventListener('click', addEvidence);
    els['add-branch-btn'].addEventListener('click', addBranch);

    els['preview-prev-btn'].addEventListener('click', () => {
      state.previewIndex = Math.max(0, state.previewIndex - 1);
      renderPreview();
    });
    els['preview-next-btn'].addEventListener('click', () => {
      const scene = selectedScene();
      if (!scene) return;
      state.previewIndex = Math.min(scene.dialogues.length - 1, state.previewIndex + 1);
      renderPreview();
    });

    const sceneMetaBindings = [
      ['scene-id', value => updateSceneId(value)],
      ['scene-chapter', value => setSceneField('chapter', value === '' ? null : Number(value))],
      ['scene-title', value => setSceneField('title', value)],
      ['scene-effect', value => setSceneField('effect', value || null)],
      ['scene-background', value => setSceneField('background', value || null)],
      ['scene-music', value => setSceneField('music', value || null)],
      ['scene-next', value => setSceneField('next_scene', value || null)],
    ];

    sceneMetaBindings.forEach(([id, handler]) => {
      els[id].addEventListener('input', e => handler(e.target.value));
    });

    window.addEventListener('beforeunload', e => {
      if (!state.dirty) return;
      e.preventDefault();
      e.returnValue = '';
    });

    window.addEventListener('keydown', handleKeydown);
  }

  function hydrateInitialState() {
    const autosave = loadAutosave();
    if (autosave) {
      state.projectName = autosave.projectName || 'autosaved project';
      state.data = autosave.data;
      state.assetCatalog = buildAssetCatalog(window.GAME_DATA || autosave.data || createEmptyProject());
      state.selectedSceneId = autosave.selectedSceneId || autosave.data.first_scene || firstSceneId(autosave.data);
      state.dirty = false;
      return;
    }

    loadDefaultProject();
  }

  function loadDefaultProject() {
    state.projectName = 'current game data';
    const source = window.GAME_DATA || createEmptyProject();
    state.data = cloneData(source);
    state.assetCatalog = buildAssetCatalog(source);
    state.selectedSceneId = state.data.first_scene || firstSceneId(state.data);
    state.dirty = false;
    saveAutosave();
    render();
  }

  function handleNewProject() {
    if (!confirm('Create a new empty project? Unsaved changes will be replaced.')) return;
    state.projectName = 'untitled project';
    state.data = createEmptyProject();
    state.assetCatalog = buildAssetCatalog(window.GAME_DATA || createEmptyProject());
    state.selectedSceneId = null;
    state.dirty = false;
    saveAutosave();
    render();
  }

  function createEmptyProject() {
    return {
      first_scene: null,
      scenes: {},
    };
  }

  function cloneData(data) {
    return JSON.parse(JSON.stringify(data || createEmptyProject()));
  }

  function selectedScene() {
    return state.selectedSceneId ? state.data.scenes[state.selectedSceneId] : null;
  }

  function markDirty() {
    state.dirty = true;
    saveAutosave();
    renderStatus();
    renderValidation();
  }

  function saveAutosave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      projectName: state.projectName,
      data: state.data,
      selectedSceneId: state.selectedSceneId,
    }));
  }

  function loadAutosave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Failed to load autosave', e);
      return null;
    }
  }

  function render() {
    renderStatus();
    renderSceneList();
    renderEditor();
    renderPreview();
    renderValidation();
    renderFlagPanel();
    renderQuickPicks();
    renderDatalists();
  }

  function renderStatus() {
    els['project-name'].textContent = `Project: ${state.projectName}`;
    els['dirty-indicator'].textContent = state.dirty ? 'Unsaved changes' : 'Saved';
  }

  function renderSceneList() {
    const scenes = Object.values(state.data.scenes);
    const filtered = scenes
      .sort((a, b) => {
        const chapterDiff = (a.chapter || 0) - (b.chapter || 0);
        return chapterDiff || a.id.localeCompare(b.id);
      })
      .filter(scene => {
        if (!state.sceneSearch) return true;
        const haystack = `${scene.id} ${scene.title || ''}`.toLowerCase();
        return haystack.includes(state.sceneSearch);
      });

    els['scene-list'].innerHTML = '';
    filtered.forEach(scene => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `scene-item${scene.id === state.selectedSceneId ? ' active' : ''}`;
      item.innerHTML = `
        <div><strong>${escapeHtml(scene.id)}</strong></div>
        <div class="scene-title">Ch ${scene.chapter ?? '-'} - ${escapeHtml(scene.title || '(untitled)')}</div>
      `;
      item.addEventListener('click', () => {
        state.selectedSceneId = scene.id;
        state.previewIndex = 0;
        render();
      });
      els['scene-list'].appendChild(item);
    });
  }

  function renderEditor() {
    const scene = selectedScene();
    const hasScene = Boolean(scene);
    els['empty-state'].hidden = hasScene;
    els['editor-content'].hidden = !hasScene;
    els['duplicate-scene-btn'].disabled = !hasScene;
    els['delete-scene-btn'].disabled = !hasScene;

    if (!scene) return;

    els['scene-id'].value = scene.id || '';
    els['scene-chapter'].value = scene.chapter ?? '';
    els['scene-title'].value = scene.title || '';
    els['scene-effect'].value = scene.effect || '';
    els['scene-background'].value = scene.background || '';
    els['scene-music'].value = scene.music || '';
    els['scene-next'].value = scene.next_scene || '';

    updateBackgroundThumb(scene.background);

    renderDialogues(scene);
    renderChoices(scene);
    renderEvidence(scene);
    renderBranches(scene);
  }

  function renderDialogues(scene) {
    els['dialogue-list'].innerHTML = '';
    scene.dialogues.forEach((dialogue, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      const styleOptions = ['normal', 'narration', 'thought', 'crazy', 'scared', 'magic'];
      const currentStyle = dialogue.style || 'normal';
      const portraitThumb = dialogue.portrait
        ? `<img class="asset-thumb" src="../game/${escapeAttr(dialogue.portrait)}" alt="">`
        : '';
      card.innerHTML = `
        <div class="card-toolbar">
          <strong>Dialogue ${index + 1}</strong>
          <div class="actions">
            <button type="button" data-action="up">Up</button>
            <button type="button" data-action="down">Down</button>
            <button type="button" data-action="copy">Copy</button>
            <button type="button" data-action="delete" class="danger">Delete</button>
          </div>
        </div>
        <div class="card-fields">
          <label>
            <span>Speaker</span>
            <input type="text" data-field="speaker" value="${escapeAttr(dialogue.speaker || '')}">
          </label>
          <label>
            <span>Style</span>
            <select data-field="style">
              ${styleOptions.map(s =>
                `<option value="${s}"${currentStyle === s ? ' selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </label>
          <label class="wide">
            <span>Portrait</span>
            <input type="text" data-field="portrait" list="portrait-options" value="${escapeAttr(dialogue.portrait || '')}">
            ${portraitThumb}
          </label>
          <label>
            <span>Condition Key</span>
            <input type="text" data-field="condition_key" value="${escapeAttr(dialogue.condition?.flag_key || '')}">
          </label>
          <label>
            <span>Condition Value</span>
            <input type="text" data-field="condition_value" value="${escapeAttr(dialogue.condition?.flag_value != null ? String(dialogue.condition.flag_value) : '')}">
          </label>
          <label class="wide">
            <span>Text</span>
            <textarea data-field="text">${escapeHtml(dialogue.text || '')}</textarea>
          </label>
        </div>
      `;

      bindCardActions(card, action => {
        if (action === 'up' && index > 0) swapItems(scene.dialogues, index, index - 1);
        if (action === 'down' && index < scene.dialogues.length - 1) swapItems(scene.dialogues, index, index + 1);
        if (action === 'copy') scene.dialogues.splice(index + 1, 0, cloneItem(dialogue));
        if (action === 'delete') scene.dialogues.splice(index, 1);
        normalizeOrders(scene.dialogues);
        markDirty();
        render();
      });

      bindFieldUpdates(card, (field, value) => {
        if (field === 'condition_key' || field === 'condition_value') {
          if (!dialogue.condition) dialogue.condition = { flag_key: null, flag_value: null };
          if (field === 'condition_key')   dialogue.condition.flag_key   = value || null;
          if (field === 'condition_value') dialogue.condition.flag_value = value || null;
          if (!dialogue.condition.flag_key && dialogue.condition.flag_value == null) {
            dialogue.condition = null;
          }
        } else {
          dialogue[field] = value || (field === 'style' ? 'normal' : '');
        }
        markDirty();
        renderPreview();
        renderValidation();
      });

      // portrait 썸네일 실시간 업데이트
      const portraitInput = card.querySelector('[data-field="portrait"]');
      const thumb = card.querySelector('.asset-thumb');
      if (portraitInput) {
        portraitInput.addEventListener('input', () => {
          if (thumb) {
            thumb.src = portraitInput.value ? `../game/${portraitInput.value}` : '';
            thumb.hidden = !portraitInput.value;
          } else if (portraitInput.value) {
            const newThumb = document.createElement('img');
            newThumb.className = 'asset-thumb';
            newThumb.src = `../game/${portraitInput.value}`;
            portraitInput.parentElement.appendChild(newThumb);
          }
        });
      }

      els['dialogue-list'].appendChild(card);
    });
  }

  function renderChoices(scene) {
    els['choice-list'].innerHTML = '';
    scene.choices.forEach((choice, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-toolbar">
          <strong>Choice ${index + 1}</strong>
          <div class="actions">
            <button type="button" data-action="copy">Copy</button>
            <button type="button" data-action="delete" class="danger">Delete</button>
          </div>
        </div>
        <div class="card-fields">
          <label>
            <span>Text</span>
            <input type="text" data-field="text" value="${escapeAttr(choice.text || '')}">
          </label>
          <label>
            <span>Next Scene</span>
            <input type="text" data-field="next_scene" list="scene-options" value="${escapeAttr(choice.next_scene || '')}">
          </label>
          <label>
            <span>Flag Key</span>
            <input type="text" data-field="flag_key" value="${escapeAttr(choice.flag_key || '')}">
          </label>
          <label>
            <span>Flag Value</span>
            <input type="text" data-field="flag_value" value="${escapeAttr(choice.flag_value || '')}">
          </label>
        </div>
      `;

      bindCardActions(card, action => {
        if (action === 'copy') scene.choices.splice(index + 1, 0, cloneItem(choice));
        if (action === 'delete') scene.choices.splice(index, 1);
        normalizeOrders(scene.choices);
        markDirty();
        render();
      });

      bindFieldUpdates(card, (field, value) => {
        choice[field] = value || null;
        markDirty();
        renderPreview();
        renderValidation();
      });

      els['choice-list'].appendChild(card);
    });
  }

  function renderEvidence(scene) {
    els['evidence-list'].innerHTML = '';
    scene.evidence.forEach((ev, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-toolbar">
          <strong>Evidence ${index + 1}</strong>
          <div class="actions">
            <button type="button" data-action="copy">Copy</button>
            <button type="button" data-action="delete" class="danger">Delete</button>
          </div>
        </div>
        <div class="card-fields">
          <label>
            <span>ID</span>
            <input type="text" data-field="evidence_id" value="${escapeAttr(ev.evidence_id || '')}">
          </label>
          <label>
            <span>Trigger</span>
            <input type="text" data-field="trigger" value="${escapeAttr(ev.trigger || 'auto')}">
          </label>
          <label>
            <span>Name</span>
            <input type="text" data-field="name" value="${escapeAttr(ev.name || '')}">
          </label>
          <label>
            <span>Image</span>
            <input type="text" data-field="image" list="evidence-image-options" value="${escapeAttr(ev.image || '')}">
            ${ev.image ? `<img class="asset-thumb" src="../game/${escapeAttr(ev.image)}" alt="">` : ''}
          </label>
          <label class="wide">
            <span>Description</span>
            <textarea data-field="description">${escapeHtml(ev.description || '')}</textarea>
          </label>
        </div>
      `;

      bindCardActions(card, action => {
        if (action === 'copy') scene.evidence.splice(index + 1, 0, cloneItem(ev));
        if (action === 'delete') scene.evidence.splice(index, 1);
        markDirty();
        render();
      });

      bindFieldUpdates(card, (field, value) => {
        ev[field] = value || null;
        markDirty();
        renderValidation();
      });

      // evidence image 썸네일 실시간 업데이트
      const imgInput = card.querySelector('[data-field="image"]');
      if (imgInput) {
        imgInput.addEventListener('input', () => {
          let thumb = imgInput.parentElement.querySelector('.asset-thumb');
          if (imgInput.value) {
            if (!thumb) {
              thumb = document.createElement('img');
              thumb.className = 'asset-thumb';
              imgInput.parentElement.appendChild(thumb);
            }
            thumb.src = `../game/${imgInput.value}`;
          } else if (thumb) {
            thumb.remove();
          }
        });
      }

      els['evidence-list'].appendChild(card);
    });
  }

  function bindCardActions(card, onAction) {
    card.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', () => onAction(button.dataset.action));
    });
  }

  function bindFieldUpdates(card, onFieldChange) {
    card.querySelectorAll('[data-field]').forEach(fieldEl => {
      const event = fieldEl.tagName === 'SELECT' ? 'change' : 'input';
      fieldEl.addEventListener(event, () => {
        onFieldChange(fieldEl.dataset.field, fieldEl.value);
      });
    });
  }

  function renderPreview() {
    const scene = selectedScene();
    if (!scene) {
      els['preview-background'].style.backgroundImage = '';
      els['preview-speaker'].textContent = '';
      els['preview-text'].textContent = 'Select a scene to preview it.';
      els['preview-choices'].innerHTML = '';
      els['preview-nav-label'].textContent = '— / —';
      els['preview-prev-btn'].disabled = true;
      els['preview-next-btn'].disabled = true;
      return;
    }

    els['preview-background'].style.backgroundImage = scene.background
      ? `url('../game/${scene.background}')`
      : '';

    const total = scene.dialogues.length;
    state.previewIndex = Math.min(state.previewIndex, Math.max(0, total - 1));

    const line = total > 0 ? scene.dialogues[state.previewIndex] : null;
    const dialogueEl = els['preview-text'].closest('.preview-dialogue');

    dialogueEl.dataset.style = line ? (line.style || 'normal') : 'normal';
    els['preview-speaker'].textContent = line && line.speaker ? line.speaker : (line ? 'Narration' : '');
    els['preview-text'].textContent = line && line.text ? line.text : 'No dialogue yet.';

    els['preview-nav-label'].textContent = total > 0 ? `${state.previewIndex + 1} / ${total}` : '— / —';
    els['preview-prev-btn'].disabled = state.previewIndex === 0;
    els['preview-next-btn'].disabled = state.previewIndex >= total - 1;

    // 선택지는 마지막 대화일 때만 표시
    els['preview-choices'].innerHTML = '';
    if (state.previewIndex === total - 1) {
      scene.choices.slice(0, 3).forEach(choice => {
        const div = document.createElement('div');
        div.className = 'preview-choice';
        div.textContent = choice.text || '(empty choice)';
        els['preview-choices'].appendChild(div);
      });
    }
  }

  function renderValidation() {
    const issues = validateProject();
    els['validation-count'].textContent = String(issues.length);
    els['validation-list'].innerHTML = '';

    if (issues.length === 0) {
      const ok = document.createElement('div');
      ok.className = 'validation-item';
      ok.innerHTML = '<div class="validation-title">No issues found</div><div class="validation-meta">The current project passes the basic MVP checks.</div>';
      els['validation-list'].appendChild(ok);
      return;
    }

    issues.forEach(issue => {
      const item = document.createElement('div');
      item.className = `validation-item ${issue.level}`;
      item.innerHTML = `
        <div class="validation-title">${escapeHtml(issue.message)}</div>
        <div class="validation-meta">${escapeHtml(issue.location)}</div>
      `;
      els['validation-list'].appendChild(item);
    });
  }

  function renderQuickPicks() {
    const sceneIds = Object.keys(state.data.scenes).sort();
    const scenes = Object.values(state.data.scenes);

    const groups = [
      ['Scene IDs', sceneIds],
      ['Backgrounds', collectUnique(scenes.map(scene => scene.background))],
      ['Music', collectUnique(scenes.map(scene => scene.music))],
      ['Portraits', collectUnique(scenes.flatMap(scene => scene.dialogues.map(line => line.portrait)))],
      ['Evidence Images', collectUnique(scenes.flatMap(scene => scene.evidence.map(ev => ev.image)))],
    ];

    els['quick-picks'].innerHTML = '';
    groups.forEach(([title, values]) => {
      const group = document.createElement('div');
      group.className = 'quick-pick-group';
      group.innerHTML = `<strong>${escapeHtml(title)}</strong>`;
      const items = document.createElement('div');
      items.className = 'quick-pick-items';
      if (values.length === 0) {
        items.innerHTML = '<span class="chip">None yet</span>';
      } else {
        values.slice(0, 24).forEach(value => {
          const chip = document.createElement('span');
          chip.className = 'chip';
          chip.textContent = value;
          items.appendChild(chip);
        });
      }
      group.appendChild(items);
      els['quick-picks'].appendChild(group);
    });
  }

  function renderDatalists() {
    const scenes = Object.values(state.data.scenes);
    fillOptions(els['scene-options'], Object.keys(state.data.scenes).sort());
    fillOptions(els['background-options'], collectUnique(scenes.map(scene => scene.background)));
    fillOptions(els['music-options'], collectUnique(scenes.map(scene => scene.music)));
    fillOptions(els['portrait-options'], collectUnique(scenes.flatMap(scene => scene.dialogues.map(line => line.portrait))));
    fillOptions(els['evidence-image-options'], collectUnique(scenes.flatMap(scene => scene.evidence.map(ev => ev.image))));
  }

  function fillOptions(datalist, values) {
    datalist.innerHTML = '';
    values.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      datalist.appendChild(option);
    });
  }

  function renderBranches(scene) {
    if (!scene.branches) scene.branches = [];
    els['branch-list'].innerHTML = '';

    if (scene.branches.length === 0) {
      els['branch-list'].innerHTML = '<div style="font-size:13px;color:var(--muted);padding:4px 0">No branches. Next Scene is used as default.</div>';
    }

    scene.branches.forEach((branch, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-toolbar">
          <strong>Branch ${index + 1}</strong>
          <div class="actions">
            <button type="button" data-action="up">Up</button>
            <button type="button" data-action="down">Down</button>
            <button type="button" data-action="copy">Copy</button>
            <button type="button" data-action="delete" class="danger">Delete</button>
          </div>
        </div>
        <div class="card-fields">
          <label>
            <span>Flag Key</span>
            <input type="text" data-field="flag_key" value="${escapeAttr(branch.flag_key || '')}">
          </label>
          <label>
            <span>Flag Value</span>
            <input type="text" data-field="flag_value" value="${escapeAttr(branch.flag_value != null ? String(branch.flag_value) : '')}">
          </label>
          <label class="wide">
            <span>Next Scene (if matched)</span>
            <input type="text" data-field="next_scene" list="scene-options" value="${escapeAttr(branch.next_scene || '')}">
          </label>
        </div>
      `;

      bindCardActions(card, action => {
        if (action === 'up' && index > 0) swapItems(scene.branches, index, index - 1);
        if (action === 'down' && index < scene.branches.length - 1) swapItems(scene.branches, index, index + 1);
        if (action === 'copy') scene.branches.splice(index + 1, 0, cloneItem(branch));
        if (action === 'delete') scene.branches.splice(index, 1);
        markDirty();
        render();
      });

      bindFieldUpdates(card, (field, value) => {
        branch[field] = value || null;
        markDirty();
        renderValidation();
      });

      els['branch-list'].appendChild(card);
    });
  }

  function addBranch() {
    const scene = selectedScene();
    if (!scene) return;
    if (!scene.branches) scene.branches = [];
    scene.branches.push({ flag_key: '', flag_value: '', next_scene: null });
    markDirty();
    render();
  }

  function renderFlagPanel() {
    const scenes = Object.values(state.data.scenes);

    // 세팅 출처: choice.flag_key
    const setFlags = {};
    scenes.forEach(scene => {
      scene.choices.forEach(choice => {
        if (choice.flag_key) {
          if (!setFlags[choice.flag_key]) setFlags[choice.flag_key] = new Set();
          if (choice.flag_value != null) setFlags[choice.flag_key].add(String(choice.flag_value));
        }
      });
    });

    // 읽기 출처: dialogue.condition + branch.flag_key
    const readFlags = {};
    scenes.forEach(scene => {
      scene.dialogues.forEach(line => {
        if (line.condition?.flag_key) {
          if (!readFlags[line.condition.flag_key]) readFlags[line.condition.flag_key] = new Set();
          if (line.condition.flag_value != null) readFlags[line.condition.flag_key].add(String(line.condition.flag_value));
        }
      });
      (scene.branches || []).forEach(branch => {
        if (branch.flag_key) {
          if (!readFlags[branch.flag_key]) readFlags[branch.flag_key] = new Set();
          if (branch.flag_value != null) readFlags[branch.flag_key].add(String(branch.flag_value));
        }
      });
    });

    const allKeys = [...new Set([...Object.keys(setFlags), ...Object.keys(readFlags)])].sort();

    els['flag-panel'].innerHTML = '';
    if (allKeys.length === 0) {
      els['flag-panel'].innerHTML = '<div class="validation-item"><div class="validation-title">No flags used</div><div class="validation-meta">Choices에서 flag_key를 지정하면 여기에 표시됩니다.</div></div>';
      return;
    }

    allKeys.forEach(key => {
      const isSet  = Boolean(setFlags[key]);
      const isRead = Boolean(readFlags[key]);
      const level  = !isSet ? ' warning' : (!isRead ? '' : '');
      const item = document.createElement('div');
      item.className = `validation-item${level}`;

      const setVals  = isSet  ? [...setFlags[key]].join(', ')  : '(never set)';
      const readVals = isRead ? [...readFlags[key]].join(', ') : '(never read)';

      item.innerHTML = `
        <div class="validation-title">${escapeHtml(key)}</div>
        <div class="validation-meta">
          Set: ${escapeHtml(setVals)}<br>
          Read: ${escapeHtml(readVals)}
        </div>
      `;
      els['flag-panel'].appendChild(item);
    });
  }

  function handleKeydown(e) {
    const tag = document.activeElement?.tagName;
    const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

    // Ctrl+S: 어디서든 저장
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveJsonFile();
      return;
    }

    if (inField) return;

    // Ctrl+D: 씬 복제 (브라우저 북마크 단축키 override)
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault(); // intentional: overrides browser bookmark shortcut
      duplicateScene();
      return;
    }

    // Delete: scene-item 포커스 상태일 때만 삭제
    if (e.key === 'Delete') {
      if (document.activeElement?.classList.contains('scene-item')) {
        e.preventDefault();
        deleteScene();
      }
    }
  }

  function addScene() {
    const nextId = uniqueSceneId('scene');
    state.data.scenes[nextId] = {
      id: nextId,
      chapter: 1,
      title: '',
      background: null,
      music: null,
      next_scene: null,
      effect: null,
      dialogues: [],
      choices: [],
      evidence: [],
      branches: [],
    };

    if (!state.data.first_scene) state.data.first_scene = nextId;
    state.selectedSceneId = nextId;
    markDirty();
    render();
  }

  function duplicateScene() {
    const scene = selectedScene();
    if (!scene) return;
    const newId = uniqueSceneId(`${scene.id}_copy`);
    const clone = cloneItem(scene);
    clone.id = newId;
    state.data.scenes[newId] = clone;
    state.selectedSceneId = newId;
    markDirty();
    render();
  }

  function deleteScene() {
    const scene = selectedScene();
    if (!scene) return;
    if (!confirm(`Delete scene "${scene.id}"?`)) return;
    delete state.data.scenes[scene.id];
    if (state.data.first_scene === scene.id) {
      state.data.first_scene = firstSceneId(state.data);
    }
    state.selectedSceneId = firstSceneId(state.data);
    markDirty();
    render();
  }

  function addDialogue() {
    const scene = selectedScene();
    if (!scene) return;
    scene.dialogues.push({
      order: scene.dialogues.length + 1,
      speaker: '',
      text: '',
      style: 'normal',
      portrait: null,
      condition: null,
    });
    markDirty();
    render();
  }

  function addChoice() {
    const scene = selectedScene();
    if (!scene) return;
    scene.choices.push({
      order: scene.choices.length + 1,
      text: '',
      flag_key: null,
      flag_value: null,
      next_scene: null,
    });
    markDirty();
    render();
  }

  function addEvidence() {
    const scene = selectedScene();
    if (!scene) return;
    scene.evidence.push({
      evidence_id: '',
      trigger: 'auto',
      name: '',
      description: '',
      image: null,
    });
    markDirty();
    render();
  }

  function updateSceneId(nextId) {
    const scene = selectedScene();
    if (!scene) return;

    const trimmed = nextId.trim();
    if (!trimmed || trimmed === scene.id) {
      scene.id = trimmed || scene.id;
      return;
    }

    if (state.data.scenes[trimmed]) return;

    delete state.data.scenes[scene.id];
    scene.id = trimmed;
    state.data.scenes[trimmed] = scene;

    if (state.data.first_scene === state.selectedSceneId) {
      state.data.first_scene = trimmed;
    }

    Object.values(state.data.scenes).forEach(otherScene => {
      if (otherScene.next_scene === state.selectedSceneId) otherScene.next_scene = trimmed;
      otherScene.choices.forEach(choice => {
        if (choice.next_scene === state.selectedSceneId) choice.next_scene = trimmed;
      });
    });

    state.selectedSceneId = trimmed;
    markDirty();
    render();
  }

  function setSceneField(field, value) {
    const scene = selectedScene();
    if (!scene) return;
    scene[field] = value;
    if (field === 'background') updateBackgroundThumb(value);
    markDirty();
    renderPreview();
    renderDatalists();
  }

  function updateBackgroundThumb(path) {
    const thumb = els['background-thumb'];
    if (!thumb) return;
    if (path) {
      thumb.src = `../game/${path}`;
      thumb.hidden = false;
    } else {
      thumb.src = '';
      thumb.hidden = true;
    }
  }

  function validateProject() {
    const issues = [];
    const sceneIds = new Set(Object.keys(state.data.scenes));
    const evidenceIds = new Set();

    Object.values(state.data.scenes).forEach(scene => {
      if (!scene.id) {
        issues.push({ level: 'error', message: 'Scene is missing an id', location: '(scene meta)' });
      }

      if (scene.next_scene && !sceneIds.has(scene.next_scene)) {
        issues.push({ level: 'error', message: `Unknown next scene "${scene.next_scene}"`, location: scene.id });
      }

      if (scene.background && !assetExists(scene.background)) {
        issues.push({ level: 'warning', message: `Background path not in known assets: ${scene.background}`, location: scene.id });
      }

      if (scene.music && !assetExists(scene.music)) {
        issues.push({ level: 'warning', message: `Music path not in known assets: ${scene.music}`, location: scene.id });
      }

      scene.dialogues.forEach((line, index) => {
        if (!line.text) {
          issues.push({ level: 'error', message: `Dialogue ${index + 1} is empty`, location: scene.id });
        }
        if (line.portrait && !assetExists(line.portrait)) {
          issues.push({ level: 'warning', message: `Portrait path not in known assets: ${line.portrait}`, location: `${scene.id} dialogue ${index + 1}` });
        }
      });

      scene.choices.forEach((choice, index) => {
        if (!choice.text) {
          issues.push({ level: 'error', message: `Choice ${index + 1} is empty`, location: scene.id });
        }
        if (choice.next_scene && !sceneIds.has(choice.next_scene)) {
          issues.push({ level: 'error', message: `Choice points to unknown scene "${choice.next_scene}"`, location: `${scene.id} choice ${index + 1}` });
        }
      });

      scene.evidence.forEach((ev, index) => {
        if (!ev.evidence_id) {
          issues.push({ level: 'error', message: `Evidence ${index + 1} is missing an id`, location: scene.id });
        } else if (evidenceIds.has(ev.evidence_id)) {
          issues.push({ level: 'error', message: `Duplicate evidence id "${ev.evidence_id}"`, location: scene.id });
        } else {
          evidenceIds.add(ev.evidence_id);
        }

        if (ev.image && !assetExists(ev.image)) {
          issues.push({ level: 'warning', message: `Evidence image path not in known assets: ${ev.image}`, location: `${scene.id} evidence ${index + 1}` });
        }
      });

      (scene.branches || []).forEach((branch, index) => {
        if (branch.next_scene && !sceneIds.has(branch.next_scene)) {
          issues.push({ level: 'error', message: `Branch points to unknown scene "${branch.next_scene}"`, location: `${scene.id} branch ${index + 1}` });
        }
        if (!branch.flag_key) {
          issues.push({ level: 'warning', message: `Branch ${index + 1} has no flag key`, location: scene.id });
        }
      });
    });

    if (state.data.first_scene && !sceneIds.has(state.data.first_scene)) {
      issues.push({ level: 'error', message: `First scene "${state.data.first_scene}" does not exist`, location: 'project' });
    }

    return issues;
  }

  function saveJsonFile() {
    downloadFile(`${safeFileName(state.projectName)}.json`, JSON.stringify(state.data, null, 2), 'application/json');
    state.dirty = false;
    saveAutosave();
    renderStatus();
  }

  function exportGameData() {
    const content = `window.GAME_DATA = ${JSON.stringify(state.data, null, 2)};\n`;
    downloadFile('game_data.js', content, 'text/javascript');
    state.dirty = false;
    saveAutosave();
    renderStatus();
  }

  async function handleOpenJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    try {
      state.data = parseImportedData(text);
      state.projectName = file.name.replace(/\.(json|js)$/i, '');
      state.assetCatalog = buildAssetCatalog(state.data);
      state.selectedSceneId = state.data.first_scene || firstSceneId(state.data);
      state.dirty = false;
      saveAutosave();
      render();
    } catch (e) {
      alert(`Failed to parse file: ${e.message}`);
    } finally {
      event.target.value = '';
    }
  }

  function parseImportedData(text) {
    const trimmed = text.trim();
    if (trimmed.startsWith('window.GAME_DATA =')) {
      const jsonPart = trimmed.replace(/^window\.GAME_DATA\s*=\s*/, '').replace(/;$/, '');
      return JSON.parse(jsonPart);
    }
    return JSON.parse(trimmed);
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function firstSceneId(data) {
    return Object.keys(data.scenes)[0] || null;
  }

  function uniqueSceneId(base) {
    const root = base.replace(/\s+/g, '_').toLowerCase();
    let candidate = root;
    let index = 2;
    while (state.data.scenes[candidate]) {
      candidate = `${root}_${index}`;
      index += 1;
    }
    return candidate;
  }

  function normalizeOrders(items) {
    items.forEach((item, index) => {
      item.order = index + 1;
    });
  }

  function swapItems(items, from, to) {
    const temp = items[from];
    items[from] = items[to];
    items[to] = temp;
  }

  function cloneItem(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function collectUnique(values) {
    return [...new Set(values.filter(Boolean))].sort();
  }

  function assetExists(path) {
    return state.assetCatalog.has(path);
  }

  function buildAssetCatalog(data) {
    const scenes = Object.values(data.scenes || {});
    return new Set([
      ...collectUnique(scenes.map(scene => scene.background)),
      ...collectUnique(scenes.map(scene => scene.music)),
      ...collectUnique(scenes.flatMap(scene => scene.dialogues.map(line => line.portrait))),
      ...collectUnique(scenes.flatMap(scene => scene.evidence.map(ev => ev.image))),
    ]);
  }

  function safeFileName(value) {
    return value.toLowerCase().replace(/[^a-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'project';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/'/g, '&#39;');
  }
})();
