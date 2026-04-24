# Web Notes Assistant — Chrome Extension

> Highlight text and capture screenshots into organized notes. Workspaces, dark/light mode, PDF & DOCX export, and cross-tab sync.

---

## Features

- 📝 **Highlight & Capture** — Select text on any webpage and instantly save it as a note
- 📷 **Screenshots** — Draw a region on any page to capture a screenshot note
- 🗂️ **Workspaces** — Create named workspaces to organize notes by topic or project
- 🌗 **Dark / Light Mode** — Full theme toggle, persisted across sessions
- 💾 **Export** — Save your notes as a formatted **PDF** or **DOCX** file
- 🔗 **Source & Timestamp** — Optionally attach the source URL and capture time to each note
- 🖥️ **Keep Style** — Right-click a note → "Keep Style" to preserve exact code formatting
- 🔄 **Cross-tab Sync** — Same workspace open in two tabs? Notes sync in real time
- ↕️ **Drag to Reorder** — Drag the grip handle on any card to reorder notes
- 🖱️ **Right-click Menu** — Move Up, Move Down, Keep Style, Delete — all via right-click

---

## Installation

### Developer Install
1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this project folder
5. The extension icon will appear in your toolbar

---

## How to Use

1. Click the **Web Notes Assistant** icon in the Chrome toolbar to open the panel
2. Click **New** to create a workspace and give it a name
3. Toggle **Take Notes ON** in the sidebar
4. **Highlight any text** on the page — a popup appears → click **Add to Notes**
5. Use the **camera icon** to capture a screenshot region
6. **Right-click** any note card for move, style, or delete options
7. Use **Save as → PDF** or **DOCX** to export your notes

---

## Project Structure

```
├── manifest.json          # MV3 manifest
├── background.js          # Service worker — badge, messaging relay
├── content.js             # Content script — panel injection, text selection, screenshot
├── content.css            # Styles for injected panel and popup
├── sidebar/
│   ├── sidebar.html       # Sidebar UI
│   ├── sidebar.css        # Sidebar styles (dark/light theme)
│   └── sidebar.js         # All sidebar logic
├── icons/                 # Extension icons (16–128px)
└── lib/                   # Bundled third-party libraries
    ├── jspdf.umd.min.js   # PDF generation
    ├── docx.min.js        # DOCX generation
    ├── html2canvas.min.js # Screenshot capture
    └── FileSaver.min.js   # File download helper
```

---

## Third-Party Libraries

| Library | License | Purpose |
|---------|---------|---------|
| [jsPDF](https://github.com/parallax/jsPDF) | MIT | PDF export |
| [docx.js](https://github.com/dolanmiu/docx) | MIT | DOCX export |
| [html2canvas](https://github.com/nicont/html2canvas) | MIT | Screenshot capture |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js) | MIT | File download helper |

---

## Privacy

**No data leaves your device.** All notes and workspaces are stored locally using Chrome's `chrome.storage.local` API. See [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) for full details.

---

## Developer

**YuvaTech**

---

## License

All Rights Reserved.

---

Developed by **Satish Mishra**, **Yuvatech Solutions USA, LLC**
