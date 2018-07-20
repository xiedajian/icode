'use strict';

function $(selector) {
  return document.querySelector(selector);
}

function initShowButton () {
  var toggleEl = $('#toggle_pin_button');

  var _update = function(data) {
    toggleEl.checked = data.showButton;
  }

  chrome.storage.local.get('showButton', _update);

  toggleEl.addEventListener('click', function() {
    chrome.runtime.sendMessage({ msg: 'toggle', showButton: this.checked }, _update);
  });

  // update every 500ms
  setInterval(function() {
    chrome.storage.local.get('showButton', _update);
  }, 500);
}

function initMinWidth () {
  var minWidthEl = $('#min_width');
  var minWidthElText = $('#min_width ~ label');

  chrome.storage.local.get('minWidth', function(obj) {
    minWidthEl.value = minWidthElText.innerHTML = obj.minWidth || 200;
  });

  minWidthEl.addEventListener('change', function() {
    minWidthElText.innerHTML = this.value;
    chrome.storage.local.set({ minWidth: this.value });
  });
}

function initFormat () {
  var jpegSelectorEl = $('#jpeg_selector');
  var pngSelectorEl = $('#png_selector');
  var format = localStorage.screenshotFormat || 'png';
  if (format === 'jpeg')
    jpegSelectorEl.checked = true;
  else
    pngSelectorEl.checked = true;

  jpegSelectorEl.addEventListener('click', function() {
    localStorage.screenshotFormat = this.value;
  });
  pngSelectorEl.addEventListener('click', function() {
    localStorage.screenshotFormat = this.value;
  });
}

function initHotkeys () {
  var toggleEl = $('#toggle_shortcut');
  var promptEl = $('#shortcut_prompt');

  var setState = function(enabled) {
    toggleEl.checked = enabled;
    if (enabled) HotKey.enable();
    else HotKey.disable();
  };

  var _checked = toggleEl.checked = HotKey.isEnabled();
  promptEl.style.display = _checked ? 'block' : 'none';

  toggleEl.addEventListener('click', function() {
    setState(this.checked);
    promptEl.style.display = HotKey.isEnabled() ? 'block' : 'none';
  });
}

window.addEventListener('load', function() {
  initShowButton();
  initMinWidth();
  initFormat();
  initHotkeys();
});
