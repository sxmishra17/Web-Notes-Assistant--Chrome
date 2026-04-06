// ============================================================
// Web Notes Assistant — Background Service Worker (Chrome MV3)
// Manages toggle state, messaging relay, and screenshot capture
//
// FIX: MV3 service workers are terminated when idle and restarted
// on demand — in-memory state (like a Set) is lost on restart.
// We persist activeTabIds to chrome.storage.session (cleared on
// browser restart, survives service worker sleep/wake cycles).
// ============================================================

// --- Restore persisted state on service worker startup ---
async function getActiveTabIds() {
  try {
    const data = await chrome.storage.session.get("activeTabIds");
    return new Set(data.activeTabIds || []);
  } catch {
    return new Set();
  }
}

async function setActiveTabIds(set) {
  try {
    await chrome.storage.session.set({ activeTabIds: [...set] });
  } catch { /* best effort */ }
}

// --- Browser Action: Toggle panel on/off ---
chrome.action.onClicked.addListener(async (tab) => {
  const tabId = tab.id;
  const activeTabIds = await getActiveTabIds();
  const isActive = activeTabIds.has(tabId);

  if (isActive) {
    // Deactivate
    activeTabIds.delete(tabId);
    await setActiveTabIds(activeTabIds);
    chrome.action.setTitle({ tabId, title: "Toggle Web Notes Assistant" });
    chrome.action.setBadgeText({ tabId, text: "" });
    try {
      await chrome.tabs.sendMessage(tabId, { action: "deactivate" });
    } catch (e) { /* content script may not be loaded */ }
  } else {
    // Activate
    activeTabIds.add(tabId);
    await setActiveTabIds(activeTabIds);
    chrome.action.setTitle({ tabId, title: "Web Notes Assistant (ON)" });
    chrome.action.setBadgeText({ tabId, text: "ON" });
    chrome.action.setBadgeBackgroundColor({ tabId, color: "#7C3AED" });
    try {
      await chrome.tabs.sendMessage(tabId, { action: "activate" });
    } catch (e) { /* content script may not be loaded */ }
  }
});

// --- Clean up state when tab is closed ---
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const activeTabIds = await getActiveTabIds();
  if (activeTabIds.has(tabId)) {
    activeTabIds.delete(tabId);
    await setActiveTabIds(activeTabIds);
  }
});

// --- Message handler ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "addNote":
      // Relay note from content script to sidebar iframe
      // Suppress "no receiving end" error — sidebar may not be open
      chrome.runtime.sendMessage({
        action: "newNote",
        note: message.note,
      }).catch(() => {});
      break;

    case "captureVisibleTab":
      // Capture the visible tab screenshot
      chrome.tabs.captureVisibleTab(null, { format: "png" },
        (dataUrl) => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: chrome.runtime.lastError.message });
          } else {
            sendResponse({ dataUrl });
          }
        }
      );
      return true; // keep channel open for async response

    case "checkActive":
      // Must handle async inside the listener synchronously for return true to work
      (async () => {
        if (sender.tab) {
          const activeTabIds = await getActiveTabIds();
          sendResponse({ active: activeTabIds.has(sender.tab.id) });
        } else {
          sendResponse({ active: false });
        }
      })();
      return true; // async

    case "getTabInfo":
      chrome.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (tabs[0]) {
            sendResponse({ url: tabs[0].url, title: tabs[0].title });
          } else {
            sendResponse({ url: "", title: "" });
          }
        })
        .catch(() => sendResponse({ url: "", title: "" }));
      return true;

    // --- Sidebar → Content script relay ---
    case "toggleTakeNotes":
      chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "setTakeNotes",
            enabled: message.enabled,
          }).catch(() => {});
        }
      });
      break;

    case "triggerScreenshot":
      chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "startScreenshot",
          }).catch(() => {});
        }
      });
      break;
  }
});
