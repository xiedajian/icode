'use strict';

// editor for canvas
var Canvas = (function() {
  var changeColorToRgba = function(color, opacity) {
    var sColor = color.toLowerCase();
    var sColorChange = [];
    for (var i = 1; i < sColor.length; i += 2) {
      sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
    }
    return "rgba(" + sColorChange.join(",") + "," + opacity + ")";
  };

  // Calculate coordinates of arrow
  var calculateArrowCoordinates = function(
      arrowWidth, arrowHeight, startX, startY, endX, endY) {
    var p1 = function() {
      var x = startX - endX;
      var y = startY - endY;
      var hypotenuse = Math.sqrt(x * x + y * y);
      hypotenuse = (hypotenuse == 0 ? arrowHeight : hypotenuse);
      var dx = Math.round(x / hypotenuse * arrowHeight);
      var dy = Math.round(y / hypotenuse * arrowHeight);
      return {x: endX + dx, y: endY + dy};
    }

    var p2 = function(p1, direct) {
      var x = p1.x - startX;
      var y = p1.y - startY;
      var hypotenuse = Math.sqrt(x * x + y * y);
      hypotenuse = (hypotenuse == 0 ? arrowHeight : hypotenuse);
      var dx = Math.round((y / hypotenuse * arrowWidth) * direct);
      var dy = Math.round((x / hypotenuse * arrowWidth) * direct);
      return {x: p1.x + dx, y: p1.y - dy};
    }

    return {p1: p2(p1(), 1), p2: p2(p1(), -1)} ;
  };

  // // add text shadow effect by belltoy, more #2c3eedee
  // var parseShadow = function(shadows) {
  //   shadows = shadows || '';
  //   shadows = shadows.split(", ");
  //   var ret = [];
  //   for (var n = 0, length = shadows.length; n < length; n ++) {
  //     var shadow = shadows[n].split(" ");
  //     var type = shadow[0].replace(parseFloat(shadow[0]), "");
  //     if (type == "em") {
  //       var obj = {
  //         x: metrics.em * parseFloat(shadow[0]),
  //         y: metrics.em * parseFloat(shadow[1])
  //       };
  //     } else {
  //       var obj = {
  //         x: parseFloat(shadow[0]),
  //         y: parseFloat(shadow[1])
  //       };
  //     }
  //     if (shadow[3]) {
  //       obj.blur = parseFloat(shadow[2]);
  //       obj.color = shadow[3];
  //     } else {
  //       obj.blur = 0;
  //       obj.color = shadow[2];
  //     }
  //     ret.push(obj);
  //   }
  //   return ret;
  // };

  return {
    drawStrokeRect: function(
        ctx, color, x, y, width, height, lineWidth) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(x, y, width, height);
    },

    drawFillRect: function(ctx, color, x, y, width, height) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
    },

    drawEllipse: function(
        ctx, color, x, y, xAxis, yAxis, lineWidth, type) {
      var startX = x + xAxis;
      var startY = y;
      ctx.beginPath();
      ctx.lineWidth = lineWidth;
      ctx.moveTo(startX, startY);
      for (var i = 0; i <= 360; i++) {
        var degree = i * Math.PI / 180;
        startX = x + (xAxis - 2) * Math.cos(degree);
        startY = y - (yAxis - 2) * Math.sin(degree);
        ctx.lineTo(startX, startY);
      }
      if (type == 'rect') {
        ctx.fillStyle = changeColorToRgba(color, 0.5);
        ctx.fill();
      } else if (type == 'border') {
        ctx.strokeStyle = color;
        ctx.stroke();
      }
      ctx.closePath();
    },

    // Divide an entire phrase in an array of phrases, all with the max pixel
    // length given.
    getLines: function(ctx, text, width, font) {
      var words = text.split(" ");
      var lines = [];
      var lastLine = "";
      var measure = 0;
      ctx.font = font;
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        measure = ctx.measureText(lastLine + word).width;
        if (measure <= width || word == "") {
          lastLine += word + " ";
        } else {
          if (lastLine != "")
            lines.push(lastLine);

          // break the word if necessary
          measure = ctx.measureText(word).width;
          if (measure <= width) {
            lastLine = word + " ";
          } else {
            lastLine = word[0];
            for (var j = 1; j < word.length; j++) {
              measure = ctx.measureText(lastLine + word[j]).width;
              if (measure <= width) {
                lastLine += word[j];
              } else {
                lines.push(lastLine);
                lastLine = word[j];
              }
            }
            lastLine += " ";
          }
        }
      }
      if (lastLine != "")
        lines.push(lastLine);
      return lines;
    },

    setText: function(
        ctx, text, color, fontSize, fontFamily, lineHeight, x, y, width) {
      ctx.textBaseline = 'top';
      ctx.fillStyle = color;
      ctx.font = fontSize + ' ' + fontFamily;
      ctx.lineHeight = lineHeight;
      var lines = Canvas.getLines(ctx, text, width, ctx.font);
      ctx.save();
      ctx.beginPath();
      for (var i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + lineHeight * i, width);
      }
      ctx.restore();
    },

    drawLine: function(
        ctx, color, lineCap, lineWidth, startX, startY, endX, endY) {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = lineCap;
      ctx.lineTo(endX, endY);
      ctx.closePath();
      ctx.stroke();
    },

    drawArrow: function(
        ctx, color, lineWidth, arrowWidth, arrowHeight, lineCap,
        startX, startY, endX, endY) {
      var arrowCoordinates = calculateArrowCoordinates(
          arrowWidth, arrowHeight,startX, startY, endX, endY);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = lineCap;
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.moveTo(arrowCoordinates.p1.x, arrowCoordinates.p1.y);
      ctx.lineTo(endX, endY);
      ctx.moveTo(arrowCoordinates.p2.x, arrowCoordinates.p2.y);
      ctx.lineTo(endX, endY);
      ctx.closePath();
      ctx.stroke();
    },

    drawRoundedRect: function(
        ctx, color, x, y, width, height, radius, type) {
      ctx.beginPath();
      ctx.moveTo(x, y + radius);
      ctx.lineTo(x, y + height - radius);
      ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
      ctx.lineTo(x + width - radius, y + height);
      ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
      ctx.lineTo(x + width, y + radius);
      ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.quadraticCurveTo(x, y, x, y + radius);
      if (type == 'rect') {
        ctx.fillStyle = changeColorToRgba(color, 0.5);
        ctx.fill();
      } else if (type == 'border') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.closePath();
    },

    blurImage: function(
        realCanvas, simulateCanvas, layerId, startX, startY, endX, endY) {
      var x = startX < endX ? startX : endX;
      var y = startY < endY ? startY : endY;
      var width = Math.abs(endX - startX - 1);
      var height = Math.abs(endY - startY - 1);
      simulateCanvas.width = document.getElementById(layerId).clientWidth + 10;
      simulateCanvas.height = document.getElementById(layerId).clientHeight + 10;
      var ctx = simulateCanvas.getContext('2d');
      try {
        ctx.drawImage(realCanvas, x, y, width, height, 0, 0, width, height);
      } catch(error) {
        console.log(error + ' width : height' + width + ' : ' + height) ;
      }
      var imageData = ctx.getImageData(0, 0, width, height);
      imageData = this.boxBlur(imageData, width, height, 10);
      ctx.putImageData(imageData, 0, 0);
    },

    boxBlur: function(image, width, height, count) {
      var j;
      var pix = image.data;
      var inner = 0;
      var outer = 0;
      var step = 0;
      var rowOrColumn;
      var nextPosition;
      var nowPosition;
      for(rowOrColumn = 0; rowOrColumn < 2; rowOrColumn++) {
        if (rowOrColumn) {
          // column blurring
          outer = width;
          inner = height;
          step = width * 4;
        } else {
          // Row blurring
          outer = height;
          inner = width;
          step = 4;
        }
        for (var i = 0; i < outer; i++) {
          // Calculate for r g b a
          nextPosition = (rowOrColumn == 0 ? (i * width * 4) : (4 * i));
          for (var k = 0; k < 4; k++) {
            nowPosition = nextPosition + k;
            var pixSum = 0;
              for(var m = 0; m < count; m++) {
                pixSum += pix[nowPosition + step * m];
              }
              pix[nowPosition] = pix[nowPosition + step] =
                  pix[nowPosition + step * 2] = Math.floor(pixSum/count);
              for (j = 3; j < inner-2; j++) {
                pixSum = Math.max(0, pixSum - pix[nowPosition + (j - 2) * step]
                    + pix[nowPosition + (j + 2) * step]);
                pix[nowPosition + j * step] = Math.floor(pixSum/count);
              }
              pix[nowPosition + j * step] = pix[nowPosition + (j + 1) * step] =
                  Math.floor(pixSum / count);
          }
        }
      }
      return image;
    }
  }
}());
