// Precision Zoom content script
// Injects zoom logic into web pages

let selectedElement = null;
let zoomLevel = 1;

function applyZoom(element, level) {
  if (!element) return;
  element.style.transition = 'transform 0.2s cubic-bezier(0.4,0,0.2,1)';
  element.style.transformOrigin = 'center center';
  element.style.transform = `scale(${level})`;
}

function resetZoom(element) {
  if (!element) return;
  element.style.transform = '';
  element.style.transition = '';
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'selectElement') {
    document.body.style.cursor = 'zoom-in';
    document.addEventListener('click', selectHandler, { once: true });
    function selectHandler(e) {
      document.body.style.cursor = '';
      if (selectedElement) resetZoom(selectedElement);
      selectedElement = e.target;
      applyZoom(selectedElement, zoomLevel);
      sendResponse({ success: true });
    }
    return true;
  } else if (msg.type === 'zoomIn') {
    if (selectedElement) {
      zoomLevel = Math.min(zoomLevel + 0.2, 5);
      applyZoom(selectedElement, zoomLevel);
    }
  } else if (msg.type === 'zoomOut') {
    if (selectedElement) {
      zoomLevel = Math.max(zoomLevel - 0.2, 0.2);
      applyZoom(selectedElement, zoomLevel);
    }
  } else if (msg.type === 'resetZoom') {
    if (selectedElement) {
      resetZoom(selectedElement);
      zoomLevel = 1;
    }
  }
});
