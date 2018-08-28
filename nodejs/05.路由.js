/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/28
 * Time: 13:13
 */




var http =require('http')
var url =require('url')         // 解析url


// 理解路由的工作原理

/*
*
* 路由
官方解释：
路由（Routing）是由一个 URI（或者叫路径）和一个特定的 HTTP 方法（GET、POST 等）组成
的，涉及到应用如何响应客户端对某个网站节点的访问。

非官方解释：
路由指的就是针对不同请求的 URL，处理不同的业务逻辑。
* */



http.createServer(function (req, res) {
	
	// console.log(req);
	
	// 请求方式 get post
	console.log(req.method);
	console.log(req.method.toLowerCase());
	
	// 通过url拿到 网址的 pathname 路径字段
	
	var pathname = url.parse(req.url).pathname;
	
	console.log(pathname);
	
	// 实现简单的路由
	if(pathname == '/login'){
		
		
		// get post 获取参数
		
		var method = req.method.toLowerCase();
		
		if(method == 'get'){
			
			var params = url.parse(req.url,true).query
			console.log(params)
			
			res.end('get请求')
			
		}
		
		// post请求获取参数 ,  post请求数据会以chunk 流的方式一块块传输，需要用到两个事件， req.on('data')  req.on('end')
		if(method == 'post'){
			
			var postData ='';
			
			req.on('data',function (postDataChunk) {
				
				postData += postDataChunk;
			})
			
			
			req.on('end',function (err) {
				
				
				// console.log(postData);
				res.end(postData)
				
			})
		
			
		
		}
		
	}
	else if(pathname == '/register'){
		// res.write('register')
		
		res.end("<script>alert('ok');history.back();</script>")
		
	}	else if(pathname == '/user'){
		
		res.end('user')
	}
	
	
}).listen(3001)