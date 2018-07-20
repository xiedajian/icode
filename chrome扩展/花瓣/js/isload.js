;(function() {
  'use strict';

  // Long-lived connections with 'popup.js'
  chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(request) {
      if (request.msg === 'is_page_capturable') {
        try {
          if (isPageCapturable()) {
            port.postMessage({msg: 'capturable'});
          } else {
            port.postMessage({msg: 'uncapturable'});
          }
        } catch(e) {
          port.postMessage({msg: 'loading'});
        }
      } else if (request.msg === 'is_page_pinable') {
        // 'hb-loaded' is added by bookmarklet script when it's already
        if (~document.documentElement.className.indexOf('hb-loaded')) {
          port.postMessage({msg: 'pinable'});
        } else {
          port.postMessage({msg: 'unpinable'});
        }
      }
    });
  });
})();
