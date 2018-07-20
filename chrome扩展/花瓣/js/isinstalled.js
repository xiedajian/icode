(function(){
  'use strict';

  // 在 huaban.com 添加标识来判断是否安装采集工具
  document.documentElement.classList.add('hbChromeExtInstalled');

  // store extension version in body
  chrome.storage.local.get('version', function(obj) {
    if (obj.version) {
      document.documentElement.setAttribute('data-hb-chrome-ext-installed', obj.version);
    }
  });

})();
