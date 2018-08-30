/**
 * Created by yudon on 2018/8/30.
 */


// koa 托管静态资源

// 1、安装 koa-static
// npm install --save koa-static


const Koa = require('koa');
// 2、引入配置中间件
const static = require('koa-static');
const path = require('path');
const app = new Koa();

// 3. 配置中间件
app.use(static('static'))       // 例如：http://localhost:3001/index.css


app.listen(3001);