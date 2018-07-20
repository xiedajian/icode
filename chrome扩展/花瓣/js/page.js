'use strict';

var global = 'HUABAN_GLOBAL';

function merge() {
  var merged = {};
  for (var i = 0, l = arguments.length; i < l; i++){
    var extended = arguments[i] || {};
    for (var key in extended) merged[key] = extended[key];
  }
  return merged;
};

function contains(substrs, str) {
  return substrs.some(function(v) {
    return str.indexOf(v) >= 0;
  });
};

function $(id) {
  return document.getElementById(id);
};

function $$(name) {
  if (/^\./.test(name)) {
    return document.getElementsByClassName(name);
  } else {
    return document.getElementsByTagName(name);
  }
};

/**
 * Indicate if the current page can be captured.
 */
var isPageCapturable = function() {
  return !page.checkPageIsOnlyEmbedElement();
};

var page = {
  startX: 150,
  startY: 150,
  endX: 400,
  endY: 300,
  moveX: 0,
  moveY: 0,
  pageWidth: 0,
  pageHeight: 0,
  visibleWidth: 0,
  visibleHeight: 0,
  dragging: false,
  moving: false,
  resizing: false,
  isMouseDown: false,
  scrollXCount: 0,
  scrollYCount: 0,
  scrollX: 0,
  scrollY: 0,
  captureWidth: 0,
  captureHeight: 0,
  isSelectionAreaTurnOn: false,
  fixedElements_ : [],
  marginTop: 0,
  marginLeft: 0,
  modifiedBottomRightFixedElements: [],
  originalViewPortWidth: document.documentElement.clientWidth,
  defaultScrollBarWidth: 17, // Default scroll bar width on windows platform.

  hookBodyScrollValue: function(needHook) {
    document.documentElement.setAttribute(
        "__huaban_screen_capture_need_hook_scroll_value__", needHook);
    var event = document.createEvent('Event');
    event.initEvent('__huaban_screen_capture_check_hook_status_event__', true, true);
    document.documentElement.dispatchEvent(event);
  },

  /**
   * Determine if the page scrolled to bottom or right.
   */
  isScrollToPageEnd: function(coordinate) {
    var body = document.body;
    var docElement = document.documentElement;
    if (coordinate == 'x') {
      return docElement.clientWidth + body.scrollLeft == body.scrollWidth;
    } else if (coordinate == 'y') {
      return docElement.clientHeight + body.scrollTop == body.scrollHeight;
    }
  },

  /**
   * Detect if the view port is located to the corner of page.
   */
  detectPagePosition: function() {
    var body = document.body;
    var pageScrollTop = body.scrollTop;
    var pageScrollLeft = body.scrollLeft;
    if (pageScrollTop == 0 && pageScrollLeft == 0) {
      return 'top_left';
    } else if (pageScrollTop == 0 && this.isScrollToPageEnd('x')) {
      return 'top_right';
    } else if (this.isScrollToPageEnd('y') && pageScrollLeft == 0) {
      return 'bottom_left';
    } else if (this.isScrollToPageEnd('y') && this.isScrollToPageEnd('x')) {
      return 'bottom_right';
    }
    return null;
  },

  /**
   * Detect fixed-positioned element's position in the view port.
   * @param {Element} elem
   * @return {String|Object} Return position of the element in the view port:
   *   top_left, top_right, bottom_left, bottom_right, or null.
   */
  detectCapturePositionOfFixedElement: function(elem) {
    var docElement = document.documentElement;
    var viewPortWidth = docElement.clientWidth;
    var viewPortHeight = docElement.clientHeight;
    var offsetWidth = elem.offsetWidth;
    var offsetHeight = elem.offsetHeight;
    var offsetTop = elem.offsetTop;
    var offsetLeft = elem.offsetLeft;
    var result = [];

    // Compare distance between element and the edge of view port to determine
    // the capture position of element.
    if (offsetTop <= viewPortHeight - offsetTop - offsetHeight) {
      result.push('top');
    } else if (offsetTop < viewPortHeight) {
      result.push('bottom');
    }
    if (offsetLeft <= viewPortWidth - offsetLeft - offsetWidth) {
      result.push('left');
    } else if (offsetLeft < viewPortWidth) {
      result.push('right');
    }

    // If the element is out of view port, then ignore.
    if (result.length != 2) {
      return null;
    }
    return result.join('_');
  },

  restoreFixedElements: function() {
    this.fixedElements_.forEach(function(element) {
      element[1].style.visibility = 'visible';
    });
    this.fixedElements_ = [];
  },

  /**
   * Iterate DOM tree and cache visible fixed-position elements.
   */
  cacheVisibleFixedPositionedElements: function() {
    var nodeIterator = document.createNodeIterator(
      document.documentElement,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );
    var currentNode;
    while (currentNode = nodeIterator.nextNode()) {
      var nodeComputedStyle =
        document.defaultView.getComputedStyle(currentNode, "");
      // Skip nodes which don't have computeStyle or are invisible.
      if (!nodeComputedStyle) {
        continue;
      }
      if (nodeComputedStyle.position == "fixed" &&
          nodeComputedStyle.display != 'none' &&
          nodeComputedStyle.visibility != 'hidden') {
        var position = this.detectCapturePositionOfFixedElement(currentNode);
        if (position) {
          this.fixedElements_.push([position, currentNode]);
        }
      }
    }
  },

  // Handle fixed-position elements for capture.
  handleFixedElements: function(capturePosition) {
    var docElement = document.documentElement;
    var body = document.body;

    // If page has no scroll bar, then return directly.
    if (docElement.clientHeight == body.scrollHeight &&
        docElement.clientWidth == body.scrollWidth) {
      return;
    }

    if (!this.fixedElements_.length) {
      this.cacheVisibleFixedPositionedElements();
    }

    this.fixedElements_.forEach(function(element) {
      if (element[0] == capturePosition) {
        element[1].style.visibility = 'visible';
      } else {
        element[1].style.visibility = 'hidden';
      }
    });
  },

  handleSecondToLastCapture: function() {
    var docElement = document.documentElement;
    var body = document.body;
    var bottomPositionElements = [];
    var rightPositionElements = [];
    var that = this;
    this.fixedElements_.forEach(function(element) {
      var position = element[0];
      if (position == 'bottom_left' || position == 'bottom_right') {
        bottomPositionElements.push(element[1]);
      } else if (position == 'bottom_right' || position == 'top_right') {
        rightPositionElements.push(element[1]);
      }
    });

    // Determine if the current capture is last but one.
    var remainingCaptureHeight = body.scrollHeight - docElement.clientHeight -
      body.scrollTop;
    if (remainingCaptureHeight > 0 &&
        remainingCaptureHeight < docElement.clientHeight) {
      bottomPositionElements.forEach(function(element) {
        if (element.offsetHeight > remainingCaptureHeight) {
          element.style.visibility = 'visible';
          var originalBottom = window.getComputedStyle(element).bottom;
          that.modifiedBottomRightFixedElements.push(
            ['bottom', element, originalBottom]);
          element.style.bottom = -remainingCaptureHeight + 'px';
        }
      });
    }

    var remainingCaptureWidth = body.scrollWidth - docElement.clientWidth -
      body.scrollLeft;
    if (remainingCaptureWidth > 0 &&
        remainingCaptureWidth < docElement.clientWidth) {
      rightPositionElements.forEach(function(element) {
        if (element.offsetWidth > remainingCaptureWidth) {
          element.style.visibility = 'visible';
          var originalRight = window.getComputedStyle(element).right;
          that.modifiedBottomRightFixedElements.push(
            ['right', element, originalRight]);
          element.style.right = -remainingCaptureWidth + 'px';
        }
      });
    }
  },

  restoreBottomRightOfFixedPositionElements: function() {
    this.modifiedBottomRightFixedElements.forEach(function(data) {
      var property = data[0];
      var element = data[1];
      var originalValue = data[2];
      element.style[property] = originalValue;
    });
    this.modifiedBottomRightFixedElements = [];
  },

  hideAllFixedPositionedElements: function() {
    this.fixedElements_.forEach(function(element) {
      element[1].style.visibility = 'hidden';
    });
  },

  hasScrollBar: function(axis) {
    var body = document.body;
    var docElement = document.documentElement;
    if (axis == 'x') {
      if (window.getComputedStyle(body).overflowX == 'scroll') {
        return true;
      }
      return Math.abs(body.scrollWidth - docElement.clientWidth) >=
          page.defaultScrollBarWidth;
    } else if (axis == 'y') {
      if (window.getComputedStyle(body).overflowY == 'scroll') {
        return true;
      }
      return Math.abs(body.scrollHeight - docElement.clientHeight) >=
          page.defaultScrollBarWidth;
    }
  },

  getOriginalViewPortWidth: function() {
    page.sendMessage({ msg: 'original_view_port_width'}, function(originalViewPortWidth) {
      if (originalViewPortWidth) {
        page.originalViewPortWidth = page.hasScrollBar('y') ?
          originalViewPortWidth - page.defaultScrollBarWidth : originalViewPortWidth;
      } else {
        page.originalViewPortWidth = document.documentElement.clientWidth;
      }
    });
  },

  calculateSizeAfterZooming: function(originalSize) {
    var originalViewPortWidth = page.originalViewPortWidth;
    var currentViewPortWidth = document.documentElement.clientWidth;
    if (originalViewPortWidth == currentViewPortWidth) {
      return originalSize;
    }
    return Math.round(originalViewPortWidth * originalSize / currentViewPortWidth);
  },

  getZoomLevel: function() {
    return page.originalViewPortWidth / document.documentElement.clientWidth;
  },

  handleRightFloatBoxInGmail: function() {
    var mainframe = $('canvas_frame');
    var boxContainer = document.querySelector('body > .dw');
    var fBody = mainframe.contentDocument.body;
    if (fBody.clientHeight + fBody.scrollTop == fBody.scrollHeight) {
      boxContainer.style.display = 'block';
    } else {
      boxContainer.style.display = 'none';
    }
  },

  getViewPortSize: function() {
    var result = {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight
    };

    if (document.compatMode == 'BackCompat') {
      result.width = document.body.clientWidth;
      result.height = document.body.clientHeight;
    }

    return result;
  },

  /**
   * Check if the page is only made of invisible embed elements.
   */
  checkPageIsOnlyEmbedElement: function() {
    var bodyNode = document.body.children;
    var isOnlyEmbed = false;
    for (var i = 0; i < bodyNode.length; i++) {
      var tagName = bodyNode[i].tagName;
      if (tagName == 'OBJECT' || tagName == 'EMBED' || tagName == 'VIDEO' ||
          tagName == 'SCRIPT' || tagName == 'LINK') {
        isOnlyEmbed = true;
      } else if (bodyNode[i].style.display != 'none'){
        isOnlyEmbed = false;
        break;
      }
    }
    return isOnlyEmbed;
  },

  isGMailPage: function(){
    var hostName = window.location.hostname;
    if (hostName == 'mail.google.com' && $('canvas_frame')) {
      return true;
    }
    return false;
  },

  /**
   * Receive messages from background page, and then decide what to do next
   */
  addMessageListener: function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (page.isSelectionAreaTurnOn) {
        page.removeSelectionArea();
      }
      var selectedText = ("" + (window.getSelection ? window.getSelection() :
        document.getSelection ? document.getSelection() :
        document.selection.createRange().text)
      ).replace(/(^\s+|\s+$)/g, "");
      var page_info = {
        href: document.location.href,
        text: selectedText || document.title || ''
      };
      switch (request.msg) {
        case 'capture_viewport':
          sendResponse(merge(page.getViewportSize(), {page_info: page_info}));
          break;
        case 'show_selection_area':
          page.showSelectionArea();
          break;
        case 'scroll_init': // Capture whole page.
          sendResponse(merge(page.scrollInit(0, 0, document.body.scrollWidth, document.body.scrollHeight, 'captureFullpage'), {page_info:page_info}));
          break;
        case 'scroll_next':
          page.visibleWidth = request.visibleWidth;
          page.visibleHeight = request.visibleHeight;
          sendResponse(merge(page.scrollNext(), {page_info:page_info}));
          break;
        case 'capture_selected':
          var cal_x = page.calculateSizeAfterZooming(page.endX - page.startX);
          var cal_y = page.calculateSizeAfterZooming(page.endY - page.startY);
          sendResponse(merge(page.scrollInit(
              page.startX,
              page.startY,
              cal_x,
              cal_y,
              'captureSelected'), {page_info:page_info}));
          break;
      }
    });
  },

  /**
   * Send Message to background page
   */
  sendMessage: function(message) {
    chrome.runtime.sendMessage(message);
  },

  checkInViewPort: function(startX, startY, canvasWidth, canvasHeight) {
    var scrollX = window.scrollX;
    var scrollY = window.scrollY;
    var viewPortSize = page.getViewPortSize();
    return (
        startX >= scrollX &&
        startY >= scrollY &&
        startX + canvasWidth <= scrollX + viewPortSize.width &&
        startY + canvasHeight <= scrollY + viewPortSize.height
    )
  },

  /**
   * Initialize scrollbar position, and get the data browser
   */
  scrollInit: function(startX, startY, canvasWidth, canvasHeight, type) {
    page.fixFixed();
    // 截屏滚动时，去除悬浮
    page.detachFloatingButton();
    this.hookBodyScrollValue(true);

    // 如果选择区域在可视区域内，不需要滚屏
    if (page.checkInViewPort(startX, startY, canvasWidth, canvasHeight)) {
      startX = startX - window.scrollX;
      startY = startY - window.scrollY;

      page.unfixFixed();
      // 恢复悬浮按钮
      page.attachFloatingButton();
      this.restoreFixedElements();
      return {
        'msg': 'capture_viewport_selected',
        'startX': page.calculateSizeAfterZooming(startX),
        'startY': page.calculateSizeAfterZooming(startY),
        'canvasWidth': canvasWidth,
        'canvasHeight': canvasHeight,
      }
    }

    page.captureHeight = canvasHeight;
    page.captureWidth = canvasWidth;
    var docWidth = document.body.scrollWidth;
    var docHeight = document.body.scrollHeight;
    window.scrollTo(startX, startY);

    this.handleFixedElements('top_left');
    this.handleSecondToLastCapture();

    if (page.isGMailPage() && type == 'captureFullpage') {
      var frame = $('canvas_frame');
      docHeight = page.captureHeight = canvasHeight = frame.contentDocument.height;
      docWidth = page.captureWidth = canvasWidth = frame.contentDocument.width;
      frame.contentDocument.body.scrollTop = 0;
      frame.contentDocument.body.scrollLeft = 0;
      page.handleRightFloatBoxInGmail();
    }
    page.scrollXCount = 0;
    page.scrollYCount = 1;
    page.scrollX = window.scrollX; // document.body.scrollLeft
    page.scrollY = window.scrollY;
    var viewPortSize = page.getViewPortSize();
    return {
      'msg': 'scroll_init_done',
      'startX': page.calculateSizeAfterZooming(startX),
      'startY': page.calculateSizeAfterZooming(startY),
      'scrollX': page.scrollX,
      'scrollY': page.scrollY,
      'docHeight': docHeight,
      'docWidth': docWidth,
      'visibleWidth': viewPortSize.width,
      'visibleHeight': viewPortSize.height,
      'canvasWidth': canvasWidth,
      'canvasHeight': canvasHeight,
      'scrollXCount': 0,
      'scrollYCount': 0,
      'zoom': page.getZoomLevel()
    };
  },

  /**
   * Calculate the next position of the scrollbar
   */
  scrollNext: function() {
    if (page.scrollYCount * page.visibleWidth >= page.captureWidth) {
      page.scrollXCount++;
      page.scrollYCount = 0;
    }
    if (page.scrollXCount * page.visibleHeight < page.captureHeight) {
      this.restoreBottomRightOfFixedPositionElements();
      var viewPortSize = page.getViewPortSize();
      window.scrollTo(
          page.scrollYCount * viewPortSize.width + page.scrollX,
          page.scrollXCount * viewPortSize.height + page.scrollY);

      var pagePosition = this.detectPagePosition();
      if (pagePosition) {
        this.handleFixedElements(pagePosition);
      } else {
        this.hideAllFixedPositionedElements();
      }
      this.handleSecondToLastCapture();

      if (page.isGMailPage()) {
        var frame = $('canvas_frame');
        frame.contentDocument.body.scrollLeft =
            page.scrollYCount * viewPortSize.width;
        frame.contentDocument.body.scrollTop =
            page.scrollXCount * viewPortSize.height;
        page.handleRightFloatBoxInGmail();
      }
      var x = page.scrollXCount;
      var y = page.scrollYCount;
      page.scrollYCount++;
      return { 'msg': 'scroll_next_done',scrollXCount: x, scrollYCount: y };
    } else {
      window.scrollTo(page.startX, page.startY);
      page.unfixFixed();
      // 恢复悬浮按钮
      page.attachFloatingButton();
      this.restoreFixedElements();
      this.hookBodyScrollValue(false);
      return { 'msg': 'scroll_finished' };
    }
  },

  /**
   * Show the selection Area
   */
  showSelectionArea: function() {
    // page.fixBody();
    page.fixFixed();
    page.createFloatLayer();
    setTimeout(page.createSelectionArea, 100);
  },

  getViewportSize: function() {
    var visibleWidth = document.documentElement.clientWidth;
    var visibleHeight = document.documentElement.clientHeight;
    if (page.isGMailPage()) {
      var frame = $('canvas_frame');
      visibleWidth = frame.contentDocument.height;
      visibleHeight = frame.contentDocument.width;
    }
    return {'msg':'capture_viewport',
            'visibleWidth': visibleWidth,
            'visibleHeight': visibleHeight};
  },

  getSelectionSize: function() {
    page.removeSelectionArea();
    setTimeout(function() {
      page.sendMessage({
        'msg': 'capture_selected',
        'x': page.startX,
        'y': page.startY,
        'width': page.endX - page.startX,
        'height': page.endY - page.startY,
        'visibleWidth': document.documentElement.clientWidth,
        'visibleHeight': document.documentElement.clientHeight,
        'docWidth': document.body.scrollWidth,
        'docHeight': document.body.scrollHeight
      })}, 100);
  },

  /**
   * Create a float layer on the webpage
   */
  createFloatLayer: function() {
    page.createDiv(document.body, 'huaban_collector_protector');
  },

  matchMarginValue: function(str) {
    return str.match(/\d+/);
  },

  fixFixed: function() {
    var all_els= document.querySelectorAll('*');
    this.fixed_els = this.fixed_els || [];
    if (!this.fixed_els.length && all_els && all_els.length) {
      for (var i = 0; i < all_els.length; i += 1) {
        var x = getComputedStyle(all_els[i]);
        if (x && x.getPropertyValue('position') == 'fixed') {
          this.fixed_els.push(all_els[i]);
        }
      }
    }

    this.fixed_els.forEach(function(i){
      for(var num = 0; num < i.classList.length; num++) {
        var filter = ['iku-popup', 'iku-mask'];
        if (filter.indexOf(i.classList[num]) > -1)
          return false;
      }
      i.classList.add('__huaban-fixed-position');
    });

    /**
     * Patch fixed elements style, mainly for fixed top header element
     * TODO need better match rules
     */
    var id = '__huaban_fix_fixed';
    if (!$(id)) {
      // var styleText = "body {position: relative} html, html > body{width: initial; height: initial;} .__huaban-fixed-position {position: relative !important;z-index:5000 !important;}";
      var styleText = ".__huaban-fixed-position {position: absolute !important;z-index:5000 !important;}";
      var styleEl = document.createElement('style');
      styleEl.id = id;
      ($$("head")[0]||document.body).appendChild(styleEl);
      styleEl.styleSheet ? styleEl.styleSheet.cssText = styleText : styleEl.appendChild(document.createTextNode(styleText));
    }

    page.fixedPosition();
  },

  unfixFixed: function() {
    if (this.fixed_els && this.fixed_els.length) {
      this.fixed_els.forEach(function(i){
        i.classList.remove('__huaban-fixed-position');
      });
    }
    page.unfixedPosition();
  },

  fixedPosition: function() {
    var hostName = window.location.hostname;
    if (contains(['taobao.com', 'tmall.com'], hostName)) {
      $$('body')[0].style.setProperty('position', 'relative');
    } else if (contains(['behance.net'], hostName)) {
      if ($('project-popup')) $('project-popup').classList.remove('__huaban-fixed-position');
      if ($$('.blocking-div')[0]) $$('.blocking-div')[0].classList.remove('__huaban-fixed-position');
      if ($('infinity-footer')) $('infinity-footer').style.display = 'none';
      if ($('sorts-container')) $('sorts-container').style.display = 'none';
    } else if (contains(['huaban.com'], hostName)) {
      var header = $('header');
      header.classList.remove('__huaban-fixed-position');
      header.style.setProperty('position', 'relative', 'important');
    }
  },

  unfixedPosition: function() {
    var hostName = window.location.hostname;
    if (contains(['taobao.com', 'tmall.com'], hostName)) {
      $$('body')[0].style.setProperty('position', 'relative');
    } else if (contains(['behance.net'], hostName)) {
      if ($('infinity-footer')) $('infinity-footer').style.display = 'block';
      if ($('sorts-container')) $('sorts-container').style.display = 'block';
    } else if (contains(['huaban.com'], hostName)) {
      if (document.body.scrollTop) {
        $('header').style.setProperty('position', 'fixed');
      }
    }
  },

  escKeyDown: function(e) {
    if(e.keyCode == 27) page.removeSelectionArea();
  },

  // fixBody: function() {
  //   var id = '__huaban_fix_body';
  //   if (!$(id)) {
  //     var style_text = "body {position: relative} html, html > body{width: initial; height: initial;}";
  //     var style_el = document.createElement('style');
  //     style_el.id = id;
  //     ($$("head")[0]||document.body).appendChild(style_el);
  //     style_el.styleSheet ? style_el.styleSheet.cssText = style_text : style_el.appendChild(document.createTextNode(style_text));
  //   }
  //   this.fixFixed();
  // },

  // unfixBody: function() {
  //   var s = $('__huaban_fix_body');
  //   if (s) {
  //     ($$("head")[0]||document.body).removeChild(s);
  //   }
  //   this.unfixFixed();
  // },

  /**
   * Load the screenshot area interface
   */
  createSelectionArea: function() {
    var protectorEl = $('huaban_collector_protector');
    var zoom = page.getZoomLevel();
    var bodyStyle = window.getComputedStyle(document.body, null);
    if ('relative' == bodyStyle['position']) {
      page.marginTop = page.matchMarginValue(bodyStyle['marginTop']);
      page.marginLeft = page.matchMarginValue(bodyStyle['marginLeft']);
      protectorEl.style.top =  - parseInt(page.marginTop) + 'px';
      protectorEl.style.left =  - parseInt(page.marginLeft) + 'px';
    }
    protectorEl.style.width =
      Math.round((document.body.scrollWidth + parseInt(page.marginLeft)) / zoom) + 'px';
    protectorEl.style.height =
      Math.round((document.body.scrollHeight + parseInt(page.marginTop)) / zoom) + 'px';
    protectorEl.onclick = function() {
      event.stopPropagation();
      return false;
    };
    protectorEl.addEventListener('mousedown', page.protectorMouseDown, false);

    // Create elements for area capture.
    page.createDiv(protectorEl, 'hc_dragshadow_t', 'hc-dragshadow');
    page.createDiv(protectorEl, 'hc_dragshadow_b', 'hc-dragshadow');
    page.createDiv(protectorEl, 'hc_dragshadow_l', 'hc-dragshadow');
    page.createDiv(protectorEl, 'hc_dragshadow_r', 'hc-dragshadow');

    var containerEl = page.createDiv(protectorEl, 'huaban_collector_container');
    var boundaryEl =  page.createDiv(containerEl, 'huaban_collector_boundary');
    page.createDiv(containerEl, 'hc_drag_size');
    page.createDiv(boundaryEl, 'hc_dragline_t', 'hc-dragline');
    page.createDiv(boundaryEl, 'hc_dragline_d', 'hc-dragline');
    page.createDiv(boundaryEl, 'hc_dragline_l', 'hc-dragline');
    page.createDiv(boundaryEl, 'hc_dragline_r', 'hc-dragline');

    // Add event listener for 'cancel' and 'capture' button.
    var cancel = page.createDiv(containerEl, 'hc_drag_cancel');
    cancel.addEventListener('mousedown', function () {
      // Remove area capture containers and event listeners.
      page.removeSelectionArea();
    }, true);
    cancel.innerHTML = '取消';

    var crop = page.createDiv(containerEl, 'hc_drag_crop');
    crop.addEventListener('mousedown', function() {
      page.removeSelectionArea();
      setTimeout(function(){
        page.sendMessage({msg: 'capture_selected'});
      }, 100);
    }, false);
    crop.innerHTML = '确定';

    // ESC key to cancel this selectionArea
    document.addEventListener('keydown', page.escKeyDown, false);
    document.querySelector('body').classList.add('hb-no-user-select');

    // 在区域截图的时候，去除悬浮
    page.detachFloatingButton();
  },

  protectorMouseDown: function(event) {
    if (event.button == 0 && !page.isMouseDown) {

      var protectorMouseMove = function (event) {
        var _width = event.pageX-initX;
        var _height = event.pageY-initY;
        var _left = (_width > 0) ? initX : initX + _width;
        var _top = (_height > 0) ? initY : initY + _height;
        _width = Math.abs(_width);
        _height = Math.abs(_height);
        page.updateShadow(_left, _top, _width, _height);
        page.updateArea(_left, _top, _width, _height);
        page.updateSize(_width, _height);

        page.startX = _left;
        page.startY = _top;
        page.endX = _left + _width;
        page.endY = _top + _height;
      };

      var protectorMouseUp = function (event) {
        var MIN_WIDTH = 200;

        if((event.pageX-initX == 0 || event.pageY-initY == 0) && $('huaban_collector_container').offsetWidth == 0) {
          var _left = initX - MIN_WIDTH / 2;
          var _top = initY - MIN_WIDTH / 2;
          page.updateShadow(_left, _top, MIN_WIDTH, MIN_WIDTH);
          page.updateArea(_left, _top, MIN_WIDTH, MIN_WIDTH);
          page.updateSize(MIN_WIDTH, MIN_WIDTH);

          page.startX = _left;
          page.startY = _top;
          page.endX = _left + MIN_WIDTH;
          page.endY = _top + MIN_WIDTH;
        }
        protectorEl.removeEventListener('mousedown', page.protectorMouseDown, false);
        protectorEl.removeEventListener('mousemove', protectorMouseMove, false);
        protectorEl.removeEventListener('mouseup', protectorMouseUp, false);

        if (page.endY + 25 > document.documentElement.clientWidth + document.body.scrollTop) {
          $('hc_drag_crop').style.bottom = '3px';
          $('hc_drag_cancel').style.bottom = '3px';
        } else {
          $('hc_drag_crop').style.bottom = '-28px';
          $('hc_drag_cancel').style.bottom = '-28px';
        }

        if (page.startY < document.body.scrollTop + 22) {
          $('hc_drag_size').style.top = '3px';
        } else {
          $('hc_drag_size').style.top = '-22px';
        }
        $('hc_drag_size').style.display = 'block';
        $('hc_drag_cancel').style.display = 'block';
        $('hc_drag_crop').style.display = 'block';

        page.bindDragResize();
        page.isSelectionAreaTurnOn = true;
        page.isMouseDown = false;
      };

      page.isMouseDown = true;
      var initX = event.pageX;
      var initY = event.pageY;
      var containerEl = $('huaban_collector_container');
      var protectorEl = $('huaban_collector_protector');

      page.pageHeight = protectorEl.clientHeight;
      page.pageWidth = protectorEl.clientWidth;

      page.updateShadow(initX, initY, 0, 0);
      protectorEl.style.backgroundColor = 'rgba(0, 0, 0, 0)';
      protectorEl.addEventListener('mousemove', protectorMouseMove, false);
      protectorEl.addEventListener('mouseup', protectorMouseUp, false);
    }
  },

  bindDragResize: function() {
    var containerEl = $('huaban_collector_container');
    page.createDiv(containerEl, 'hc_dragdot_tl', 'hc-dragdot').setAttribute('data-direct', 'tl');
    page.createDiv(containerEl, 'hc_dragdot_tr', 'hc-dragdot').setAttribute('data-direct', 'tr');
    page.createDiv(containerEl, 'hc_dragdot_br', 'hc-dragdot').setAttribute('data-direct', 'br');
    page.createDiv(containerEl, 'hc_dragdot_bl', 'hc-dragdot').setAttribute('data-direct', 'bl');
    page.createDiv(containerEl, 'hc_dragdot_mt', 'hc-dragdot').setAttribute('data-direct', 'mt');
    page.createDiv(containerEl, 'hc_dragdot_mr', 'hc-dragdot').setAttribute('data-direct', 'mr');
    page.createDiv(containerEl, 'hc_dragdot_mb', 'hc-dragdot').setAttribute('data-direct', 'mb');
    page.createDiv(containerEl, 'hc_dragdot_ml', 'hc-dragdot').setAttribute('data-direct', 'ml');
    page.createDiv(containerEl, 'hc_dragbar_t', 'hc-dragbar').setAttribute('data-direct', 'mt');
    page.createDiv(containerEl, 'hc_dragbar_r', 'hc-dragbar').setAttribute('data-direct', 'mr');
    page.createDiv(containerEl, 'hc_dragbar_b', 'hc-dragbar').setAttribute('data-direct', 'mb');
    page.createDiv(containerEl, 'hc_dragbar_l', 'hc-dragbar').setAttribute('data-direct', 'ml');

    $('huaban_collector_protector').addEventListener('mousedown', page.onMouseDown, false);
    document.addEventListener('mousemove', page.onMouseMove, false);
    document.addEventListener('mouseup', page.onMouseUp, false);
    $('huaban_collector_boundary').addEventListener('dblclick', function() {
      page.removeSelectionArea();
      setTimeout(function(){
        page.sendMessage({msg: 'capture_selected'});
      }, 100);
    }, false);
  },

  /**
   * Init selection area due to the position of the mouse when mouse down
   */
  onMouseDown: function() {
    if (event.button != 2) {
      var element = event.target;

      if (element) {
        var elementName = element.tagName;
        if (elementName && document) {
          page.isMouseDown = true;

          var containerEl = $('huaban_collector_container');
          var xPosition = event.pageX;
          var yPosition = event.pageY;
          var direct = page.direct = element.getAttribute("data-direct");

          if (containerEl) {
            if (element == $('huaban_collector_boundary')) {
              page.moving = true;
              page.moveX = xPosition - containerEl.offsetLeft;
              page.moveY = yPosition - containerEl.offsetTop;
            } else if (direct == 'tr') {
              page.resizing = true;
              page.startX = containerEl.offsetLeft;
              page.startY = containerEl.offsetTop + containerEl.clientHeight;
            } else if (direct == 'tl') {
              page.resizing = true;
              page.startX = containerEl.offsetLeft + containerEl.clientWidth;
              page.startY = containerEl.offsetTop + containerEl.clientHeight;
            } else if (direct == 'br') {
              page.resizing = true;
              page.startX = containerEl.offsetLeft;
              page.startY = containerEl.offsetTop;
            } else if (direct == 'bl') {
              page.resizing = true;
              page.startX = containerEl.offsetLeft + containerEl.clientWidth;
              page.startY = containerEl.offsetTop;
            } else if (direct == 'mt') {
              page.resizing = true;
              page.startY = containerEl.offsetTop + containerEl.clientHeight;
            } else if (direct == 'mr') {
              page.resizing = true;
              page.startX = containerEl.offsetLeft;
            } else if (direct == 'mb') {
              page.resizing = true;
              page.startY = containerEl.offsetTop;
            } else if (direct == 'ml') {
              page.resizing = true;
              page.startX = containerEl.offsetLeft + containerEl.clientWidth;
            } else {
              page.dragging = true;
              // page.endX = 0;
              // page.endY = 0;
              page.endX = page.startX = xPosition;
              page.endY = page.startY = yPosition;
            }
          }
          event.preventDefault();
        }
      }
    }
  },

  /**
   * Change selection area position when mouse moved
   */
  onMouseMove: function() {
    var element = event.target;
    if (element && page.isMouseDown) {
      var containerEl = $('huaban_collector_container');
      if (containerEl) {
        var xPosition = event.pageX;
        var yPosition = event.pageY;
        var _width = 0;
        var _height = 0;
        var _left;
        var _top;
        var _direct = page.direct || null;
        if (page.dragging || page.resizing) {
          var zoom = page.getZoomLevel();
          var viewWidth = Math.round(document.body.clientWidth / zoom);
          var viewHeight = Math.round(document.body.clientHeight / zoom);
          if (xPosition > viewWidth) {
            xPosition = viewWidth;
          } else if (xPosition < 0) {
            xPosition = 0;
          }
          if (yPosition > viewHeight) {
            yPosition = viewHeight;
          } else if (yPosition < 0) {
            yPosition = 0;
          }

          if (page.dragging || (page.resizing && ['tr', 'tl', 'br', 'bl'].indexOf(_direct) != -1)) {
            _width = xPosition - page.startX;
            _height = yPosition - page.startY;
            _left = _width > 0 ? page.startX : xPosition;
            _top = _height > 0 ? page.startY : yPosition;
            _width = Math.abs(_width);
            _height = Math.abs(_height);
            page.endX = xPosition;
            page.endY = yPosition;
          } else if (page.resizing && ['mt', 'mr', 'mb', 'ml'].indexOf(_direct) != -1) {
            if (_direct == 'mt' || _direct == 'mb') {
              _height = yPosition - page.startY;
              _left = page.startX;
              _top = _height > 0 ? page.startY : yPosition;
              _width = page.endX - page.startX;
              _height = Math.abs(_height);
              page.endY = yPosition;
            } else if (_direct == 'mr' || _direct == 'ml') {
              _width = xPosition - page.startX;
              _left = _width > 0 ? page.startX : xPosition;
              _top = page.startY;
              _width = Math.abs(_width);
              _height = page.endY - page.startY;
              page.endX = xPosition;
            }
          }
          page.updateShadow(_left, _top, _width, _height);
          page.updateArea(_left, _top, _width, _height);
          page.updateSize(_width, _height);

          if (window.innerWidth < xPosition) {
            document.body.scrollLeft = xPosition - window.innerWidth;
          }
          if (document.body.scrollTop + window.innerHeight < yPosition + 25) {
            document.body.scrollTop = yPosition - window.innerHeight + 25;
          }
          if (yPosition < document.body.scrollTop) {
            document.body.scrollTop -= 25;
          }
        } else if (page.moving) {
          _width = containerEl.clientWidth;
          _height = containerEl.clientHeight;
          var newXPosition = xPosition - page.moveX;
          var newYPosition = yPosition - page.moveY;
          if (newXPosition < 0) {
            newXPosition = 0;
          } else if (newXPosition + _width > page.pageWidth) {
            newXPosition = page.pageWidth - _width;
          }
          if (newYPosition < 0) {
            newYPosition = 0;
          } else if (newYPosition + _height > page.pageHeight) {
            newYPosition = page.pageHeight - _height;
          }

          page.updateShadow(newXPosition, newYPosition, _width, _height);
          page.updateArea(newXPosition, newYPosition, _width, _height);
          page.startX = newXPosition;
          page.endX = newXPosition + _width;
          _top = page.startY = newYPosition;
          page.endY = newYPosition + _height;
        }
        if (_top + _height + 25 > document.documentElement.clientHeight + document.body.scrollTop) {
          $('hc_drag_crop').style.bottom = '3px';
          $('hc_drag_cancel').style.bottom = '3px';
        } else {
          $('hc_drag_crop').style.bottom = '-28px';
          $('hc_drag_cancel').style.bottom = '-28px';
        }

        if (_top < document.body.scrollTop + 22) {
          $('hc_drag_size').style.top = '3px';
        } else {
          $('hc_drag_size').style.top = '-22px';
        }
      }
      event.preventDefault();
    }
  },

  /**
   * Fix the selection area position when mouse up
   */
  onMouseUp: function() {
    page.isMouseDown = false;
    if (event.button != 2) {
      page.resizing = false;
      page.dragging = false;
      page.moving = false;
      page.moveX = 0;
      page.moveY = 0;
      var temp;
      if (page.endX < page.startX) {
        temp = page.endX;
        page.endX = page.startX;
        page.startX = temp;
      }
      if (page.endY < page.startY) {
        temp = page.endY;
        page.endY = page.startY;
        page.startY = temp;
      }
    }
  },

  /**
   * Update the location of the shadow layer
   */
  updateShadow: function(left, top, width, height) {
    // 在下拉刷新的页面中，随时更新页面高宽度
    var zoom = page.getZoomLevel();
    var protectorEl = $('huaban_collector_protector');
    protectorEl.style.width =
      Math.round((document.body.scrollWidth + parseInt(page.marginLeft)) / zoom) + 'px';
    protectorEl.style.height =
      Math.round((document.body.scrollHeight + parseInt(page.marginTop)) / zoom) + 'px';
    page.pageHeight = protectorEl.clientHeight;
    page.pageWidth = protectorEl.clientWidth;

    $('hc_dragshadow_t').style.height = top + 'px';
    $('hc_dragshadow_t').style.width = left + width + 'px';
    $('hc_dragshadow_l').style.height = page.pageHeight - top + 'px';
    $('hc_dragshadow_l').style.width = left + 'px';

    var _height = top + height;
    _height = _height > 0 ? _height : 0;
    var _width = page.pageWidth - left - width;
    _width = _width > 0 ? _width : 0;
    $('hc_dragshadow_r').style.height = _height + 'px';
    $('hc_dragshadow_r').style.width =  _width + 'px';

    _height = page.pageHeight - top - height;
    _height = _height > 0 ? _height : 0;
    _width = page.pageWidth - left;
    _width = _width > 0 ? _width : 0;
    $('hc_dragshadow_b').style.height = _height + 'px';
    $('hc_dragshadow_b').style.width = _width + 'px';
  },

  /**
   * Update drag area attributs: left, top, width, height
   */
  updateArea: function(left, top, width, height) {
    var containerEl = $('huaban_collector_container')
    containerEl.style.left = left + 'px';
    containerEl.style.top = top + 'px';
    containerEl.style.width = Math.abs(width) + 'px';
    containerEl.style.height = Math.abs(height) + 'px';
  },

  /**
   * Refresh the size info
   */
  updateSize: function(width, height) {
    $('hc_drag_size').innerText = page.calculateSizeAfterZooming(width) +
      ' x ' + page.calculateSizeAfterZooming(height);
  },

  /**
   * Remove selection area
   */
  removeSelectionArea: function() {
    // page.unfixBody();
    page.unfixFixed();
    // 恢复悬浮按钮
    page.attachFloatingButton();
    document.querySelector('body').classList.remove('hb-no-user-select');
    $('huaban_collector_protector').removeEventListener('mousedown', page.onMouseDown, false);
    document.removeEventListener('keydown', page.escKeyDown, false);
    document.removeEventListener('mousemove', page.onMouseMove, false);
    document.removeEventListener('mouseup', page.onMouseUp, false);
    $('huaban_collector_boundary').removeEventListener('dblclick',function() {
      page.removeSelectionArea();
      setTimeout(function(){
        page.sendMessage({msg: 'capture_selected'});
      }, 100);
    }, false);
    page.removeElement('huaban_collector_protector');
    page.isSelectionAreaTurnOn = false;
  },

  /**
   * create div
   */
  createDiv: function(parent, id, className) {
    var divElement = document.createElement('div');
    divElement.id = id;
    if (className) {
      divElement.className = className;
    }
    parent.appendChild(divElement);
    return divElement;
  },

  /**
   * Remove an element
   */
  removeElement: function(id) {
    if($(id)) {
      $(id).parentNode.removeChild($(id));
    }
  },

  // injectCssResource: function(cssResource) {
  //   var css = document.createElement('LINK');
  //   css.type = 'text/css';
  //   css.rel = 'stylesheet';
  //   css.href = chrome.extension.getURL(cssResource);
  //   (document.head || document.body || document.documentElement).
  //       appendChild(css);
  // },
  //
  // injectJavaScriptResource: function(scriptResource) {
  //   var script = document.createElement("script");
  //   script.type = "text/javascript";
  //   script.charset = "utf-8";
  //   script.src = chrome.extension.getURL(scriptResource);
  //   (document.head || document.body || document.documentElement).
  //       appendChild(script);
  // },

  attachFloatingButton: function() {
    if (window[global] && window[global]['interface'])
      window[global]['interface'].attachFloatingButton();
  },

  detachFloatingButton: function() {
    if (window[global] && window[global]['interface'])
      window[global]['interface'].detachFloatingButton();
  },

  /**
   * Remove an element
   */
  init: function() {
    if (document.body.hasAttribute('huaban_collector_injected')) {
      return;
    }
    // when injected page loaded, send this message to popup.js
    if (isPageCapturable()) {
      page.sendMessage({msg: 'page_capturable'});
    } else {
      page.sendMessage({msg: 'page_uncapturable'});
    }
    this.addMessageListener();

    // Retrieve original width of view port and cache.
    page.getOriginalViewPortWidth();
  }
};

page.init();

window.onresize = function() {
  if (page.isSelectionAreaTurnOn) {
    page.removeSelectionArea();
    page.showSelectionArea();
  }

  // Reget original width of view port if browser window resized or page zoomed.
  page.getOriginalViewPortWidth();
};

// (function(){
//   var old_client_width = 0;
//   var old_client_height = 0;
//   setInterval(function(){
//     var containerEl = $('huaban_collector_container');
//     if (containerEl &&
//       (document.body.clientWidth != old_client_width
//        || document.body.clientHeight != old_client_height)) {
//       page.updateShadow(containerEl);
//       page.updateSize();
//     }
//   }, 300);
// })();
