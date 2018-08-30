/**
 * Created by yudon on 2018/8/30.
 */

// # koa-bodyparser 中间件用于获取 post 提交的数据

// 1.安装模块
// npm i koa-bodyparser

const koa = require('koa')
// 2.引入模块
var bodyParser = require('koa-bodyparser');
const views = require('koa-views')
const router = require('koa-router')()
const app = new koa()

// 3.配置中间件
app.use(bodyParser());

app.use(views('views',{map:{html:'ejs'}}))

router.get('/user/add',async ctx=>{
    await ctx.render('user_add')
})

router.post('/user/doadd',async ctx => {
    //  4.使用 ctx.request.body 接受 post 数据
    ctx.body = ctx.request.body;
    console.log(ctx.request.body);
});


app.use(router.routes())
app.use(router.allowedMethods)
app.listen(3001)