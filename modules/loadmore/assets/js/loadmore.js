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

    function isBuilderPreview() {
        try {
            const url = new URL(window.location.href);
            return url.searchParams.get('p') === 'customizer'
                || (url.pathname.includes('/administrator/') && url.searchParams.get('option') === 'com_ajax');
        } catch (_) {
            return false;
        }
    }

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
        if (mode === 'selector') return safeQuery(doc, controlRoot.dataset.targetSelector || '');
        return doc === document ? findAutoTarget(controlRoot) : null;
    }

    function getItems(target, root) {
        const selector = root.dataset.itemSelector || ':scope > *';
        return safeQueryAll(target, selector).filter((item) => !item.matches(ROOT_SELECTOR));
    }

    function paginationScopes(doc, root) {
        const custom = root.dataset.paginationSelector || '';
        const customScopes = safeQueryAll(doc, custom);
        if (customScopes.length) return customScopes;
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
                if (Number.isFinite(start) && start > currentStart) candidates.push({ start, url: absolute });
            } catch (_) {}
        });

        candidates.sort((a, b) => a.start - b.start);
        return candidates[0]?.url || null;
    }

    function findNextUrl(doc, root, baseUrl = window.location.href) {
        const scopes = paginationScopes(doc, root);
        const selector = root.dataset.nextSelector || '';

        for (const scope of scopes) {
            const explicit = safeQuery(scope, selector);
            if (explicit) {
                const url = toAbsoluteUrl(explicit.getAttribute('href'), baseUrl);
                if (url) return url;
            }
        }

        const links = [];
        scopes.forEach((scope) => links.push(...safeQueryAll(scope, 'a[href]')));

        const semantic = links.find(linkLooksLikeNext);
        if (semantic) {
            const url = toAbsoluteUrl(semantic.getAttribute('href'), baseUrl);
            if (url) return url;
        }

        const byStart = findNextByStartParam(links, baseUrl);
        if (byStart) return byStart;

        const relNext = safeQuery(doc, 'a[rel="next"][href]');
        return relNext ? toAbsoluteUrl(relNext.getAttribute('href'), baseUrl) : null;
    }

    function deriveNextPageUrl(baseUrl) {
        if (isBuilderPreview()) return null;
        try {
            const url = new URL(baseUrl, window.location.href);
            if (url.pathname.includes('/administrator/')) return null;
            const current = Number.parseInt(url.searchParams.get('start') || '0', 10) || 0;
            url.searchParams.set('start', String(current + 1));
            return url.href;
        } catch (_) {
            return null;
        }
    }

    function normalizedUrlKey(href, baseUrl) {
        const absolute = toAbsoluteUrl(href, baseUrl);
        if (!absolute) return null;
        try {
            const url = new URL(absolute);
            if (!/^https?:$/.test(url.protocol)) return null;
            const idMatch = url.pathname.match(/\/(\d+)-[^/]+\/?$/);
            if (idMatch) return `joomla-article:${idMatch[1]}`;
            url.hash = '';
            url.search = '';
            const path = url.pathname.replace(/\/+$/, '') || '/';
            return `url:${url.origin}${path}`;
        } catch (_) {
            return null;
        }
    }

    function itemSignature(item, baseUrl) {
        const base = (() => {
            try { return new URL(baseUrl, window.location.href); } catch (_) { return null; }
        })();

        const links = safeQueryAll(item, 'a[href]');
        for (const link of links) {
            const key = normalizedUrlKey(link.getAttribute('href'), baseUrl);
            if (!key) continue;
            if (base && key === `url:${base.origin}${base.pathname.replace(/\/+$/, '') || '/'}`) continue;
            return key;
        }

        const heading = safeQuery(item, 'h1, h2, h3, h4, h5, h6, .uk-card-title, [class*="title"]');
        const headingText = normalizeText(heading?.textContent || '');
        if (headingText) return `title:${headingText}`;

        const text = normalizeText(item.textContent).slice(0, 500);
        const image = safeQuery(item, 'img[src], img[data-src]');
        const imageSrc = image ? (image.getAttribute('src') || image.getAttribute('data-src') || '') : '';
        const imageKey = normalizedUrlKey(imageSrc, baseUrl) || imageSrc.split('?')[0];
        return `fallback:${text}|${imageKey}`;
    }

    function hidePagination(root) {
        if (root.dataset.hidePagination !== '1') return;
        paginationScopes(document, root).forEach((element) => {
            if (!element.closest(ROOT_SELECTOR)) element.hidden = true;
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
        showMessage(root, showEnd && root.dataset.showEndMessage === '1'
            ? (root.dataset.endText || 'Hai visualizzato tutti gli elementi')
            : '');
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
        try {
            if (window.UIkit && typeof window.UIkit.update === 'function') window.UIkit.update(target, 'update');
        } catch (_) {}
    }

    function createObserver(root, loadNext) {
        if ((root.dataset.mode || 'button') !== 'infinite') return null;
        const sentinel = root.querySelector('[data-yt-loadmore-sentinel]');
        if ('IntersectionObserver' in window && sentinel) {
            const distance = Math.max(0, Number.parseInt(root.dataset.threshold || '500', 10) || 500);
            const observer = new IntersectionObserver((entries) => {
                if (entries.some((entry) => entry.isIntersecting)) loadNext();
            }, { rootMargin: `0px 0px ${distance}px 0px` });
            observer.observe(sentinel);
            return observer;
        }
        return null;
    }

    function initAjax(root, target, initialNextUrl) {
        if (!initialNextUrl && isBuilderPreview()) {
            root.classList.add('is-builder-preview');
            return;
        }

        let nextUrl = initialNextUrl;
        if (!nextUrl) {
            finish(root, null, false);
            return;
        }

        hidePagination(root);

        const batchSize = Math.max(1, Number.parseInt(root.dataset.batchSize || '4', 10) || 4);
        const queue = [];
        const visitedUrls = new Set();
        const seenItems = new Set(getItems(target, root).map((item) => itemSignature(item, window.location.href)));
        let loading = false;
        let observer = null;
        let duplicateOnlyPages = 0;
        const originalButtonText = root.querySelector('[data-yt-loadmore-label]')?.textContent
            || root.dataset.buttonText
            || 'Carica altri';

        const fetchPageIntoQueue = async () => {
            if (!nextUrl) return;
            const requestedUrl = nextUrl;
            if (visitedUrls.has(requestedUrl)) {
                nextUrl = null;
                return;
            }
            visitedUrls.add(requestedUrl);

            const response = await fetch(requestedUrl, {
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
            let added = 0;
            remoteItems.forEach((item) => {
                const signature = itemSignature(item, requestedUrl);
                if (seenItems.has(signature)) return;
                seenItems.add(signature);
                queue.push(document.importNode(item, true));
                added += 1;
            });

            if (added > 0) duplicateOnlyPages = 0;
            else duplicateOnlyPages += 1;

            const explicitNext = findNextUrl(doc, root, requestedUrl);
            if (explicitNext && !visitedUrls.has(explicitNext)) {
                nextUrl = explicitNext;
            } else if (remoteItems.length && duplicateOnlyPages < 2) {
                nextUrl = deriveNextPageUrl(requestedUrl);
            } else if (remoteItems.length && added > 0) {
                nextUrl = deriveNextPageUrl(requestedUrl);
            } else {
                nextUrl = null;
            }

            if (root.dataset.updateUrl === '1') {
                try { history.replaceState({ ytLoadMore: true }, '', requestedUrl); } catch (_) {}
            }
        };

        const fillQueue = async () => {
            let probes = 0;
            while (queue.length < batchSize && nextUrl && probes < 10) {
                probes += 1;
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

                if (!queue.length && !nextUrl) finish(root, observer, true);
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

        const explicitNext = findNextUrl(document, root, window.location.href);
        const nextUrl = explicitNext || deriveNextPageUrl(window.location.href);
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
