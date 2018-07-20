'use strict';

var Uploadr = (function(){

  var uploadUrl = 'http://huaban.com/bookmarklet?';

  return {
    getImageUrl: function() {
      return photoshop.getDataUrl();
    },

    open: function(opts) {
      var params = [];
      for (var key in opts) {
        params.push(encodeURIComponent(key));
        params.push('=');
        params.push(encodeURIComponent(opts[key]));
        params.push('&');
      }
      uploadUrl += params.join('');

      var features =
        "status=no,resizable=no,scrollbars=yes," +
        "personalbar=no,directories=no,location=no,toolbar=no," +
        "menubar=no,width=632,height=320,left=0,top=0";

      window.open(uploadUrl, '', features);

      // listen for message to get image data
      this.onGetImageData();
    },

    dataURItoBlobLink: function() {
      var dataUrl = this.getImageUrl();
      var byteString = atob(dataUrl.split(',')[1]);
      var mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      var blob = ajax.constructBlobData(byteString, mimeString);

      var a = document.createElement('a');
      a.download = 'huaban.' + localStorage.screenshotFormat;
      a.href = window.webkitURL.createObjectURL(blob);
      a.dataset.downloadurl = [mimeString, a.download, a.href].join(':');
      a.draggable = true;

      return a;
    },

    getImageData: function() {
      // Decode to binary data
      return this.getImageUrl().split(',')[1];
    },

    onGetImageData: function() {
      var self = this;
      chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.msg === 'getCaptureImageData') {
          sendResponse({ image: self.getImageUrl() });
        }
      });
    }
  }

})();
