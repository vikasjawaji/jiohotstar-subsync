// content.js — ISOLATED world. FAB UI + subtitle style controls.
(function () {
    'use strict';

    let delayOffset = 0.0;
    const STEP = 0.25;
    let expanded = false;
    let currentTheme = 'glass'; // Default theme selection

    function sendOffset(val) {
        delayOffset = Math.round(val * 100) / 100;
        window.dispatchEvent(new CustomEvent('jhs-set-offset', { detail: { offset: delayOffset } }));
        updateDisplay();
    }
    function adjust(delta) { sendOffset(delayOffset + delta); }
    function sendStyle(obj) { window.dispatchEvent(new CustomEvent('jhs-set-style', { detail: obj })); }
    function resetStyle() { window.dispatchEvent(new CustomEvent('jhs-reset-style')); }

    // ── Inject Google Fonts ──────────────────────────────────
    function injectFonts() {
        if (document.getElementById('jhs-fonts')) return;
        const link = document.createElement('link');
        link.id = 'jhs-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(link);
    }

    // ── Theme Style Pack Dictionary ──────────────────────────
    const THEME_STYLES = {
        glass: `
      #jhs-root {
        --accent: #f5c842; --accent2: #4fc3f7; --neg: #4fc3f7; --pos: #f5c842;
        --bg-panel: rgba(22, 28, 41, 0.82); --bg-card: rgba(255, 255, 255, 0.04);
        --bg-card-hover: rgba(255, 255, 255, 0.09); --border: rgba(255, 255, 255, 0.08);
        --text: #f8fafc; --muted: #94a3b8;
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
        --shadow-long: 0 20px 25px -5px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        --blur: blur(24px) saturate(180%);
      }
      #jhs-fab, #jhs-panel { backdrop-filter: var(--blur); -webkit-backdrop-filter: var(--blur); }
      #jhs-fab:hover { border-color: rgba(245, 200, 66, 0.4); box-shadow: 0 0 20px rgba(245, 200, 66, 0.2), var(--shadow); transform: translateY(-2px) scale(1.04); }
    `,
        simple: `
      #jhs-root {
        --accent: #3b82f6; --accent2: #06b6d4; --neg: #06b6d4; --pos: #3b82f6;
        --bg-panel: #0f172a; --bg-card: #1e293b;
        --bg-card-hover: #334155; --border: #334155;
        --text: #f8fafc; --muted: #64748b;
        --shadow: 0 1px 3px rgba(0,0,0,0.2);
        --shadow-long: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        --blur: none;
      }
      #jhs-fab:hover { border-color: var(--accent); transform: scale(1.02); }
    `,
        neubrutalism: `
      #jhs-root {
        --accent: #ffde4d; --accent2: #5271ff; --neg: #5271ff; --pos: #ffde4d;
        --bg-panel: #ffffff; --bg-card: #f0f0f0;
        --bg-card-hover: #e0e0e0; --border: #000000;
        --text: #000000; --muted: #666666;
        --shadow: 2px 2px 0px #000000;
        --shadow-long: 6px 6px 0px #000000;
        --blur: none;
      }
      #jhs-root { --border-width: 2px; }
      #jhs-fab, #jhs-panel, .jhs-abtn, .jhs-chip, .jhs-pill, #jhs-preview { border-width: 2px !important; }
      #jhs-fab:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0px #000000 !important; }
      .jhs-abtn:hover, .jhs-chip:hover, .jhs-pill:hover { transform: translate(-1px, -1px); box-shadow: 2px 2px 0px #000000 !important; }
    `
    };

    // ── Switcher logic ───────────────────────────────────────
    function applyThemeStyles(themeName) {
        let themeInject = document.getElementById('jhs-theme-runtime');
        if (!themeInject) {
            themeInject = document.createElement('style');
            themeInject.id = 'jhs-theme-runtime';
            document.head.appendChild(themeInject);
        }
        themeInject.textContent = THEME_STYLES[themeName] || THEME_STYLES.glass;

        const root = document.getElementById('jhs-root');
        if (root) {
            root.querySelectorAll('#jhs-themes .jhs-pill').forEach(pill => {
                pill.classList.toggle('sel', pill.dataset.theme === themeName);
            });
        }
    }

    // ── Build UI ─────────────────────────────────────────────
    function buildUI() {
        if (document.getElementById('jhs-root')) return;
        injectFonts();

        const style = document.createElement('style');
        style.id = 'jhs-style';
        style.textContent = `
      /* ── Layout Standard Core ── */
      #jhs-root {
        position: fixed; bottom: 32px; right: 32px; z-index: 2147483647;
        font-family: 'DM Sans', sans-serif; box-sizing: border-box; -webkit-font-smoothing: antialiased;
      }
      #jhs-root *, #jhs-root *::before, #jhs-root *::after { box-sizing: inherit; }

      #jhs-fab {
        width: 56px; height: 56px; border-radius: 50%; background: var(--bg-panel);
        border: 1px solid var(--border); box-shadow: var(--shadow); cursor: move;
        display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 2px;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; user-select: none; position: relative;
      }
      #jhs-fab:active { transform: none; }
      #jhs-fab.active { border-color: var(--accent); background: var(--bg-card-hover); }

      #jhs-fab-icon { font-size: 20px; line-height: 1; }
      #jhs-fab-offset {
        font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 500;
        color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; line-height: 1;
      }
      #jhs-root.jhs-has-offset #jhs-fab-offset { color: var(--accent); }
      #jhs-root.jhs-neg-offset #jhs-fab-offset { color: var(--neg); }

      #jhs-panel {
        position: absolute; bottom: 72px; right: 0; width: 320px; max-width: calc(100vw - 64px);
        background: var(--bg-panel); border: 1px solid var(--border); border-radius: 20px;
        box-shadow: var(--shadow-long); overflow: hidden; transform-origin: bottom right;
        transform: scale(0.9) translateY(12px); opacity: 0; pointer-events: none;
        transition: transform 0.23s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.18s ease;
      }
      #jhs-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

      #jhs-phead {
        display: flex; align-items: center; justify-content: space-between; padding: 16px 20px;
        border-bottom: 1px solid var(--border); background: rgba(255, 255, 255, 0.01); cursor: move;
      }
      #jhs-ptitle { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; color: var(--text); display: flex; align-items: center; }
      #jhs-ptitle span { color: var(--accent); margin-right: 8px; font-size: 16px; }
      #jhs-pclose {
        background: rgba(255, 255, 255, 0.05); border: none; color: var(--muted); font-size: 12px;
        width: 24px; height: 24px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
      }
      #jhs-pclose:hover { color: #fff; background: rgba(239, 68, 68, 0.8); }

      #jhs-tabs { display: flex; padding: 0 8px; background: rgba(0, 0, 0, 0.1); border-bottom: 1px solid var(--border); }
      .jhs-tab {
        flex: 1; background: none; border: none; border-bottom: 2px solid transparent; color: var(--muted);
        font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 12px 0; cursor: pointer; text-align: center; transition: all 0.2s;
      }
      .jhs-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
      .jhs-tab:hover:not(.active) { color: var(--text); background: rgba(255, 255, 255, 0.02); }

      .jhs-tabpane { display: none; padding: 22px 20px; }
      .jhs-tabpane.active { display: block; }

      /* ── Beautiful Balanced Ticker Display ── */
      #jhs-display { 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 8px; 
        margin: 12px 0 6px 0;
        height: 52px;
      }
      #jhs-sign-btn {
        font-family: 'DM Mono', monospace; 
        font-size: 28px; 
        color: var(--muted); 
        width: 24px; 
        text-align: center;
        font-weight: 400;
        line-height: 1;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: color 0.15s, transform 0.1s;
      }
      #jhs-sign-btn:hover { color: var(--text); transform: scale(1.1); }
      #jhs-sign-btn:active { transform: scale(0.9); }

      #jhs-val { 
        font-family: 'DM Sans', sans-serif; 
        font-size: 44px; 
        font-weight: 800; 
        color: var(--text); 
        letter-spacing: -1px; 
        line-height: 1;
        padding: 0 4px;
        border-radius: 6px;
        transition: background 0.15s, color 0.15s;
        min-width: 90px;
        text-align: center;
      }
      #jhs-val[contenteditable="true"] {
        background: rgba(255, 255, 255, 0.08);
        color: #fff !important;
        outline: none;
        box-shadow: inset 0 0 0 1px var(--border);
        cursor: text;
      }
      #jhs-unit { 
        font-family: 'DM Mono', monospace; 
        font-size: 16px; 
        color: var(--muted);
        width: 18px;
        font-weight: 500;
        align-self: flex-end;
        margin-bottom: 6px;
        line-height: 1;
      }
      #jhs-statelabel { 
        text-align: center; 
        font-size: 10px; 
        font-weight: 600; 
        letter-spacing: 1.8px; 
        text-transform: uppercase; 
        color: var(--muted); 
        margin-bottom: 24px; 
      }
      
      #jhs-root.jhs-has-offset #jhs-val, #jhs-root.jhs-has-offset #jhs-sign-btn { color: var(--pos); }
      #jhs-root.jhs-has-offset #jhs-statelabel { color: rgba(245, 200, 66, 0.9); }
      #jhs-root.jhs-neg-offset #jhs-val, #jhs-root.jhs-neg-offset #jhs-sign-btn { color: var(--neg); }
      #jhs-root.jhs-neg-offset #jhs-statelabel { color: rgba(79, 195, 247, 0.9); }

      #jhs-btnrow { display: flex; gap: 6px; }
      .jhs-abtn {
        flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px;
        color: var(--text); font-family: 'DM Mono', monospace; font-size: 11px; padding: 11px 2px; cursor: pointer; transition: all 0.15s; box-shadow: var(--shadow);
      }
      .jhs-abtn:hover { background: var(--bg-card-hover); border-color: rgba(255,255,255,0.15); transform: translateY(-1px); }
      .jhs-abtn:active { transform: translateY(1px); }
      #jhs-resetbtn { background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.2); color: #f87171; font-weight: 600; }
      #jhs-resetbtn:hover { background: rgba(239, 68, 68, 0.18); }

      #jhs-hint { text-align: center; font-size: 10px; color: var(--muted); opacity: 0.5; margin-top: 16px; letter-spacing: 0.5px; }

      .jhs-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
      .jhs-rlabel { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--muted); min-width: 72px; }
      .jhs-rcontrols { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

      .jhs-swatch { width: 24px; height: 24px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.15s; }
      .jhs-swatch:hover { transform: scale(1.15); }
      .jhs-swatch.sel { border-color: var(--text); box-shadow: 0 0 8px currentColor; }

      .jhs-chip, .jhs-pill {
        background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--muted);
        font-family: 'DM Mono', monospace; font-size: 10px; padding: 5px 9px; cursor: pointer; transition: all 0.15s;
      }
      .jhs-chip:hover, .jhs-pill:hover { color: var(--text); background: var(--bg-card-hover); }
      .jhs-chip.sel { background: rgba(245, 200, 66, 0.12); border-color: var(--accent); color: var(--accent); }
      .jhs-pill.sel { background: rgba(79, 195, 247, 0.12); border-color: var(--neg); color: var(--neg); }

      #jhs-stylereset {
        width: 100%; margin-top: 16px; background: var(--bg-card); border: 1px solid var(--border);
        border-radius: 10px; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; padding: 10px; cursor: pointer; letter-spacing: 0.5px; transition: all 0.15s;
      }
      #jhs-stylereset:hover { background: rgba(239, 68, 68, 0.08); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }

      #jhs-preview {
        margin-bottom: 16px; border-radius: 10px; padding: 10px 14px; background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border); text-align: center; font-size: 15px; color: white; min-height: 44px; display: flex; align-items: center; justify-content: center;
      }

      .jhs-theme-divider { margin-top: 18px; padding-top: 12px; border-top: 1px dashed var(--border); }
    `;
        document.head.appendChild(style);

        const root = document.createElement('div');
        root.id = 'jhs-root';
        root.innerHTML = `
      <div id="jhs-fab" title="Subtitle Sync">
        <span id="jhs-fab-icon">⏱</span>
        <span id="jhs-fab-offset">sync</span>
      </div>

      <div id="jhs-panel">
        <div id="jhs-phead">
          <span id="jhs-ptitle"><span>⏱</span>SubSync</span>
          <button id="jhs-pclose">✕</button>
        </div>

        <div id="jhs-tabs">
          <button class="jhs-tab active" data-tab="sync">Sync</button>
          <button class="jhs-tab" data-tab="style">Style</button>
        </div>

        <div class="jhs-tabpane active" id="jhs-tab-sync">
          <div id="jhs-display">
            <button id="jhs-sign-btn" title="Toggle positive/negative delay">±</button>
            <div id="jhs-val" title="Double click to type value">0.00</div>
            <span id="jhs-unit">s</span>
          </div>
          <div id="jhs-statelabel">in sync</div>
          <div id="jhs-btnrow">
            <button class="jhs-abtn" id="jhs-m2">−1s</button>
            <button class="jhs-abtn" id="jhs-m1">−0.25s</button>
            <button class="jhs-abtn" id="jhs-resetbtn">Reset</button>
            <button class="jhs-abtn" id="jhs-p1">+0.25s</button>
            <button class="jhs-abtn" id="jhs-p2">+1s</button>
          </div>
          <div id="jhs-hint">A = advance &nbsp;·&nbsp; D = delay &nbsp;·&nbsp; dblclick to edit</div>
        </div>

        <div class="jhs-tabpane" id="jhs-tab-style">
          <div id="jhs-preview">Subtitle preview text</div>

          <div class="jhs-row">
            <span class="jhs-rlabel">Color</span>
            <div class="jhs-rcontrols" id="jhs-colors">
              <div class="jhs-swatch sel" data-color="white"   style="background:#ffffff; color:#ffffff;" title="White"></div>
              <div class="jhs-swatch"     data-color="#f5e642" style="background:#f5e642; color:#f5e642;" title="Yellow"></div>
              <div class="jhs-swatch"     data-color="#5bc8f5" style="background:#5bc8f5; color:#5bc8f5;" title="Cyan"></div>
              <div class="jhs-swatch"     data-color="#7bffa0" style="background:#7bffa0; color:#7bffa0;" title="Green"></div>
              <div class="jhs-swatch"     data-color="#ffaa55" style="background:#ffaa55; color:#ffaa55;" title="Orange"></div>
              <div class="jhs-swatch"     data-color="#ff7eb3" style="background:#ff7eb3; color:#ff7eb3;" title="Pink"></div>
            </div>
          </div>

          <div class="jhs-row">
            <span class="jhs-rlabel">Size</span>
            <div class="jhs-rcontrols" id="jhs-sizes">
              <div class="jhs-chip" data-size="14px">S</div>
              <div class="jhs-chip sel" data-size="18px">M</div>
              <div class="jhs-chip" data-size="24px">L</div>
              <div class="jhs-chip" data-size="30px">XL</div>
              <div class="jhs-chip" data-size="38px">2XL</div>
            </div>
          </div>

          <div class="jhs-row">
            <span class="jhs-rlabel">Font</span>
            <div class="jhs-rcontrols" id="jhs-fonts-ctrl">
              <div class="jhs-chip sel" data-font="sans-serif" style="font-family:sans-serif">Sans</div>
              <div class="jhs-chip" data-font="serif" style="font-family:serif">Serif</div>
              <div class="jhs-chip" data-font="'DM Mono',monospace" style="font-family:monospace">Mono</div>
              <div class="jhs-chip" data-font="'Georgia',serif" style="font-family:Georgia,serif">Geo</div>
            </div>
          </div>

          <div class="jhs-row">
            <span class="jhs-rlabel">Shadow</span>
            <div class="jhs-rcontrols" id="jhs-shadows">
              <div class="jhs-pill sel" data-shadow="none">Off</div>
              <div class="jhs-pill" data-shadow="0 2px 6px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)">Drop</div>
              <div class="jhs-pill" data-shadow="-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000">Outline</div>
              <div class="jhs-pill" data-shadow="0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,255,255,0.4)">Glow</div>
            </div>
          </div>

          <div class="jhs-row">
            <span class="jhs-rlabel">BG</span>
            <div class="jhs-rcontrols" id="jhs-bgs">
              <div class="jhs-pill sel" data-bg="">None</div>
              <div class="jhs-pill" data-bg="rgba(0,0,0,0.6)">Dark</div>
              <div class="jhs-pill" data-bg="rgba(0,0,0,0.85)">Black</div>
              <div class="jhs-pill" data-bg="rgba(232,200,74,0.18)">Amber</div>
            </div>
          </div>

          <div class="jhs-row">
            <span class="jhs-rlabel">Weight</span>
            <div class="jhs-rcontrols" id="jhs-weights">
              <div class="jhs-chip" data-weight="300">Light</div>
              <div class="jhs-chip sel" data-weight="400">Normal</div>
              <div class="jhs-chip" data-weight="700">Bold</div>
              <div class="jhs-chip" data-weight="900">Black</div>
            </div>
          </div>

          <div class="jhs-row jhs-theme-divider">
            <span class="jhs-rlabel">Theme</span>
            <div class="jhs-rcontrols" id="jhs-themes">
              <div class="jhs-pill sel" data-theme="glass">Glass</div>
              <div class="jhs-pill" data-theme="simple">Simple</div>
              <div class="jhs-pill" data-theme="neubrutalism">Funk</div>
            </div>
          </div>

          <button id="jhs-stylereset">↺ Reset Styles</button>
        </div>
      </div>
    `;
        document.body.appendChild(root);
        wireEvents(root);
        applyThemeStyles(currentTheme);
    }

    // ── Wire all interactions ─────────────────────────────────
    function wireEvents(root) {
        const fab    = root.querySelector('#jhs-fab');
        const panel  = root.querySelector('#jhs-panel');
        const pclose = root.querySelector('#jhs-pclose');
        const phead  = root.querySelector('#jhs-phead');
        const valEl  = root.querySelector('#jhs-val');
        const signBtn = root.querySelector('#jhs-sign-btn');

        // ── Drag & Click Management for FAB ──
        let clickPrevented = false;

        fab.addEventListener('click', () => {
            if (clickPrevented) return;
            expanded = !expanded;
            panel.classList.toggle('open', expanded);
            fab.classList.toggle('active', expanded);
        });

        // ── Fixed Close Panel Button ──
        pclose.onclick = (e) => {
            e.stopPropagation(); // Stops the panel container from immediately toggling itself back open
            expanded = false;
            panel.classList.remove('open');
            fab.classList.remove('active');
        };

        // ── Inline Editable Digit Support ──
        valEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            valEl.setAttribute('contenteditable', 'true');
            valEl.focus();
            document.execCommand('selectAll', false, null);
        });

        function commitCustomTime() {
            valEl.removeAttribute('contenteditable');
            let parsed = parseFloat(valEl.textContent);
            if (isNaN(parsed)) {
                parsed = 0.00;
            }
            const currentSign = signBtn.textContent === '−' ? -1 : 1;
            sendOffset(Math.abs(parsed) * currentSign);
        }

        valEl.addEventListener('blur', commitCustomTime);
        valEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                commitCustomTime();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                updateDisplay();
                valEl.removeAttribute('contenteditable');
            }
        });

        // Sign button click toggles polarity
        signBtn.onclick = () => {
            sendOffset(delayOffset * -1);
        };

        // Tabs
        root.querySelectorAll('.jhs-tab').forEach(tab => {
            tab.onclick = () => {
                root.querySelectorAll('.jhs-tab').forEach(t => t.classList.remove('active'));
                root.querySelectorAll('.jhs-tabpane').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                root.querySelector('#jhs-tab-' + tab.dataset.tab).classList.add('active');
            };
        });

        // Sync buttons
        root.querySelector('#jhs-m2').onclick      = () => adjust(-1.0);
        root.querySelector('#jhs-m1').onclick      = () => adjust(-STEP);
        root.querySelector('#jhs-resetbtn').onclick = () => sendOffset(0);
        root.querySelector('#jhs-p1').onclick      = () => adjust(+STEP);
        root.querySelector('#jhs-p2').onclick      = () => adjust(+1.0);

        // Style: colors
        root.querySelectorAll('#jhs-colors .jhs-swatch').forEach(sw => {
            sw.onclick = () => {
                root.querySelectorAll('#jhs-colors .jhs-swatch').forEach(s => s.classList.remove('sel'));
                sw.classList.add('sel');
                const c = sw.dataset.color;
                sendStyle({ color: c });
                updatePreview(root);
            };
        });

        // Style: sizes
        root.querySelectorAll('#jhs-sizes .jhs-chip').forEach(ch => {
            ch.onclick = () => {
                root.querySelectorAll('#jhs-sizes .jhs-chip').forEach(c => c.classList.remove('sel'));
                ch.classList.add('sel');
                sendStyle({ fontSize: ch.dataset.size });
                updatePreview(root);
            };
        });

        // Style: fonts
        root.querySelectorAll('#jhs-fonts-ctrl .jhs-chip').forEach(ch => {
            ch.onclick = () => {
                root.querySelectorAll('#jhs-fonts-ctrl .jhs-chip').forEach(c => c.classList.remove('sel'));
                ch.classList.add('sel');
                sendStyle({ fontFamily: ch.dataset.font });
                updatePreview(root);
            };
        });

        // Style: shadows
        root.querySelectorAll('#jhs-shadows .jhs-pill').forEach(p => {
            p.onclick = () => {
                root.querySelectorAll('#jhs-shadows .jhs-pill').forEach(x => x.classList.remove('sel'));
                p.classList.add('sel');
                sendStyle({ textShadow: p.dataset.shadow === 'none' ? '' : p.dataset.shadow });
                updatePreview(root);
            };
        });

        // Style: backgrounds
        root.querySelectorAll('#jhs-bgs .jhs-pill').forEach(p => {
            p.onclick = () => {
                root.querySelectorAll('#jhs-bgs .jhs-pill').forEach(x => x.classList.remove('sel'));
                p.classList.add('sel');
                sendStyle({ background: p.dataset.bg });
                updatePreview(root);
            };
        });

        // Style: weights
        root.querySelectorAll('#jhs-weights .jhs-chip').forEach(ch => {
            ch.onclick = () => {
                root.querySelectorAll('#jhs-weights .jhs-chip').forEach(c => c.classList.remove('sel'));
                ch.classList.add('sel');
                sendStyle({ fontWeight: ch.dataset.weight });
                updatePreview(root);
            };
        });

        // Switcher row map
        root.querySelectorAll('#jhs-themes .jhs-pill').forEach(pill => {
            pill.onclick = () => {
                currentTheme = pill.dataset.theme;
                applyThemeStyles(currentTheme);
            };
        });

        // Style reset
        root.querySelector('#jhs-stylereset').onclick = () => {
            resetStyle();
            root.querySelectorAll('#jhs-colors .jhs-swatch').forEach((s,i) => s.classList.toggle('sel', i===0));
            root.querySelectorAll('#jhs-sizes .jhs-chip').forEach((c,i) => c.classList.toggle('sel', i===1));
            root.querySelectorAll('#jhs-fonts-ctrl .jhs-chip').forEach((c,i) => c.classList.toggle('sel', i===0));
            root.querySelectorAll('#jhs-shadows .jhs-pill').forEach((p,i) => p.classList.toggle('sel', i===0));
            root.querySelectorAll('#jhs-bgs .jhs-pill').forEach((p,i) => p.classList.toggle('sel', i===0));
            root.querySelectorAll('#jhs-weights .jhs-chip').forEach((c,i) => c.classList.toggle('sel', i===1));
            updatePreview(root);
        };

        // Connect drag listeners both to header panel AND the circular button
        makeDraggable(root, phead, () => {});
        makeDraggable(root, fab, (didDrag) => { clickPrevented = didDrag; });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (expanded && !root.contains(e.target)) {
                expanded = false;
                panel.classList.remove('open');
                fab.classList.remove('active');
            }
        }, true);
    }

    // ── Live preview updater ──────────────────────────────────
    function updatePreview(root) {
        const preview = root.querySelector('#jhs-preview');
        if (!preview) return;
        const color   = root.querySelector('#jhs-colors .jhs-swatch.sel')?.dataset.color || 'white';
        const size    = root.querySelector('#jhs-sizes .jhs-chip.sel')?.dataset.size || '18px';
        const font    = root.querySelector('#jhs-fonts-ctrl .jhs-chip.sel')?.dataset.font || 'sans-serif';
        const shadow  = root.querySelector('#jhs-shadows .jhs-pill.sel')?.dataset.shadow || 'none';
        const bg      = root.querySelector('#jhs-bgs .jhs-pill.sel')?.dataset.bg || '';
        const weight  = root.querySelector('#jhs-weights .jhs-chip.sel')?.dataset.weight || '400';
        preview.style.cssText = `
      color: ${color};
      font-size: ${size};
      font-family: ${font};
      text-shadow: ${shadow === 'none' ? 'none' : shadow};
      background: ${bg || 'rgba(0,0,0,0.4)'};
      font-weight: ${weight};
      border-radius: 8px;
      padding: 8px 12px;
      text-align: center;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(255,255,255,0.07);
      transition: all 0.2s;
    `;
    }

    // ── Display updater ───────────────────────────────────────
    function updateDisplay() {
        const root    = document.getElementById('jhs-root');
        const valEl   = document.getElementById('jhs-val');
        const signBtn = document.getElementById('jhs-sign-btn');
        const labelEl = document.getElementById('jhs-statelabel');
        const fabOff  = document.getElementById('jhs-fab-offset');
        if (!valEl || !root) return;

        if (valEl.getAttribute('contenteditable') === 'true') return;

        const abs = Math.abs(delayOffset).toFixed(2);
        valEl.textContent = abs;

        root.classList.remove('jhs-has-offset', 'jhs-neg-offset');
        if (delayOffset > 0.001) {
            signBtn.textContent = '+';
            labelEl.textContent = 'subtitles delayed';
            fabOff.textContent  = '+' + abs + 's';
            root.classList.add('jhs-has-offset');
        } else if (delayOffset < -0.001) {
            signBtn.textContent = '−';
            labelEl.textContent = 'subtitles advanced';
            fabOff.textContent  = '−' + abs + 's';
            root.classList.add('jhs-neg-offset');
        } else {
            signBtn.textContent = '±';
            labelEl.textContent = 'in sync';
            fabOff.textContent  = 'sync';
        }
    }

    // ── Drag (Simple, Natural Delta Movement Pack) ────────────
    function makeDraggable(root, handle, callback) {
        let active = false;
        let moved = false;

        handle.onmousedown = (e) => {
            if (e.target.id === 'jhs-pclose' || e.target.id === 'jhs-val' || e.target.id === 'jhs-sign-btn') return;
            e.preventDefault();
            active = true;
            moved = false;

            document.onmouseup = () => {
                active = false;
                document.onmouseup = null;
                document.onmousemove = null;
                if (callback) callback(moved);
            };

            document.onmousemove = (ev) => {
                if (!active) return;

                if (Math.abs(ev.movementX) > 1 || Math.abs(ev.movementY) > 1) {
                    moved = true;
                }

                let curBottom = parseInt(root.style.bottom || '32');
                let curRight  = parseInt(root.style.right || '32');

                root.style.bottom = (curBottom - ev.movementY) + "px";
                root.style.right  = (curRight - ev.movementX) + "px";
            };
        };
    }

    // ── Keyboard ─────────────────────────────────────────────
    window.addEventListener('keydown', (e) => {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || document.activeElement.getAttribute('contenteditable') === 'true') return;
        const key = e.key.toLowerCase();
        if (key === 'a') { e.preventDefault(); e.stopPropagation(); adjust(-STEP); }
        if (key === 'd') { e.preventDefault(); e.stopPropagation(); adjust(+STEP); }
    }, true);

    // ── SPA nav ──────────────────────────────────────────────
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(() => sendOffset(delayOffset), 2500);
        }
    }).observe(document.body, { childList: true, subtree: false });

    // ── Boot ─────────────────────────────────────────────────
    buildUI();
    updateDisplay();
    setTimeout(() => updatePreview(document.getElementById('jhs-root')), 500);
    console.log('[JHS] v5.0 ready');

})();