/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/28
 * Time: 10:11
 */


// 根据文件后缀名，返回正确的响应头文件格式
// 后缀列表在 static/mime/mime.json

exports.getmime = function (fs,extname) {
	
	var str = fs.readFileSync('./fs/static/mime/mime.json')
	
	var mimes = JSON.parse(str);
	
	return mimes[extname] || 'text/html'
}