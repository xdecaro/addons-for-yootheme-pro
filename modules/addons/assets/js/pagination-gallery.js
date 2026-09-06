(() => {
  'use strict';

  const ROOT = '[data-x-pagination-gallery]';
  const GRID = '.uk-grid,[uk-grid],[data-uk-grid]';
  const states = new WeakMap();
  const originalDisplay = new WeakMap();
  const pendingRoots = new Set();
  let pendingFrame = 0;
  let discoveryObserver = null;
  let builderScrollFrame = 0;

  const q = (root, selector) => {
    try {
      return root && selector ? root.querySelector(selector) : null;
    } catch {
      return null;
    }
  };

  const qa = (root, selector) => {
    try {
      return root && selector ? [...root.querySelectorAll(selector)] : [];
    } catch {
      return [];
    }
  };

  function isBuilderUrl(value) {
    try {
      const url = new URL(String(value || ''), location.href);
      return url.searchParams.get('p') === 'customizer' ||
        (url.pathname.includes('/administrator/') && url.searchParams.get('option') === 'com_ajax');
    } catch {
      return false;
    }
  }

  function isBuilder() {
    if (isBuilderUrl(location.href)) return true;
    try {
      if (window.parent && window.parent !== window && isBuilderUrl(window.parent.location.href)) return true;
    } catch {}
    try {
      if (window.top && window.top !== window && isBuilderUrl(window.top.location.href)) return true;
    } catch {}
    return false;
  }

  function isBefore(a, b) {
    try {
      return !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    } catch {
      return false;
    }
  }

  function directPreviousGrid(root) {
    let node = root?.previousElementSibling || null;
    while (node) {
      if (node.matches?.(GRID)) return node;
      const grids = qa(node, GRID);
      if (grids.length) return grids[grids.length - 1];
      node = node.previousElementSibling;
    }
    return null;
  }

  function scopedPreviousGrid(root) {
    let scope = root?.parentElement || null;
    const doc = root?.ownerDocument || document;
    while (scope && scope !== doc.documentElement) {
      const grids = qa(scope, GRID).filter(grid => {
        if (grid === root || grid.contains(root) || grid.closest(ROOT) || !grid.children.length) return false;
        return isBefore(grid, root);
      });
      if (grids.length) return grids[grids.length - 1];
      scope = scope.parentElement;
    }
    return null;
  }

  function target(root) {
    return directPreviousGrid(root) || scopedPreviousGrid(root);
  }

  function itemHost(targetElement, root) {
    if (!targetElement) return null;
    const selector = root.dataset.itemSelector || ':scope > *';
    if (selector !== ':scope > *') return targetElement;
    const direct = qa(targetElement, ':scope > *').filter(item => !item.matches(ROOT));
    if (direct.length === 1) {
      const only = direct[0];
      if (only.matches?.(GRID) && only.children.length) return only;
    }
    return targetElement;
  }

  function items(targetElement, root) {
    const host = itemHost(targetElement, root);
    if (!host) return [];
    return qa(host, root.dataset.itemSelector || ':scope > *').filter(item => !item.matches(ROOT));
  }

  function storeDisplay(item) {
    if (originalDisplay.has(item)) return;
    originalDisplay.set(item, {
      value: item.style.getPropertyValue('display'),
      priority: item.style.getPropertyPriority('display'),
      hidden: item.hidden,
    });
  }

  function hideItem(item) {
    storeDisplay(item);
    item.hidden = true;
    item.setAttribute('data-x-pagination-gallery-hidden', '1');
    item.style.setProperty('display', 'none', 'important');
  }

  function showItem(item) {
    const original = originalDisplay.get(item);
    item.removeAttribute('data-x-pagination-gallery-hidden');
    if (original) {
      item.hidden = original.hidden;
      if (original.value) item.style.setProperty('display', original.value, original.priority || '');
      else item.style.removeProperty('display');
    } else {
      item.hidden = false;
      item.style.removeProperty('display');
    }
  }

  function restoreItems(list) {
    list.forEach(showItem);
  }

  function updateUi(host) {
    window.requestAnimationFrame(() => {
      try {
        if (window.UIkit && typeof window.UIkit.update === 'function') {
          window.UIkit.update(host, 'update');
        }
      } catch {}
    });
  }

  function animate(list, mode) {
    if (!mode || mode === 'none') return;
    list.forEach((item, index) => {
      item.classList.add(`x-pagination-new--${mode}`);
      item.style.animationDelay = `${Math.min(index * 35, 245)}ms`;
      item.addEventListener('animationend', () => {
        item.classList.remove(`x-pagination-new--${mode}`);
        item.style.animationDelay = '';
      }, { once: true });
    });
  }

  function customText(root, key, fallback) {
    const customKey = {
      loadmore: 'loadmoreText',
      previous: 'previousText',
      next: 'nextText',
      end: 'endText',
      limit: 'limitText',
    }[key];
    const defaultKey = {
      loadmore: 'defaultLoadmoreText',
      previous: 'defaultPreviousText',
      next: 'defaultNextText',
      end: 'defaultEndText',
      limit: 'defaultLimitText',
    }[key];
    const custom = String(root.dataset[customKey] || '').trim();
    return custom || String(root.dataset[defaultKey] || fallback).trim() || fallback;
  }

  function controlClasses(root, extra = '') {
    const classes = ['x-pagination__control'];
    const style = root.dataset.controlStyle || 'text';
    const size = root.dataset.controlSize || '';
    if (style === 'custom') classes.push('x-pagination__control--custom');
    else classes.push('uk-button', `uk-button-${style || 'default'}`);
    if (size) classes.push(`uk-button-${size}`);
    if (extra) classes.push(extra);
    return classes.join(' ');
  }

  function iconCharacter(root, directionName = 'next') {
    const icon = root.dataset.icon || 'arrow';
    if (icon === 'none') return '';
    if (icon === 'plus' || icon === 'chevron') return directionName === 'previous' ? '‹' : '›';
    return directionName === 'previous' ? '←' : '→';
  }

  function makeButton(root, label, page, directionName = null, disabled = false, active = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = controlClasses(root, directionName ? 'x-pagination__direction' : 'x-pagination__page');
    if (page) button.dataset.xGalleryPage = String(page);
    if (disabled || active || !page) button.disabled = true;
    if (active) {
      button.classList.add('is-active');
      button.setAttribute('aria-current', 'page');
    }

    const iconValue = directionName ? iconCharacter(root, directionName) : '';
    const iconLeft = directionName === 'previous' || root.dataset.iconPosition === 'left';
    if (iconValue && iconLeft) {
      const icon = document.createElement('span');
      icon.className = 'x-pagination__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = iconValue;
      button.appendChild(icon);
    }

    const text = document.createElement('span');
    text.textContent = label;
    button.appendChild(text);

    if (iconValue && !iconLeft) {
      const icon = document.createElement('span');
      icon.className = 'x-pagination__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = iconValue;
      button.appendChild(icon);
    }
    return button;
  }

  function compactPages(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const pages = new Set([1, total, current - 1, current, current + 1]);
    if (current <= 3) [2, 3, 4].forEach(page => pages.add(page));
    if (current >= total - 2) [total - 3, total - 2, total - 1].forEach(page => pages.add(page));
    const sorted = [...pages].filter(page => page >= 1 && page <= total).sort((a, b) => a - b);
    const output = [];
    sorted.forEach((page, index) => {
      if (index && page - sorted[index - 1] > 1) output.push('ellipsis');
      output.push(page);
    });
    return output;
  }

  function setMessage(root, text) {
    const message = q(root, '[data-x-pagination-message]');
    if (!message) return;
    message.textContent = text || '';
    message.hidden = !text;
  }

  function setBusy(root, busy) {
    root.classList.toggle('is-loading', busy);
    root.setAttribute('aria-busy', busy ? 'true' : 'false');
    qa(root, 'button').forEach(button => { button.disabled = busy || button.hasAttribute('aria-current'); });
    const loading = q(root, '[data-x-pagination-loading]');
    if (loading) loading.hidden = !busy;
  }

  function setReady(root) {
    root.classList.remove('is-finished');
    root.classList.add('is-ready');
    if (isBuilder()) root.classList.add('is-builder-preview');
    const button = q(root, '[data-x-pagination-loadmore]');
    const sentinel = q(root, '[data-x-pagination-sentinel]');
    const nav = q(root, '[data-x-pagination-nav]');
    if (button) button.hidden = false;
    if (sentinel) sentinel.hidden = false;
    if (nav) nav.hidden = false;
  }

  function finish(root, state, reason = 'end', showMessage = true) {
    state?.observer?.disconnect();
    if (state) state.observer = null;
    root.classList.add('is-finished');
    root.classList.remove('is-ready');
    const button = q(root, '[data-x-pagination-loadmore]');
    const sentinel = q(root, '[data-x-pagination-sentinel]');
    const loading = q(root, '[data-x-pagination-loading]');
    if (button) button.hidden = true;
    if (sentinel) sentinel.hidden = true;
    if (loading) loading.hidden = true;
    if (showMessage && root.dataset.showEndMessage === '1') {
      setMessage(root, reason === 'limit'
        ? customText(root, 'limit', 'Hai raggiunto il limite di visualizzazione')
        : customText(root, 'end', 'Hai visualizzato tutti gli elementi'));
    }
  }

  function pageRange(state, page) {
    const start = (page - 1) * state.pageSize;
    return [start, Math.min(start + state.pageSize, state.items.length)];
  }

  function renderNavigation(root, state) {
    const nav = q(root, '[data-x-pagination-nav]');
    if (!nav) return;
    const mode = root.dataset.mode || 'numeric';
    const total = Math.max(1, Math.ceil(state.items.length / state.pageSize));
    const current = state.currentPage || 1;
    const list = document.createElement('div');
    list.className = 'x-pagination__list';

    if (mode === 'prevnext' || mode === 'full') {
      list.appendChild(makeButton(root, customText(root, 'previous', 'Precedente'), current > 1 ? current - 1 : 0, 'previous', current <= 1));
    }

    if (mode === 'numeric' || mode === 'full') {
      compactPages(current, total).forEach(page => {
        if (page === 'ellipsis') {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'x-pagination__ellipsis';
          ellipsis.textContent = '…';
          ellipsis.setAttribute('aria-hidden', 'true');
          list.appendChild(ellipsis);
        } else {
          list.appendChild(makeButton(root, String(page), page, null, false, page === current));
        }
      });
    }

    if (mode === 'prevnext' || mode === 'full') {
      list.appendChild(makeButton(root, customText(root, 'next', 'Successivo'), current < total ? current + 1 : 0, 'next', current >= total));
    }

    nav.replaceChildren(list);
    nav.hidden = total <= 1 && !isBuilder();
  }

  function showPage(root, state, page) {
    const totalPages = Math.max(1, Math.ceil(state.items.length / state.pageSize));
    const nextPage = Math.min(totalPages, Math.max(1, page));
    const [start, end] = pageRange(state, nextPage);
    state.items.forEach((item, index) => index >= start && index < end ? showItem(item) : hideItem(item));
    state.currentPage = nextPage;
    renderNavigation(root, state);
    updateUi(state.host);
    if (root.dataset.scrollTop === '1' && !isBuilder()) {
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      state.target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  async function loadLocal(root) {
    const state = states.get(root);
    if (!state || state.loading || root.classList.contains('is-finished')) return;
    if (state.maxLoads > 0 && state.loads >= state.maxLoads) {
      finish(root, state, state.visibleCount < state.items.length ? 'limit' : 'end');
      return;
    }

    state.loading = true;
    setMessage(root, '');
    setBusy(root, true);

    try {
      const start = state.visibleCount;
      const end = Math.min(start + state.batchSize, state.items.length);
      const revealed = state.items.slice(start, end);
      revealed.forEach(showItem);
      state.visibleCount = end;
      state.loads += 1;
      animate(revealed, root.dataset.animation || 'fade');
      updateUi(state.host);

      if (state.visibleCount >= state.items.length) {
        finish(root, state, 'end');
      } else if (state.maxLoads > 0 && state.loads >= state.maxLoads) {
        finish(root, state, 'limit');
      }
    } finally {
      state.loading = false;
      setBusy(root, false);
    }
  }

  function setupInfinite(root, state) {
    const sentinel = q(root, '[data-x-pagination-sentinel]');
    if (!sentinel || isBuilder() || !('IntersectionObserver' in window)) return;
    const distance = Math.max(0, parseInt(root.dataset.threshold || '500', 10) || 500);
    state.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadLocal(root);
    }, { rootMargin: `0px 0px ${distance}px 0px` });
    state.observer.observe(sentinel);
  }

  function init(root, force = false) {
    if (!root?.isConnected) return;
    if (!force && states.has(root)) return;

    const oldState = states.get(root);
    oldState?.observer?.disconnect();
    if (oldState?.items) restoreItems(oldState.items);

    const targetElement = target(root);
    const host = targetElement ? itemHost(targetElement, root) : null;
    const list = targetElement ? items(targetElement, root) : [];
    if (!targetElement || !host || !list.length) {
      states.delete(root);
      root.classList.remove('is-ready');
      if (isBuilder()) root.classList.add('is-builder-preview');
      return;
    }

    const initialSize = Math.max(1, parseInt(root.dataset.initialSize || '20', 10) || 20);
    const batchSize = Math.max(1, parseInt(root.dataset.batchSize || '20', 10) || 20);
    const parsedMax = parseInt(root.dataset.maxLoads || '4', 10);
    const maxLoads = Number.isFinite(parsedMax) ? Math.max(0, parsedMax) : 4;
    const mode = root.dataset.mode || 'loadmore';
    const state = {
      target: targetElement,
      host,
      items: list,
      initialSize,
      batchSize,
      maxLoads,
      loads: 0,
      loading: false,
      observer: null,
      visibleCount: Math.min(initialSize, list.length),
      pageSize: initialSize,
      currentPage: 1,
    };
    states.set(root, state);
    setMessage(root, '');

    if (mode === 'loadmore' || mode === 'infinite') {
      list.forEach((item, index) => index < state.visibleCount ? showItem(item) : hideItem(item));
      updateUi(host);
      if (state.visibleCount >= list.length) {
        finish(root, state, 'end', false);
        return;
      }
      setReady(root);
      if (mode === 'infinite') setupInfinite(root, state);
      return;
    }

    showPage(root, state, 1);
    setReady(root);
    renderNavigation(root, state);
  }

  function queueInit(root) {
    if (!root?.isConnected) return;
    pendingRoots.add(root);
    if (pendingFrame) return;
    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = 0;
      const roots = [...pendingRoots];
      pendingRoots.clear();
      roots.forEach(rootElement => init(rootElement, true));
    });
  }

  function boot(force = false) {
    qa(document, ROOT).forEach(root => force ? queueInit(root) : init(root));
  }

  function builderInfiniteCheck() {
    if (!isBuilder() || builderScrollFrame) return;
    builderScrollFrame = window.requestAnimationFrame(() => {
      builderScrollFrame = 0;
      qa(document, `${ROOT}[data-mode="infinite"]`).forEach(root => {
        const state = states.get(root);
        const sentinel = q(root, '[data-x-pagination-sentinel]');
        if (!state || !sentinel || sentinel.hidden || state.loading || root.classList.contains('is-finished')) return;
        const distance = Math.max(0, parseInt(root.dataset.threshold || '500', 10) || 500);
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const rect = sentinel.getBoundingClientRect();
        if (rect.top <= viewportHeight + distance && rect.bottom >= -distance) loadLocal(root);
      });
    });
  }

  document.addEventListener('click', event => {
    const loadButton = event.target?.closest?.(`${ROOT} [data-x-pagination-loadmore]`);
    if (loadButton) {
      const root = loadButton.closest(ROOT);
      if (!root) return;
      event.preventDefault();
      if (isBuilder()) {
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
      loadLocal(root);
      return;
    }

    const pageButton = event.target?.closest?.(`${ROOT} [data-x-gallery-page]`);
    if (!pageButton || pageButton.disabled) return;
    const root = pageButton.closest(ROOT);
    const state = root ? states.get(root) : null;
    if (!root || !state) return;
    event.preventDefault();
    if (isBuilder()) {
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    showPage(root, state, parseInt(pageButton.dataset.xGalleryPage || '1', 10) || 1);
  }, true);

  function startBuilderObserver() {
    if (!isBuilder() || discoveryObserver || !('MutationObserver' in window)) return;
    const targetNode = document.body || document.documentElement;
    if (!targetNode) return;
    discoveryObserver = new MutationObserver(records => {
      records.forEach(record => {
        Array.from(record.addedNodes).forEach(node => {
          if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches?.(ROOT)) queueInit(node);
          qa(node, ROOT).forEach(queueInit);
        });
      });
    });
    discoveryObserver.observe(targetNode, { childList: true, subtree: true });
  }

  function start() {
    boot();
    startBuilderObserver();
    if (isBuilder()) {
      window.addEventListener('scroll', builderInfiniteCheck, { passive: true });
      document.addEventListener('scroll', builderInfiniteCheck, { capture: true, passive: true });
      window.addEventListener('resize', builderInfiniteCheck, { passive: true });
      [100, 250, 500, 1000].forEach(delay => window.setTimeout(builderInfiniteCheck, delay));
    }
  }

  document.addEventListener('yootheme:builder:render', () => {
    boot(true);
    builderInfiniteCheck();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
