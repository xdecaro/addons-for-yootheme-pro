(() => {
  'use strict';

  const ROOT = '[data-x-pagination]';
  const GRID = '.uk-grid,[uk-grid],[data-uk-grid]';
  const states = new WeakMap();
  const targetHints = new WeakMap();
  const sourceVisibilityStates = new WeakMap();
  const ownedSources = new WeakMap();
  const animationBase = new WeakMap();
  const selfMutating = new WeakSet();
  const pendingRoots = new Set();
  let pendingFrame = 0;
  let discoveryObserver = null;
  let activeHistoryRoot = null;

  const nextWords = [
    'next', 'next page', 'suivant', 'suivante', 'page suivante', 'successiva',
    'successivo', 'pagina successiva', 'avanti', 'volgende', 'weiter', 'nächste',
    'naechste', 'próxima', 'proxima', 'seguinte', 'siguiente'
  ];

  const previousWords = [
    'previous', 'previous page', 'prev', 'précédent', 'precedent', 'précédente',
    'precedente', 'indietro', 'vorige', 'zurück', 'zuruck', 'anterior'
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
      if (!href || href === '#') return null;
      const url = new URL(href, base);
      return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === location.origin
        ? url.href
        : null;
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

  function mutateRoot(root, callback) {
    if (!root) return;
    selfMutating.add(root);
    try {
      callback();
    } finally {
      window.setTimeout(() => selfMutating.delete(root), 0);
    }
  }

  function candidateGrids(doc) {
    return qa(doc, GRID).filter(grid => !grid.closest(ROOT) && grid.children.length > 0);
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

  function autoTarget(root) {
    return directPreviousGrid(root) || scopedPreviousGrid(root);
  }

  function rememberTarget(root, target) {
    if (!root || !target || root.ownerDocument !== document) return;
    const grids = candidateGrids(document);
    const index = grids.indexOf(target);
    if (index >= 0) targetHints.set(root, { index });
  }

  function matchingRoot(root, doc) {
    if (doc === document) return root;

    if (root.id) {
      const localMatches = qa(document, ROOT).filter(candidate => candidate.id === root.id);
      const remoteMatches = qa(doc, ROOT).filter(candidate => candidate.id === root.id);
      if (localMatches.length === 1 && remoteMatches.length === 1) return remoteMatches[0];
    }

    const localRoots = qa(document, ROOT);
    const remoteRoots = qa(doc, ROOT);
    const index = localRoots.indexOf(root);
    return remoteRoots[index] || remoteRoots[0] || null;
  }

  function target(root, doc = document) {
    if (!root) return null;

    if ((root.dataset.targetMode || 'auto') === 'selector') {
      return q(doc, root.dataset.targetSelector || '');
    }

    if (doc === document) {
      const found = autoTarget(root);
      if (found) rememberTarget(root, found);
      return found;
    }

    const remoteRoot = matchingRoot(root, doc);
    if (remoteRoot) {
      const found = autoTarget(remoteRoot);
      if (found) return found;
    }

    const hint = targetHints.get(root);
    if (hint && Number.isInteger(hint.index)) {
      const grids = candidateGrids(doc);
      if (grids[hint.index]) return grids[hint.index];
    }

    return null;
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
    const selector = root.dataset.paginationSelector || '';
    const custom = selector ? qa(doc, selector) : [];
    const fallback = qa(doc, '.uk-pagination,.pagination,nav[aria-label*="pagination" i],nav[aria-label*="pagin" i]');
    const unique = [...new Set(custom.length ? custom : fallback)];

    return unique.filter(scope => !scope.closest(ROOT));
  }

  function structuralDistance(a, b) {
    if (!a || !b) return 100;
    const ancestors = new Map();
    let node = a;
    let distance = 0;
    while (node) {
      ancestors.set(node, distance++);
      node = node.parentElement;
    }
    node = b;
    distance = 0;
    while (node) {
      if (ancestors.has(node)) return distance + ancestors.get(node);
      distance++;
      node = node.parentElement;
    }
    return 100;
  }

  function scopeScore(scope, root, doc) {
    const links = qa(scope, 'a[href]');
    const numeric = links.filter(link => /^\d+$/.test(norm(link.textContent))).length;
    const directional = links.filter(link => direction(link)).length;
    const remoteRoot = matchingRoot(root, doc);
    const targetElement = target(root, doc);
    const reference = targetElement || remoteRoot;
    const distance = structuralDistance(scope, reference);
    const between = targetElement && remoteRoot && isBefore(targetElement, scope) && isBefore(scope, remoteRoot);
    const sameParent = reference && scope.parentElement === reference.parentElement;

    return numeric * 10 + directional * 3 + links.length +
      Math.max(0, 1000 - distance * 75) +
      (between ? 400 : 0) +
      (sameParent ? 250 : 0);
  }

  function bestPaginationScope(doc, root) {
    return paginationScopes(doc, root)
      .map(scope => [scope, scopeScore(scope, root, doc)])
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }

  function direction(link) {
    if (!link) return null;

    const rel = norm(link.getAttribute('rel')).split(' ');
    if (rel.includes('next')) return 'next';
    if (rel.includes('prev') || rel.includes('previous')) return 'previous';

    const classes = norm(link.className + ' ' + (link.parentElement?.className || ''));
    if (/\b(next|pagination-next)\b/.test(classes)) return 'next';
    if (/\b(prev|previous|pagination-previous|pagination-prev)\b/.test(classes)) return 'previous';

    const label = norm([
      link.textContent,
      link.getAttribute('aria-label'),
      link.getAttribute('title')
    ].filter(Boolean).join(' '));

    if (nextWords.some(word => label.includes(norm(word)))) return 'next';
    if (previousWords.some(word => label.includes(norm(word)))) return 'previous';
    return null;
  }

  function currentStart(base) {
    try {
      const url = new URL(base, location.href);
      return parseInt(url.searchParams.get('start') || '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  function derivePageUrl(base, page, pageSize) {
    if (!pageSize || page < 1) return null;

    try {
      const url = new URL(base, location.href);
      if (url.pathname.includes('/administrator/')) return null;

      if (page <= 1) {
        url.searchParams.delete('start');
      } else {
        url.searchParams.set('start', String((page - 1) * pageSize));
      }

      return url.href;
    } catch {
      return null;
    }
  }

  function deriveNext(base, pageSize) {
    if (!pageSize) return null;
    try {
      const current = Math.floor(currentStart(base) / pageSize) + 1;
      return derivePageUrl(base, current + 1, pageSize);
    } catch {
      return null;
    }
  }

  function activePageFromScope(scope) {
    if (!scope) return null;

    const active = q(scope, '[aria-current="page"],.uk-active,.active');
    if (!active) return null;

    const match = norm(active.textContent).match(/\b(\d+)\b/);
    return match ? parseInt(match[1], 10) : null;
  }

  function navigationModel(doc, root, base, pageSize) {
    const scope = bestPaginationScope(doc, root);
    const links = scope ? qa(scope, 'a[href]') : [];
    const pages = new Map();

    links.forEach(link => {
      const text = norm(link.textContent);
      if (!/^\d+$/.test(text)) return;
      const page = parseInt(text, 10);
      const href = absoluteUrl(link.getAttribute('href'), base);
      if (page > 0 && href) pages.set(page, href);
    });

    let current = activePageFromScope(scope);
    if (!current || current < 1) {
      current = Math.floor(currentStart(base) / Math.max(1, pageSize)) + 1;
    }

    pages.set(current, absoluteUrl(base, location.href) || location.href);

    const previousLink = links.find(link => direction(link) === 'previous');
    const nextLink = links.find(link => direction(link) === 'next');
    let previous = previousLink ? absoluteUrl(previousLink.getAttribute('href'), base) : null;
    let next = nextLink ? absoluteUrl(nextLink.getAttribute('href'), base) : null;

    if (!previous && current > 1) previous = pages.get(current - 1) || derivePageUrl(base, current - 1, pageSize);
    if (!next) next = pages.get(current + 1) || null;

    let total = Math.max(current, ...pages.keys());
    if (next && total <= current) total = current + 1;

    return {
      scope,
      pages,
      current,
      total,
      previous,
      next,
      currentUrl: absoluteUrl(base, location.href) || location.href
    };
  }

  function primaryLink(item, base) {
    const selectors = [
      'h1 a[href]', 'h2 a[href]', 'h3 a[href]', 'h4 a[href]', 'h5 a[href]', 'h6 a[href]',
      '.uk-card-title a[href]', '.el-title a[href]', 'a.uk-link-reset[href]'
    ];

    for (const selector of selectors) {
      const link = q(item, selector);
      if (link) return link;
    }

    return qa(item, 'a[href]')[0] || null;
  }

  function itemKeys(item, base) {
    const output = [];

    for (const name of ['data-id', 'data-article-id', 'data-item-id', 'data-product-id']) {
      const value = item.getAttribute?.(name);
      if (value) output.push(`id:${norm(value)}`);
    }

    const link = primaryLink(item, base);
    if (link) {
      try {
        const url = new URL(absoluteUrl(link.getAttribute('href'), base));
        const path = decodeURIComponent(url.pathname)
          .replace(/\/index\.php(?=\/|$)/i, '')
          .replace(/\/{2,}/g, '/')
          .replace(/\/$/, '')
          .toLowerCase();
        const last = (path.split('/').filter(Boolean).at(-1) || '').replace(/^\d+[-_:]/, '');
        if (path) output.push(`path:${path}`);
        if (last.length > 2) output.push(`slug:${last}`);
      } catch {}
    }

    const title = norm(q(item, 'h1,h2,h3,h4,h5,h6,.uk-card-title,.el-title')?.textContent || '');
    const imageElement = q(item, 'img[src],img[data-src]');
    let image = '';

    if (imageElement) {
      try {
        image = decodeURIComponent(new URL(
          imageElement.getAttribute('src') || imageElement.getAttribute('data-src'),
          base
        ).pathname.split('/').filter(Boolean).pop() || '').toLowerCase();
      } catch {}
    }

    if (title && image) output.push(`title-image:${title}|${image}`);

    if (!output.length) {
      const text = norm(item.textContent).slice(0, 500);
      if (text) output.push(`text:${text}`);
    }

    return output;
  }

  function createSeen(list, base) {
    const seen = new Set();
    list.forEach(item => itemKeys(item, base).forEach(key => seen.add(key)));
    return seen;
  }

  function isDuplicate(item, base, seen) {
    const keys = itemKeys(item, base);
    if (keys.some(key => seen.has(key))) return true;
    keys.forEach(key => seen.add(key));
    return false;
  }

  function prepareImported(item) {
    item.classList?.remove('uk-first-column', 'uk-grid-margin');
    return item;
  }

  function customText(root, key, fallback) {
    const datasetKey = {
      loadmore: 'loadmoreText',
      previous: 'previousText',
      next: 'nextText',
      loading: 'loadingText',
      end: 'endText',
      error: 'errorText'
    }[key];

    const defaultKey = {
      loadmore: 'defaultLoadmoreText',
      previous: 'defaultPreviousText',
      next: 'defaultNextText',
      loading: 'defaultLoadingText',
      end: 'defaultEndText',
      error: 'defaultErrorText'
    }[key];

    const custom = String(root.dataset[datasetKey] || '').trim();
    return custom || String(root.dataset[defaultKey] || fallback).trim() || fallback;
  }

  function iconCharacter(root, directionName = 'next') {
    const icon = root.dataset.icon || 'arrow';
    if (icon === 'none') return '';
    if (icon === 'plus') {
      return (root.dataset.mode || 'loadmore') === 'loadmore'
        ? '+'
        : (directionName === 'previous' ? '‹' : '›');
    }
    if (icon === 'chevron') return directionName === 'previous' ? '‹' : '›';
    return directionName === 'previous' ? '←' : '→';
  }

  function controlClasses(root, extra = '') {
    const classes = ['x-pagination__control'];
    const style = root.dataset.controlStyle || 'text';
    const size = root.dataset.controlSize || '';

    if (style === 'custom') {
      classes.push('x-pagination__control--custom');
    } else {
      classes.push('uk-button', `uk-button-${style || 'default'}`);
    }

    if (size) classes.push(`uk-button-${size}`);
    if (extra) classes.push(extra);
    return classes.join(' ');
  }

  function makeIcon(root, directionName) {
    const value = iconCharacter(root, directionName);
    if (!value) return null;

    const icon = document.createElement('span');
    icon.className = 'x-pagination__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = value;
    return icon;
  }

  function makeButton(root, label, url, options = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = controlClasses(root, options.className || '');

    if (url) button.dataset.xPaginationUrl = url;
    if (options.page) button.dataset.page = String(options.page);
    if (options.current) {
      button.setAttribute('aria-current', 'page');
      button.classList.add('is-active');
    }

    if (options.disabled || options.current || !url) {
      button.disabled = true;
      button.dataset.permanentDisabled = '1';
    }

    const icon = options.direction ? makeIcon(root, options.direction) : null;
    const iconLeft = root.dataset.iconPosition === 'left' || options.direction === 'previous';

    if (icon && iconLeft) button.appendChild(icon);

    const text = document.createElement('span');
    text.textContent = label;
    button.appendChild(text);

    if (icon && !iconLeft) button.appendChild(icon);
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

  function pageUrl(model, page, pageSize) {
    return model.pages.get(page) || derivePageUrl(model.currentUrl, page, pageSize);
  }

  function renderNavigation(root, state) {
    const nav = q(root, '[data-x-pagination-nav]');
    if (!nav) return;

    mutateRoot(root, () => {
      nav.replaceChildren();
      const list = document.createElement('div');
      list.className = 'x-pagination__list';
      const mode = root.dataset.mode || 'numeric';
      const model = state.navigation;

      if (mode === 'prevnext' || mode === 'full') {
        list.appendChild(makeButton(
          root,
          customText(root, 'previous', 'Precedente'),
          model.previous,
          { direction: 'previous', disabled: !model.previous, className: 'x-pagination__direction' }
        ));
      }

      if (mode === 'numeric' || mode === 'full') {
        compactPages(model.current, Math.max(1, model.total)).forEach(page => {
          if (page === 'ellipsis') {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'x-pagination__ellipsis';
            ellipsis.textContent = '…';
            ellipsis.setAttribute('aria-hidden', 'true');
            list.appendChild(ellipsis);
            return;
          }

          list.appendChild(makeButton(
            root,
            String(page),
            pageUrl(model, page, state.pageSize),
            {
              page,
              current: page === model.current,
              className: 'x-pagination__page'
            }
          ));
        });
      }

      if (mode === 'prevnext' || mode === 'full') {
        list.appendChild(makeButton(
          root,
          customText(root, 'next', 'Successivo'),
          model.next,
          { direction: 'next', disabled: !model.next, className: 'x-pagination__direction' }
        ));
      }

      nav.appendChild(list);
      nav.hidden = false;
    });
  }

  function setMessage(root, value, error = false) {
    const message = q(root, '[data-x-pagination-message]');
    if (!message) return;

    mutateRoot(root, () => {
      message.textContent = value || '';
      message.classList.toggle('is-error', error);
      message.setAttribute('role', error ? 'alert' : 'status');
      message.hidden = !value;
    });
  }

  function setLabel(root, value) {
    const label = q(root, '[data-x-pagination-label]');
    if (label) mutateRoot(root, () => { label.textContent = value; });
  }

  function setBusy(root, busy) {
    mutateRoot(root, () => {
      root.classList.toggle('is-loading', busy);
      root.setAttribute('aria-busy', busy ? 'true' : 'false');

      qa(root, 'button').forEach(button => {
        button.disabled = busy || button.dataset.permanentDisabled === '1';
      });

      const loading = q(root, '[data-x-pagination-loading]');
      if (loading) loading.hidden = !busy;
    });
  }

  function setReady(root) {
    mutateRoot(root, () => {
      root.classList.remove('is-finished');
      root.classList.add('is-ready');
      if (isBuilder()) root.classList.add('is-builder-preview');

      const button = q(root, '[data-x-pagination-loadmore]');
      const sentinel = q(root, '[data-x-pagination-sentinel]');
      const nav = q(root, '[data-x-pagination-nav]');
      if (button) button.hidden = false;
      if (sentinel) sentinel.hidden = false;
      if (nav) nav.hidden = false;
    });
  }

  function finish(root, state, showMessage = true) {
    state?.observer?.disconnect();
    if (state) {
      state.observer = null;
      if (state.fallbackHandler) {
        window.removeEventListener('scroll', state.fallbackHandler);
        window.removeEventListener('resize', state.fallbackHandler);
        state.fallbackHandler = null;
      }
    }

    mutateRoot(root, () => {
      root.classList.add('is-finished');
      root.classList.remove('is-ready');
      const button = q(root, '[data-x-pagination-loadmore]');
      const sentinel = q(root, '[data-x-pagination-sentinel]');
      const loading = q(root, '[data-x-pagination-loading]');
      if (button) button.hidden = true;
      if (sentinel) sentinel.hidden = true;
      if (loading) loading.hidden = true;
    });

    setMessage(
      root,
      showMessage && root.dataset.showEndMessage === '1'
        ? customText(root, 'end', 'Hai visualizzato tutti gli elementi')
        : ''
    );
  }

  function releaseSource(root) {
    const scope = ownedSources.get(root);
    if (!scope) return;

    const visibility = sourceVisibilityStates.get(scope);
    visibility?.owners.delete(root);
    if (visibility && visibility.owners.size === 0) {
      scope.hidden = visibility.originalHidden;
      sourceVisibilityStates.delete(scope);
    }
    ownedSources.delete(root);
  }

  function sourceVisibility(root, hide, scope = null) {
    const previous = ownedSources.get(root);
    if (previous && (!hide || previous !== scope)) releaseSource(root);
    if (!hide || !scope) return;

    let visibility = sourceVisibilityStates.get(scope);
    if (!visibility) {
      visibility = { originalHidden: scope.hidden, owners: new Set() };
      sourceVisibilityStates.set(scope, visibility);
    }
    visibility.owners.add(root);
    ownedSources.set(root, scope);
    scope.hidden = true;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    } catch {
      return false;
    }
  }

  function animationSpec(mode) {
    if (!mode || mode === 'none' || prefersReducedMotion()) return null;

    const slide = mode === 'slide';
    const canTranslate = slide && !!window.CSS && typeof window.CSS.supports === 'function' &&
      window.CSS.supports('translate', '0 1px');

    return {
      canTranslate,
      duration: slide ? 400 : 350,
      frames: slide && canTranslate
        ? [{ opacity: 0, translate: '0 16px' }, { opacity: 1, translate: '0 0' }]
        : [{ opacity: 0 }, { opacity: 1 }],
      fallbackMode: slide ? 'slide' : 'fade',
    };
  }

  function primeAnimation(list, mode) {
    const spec = animationSpec(mode);
    if (!spec) return null;

    list.forEach(item => {
      if (!item) return;
      if (!animationBase.has(item)) {
        animationBase.set(item, {
          opacity: item.style.getPropertyValue('opacity'),
          opacityPriority: item.style.getPropertyPriority('opacity'),
          translate: item.style.getPropertyValue('translate'),
          translatePriority: item.style.getPropertyPriority('translate'),
        });
      }
      item.style.setProperty('opacity', '0');
      if (spec.canTranslate) item.style.setProperty('translate', '0 16px');
    });

    return spec;
  }

  function restoreAnimationBase(item) {
    const original = animationBase.get(item);
    if (!original) return;

    if (original.opacity) item.style.setProperty('opacity', original.opacity, original.opacityPriority || '');
    else item.style.removeProperty('opacity');

    if (original.translate) item.style.setProperty('translate', original.translate, original.translatePriority || '');
    else item.style.removeProperty('translate');

    animationBase.delete(item);
  }

  function updateUi(targetElement, afterUpdate = null) {
    window.requestAnimationFrame(() => {
      try {
        if (window.UIkit && typeof window.UIkit.update === 'function') {
          window.UIkit.update(targetElement, 'update');
        }
      } catch {}

      if (typeof afterUpdate === 'function') {
        window.requestAnimationFrame(afterUpdate);
      }
    });
  }

  function animate(list, mode, spec = animationSpec(mode)) {
    if (!spec) return;

    list.forEach(item => {
      if (!item) return;

      if (!item.isConnected) {
        restoreAnimationBase(item);
        return;
      }

      if (typeof item.animate === 'function') {
        try {
          const animation = item.animate(spec.frames, {
            duration: spec.duration,
            easing: 'ease',
            fill: 'none',
          });
          restoreAnimationBase(item);
          animation.finished.catch(() => {});
          return;
        } catch {}
      }

      restoreAnimationBase(item);
      item.classList.add(`x-pagination-new--${spec.fallbackMode}`);
      item.addEventListener('animationend', () => {
        item.classList.remove(`x-pagination-new--${spec.fallbackMode}`);
      }, { once: true });
    });
  }

  function stateIsCurrent(root, state) {
    return !!root?.isConnected && states.get(root) === state && !state.controller?.signal.aborted;
  }

  function abortError() {
    return new DOMException('Pagination lifecycle changed', 'AbortError');
  }

  function isAbortError(error) {
    return error?.name === 'AbortError';
  }

  async function fetchDocument(url, signal = undefined) {
    const safeUrl = absoluteUrl(url);
    if (!safeUrl) throw new Error('Unsafe or cross-origin pagination URL');

    const response = await fetch(safeUrl, {
      credentials: 'same-origin',
      redirect: 'follow',
      signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (response.url && !absoluteUrl(response.url)) throw new Error('Cross-origin pagination redirect');
    return new DOMParser().parseFromString(await response.text(), 'text/html');
  }

  async function probeNext(root, targetElement, pageSize, state) {
    if (!targetElement || pageSize < 1) return null;
    const candidate = deriveNext(location.href, pageSize);
    if (!candidate) return null;

    try {
      const doc = await fetchDocument(candidate, state.controller?.signal);
      if (!stateIsCurrent(root, state)) throw abortError();
      const remoteTarget = target(root, doc);
      if (!remoteTarget) return null;

      const remoteItems = items(remoteTarget, root);
      if (!remoteItems.length) return null;

      const seen = createSeen(items(targetElement, root), location.href);
      for (const item of remoteItems) {
        const keys = itemKeys(item, candidate);
        if (keys.length && !keys.some(key => seen.has(key))) return candidate;
      }
    } catch (error) {
      if (isAbortError(error)) return null;
      console.debug('[Pagination by xdecaro] Silent next-page probe failed', error);
    }

    return null;
  }

  async function fetchMorePage(root, state) {
    if (!state.next) return;

    const requested = state.next;
    if (state.visited.has(requested)) {
      state.next = null;
      return;
    }

    const doc = await fetchDocument(requested, state.controller?.signal);
    if (!stateIsCurrent(root, state)) throw abortError();
    const remoteTarget = target(root, doc);
    if (!remoteTarget) throw new Error('Remote target not found');

    const remoteItems = items(remoteTarget, root);
    state.visited.add(requested);
    let added = 0;

    remoteItems.forEach(item => {
      if (isDuplicate(item, requested, state.seen)) return;
      state.queue.push(prepareImported(document.importNode(item, true)));
      added++;
    });

    const navigation = navigationModel(doc, root, requested, state.pageSize);
    if (navigation.next && !state.visited.has(navigation.next)) {
      state.next = navigation.next;
    } else if (remoteItems.length >= state.pageSize && added > 0) {
      state.next = deriveNext(requested, state.pageSize);
    } else {
      state.next = null;
    }

    state.currentUrl = requested;
  }

  async function fillQueue(root, state, batch) {
    let guard = 0;

    while (state.queue.length < batch && state.next && guard++ < 10) {
      const before = state.queue.length;
      await fetchMorePage(root, state);
      if (!stateIsCurrent(root, state)) throw abortError();
      if (state.queue.length === before && !state.next) break;
    }
  }

  async function loadMore(root) {
    const state = states.get(root);
    if (!state || state.loading || root.classList.contains('is-finished')) return;

    const batch = Math.max(1, parseInt(root.dataset.batchSize || '4', 10) || 4);
    state.loading = true;
    setMessage(root, '');
    setBusy(root, true);
    setLabel(root, customText(root, 'loading', 'Caricamento…'));

    try {
      await fillQueue(root, state, batch);
      if (!stateIsCurrent(root, state)) throw abortError();
      const add = state.queue.splice(0, batch);

      if (!add.length) {
        finish(root, state, true);
        return;
      }

      const fragment = document.createDocumentFragment();
      add.forEach(item => fragment.appendChild(item));
      state.host.appendChild(fragment);
      const animationMode = root.dataset.animation || 'fade';
      const animation = primeAnimation(add, animationMode);
      updateUi(state.host, animation ? () => animate(add, animationMode, animation) : null);

      if (!isBuilder()) {
        document.dispatchEvent(new CustomEvent('xdecaro:pagination:loaded', {
          detail: { root, target: state.host, items: add, url: state.currentUrl, mode: root.dataset.mode }
        }));
      }

      if (root.dataset.updateUrl === '1' && state.currentUrl && !isBuilder()) {
        try {
          history.replaceState({ ...(history.state || {}), xPaginationId: root.id }, '', state.currentUrl);
        } catch {}
      }

      if (!state.queue.length && !state.next) {
        finish(root, state, true);
      }
    } catch (error) {
      if (isAbortError(error)) return;
      console.error('[Pagination by xdecaro]', error);
      setMessage(root, customText(root, 'error', 'Impossibile caricare la pagina richiesta. Riprova.'), true);
    } finally {
      if (!stateIsCurrent(root, state)) return;
      state.loading = false;
      setBusy(root, false);
      if (!root.classList.contains('is-finished')) {
        setLabel(root, customText(root, 'loadmore', 'Carica altri'));
        if (state.fallbackHandler) window.setTimeout(state.fallbackHandler, 100);
      }
    }
  }

  async function replacePage(root, url, options = {}) {
    const state = states.get(root);
    if (!state || state.loading || !url) return;

    state.loading = true;
    setMessage(root, '');
    setBusy(root, true);

    try {
      const safeUrl = absoluteUrl(url);
      if (!safeUrl) throw new Error('Unsafe or cross-origin pagination URL');
      const doc = await fetchDocument(safeUrl, state.controller?.signal);
      if (!stateIsCurrent(root, state)) throw abortError();
      const remoteTarget = target(root, doc);
      if (!remoteTarget) throw new Error('Remote target not found');

      const remoteItems = items(remoteTarget, root);
      if (!remoteItems.length) throw new Error('Remote page contains no matching items');

      const imported = remoteItems.map(item => prepareImported(document.importNode(item, true)));
      const fragment = document.createDocumentFragment();
      imported.forEach(item => fragment.appendChild(item));
      state.host.replaceChildren(fragment);

      state.currentUrl = safeUrl;
      state.navigation = navigationModel(doc, root, safeUrl, state.pageSize);
      renderNavigation(root, state);
      sourceVisibility(root, root.dataset.hidePagination === '1', state.sourceScope);
      updateUi(state.host);

      if (options.updateHistory !== false && root.dataset.updateUrl === '1' && !isBuilder()) {
        try {
          activeHistoryRoot = root;
          history.pushState({ xPaginationId: root.id }, '', safeUrl);
        } catch {}
      }

      if (options.scroll !== false && root.dataset.scrollTop === '1' && !isBuilder()) {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        state.target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }

      if (!isBuilder()) {
        document.dispatchEvent(new CustomEvent('xdecaro:pagination:loaded', {
          detail: { root, target: state.host, items: imported, url: safeUrl, mode: root.dataset.mode }
        }));
      }
      if (options.focus !== false) q(root, '[data-x-pagination-nav]')?.focus({ preventScroll: true });
    } catch (error) {
      if (isAbortError(error)) return;
      console.error('[Pagination by xdecaro]', error);
      setMessage(root, customText(root, 'error', 'Impossibile caricare la pagina richiesta. Riprova.'), true);
    } finally {
      if (!stateIsCurrent(root, state)) return;
      state.loading = false;
      setBusy(root, false);
    }
  }

  function setupInfinite(root, state) {
    if (isBuilder() || !state.next) return;

    const sentinel = q(root, '[data-x-pagination-sentinel]');
    if (!sentinel) return;

    const distance = Math.max(0, parseInt(root.dataset.threshold || '500', 10) || 500);
    if (!('IntersectionObserver' in window)) {
      let frame = 0;
      state.fallbackHandler = () => {
        if (frame || !stateIsCurrent(root, state)) return;
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          const rect = sentinel.getBoundingClientRect();
          const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
          if (rect.top <= viewportHeight + distance && rect.bottom >= -distance) loadMore(root);
        });
      };
      window.addEventListener('scroll', state.fallbackHandler, { passive: true });
      window.addEventListener('resize', state.fallbackHandler, { passive: true });
      state.fallbackHandler();
      return;
    }

    state.observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadMore(root);
    }, { rootMargin: `0px 0px ${distance}px 0px` });

    state.observer.observe(sentinel);
  }

  function teardownState(root, state) {
    if (!state) return;
    state.observer?.disconnect();
    state.controller?.abort();
    if (state.fallbackHandler) {
      window.removeEventListener('scroll', state.fallbackHandler);
      window.removeEventListener('resize', state.fallbackHandler);
    }
    releaseSource(root);
  }

  function builderFallback(root) {
    const mode = root.dataset.mode || 'loadmore';
    mutateRoot(root, () => {
      root.classList.add('is-builder-preview', 'is-ready');
      root.classList.remove('is-finished');
      const button = q(root, '[data-x-pagination-loadmore]');
      const sentinel = q(root, '[data-x-pagination-sentinel]');
      const nav = q(root, '[data-x-pagination-nav]');
      if (button) button.hidden = false;
      if (sentinel) sentinel.hidden = false;
      if (nav) nav.hidden = false;
    });

    if (mode === 'numeric' || mode === 'prevnext' || mode === 'full') {
      const state = {
        target: null,
        host: null,
        pageSize: 1,
        navigation: {
          scope: null,
          pages: new Map([[1, location.href]]),
          current: 1,
          total: mode === 'numeric' || mode === 'full' ? 3 : 1,
          previous: null,
          next: mode === 'prevnext' || mode === 'full' ? location.href : null,
          currentUrl: location.href
        }
      };
      states.set(root, state);
      renderNavigation(root, state);
    }
  }

  async function init(root, force = false) {
    if (!root || !root.isConnected) return;

    if (!force && states.has(root)) return;

    const previousState = states.get(root);
    teardownState(root, previousState);

    const targetElement = target(root);
    const list = targetElement ? items(targetElement, root) : [];

    if (!targetElement || !list.length) {
      states.delete(root);
      if (isBuilder()) builderFallback(root);
      else mutateRoot(root, () => root.classList.remove('is-ready'));
      return;
    }

    const host = itemHost(targetElement, root);
    if (!host) {
      states.delete(root);
      return;
    }

    const pageSize = list.length;
    const navigation = navigationModel(document, root, location.href, pageSize);
    const state = {
      target: targetElement,
      host,
      pageSize,
      navigation,
      sourceScope: navigation.scope,
      currentUrl: location.href,
      next: navigation.next,
      queue: [],
      visited: new Set(),
      seen: createSeen(list, location.href),
      loading: false,
      observer: null,
      fallbackHandler: null,
      controller: 'AbortController' in window ? new AbortController() : null
    };

    states.set(root, state);

    if ((root.dataset.mode || 'loadmore') === 'loadmore' || root.dataset.mode === 'infinite') {
      if (!state.next) state.next = await probeNext(root, targetElement, pageSize, state);
      if (!stateIsCurrent(root, state)) return;

      if (!state.next && !isBuilder()) {
        sourceVisibility(root, root.dataset.hidePagination === '1', navigation.scope);
        finish(root, state, false);
        return;
      }

      setReady(root);
      sourceVisibility(root, root.dataset.hidePagination === '1', navigation.scope);
      if (root.dataset.mode === 'infinite') setupInfinite(root, state);
      return;
    }

    if (!navigation.previous && !navigation.next && navigation.total <= 1 && !isBuilder()) {
      sourceVisibility(root, root.dataset.hidePagination === '1', navigation.scope);
      mutateRoot(root, () => root.classList.remove('is-ready'));
      return;
    }

    setReady(root);
    renderNavigation(root, state);
    sourceVisibility(root, root.dataset.hidePagination === '1', navigation.scope);
  }

  function queueInit(root) {
    if (!root || !root.isConnected || selfMutating.has(root)) return;
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
    qa(document, ROOT).forEach(root => {
      if (force) queueInit(root);
      else init(root);
    });
  }

  function discoverFromNode(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;

    if (node.matches?.(ROOT)) queueInit(node);
    qa(node, ROOT).forEach(queueInit);

    const containingRoot = node.closest?.(ROOT);
    if (containingRoot && !selfMutating.has(containingRoot)) queueInit(containingRoot);
  }

  function startDiscoveryObserver() {
    if (discoveryObserver || !('MutationObserver' in window)) return;

    const targetNode = document.body || document.documentElement;
    if (!targetNode) return;

    discoveryObserver = new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'attributes') {
          const root = record.target.matches?.(ROOT) ? record.target : record.target.closest?.(ROOT);
          if (root && !selfMutating.has(root)) queueInit(root);
          return;
        }

        Array.from(record.addedNodes).forEach(discoverFromNode);
        Array.from(record.removedNodes).forEach(node => {
          if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
          const removedRoots = [node.matches?.(ROOT) ? node : null, ...qa(node, ROOT)].filter(Boolean);
          window.requestAnimationFrame(() => removedRoots.forEach(root => {
            if (root.isConnected) return;
            teardownState(root, states.get(root));
            states.delete(root);
          }));
        });
      });
    });

    const options = {
      childList: true,
      subtree: true,
    };
    if (isBuilder()) {
      options.attributes = true;
      options.attributeFilter = [
        'class', 'hidden', 'disabled', 'data-mode', 'data-target-mode', 'data-target-selector',
        'data-item-selector', 'data-pagination-selector', 'data-batch-size', 'data-threshold',
        'data-animation', 'data-hide-pagination', 'data-update-url', 'data-scroll-top',
        'data-show-end-message', 'data-control-style', 'data-control-size', 'data-control-width',
        'data-icon', 'data-icon-position', 'data-loadmore-text', 'data-previous-text',
        'data-next-text', 'data-loading-text', 'data-end-text', 'data-error-text'
      ];
    }
    discoveryObserver.observe(targetNode, options);
  }

  document.addEventListener('click', event => {
    const loadButton = event.target?.closest?.('[data-x-pagination-loadmore]');
    if (loadButton) {
      const root = loadButton.closest(ROOT);
      if (!root) return;
      event.preventDefault();
      if (isBuilder()) {
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
      loadMore(root);
      return;
    }

    const navigationButton = event.target?.closest?.('[data-x-pagination-url]');
    if (!navigationButton || navigationButton.disabled) return;

    const root = navigationButton.closest(ROOT);
    if (!root) return;

    event.preventDefault();
    if (isBuilder()) {
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    replacePage(root, navigationButton.dataset.xPaginationUrl);
  }, true);

  window.addEventListener('popstate', event => {
    if (isBuilder()) return;
    const id = event.state?.xPaginationId || activeHistoryRoot?.id;
    const root = id ? qa(document, ROOT).find(candidate => candidate.id === id) : null;
    const state = root ? states.get(root) : null;
    const mode = root?.dataset.mode || '';
    if (!root || !state || !['numeric', 'prevnext', 'full'].includes(mode)) return;
    const url = absoluteUrl(location.href);
    if (!url || url === state.currentUrl) return;
    activeHistoryRoot = root;
    replacePage(root, url, { updateHistory: false, scroll: false, focus: false });
  });

  document.addEventListener('yootheme:builder:render', () => boot(true));

  function start() {
    boot();
    startDiscoveryObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
