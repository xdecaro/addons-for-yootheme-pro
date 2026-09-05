(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';
  const CONFIRMED = 'is-confirmed-next';
  const timers = new WeakMap();

  function isBuilder() {
    try {
      const url = new URL(location.href);
      return url.searchParams.get('p') === 'customizer' ||
        (url.pathname.includes('/administrator/') && url.searchParams.get('option') === 'com_ajax');
    } catch {
      return false;
    }
  }

  function control(root) {
    return root.querySelector((root.dataset.mode || 'button') === 'infinite'
      ? '[data-yt-loadmore-sentinel]'
      : '[data-yt-loadmore-button]');
  }

  function confirm(root, ui) {
    root.classList.add(CONFIRMED);
    ui.hidden = false;
  }

  function clearTimer(root) {
    const timer = timers.get(root);
    if (timer) {
      clearInterval(timer);
      timers.delete(root);
    }
  }

  function init(root) {
    if (!root || timers.has(root) || isBuilder()) return;

    const ui = control(root);
    if (!ui) return;

    let attempts = 0;
    const maxAttempts = 60; // 3 seconds maximum, then stop completely.

    const timer = window.setInterval(() => {
      attempts += 1;

      if (root.classList.contains('is-ready') && !root.classList.contains('is-finished')) {
        confirm(root, ui);
        clearTimer(root);
        return;
      }

      if (attempts >= maxAttempts) {
        clearTimer(root);
      }
    }, 50);

    timers.set(root, timer);

    // If an old cached visibility script marks the root as finished just before
    // the click, clear only that stale state once. No MutationObserver is used.
    ui.addEventListener('click', () => {
      if (!root.classList.contains(CONFIRMED)) return;

      root.classList.remove('is-finished');
      root.classList.add('is-ready');

      window.setTimeout(() => {
        if (root.classList.contains('is-finished') && !root.classList.contains('is-loading')) {
          root.classList.remove(CONFIRMED);
        }
      }, 1500);
    }, true);
  }

  function boot(scope = document) {
    const roots = scope.matches?.(ROOT) ? [scope] : [...scope.querySelectorAll(ROOT)];
    roots.forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot());
  } else {
    boot();
  }

  document.addEventListener('yootheme:builder:render', event => boot(event.target || document));

  document.addEventListener('yootheme:loadmore:loaded', event => {
    const root = event.detail?.root;
    if (!root) return;

    const ui = control(root);
    if (!ui) return;

    if (event.detail?.url) {
      confirm(root, ui);
    } else {
      root.classList.remove(CONFIRMED);
    }
  });
})();
