

/**
 * url 模块
 * 用于操作url
 */

var http = require('http')
var url = require('url')

// 1.url.parse
console.log(url.parse('http://com/index/login?name=xie',true));

var u ={
    protocol: 'http:',
    slashes: true,
    auth: null,
    host: 'com',
    port: null,
    hostname: 'com',
    hash: null,
    search: '?name=xie',
    query: { name: 'xie' },
    pathname: '/index/login',
    path: '/index/login?name=xie',
    href: 'http://com/index/login?name=xie' }

// 2.url.format
console.log(url.format(u));


// 3.url.resolve

console.log(url.resolve('http://www.baidu.com/user/login/?name=xie', '/reg'));



//用http模块创建服务

/*
 req获取url信息   （request）
 res 浏览器返回响应信息 （response）
 * */

http.createServer(function (req, res) {

    // 利用 url 模块从 req.url 中拿到 get请求的参数
	//输入http://localhost:8001/news?aid=123   拿到aid

    // 输入http://localhost:8001/news?aid=123&cid=3   拿到aid 和cid
    
    res.writeHeader(200,{"Content-Type":"text/html;charset='utf-8'"})
	
	console.log(req.url);
    
    if (req.url != 'favicon.ico'){
        var urlResult = url.parse(req.url,true);
	
	    console.log('参数是：' , urlResult.query);
    }
    
    res.write('<h1>hello</h1>')
    res.write('<h5>world</h5>')
    res.end()
}).listen(3001)



