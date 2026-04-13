(function () {
  'use strict';

  function create(ctx) {
    const { escapeAttr, escapeHtml, pushHistory } = ctx;
    let datalistCounter = 0;

    function normalizeOption(option) {
      if (option && typeof option === 'object') {
        return {
          value: option.value ?? '',
          label: option.label ?? option.value ?? '',
        };
      }
      return {
        value: option ?? '',
        label: option ?? '',
      };
    }

    function renderSelectOptions(options, selectedValue, includeBlank = true) {
      const normalized = selectedValue ?? '';
      const items = [];
      if (includeBlank) {
        items.push('<option value="">(none)</option>');
      }
      (options || []).map(normalizeOption).forEach(option => {
        items.push(`<option value="${escapeAttr(option.value)}"${normalized === option.value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`);
      });
      return items.join('');
    }

    function renderDatalistOptions(options) {
      return (options || []).map(normalizeOption).map(option => {
        const labelAttr = option.label && option.label !== option.value
          ? ` label="${escapeAttr(option.label)}"`
          : '';
        return `<option value="${escapeAttr(option.value)}"${labelAttr}></option>`;
      }).join('');
    }

    function ensureCurrentOption(select, options, currentValue) {
      const normalized = currentValue ?? '';
      if (!normalized) return;
      const hasCurrent = (options || []).map(normalizeOption).some(option => option.value === normalized);
      if (hasCurrent) return;
      const custom = document.createElement('option');
      custom.value = normalized;
      custom.textContent = normalized;
      custom.selected = true;
      select.prepend(custom);
    }

    function ensureCurrentOptions(select, options, currentValues) {
      const normalizedValues = Array.isArray(currentValues)
        ? currentValues.map(value => value ?? '').filter(Boolean)
        : [];
      const normalizedOptions = (options || []).map(normalizeOption);
      normalizedValues.forEach(value => {
        const hasCurrent = normalizedOptions.some(option => option.value === value);
        if (hasCurrent) return;
        const custom = document.createElement('option');
        custom.value = value;
        custom.textContent = value;
        custom.selected = true;
        select.prepend(custom);
      });
    }

    function parseDelimitedValues(raw) {
      return String(raw || '')
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
    }

    function replaceEnumInputs(container, mappings) {
      mappings.forEach(({ field, options, includeBlank = true }) => {
        container.querySelectorAll(`input[data-field="${field}"]`).forEach(input => {
          const select = document.createElement('select');
          select.dataset.field = field;
          select.innerHTML = renderSelectOptions(options, input.value || '', includeBlank);
          ensureCurrentOption(select, options, input.value || '');
          input.replaceWith(select);
        });
      });
    }

    function replaceSelectInputs(container, mappings) {
      mappings.forEach(({ field, options, includeBlank = true }) => {
        const resolvedOptions = typeof options === 'function' ? options() : options;
        container.querySelectorAll(`input[data-field="${field}"]`).forEach(input => {
          const select = document.createElement('select');
          select.dataset.field = field;
          select.innerHTML = renderSelectOptions(resolvedOptions || [], input.value || '', includeBlank);
          ensureCurrentOption(select, resolvedOptions || [], input.value || '');
          input.replaceWith(select);
        });
      });
    }

    function replaceComboboxInputs(container, mappings) {
      mappings.forEach(({ field, options }) => {
        const resolvedOptions = typeof options === 'function' ? options() : options;
        container.querySelectorAll(`input[data-field="${field}"]`).forEach(input => {
          const listId = `combo-${field}-${datalistCounter++}`;
          const combo = document.createElement('input');
          combo.type = 'text';
          combo.dataset.field = field;
          combo.value = input.value || '';
          combo.placeholder = input.placeholder || '';
          combo.setAttribute('list', listId);
          if (input.className) combo.className = input.className;

          const datalist = document.createElement('datalist');
          datalist.id = listId;
          datalist.innerHTML = renderDatalistOptions(resolvedOptions || []);

          const normalizedOptions = (resolvedOptions || []).map(normalizeOption);
          if ((input.value || '') && !normalizedOptions.some(option => option.value === (input.value || ''))) {
            const custom = document.createElement('option');
            custom.value = input.value || '';
            datalist.appendChild(custom);
          }

          input.replaceWith(combo);
          combo.insertAdjacentElement('afterend', datalist);
        });
      });
    }

    function replaceMultiSelectInputs(container, mappings) {
      mappings.forEach(({ field, options, size = 5 }) => {
        const resolvedOptions = typeof options === 'function' ? options() : options;
        container.querySelectorAll(`input[data-field="${field}"]`).forEach(input => {
          const values = parseDelimitedValues(input.value || '');
          const select = document.createElement('select');
          select.dataset.field = field;
          select.multiple = true;
          select.size = Math.max(3, Math.min(size, Math.max((resolvedOptions || []).length, values.length, 3)));
          select.innerHTML = renderSelectOptions(resolvedOptions || [], '', false);
          Array.from(select.options).forEach(option => {
            option.selected = values.includes(option.value);
          });
          ensureCurrentOptions(select, resolvedOptions || [], values);
          input.replaceWith(select);
        });
      });
    }

    function bindCardFieldEvents(card, item, onChange) {
      card.querySelectorAll('input,textarea,select').forEach(el => {
        if (el.dataset.bound === '1') return;
        const ev = el.tagName === 'SELECT' ? 'change' : 'input';
        const beginSnapshot = () => {
          if (card.dataset.historyCaptured === '1') return;
          pushHistory();
          card.dataset.historyCaptured = '1';
        };
        el.addEventListener('focus', beginSnapshot, { once: false });
        el.addEventListener(ev, () => {
          const value = el.multiple
            ? Array.from(el.selectedOptions).map(option => option.value).join(', ')
            : el.value;
          onChange(item, el.dataset.field, value);
        });
        el.addEventListener('blur', () => {
          card.dataset.historyCaptured = '0';
        });
        el.dataset.bound = '1';
      });
    }

    function rebindCardCollection(container, items, onChange) {
      container.querySelectorAll('.pcard').forEach((card, index) => {
        bindCardFieldEvents(card, items[index], onChange);
      });
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

        bindCardFieldEvents(card, item, onChange);
        wrap.appendChild(card);
      });

      return wrap;
    }

    return {
      renderSelectOptions,
      replaceEnumInputs,
      replaceSelectInputs,
      replaceComboboxInputs,
      replaceMultiSelectInputs,
      bindCardFieldEvents,
      rebindCardCollection,
      makeCard,
    };
  }

  window.EditorCardUI = { create };
})();
