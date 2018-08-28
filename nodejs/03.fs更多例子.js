/*
 1. fs.stat  检测是文件还是目录
 2. fs.mkdir  创建目录
 3. fs.writeFile  创建写入文件
 4. fs.appendFile 追加文件
 5. fs.readFile 读取文件
 6. fs.readdir读取目录
 7. fs.rename 重命名
 8. fs.rmdir  删除目录
 9. fs.unlink删除文件
*/

var fs=require('fs')


//1.判断服务器上面有没有upload目录。没有创建这个目录。   （图片上传）

//
// fs.stat('upload',function (err,stats) {
//
// 	if(err){
// 		// 没有
//
// 		fs.mkdir('upload',function (err) {
// 			if (err){
//
// 			}
//
// 			console.log('新建目录成功')
// 		})
// 	}
//
// 	if(stats.isFile()){
// 		fs.mkdir('upload',function (err) {
// 			if (err){
//
// 			}
//
// 			console.log('新建目录成功')
// 		})
// 	}
// })




//2. 找出html目录下面的所有的目录，然后打印出来

var filesArr=[];
fs.readdir('fs',function(err,files){
	if(err){
		console.log(error);
		
	}else{
		
		/*判断是目录还是文件夹*/
		//console.log(files);  /*数组*/
		
		(function getFile(i){
			
			if(i==files.length){  /*循环结束*/
				
				console.log('目录：');
				console.log(filesArr);   /*打印出所有的目录*/
				return false;
				
			}
			//files[i]  =   css  js   news.html
			//注意：目录
			fs.stat('commonjs/'+files[i],function(error,stats){  /*循环判断是目录还是文件  ---异步 错误写法*/
				
				if(stats.isDirectory()){ /*目录*/
					
					filesArr.push (files[i]);  /*保存数据*/
				}
				
				
				//递归掉用
				getFile(i+1);
			})
		})(0)
		
	}
	
	
})
