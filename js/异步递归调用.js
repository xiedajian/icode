/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/28
 * Time: 10:26
 */


// 在异步函数中递归不能像同步那样操作


// 先展示一个反面例子

for (var i = 0; i < 5; i++) {
	
	setTimeout(() => console.log(i), 1000);
}


// 期待中的结果

/*
0
1
2
3
4
*/


// 实际结果

/*
5
5
5
5
5
*/


// 2.可以使用匿名函数自调用的方式实现 异步递归

(function async(i) {
	
	if (i >= 5)
		return
	else
		
		setTimeout(() => {
			console.log(i)
			i++
			async(i)
		}, 1000)
	
})(0)


// 输出结果

/*
0
1
2
3
4
*/

