/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/27
 * Time: 15:49
 */


var http =require('http')
var url =require('url')
var fs =require('fs')



http.createServer(function (req, res) {
	
	
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