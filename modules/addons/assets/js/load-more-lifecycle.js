(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';
  const RETRY_DELAYS = [0, 100, 250, 500, 1000, 2000, 3500];
  let eventScheduled = false;

  function needsInit(root) {
    if (!root) return false;

    const mainReady =
      root.classList.contains('is-ready') ||
      root.classList.contains('is-finished') ||
      root.classList.contains('is-builder-preview');

    const stabilityReady =
      root.dataset.xdecaroNextState === 'yes' ||
      root.dataset.xdecaroNextState === 'none' ||
      root.dataset.xdecaroNextState === 'checking';

    return !mainReady || !stabilityReady;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleRetries, { once: true });
  } else {
    scheduleRetries();
  }

  window.addEventListener('load', requestLifecyclePass, { once: true });
})();
