'use strict';

var _ = {
  isThisPlatform: function(operationSystem) {
    return navigator.userAgent.toLowerCase().indexOf(operationSystem) > -1;
  },

  isRetinaDisplay: function() {
    if (window.matchMedia) {
      var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
      if (mq && mq.matches || (window.devicePixelRatio > 1.3)) {
        return true;
      } else {
        return false;
      }
    }
  },

  asyncMap: function(array, iterator, callback) {
    if (array.length === 0) return callback();

    var completed = 0;
    var len = array.length;
    var _arr = [];
    for (var i = 0; i < len; i++) {
      iterator(array[i], function(err, result) {
        if (err) return callback(err);

        completed++;
        _arr.push(result);

        if (completed === len) return callback(null, _arr);
      });
    }
  }
}
