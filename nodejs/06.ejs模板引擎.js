/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/28
 * Time: 13:19
 */


// 要想实现一个动态的web服务器， 不仅需要路由，还需要模板引擎来将数据和html模板拼接成动态页面


// EJS 模板引擎


var http =require('http')
var url =require('url')
var ejs = require('ejs')

// console.log(ejs);
// return


http.createServer(function (req, res) {
	
	var pathname = url.parse(req.url).pathname;
	
	if(pathname == '/login'){
		
		// 利用 ejs 来渲染模板与数据
		ejs.renderFile('./fs/ejs/login.ejs',{msg:'我是动态数据',arr:[1,2,3]},function(err,data){
			
			res.writeHeader(200,{"Content-Type":"text/html;charset:utf-8"})
			console.log(data);
			res.end(data);
		})
		
	}
	else if(pathname == '/register'){
		res.end('register')
		
	}	else if(pathname == '/user'){
		res.end('user')
	}
	
	
}).listen(3001)