/*
 * 这个脚本只作用于「采集工具」页面，作用有二：
 *
 * 1. 采集工具中的图片，脚本再传给插件 sandbox 异步获取图片数据，并传回给「采集工具」页面
 * 2. 截图后的图片数据传递给「采集工具」页面
 */

function insertScript(code) {
  var script = document.createElement('script');
  script.setAttribute('charset', 'utf-8');
  script.innerText = code.replace(/\s{2,}/g, ' ');
  document.body.appendChild(script);
  document.body.removeChild(script);
}

// 根据图片地址，加载图片，然后把这些图片数据传回给「采集工具」
function getImageData(imgSrcs) {
  if (!imgSrcs.length) return;

  var imgStr = JSON.stringify(imgSrcs);
  chrome.runtime.sendMessage({ msg: 'getImageData', imgSrcs: imgStr }, function(response) {
    if (response.error) return console.error(response.error);

    var data = [];
    try {
      data = JSON.parse(response.images);
    } catch (e) {};

    var images = imgSrcs.map(function(imgSrc, i) {
      return { src: imgSrc, data: data[i] || '' };
    });

    var code = "(function(d) {" +
                  "for (var i = 0; i < d.length; i++) {" +
                    "var imgs = $$('img[src='+ (d[i] && d[i].src) +']');" +
                    "if (imgs && imgs.length) { imgs[0].src = d[i] && d[i].data; }" +
                  "}" +
                "})(" + JSON.stringify(images) + ");";
    insertScript(code);
  });
};

// 获取截图图片数据，然后传给「采集工具」
function getCaptureImageData() {
  chrome.runtime.sendMessage({ msg: 'getCaptureImageData' }, function(response) {
    var data = { data: response.image };
    var code = "(function(d) {" +
                  "var imgs = $$('#bookmarklet .preview img');" +
                  "if (imgs && imgs.length) {" +
                    "imgs[0].src = d.data;" +
                    "imgs[0].classList.remove('waiting');" +
                  "}" +
                "})(" + JSON.stringify(data) + ");";
    insertScript(code);
  });
}

// 获取采集工具页面的图片数据

// 批量采集页面
var currentUrl = window.location.href;
if (~currentUrl.indexOf('huaban.com/bookmarklet_multiple')) {
  setTimeout(function(){
    var imgs = [].slice.call(document.querySelectorAll('#bookmarklet_multiple .pin-units img'));
    if (imgs && imgs.length) {
      var imgSrcs = imgs.map(function(img){ return img.src; });
      getImageData(imgSrcs);
    }
  }, 100);
} else if (~currentUrl.indexOf('huaban.com/bookmarklet')) { // 单张采集页面
  setTimeout(function(){
    var img = document.querySelector('#bookmarklet .preview img');
    var src = img && img.getAttribute('src');

    // 如果有 'waiting' 类，表示是截图后传递的图片数据
    // 否则，是采集工具传递的图片数据
    if (img.classList.contains('waiting')) {
      getCaptureImageData();
    } else if (src) {
      getImageData([src]);
    }
  }, 100);
}
