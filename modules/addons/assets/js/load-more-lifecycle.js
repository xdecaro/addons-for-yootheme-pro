(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';
  const RETRY_DELAYS = [0, 100, 250, 500, 1000, 2000, 3500];
  let eventScheduled = false;
  let discoveryObserver = null;
  let builderRefreshScheduled = false;
  const rootObservers = new WeakMap();
  const pendingRoots = new Set();

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

  function control(root) {
    if (!root) return null;
    const selector = (root.dataset.mode || 'button') === 'infinite'
      ? '[data-yt-loadmore-sentinel]'
      : '[data-yt-loadmore-button]';
    return root.querySelector(selector);
  }

  function mainReady(root) {
    return root.classList.contains('is-ready') ||
      root.classList.contains('is-finished') ||
      root.classList.contains('is-builder-preview');
  }

  function builderNeedsRefresh(root) {
    if (!root) return false;

    if (!root.classList.contains('is-builder-preview') ||
        !root.classList.contains('is-ready') ||
        root.classList.contains('is-finished')) {
      return true;
    }

    const ui = control(root);
    if (!ui) return false;

    return ui.hidden || ('disabled' in ui && ui.disabled);
  }

  function needsInit(root) {
    if (!root) return false;

    if (isBuilder()) return builderNeedsRefresh(root);

    const stabilityReady =
      root.dataset.xdecaroNextState === 'yes' ||
      root.dataset.xdecaroNextState === 'none' ||
      root.dataset.xdecaroNextState === 'checking';

    return !mainReady(root) || !stabilityReady;
  }

  function dispatchLifecycle() {
    if (eventScheduled) return;

    eventScheduled = true;
    queueMicrotask(() => {
      eventScheduled = false;
      document.dispatchEvent(new CustomEvent('yootheme:builder:render', {
        bubbles: true,
        detail: { source: 'xdecaro-load-more-lifecycle' }
      }));
    });
  }

  function refreshBuilderRoot(root) {
    if (!root || !root.isConnected) return;

    root.classList.remove('is-finished');
    root.classList.add('is-builder-preview', 'is-ready');

    const ui = control(root);
    if (ui) {
      ui.hidden = false;
      if ('disabled' in ui) ui.disabled = false;
    }

    const loading = root.querySelector('[data-yt-loadmore-loading]');
    if (loading) loading.hidden = true;

    const message = root.querySelector('[data-yt-loadmore-message]');
    if (message) {
      message.hidden = true;
      message.classList.remove('is-error');
    }
  }

  function flushBuilderRefresh() {
    builderRefreshScheduled = false;
    const roots = [...pendingRoots];
    pendingRoots.clear();
    let touched = false;

    roots.forEach(root => {
      if (!root || !root.isConnected) return;
      observeBuilderRoot(root);

      if (builderNeedsRefresh(root)) {
        refreshBuilderRoot(root);
        touched = true;
      }
    });

    if (touched) dispatchLifecycle();
  }

  function queueBuilderRefresh(root) {
    if (!isBuilder() || !root) return;

    pendingRoots.add(root);
    if (builderRefreshScheduled) return;

    builderRefreshScheduled = true;
    queueMicrotask(flushBuilderRefresh);
  }

  function observeBuilderRoot(root) {
    if (!isBuilder() || !root || rootObservers.has(root) || !('MutationObserver' in window)) return;

    const observer = new MutationObserver(() => {
      if (builderNeedsRefresh(root)) queueBuilderRefresh(root);
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'disabled']
    });

    rootObservers.set(root, observer);
  }

  function scanBuilderRoots(scope = document) {
    if (!isBuilder()) return;

    const roots = scope.matches?.(ROOT)
      ? [scope]
      : [...scope.querySelectorAll?.(ROOT) || []];

    roots.forEach(root => {
      observeBuilderRoot(root);
      if (builderNeedsRefresh(root)) queueBuilderRefresh(root);
    });
  }

  function requestLifecyclePass() {
    const roots = [...document.querySelectorAll(ROOT)];

    if (isBuilder()) {
      roots.forEach(observeBuilderRoot);
      const pending = roots.filter(builderNeedsRefresh);
      if (!pending.length) return;

      pending.forEach(refreshBuilderRoot);
      dispatchLifecycle();
      return;
    }

    if (!roots.some(needsInit)) return;
    dispatchLifecycle();
  }

  function scheduleRetries() {
    RETRY_DELAYS.forEach(delay => {
      window.setTimeout(requestLifecyclePass, delay);
    });
  }

  function discoverRoots(node) {
    if (!node || node.nodeType !== 1) return;

    if (node.matches?.(ROOT)) queueBuilderRefresh(node);
    node.querySelectorAll?.(ROOT).forEach(queueBuilderRefresh);
  }

  function startBuilderObserver() {
    if (!isBuilder() || discoveryObserver || !('MutationObserver' in window)) return;

    const target = document.body || document.documentElement;
    if (!target) return;

    scanBuilderRoots();

    discoveryObserver = new MutationObserver(records => {
      records.forEach(record => {
        Array.from(record.addedNodes).forEach(discoverRoots);
      });
    });

    discoveryObserver.observe(target, {
      childList: true,
      subtree: true
    });
  }

  function start() {
    scheduleRetries();
    startBuilderObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('load', requestLifecyclePass, { once: true });
})();
