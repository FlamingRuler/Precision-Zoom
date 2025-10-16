// Precision Zoom content script
// Injects zoom logic into web pages


let selectedElement = null;
let zoomLevel = 1;

function canZoom(element) {
  if (!element) return false;
  if (element instanceof HTMLIFrameElement) return false;
  if (element.nodeType === Node.DOCUMENT_FRAGMENT_NODE) return false;
  // Allow canvas, SVG, divs, images, and most HTML elements
  if (
    element instanceof HTMLCanvasElement ||
    element instanceof SVGElement ||
    element instanceof HTMLDivElement ||
    element instanceof HTMLImageElement ||
    element instanceof HTMLElement
  ) {
    // Check for restrictive CSS (e.g., fixed position overlays)
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return true;
  }
  return false;
}

function applyZoom(element, level) {
  if (!canZoom(element)) return false;
  element.style.transition = 'transform 0.2s cubic-bezier(0.4,0,0.2,1)';
  element.style.transformOrigin = 'center center';
  element.style.transform = `scale(${level})`;
  // For canvas, redraw if needed (basic visual zoom only)
  if (element instanceof HTMLCanvasElement) {
    // Optionally, could redraw canvas content, but here we visually scale only
  }
  return true;
}

function resetZoom(element) {
  if (!canZoom(element)) return;
  element.style.transform = '';
  element.style.transition = '';
}

function findElement(e) {
  // Try to find the deepest element, including shadow DOM
  let el = e.target;
  if (el.shadowRoot) {
    // Try to select inside shadow DOM
    const shadowEl = el.shadowRoot.elementFromPoint(e.clientX, e.clientY);
    if (shadowEl) el = shadowEl;
  }
  return el;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'selectElement') {
    document.body.style.cursor = 'zoom-in';
    document.addEventListener('click', selectHandler, { once: true, capture: true });
    function selectHandler(e) {
      document.body.style.cursor = '';
      e.stopPropagation();
      e.preventDefault();
      if (selectedElement) resetZoom(selectedElement);
      selectedElement = findElement(e);
      if (!canZoom(selectedElement)) {
        selectedElement = null;
        showTooltip(e.clientX, e.clientY, 'Cannot zoom this element. Try another.');
        sendResponse({ success: false });
        return;
      }
      if (!applyZoom(selectedElement, zoomLevel)) {
        showTooltip(e.clientX, e.clientY, 'Zoom failed. Try another element.');
        sendResponse({ success: false });
        return;
      }
      showTooltip(e.clientX, e.clientY, 'Element selected! Use popup to zoom.');
      sendResponse({ success: true });
    }
    return true;
// Tooltip for feedback
function showTooltip(x, y, text) {
  let tip = document.createElement('div');
  tip.textContent = text;
  tip.style.position = 'fixed';
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
  tip.style.background = 'rgba(0,0,0,0.85)';
  tip.style.color = '#fff';
  tip.style.padding = '6px 12px';
  tip.style.borderRadius = '6px';
  tip.style.zIndex = 99999;
  tip.style.fontSize = '14px';
  tip.style.pointerEvents = 'none';
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 1800);
}
  } else if (msg.type === 'zoomIn') {
    if (selectedElement && canZoom(selectedElement)) {
      zoomLevel = Math.min(zoomLevel + 0.2, 5);
      applyZoom(selectedElement, zoomLevel);
    }
  } else if (msg.type === 'zoomOut') {
    if (selectedElement && canZoom(selectedElement)) {
      zoomLevel = Math.max(zoomLevel - 0.2, 0.2);
      applyZoom(selectedElement, zoomLevel);
    }
  } else if (msg.type === 'resetZoom') {
    if (selectedElement && canZoom(selectedElement)) {
      resetZoom(selectedElement);
      zoomLevel = 1;
    }
  }
});
