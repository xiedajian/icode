'use strict';

var _gaq = _gaq || [];

// Toggle button
function toggle(showButton) {
  chrome.browserAction.setIcon({
    path: {
      '19': 'images/logo_19' + (showButton ? '' : '_gray') + '.png',
      '38': 'images/logo_38' + (showButton ? '' : '_gray') + '.png'
    }
  });
}

// pin images
function showValidImages(data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tab = tabs[0];
    // 不能采集花瓣网图片
    if (tab.url.replace(/^https?:\/\/(www)?/, '').indexOf('huaban.com') === 0) return;

    // pin target image
    if (data && data.mediaType === 'image' && data.srcUrl && !~data.srcUrl.indexOf('data:')) {
      var eImage = {
        src: data.srcUrl || '',
        url: data.pageUrl || '',
        img: {
          alt    : '',
          src    : data.srcUrl,
          width  : 0,
          height : 0
        }
      };
      chrome.tabs.sendMessage(tab.id, { msg: 'pinImage', data: eImage }, function(response) {});
      _gaq.push(['_trackEvent', 'contextMenu', 'pinImage']);
    } else {
      chrome.tabs.sendMessage(tab.id, { msg: 'showValidImages' }, function(response) {});
      _gaq.push(['_trackEvent', 'contextMenu', 'showValidImages']);
    }
  });
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.msg) {
    case 'bookmarklet':
      // use ajax request to get script, then send back to content-script
      ajax({
        url: 'https://huaban.com/js/widgets.min.js?' + Math.floor(new Date()/1e7),
        success: function(script) {
          sendResponse({ code: script });
        }
      });
      // return true to send response asynchronously
      return true;
    case 'toggle':
      var showButton = !!request.showButton;

      toggle(showButton);

      chrome.storage.local.set({ showButton: showButton });

      // Just send message, not need to sendResponse asynchronously
      chrome.tabs.query({ currentWindow: true }, function(tabs) {
        for (var i = 0, l = tabs.length; i < l; ++i) {
          chrome.tabs.sendMessage(tabs[i].id, { msg: 'toggle', showButton: showButton }, function() {});
        }
      });

      _gaq.push(['_trackEvent', 'toggle', showButton]);
      sendResponse({ showButton: showButton });
      break;
    case 'pinAll':
      showValidImages();
      break;
    case 'getImageData':
      var canvas = document.createElement('canvas');
      var imgSrcs = [];
      try {
        imgSrcs = JSON.parse(request.imgSrcs);
      } catch(e) {
        imgSrcs = null;
      };
      if (!imgSrcs) return sendResponse({ error: 'Image data parse error' });

      _.asyncMap(imgSrcs, function(src, done){

        var xhr = new XMLHttpRequest();
        xhr.open('GET', src, true);
        xhr.responseType = 'blob';

        xhr.onload = function(e) {
          if (this.status === 200) {
            var blob = this.response;
            var reader = new window.FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function() {
              var base64data = reader.result;
              done(null, base64data);
            }
          }
        };

        xhr.send();

      }, function(err, results){
        if (err) return sendResponse({ error: err });

        var _images = JSON.stringify(results);
        sendResponse({ images: _images });
      });
      return true;
    case 'ga':
      _gaq.push(['_trackEvent', request.type, request.value]);
      break;
    default:
      break;
  }
});

// show the welcoming desktop notification
var welcome = function() {
  var welcomeLink = 'http://huaban.com/about/goodies/';

  // compatible with chrome version lower than 28
  if (!chrome.notifications) {
    window.open(welcomeLink);
  } else {
    chrome.notifications.create('', {
      type    : 'basic',
      iconUrl : '/images/logo_48.png',
      title   : '感谢安装花瓣采集工具插件',
      message : '花瓣采集工具会自动在网页图片上添加一个「采集」按钮，还支持截图功能哦，想知道更多直接点击这里吧 :)'
    }, function(id) {
      chrome.notifications.onClicked.addListener(function(_id) {
        if (_id === id) {
          window.open(welcomeLink);
        }
      });
    });
  }
};

// Right-click pin images
chrome.contextMenus.create({
  title               : '采集图片/视频',
  contexts            : [ 'all' ],
  documentUrlPatterns : [ 'http://*/*', 'https://*/*' ],
  onclick             : showValidImages
});

// init min width
chrome.storage.local.get('minWidth', function(obj) {
  if (obj.minWidth) return;

  chrome.storage.local.set({ 'minWidth': 200 });
});

// show/hide PINIT button
chrome.storage.local.get('showButton', function(obj) {
  var showButton = obj.showButton;
  if (showButton === undefined) {
    showButton = true;
    chrome.storage.local.set({ 'showButton': showButton });
  }

  toggle(showButton);
});

// when run first time
chrome.storage.local.get('notFirstRun', function(obj) {
  if (obj.notFirstRun) return;

  chrome.storage.local.set({ 'notFirstRun': true });
  welcome();
});

// get the version from manifest.json
ajax({
  url: 'manifest.json',
  success: function(data) {
    data = JSON.parse(data);
    chrome.storage.local.set({ 'version': data.version }, function() {});
  }
});

// Screenshot
screenshot.init();

// Hotkeys setup
HotKey.setup();
