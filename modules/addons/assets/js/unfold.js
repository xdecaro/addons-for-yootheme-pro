(() => {
    'use strict';

    const SELECTOR = '[data-xd-unfold]';
    const states = new WeakMap();
    const pendingRefresh = new Set();
    let refreshFrame = 0;

    const bool = value => value === '1' || value === 'true';
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const reducedMotion = () => {
        try {
            return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
        } catch {
            return false;
        }
    };

    const activePreview = root => {
        if (window.innerWidth < 640) {
            return root.dataset.previewMobile || root.dataset.previewTablet || root.dataset.previewDesktop || '420px';
        }
        if (window.innerWidth < 960) {
            return root.dataset.previewTablet || root.dataset.previewDesktop || '420px';
        }
        return root.dataset.previewDesktop || '420px';
    };

    function destroy(root, resetDom = false) {
        const state = states.get(root);
        if (!state) return;

        window.clearTimeout(state.resizeTimer);
        window.clearTimeout(state.transitionTimer);
        window.removeEventListener('resize', state.scheduleEvaluate);
        state.resizeObserver?.disconnect();
        state.cleanups.forEach(cleanup => cleanup());
        states.delete(root);

        if (resetDom) {
            root.removeAttribute('data-xd-unfold-ready');
            root.classList.remove('xd-unfold--ready', 'is-expanded', 'is-not-overflowing', 'is-transitioning');
            root.style.removeProperty('--xd-unfold-duration');
            root.style.removeProperty('--xd-unfold-fade-height');
            state.viewport.style.removeProperty('max-height');
        }
    }

    function init(root, force = false) {
        if (!(root instanceof HTMLElement) || !root.isConnected) return;
        const oldState = states.get(root);
        if (oldState && !force) return;

        const viewport = root.querySelector(':scope > .xd-unfold__viewport');
        const content = viewport?.querySelector(':scope > .xd-unfold__content');
        const controls = root.querySelector(':scope > [data-xd-unfold-controls]');
        const button = controls?.querySelector('[data-xd-unfold-button]');
        const label = button?.querySelector('[data-xd-unfold-label]');
        if (!viewport || !content || !controls || !button || !label) {
            destroy(root, true);
            return;
        }

        const initialState = root.dataset.initialState === 'expanded' ? 'expanded' : 'collapsed';
        const preserveExpanded = oldState?.initialState === initialState ? oldState.expanded : null;
        destroy(root);
        root.classList.remove('is-transitioning');

        const state = {
            viewport,
            content,
            controls,
            button,
            label,
            initialState,
            expanded: preserveExpanded ?? (initialState === 'expanded'),
            transitioning: false,
            resizeTimer: 0,
            transitionTimer: 0,
            resizeObserver: null,
            cleanups: [],
            scheduleEvaluate: null,
        };
        states.set(root, state);
        root.dataset.xdUnfoldReady = '1';

        const showCollapse = bool(root.dataset.showCollapse);
        const autoHide = bool(root.dataset.autoHide);
        const scrollBack = bool(root.dataset.scrollBack);
        const expandText = root.dataset.expandText || 'Show more';
        const collapseText = root.dataset.collapseText || 'Show less';
        const configuredDuration = clamp(Number.parseInt(root.dataset.duration || '450', 10) || 0, 0, 1500);
        const duration = reducedMotion() ? 0 : configuredDuration;

        root.style.setProperty('--xd-unfold-duration', `${duration}ms`);
        root.style.setProperty('--xd-unfold-fade-height', root.dataset.fadeHeight || '90px');

        const isCurrent = () => states.get(root) === state && root.isConnected;

        const setButton = () => {
            button.setAttribute('aria-expanded', state.expanded ? 'true' : 'false');
            label.textContent = state.expanded ? collapseText : expandText;
            root.classList.toggle('is-expanded', state.expanded);
            controls.hidden = state.expanded && !showCollapse;
        };

        const getPreviewPixels = () => {
            const previous = viewport.style.maxHeight;
            viewport.style.maxHeight = activePreview(root);
            const pixels = Number.parseFloat(window.getComputedStyle(viewport).maxHeight);
            viewport.style.maxHeight = previous;
            return Number.isFinite(pixels) ? pixels : 420;
        };

        const evaluate = () => {
            if (!isCurrent() || state.transitioning) return;
            if (state.expanded) {
                viewport.style.maxHeight = 'none';
                root.classList.remove('is-not-overflowing');
                setButton();
                return;
            }

            const overflowing = content.scrollHeight > getPreviewPixels() + 1;
            root.classList.toggle('is-not-overflowing', !overflowing);
            if (!overflowing && autoHide) {
                viewport.style.maxHeight = 'none';
                setButton();
                controls.hidden = true;
                return;
            }

            viewport.style.maxHeight = activePreview(root);
            controls.hidden = false;
            setButton();
        };

        const finishTransition = callback => {
            window.clearTimeout(state.transitionTimer);
            state.transitionTimer = window.setTimeout(() => {
                if (!isCurrent()) return;
                state.transitioning = false;
                root.classList.remove('is-transitioning');
                callback?.();
            }, duration + 30);
        };

        const expand = () => {
            if (state.expanded || state.transitioning) return;
            state.expanded = true;
            state.transitioning = true;
            root.classList.add('is-transitioning');
            root.classList.remove('is-not-overflowing');
            controls.hidden = false;
            viewport.style.maxHeight = `${viewport.getBoundingClientRect().height}px`;
            viewport.getBoundingClientRect();
            setButton();

            window.requestAnimationFrame(() => {
                if (isCurrent()) viewport.style.maxHeight = `${content.scrollHeight}px`;
            });
            finishTransition(() => {
                viewport.style.maxHeight = 'none';
                if (!showCollapse) controls.hidden = true;
            });
        };

        const collapse = () => {
            if (!state.expanded || !showCollapse || state.transitioning) return;
            state.expanded = false;
            state.transitioning = true;
            root.classList.add('is-transitioning');
            controls.hidden = false;
            viewport.style.maxHeight = `${content.scrollHeight}px`;
            viewport.getBoundingClientRect();
            setButton();

            window.requestAnimationFrame(() => {
                if (isCurrent()) viewport.style.maxHeight = activePreview(root);
            });
            finishTransition(() => {
                evaluate();
                if (scrollBack && root.getBoundingClientRect().top < 0) {
                    root.scrollIntoView({ behavior: duration === 0 ? 'auto' : 'smooth', block: 'start' });
                }
            });
        };

        const onClick = () => state.expanded ? collapse() : expand();
        const onFocusIn = event => {
            if (state.expanded || !(event.target instanceof HTMLElement) || !content.contains(event.target)) return;
            if (event.target.getBoundingClientRect().bottom > viewport.getBoundingClientRect().bottom + 1) expand();
        };
        state.scheduleEvaluate = () => {
            window.clearTimeout(state.resizeTimer);
            state.resizeTimer = window.setTimeout(evaluate, 80);
        };

        button.addEventListener('click', onClick);
        root.addEventListener('focusin', onFocusIn);
        window.addEventListener('resize', state.scheduleEvaluate, { passive: true });
        state.cleanups.push(
            () => button.removeEventListener('click', onClick),
            () => root.removeEventListener('focusin', onFocusIn),
        );

        if ('ResizeObserver' in window) {
            state.resizeObserver = new ResizeObserver(state.scheduleEvaluate);
            state.resizeObserver.observe(content);
        }

        content.querySelectorAll('img').forEach(image => {
            if (image.complete) return;
            const onImageSettled = state.scheduleEvaluate;
            image.addEventListener('load', onImageSettled, { once: true });
            image.addEventListener('error', onImageSettled, { once: true });
            state.cleanups.push(() => {
                image.removeEventListener('load', onImageSettled);
                image.removeEventListener('error', onImageSettled);
            });
        });

        root.classList.add('xd-unfold--ready');
        setButton();
        evaluate();
    }

    function queueRefresh(root) {
        if (!(root instanceof HTMLElement) || !root.isConnected) return;
        pendingRefresh.add(root);
        if (refreshFrame) return;
        refreshFrame = window.requestAnimationFrame(() => {
            refreshFrame = 0;
            const roots = [...pendingRefresh];
            pendingRefresh.clear();
            roots.forEach(rootElement => init(rootElement, true));
        });
    }

    const initAll = (scope = document, force = false) => {
        if (scope instanceof Element && scope.matches(SELECTOR)) {
            force ? queueRefresh(scope) : init(scope);
        }
        scope.querySelectorAll?.(SELECTOR).forEach(root => force ? queueRefresh(root) : init(root));
    };

    const start = () => {
        initAll();
        if (!('MutationObserver' in window) || !document.body) return;

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes') {
                    queueRefresh(mutation.target);
                    continue;
                }

                mutation.addedNodes.forEach(node => {
                    if (!(node instanceof Element)) return;
                    initAll(node);
                    const root = node.closest(SELECTOR);
                    if (root && states.has(root)) queueRefresh(root);
                });
                mutation.removedNodes.forEach(node => {
                    if (!(node instanceof Element)) return;
                    const removedRoots = [node.matches(SELECTOR) ? node : null, ...node.querySelectorAll(SELECTOR)].filter(Boolean);
                    window.requestAnimationFrame(() => removedRoots.forEach(root => {
                        if (!root.isConnected) destroy(root, true);
                    }));
                });
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: [
                'data-preview-desktop', 'data-preview-tablet', 'data-preview-mobile',
                'data-initial-state', 'data-show-collapse', 'data-auto-hide', 'data-fade',
                'data-fade-height', 'data-duration', 'data-scroll-back',
                'data-expand-text', 'data-collapse-text',
            ],
        });
    };

    document.addEventListener('yootheme:builder:render', () => initAll(document, true));
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
