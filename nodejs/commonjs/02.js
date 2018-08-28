/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/27
 * Time: 11:25
 */


// 测试 node 寻找模块的顺序, 理解 npm包 的工作原理


// 1.在引入同级的 tool.js 时

// var tools = require('./tools')

// tools.sayHello();       // 正常运行




// 2.省略相对路径再次测试

// var tools = require('tools')

// tools.sayHello();  // 报错：Cannot find module 'tools'




// 3. 将tools.js 拷贝一份放到 node_modules 下 重命名 tools2.js 再次测试, 同样省略路径

// var tools2 = require('tools2')

// tools2.sayHello();      // 正常运行 ，说明放在node_modules 下的文件 可以省略 path 路径




// 4. 在node_modules 下创建 tools3 文件下 ，复制一份 tools.js

// var tools3 = require('tools3')

// tools3.sayHello();      // 报错，Cannot find module 'tools3'




// 5. 再次测试，引入路径 写为 tools3/tools

// var tools3 = require('tools3/tools3')

// tools3.sayHello();          // 正常运行 ，说明放在node_modules 下的文件 可以省略相对 path 路径，相对于node_module下开始找




// 6. 我们想达到像引入 http 一样写个模块名就可以，在node_modules 下创建 tools4 文件下 ，复制一份 tools.js ， 写上 package.json 描述文件

var tools4 = require('tools4')          // package 中 "main": "tools.js" 入口文件

tools4.sayHello();          // 正常运行，这就是文件模块（自定义模块）的运行原理，常使用的各种第三方包都是这样的工作模式