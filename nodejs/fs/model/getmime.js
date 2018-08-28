/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/28
 * Time: 9:46
 */

// 根据文件后缀名，返回正确的响应头文件格式

exports.getmime = function (extname) {
	
	switch (extname){
		
		case '.html':
			
			return 'text/html';
		case '.css':
			
			return 'text/css';
		
		case '.js':
			
			return 'text/javascript';
		
		default:
			return 'text/html';
	}
}