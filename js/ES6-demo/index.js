
const lib1Module=require('lib1');
const lib2Module=require('lib2');


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

