# Chrome Web Store — Publishing Package
## Web Notes Assistant v1.2.0

---

## 1. Extension Name
```
Web Notes Assistant
```

---

## 2. Short Description (up to 132 characters)
```
Highlight text & capture screenshots from any webpage into organized, exportable notes with dark mode & workspaces.
```

---

## 3. Detailed Description

```
Web Notes Assistant is a powerful, privacy-first research and reading companion that lives in a sleek right-side panel on every webpage. Highlight any text or capture screenshots, organize them into named workspaces, and export to PDF or DOCX — all without leaving the page.

──────────────────────────────
KEY FEATURES
──────────────────────────────

One-Click Text Capture
- Enable "Take Notes" mode, then select any text on the page
- A floating "Add to Notes" button instantly appears
- Captures the raw text AND rich HTML structure

Region Screenshot Tool
- Click the camera button to enter screenshot mode
- Drag to select any area of the page
- The cropped screenshot is saved directly to your note panel

Workspace Management
- Organize notes into named workspaces (e.g. "Research Project")
- Create new workspaces or load existing saved ones
- Rename workspaces on the fly
- Duplicate name protection prevents accidental overwrites

Smart Autosave
- Notes are automatically saved every 15 seconds
- Toggle autosave on/off with one click
- Last session restored automatically on next open

Cross-Tab Sync
- Open the panel on multiple tabs and notes stay in sync

Export to PDF
- Full PDF export with workspace title, source URL links, timestamps
- "Keep Style" notes exported in monospace code block format
- Screenshots embedded inline

Export to DOCX
- Full Word document export with hyperlinks, timestamps
- Screenshots embedded as inline images

Dark / Light Theme
- Premium dark mode by default (deep purple/indigo palette)
- Toggle to light mode instantly — preference saved

Resizable Panel
- Drag the left edge of the panel to make it wider or narrower (280px to 700px)
- Page content shifts to accommodate the panel width automatically

Drag-and-Drop Reordering
- Drag notes up/down to reorder them within a workspace

Context Menu (Right-Click Notes)
- Move Up / Move Down
- Keep Style (toggle monospace display)
- Delete

Privacy First
- No data is sent to any server, ever
- All notes stored locally in Chrome storage
- No account or login required

──────────────────────────────
HOW TO USE
──────────────────────────────

1. Click the Web Notes Assistant icon in the toolbar to open the panel
2. Give your workspace a name
3. Toggle "Take Notes" ON
4. Select any text on the page then click "Add to Notes"
5. Use the camera button to capture screenshot regions
6. Right-click notes to reorder or change style
7. Click Save or let Autosave handle it
8. Export to PDF or DOCX anytime

──────────────────────────────
PERMISSIONS EXPLAINED
──────────────────────────────

activeTab - Used solely to capture screenshots of the visible tab
storage - Save notes and workspaces locally on your device
tabs - Detect tab switches for cross-tab sync
scripting - Inject the sidebar panel UI into web pages
all_urls - Allow the panel to appear on any website

No browsing history is accessed. No data leaves your device.

Built by YuvaTech
```

---

## 4. Store Listing Details

| Field | Value |
|---|---|
| Category | Productivity |
| Language | English |
| Version | 1.2.0 |
| Homepage | https://github.com/webAnnotator |
| Pricing | Free |
| Distribution | All regions (worldwide) |
| Maturity | Everyone |

---

## 5. Privacy Policy Text

Host this at a public URL (GitHub Pages, etc.) before submitting.

```
Privacy Policy - Web Notes Assistant
Last updated: April 2026

DATA COLLECTION
Web Notes Assistant does not collect, transmit, or share any personal data.
All notes, workspaces, and settings are stored exclusively in Chrome local
storage on your device.

DATA STORAGE
All data is stored locally using chrome.storage.local. Data never leaves your
browser. No cookies, analytics, or tracking of any kind are used.

PERMISSIONS
- activeTab: Used solely to capture screenshots of the visible tab when you
  explicitly trigger the screenshot tool.
- storage: Used to save notes and preferences locally.
- tabs: Used to detect which tab is active for cross-tab sync.
- scripting: Used to inject the sidebar panel UI into web pages.

THIRD-PARTY SERVICES
This extension does not communicate with any third-party service or server.

Contact: [your-email@example.com]
```

---

## 6. Screenshots Required

Provide 1-5 screenshots at 1280x800 px (or 640x400 px):

1. Panel open on a webpage with several text notes captured
2. Dark mode with a screenshot note visible
3. Workspace selector showing saved workspaces
4. PDF/DOCX export buttons visible
5. Light mode version of the panel

---

## 7. Publishing Checklist

- [x] manifest.json - MV3, Chrome permissions, 128px icon included
- [x] background.js - Service worker (MV3 compliant)
- [x] content.js - Chrome APIs, resize fixed (both expand and shrink)
- [x] sidebar/sidebar.js - Chrome APIs only
- [x] Icons: 16x16, 32x32, 48x48, 96x96, 128x128 PNG
- [x] web-notes-assistant-chrome-v1.2.0.zip ready to upload
- [ ] Screenshots captured (1280x800 or 640x400)
- [ ] Privacy policy hosted at a public URL
- [ ] Developer account at https://chrome.google.com/webstore/devconsole
- [ ] One-time $5 developer registration fee paid

---

## 8. Submission Steps

1. Go to https://chrome.google.com/webstore/devconsole
2. Sign in with a Google account
3. Pay the one-time $5 developer registration fee (first time only)
4. Click New Item and upload web-notes-assistant-chrome-v1.2.0.zip
5. Fill in all fields from this document
6. Add 1-5 screenshots
7. Enter your hosted privacy policy URL
8. Click Submit for Review

Note: Review typically takes 1-3 business days.
