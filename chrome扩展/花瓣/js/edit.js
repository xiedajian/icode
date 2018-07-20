'use strict';

var bg = chrome.extension.getBackgroundPage();

function $(id) {
  return document.getElementById(id);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

// edit image
var photoshop = {
  canvas          : document.createElement("canvas"),
  tabTitle        : '',
  startX          : 0,
  startY          : 0,
  endX            : 0,
  endY            : 0,
  dragFlag        : false,
  flag            : 'rectangle',
  layerId         : 'layer0',
  canvasId        : '',
  color           : '#ff0000',
  lastValidAction : 0,
  markedArea      : [],
  isDraw          : true,
  isCropTurnOn    : false,
  // offsetX         : 0,
  // offsetY         : 36,
  nowHeight       : 0,
  nowWidth        : 0,
  highlightType   : 'border',
  highlightMode   : 'rectangle',
  text            : '',
  actions         : [],

  setUnfilled: function() {
    var el = $('photo');
    if (el.offsetLeft > 0)
      el.className = 'unfilled';
    else
      el.classList.remove('unfilled');
  },

  markCurrentElement: function(element) {
    if (element && element.parentNode) {
      var children = element.parentNode.children;
      for (var i = 0; i < children.length; i++) {
        var node = children[i];
        if (node == element)
          element.classList.add('mark');
        else
          node.classList.remove('mark');
      }
    }
  },

  setHighLightMode: function() {
    photoshop.highlightType = localStorage.highlightType || 'border';
    // photoshop.color = localStorage.highlightColor || '#FF0000';
    $(photoshop.layerId).style.border = '2px solid ' + photoshop.color;
    if (photoshop.highlightType == 'rect') {
      $(photoshop.layerId).style.backgroundColor = photoshop.color;
      $(photoshop.layerId).style.opacity = 0.5;
    }
    if (photoshop.flag == 'rectangle') {
      $(photoshop.layerId).style.borderRadius = '0 0';
    } else if (photoshop.flag == 'radiusRectangle') {
      $(photoshop.layerId).style.borderRadius = '6px 6px';
    } else if (photoshop.flag == 'ellipse') {
      $(photoshop.layerId).style.border = '0';
      $(photoshop.layerId).style.backgroundColor = '';
      $(photoshop.layerId).style.opacity = 1;
    }
  },

  setBlackoutMode: function() {
    photoshop.color = '#000000';
    $(photoshop.layerId).style.opacity = 1;
    $(photoshop.layerId).style.backgroundColor = '#000000';
    $(photoshop.layerId).style.border = '2px solid #000000';
  },

  setTextMode: function() {
    var fontSize = +localStorage.fontSize || 14;
    photoshop.color = localStorage.color || '#FF0000';
    var layer = $(photoshop.layerId);
    layer.setAttribute('contentEditable', true);
    layer.style.cursor = 'text';
    layer.style.minWidth = '24px';
    layer.style.width = 'auto';
    layer.style.height = 'auto';
    layer.style.lineHeight = fontSize + 4 + 'px';
    layer.style.fontSize = fontSize + 'px';
    layer.style.color = photoshop.color;
    layer.innerHTML = '<br/>';

    layer.addEventListener('blur',function(){
      photoshop.setTextToArray( 'layer' + (photoshop.lastValidAction - 1) );
    });
  },

  setTextToArray: function(id) {
    var str = $(id).innerText.split("\n");
    var ma;
    if (photoshop.markedArea.length > 0) {
      for (var i = photoshop.markedArea.length - 1; i >= 0; i--) {
        if (photoshop.markedArea[i].id == id) {
          ma = photoshop.markedArea[i];
          ma.context = str;
          ma.width = $(id).offsetWidth;
          ma.height = $(id).offsetHeight;
          ma.endX = ma.startX + ma.width;
          ma.endY = ma.startY + ma.height;
          break;
        }
      }
    }
  },

  finish: function() {
    var context = $('canvas').getContext('2d');
    context.drawImage(photoshop.canvas, 0, 0);
  },

  colorRgba: function(color, opacity) {
    var sColor = color.toLowerCase();
    var sColorChange = [];
    for (var i = 1; i < sColor.length; i += 2)
      sColorChange.push(parseInt("0x" + sColor.slice(i,i + 2)));

    return "rgba(" + sColorChange.join(",") + "," + opacity + ")";
  },

  toDo: function(element, what) {
    if (what == 'crop') {
      photoshop.isDraw = false;
      if (photoshop.flag !== 'crop')
        photoshop.createCropArea();
    } else {
      photoshop.isDraw = true;
      if (photoshop.flag == 'crop')
        photoshop.removeCropArea();
    }

    $('photo').style.cursor = 'crosshair';
    if (what == 'text')
      $('photo').style.cursor = 'text';

    photoshop.flag = what;
    photoshop.markCurrentElement(element);
  },

  setDivStyle: function(x, y) {
    var layerEl = $(photoshop.layerId);
    layerEl.setAttribute("style", "");
    layerEl.setAttribute("contentEditable", false);
    layerEl.style.left = x + 'px';
    layerEl.style.top = y + 'px';
    layerEl.style.height = 0;
    layerEl.style.width = 0;
    layerEl.style.display = 'block';
    switch(photoshop.flag) {
      case 'rectangle':
      case 'radiusRectangle':
      case 'ellipse':
        photoshop.setHighLightMode();
        break;
      case 'redact':
        photoshop.setBlackoutMode();
        break;
      case 'text':
        photoshop.setTextMode();
        break;
      case 'line':
      case 'arrow':
        photoshop.drawLineOnMaskCanvas(x, y, x, y, 'lineStart', photoshop.layerId);
        break;
      case 'blur':
        photoshop.createCanvas(photoshop.layerId);
        break;
    }
  },

  createDiv: function(parent, id, className) {
    var divElement = document.createElement('div');
    divElement.id = id;
    if (className)
      divElement.className = className;

    parent.appendChild(divElement);
    return divElement;
  },

  createCanvas: function(parentId) {
    photoshop.canvasId = 'cav-' + parentId;
    if (!$(photoshop.canvasId)) {
      var cav = document.createElement('canvas');
      cav.id = photoshop.canvasId;
      cav.width = 10;
      cav.height = 10;
      $(photoshop.layerId).appendChild(cav);
      return cav;
    }
    return $(photoshop.canvasId);
  },

  /**
  * Create a layer and set style
  */
  createLayer: function() {
    photoshop.lastValidAction++;
    photoshop.layerId = 'layer' + photoshop.lastValidAction;
    if ($(photoshop.layerId))
      photoshop.removeElement(photoshop.layerId);

    var divElement = document.createElement('div');
    divElement.id = photoshop.layerId;
    divElement.className = 'layer';
    $('photo').appendChild(divElement);
    if (photoshop.flag == 'blur')
      photoshop.createCanvas(photoshop.layerId);
    return divElement;
  },

  removeLayer: function(id) {
    for (var i = 0; i < photoshop.markedArea.length; i++) {
      if (photoshop.markedArea[i].id == id) {
        photoshop.markedArea.splice(i, 1);
        break;
      }
    }
    photoshop.removeElement(id);
  },

  createCropArea: function() {
    photoshop.marginLeft = $('photo').offsetLeft;
    photoshop.marginTop = $('photo').offsetTop;
    var cropWrapperEl = $('crop_wrapper');
    cropWrapperEl.style.width = photoshop.canvas.width + 'px';
    cropWrapperEl.style.height = photoshop.canvas.height + 'px';
    cropWrapperEl.style.display = 'block';
    cropWrapperEl.addEventListener('mousedown', photoshop.cropMouseDown, false);

    // Create elements for area capture.
    photoshop.createDiv(cropWrapperEl, 'dragshadow_t', 'dragshadow');
    photoshop.createDiv(cropWrapperEl, 'dragshadow_b', 'dragshadow');
    photoshop.createDiv(cropWrapperEl, 'dragshadow_l', 'dragshadow');
    photoshop.createDiv(cropWrapperEl, 'dragshadow_r', 'dragshadow');

    var containerEl = photoshop.createDiv(cropWrapperEl, 'crop_container');
    var boundaryEl =  photoshop.createDiv(containerEl, 'crop_boundary');
    photoshop.createDiv(containerEl, 'drag_size');
    photoshop.createDiv(boundaryEl, 'dragline_t', 'dragline');
    photoshop.createDiv(boundaryEl, 'dragline_d', 'dragline');
    photoshop.createDiv(boundaryEl, 'dragline_l', 'dragline');
    photoshop.createDiv(boundaryEl, 'dragline_r', 'dragline');

    // Add event listener for 'cancel' and 'capture' button.
    var cancelEl = photoshop.createDiv(containerEl, 'drag_cancel');
    cancelEl.innerHTML = '取消';
    cancelEl.addEventListener('mousedown', function(e) {
      // Remove area capture containers and event listeners.
      photoshop.removeCropArea();
      photoshop.createCropArea();
      e.stopPropagation();
    }, false);

    var cropEl = photoshop.createDiv(containerEl, 'drag_crop');
    cropEl.innerHTML = '确定';
    cropEl.addEventListener('mousedown', function(e) {
      photoshop.crop();
      e.stopPropagation();
    }, false);
  },

  removeChildrenEls: function(id) {
    var node = document.getElementById(id);
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  },

  removeCropArea: function() {
    $('crop_container').removeEventListener('dblclick',function() {
      photoshop.crop();
    });
    photoshop.removeChildrenEls('crop_wrapper');
    photoshop.isCropTurnOn = false;
  },

  updateShadow: function(left, top, width, height) {
    $('dragshadow_t').style.height = top + 'px';
    $('dragshadow_t').style.width = left + width + 'px';
    $('dragshadow_l').style.height = photoshop.canvas.height - top + 'px';
    $('dragshadow_l').style.width = left + 'px';

    var _height = top + height;
    _height = _height > 0 ? _height : 0;
    var _width = photoshop.canvas.width - left - width;
    _width = _width > 0 ? _width : 0;
    $('dragshadow_r').style.height = _height + 'px';
    $('dragshadow_r').style.width =  _width + 'px';

    _height = photoshop.canvas.height - top - height;
    _height = _height > 0 ? _height : 0;
    _width = photoshop.canvas.width - left;
    _width = _width > 0 ? _width : 0;
    $('dragshadow_b').style.height = _height + 'px';
    $('dragshadow_b').style.width = _width + 'px';
  },

  updateArea: function(left, top, width, height) {
    var containerEl = $('crop_container');
    containerEl.style.left = left + 'px';
    containerEl.style.top = top + 'px';
    containerEl.style.width = Math.abs(width) + 'px';
    containerEl.style.height = Math.abs(height) + 'px';
  },

  updateSize: function(width, height) {
    $('drag_size').innerText = width + ' x ' + height;
  },

  cropMouseDown: function(event) {
    if (event.button == 0 && photoshop.flag === 'crop') {

      var cropMouseMove = function (event) {
        var _width = event.pageX-initX;
        var _height = event.pageY-initY;
        var _left = photoshop.startX = (_width > 0) ? initX : initX + _width;
        var _top = photoshop.startY = (_height > 0) ? initY : initY + _height;
        _left -= photoshop.marginLeft;
        _top -= photoshop.marginTop;
        _width = Math.abs(_width);
        _height = Math.abs(_height);
        photoshop.updateShadow(_left, _top, _width, _height);
        photoshop.updateArea(_left, _top, _width, _height);
        photoshop.updateSize(_width, _height);

        photoshop.endX = photoshop.startX + _width;
        photoshop.endY = photoshop.startY + _height;

        event.stopPropagation();
      };

      var cropMouseUp = function (event) {
        var MIN_WIDTH = 200;

        if((event.pageX-initX == 0 || event.pageY-initY == 0) && $('crop_container').offsetWidth == 0) {
          var _left = photoshop.startX = initX - MIN_WIDTH / 2;
          var _top = photoshop.startY = initY - MIN_WIDTH / 2;
          _left -= photoshop.marginLeft;
          _top -= photoshop.marginTop;
          photoshop.updateShadow(_left, _top, MIN_WIDTH, MIN_WIDTH);
          photoshop.updateArea(_left, _top, MIN_WIDTH, MIN_WIDTH);
          photoshop.updateSize(MIN_WIDTH, MIN_WIDTH);

          photoshop.endX = photoshop.startX + MIN_WIDTH;
          photoshop.endY = photoshop.startY + MIN_WIDTH;
        }
        cropWrapperEl.removeEventListener('mousedown', photoshop.cropMouseDown, false);
        cropWrapperEl.removeEventListener('mousemove', cropMouseMove, false);
        cropWrapperEl.removeEventListener('mouseup', cropMouseUp, false);

        var photoEl = $('photo');
        if (photoshop.endY + 25 > photoEl.offsetTop + photoEl.clientHeight) {
          $('drag_crop').style.bottom = '3px';
          $('drag_cancel').style.bottom = '3px';
        } else {
          $('drag_crop').style.bottom = '-28px';
          $('drag_cancel').style.bottom = '-28px';
        }
        if (photoshop.startY - 22 < photoEl.offsetTop) {
          $('drag_size').style.top = '3px';
        } else {
          $('drag_size').style.top = '-22px';
        }
        $('drag_size').style.display = 'block';
        $('drag_cancel').style.display = 'block';
        $('drag_crop').style.display = 'block';

        photoshop.createDiv(containerEl, 'dragdot_tl', 'dragdot').setAttribute('data-direct', 'tl');
        photoshop.createDiv(containerEl, 'dragdot_tr', 'dragdot').setAttribute('data-direct', 'tr');
        photoshop.createDiv(containerEl, 'dragdot_br', 'dragdot').setAttribute('data-direct', 'br');
        photoshop.createDiv(containerEl, 'dragdot_bl', 'dragdot').setAttribute('data-direct', 'bl');
        photoshop.createDiv(containerEl, 'dragdot_mt', 'dragdot').setAttribute('data-direct', 'mt');
        photoshop.createDiv(containerEl, 'dragdot_mr', 'dragdot').setAttribute('data-direct', 'mr');
        photoshop.createDiv(containerEl, 'dragdot_mb', 'dragdot').setAttribute('data-direct', 'mb');
        photoshop.createDiv(containerEl, 'dragdot_ml', 'dragdot').setAttribute('data-direct', 'ml');
        photoshop.createDiv(containerEl, 'dragbar_t', 'dragbar').setAttribute('data-direct', 'mt');
        photoshop.createDiv(containerEl, 'dragbar_r', 'dragbar').setAttribute('data-direct', 'mr');
        photoshop.createDiv(containerEl, 'dragbar_b', 'dragbar').setAttribute('data-direct', 'mb');
        photoshop.createDiv(containerEl, 'dragbar_l', 'dragbar').setAttribute('data-direct', 'ml');

        $('crop_boundary').addEventListener('dblclick', function() {
            photoshop.crop();
        }, false);
        photoshop.isCropTurnOn = true;
        event.stopPropagation();
      };

      var initX = event.pageX;
      var initY = event.pageY;
      var cropWrapperEl = $('crop_wrapper');
      var containerEl = $('crop_container');

      photoshop.updateShadow(initX, initY, 0, 0);
      // cropWrapperEl.style.backgroundColor = 'rgba(0, 0, 0, 0)';
      cropWrapperEl.addEventListener('mousemove', cropMouseMove, false);
      cropWrapperEl.addEventListener('mouseup', cropMouseUp, false);

      event.stopPropagation();
    }
  },

  cropDragMouseDown: function(event) {
    event.stopPropagation();
    var element = event.target;

    if (element) {
      var elementName = element.tagName;
      if (elementName && document) {
        photoshop.isMouseDown = true;

        var containerEl = $('crop_container');
        var xPosition = event.pageX;
        var yPosition = event.pageY;
        var direct = photoshop.direct = element.getAttribute("data-direct");

        if (containerEl) {
          var _offsetLeft = containerEl.offsetLeft + photoshop.marginLeft;
          var _offsetTop = containerEl.offsetTop + photoshop.marginTop;
          if (element == $('crop_boundary')) {
            photoshop.moving = true;
            photoshop.moveX = xPosition - containerEl.offsetLeft;
            photoshop.moveY = yPosition - containerEl.offsetTop;
          } else if (direct == 'tr') {
            photoshop.resizing = true;
            photoshop.startX = _offsetLeft;
            photoshop.startY = _offsetTop + containerEl.clientHeight;
          } else if (direct == 'tl') {
            photoshop.resizing = true;
            photoshop.startX = _offsetLeft + containerEl.clientWidth;
            photoshop.startY = _offsetTop + containerEl.clientHeight;
          } else if (direct == 'br') {
            photoshop.resizing = true;
            photoshop.startX = _offsetLeft;
            photoshop.startY = _offsetTop;
          } else if (direct == 'bl') {
            photoshop.resizing = true;
            photoshop.startX = _offsetLeft + containerEl.clientWidth;
            photoshop.startY = _offsetTop;
          } else if (direct == 'mt') {
            photoshop.resizing = true;
            photoshop.startY = _offsetTop + containerEl.clientHeight;
          } else if (direct == 'mr') {
            photoshop.resizing = true;
            photoshop.startX = _offsetLeft;
          } else if (direct == 'mb') {
            photoshop.resizing = true;
            photoshop.startY = _offsetTop;
          } else if (direct == 'ml') {
            photoshop.resizing = true;
            photoshop.startX = _offsetLeft + containerEl.clientWidth;
          } else {
            photoshop.dragging = true;
            photoshop.endX = photoshop.startX = xPosition;
            photoshop.endY = photoshop.startY = yPosition;
          }
        }
        event.preventDefault();
      }
    }
  },

  cropDragMouseMove: function(event) {
    event.stopPropagation();
    var element = event.target;
    if (element && photoshop.isMouseDown) {
      var containerEl = $('crop_container');
      if (containerEl) {
        var xPosition = event.pageX;
        var yPosition = event.pageY;
        var _width = 0;
        var _height = 0;
        var _left;
        var _top;
        var _direct = photoshop.direct || null;
        if (photoshop.dragging || photoshop.resizing) {
          var canvasOffsetLeft = $('photo').offsetLeft;
          var canvasOffsetTop = $('photo').offsetTop;
          var canvasWidth = canvasOffsetLeft + photoshop.canvas.width;
          var canvasHeight = canvasOffsetTop + photoshop.canvas.height;
          if (xPosition > canvasWidth) {
            xPosition = canvasWidth;
          } else if (xPosition < canvasOffsetLeft) {
            xPosition = canvasOffsetLeft;
          }
          if (yPosition > canvasHeight) {
            yPosition = canvasHeight;
          } else if (yPosition < canvasOffsetTop) {
            yPosition = canvasOffsetTop;
          }

          if (photoshop.dragging || (photoshop.resizing && ['tr', 'tl', 'br', 'bl'].indexOf(_direct) != -1)) {
            _width = xPosition - photoshop.startX;
            _height = yPosition - photoshop.startY;
            _left = _width > 0 ? photoshop.startX : xPosition;
            _top = _height > 0 ? photoshop.startY : yPosition;
            _width = Math.abs(_width);
            _height = Math.abs(_height);
            photoshop.endX = xPosition;
            photoshop.endY = yPosition;
          } else if (photoshop.resizing && ['mt', 'mr', 'mb', 'ml'].indexOf(_direct) != -1) {
            if (_direct == 'mt' || _direct == 'mb') {
              _height = yPosition - photoshop.startY;
              _left = photoshop.startX;
              _top = _height > 0 ? photoshop.startY : yPosition;
              _width = photoshop.endX - photoshop.startX;
              _height = Math.abs(_height);
              photoshop.endY = yPosition;
            } else if (_direct == 'mr' || _direct == 'ml') {
              _width = xPosition - photoshop.startX;
              _left = _width > 0 ? photoshop.startX : xPosition;
              _top = photoshop.startY;
              _width = Math.abs(_width);
              _height = photoshop.endY - photoshop.startY;
              photoshop.endX = xPosition;
            }
          }
          _left -= photoshop.marginLeft;
          _top -= photoshop.marginTop;
          photoshop.updateShadow(_left, _top, _width, _height);
          photoshop.updateArea(_left, _top, _width, _height);
          photoshop.updateSize(_width, _height);

          if (window.innerWidth < xPosition) {
            document.body.scrollLeft = xPosition - window.innerWidth;
          }
          if (document.body.scrollTop + window.innerHeight < yPosition + 25) {
            document.body.scrollTop = yPosition - window.innerHeight + 25;
          }
          if (yPosition < document.body.scrollTop) {
            document.body.scrollTop -= 25;
          }
        } else if (photoshop.moving) {
          _width = containerEl.clientWidth;
          _height = containerEl.clientHeight;
          var newXPosition = xPosition - photoshop.moveX;
          var newYPosition = yPosition - photoshop.moveY;
          if (newXPosition < 0) {
            newXPosition = 0;
          } else if (newXPosition + _width > photoshop.canvas.width) {
            newXPosition = photoshop.canvas.width - _width;
          }
          if (newYPosition < 0) {
            newYPosition = 0;
          } else if (newYPosition + _height > photoshop.canvas.height) {
            newYPosition = photoshop.canvas.height - _height;
          }
          _top = newYPosition;

          photoshop.updateShadow(newXPosition, newYPosition, _width, _height);
          photoshop.updateArea(newXPosition, newYPosition, _width, _height);
          newXPosition += photoshop.marginLeft;
          newYPosition += photoshop.marginTop;
          photoshop.startX = newXPosition;
          photoshop.endX = newXPosition + _width;
          photoshop.startY = newYPosition;
          photoshop.endY = newYPosition + _height;
        }
        var photoEl = $('photo');
        if (_top + _height + 25 > photoEl.clientHeight) {
          $('drag_crop').style.bottom = '3px';
          $('drag_cancel').style.bottom = '3px';
        } else {
          $('drag_crop').style.bottom = '-28px';
          $('drag_cancel').style.bottom = '-28px';
        }
        if (_top < 22) {
          $('drag_size').style.top = '3px';
        } else {
          $('drag_size').style.top = '-22px';
        }
      }
    }
  },

  cropDragMouseUp: function(event) {
    event.stopPropagation();
    photoshop.isMouseDown = false;
    if (event.button != 2) {
      photoshop.resizing = false;
      photoshop.dragging = false;
      photoshop.moving = false;
      photoshop.moveX = 0;
      photoshop.moveY = 0;
      var temp;
      if (photoshop.endX < photoshop.startX) {
        temp = photoshop.endX;
        photoshop.endX = photoshop.startX;
        photoshop.startX = temp;
      }
      if (photoshop.endY < photoshop.startY) {
        temp = photoshop.endY;
        photoshop.endY = photoshop.startY;
        photoshop.startY = temp;
      }
    }
  },

  /**
  *  Set the starting point(x,y) when mouse pressed
  */
  onMouseDown: function(event) {
    if (photoshop.flag === 'crop') {
      if (photoshop.isCropTurnOn)
        photoshop.cropDragMouseDown(event);
      return;
    }
    if (photoshop.flag === 'text')
      return;
    if (photoshop.isDraw && event.button != 2) {
      photoshop.startX = event.pageX - $('photo').offsetLeft;
      photoshop.startY = event.pageY - $('photo').offsetTop;
      photoshop.setDivStyle(photoshop.startX, photoshop.startY);
      photoshop.dragFlag = true;
    }
  },

  /**
  * Refresh div‘s height and width when the mouse move
  */
  onMouseMove: function(event) {
    if (photoshop.flag === 'crop') {
      if (photoshop.isCropTurnOn)
        photoshop.cropDragMouseMove(event);
      return;
    }
    if(photoshop.dragFlag) {
      $('mask_canvas').style.zIndex = 200;
      photoshop.endX = event.pageX - $('photo').offsetLeft;
      if (photoshop.endX > photoshop.canvas.width)
        photoshop.endX = photoshop.canvas.width;

      if (photoshop.endX < 0)
        photoshop.endX = 0;

      photoshop.endY = event.pageY - $('photo').offsetTop;
      if (photoshop.endY > photoshop.canvas.height)
        photoshop.endY = photoshop.canvas.height ;

      if (photoshop.endY < 0)
        photoshop.endY = 0;

      photoshop.nowHeight = photoshop.endY - photoshop.startY - 1 ;
      photoshop.nowWidth = photoshop.endX - photoshop.startX - 1 ;

      if(photoshop.nowHeight < 0) {
        $(photoshop.layerId).style.top = photoshop.endY + 'px';
        photoshop.nowHeight = -1 * photoshop.nowHeight;
      }
      if(photoshop.nowWidth < 0) {
        $(photoshop.layerId).style.left = photoshop.endX + 'px';
        photoshop.nowWidth = -1 * photoshop.nowWidth;
      }

      $(photoshop.layerId).style.height = photoshop.nowHeight - 3 + 'px';
      $(photoshop.layerId).style.width = photoshop.nowWidth - 3 + 'px';
      if (photoshop.flag == 'line' || photoshop.flag == 'arrow') {
        photoshop.drawLineOnMaskCanvas(photoshop.startX,
                                       photoshop.startY,
                                       photoshop.endX,
                                       photoshop.endY,
                                       'lineDrawing',
                                       photoshop.layerId);
      } else if (photoshop.flag == 'blur') {
        $(photoshop.layerId).style.height = photoshop.nowHeight + 'px';
        $(photoshop.layerId).style.width = photoshop.nowWidth + 'px';
        Canvas.blurImage(photoshop.canvas,
                         $(photoshop.canvasId),
                         photoshop.layerId,
                         photoshop.startX,
                         photoshop.startY,
                         photoshop.endX,
                         photoshop.endY);
      } else if (photoshop.flag == 'ellipse') {
          photoshop.drawEllipseOnMaskCanvas(photoshop.endX,
                                            photoshop.endY,
                                            'drawing',
                                            photoshop.layerId);
      }
    }
    event.stopPropagation();
  },

  onMouseUp: function(event) {
    if (photoshop.flag === 'crop') {
      if (photoshop.isCropTurnOn)
        photoshop.cropDragMouseUp(event);
      return;
    }

    $('mask_canvas').style.zIndex = 10;
    photoshop.endX = event.pageX - $('photo').offsetLeft;
    photoshop.endY = event.pageY - $('photo').offsetTop;
    if (photoshop.flag == 'text') {
      if (photoshop.endX > 0 && photoshop.endX < photoshop.canvas.width &&
          photoshop.endY > 0 && photoshop.endY < photoshop.canvas.height) {
        photoshop.setDivStyle(photoshop.endX, photoshop.endY);
        photoshop.enableUndo();
        photoshop.saveAction({type:'draw'}, {id: photoshop.layerId});
        photoshop.markedArea.push({
          'id'            : photoshop.layerId,
          'startX'        : photoshop.endX,
          'startY'        : photoshop.endY,
          'endX'          : photoshop.endX,
          'endY'          : photoshop.endY,
          'width'         : photoshop.nowWidth,
          'height'        : photoshop.nowHeight,
          'flag'          : photoshop.flag,
          'highlightType' : photoshop.highlightType,
          'fontSize'      : localStorage.fontSize,
          'color'         : photoshop.color,
          'context'       : '',
        });

        $(photoshop.layerId).focus();
        photoshop.createLayer();
      }
      return event.stopPropagation();
    }

    if (photoshop.endX > photoshop.canvas.width)
      photoshop.endX = photoshop.canvas.width ;
    if (photoshop.endX < 0)
      photoshop.endX = 0;

    if (photoshop.endY > photoshop.canvas.height) {
      photoshop.endY = photoshop.canvas.height ;
    }
    if (photoshop.endY < 0) {
      photoshop.endY = 0;
    }

    if (photoshop.isDraw && photoshop.dragFlag &&
      (photoshop.endX != photoshop.startX || photoshop.endY != photoshop.startY)) {
      if (photoshop.flag == 'line' || photoshop.flag == 'arrow') {
        photoshop.drawLineOnMaskCanvas(photoshop.startX,
                                       photoshop.startY,
                                       photoshop.endX,
                                       photoshop.endY,
                                       'drawEnd',
                                       photoshop.layerId);
      } else if (photoshop.flag == 'blur') {
        Canvas.blurImage(photoshop.canvas,
                         $(photoshop.canvasId),
                         photoshop.layerId,
                         photoshop.startX,
                         photoshop.startY,
                         photoshop.endX,
                         photoshop.endY);
      } else if (photoshop.flag == 'ellipse') {
        photoshop.drawEllipseOnMaskCanvas(photoshop.endX,
                                           photoshop.endY,
                                           'end',
                                           photoshop.layerId);
      }
      photoshop.enableUndo();
      photoshop.saveAction({type:'draw'}, {id: photoshop.layerId});
      photoshop.markedArea.push({
        'id'            : photoshop.layerId,
        'startX'        : photoshop.startX,
        'startY'        : photoshop.startY,
        'endX'          : photoshop.endX,
        'endY'          : photoshop.endY,
        'width'         : photoshop.nowWidth,
        'height'        : photoshop.nowHeight,
        'flag'          : photoshop.flag,
        'highlightType' : photoshop.highlightType,
        'fontSize'      : localStorage.fontSize,
        'color'         : photoshop.color,
        'context'       : '',
      });
      $(photoshop.layerId).focus();
      photoshop.createLayer();
    } else if (photoshop.endX == photoshop.startX &&
               photoshop.endY == photoshop.startY) {
      photoshop.removeElement(photoshop.layerId);
      photoshop.createLayer();
    }
    photoshop.dragFlag = false;
    event.stopPropagation();
  },

  /**
  * Remove a div
  */
  removeElement: function(id) {
    if ($(id))
      $(id).parentNode.removeChild($(id));
  },

  /**
  * Use fillStyle, fillText and fillRect functions to draw rectangles,
  * and render to canvas
  */
  draw: function() {
    var context = $('canvas').getContext('2d');
    for (var j = 0; j < photoshop.markedArea.length; j++) {
      var mark   = photoshop.markedArea[j];
      var x      = (mark.startX < mark.endX) ? mark.startX : mark.endX;
      var y      = (mark.startY < mark.endY) ? mark.startY : mark.endY;
      var width  = mark.width;
      var height = mark.height;
      var color  = mark.color;
      switch(mark.flag) {
        case 'rectangle':
          if (mark.highlightType == 'border') {
            Canvas.drawStrokeRect(context, color, x, y, width, height, 2);
          } else {
            var color = changeColorToRgba(color, 0.5);
            Canvas.drawFillRect(context, color, x, y, width, height);
          }
          break;
        case 'radiusRectangle':
          Canvas.drawRoundedRect(context, color,
                                 x, y, width, height,
                                 6, mark.highlightType);
          break;
        case 'ellipse':
          x = (mark.startX + mark.endX) / 2;
          y = (mark.startY + mark.endY) / 2;
          var xAxis = Math.abs(mark.endX - mark.startX) / 2;
          var yAxis = Math.abs(mark.endY - mark.startY) / 2;
          Canvas.drawEllipse(context, color, x, y,
                             xAxis, yAxis, 3, mark.highlightType);
          break;
        case 'redact':
          Canvas.drawFillRect(context, color, x, y, width, height);
          break;
        case 'text':
          for (var i = 0; i < mark.context.length; i++) {
            Canvas.setText(context, mark.context[i], color,
                           mark.fontSize + 'px', 'arial', mark.fontSize,
                           x, y + mark.fontSize * i, width);
          }
          break;
        case 'blur':
          var imageData = context.getImageData(
              x, y, photoshop.markedArea[j].width,
              photoshop.markedArea[j].height);
          imageData = Canvas.boxBlur(
              imageData, photoshop.markedArea[j].width,
              photoshop.markedArea[j].height, 10);
          context.putImageData(
              imageData, x, y, 0, 0, photoshop.markedArea[j].width,
              photoshop.markedArea[j].height);
          break;
        case 'line':
          Canvas.drawLine(
              context, color, 'round', 2,
              mark.startX, mark.startY, mark.endX, mark.endY);
          break;
        case 'arrow':
          Canvas.drawArrow(
              context, color, 2, 4, 10, 'round',
              mark.startX, mark.startY, mark.endX, mark.endY);
          break;
      }
    }
  },

  crop: function() {
    var containerEl = $('crop_container');
    var _left = parseInt(containerEl.style.left);
    var _top = parseInt(containerEl.style.top);
    var _width = parseInt(containerEl.style.width);
    var _height = parseInt(containerEl.style.height);

    var context = $('canvas').getContext('2d');
    var _data = context.getImageData(_left, _top, _width, _height);

    // update layers
    var layerEls = $$('.layer');
    // 这里不需要最后一个空白层
    layerEls = Array.prototype.slice.call(layerEls, 0, layerEls.length - 1);
    for (var i = layerEls.length - 1; i >= 0; i--) {
      layerEls[i].style.left = parseInt(layerEls[i].style.left) - _left + 'px';
      layerEls[i].style.top = parseInt(layerEls[i].style.top) - _top + 'px';
      photoshop.markedArea[i].startX -= _left;
      photoshop.markedArea[i].endX -= _left;
      photoshop.markedArea[i].startY -= _top;
      photoshop.markedArea[i].endY -= _top;
    };

    photoshop.enableUndo();
    photoshop.saveAction({ type: 'crop' }, {
      width: photoshop.canvas.width,
      height: photoshop.canvas.height,
      layers: layerEls,
      offsetTop: _top,
      offsetLeft: _left
    });

    // update canvas
    $('canvas').width = $('mask_canvas').width = photoshop.canvas.width = _width;
    $('photo').style.width = _width + 'px';
    $('canvas').height = $('mask_canvas').height = photoshop.canvas.height = _height;
    $('photo').style.height = _height + 'px';
    photoshop.setUnfilled();

    context.putImageData(_data, 0, 0);
    context = photoshop.canvas.getContext('2d');
    context.putImageData(_data, 0, 0);

    photoshop.removeCropArea();
    photoshop.createCropArea();
  },

  /**
   * Undo the current operation
   */
  undo: function() {

    var restoreAction = function() {
      $('canvas').width = $('mask_canvas').width = photoshop.canvas.width = action.width;
      $('photo').style.width = action.width + 'px';
      $('canvas').height = $('mask_canvas').height = photoshop.canvas.height = action.height;
      $('photo').style.height = action.height + 'px';
      photoshop.setUnfilled();

      var _data = action.data;
      $('canvas').getContext('2d').putImageData(_data, 0, 0);
      photoshop.canvas.getContext('2d').putImageData(_data, 0, 0);

      photoshop.marginLeft = $('photo').offsetLeft;
      photoshop.marginTop = $('photo').offsetTop;
      var cropWrapperEl = $('crop_wrapper');
      cropWrapperEl.style.width = action.width + 'px';
      cropWrapperEl.style.height = action.height + 'px';

      var layerEls = action.layers;
      var _offsetTop = action.offsetTop;
      var _offsetLeft = action.offsetLeft;
      for (var i = layerEls.length - 1; i >= 0; i--) {
        layerEls[i].style.left = parseInt(layerEls[i].style.left) + _offsetLeft + 'px';
        layerEls[i].style.top = parseInt(layerEls[i].style.top) + _offsetTop + 'px';
        photoshop.markedArea[i].startX += _offsetLeft;
        photoshop.markedArea[i].endX += _offsetLeft;
        photoshop.markedArea[i].startY += _offsetTop;
        photoshop.markedArea[i].endY += _offsetTop;
      };

      action = null;
    };

    var len = photoshop.actions.length;
    var action = photoshop.actions.pop();
    if (len == 0) return;
    if (len == 1) photoshop.disableUndo();

    switch(action.type) {
      case 'draw':
        photoshop.removeLayer(action.id);
        break;
      case 'crop':
        restoreAction();
        break;
    }
  },

  enableUndo: function() {
    $('btn_undo').classList.remove('disabled');
  },

  disableUndo: function() {
    $('btn_undo').classList.add('disabled');
  },

  saveAction: function(action, extra) {
    var context = $('canvas').getContext('2d');
    switch(action.type) {
      case 'draw':
        photoshop.actions.push({type: 'draw', id: extra.id});
        break;
      case 'crop':
        var _width = extra.width;
        var _height = extra.height;
        photoshop.actions.push({
          type: 'crop',
          data: context.getImageData(0, 0, _width, _height),
          width: _width,
          height: _height,
          layers: extra.layers,
          offsetTop: extra.offsetTop,
          offsetLeft: extra.offsetLeft
        });
        break;
    }
  },

  getDataUrl: function() {
    photoshop.draw();
    var dataUrl;
    if (localStorage.screenshotFormat == 'jpeg') {
      dataUrl = $('canvas').toDataURL('image/jpeg', 1.0);
      //document.location.href = dataUrl.replace('image/jpeg', 'image/octet-stream');
    } else {
      dataUrl = $('canvas').toDataURL('image/png');
      //document.location.href = dataUrl.replace('image/png', 'image/octet-stream');
    }

    photoshop.finish();
    return dataUrl;
  },

  drawLineOnMaskCanvas: function(startX, startY, endX, endY, type, layerId) {
    var ctx = $('mask_canvas').getContext('2d');
    ctx.clearRect(0, 0, $('mask_canvas').width, $('mask_canvas').height);
    if (type == 'drawEnd') {
      var offset = 20;
      var width = Math.abs(endX - photoshop.startX) > 0 ?
          Math.abs(endX - photoshop.startX): 0;
      var height = Math.abs(endY - photoshop.startY) > 0 ?
          Math.abs(endY - photoshop.startY): 0;
      var offsetLeft = parseInt($(layerId).style.left);
      var offsetTop = parseInt($(layerId).style.top);
      startX = startX - offsetLeft + offset / 2;
      startY = startY - offsetTop + offset / 2;
      endX = endX - offsetLeft + offset / 2;
      endY = endY - offsetTop + offset / 2;
      $(layerId).style.left = offsetLeft - offset / 2 + 'px';
      $(layerId).style.top = offsetTop - offset / 2 + 'px';
      var cavCopy = photoshop.createCanvas(layerId);
      cavCopy.width = width + offset;
      cavCopy.height = height + offset;
      ctx = cavCopy.getContext('2d');
    }
    if (localStorage.lineType == 'line')
      Canvas.drawLine(ctx, localStorage.color, 'round', 2, startX, startY, endX, endY);
    else
      Canvas.drawArrow(ctx, localStorage.color, 2, 4, 10, 'round', startX, startY, endX, endY)
  },

  drawEllipseOnMaskCanvas: function(endX, endY, type, layerId) {
    var ctx = $('mask_canvas').getContext('2d');
    ctx.clearRect(0, 0, $('mask_canvas').width, $('mask_canvas').height);
    var x = (photoshop.startX + endX) / 2;
    var y = (photoshop.startY + endY) / 2;
    var xAxis = Math.abs(endX - photoshop.startX) / 2;
    var yAxis = Math.abs(endY - photoshop.startY) / 2;
    Canvas.drawEllipse(ctx, photoshop.color, x, y, xAxis, yAxis, 3, photoshop.highlightType);
    if (type == 'end') {
      var offsetLeft = parseInt($(layerId).style.left);
      var offsetTop = parseInt($(layerId).style.top);
      var startX = photoshop.startX - offsetLeft ;
      var startY = photoshop.startY - offsetTop ;
      var newEndX = photoshop.endX - offsetLeft ;
      var newEndY = photoshop.endY - offsetTop ;
      x = (startX + newEndX) / 2;
      y = (startY + newEndY) / 2;
      xAxis = Math.abs(newEndX - startX) / 2;
      yAxis = Math.abs(newEndY - startY) / 2;
      var cavCopy = photoshop.createCanvas(layerId);
      cavCopy.width = Math.abs(endX - photoshop.startX);
      cavCopy.height = Math.abs(endY - photoshop.startY);
      var ctxCopy = cavCopy.getContext('2d');
      Canvas.drawEllipse(ctxCopy, photoshop.color, x, y,
          xAxis, yAxis, 3, photoshop.highlightType);
      ctx.clearRect(0, 0, $('mask_canvas').width, $('mask_canvas').height);
    }
  },

  createColorPadEl: function(type) {
    var colorList = ['#000000', '#0036ff', '#008000', '#dacb23', '#d56400',
      '#c70000', '#be00b3', '#1e2188', '#0090ff', '#22cc01', '#ffff00',
      '#ff9600', '#ff0000', '#ff008e', '#7072c3', '#49d2ff', '#9dff3d',
      '#ffffff', '#ffbb59', '#ff6b6b', '#ff6bbd'];
    var colorPadEl = document.createElement('div');
    colorPadEl.id = 'colorpad';
    for(var i = 0; i < colorList.length; i++) {
      var color = colorList[i];
      colorList[i] = document.createElement('a');
      colorList[i].setAttribute('title', color);
      colorList[i].style.backgroundColor = color;
      colorList[i].addEventListener('click', function(e){
        photoshop.colorPadPick(e.target.title, type);
        e.stopPropagation();
      });

      colorPadEl.appendChild(colorList[i]);
    }
    return colorPadEl;
  },

  colorPadPick: function(color, type) {
    photoshop.color = color;
    localStorage.color = color;
    $('color_box').style.background = color;
  },

  setFontSize: function(size) {
    localStorage.fontSize = size;
    $('size_12').className = '';
    $('size_14').className = '';
    $('size_18').className = '';
    $('size_24').className = '';
    $('size_'+size).className = 'mark';
  },

  initTools: function() {
    $('btn_crop').addEventListener('click', function(e) {
      photoshop.toDo(this, 'crop');
      e.stopPropagation();
    }, false);
    $('btn_rectangle').addEventListener('click', function(e) {
      photoshop.toDo(this, 'rectangle');
      e.stopPropagation();
    }, false);
    $('btn_radius_rectangle').addEventListener('click', function(e) {
      photoshop.toDo(this, 'radiusRectangle');
      e.stopPropagation();
    }, false);
    $('btn_ellipse').addEventListener('click', function(e) {
      photoshop.toDo(this, 'ellipse');
      e.stopPropagation();
    }, false);
    $('btn_line').addEventListener('click', function(e) {
      localStorage.lineType = 'line';
      photoshop.toDo(this, 'line');
      e.stopPropagation();
    }, false);
    $('btn_arrow').addEventListener('click', function(e) {
      localStorage.lineType = 'arrow';
      photoshop.toDo(this, 'arrow');
      e.stopPropagation();
    }, false);
    $('btn_blur').addEventListener('click', function(e) {
      photoshop.toDo(this, 'blur');
      e.stopPropagation();
    }, false);
    $('btn_text').addEventListener('click', function(e) {
      photoshop.toDo(this, 'text');
      e.stopPropagation();
    }, false);
    $('btn_undo').addEventListener('click', function(e) {
      photoshop.undo();
      e.stopPropagation();
    }, false);

    // init photoshop flag tobe 'rectangle'
    photoshop.toDo($('btn_rectangle'), 'rectangle');

    var fontSize = localStorage.fontSize || 14;
    if (fontSize != 12 && fontSize != 14 && fontSize != 18 && fontSize != 24)
      fontSize = 14;

    photoshop.setFontSize(fontSize);
    $('size_12').addEventListener('click', function() {
      photoshop.setFontSize(12);
    }, false);
    $('size_14').addEventListener('click', function() {
      photoshop.setFontSize(14);
    }, false);
    $('size_18').addEventListener('click', function() {
      photoshop.setFontSize(18);
    }, false);
    $('size_24').addEventListener('click', function() {
      photoshop.setFontSize(24);
    }, false);

    $('colors_pad').appendChild(photoshop.createColorPadEl('colors'));
    var color = localStorage.color || '#FF0000';
    photoshop.colorPadPick(color);

    // 阻止字体和颜色悬浮选择框的点击事件向画布冒泡
    $('btn_text').addEventListener('mousedown', function(e) { e.stopPropagation(); });
    $('btn_text').addEventListener('mousemove', function(e) { e.stopPropagation(); });
    $('btn_text').addEventListener('mouseup', function(e) { e.stopPropagation(); });
    $('btn_color').addEventListener('mousedown', function(e) { e.stopPropagation(); });
    $('btn_color').addEventListener('mousemove', function(e) { e.stopPropagation(); });
    $('btn_color').addEventListener('mouseup', function(e) { e.stopPropagation(); });
  },

  initCanvas: function() {
    $('canvas').width = $('mask_canvas').width = photoshop.canvas.width = bg.screenshot.canvas.width;
    $('photo').style.width = bg.screenshot.canvas.width + 'px';
    $('canvas').height = $('mask_canvas').height = photoshop.canvas.height = bg.screenshot.canvas.height;
    $('photo').style.height = bg.screenshot.canvas.height + 'px';
    var context = photoshop.canvas.getContext('2d');
    context.drawImage(bg.screenshot.canvas, 0, 0);
    context = $('canvas').getContext('2d');
    context.drawImage(photoshop.canvas, 0, 0);
    $('canvas').style.display = 'block';
  },

  init: function() {
    photoshop.initTools();
    photoshop.initCanvas();
    photoshop.tabTitle = bg.screenshot.tab.title;
    var showBoxHeight = function() {
      photoshop.setUnfilled();
      $('show_box').style.height = window.innerHeight - photoshop.offsetY - 1 + 'px';
    }
    setTimeout(showBoxHeight, 50);
  }
};

window.addEventListener('load', function() {
  // init photoshop
  photoshop.init();

  $('photo').addEventListener('mousedown', photoshop.onMouseDown, false);
  $('photo').addEventListener('mousemove', photoshop.onMouseMove, false);
  $('photo').addEventListener('mouseup', photoshop.onMouseUp, false);

  // 在鼠标移动到画布外，还能起作用
  document.body.addEventListener('mousemove', photoshop.onMouseMove, false);
  document.body.addEventListener('mouseup', photoshop.onMouseUp, false);

  $('canvas').addEventListener('selectstart', function(){
    return false;
  });
  $('mask_canvas').addEventListener('selectstart', function(){
    return false;
  });

  $('btn_save').addEventListener('click', function(e) {
    Uploadr.dataURItoBlobLink().click();
    e.preventDefault();
  });

  $('btn_upload').addEventListener('click', function(e) {
    photoshop.draw();
    photoshop.finish();

    var data = {
      media: 'from_chrome_extension',
      width: photoshop.canvas.width,
      height: photoshop.canvas.height,
      description: bg.screenshot.page_info.text,
      url: bg.screenshot.page_info.href,
      via: 7
    };
    Uploadr.open(data);

    e.preventDefault();
  })

  $('btn_close').addEventListener('click', function(e){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.remove(tabs[0].id);
    });
    e.preventDefault();
  });
});
