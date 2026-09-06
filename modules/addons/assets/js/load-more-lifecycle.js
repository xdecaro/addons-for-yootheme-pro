(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';
  const RETRY_DELAYS = [0, 100, 250, 500, 1000, 2000, 3500];
  let eventScheduled = false;
  let observer = null;

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

  function mainReady(root) {
    return root.classList.contains('is-ready') ||
      root.classList.contains('is-finished') ||
      root.classList.contains('is-builder-preview');
  }

  function needsInit(root) {
    if (!root) return false;

    if (isBuilder()) {
      return !mainReady(root);
    }

    const stabilityReady =
      root.dataset.xdecaroNextState === 'yes' ||
      root.dataset.xdecaroNextState === 'none' ||
      root.dataset.xdecaroNextState === 'checking';

    return !mainReady(root) || !stabilityReady;
  }

  function requestLifecyclePass() {
    if (eventScheduled) return;

    const roots = [...document.querySelectorAll(ROOT)];
    if (!roots.some(needsInit)) return;

    eventScheduled = true;

    queueMicrotask(() => {
      eventScheduled = false;
      document.dispatchEvent(new CustomEvent('yootheme:builder:render', {
        bubbles: true,
        detail: { source: 'xdecaro-load-more-lifecycle' }
      }));
    });
  }

  function scheduleRetries() {
    RETRY_DELAYS.forEach(delay => {
      window.setTimeout(requestLifecyclePass, delay);
    });
  }

  function containsLoadMore(node) {
    if (!node || node.nodeType !== 1) return false;
    return node.matches?.(ROOT) || !!node.querySelector?.(ROOT);
  }

  function startBuilderObserver() {
    if (!isBuilder() || observer || !('MutationObserver' in window)) return;

    const target = document.body || document.documentElement;
    if (!target) return;

    observer = new MutationObserver(records => {
      const hasNewLoadMore = records.some(record =>
        Array.from(record.addedNodes).some(containsLoadMore)
      );

      if (hasNewLoadMore) requestLifecyclePass();
    });

    observer.observe(target, {
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
