(() => {
    'use strict';

    const SELECTOR = '[data-xd-unfold]';
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    const bool = (value) => value === '1' || value === 'true';
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const activePreview = (root) => {
        if (window.innerWidth < 640) {
            return root.dataset.previewMobile || root.dataset.previewTablet || root.dataset.previewDesktop || '420px';
        }
        if (window.innerWidth < 960) {
            return root.dataset.previewTablet || root.dataset.previewDesktop || '420px';
        }
        return root.dataset.previewDesktop || '420px';
    };

    const init = (root) => {
        if (!(root instanceof HTMLElement) || root.dataset.xdUnfoldReady === '1') {
            return;
        }

        const viewport = root.querySelector(':scope > .xd-unfold__viewport');
        const content = viewport?.querySelector(':scope > .xd-unfold__content');
        const controls = root.querySelector(':scope > [data-xd-unfold-controls]');
        const button = controls?.querySelector('[data-xd-unfold-button]');
        const label = button?.querySelector('[data-xd-unfold-label]');

        if (!viewport || !content || !controls || !button || !label) {
            return;
        }

        root.dataset.xdUnfoldReady = '1';

        const showCollapse = bool(root.dataset.showCollapse);
        const autoHide = bool(root.dataset.autoHide);
        const scrollBack = bool(root.dataset.scrollBack);
        const expandText = root.dataset.expandText || 'Show more';
        const collapseText = root.dataset.collapseText || 'Show less';
        const configuredDuration = clamp(Number.parseInt(root.dataset.duration || '450', 10) || 0, 0, 1500);
        const duration = prefersReducedMotion?.matches ? 0 : configuredDuration;

        root.style.setProperty('--xd-unfold-duration', `${duration}ms`);
        root.style.setProperty('--xd-unfold-fade-height', root.dataset.fadeHeight || '90px');

        const state = {
            expanded: root.dataset.initialState === 'expanded',
            transitioning: false,
            resizeTimer: 0,
        };

        const setButton = () => {
            button.setAttribute('aria-expanded', state.expanded ? 'true' : 'false');
            label.textContent = state.expanded ? collapseText : expandText;
            root.classList.toggle('is-expanded', state.expanded);

            if (state.expanded && !showCollapse) {
                controls.hidden = true;
            }
        };

        const getPreviewPixels = () => {
            const previous = viewport.style.maxHeight;
            viewport.style.maxHeight = activePreview(root);
            const computed = window.getComputedStyle(viewport).maxHeight;
            const pixels = Number.parseFloat(computed);
            viewport.style.maxHeight = previous;
            return Number.isFinite(pixels) ? pixels : 420;
        };

        const hasOverflow = () => content.scrollHeight > getPreviewPixels() + 1;

        const evaluate = () => {
            if (state.transitioning) {
                return;
            }

            if (state.expanded) {
                viewport.style.maxHeight = 'none';
                root.classList.remove('is-not-overflowing');
                setButton();
                return;
            }

            const overflowing = hasOverflow();
            root.classList.toggle('is-not-overflowing', !overflowing);

            if (!overflowing && autoHide) {
                viewport.style.maxHeight = 'none';
                controls.hidden = true;
                return;
            }

            viewport.style.maxHeight = activePreview(root);
            controls.hidden = false;
            setButton();
        };

        const finishTransition = (callback) => {
            window.setTimeout(() => {
                state.transitioning = false;
                callback?.();
            }, duration + 30);
        };

        const expand = () => {
            if (state.expanded) {
                return;
            }

            const startHeight = viewport.getBoundingClientRect().height;
            const targetHeight = content.scrollHeight;

            state.expanded = true;
            state.transitioning = true;
            root.classList.remove('is-not-overflowing');
            controls.hidden = false;
            viewport.style.maxHeight = `${startHeight}px`;
            viewport.getBoundingClientRect();
            setButton();

            requestAnimationFrame(() => {
                viewport.style.maxHeight = `${targetHeight}px`;
            });

            finishTransition(() => {
                viewport.style.maxHeight = 'none';
                if (!showCollapse) {
                    controls.hidden = true;
                }
            });
        };

        const collapse = () => {
            if (!state.expanded || !showCollapse) {
                return;
            }

            const startHeight = content.scrollHeight;
            const targetHeight = activePreview(root);

            state.expanded = false;
            state.transitioning = true;
            controls.hidden = false;
            viewport.style.maxHeight = `${startHeight}px`;
            viewport.getBoundingClientRect();
            setButton();

            requestAnimationFrame(() => {
                viewport.style.maxHeight = targetHeight;
            });

            finishTransition(() => {
                evaluate();

                if (scrollBack) {
                    const rect = root.getBoundingClientRect();
                    if (rect.top < 0) {
                        root.scrollIntoView({
                            behavior: duration === 0 ? 'auto' : 'smooth',
                            block: 'start',
                        });
                    }
                }
            });
        };

        button.addEventListener('click', () => {
            if (state.transitioning) {
                return;
            }
            state.expanded ? collapse() : expand();
        });

        root.addEventListener('focusin', (event) => {
            if (state.expanded || !(event.target instanceof HTMLElement) || !content.contains(event.target)) {
                return;
            }

            const targetRect = event.target.getBoundingClientRect();
            const viewportRect = viewport.getBoundingClientRect();
            if (targetRect.bottom > viewportRect.bottom + 1) {
                expand();
            }
        });

        const scheduleEvaluate = () => {
            window.clearTimeout(state.resizeTimer);
            state.resizeTimer = window.setTimeout(evaluate, 80);
        };

        window.addEventListener('resize', scheduleEvaluate, {passive: true});

        if ('ResizeObserver' in window) {
            const observer = new ResizeObserver(scheduleEvaluate);
            observer.observe(content);
        }

        content.querySelectorAll('img').forEach((image) => {
            if (!image.complete) {
                image.addEventListener('load', scheduleEvaluate, {once: true});
                image.addEventListener('error', scheduleEvaluate, {once: true});
            }
        });

        root.classList.add('xd-unfold--ready');
        setButton();
        evaluate();
    };

    const initAll = (scope = document) => {
        if (scope instanceof Element && scope.matches(SELECTOR)) {
            init(scope);
        }
        scope.querySelectorAll?.(SELECTOR).forEach(init);
    };

    const start = () => {
        initAll();

        if ('MutationObserver' in window && document.body) {
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            initAll(node);
                        }
                    });
                }
            });
            observer.observe(document.body, {childList: true, subtree: true});
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, {once: true});
    } else {
        start();
    }
})();
