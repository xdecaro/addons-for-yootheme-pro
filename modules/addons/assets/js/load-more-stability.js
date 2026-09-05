(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';
  const CONFIRMED = 'is-confirmed-next';
  const states = new WeakMap();

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

  function init(root) {
    if (!root || states.has(root) || isBuilder()) return;

    const ui = control(root);
    if (!ui) return;

    const state = {
      confirmed: false,
      loadingStarted: false,
      scheduled: false,
    };
    states.set(root, state);

    const sync = () => {
      state.scheduled = false;

      if (root.classList.contains('is-loading')) {
        state.loadingStarted = true;
      }

      if (!state.confirmed && root.classList.contains('is-ready') && !root.classList.contains('is-finished')) {
        state.confirmed = true;
        root.classList.add(CONFIRMED);
      }

      if (state.confirmed && root.classList.contains('is-finished')) {
        if (state.loadingStarted) {
          state.confirmed = false;
          root.classList.remove(CONFIRMED);
          return;
        }

        // A legacy/cached visibility script may still mark the root as finished.
        // Once the main script has confirmed a real next page, that state must stay stable.
        root.classList.remove('is-finished');
        root.classList.add('is-ready', CONFIRMED);
        ui.hidden = false;
      }

      if (state.confirmed) {
        root.classList.add('is-ready', CONFIRMED);
        ui.hidden = false;
      }

      if (state.loadingStarted && !root.classList.contains('is-loading') && !root.classList.contains('is-finished')) {
        state.loadingStarted = false;
      }
    };

    const schedule = () => {
      if (state.scheduled) return;
      state.scheduled = true;
      queueMicrotask(sync);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false,
    });
    observer.observe(ui, {
      attributes: true,
      attributeFilter: ['hidden'],
    });

    schedule();
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
})();
