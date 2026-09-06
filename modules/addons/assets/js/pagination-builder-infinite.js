(() => {
  'use strict';

  const ROOT = '[data-x-pagination][data-mode="infinite"]';
  const SENTINEL = '[data-x-pagination-sentinel]';
  const PROXY_ATTRIBUTE = 'data-x-pagination-loadmore';
  const running = new WeakSet();
  let frame = 0;

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

  function scheduleCheck() {
    if (frame) return;

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      document.querySelectorAll(ROOT).forEach(root => {
        if (shouldLoad(root)) triggerLoad(root);
      });
    });
  }

  function shouldLoad(root) {
    if (!root?.isConnected || running.has(root)) return false;
    if (!root.classList.contains('is-ready') || root.classList.contains('is-finished')) return false;
    if (root.classList.contains('is-loading') || root.getAttribute('aria-busy') === 'true') return false;

    const sentinel = root.querySelector(SENTINEL);
    if (!sentinel || sentinel.hidden) return false;

    const distance = Math.max(0, parseInt(root.dataset.threshold || '500', 10) || 500);
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const rect = sentinel.getBoundingClientRect();

    return rect.top <= viewportHeight + distance && rect.bottom >= -distance;
  }

  function triggerLoad(root) {
    const sentinel = root.querySelector(SENTINEL);
    if (!sentinel || running.has(root)) return;

    running.add(root);

    // Reuse the single Pagination controller instead of duplicating its AJAX logic.
    // pagination.js delegates clicks from [data-x-pagination-loadmore] to loadMore(root).
    // This temporary attribute is not observed by the Builder lifecycle observer.
    sentinel.setAttribute(PROXY_ATTRIBUTE, '');

    try {
      sentinel.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      }));
    } finally {
      sentinel.removeAttribute(PROXY_ATTRIBUTE);
    }

    waitUntilIdle(root, 0);
  }

  function waitUntilIdle(root, attempt) {
    if (!root?.isConnected) {
      running.delete(root);
      return;
    }

    const busy = root.classList.contains('is-loading') || root.getAttribute('aria-busy') === 'true';

    if (busy && attempt < 150) {
      window.setTimeout(() => waitUntilIdle(root, attempt + 1), 80);
      return;
    }

    running.delete(root);

    // If the preview is still shorter than the activation threshold, continue
    // exactly as a normal infinite scroll would do on a short viewport.
    if (!root.classList.contains('is-finished')) {
      window.setTimeout(scheduleCheck, 120);
    }
  }

  window.addEventListener('scroll', scheduleCheck, { passive: true });
  document.addEventListener('scroll', scheduleCheck, { capture: true, passive: true });
  window.addEventListener('resize', scheduleCheck, { passive: true });
  document.addEventListener('yootheme:builder:render', scheduleCheck);

  const start = () => {
    scheduleCheck();
    [100, 250, 500, 1000].forEach(delay => window.setTimeout(scheduleCheck, delay));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  window.addEventListener('load', scheduleCheck, { once: true });
})();
