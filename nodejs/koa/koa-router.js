/**
 * Created by yudon on 2018/8/30.
 */

// koa 路由

// 1. koa 没有自带的路由，所以需要安装模块 koa-router

// npm i koa-router


const koa = require('koa')
const router = require('koa-router')()
const app = new koa()

router.get('/',function (ctx, next) {
    // var t1 = new Date();
    // next()
    // var t2 = new Date();
    // console.log(t2 - t1);
    // ctx 包含了 request,response
    ctx.body = 'hello koa'
})

// 使用 async 函数
router.get('/news', async ctx => {
    ctx.body = 'hello news'
})

// 动态路由：id
router.get('/news/:id',async ctx=>{
    // 获取动态路由的参数
    var id = ctx.params.id      // 通过ctx.params获取动态路由参数
    console.log(id);
    ctx.body = `hello ${id}`
})

// 获取 get 传值
router.get('/news/detail', async ctx => {
    // 从request 中获取 get 请求
    let request = ctx.request
    let req_url = request.url
    let req_query = request.query
    let req_queryString = request.querystring
    console.log(req_url);
    console.log(req_query);
    console.log(req_queryString);

    // 直接从上下文 ctx 中获取
    let ctx_url = ctx.url;
    let ctx_query = ctx.query
    let ctx_queryString = ctx.querystring
    console.log(ctx_url);
    console.log(ctx_query);
    console.log(ctx_queryString);
    ctx.body = 'hello news/detail'
})

// 获取post传值 ， 使用 koa-bodyparser 中间件,详情查看 koa-bodyparser



app.use(router.routes())            // 启动路由
app.use(router.allowedMethods)      // 建议配置， 在所有路由中间件最后调用，根据 ctx.status 设置response响应头
app.listen(3001)