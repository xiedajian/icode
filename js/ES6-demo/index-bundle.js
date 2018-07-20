/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {


const lib1Module=__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"lib1\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
const lib2Module=__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"lib2\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));


console.log('index.js');
// Todo: 会依次打印'lib1.js','lib2.js','index.js'，说明引入模块的时候，模块是会初始化执行的；

// 测试1：直接执行lib1中方法；
// lib1();
// console.log(lib1);
//Todo:报错Error: lib1 is not defined,说明require并不是单纯的复制整个文件所有代码进来

// 测试2：执行lib1Module.lib1中方法；
// lib1Module.lib1();
// console.log(lib1Module);
//Todo:报错TypeError: lib1Module.lib1 is not a function，说明require进来的并不是文件全部作为对象，应该require只是文件的部分

// 测试3：执行lib1文件exports对象中的lib1Fun1；
// lib1Module.lib1Fun1();
// console.log(lib1Module);
//Todo:成功打印 'i am lib1'，说明require进来只是lib1文件导出的对象module.exports



/***/ })
/******/ ]);