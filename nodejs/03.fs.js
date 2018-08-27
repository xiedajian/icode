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


var fs =require('fs')


// 1. fs.stat  检测是文件还是目录
fs.stat('commonjs',function (err,stats) {
	
	if (err){
		console.log(err);
	}
	
	// console.log(stats)
	
	console.log('文件：'+stats.isFile());
	
	console.log('目录：'+stats.isDirectory());
})



// 2. fs.mkdir  创建目录

fs.mkdir('fs',function (err) {
	if (err){
		console.log(err);       // 第二次执行就报错， Error: EEXIST: file already exists
	}
	
	console.log('创建目录成功');
})



// 3. fs.writeFile  创建写入文件(已有文件会被覆盖)

fs.writeFile('./fs/file.txt','创建并写入2',function (err) {
	if (err){
		console.log(err);
	}
	
	console.log('写入成功');
})

// 同步的写法
console.log(fs.writeFileSync('./fs/fileSync.txt', '我是同步写入的数据'));




// 4. fs.appendFile 追加文件

fs.appendFile('./fs/file.txt','\n我是追加数据',function (err) {
	if (err){
		console.log(err);
	}
	
	console.log('追加成功');
})




// 5. fs.readFile 读取文件

fs.readFile('./fs/file.txt',function (err, data) {
	if (err){
		console.log(err);
	}
	
	console.log(data);
	console.log(data.toString());
})





// 6. fs.readdir读取目录

fs.readdir('../',function (err, data) {
	if (err){
		console.log(err);
	}
	
	console.log(data);
})



// 7. fs.rename   两个用处：改名，剪切文件

// fs.rename('./fs/file.txt','./fs/file2.txt',function (err) {
// 	if (err){
// 		console.log(err);
// 	}
//
// 	console.log('改名成功');
// })




// 8. fs.rmdir  删除目录

fs.rmdir('./file2.txt',function (err) {
	if (err){
		console.log(err);
	}
	
	console.log('删除成功');
})






//9. fs.unlink删除文件


fs.unlink('index.txt',function(err){
	
	if(err){
		console.log(err);
		return false;
	}
	console.log('删除文件成功');
})