// Precision Zoom popup script

document.getElementById('select').onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'selectElement' });
  });
};

document.getElementById('zoomIn').onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'zoomIn' });
  });
};

document.getElementById('zoomOut').onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'zoomOut' });
  });
};

document.getElementById('reset').onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'resetZoom' });
  });
};
