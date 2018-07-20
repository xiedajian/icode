//********************************************************************************************************
// FireShot - Webpage Screenshots and Annotations
// Copyright (C) 2007-2016 Evgeny Suslikov (evgeny@suslikov.ru)
//********************************************************************************************************

var holder = document.createElement('div');
holder.id = "FireShotNotification";
holder.style.cssText = "position: absolute; left: 0px; top: 0px; width: 100%; height: 100px; border: 1px solid #999; z-index: 2147483640; cursor: crosshair;";
holder.addEventListener('mousedown', function() {
    window.stop();
}, true);
document.body.appendChild(holder);