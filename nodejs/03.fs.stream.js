/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/27
 * Time: 16:35
 */



const fs = require('fs')



//流的方式写入文件
//
// var wStream = fs.createWriteStream('./fs/stream.txt');
//
// var str = '我是从数据库获取的数据，我要保存起来22\n';
//
// for(var i=0;i<100;i++){
// 	wStream.write(str,'utf8')
// }
//
//
// wStream.end();
//
// wStream.on('finish',function () {
//
// 	console.log('流写入完成');
// })
//
//
// wStream.on('error',function () {
//
// 	console.log('流写入失败');
// })





// 流的方式读取数据

var rStream = fs.createReadStream('./fs/stream.txt');

var rStr = '';
var count =0;

rStream.on('data',function (chunk) {
	
	console.log(chunk.toString())
	
	rStr +=chunk;
	count ++
})


rStream.on('error',function(err){
	console.log('读取失败',err);
})



rStream.on('end',function (chunk) {
	
	console.log(count);
})