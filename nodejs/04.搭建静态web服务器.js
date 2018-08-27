/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/27
 * Time: 16:50
 */


// 利用 http url fs 来做一个静态服务器


// 1. 输入不同的网址获取不同的页面

// 2. 根据请求的资源正确返回响应css,js,图片资源

// 3. 匹配不到返回404页面


var http =require('http')
var url =require('url')
var fs =require('fs')



http.createServer(function (req, res) {
	
	var pathname = req.url;
	
	console.log(pathname);
	
	if(pathname == '/'){
		pathname = '/index.html';
	}
	
	if(pathname !='/favicon.ico'){
		
		fs.readFile('./fs/static/'+pathname,function (err,data) {
			
		})
	}
	
	// 解析url
	var urlR = url.parse(req.url,true)
	
	console.log(req.url);
	console.log(urlR);
	
	res.writeHeader(200,{"Content-Type":"text/html;charset:'utf-8'"})
	
	
	// url中获取参数
	if(urlR.query.userId){
		
		// 读取文件，写入response
		res.write(fs.readFileSync('./fs/index.html'))
		
	}else {
		
		res.write(fs.readFileSync('./fs/login.html'))
	}
	
	// 结束响应
	res.end()
	
}).listen(3001)