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
var url =require('url')         // 解析url
var fs =require('fs')
var path = require('path')      // 路径
var getMime  = require('./fs/model/getmimeformfile').getmime



http.createServer(function (req, res) {
	
	
	
	
	var pathname = url.parse(req.url).pathname;
	var extname = path.extname(pathname);
	
	console.log('路径：：：'+pathname);
	
	if(pathname == '/'){
		pathname = '/index.html'; /*默认加载的首页*/
	}
	
	if(pathname !='/favicon.ico'){
			console.log('./fs/static/'+pathname)
		fs.readFile('./fs/static'+pathname,function (err,data) {
			var mime = getMime(fs,extname);
			res.writeHeader(200,{"Content-Type":mime+";charset:'utf-8'"})
			
			if(err){
				
				res.write(fs.readFileSync('./fs/static/404.html'))
			}
			
			else {
				
				res.write(data)
			}

			// 结束响应
			res.end()
			
		})
	}
	
	


}).listen(3001)