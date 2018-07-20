'use strict';

var screenshot = {
  tab           : 0,
  canvas        : document.createElement("canvas"),
  startX        : 0,
  startY        : 0,
  scrollX       : 0,
  scrollY       : 0,
  docHeight     : 0,
  docWidth      : 0,
  visibleWidth  : 0,
  visibleHeight : 0,
  scrollXCount  : 0,
  scrollYCount  : 0,
  scrollBarX    : 17,
  scrollBarY    : 17,
  captureStatus : true,

  handleHotKey: function(keyCode) {
    if (HotKey.isEnabled()) {
      switch (keyCode) {
        case HotKey.getCharCode('area'):
          screenshot.showSelectionArea();
          break;
        case HotKey.getCharCode('viewport'):
          screenshot.captureViewport();
          break;
        case HotKey.getCharCode('fullpage'):
          screenshot.captureFullpage();
          break;
        case HotKey.getCharCode('screen'):
          screenshot.captureScreen();
          break;
        default:
          break;
      }
    }
  },

  /**
  * Receive messages from content_script, and then decide what to do next
  */
  addMessageListener: function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      var obj = request;
      switch(obj.msg) {
        case 'capture_hotkey':
          screenshot.handleHotKey(obj.keyCode);
          break;
        case 'capture_selected':
          screenshot.captureSelected();
          break;
        case 'capture_area':
          screenshot.showSelectionArea();
          break;
        case 'capture_viewport':
          screenshot.captureViewport();
          break;
        case 'capture_fullpage':
          screenshot.captureFullpage();
          break;
        //case 'original_view_port_width':
          //sendResponse(plugin.getViewPortWidth());
          //break;
        default:
          break;
      }
    });
  },

  /**
  * Send the Message to content-script
  */
  sendMessage: function(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, callback);
    });
  },

  captureViewport: function() {
    screenshot.sendMessage({msg: 'capture_viewport'}, screenshot.onResponseVisibleSize);
  },

  captureFullpage: function() {
    screenshot.sendMessage({msg: 'scroll_init'}, screenshot.onResponseVisibleSize);
  },

  showSelectionArea: function() {
    screenshot.sendMessage({msg: 'show_selection_area'}, null);
  },

  captureSelected: function() {
    screenshot.sendMessage({msg: 'capture_selected'}, screenshot.onResponseVisibleSize);
  },

  captureVisible: function(page_info) {
    var format = localStorage.screenshotFormat || 'png';
    // Note, quality only work for format 'jpeg'
    chrome.tabs.captureVisibleTab(null, {format: format, quality: 100}, function(data) {
      var image = new Image();
      image.onload = function() {
        var width = image.width;
        var height = image.height;

        var canvasWidth = screenshot.canvas.width = screenshot.visibleWidth;
        var canvasHeight = screenshot.canvas.height = screenshot.visibleHeight;
        // 虚拟画布的宽高，供截图结果的计算使用
        var _canvasWidth = _.isRetinaDisplay() ? canvasWidth * window.devicePixelRatio : canvasWidth;
        var _canvasHeight = _.isRetinaDisplay() ? canvasHeight * window.devicePixelRatio : canvasHeight;
        screenshot.canvas.width = _canvasWidth;
        screenshot.canvas.height = _canvasHeight;

        var context = screenshot.canvas.getContext("2d");
        context.drawImage(image, 0, 0, _canvasWidth, _canvasHeight, 0, 0, _canvasWidth, _canvasHeight);
        screenshot.postImage(page_info);
      };
      image.src = data;
    });
  },

  /**
   * selected area in viewport
   */
  captureVisibleSelected: function(page_info) {
    var format = localStorage.screenshotFormat || 'png';
    // Note, quality only work for format 'jpeg'
    chrome.tabs.captureVisibleTab(null, {format: format, quality: 100}, function(data) {
      var image = new Image();
      image.onload = function() {
        var width = image.width;
        var height = image.height;
        var canvasWidth = screenshot.canvas.width;
        var canvasHeight = screenshot.canvas.height;
        // 虚拟画布的宽高，供截图结果的计算使用
        var _canvasWidth = _.isRetinaDisplay() ? canvasWidth * window.devicePixelRatio : canvasWidth;
        var _canvasHeight = _.isRetinaDisplay() ? canvasHeight * window.devicePixelRatio : canvasHeight;
        var startX = _.isRetinaDisplay() ? screenshot.startX * window.devicePixelRatio : screenshot.startX;
        var startY = _.isRetinaDisplay() ? screenshot.startY * window.devicePixelRatio : screenshot.startY;
        screenshot.canvas.width = _canvasWidth;
        screenshot.canvas.height = _canvasHeight;
        var context = screenshot.canvas.getContext("2d");
        context.drawImage(image, startX, startY, _canvasWidth, _canvasHeight, 0, 0, _canvasWidth, _canvasHeight);
        screenshot.postImage(page_info);
      };
      image.src = data;
    });
  },

  /**
  * Use the drawImage method to stitching images, and render to canvas
  */
  captureAndScroll: function(page_info) {
    var format = localStorage.screenshotFormat || 'png';
    // Note, quality only work for format 'jpeg'
    chrome.tabs.captureVisibleTab(null, {format: format, quality: 100}, function(data) {
      var image = new Image();
      image.onload = function() {
        var context = screenshot.canvas.getContext('2d');

        // 实际画布的宽高
        var canvasWidth = screenshot.canvas.width;
        var canvasHeight = screenshot.canvas.height;

        // 虚拟画布的宽高，供截图结果的计算使用
        var _canvasWidth = _.isRetinaDisplay() ? canvasWidth * window.devicePixelRatio : canvasWidth;
        var _canvasHeight = _.isRetinaDisplay() ? canvasHeight * window.devicePixelRatio : canvasHeight;

        // 整个 document 的宽高
        var docWidth = _.isRetinaDisplay() ? screenshot.docWidth * window.devicePixelRatio : screenshot.docWidth;
        var docHeight = _.isRetinaDisplay() ? screenshot.docHeight * window.devicePixelRatio : screenshot.docHeight;

        // 在 X Y 轴中的滚动距离
        var scrollX = _.isRetinaDisplay() ? screenshot.scrollX * window.devicePixelRatio : screenshot.scrollX;
        var scrollY = _.isRetinaDisplay() ? screenshot.scrollY * window.devicePixelRatio : screenshot.scrollY;

        // 初始位置
        var startX = _.isRetinaDisplay() ? screenshot.startX * window.devicePixelRatio : screenshot.startX;
        var startY = _.isRetinaDisplay() ? screenshot.startY * window.devicePixelRatio : screenshot.startY;

        // 获取在 X Y 轴中滚动条的宽度，在这里，假定所有 OSX 系统下的滚动条都是隐藏的
        if (_.isThisPlatform('mac')) {
          screenshot.scrollBarX = screenshot.scrollBarY = 0;
        } else {
          screenshot.scrollBarY = screenshot.visibleHeight < screenshot.docHeight ? 17 : 0;
          screenshot.scrollBarX = screenshot.visibleWidth < screenshot.docWidth ? 17 : 0;
        }

        // 页面可视区域的宽高
        var visibleWidth = screenshot.visibleWidth < canvasWidth ? screenshot.visibleWidth : canvasWidth;
        var visibleHeight = screenshot.visibleHeight < canvasHeight ? screenshot.visibleHeight : canvasHeight;

        // 计算截图结果中可视区域的宽高，去掉滚动条
        var _visibleWidth = (image.width - screenshot.scrollBarY < _canvasWidth ? image.width - screenshot.scrollBarY : _canvasWidth);
        var _visibleHeight = (image.height - screenshot.scrollBarX < _canvasHeight ? image.height - screenshot.scrollBarX : _canvasHeight);

        // Get region capture start x coordinate.
        var zoom = screenshot.zoom;
        var x1 = startX - Math.round(scrollX * zoom);
        var y1 = startY - Math.round(scrollY * zoom);
        var x2 = 0;
        var y2 = 0;
        var w1 = 0;
        var h1 = 0;
        var w2 = 0;
        var h2 = 0;

        // 判断是否是最后一屏，如果是，需要计算出剩余宽高
        if ((screenshot.scrollYCount + 1) * _visibleWidth > _canvasWidth) {
          w1 = _canvasWidth % _visibleWidth;
          w2 = canvasWidth % visibleWidth;
          x1 = (screenshot.scrollYCount + 1) * _visibleWidth - _canvasWidth + startX - scrollX;
        } else {
          w1 = _visibleWidth;
          w2 = visibleWidth;
        }

        if ((screenshot.scrollXCount + 1) * _visibleHeight > _canvasHeight) {
          h1 = _canvasHeight % _visibleHeight;
          h2 = canvasHeight % visibleHeight;
          if ((screenshot.scrollXCount + 1) * _visibleHeight + scrollY < docHeight) {
            y1 = 0;
          } else {
            y1 = (screenshot.scrollXCount + 1) * _visibleHeight + scrollY - docHeight;
          }
        } else {
          h1 = _visibleHeight;
          h2 = visibleHeight;
        }
        x2 = screenshot.scrollYCount * visibleWidth;
        y2 = screenshot.scrollXCount * visibleHeight;
        context.drawImage(image, x1, y1, w1, h1, x2, y2, w2, h2);
        screenshot.sendMessage({
          msg: 'scroll_next',
          visibleWidth: visibleWidth,
          visibleHeight: visibleHeight
        }, screenshot.onResponseVisibleSize);
      };
      image.src = data;
    });
  },

  captureAndScrollDone: function(page_info) {
    screenshot.postImage(page_info);
  },

  postImage: function(page_info) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      screenshot.tab = tabs[0];
      screenshot.page_info = page_info;
    });
    chrome.tabs.create({'url': 'edit.html'});
  },

  onResponseVisibleSize: function(response) {
    switch(response.msg) {
      case 'capture_viewport':
        screenshot.visibleHeight = response.visibleHeight;
        screenshot.visibleWidth = response.visibleWidth;
        screenshot.captureVisible(response.page_info);
        break;
      case 'capture_viewport_selected':
        // 截图起始 x 坐标
        screenshot.startX = response.startX;
        // 截图起始 y 坐标
        screenshot.startY = response.startY;
        // 截图宽高
        screenshot.canvas.width = response.canvasWidth;
        screenshot.canvas.height = response.canvasHeight;
        screenshot.captureVisibleSelected(response.page_info);
        break;
      case 'scroll_init_done':
        screenshot.startX = response.startX;
        screenshot.startY = response.startY;
        screenshot.scrollX = response.scrollX;
        screenshot.scrollY = response.scrollY;
        screenshot.canvas.width = response.canvasWidth;
        screenshot.canvas.height = response.canvasHeight;
        screenshot.visibleHeight = response.visibleHeight;
        screenshot.visibleWidth = response.visibleWidth;
        screenshot.scrollXCount = response.scrollXCount;
        screenshot.scrollYCount = response.scrollYCount;
        screenshot.docWidth = response.docWidth;
        screenshot.docHeight = response.docHeight;
        screenshot.zoom = response.zoom;
        setTimeout(function() {
          screenshot.captureAndScroll(response.page_info);
        }, 100);
        break;
      case 'scroll_next_done':
        screenshot.scrollXCount = response.scrollXCount;
        screenshot.scrollYCount = response.scrollYCount;
        setTimeout(function() {
          screenshot.captureAndScroll(response.page_info);
        }, 100);
        break;
      case 'scroll_finished':
        screenshot.captureAndScrollDone(response.page_info);
        break;
      default:
        break;
    }
  },

  init: function() {
    localStorage.screenshotFormat = localStorage.screenshotFormat || 'png';
    screenshot.addMessageListener();
  }
};
