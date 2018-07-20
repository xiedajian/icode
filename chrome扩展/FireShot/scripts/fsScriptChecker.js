//********************************************************************************************************
// FireShot - Webpage Screenshots and Annotations
// Copyright (C) 2007-2017 Evgeny Suslikov (evgeny@suslikov.ru)
//********************************************************************************************************

var scriptLoaded;

chrome.runtime.sendMessage({message:(typeof scriptLoaded == "undefined" ? "loadScript" : "execScript")});