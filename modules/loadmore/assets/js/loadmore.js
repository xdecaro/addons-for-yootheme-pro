(() => {
    'use strict';

    const ROOT_SELECTOR = '[data-yt-loadmore]';
    const initialized = new WeakSet();

    const NEXT_WORDS = [
        'next', 'next page', 'suivant', 'suivante', 'page suivante',
        'successiva', 'successivo', 'pagina successiva', 'avanti',
        'volgende', 'weiter', 'nächste', 'naechste', 'próxima', 'proxima',
        'seguinte', 'siguiente'
    ];

    const esc = (value) => {
        if (window.CSS && typeof window.CSS.escape === 'function') {
            return window.CSS.escape(value);
        }
        return String(value).replace(/([ #;?%&,.+*~\\':"!^$\[\]()=>|\/@])/g, '\\$1');
    };

    const safeQuery = (root, selector) => {
        if (!root || !selector) return null;
        try { return root.querySelector(selector); } catch (_) { return null; }
    };

    const safeQueryAll = (root, selector) => {
        if (!root || !selector) return [];
        try { return Array.from(root.querySelectorAll(selector)); } catch (_) { return []; }
    };

    const normalizeText = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    function toAbsoluteUrl(href, baseUrl = window.location.href) {
        if (!href || href === '#') return null;
        try { return new URL(href, baseUrl).href; } catch (_) { return null; }
    }

    function findAutoTarget(controlRoot) {
        let node = controlRoot.previousElementSibling;
        while (node) {
            if (node.matches?.('.uk-grid, [uk-grid], [data-uk-grid]')) return node;
            const grid = safeQuery(node, '.uk-grid, [uk-grid], [data-uk-grid]');
            if (grid) return grid;
            node = node.previousElementSibling;
        }
        return null;
    }

    function findTarget(controlRoot, doc = document) {
        const mode = controlRoot.dataset.targetMode || 'selector';
        if (mode === 'selector') {
            return safeQuery(doc, controlRoot.dataset.targetSelector || '');
        }

        if (doc === document) return findAutoTarget(controlRoot);

        if (controlRoot.id) {
            const remoteControl = safeQuery(doc, `#${esc(controlRoot.id)}`);
            return remoteControl ? findAutoTarget(remoteControl) : null;
        }
        return null;
    }

    function getItems(target, root) {
        const selector = root.dataset.itemSelector || ':scope > *';
        return safeQueryAll(target, selector).filter((item) => !item.matches(ROOT_SELECTOR));
    }

    function paginationScopes(doc, root) {
        const custom = root.dataset.paginationSelector || '';
        const scopes = safeQueryAll(doc, custom);
        if (scopes.length) return scopes;

        return safeQueryAll(doc, '.pagination, .uk-pagination, nav[aria-label], nav.pagination, ul.pagination, ul.uk-pagination');
    }

    function linkLooksLikeNext(link) {
        if (!link) return false;
        if ((link.getAttribute('rel') || '').split(/\s+/).includes('next')) return true;

        const label = normalizeText([
            link.textContent,
            link.getAttribute('aria-label'),
            link.getAttribute('title')
        ].filter(Boolean).join(' '));

        return NEXT_WORDS.some((word) => label.includes(normalizeText(word)));
    }

    function findNextByStartParam(links, baseUrl) {
        let currentStart = 0;
        try {
            currentStart = Number.parseInt(new URL(baseUrl, window.location.href).searchParams.get('start') || '0', 10) || 0;
        } catch (_) {}

        const candidates = [];
        links.forEach((link) => {
            const absolute = toAbsoluteUrl(link.getAttribute('href'), baseUrl);
            if (!absolute) return;
            try {
                const url = new URL(absolute);
                if (!url.searchParams.has('start')) return;
                const start = Number.parseInt(url.searchParams.get('start') || '', 10);
                if (Number.isFinite(start) && start > currentStart) {
                    candidates.push({ start, url: absolute });
                }
            } catch (_) {}
        });

        candidates.sort((a, b) => a.start - b.start);
        return candidates[0]?.url || null;
    }

    function findNextUrl(doc, root, baseUrl = window.location.href) {
        const selector = root.dataset.nextSelector || '';
        const explicit = safeQuery(doc, selector);
        if (explicit) {
            const explicitUrl = toAbsoluteUrl(explicit.getAttribute('href'), baseUrl);
            if (explicitUrl) return explicitUrl;
        }

        const scopes = paginationScopes(doc, root);
        const links = [];
        scopes.forEach((scope) => links.push(...safeQueryAll(scope, 'a[href]')));

        const semantic = links.find(linkLooksLikeNext);
        if (semantic) {
            const semanticUrl = toAbsoluteUrl(semantic.getAttribute('href'), baseUrl);
            if (semanticUrl) return semanticUrl;
        }

        const byStart = findNextByStartParam(links, baseUrl);
        if (byStart) return byStart;

        const relNext = safeQuery(doc, 'a[rel="next"][href]');
        return relNext ? toAbsoluteUrl(relNext.getAttribute('href'), baseUrl) : null;
    }

    function hidePagination(root) {
        if (root.dataset.hidePagination !== '1') return;
        paginationScopes(document, root).forEach((element) => {
            if (!element.closest(ROOT_SELECTOR)) {
                element.dataset.ytLoadmoreHidden = '1';
                element.hidden = true;
            }
        });
    }

    function setBusy(root, busy) {
        root.classList.toggle('is-loading', busy);
        root.setAttribute('aria-busy', busy ? 'true' : 'false');
        const button = root.querySelector('[data-yt-loadmore-button]');
        const loading = root.querySelector('[data-yt-loadmore-loading]');
        if (button) button.disabled = busy;
        if (loading) loading.hidden = !busy;
    }

    function setButtonLabel(root, text) {
        const label = root.querySelector('[data-yt-loadmore-label]');
        if (label && text) label.textContent = text;
    }

    function showMessage(root, text, isError = false) {
        const message = root.querySelector('[data-yt-loadmore-message]');
        if (!message) return;
        message.textContent = text || '';
        message.classList.toggle('is-error', isError);
        message.hidden = !text;
    }

    function finish(root, observer, showEnd = true) {
        if (observer) observer.disconnect();
        root.classList.add('is-finished');
        const button = root.querySelector('[data-yt-loadmore-button]');
        const sentinel = root.querySelector('[data-yt-loadmore-sentinel]');
        const loading = root.querySelector('[data-yt-loadmore-loading]');
        if (button) button.hidden = true;
        if (sentinel) sentinel.hidden = true;
        if (loading) loading.hidden = true;

        if (showEnd && root.dataset.showEndMessage === '1') {
            showMessage(root, root.dataset.endText || 'Hai visualizzato tutti gli elementi');
        } else {
            showMessage(root, '');
        }
    }

    function animateItems(items, mode) {
        if (!mode || mode === 'none') return;
        items.forEach((item, index) => {
            item.classList.add(`yt-loadmore-new--${mode}`);
            item.style.animationDelay = `${Math.min(index * 35, 245)}ms`;
            item.addEventListener('animationend', () => {
                item.classList.remove(`yt-loadmore-new--${mode}`);
                item.style.animationDelay = '';
            }, { once: true });
        });
    }

    function notifyUiKit(target) {
        if (!window.UIkit || !target) return;
        try {
            if (typeof window.UIkit.update === 'function') {
                window.UIkit.update(target, 'update');
            }
        } catch (_) {}
    }

    function createObserver(root, loadNext) {
        if ((root.dataset.mode || 'button') !== 'infinite') return null;

        const sentinel = root.querySelector('[data-yt-loadmore-sentinel]');
        if ('IntersectionObserver' in window && sentinel) {
            const threshold = Math.max(0, Number.parseInt(root.dataset.threshold || '500', 10) || 500);
            const observer = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) loadNext();
            }, { rootMargin: `0px 0px ${threshold}px 0px` });
            observer.observe(sentinel);
            return observer;
        }

        const fallback = document.createElement('button');
        fallback.type = 'button';
        fallback.className = 'uk-button uk-button-primary';
        fallback.textContent = root.dataset.buttonText || 'Carica altri';
        fallback.addEventListener('click', loadNext);
        root.appendChild(fallback);
        return null;
    }

    function initAjax(root, target, initialNextUrl) {
        let nextUrl = initialNextUrl;
        if (!nextUrl) {
            finish(root, null, false);
            return;
        }

        hidePagination(root);

        const batchSize = Math.max(1, Number.parseInt(root.dataset.batchSize || '4', 10) || 4);
        const queue = [];
        const visitedUrls = new Set();
        let loading = false;
        let observer = null;
        const originalButtonText = root.querySelector('[data-yt-loadmore-label]')?.textContent || root.dataset.buttonText || 'Carica altri';

        const fetchPageIntoQueue = async () => {
            if (!nextUrl) return;

            const requestedUrl = nextUrl;
            if (visitedUrls.has(requestedUrl)) {
                nextUrl = null;
                return;
            }
            visitedUrls.add(requestedUrl);

            const response = await fetch(requestedUrl, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'text/html,application/xhtml+xml',
                },
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const html = await response.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const remoteTarget = findTarget(root, doc);
            if (!remoteTarget) throw new Error('Remote target not found');

            const remoteItems = getItems(remoteTarget, root);
            remoteItems.forEach((item) => queue.push(document.importNode(item, true)));
            nextUrl = findNextUrl(doc, root, requestedUrl);

            if (root.dataset.updateUrl === '1') {
                try { history.replaceState({ ytLoadMore: true }, '', requestedUrl); } catch (_) {}
            }
        };

        const fillQueue = async () => {
            while (queue.length < batchSize && nextUrl) {
                const before = queue.length;
                await fetchPageIntoQueue();
                if (queue.length === before && !nextUrl) break;
            }
        };

        const loadNext = async () => {
            if (loading || root.classList.contains('is-finished')) return;

            loading = true;
            showMessage(root, '');
            setBusy(root, true);
            setButtonLabel(root, root.dataset.loadingText || 'Caricamento…');

            try {
                await fillQueue();

                const imported = queue.splice(0, batchSize);
                if (!imported.length) {
                    finish(root, observer, true);
                    return;
                }

                const fragment = document.createDocumentFragment();
                imported.forEach((item) => fragment.appendChild(item));
                target.appendChild(fragment);

                animateItems(imported, root.dataset.animation || 'fade');
                notifyUiKit(target);

                document.dispatchEvent(new CustomEvent('yootheme:loadmore:loaded', {
                    detail: { root, target, items: imported, url: nextUrl, strategy: 'ajax' },
                }));

                if (!queue.length && !nextUrl) {
                    finish(root, observer, true);
                }
            } catch (error) {
                console.error('[Load More for YOOtheme Pro]', error);
                showMessage(root, root.dataset.errorText || 'Impossibile caricare altri elementi. Riprova.', true);
            } finally {
                loading = false;
                setBusy(root, false);
                setButtonLabel(root, originalButtonText);
            }
        };

        const button = root.querySelector('[data-yt-loadmore-button]');
        if (button) button.addEventListener('click', loadNext);
        observer = createObserver(root, loadNext);
    }

    function init(root) {
        if (initialized.has(root)) return;
        initialized.add(root);

        const target = findTarget(root);
        if (!target) {
            showMessage(root, 'Contenitore non trovato. Controlla il selettore CSS.', true);
            return;
        }

        const nextUrl = findNextUrl(document, root, window.location.href);
        initAjax(root, target, nextUrl);
    }

    function boot(scope = document) {
        safeQueryAll(scope, ROOT_SELECTOR).forEach(init);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => boot());
    } else {
        boot();
    }

    document.addEventListener('yootheme:builder:render', () => boot());
})();
