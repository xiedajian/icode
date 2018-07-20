'use strict';

(function() {
  var handleShortcut = function (event) {
    var keyCode = event.keyCode;

    // area: R, keyCode: 82
    // viewport: V, keyCode: 86
    // fullpage: H, keyCode: 72
    if (event.ctrlKey && event.shiftKey && (keyCode === 82 || keyCode === 86 || keyCode === 72)) {

      // prevent default keyboard  shortcuts, e.g. <C-r> in windows
      event.preventDefault();

      chrome.runtime.sendMessage({
        'msg': 'capture_hotkey',
        'keyCode': keyCode
      });
    }
  };

  if (document.body.hasAttribute('huaban_collector_injected')) return;

  document.body.setAttribute('huaban_collector_injected', true);

  document.body.addEventListener('keydown', handleShortcut, false);
}());
