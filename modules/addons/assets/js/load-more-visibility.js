(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';
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

  function isBuilder() {
    try {
      const url = new URL(location.href);
      return url.searchParams.get('p') === 'customizer' ||
        (url.pathname.includes('/administrator/') && url.searchParams.get('option') === 'com_ajax');
    } catch {
      return false;
    }
  }

  function autoTarget(root) {
    let node = root.previousElementSibling;

    while (node) {
      if (node.matches?.('.uk-grid,[uk-grid],[data-uk-grid]')) return node;

      const grid = q(node, '.uk-grid,[uk-grid],[data-uk-grid]');
      if (grid) return grid;

      node = node.previousElementSibling;
    }

    return null;
  }

  function target(root) {
    if ((root.dataset.targetMode || 'auto') === 'selector') {
      return q(document, root.dataset.targetSelector || '');
    }

    return autoTarget(root);
  }

  function itemHost(targetNode, root) {
    if (!targetNode) return null;

    const selector = root.dataset.itemSelector || ':scope > *';
    if (selector !== ':scope > *') return targetNode;

    const direct = qa(targetNode, ':scope > *').filter(item => !item.matches(ROOT));
    if (direct.length === 1) {
      const only = direct[0];
      if (only.matches?.('.uk-grid,[uk-grid],[data-uk-grid]') && only.children.length) {
        return only;
      }
    }

    return targetNode;
  }

  function items(targetNode, root) {
    const host = itemHost(targetNode, root);
    if (!host) return [];

    return qa(host, root.dataset.itemSelector || ':scope > *')
      .filter(item => !item.matches(ROOT));
  }

  function paginationScopes(root) {
    const custom = qa(document, root.dataset.paginationSelector || '');
    if (custom.length) return custom;

    return qa(document, '.pagination,.uk-pagination,nav.pagination,ul.pagination,ul.uk-pagination,nav[aria-label*="pagination" i]');
  }

  function isNext(link) {
    if (!link) return false;

    if ((link.getAttribute('rel') || '').split(/\s+/).includes('next')) return true;

    const label = norm([
      link.textContent,
      link.getAttribute('aria-label'),
      link.getAttribute('title')
    ].filter(Boolean).join(' '));

    return nextWords.some(word => label.includes(norm(word)));
  }

  function currentStart() {
    try {
      return parseInt(new URL(location.href).searchParams.get('start') || '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  function hasNext(root) {
    const scopes = paginationScopes(root);
    const selector = root.dataset.nextSelector || '';

    if (selector) {
      for (const scope of scopes) {
        const link = q(scope, selector);
        if (link?.getAttribute('href')) return true;
      }
    }

    const links = scopes.flatMap(scope => qa(scope, 'a[href]'));
    if (links.some(isNext)) return true;

    const current = currentStart();
    for (const link of links) {
      try {
        const url = new URL(link.getAttribute('href'), location.href);
        if (!url.searchParams.has('start')) continue;

        const value = parseInt(url.searchParams.get('start') || '', 10);
        if (Number.isFinite(value) && value > current) return true;
      } catch {
      }
    }

    return Boolean(q(document, 'a[rel="next"][href]'));
  }

  function hideEverything(root) {
    root.classList.remove('is-ready');

    for (const selector of [
      '[data-yt-loadmore-button]',
      '[data-yt-loadmore-sentinel]',
      '[data-yt-loadmore-loading]',
      '[data-yt-loadmore-message]'
    ]) {
      const element = q(root, selector);
      if (element) element.hidden = true;
    }
  }

  function revealControl(root) {
    const selector = (root.dataset.mode || 'button') === 'infinite'
      ? '[data-yt-loadmore-sentinel]'
      : '[data-yt-loadmore-button]';

    const control = q(root, selector);
    if (control) control.hidden = false;
  }

  function settle(root) {
    if (!root) return;

    if (isBuilder()) {
      root.classList.remove('is-finished');
      root.classList.add('is-ready', 'is-builder-preview');
      revealControl(root);
      return;
    }

    const targetNode = target(root);
    const list = items(targetNode, root);

    if (!targetNode || list.length === 0 || !hasNext(root)) {
      root.classList.add('is-finished');
      hideEverything(root);
      return;
    }

    root.classList.remove('is-finished');
    root.classList.add('is-ready');
    revealControl(root);
  }

  function boot(scope = document) {
    const roots = scope.matches?.(ROOT)
      ? [scope]
      : qa(scope, ROOT);

    roots.forEach(settle);
  }

  function schedule(scope = document) {
    requestAnimationFrame(() => boot(scope));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => schedule());
  } else {
    schedule();
  }

  window.addEventListener('load', () => schedule());
  document.addEventListener('yootheme:builder:render', event => schedule(event.target || document));

  const observer = new MutationObserver(() => schedule());
  observer.observe(document.documentElement, {childList: true, subtree: true});
  window.setTimeout(() => observer.disconnect(), 1500);
})();
