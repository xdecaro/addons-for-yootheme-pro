(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';
  const GRID = '.uk-grid,[uk-grid],[data-uk-grid]';
  const states = new WeakMap();
  const nextWords = [
    'next', 'next page', 'suivant', 'suivante', 'page suivante',
    'successiva', 'successivo', 'pagina successiva', 'avanti',
    'volgende', 'weiter', 'nächste', 'naechste', 'próxima',
    'proxima', 'seguinte', 'siguiente'
  ];

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

  const norm = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  const absoluteUrl = (href, base = location.href) => {
    try {
      return href && href !== '#' ? new URL(href, base).href : null;
    } catch {
      return null;
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

  if (!isBuilder()) return;

  function isBefore(a, b) {
    try {
      return Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    } catch {
      return false;
    }
  }

  function directPreviousGrid(root) {
    let node = root.previousElementSibling;

    while (node) {
      if (node.matches?.(GRID)) return node;
      const grids = qa(node, GRID);
      if (grids.length) return grids[grids.length - 1];
      node = node.previousElementSibling;
    }

    return null;
  }

  function scopedPreviousGrid(root) {
    let scope = root.parentElement;
    const doc = root.ownerDocument;

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

  function autoTarget(root) {
    return directPreviousGrid(root) || scopedPreviousGrid(root);
  }

  function target(root, doc = document) {
    if ((root.dataset.targetMode || 'auto') === 'selector') {
      return q(doc, root.dataset.targetSelector || '');
    }

    if (doc === document) return autoTarget(root);

    const localRoots = qa(document, ROOT);
    const remoteRoots = qa(doc, ROOT);
    const localIndex = localRoots.indexOf(root);
    const remoteRoot = root.id
      ? doc.getElementById(root.id)
      : (remoteRoots[localIndex] || remoteRoots[0] || null);

    if (remoteRoot) {
      const found = autoTarget(remoteRoot);
      if (found) return found;
    }

    const localGrids = qa(document, GRID).filter(grid => !grid.closest(ROOT) && grid.children.length);
    const remoteGrids = qa(doc, GRID).filter(grid => !grid.closest(ROOT) && grid.children.length);
    const localTarget = autoTarget(root);
    const gridIndex = localGrids.indexOf(localTarget);

    return gridIndex >= 0 ? (remoteGrids[gridIndex] || null) : null;
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

  function paginationScopes(doc, root) {
    const custom = qa(doc, root.dataset.paginationSelector || '');
    if (custom.length) return custom;

    return qa(doc, '.pagination,.uk-pagination,nav.pagination,ul.pagination,ul.uk-pagination,nav[aria-label*="pagination" i]');
  }

  function isNextLink(link) {
    if (!link) return false;
    if ((link.getAttribute('rel') || '').split(/\s+/).includes('next')) return true;

    const label = norm([
      link.textContent,
      link.getAttribute('aria-label'),
      link.getAttribute('title')
    ].filter(Boolean).join(' '));

    return nextWords.some(word => label.includes(norm(word)));
  }

  function currentStart(base) {
    try {
      return parseInt(new URL(base, location.href).searchParams.get('start') || '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  function nextUrl(doc, root, base) {
    const scopes = paginationScopes(doc, root);
    const links = [];
    scopes.forEach(scope => links.push(...qa(scope, 'a[href]')));

    const selector = root.dataset.nextSelector || '';
    let next = null;

    for (const scope of scopes) {
      next = q(scope, selector);
      if (next) break;
    }

    if (!next) next = links.find(isNextLink) || null;
    if (next) return absoluteUrl(next.getAttribute('href'), base);

    const current = currentStart(base);
    const candidates = [];

    links.forEach(link => {
      const href = absoluteUrl(link.getAttribute('href'), base);
      if (!href) return;

      try {
        const url = new URL(href);
        if (!url.searchParams.has('start')) return;
        const start = parseInt(url.searchParams.get('start') || '', 10);
        if (Number.isFinite(start) && start > current) candidates.push([start, href]);
      } catch {}
    });

    candidates.sort((a, b) => a[0] - b[0]);
    return candidates.length ? candidates[0][1] : null;
  }

  function deriveNext(base, pageSize) {
    if (!pageSize) return null;

    try {
      const url = new URL(base, location.href);
      if (url.pathname.includes('/administrator/')) return null;
      url.searchParams.set('start', String(currentStart(base) + pageSize));
      return url.href;
    } catch {
      return null;
    }
  }

  function primaryHref(item, base) {
    const selectors = [
      'h1 a[href]', 'h2 a[href]', 'h3 a[href]', 'h4 a[href]',
      'h5 a[href]', 'h6 a[href]', '.uk-card-title a[href]',
      '.el-title a[href]', 'a.uk-link-reset[href]'
    ];

    for (const selector of selectors) {
      const link = q(item, selector);
      if (link) return absoluteUrl(link.getAttribute('href'), base);
    }

    const link = q(item, 'a[href]');
    return link ? absoluteUrl(link.getAttribute('href'), base) : null;
  }

  function itemKey(item, base) {
    for (const name of ['data-id', 'data-article-id', 'data-item-id', 'data-product-id']) {
      const value = item.getAttribute?.(name);
      if (value) return `id:${norm(value)}`;
    }

    const href = primaryHref(item, base);
    if (href) {
      try {
        const url = new URL(href);
        return `url:${decodeURIComponent(url.pathname).replace(/\/$/, '').toLowerCase()}`;
      } catch {}
    }

    const title = norm(q(item, 'h1,h2,h3,h4,h5,h6,.uk-card-title,.el-title')?.textContent || '');
    if (title) return `title:${title}`;

    return `text:${norm(item.textContent).slice(0, 300)}`;
  }

  function prepareImported(item) {
    item.classList?.remove('uk-first-column', 'uk-grid-margin');
    return item;
  }

  function setLabel(root, value) {
    const label = q(root, '[data-yt-loadmore-label]');
    if (label) label.textContent = value;
  }

  function setMessage(root, value, error = false) {
    const message = q(root, '[data-yt-loadmore-message]');
    if (!message) return;

    message.textContent = value || '';
    message.classList.toggle('is-error', error);
    message.hidden = !value;
  }

  function defaultText(root, key, fallback) {
    const datasetKey = {
      button: 'defaultButtonText',
      loading: 'defaultLoadingText',
      end: 'defaultEndText',
      error: 'defaultErrorText'
    }[key];

    return String(root.dataset[datasetKey] || fallback).trim();
  }

  function createState(root) {
    const targetElement = target(root);
    const host = itemHost(targetElement, root);
    const localItems = targetElement ? items(targetElement, root) : [];

    if (!targetElement || !host || !localItems.length) return null;

    const seen = new Set(localItems.map(item => itemKey(item, location.href)));

    return {
      host,
      pageSize: localItems.length,
      next: nextUrl(document, root, location.href),
      queue: [],
      visited: new Set(),
      seen,
      loading: false,
      ended: false,
      originalLabel: defaultText(root, 'button', 'Carica altri')
    };
  }

  function stateFor(root) {
    let state = states.get(root);
    const currentTarget = target(root);
    const currentHost = itemHost(currentTarget, root);

    if (!state || !state.host?.isConnected || !currentHost || currentHost !== state.host) {
      state = createState(root);
      if (state) states.set(root, state);
    }

    return state;
  }

  async function fetchPage(root, state) {
    if (!state.next) return;

    const requested = state.next;
    if (state.visited.has(requested)) {
      state.next = null;
      return;
    }

    state.visited.add(requested);

    const response = await fetch(requested, {
      credentials: 'same-origin',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const remoteTarget = target(root, doc);
    if (!remoteTarget) throw new Error('Remote target not found');

    const remoteItems = items(remoteTarget, root);
    let added = 0;

    remoteItems.forEach(item => {
      const key = itemKey(item, requested);
      if (state.seen.has(key)) return;

      state.seen.add(key);
      state.queue.push(prepareImported(document.importNode(item, true)));
      added++;
    });

    const explicit = nextUrl(doc, root, requested);
    if (explicit && !state.visited.has(explicit)) {
      state.next = explicit;
    } else if (remoteItems.length >= state.pageSize && added > 0) {
      state.next = deriveNext(requested, state.pageSize);
    } else {
      state.next = null;
    }
  }

  async function fillQueue(root, state, batch) {
    let guard = 0;

    while (state.queue.length < batch && state.next && guard++ < 10) {
      const before = state.queue.length;
      await fetchPage(root, state);
      if (state.queue.length === before && !state.next) break;
    }
  }

  async function previewLoad(root) {
    if ((root.dataset.mode || 'button') !== 'button') return;

    const state = stateFor(root);
    if (!state || state.loading) return;

    if (state.ended || (!state.next && !state.queue.length)) {
      state.ended = true;
      setLabel(root, defaultText(root, 'end', 'Hai visualizzato tutti gli elementi'));
      return;
    }

    const batch = Math.max(1, parseInt(root.dataset.batchSize || '4', 10) || 4);
    state.loading = true;
    root.classList.add('is-loading');
    root.setAttribute('aria-busy', 'true');
    setMessage(root, '');
    setLabel(root, defaultText(root, 'loading', 'Caricamento…'));

    try {
      await fillQueue(root, state, batch);
      const add = state.queue.splice(0, batch);

      if (!add.length) {
        state.ended = true;
        setLabel(root, defaultText(root, 'end', 'Hai visualizzato tutti gli elementi'));
        return;
      }

      const fragment = document.createDocumentFragment();
      add.forEach(item => fragment.appendChild(item));
      state.host.appendChild(fragment);

      window.requestAnimationFrame(() => {
        try {
          if (window.UIkit && typeof window.UIkit.update === 'function') {
            window.UIkit.update(state.host, 'update');
          }
        } catch {}
      });

      if (!state.queue.length && !state.next) {
        state.ended = true;
        setLabel(root, defaultText(root, 'end', 'Hai visualizzato tutti gli elementi'));
      } else {
        setLabel(root, state.originalLabel);
      }
    } catch (error) {
      console.error('[Load More by xdecaro — Builder preview]', error);
      setMessage(root, defaultText(root, 'error', 'Impossibile caricare altri elementi. Riprova.'), true);
      setLabel(root, state.originalLabel);
    } finally {
      state.loading = false;
      root.classList.remove('is-loading');
      root.setAttribute('aria-busy', 'false');
    }
  }

  document.addEventListener('click', event => {
    const button = event.target?.closest?.('[data-yt-loadmore-button]');
    if (!button) return;

    const root = button.closest(ROOT);
    if (!root || (root.dataset.mode || 'button') !== 'button') return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    previewLoad(root);
  }, true);
})();
