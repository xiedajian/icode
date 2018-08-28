/**
 * Created by PhpStorm.
 * User: admin
 * Date: 2018/8/28
 * Time: 17:48
 */


// 需要MongoDB Node.JS驱动程序

// npm install mongodb --save



// 数据库引用
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// 数据库连接的地址
const url = 'mongodb://localhost:27017';

// 需要操作数据库名称
const dbName = 'icode';


// 连接数据库，这是一个异步的操作
// 记录一下这里出现的一个错误：(node:14196) DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
// 解决办法：添加第二个参数 {useNewUrlParser:true}
MongoClient.connect(url, {useNewUrlParser:true}, function(err, client) {
	
	if(err){ /*数据库连接失败*/
		console.log('数据库连接失败');
		return;
	}
	
	console.log("数据库连接 successfully ");
	
	const db = client.db(dbName);
	
	findDocuments(db,()=>{
		client.close();
	})
	
	
});


// 定义 insertMany 方法将三个文档添加到文档集合中
const insertDocuments = function(db, callback) {
	
	// 获取集合（表）
	const collection = db.collection('user');
	
	// 插入文档
	collection.insertMany([
		{a : 1}, {a : 2}, {a : 3}
	], function(err, result) {
		assert.equal(err, null);
		assert.equal(3, result.result.n);
		assert.equal(3, result.ops.length);
		console.log("Inserted 3 documents into the collection");
		callback(result);
	});
}

// 添加一个返回所有文档的查询
const findDocuments = function(db, callback) {
	// Get the documents collection
	const collection = db.collection('user');
	// Find some documents
	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
		console.log(docs)
		callback(docs);
	});
}

