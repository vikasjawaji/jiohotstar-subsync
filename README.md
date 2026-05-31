# SubSync — Subtitle Synchronization for Hotstar

An elegant, zero-overhead browser extension built directly into the Hotstar playback viewport. SubSync provides a fluid, draggable overlay to resolve subtitle drift with sub-millisecond precision without disrupting your stream.

---

## ⚡ Key Features

* **Collapsible Layout Control:** Seamlessly switch between a lightweight, minimal ambient tracking button that sits entirely out of the way of cinematic frames, and an expanded glassmorphic dashboard.
* **On-the-Fly Micro Shifting:** Incrementally adjust timing using precise step targets ($\pm$0.25s) or macro jumps ($\pm$1.0s).
* **Direct Custom Time Entry:** Skip click workflows entirely. Double-click the counter digits to type and validate precise custom offset integers natively.
* **Zero Viewport Lock:** Fluidly drag the control node anywhere across the active video viewport to match your workspace environment.
* **Zero Performance Tax:** Operates via isolated script context injections. Does not filter network packets or block stream buffering queues.

---

## ⌨️ Keyboard Shortcuts

When the video player viewport has active focus, use these zero-distraction hotkeys:

| Command | Shortcut | Action |
| :--- | :--- | :--- |
| **Delay Subtitles** | <kbd>D</kbd> | Shifts timing forward (+0.25s Step) |
| **Advance Subtitles** | <kbd>A</kbd> | Shifts timing backward (−0.25s Step) |
| **Manual Input Unlock** | `Double-Click` | Opens inline digits for direct time parsing |

---

## 📦 Project Directory Anatomy

The project intentionally decouples core distribution logic from layout presentation files to optimize package size updates:

```text
jiohotstar-subsync/
├── extension/          <-- THE ONLY DIRECTORY LOADED INTO CHROME
│   ├── manifest.json   <-- Package configuration rules
│   ├── content.js      <-- Floating UI runtime and DOM management
│   └── page.js         <-- Isolated execution injection hooks
└── docs/               <-- Static web marketing landing page workspace
