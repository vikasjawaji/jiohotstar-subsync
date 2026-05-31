// page.js — MAIN world. Patches currentTime + applies subtitle styles.
(function () {
    'use strict';

    let delayOffset = 0.0;
    let observer = null;
    let pendingNodes = [];
    let currentStyle = {};

    // ── Patch prototype currentTime ──────────────────────────
    const proto = HTMLMediaElement.prototype;
    const origDescriptor = Object.getOwnPropertyDescriptor(proto, 'currentTime');
    Object.defineProperty(proto, 'currentTime', {
        get() { return origDescriptor.get.call(this) - delayOffset; },
        set(v) { origDescriptor.set.call(this, v); },
        configurable: true, enumerable: true
    });

    // ── Subtitle style application ───────────────────────────
    function getContainer() {
        return document.querySelector('.shaka-text-container');
    }

    function applyStylesToNode(node) {
        if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
        const s = currentStyle;

        // Font size
        if (s.fontSize) node.style.setProperty('font-size', s.fontSize, 'important');

        // Font family
        if (s.fontFamily) node.style.setProperty('font-family', s.fontFamily, 'important');

        // Text color
        if (s.color) node.style.setProperty('color', s.color, 'important');

        // Background / highlight
        if (s.background !== undefined) {
            node.style.setProperty('background', s.background || 'transparent', 'important');
            if (s.background) {
                node.style.setProperty('padding', '4px 10px', 'important');
                node.style.setProperty('border-radius', '4px', 'important');
            } else {
                node.style.removeProperty('padding');
                node.style.removeProperty('border-radius');
            }
        }

        // Text shadow / outline
        if (s.textShadow !== undefined) {
            node.style.setProperty('text-shadow', s.textShadow || 'none', 'important');
        }

        // Bold
        if (s.fontWeight !== undefined) {
            node.style.setProperty('font-weight', s.fontWeight, 'important');
        }

        // Also apply to child spans
        node.querySelectorAll('span').forEach(span => {
            if (s.color) span.style.setProperty('color', s.color, 'important');
            if (s.fontSize) span.style.setProperty('font-size', s.fontSize, 'important');
            if (s.fontFamily) span.style.setProperty('font-family', s.fontFamily, 'important');
            if (s.fontWeight !== undefined) span.style.setProperty('font-weight', s.fontWeight, 'important');
            if (s.textShadow !== undefined) span.style.setProperty('text-shadow', s.textShadow || 'none', 'important');
        });
    }

    function reapplyStylesToAll() {
        const container = getContainer();
        if (!container) return;
        container.querySelectorAll('div').forEach(applyStylesToNode);
    }

    // ── DOM observer ─────────────────────────────────────────
    function flushPending() {
        pendingNodes.forEach(p => { clearTimeout(p.timer); showNode(p.node); });
        pendingNodes = [];
    }

    function showNode(node) {
        if (node && node.isConnected) node.style.removeProperty('visibility');
    }

    function startObserver() {
        if (observer) observer.disconnect();
        const container = getContainer();
        if (!container) { setTimeout(startObserver, 1000); return; }

        observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.nodeType !== Node.ELEMENT_NODE) return;

                    // Apply styles immediately to every new node
                    applyStylesToNode(node);

                    if (!node.dataset.jhsHandled && Math.abs(delayOffset) >= 0.01) {
                        node.dataset.jhsHandled = 'true';
                        if (delayOffset > 0) {
                            node.style.setProperty('visibility', 'hidden', 'important');
                            const timer = setTimeout(() => {
                                showNode(node);
                                pendingNodes = pendingNodes.filter(p => p.node !== node);
                            }, delayOffset * 1000);
                            pendingNodes.push({ node, timer });
                        }
                    }
                });
            });
        });

        observer.observe(container, { childList: true, subtree: true });
        console.log('[JHS-page] Observer ready');
    }

    let lastContainer = null;
    setInterval(() => {
        const c = getContainer();
        if (c && c !== lastContainer) { lastContainer = c; startObserver(); }
    }, 2000);

    startObserver();

    // ── Event bridge ─────────────────────────────────────────
    window.addEventListener('jhs-set-offset', (e) => {
        delayOffset = e.detail.offset;
        flushPending();
    });

    window.addEventListener('jhs-set-style', (e) => {
        currentStyle = { ...currentStyle, ...e.detail };
        reapplyStylesToAll();
    });

    window.addEventListener('jhs-reset-style', () => {
        currentStyle = {};
        const container = getContainer();
        if (!container) return;
        container.querySelectorAll('div, span').forEach(el => {
            ['font-size','font-family','color','background','padding',
                'border-radius','text-shadow','font-weight'].forEach(p => el.style.removeProperty(p));
        });
    });

})();
