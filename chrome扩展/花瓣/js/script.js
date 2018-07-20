'use strict';

var global          = 'HUABAN_GLOBAL';
var global_settings = 'HUABAN_PRESETTINGS';

function insertScript(code) {
  var script = document.createElement('script');
  script.setAttribute('charset', 'utf-8');
  script.innerText = code.replace(/\s{2,}/g, ' ');
  document.body.appendChild(script);
  document.body.removeChild(script);
}

function insertBookmarklet(opts, code) {
  var settingsCode = "\
    (function(w,g,m,i,d){\
      w[g]=w[g]||{};\
      w[g].via=7;\
      w[g].autoInitialize=false;\
      w[g].autoAttachFloatingButton=i;\
      w[g].imageMinWidth=m;\
      w['__huaban_dev']=d;\
    }(window,'" + global_settings + "'," + opts.minWidth + "," + opts.showButton + ",'huaban.com'));";

  var code = settingsCode + code;
  insertScript(code);
}

// Need better way to predict the right moment.
function sendMsgToPopup() {
  setTimeout(function(){
    chrome.runtime.sendMessage({msg: 'pinable'});
  }, 300);
}

function _handle(action) {
  var code = "\
    (function(w,g,a) {\
      w[g] && w[g]['interface'] && w[g]['interface'][a]();\
    })(window,'"+global+"','"+action+"');"
  insertScript(code);
}

// 显示悬浮按钮
function attachFloatingButton() {
  _handle('attachFloatingButton');
};

// 隐藏悬浮按钮
function detachFloatingButton() {
  _handle('detachFloatingButton');
};

// 抓取页面上所有符合条件的图片
function showValidImages() {
  _handle('show');
};

// 只抓取目标图片
function pinImage(target) {
  var code = "\
    (function(w,g,a,t) {\
      w[g] && w[g]['interface'] && w[g]['interface'][a](t);\
    })(window,'"+global+"','pinImageUrl','"+target+"');"
  insertScript(code);

  var messageEl = document.getElementById('HUABAN_MESSAGE');
  try {
    var data = messageEl.innerText;
    data = JSON.parse(data);
    window.open(data.url, '', data.features);
  } catch (e) {
    console.error(e);
  };
};

// 使用右键采集
// 当点击图片时，采集这张图片，其他情况，采集页面上所有的图片

var target = null;
document.body.addEventListener('contextmenu', function(e) {
  target = e.target;
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.msg) {
    switch(request.msg) {
      case 'showValidImages':
        showValidImages();
        break;
      case 'pinImage':
        if (target.width >= 16 && target.height >= 16)
          pinImage(target.src);
        else
          showValidImages();
        break;
      case 'toggle':
        if (request.showButton)
          attachFloatingButton();
        else
          detachFloatingButton();
        break;
      default:
        break;
    }
  }
});

// 获取初始化设置数据
chrome.storage.local.get(['showButton', 'minWidth'], function(obj) {
  // 获取「采集工具脚本」
  chrome.runtime.sendMessage({ msg: 'bookmarklet' }, function(rsp) {
    // 注入脚本
    insertBookmarklet(obj, rsp && rsp.code);
    // 通知 popup 页面，可以显示「采集按钮」
    sendMsgToPopup();
  });
});
