/**
 * Created by yudon on 2018/8/30.
 */

//  koa 中使用 ejs 模板引擎

// 1.安装 koa-views 和 ejs 模块
// npm i koa-views
// npm i ejs


const koa = require('koa')
const router = require('koa-router')()
// 2. 引入 koa-views
const views = require('koa-views')
const app = new koa()

// 3. 配置 koa-views 中间件 , 后缀名为 html
app.use(views('views',{map:{html:'ejs'}}))

// 写一个中间件配置公共信息， 通常写在ctx.state， 其他中间件和前端试图都可以使用
app.use(async (ctx,next)=>{
    ctx.state.userinfo = 'xiedajian'
    await next()
})

// 4.使用ejs,  ctx.render('index',{title})
router.get('/ejsdemo', async ctx => {
    let title = 'hello koa2'
    console.log(ctx.state.userinfo);    // 在中间件中使用公共变量
    await ctx.render('index',{title})   // 注意，异步操作，添加await
})

app.use(router.routes())            // 启动路由
app.use(router.allowedMethods)      // 建议配置， 在所有路由中间件最后调用，根据 ctx.status 设置response响应头
app.listen(3001)