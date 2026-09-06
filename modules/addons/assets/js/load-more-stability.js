(() => {
  'use strict';

  const ROOT = '[data-yt-loadmore]';
  const GRID = '.uk-grid,[uk-grid],[data-uk-grid]';
  const CONFIRMED = 'is-confirmed-next';
  const checks = new WeakMap();
  const nextWords = ['next','next page','suivant','suivante','page suivante','successiva','successivo','pagina successiva','avanti','volgende','weiter','nächste','naechste','próxima','proxima','seguinte','siguiente'];

  const q = (root, selector) => {
    try { return root && selector ? root.querySelector(selector) : null; } catch { return null; }
  };

  const qa = (root, selector) => {
    try { return root && selector ? [...root.querySelectorAll(selector)] : []; } catch { return []; }
  };

  const norm = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

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
    return q(root, (root.dataset.mode || 'button') === 'infinite'
      ? '[data-yt-loadmore-sentinel]'
      : '[data-yt-loadmore-button]');
  }

  function isBefore(a, b) {
    try { return !!(a.compareDocumentPosition(b) & 4); } catch { return false; }
  }

  function candidateGrids(doc) {
    return qa(doc, GRID).filter(grid => !grid.closest(ROOT) && grid.children.length > 0);
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

  function localTarget(root) {
    if ((root.dataset.targetMode || 'auto') === 'selector') {
      return q(document, root.dataset.targetSelector || '');
    }
    return directPreviousGrid(root) || scopedPreviousGrid(root);
  }

  function signature(grid) {
    if (!grid) return '';
    const ignored = new Set(['uk-grid-stack', 'uk-grid-margin', 'uk-first-column']);
    return [...grid.classList]
      .filter(name => !ignored.has(name))
      .sort()
      .join('|');
  }

  function matchingRemoteRoot(root, doc) {
    const localRoots = qa(document, ROOT);
    const remoteRoots = qa(doc, ROOT);
    const index = localRoots.indexOf(root);
    return remoteRoots[index] || remoteRoots[0] || null;
  }

  function remoteTarget(root, local, doc) {
    if (!local) return null;

    if ((root.dataset.targetMode || 'auto') === 'selector') {
      return q(doc, root.dataset.targetSelector || '');
    }

    if (local.id) {
      const byId = doc.getElementById(local.id);
      if (byId) return byId;
    }

    const wanted = signature(local);
    if (!wanted) return null;

    let matches = candidateGrids(doc).filter(grid => signature(grid) === wanted);
    if (!matches.length) return null;

    const remoteRoot = matchingRemoteRoot(root, doc);
    if (remoteRoot) {
      const before = matches.filter(grid => isBefore(grid, remoteRoot));
      if (before.length) return before[before.length - 1];
    }

    return matches[0];
  }

  function itemHost(target, root) {
    if (!target) return null;
    const selector = root.dataset.itemSelector || ':scope > *';
    if (selector !== ':scope > *') return target;

    const direct = qa(target, ':scope > *').filter(item => !item.matches(ROOT));
    if (direct.length === 1) {
      const only = direct[0];
      if (only.matches?.(GRID) && only.children.length) return only;
    }

    return target;
  }

  function items(target, root) {
    const host = itemHost(target, root);
    if (!host) return [];
    return qa(host, root.dataset.itemSelector || ':scope > *').filter(item => !item.matches(ROOT));
  }

  function absolute(href, base) {
    try { return href && href !== '#' ? new URL(href, base).href : ''; } catch { return ''; }
  }

  function primaryLink(item, base) {
    const selectors = ['h1 a[href]','h2 a[href]','h3 a[href]','h4 a[href]','h5 a[href]','h6 a[href]','.uk-card-title a[href]','.el-title a[href]','a.uk-link-reset[href]'];
    for (const selector of selectors) {
      const link = q(item, selector);
      if (link) return absolute(link.getAttribute('href'), base);
    }
    const link = q(item, 'a[href]');
    return link ? absolute(link.getAttribute('href'), base) : '';
  }

  function itemKey(item, base) {
    const href = primaryLink(item, base);
    if (href) {
      try {
        const url = new URL(href);
        return 'url:' + decodeURIComponent(url.pathname).replace(/\/$/, '').toLowerCase();
      } catch {}
    }

    const title = norm(q(item, 'h1,h2,h3,h4,h5,h6,.uk-card-title,.el-title')?.textContent || '');
    const img = q(item, 'img[src],img[data-src]');
    const src = img ? absolute(img.getAttribute('src') || img.getAttribute('data-src'), base) : '';
    if (title || src) return 'fallback:' + title + '|' + src;

    return 'text:' + norm(item.textContent).slice(0, 300);
  }

  function currentStart(base) {
    try { return parseInt(new URL(base, location.href).searchParams.get('start') || '0', 10) || 0; } catch { return 0; }
  }

  function explicitNext(root, base) {
    const paginationSelector = root.dataset.paginationSelector || '.uk-pagination,.pagination,nav[aria-label*="pagination" i]';
    const scopes = qa(document, paginationSelector);
    const links = scopes.flatMap(scope => qa(scope, 'a[href]'));
    const custom = root.dataset.nextSelector || '';

    for (const scope of scopes) {
      const link = q(scope, custom);
      if (link) return absolute(link.getAttribute('href'), base);
    }

    const next = links.find(link => {
      const rel = (link.getAttribute('rel') || '').split(/\s+/);
      if (rel.includes('next')) return true;
      const label = norm([link.textContent, link.getAttribute('aria-label'), link.getAttribute('title')].filter(Boolean).join(' '));
      return nextWords.some(word => label.includes(norm(word)));
    });

    return next ? absolute(next.getAttribute('href'), base) : '';
  }

  function candidateUrl(root, target) {
    const explicit = explicitNext(root, location.href);
    if (explicit) return explicit;

    const count = items(target, root).length;
    if (!count) return '';

    try {
      const url = new URL(location.href);
      url.searchParams.set('start', String(currentStart(location.href) + count));
      return url.href;
    } catch {
      return '';
    }
  }

  function setHidden(root, ui) {
    root.dataset.xdecaroNextState = 'none';
    root.classList.remove(CONFIRMED, 'is-ready');
    root.classList.add('is-finished');
    if (ui) {
      ui.hidden = true;
      if ('disabled' in ui) ui.disabled = true;
    }
    const message = q(root, '[data-yt-loadmore-message]');
    if (message) {
      message.hidden = true;
      message.textContent = '';
    }
  }

  function setConfirmed(root, ui) {
    root.dataset.xdecaroNextState = 'yes';
    root.classList.remove('is-finished');
    root.classList.add(CONFIRMED, 'is-ready');
    if (ui) {
      ui.hidden = false;
      if ('disabled' in ui) ui.disabled = false;
    }
  }

  function setChecking(root, ui) {
    root.dataset.xdecaroNextState = 'checking';
    root.classList.remove(CONFIRMED);
    if (ui) {
      ui.hidden = true;
      if ('disabled' in ui) ui.disabled = true;
    }
  }

  async function preflight(root) {
    if (!root || isBuilder()) return true;

    const running = checks.get(root);
    if (running) return running;

    const ui = control(root);
    const target = localTarget(root);
    if (!ui || !target) {
      setHidden(root, ui);
      return false;
    }

    setChecking(root, ui);

    const promise = (async () => {
      const url = candidateUrl(root, target);
      if (!url) {
        setHidden(root, ui);
        return false;
      }

      try {
        const response = await fetch(url, {
          credentials: 'same-origin',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/html,application/xhtml+xml'
          }
        });

        if (!response.ok) {
          setHidden(root, ui);
          return false;
        }

        const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
        const remote = remoteTarget(root, target, doc);
        if (!remote) {
          setHidden(root, ui);
          return false;
        }

        const localSeen = new Set(items(target, root).map(item => itemKey(item, location.href)));
        const remoteItems = items(remote, root);
        const hasNew = remoteItems.some(item => {
          const key = itemKey(item, url);
          return key && !localSeen.has(key);
        });

        if (!hasNew) {
          setHidden(root, ui);
          return false;
        }

        setConfirmed(root, ui);
        return true;
      } catch (error) {
        console.debug('[Load More by xdecaro] Remote grid validation failed', error);
        setHidden(root, ui);
        return false;
      } finally {
        checks.delete(root);
      }
    })();

    checks.set(root, promise);
    return promise;
  }

  function init(root) {
    if (!root || isBuilder()) return;

    const ui = control(root);
    if (!ui || ui.dataset.xdecaroGuard === '1') return;
    ui.dataset.xdecaroGuard = '1';

    // Never let the old AJAX handler run when the structural check says
    // there is no matching article/product Grid on the next page.
    ui.addEventListener('click', event => {
      if (root.dataset.xdecaroNextState !== 'none') return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    preflight(root);
  }

  function boot(scope = document) {
    const roots = scope.matches?.(ROOT) ? [scope] : qa(scope, ROOT);
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
    if (!root || isBuilder()) return;
    preflight(root);
  });
})();
