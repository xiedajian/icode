'use strict';

var HotKey = (function() {
  return {
    setup: function() {
      // Set default hot key of capture, R V H P.
      if (!this.get('area'))
        this.set('area', 'R');
      if (!this.get('viewport'))
        this.set('viewport', 'V');
      if (!this.get('fullpage'))
        this.set('fullpage', 'H');
      if (!this.get('screen'))
        this.set('screen', 'P');

      if (this.isEnabled()) {
        this.set('screen', '@'); // Disable hot key for screen capture.
      }
    },

    /**
     * Set hot key by type.
     * @param {String} type Hot key type, must be area/viewport/fullpage/screen.
     * @param {String} value
     */
    set: function(type, value) {
      var key = type + '_capture_hotkey';
      localStorage.setItem(key, value);
    },

    get: function(type) {
      return localStorage.getItem(type + '_capture_hotkey');
    },

    getCharCode: function(type) {
      return this.get(type).charCodeAt(0);
    },

    enable: function() {
      localStorage.setItem('hotkey_enabled', true);
    },

    disable: function() {
      localStorage.setItem('hotkey_enabled', false);
    },

    isEnabled: function() {
      return localStorage.getItem('hotkey_enabled') === 'true';
    }
  }
})();
