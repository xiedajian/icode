'use strict';

function $(id) {
  return document.getElementById(id);
}

function hasClass(element, className) {
  return element.classList.contains(className);
}

function trackClick(value) {
  chrome.runtime.sendMessage({
    msg   : 'ga',
    type  : 'popup item',
    value : value
  }, function() {});
}

function enableCapture() {
  $('capture-area-item').classList.remove('disabled');
  $('capture-viewport-item').classList.remove('disabled');
  $('capture-fullpage-item').classList.remove('disabled');
}
function disableCapture() {
  $('capture-area-item').classList.add('disabled');
  $('capture-viewport-item').classList.add('disabled');
  $('capture-fullpage-item').classList.add('disabled');
}
var bkg = chrome.extension.getBackgroundPage();

function init() {
  var links = document.getElementsByTagName('a');
  for (var i = 0; links[i]; i++) {
    links[i].addEventListener('click', function(){
      if (this.href && !~this.href.indexOf('chrome-extension')) window.open(this.href);
    });
  }

  var toggleBtn = $('toggle-btn');
  var toggleBtnText = toggleBtn.getElementsByClassName('title')[0];
  toggleBtn.addEventListener('click', function() {
    var showButton = hasClass(toggleBtnText, 'checked');
    chrome.runtime.sendMessage({ msg: 'toggle', showButton: !showButton }, function(response) {
      var op = response.showButton ? 'add' : 'remove';
      toggleBtnText.classList[op]('checked');
    });
    trackClick('toggleBtn');
  });
  chrome.storage.local.get('showButton', function(obj) {
    var op = obj.showButton ? 'add' : 'remove';
    toggleBtnText.classList[op]('checked');
  });

  var pinAllBtn = $('pin-all-btn');
  pinAllBtn.addEventListener('click', function() {
    if (this.classList.contains('disabled')) return;

    chrome.runtime.sendMessage({ msg: 'pinAll' }, function(response) {});
    trackClick('pinAll');
    setTimeout(function() { window.close(); }, 100);
  });


  var forceRefreshBtn = $('force-refresh-btn');
  forceRefreshBtn.addEventListener('click', function() {
    ajax({
      url: 'https://huaban.com/js/widgets.min.js?' + Math.floor(new Date()/1e7),
      headers: {
        'Cache-Control': 'no-cache'
      },
      success: function(script) {
        bkg.console.log('刷新成功!');
        chrome.tabs.getSelected(null, function(tab) {
          var code = 'window.location.reload();';
          chrome.tabs.executeScript(tab.id, {code: code});
        });
      }
    });
  });

  var bg = chrome.extension.getBackgroundPage();

  var captureAreaItem = $('capture-area-item');
  var captureViewportItem = $('capture-viewport-item');
  var captureFullpageItem = $('capture-fullpage-item');
  // init disable all capture action
  captureAreaItem.classList.add('disabled');
  captureViewportItem.classList.add('disabled');
  captureFullpageItem.classList.add('disabled');

  // check shortcut is or not on
  var display = bg.HotKey.isEnabled() ? 'inline' : 'none';
  captureAreaItem.getElementsByClassName('prompt')[0].style.display = display;
  captureViewportItem.getElementsByClassName('prompt')[0].style.display = display;
  captureFullpageItem.getElementsByClassName('prompt')[0].style.display = display;

  captureFullpageItem.addEventListener('click', function() {
    if (this.classList.contains('disabled')) return;

    bg.screenshot.captureFullpage();
    trackClick('captureWebpage');
    window.close();
  });

  captureViewportItem.addEventListener('click', function() {
    if (this.classList.contains('disabled')) return;

    bg.screenshot.captureViewport();
    trackClick('captureWindow');
    window.close();
  });

  captureAreaItem.addEventListener('click', function() {
    if (this.classList.contains('disabled')) return;

    bg.screenshot.showSelectionArea();
    trackClick('captureArea');
    window.close();
  });

  // Long-lived connection with 'isload.js'
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var port = chrome.tabs.connect(tabs[0].id);
    port.onMessage.addListener(function(response) {
      if (response.msg === 'capturable') {
        enableCapture();
      } else if (response.msg === 'uncapturable') {
        disableCapture();
      } else if (response.msg === 'loading') {
        //show loading
      }

      if (response.msg === 'pinable') {
        $('pin-all-btn').classList.remove('disabled');
      } else if (response.msg === 'unpinable') {
        $('pin-all-btn').classList.add('disabled');
      }
    });
    port.postMessage({msg: 'is_page_capturable'});
    port.postMessage({msg: 'is_page_pinable'});
  });
}

document.addEventListener('DOMContentLoaded', init);

// when popup was opened before injected page loaded
chrome.runtime.onMessage.addListener(function(request, sender) {
  // receive 'capturable' message from 'page.js'
  if (request.msg === 'page_capturable') {
    enableCapture();
  } else if (request.msg === 'page_uncapturable') {
    disableCapture();
  }

  // receive 'pinable' message from 'script.js'
  if (request.msg === 'pinable') {
    $('pin-all-btn').classList.remove('disabled');
  } else if (request.msg === 'unpinable') {
    $('pin-all-btn').classList.add('disabled');
  }
});
