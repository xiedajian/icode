/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/27
 * Time: 11:15
 */


var tools = {
	add:function (x, y) {
		return x+y;
	},
	sayHello:function () {
		
		console.log('hello');
	}
}


// 暴露模块
exports.tools = tools;
// 暴露模块另一种方式
module.exports = tools;