/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/28
 * Time: 14:51
 */


// 通过仿照 express 路由的实现方式来学习 express 理由


var http = require('http')
var url = require('url')



// 定义一个全局对象用于存储 所有注册路由的回调函数
var G={
	_get:{},        // get post存储，方便取
	_post:{}
}

// 定义http请求集中处理回调函数
var app=function (req,res) {
	
	console.log('app')
	var pathname= url.parse(req.url).pathname
	var method = req.method.toLowerCase();
	
	// 为了避免 login 与 /login 不等的情况下，统一给 path 的两端加上 /  格式为 /login/  ,这里pathname已经带 / 开头，只需处理后面
	if(!pathname.endsWith('/')){
		pathname = pathname + '/'
	}
	
	console.log('path:::'+pathname)
	console.log('G:::',G)
	
	if(G['_'+method][pathname]){
		G['_'+method][pathname](req,res);   // 使用全局存起来的各个路由回调函数
	}else {
		
		res.end('路由不存在')
	}
	
	
}

// 注册 app.get 方法 ，注册 路由 ，把各个路由的请求回调函数统一储存起来
app.get = function (string, callback) {
	
	// 为了避免 login 与 /login 不等的情况下，统一给 path 的两端加上 /  格式为 /login/
	
	if(!string.endsWith('/')){
		string = string + '/'
	}
	
	if (!string.startsWith('/')){
		string = '/' + string
	}
	
	G._get[string] = callback      // 在这里全局存起来
}






// 正常是这样的
// http.createServer(function (req, res) {}).listen(3001)


// 现在用我们定义好的 app 函数
http.createServer(app).listen(3001)




// 下面做测试

app.get('login',function (req, res) {
	
	console.log('执行到这里说明login路由设置成功')
	
	res.end('执行到这里说明login路由设置成功')
})

app.get('register',function (req, res) {
	
	console.log('执行到这里说明register路由设置成功')
	
	res.end('执行到这里说明register路由设置成功')
})