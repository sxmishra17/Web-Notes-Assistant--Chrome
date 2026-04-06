// ============================================================
// Web Notes Assistant — Content Script (Chrome)
// Handles right-side panel injection, text selection popup,
// and screenshot region selection
// ============================================================

(function () {
  "use strict";

  if (window.__webAnnotatorInjected) return;
  window.__webAnnotatorInjected = true;

  let isActive = false;
  let isTakeNotesOn = false;
  let panelContainer = null;
  let popup = null;
  let screenshotOverlay = null;
  let selectionRect = null;
  let startX, startY;
  let currentPanelWidth = 380;

  // ---- Page shift helpers ----
  function pushPage(width) {
    currentPanelWidth = width;
    document.documentElement.style.transition = "margin-right 0.3s cubic-bezier(0.4,0,0.2,1)";
    document.documentElement.style.marginRight = width + "px";
    document.documentElement.style.overflowX = "hidden";
  }

  function unpushPage() {
    document.documentElement.style.transition = "margin-right 0.3s cubic-bezier(0.4,0,0.2,1)";
    document.documentElement.style.marginRight = "";
    setTimeout(() => {
      document.documentElement.style.transition = "";
      document.documentElement.style.overflowX = "";
    }, 300);
  }

  // ---- Send note directly to sidebar iframe ----
  function sendNoteToPanel(note) {
    const iframe = document.getElementById("wa-panel-iframe");
    if (iframe && iframe.contentWindow) {
      // Primary channel: direct postMessage to the iframe
      iframe.contentWindow.postMessage({ action: "newNote", note }, "*");
    } else {
      // True fallback: only if iframe is not yet available, relay via background
      chrome.runtime.sendMessage({ action: "addNote", note }).catch(() => {});
    }
  }

  // ---- Check initial activation state ----
  chrome.runtime.sendMessage({ action: "checkActive" }).then((resp) => {
    if (resp && resp.active) {
      isActive = true;
      injectPanel();
    }
  }).catch(() => {});

  // ---- Listen for messages from background ----
  chrome.runtime.onMessage.addListener((message) => {
    switch (message.action) {
      case "activate":
        isActive = true;
        injectPanel();
        break;
      case "deactivate":
        isActive = false;
        isTakeNotesOn = false;
        removePopup();
        removeScreenshotOverlay();
        removePanel();
        break;
      case "setTakeNotes":
        isTakeNotesOn = message.enabled;
        if (!isTakeNotesOn) removePopup();
        break;
      case "startScreenshot":
        removePopup();
        startScreenshotCapture();
        break;
    }
  });

  // ---- Right-Side Panel (iframe) ----
  function injectPanel() {
    if (panelContainer) return;

    panelContainer = document.createElement("div");
    panelContainer.id = "wa-panel-container";

    // Resize handle
    const resizeHandle = document.createElement("div");
    resizeHandle.id = "wa-panel-resize-handle";
    panelContainer.appendChild(resizeHandle);

    // Iframe loading the sidebar UI
    const iframe = document.createElement("iframe");
    iframe.id = "wa-panel-iframe";
    iframe.src = chrome.runtime.getURL("sidebar/sidebar.html");
    iframe.setAttribute("allowtransparency", "true");
    panelContainer.appendChild(iframe);

    document.documentElement.appendChild(panelContainer);

    // Animate in and push page content left
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panelContainer.classList.add("wa-panel-visible");
        pushPage(currentPanelWidth);
      });
    });

    // Enable resize drag
    initResize(resizeHandle, panelContainer);
  }

  function removePanel() {
    if (panelContainer) {
      panelContainer.classList.remove("wa-panel-visible");
      unpushPage();
      setTimeout(() => {
        if (panelContainer && panelContainer.parentNode) {
          panelContainer.parentNode.removeChild(panelContainer);
        }
        panelContainer = null;
      }, 300);
    }
  }

  // ---- Panel Resize ----
  function initResize(handle, container) {
    let isResizing = false;

    handle.addEventListener("mousedown", (e) => {
      isResizing = true;
      e.preventDefault();

      // KEY FIX: disable pointer-events on the iframe so it cannot absorb
      // mousemove/mouseup events while dragging — without this the resize
      // freezes the moment the cursor drifts over the sidebar iframe.
      const iframe = container.querySelector("#wa-panel-iframe");
      if (iframe) iframe.style.pointerEvents = "none";

      // Disable CSS transitions so width changes are instant during drag
      container.style.transition = "none";
      document.documentElement.style.transition = "none";

      document.addEventListener("mousemove", onResize);
      document.addEventListener("mouseup", stopResize);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ew-resize";
    });

    function onResize(e) {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      // Min 280px, max 700px, also must leave at least 200px for page content
      const maxAllowed = Math.min(700, window.innerWidth - 200);
      const clampedWidth = Math.max(280, Math.min(newWidth, maxAllowed));
      container.style.width = clampedWidth + "px";
      currentPanelWidth = clampedWidth;
      document.documentElement.style.marginRight = clampedWidth + "px";
    }

    function stopResize() {
      isResizing = false;
      document.removeEventListener("mousemove", onResize);
      document.removeEventListener("mouseup", stopResize);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      // Restore iframe pointer events so the sidebar is interactive again
      const iframe = container.querySelector("#wa-panel-iframe");
      if (iframe) iframe.style.pointerEvents = "";

      // Re-enable smooth transitions after resize
      container.style.transition = "";
      document.documentElement.style.transition = "margin-right 0.15s ease";
      setTimeout(() => {
        document.documentElement.style.transition = "";
      }, 150);
    }
  }

  // ---- Floating Popup ----
  function createPopup(x, y, selectedText, htmlContent) {
    removePopup();

    const newPopup = document.createElement("div");
    newPopup.id = "wa-popup";
    newPopup.innerHTML = `
      <button id="wa-add-text" title="Add highlighted text to notes">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Add to Notes
      </button>
    `;

    const popupWidth = 160;
    const popupHeight = 42;
    let left = x - popupWidth / 2;
    let top = y - popupHeight - 12;

    left = Math.max(8, Math.min(left, window.innerWidth - popupWidth - 8));
    if (top < 8) top = y + 20;

    newPopup.style.left = left + "px";
    newPopup.style.top = top + "px";

    document.body.appendChild(newPopup);
    popup = newPopup;

    requestAnimationFrame(() => {
      if (popup === newPopup) {
        popup.classList.add("wa-popup-visible");
      }
    });

    newPopup.querySelector("#wa-add-text").addEventListener("click", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
      addTextNote(selectedText, htmlContent);
      removePopup();
    });
  }

  function removePopup() {
    if (popup && popup.parentNode) {
      const dying = popup;
      popup = null; // null immediately to prevent double-removal
      dying.classList.remove("wa-popup-visible");
      setTimeout(() => {
        if (dying.parentNode) dying.parentNode.removeChild(dying);
      }, 150);
    }
  }

  // ---- Text selection handler ----
  document.addEventListener("mouseup", (mouseUpEvent) => {
    if (!isActive || !isTakeNotesOn) return;
    if (mouseUpEvent.target.closest && (
      mouseUpEvent.target.closest("#wa-popup") ||
      mouseUpEvent.target.closest("#wa-screenshot-overlay") ||
      mouseUpEvent.target.closest("#wa-panel-container")
    )) return;

    // Capture coords from the outer event before the timeout
    const evX = mouseUpEvent.clientX;
    const evY = mouseUpEvent.clientY + window.scrollY;

    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection ? selection.toString().trim() : "";

      if (selectedText.length > 0) {
        // Capture HTML structure of selection
        let htmlContent = "";
        try {
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const fragment = range.cloneContents();
            const div = document.createElement("div");
            div.appendChild(fragment);
            htmlContent = div.innerHTML;
          }
        } catch (_err) {
          htmlContent = "";
        }
        createPopup(evX, evY, selectedText, htmlContent);
      } else {
        removePopup();
      }
    }, 10);
  });

  document.addEventListener("mousedown", (e) => {
    if (popup && e.target.closest && !e.target.closest("#wa-popup")) {
      removePopup();
    }
  });

  // ---- Add text note ----
  function addTextNote(text, htmlContent) {
    const note = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      type: "text",
      content: text,
      htmlContent: htmlContent || "",
      url: window.location.href,
      title: document.title,
      favicon: getFaviconUrl(),
      timestamp: new Date().toISOString(),
    };
    sendNoteToPanel(note);
  }

  function getFaviconUrl() {
    const link = document.querySelector('link[rel~="icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if (link) return link.href;
    return window.location.origin + "/favicon.ico";
  }

  // ---- Screenshot Capture ----
  // Track screenshot drag listeners so they can be cleaned up at any point
  let _screenshotMoveFn = null;
  let _screenshotUpFn = null;

  function startScreenshotCapture() {
    removeScreenshotOverlay();

    screenshotOverlay = document.createElement("div");
    screenshotOverlay.id = "wa-screenshot-overlay";

    const instructions = document.createElement("div");
    instructions.id = "wa-screenshot-instructions";
    instructions.textContent = "Click and drag to select area • ESC to cancel";
    screenshotOverlay.appendChild(instructions);

    selectionRect = document.createElement("div");
    selectionRect.id = "wa-selection-rect";
    screenshotOverlay.appendChild(selectionRect);

    document.body.appendChild(screenshotOverlay);

    screenshotOverlay.addEventListener("mousedown", onScreenshotMouseDown);
    document.addEventListener("keydown", onScreenshotKeyDown);
  }

  function removeScreenshotOverlay() {
    // FIX: always clean up drag listeners even if removed mid-drag
    if (_screenshotMoveFn) {
      document.removeEventListener("mousemove", _screenshotMoveFn);
      _screenshotMoveFn = null;
    }
    if (_screenshotUpFn) {
      document.removeEventListener("mouseup", _screenshotUpFn);
      _screenshotUpFn = null;
    }
    if (screenshotOverlay && screenshotOverlay.parentNode) {
      screenshotOverlay.parentNode.removeChild(screenshotOverlay);
    }
    screenshotOverlay = null;
    selectionRect = null;
    document.removeEventListener("keydown", onScreenshotKeyDown);
  }

  function onScreenshotKeyDown(e) {
    if (e.key === "Escape") removeScreenshotOverlay();
  }

  function onScreenshotMouseDown(e) {
    if (e.target.id === "wa-selection-rect") return;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    selectionRect.style.left = startX + "px";
    selectionRect.style.top = startY + "px";
    selectionRect.style.width = "0px";
    selectionRect.style.height = "0px";
    selectionRect.style.display = "block";

    // Store references so removeScreenshotOverlay can clean them up
    _screenshotMoveFn = onScreenshotMouseMove;
    _screenshotUpFn = onScreenshotMouseUp;
    document.addEventListener("mousemove", _screenshotMoveFn);
    document.addEventListener("mouseup", _screenshotUpFn);
  }

  function onScreenshotMouseMove(e) {
    if (!selectionRect) return; // guard if overlay was removed mid-drag
    e.preventDefault();
    const left = Math.min(startX, e.clientX);
    const top = Math.min(startY, e.clientY);
    selectionRect.style.left = left + "px";
    selectionRect.style.top = top + "px";
    selectionRect.style.width = Math.abs(e.clientX - startX) + "px";
    selectionRect.style.height = Math.abs(e.clientY - startY) + "px";
  }

  function onScreenshotMouseUp(e) {
    // Clean up drag listeners via the tracker
    if (_screenshotMoveFn) {
      document.removeEventListener("mousemove", _screenshotMoveFn);
      _screenshotMoveFn = null;
    }
    if (_screenshotUpFn) {
      document.removeEventListener("mouseup", _screenshotUpFn);
      _screenshotUpFn = null;
    }

    const left = Math.min(startX, e.clientX);
    const top = Math.min(startY, e.clientY);
    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);

    removeScreenshotOverlay();

    if (width < 10 || height < 10) return;

    chrome.runtime.sendMessage({ action: "captureVisibleTab" }).then((resp) => {
      if (!resp || resp.error) {
        console.error("Screenshot capture failed:", resp ? resp.error : "No response");
        return;
      }

      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement("canvas");
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, left * dpr, top * dpr, width * dpr, height * dpr, 0, 0, width * dpr, height * dpr);

        const note = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          type: "image",
          content: canvas.toDataURL("image/png"),
          url: window.location.href,
          title: document.title,
          favicon: getFaviconUrl(),
          timestamp: new Date().toISOString(),
        };
        sendNoteToPanel(note);
      };
      img.onerror = () => {
        console.error("Screenshot image failed to load");
      };
      img.src = resp.dataUrl;
    }).catch((err) => console.error("Screenshot failed:", err));
  }

})();
