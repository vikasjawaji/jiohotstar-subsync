# SubSync — Subtitle Synchronization for Hotstar

> Are your **Hotstar subtitles out of sync**? SubSync instantly fixes subtitle delay, audio-to-text drift, caption lag, and rendering mismatches on the JioHotstar web player — no app reinstall needed.

A free, open-source Chrome extension to **sync, advance, or delay out-of-sync subtitles on JioHotstar** using real-time keyboard shortcuts and a draggable floating panel. Works on both `jiohotstar.com` and `hotstar.com`.

**Search terms this solves:** *Hotstar subtitle delay fix · JioHotstar subtitles not syncing · subtitle out of sync hotstar chrome · hotstar caption delay · fix subtitle drift jiohotstar · hotstar subtitle offset chrome extension*

---

## ⚡ Key Features

* **Fix Subtitle Delay Instantly:** Advance or delay out-of-sync subtitle tracks on JioHotstar in real time without refreshing the page or restarting your stream.
* **Collapsible Floating Panel:** Seamlessly switch between a minimal ambient tracker button and an expanded glassmorphic dashboard — stays out of your cinematic frame.
* **Precision Micro-Shifting:** Fix subtitle drift incrementally with ±0.25s steps or jump ±1.0s at once to correct large audio-caption mismatches.
* **Direct Offset Entry:** Double-click the counter digits to type a precise custom time offset (e.g. `-2.50`) and apply it instantly.
* **Draggable Anywhere:** Move the sync panel freely across the video viewport — no fixed position lock.
* **Zero Performance Impact:** Operates via isolated script injection. Does not intercept network packets or throttle streaming buffers.

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
