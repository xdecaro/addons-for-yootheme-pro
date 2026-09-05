(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';

  function isBuilder() {
    try {
      const url = new URL(location.href);
      return url.searchParams.get('p') === 'customizer' ||
        (url.pathname.includes('/administrator/') && url.searchParams.get('option') === 'com_ajax');
    } catch {
      return false;
    }
  }

  function reveal(root) {
    if (!root || root.classList.contains('is-finished')) return;

    const error = root.querySelector('[data-yt-loadmore-message].is-error:not([hidden])');
    if (error && !isBuilder()) return;

    const selector = (root.dataset.mode || 'button') === 'infinite'
      ? '[data-yt-loadmore-sentinel]'
      : '[data-yt-loadmore-button]';

    const control = root.querySelector(selector);
    if (control) control.hidden = false;
  }

  function boot(scope = document) {
    const roots = scope.matches?.(ROOT) ? [scope] : [...scope.querySelectorAll(ROOT)];
    roots.forEach(reveal);
  }

  function schedule(scope = document) {
    requestAnimationFrame(() => boot(scope));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => schedule());
  } else {
    schedule();
  }

  document.addEventListener('yootheme:builder:render', event => schedule(event.target || document));
})();
