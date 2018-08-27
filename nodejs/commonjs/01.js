/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/27
 * Time: 11:15
 */


// 使用node内置模块，可以直接引入
	
var http = require('http')


// 使用自定义模块，需要写路径

// var t =require('./tools.js')
var t =require('./tools')       // js后缀可以省略


t.sayHello()

console.log(t.add(2, 3));


