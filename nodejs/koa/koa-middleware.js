

const koa = require('koa')
const router = require('koa-router')()
const app = new koa()

// 1.应用级中间件 app.use  next
app.use(async (ctx,next) => {
    var t1 = new Date();
    await  next();
    var t2 = new Date();
    console.log(t2 - t1);
})

// 2.路由中间件 router.use  next
router.get('/',async (ctx,next)=> {
    console.log('路由中间件');
    next()
})

router.get('/',async ctx=> {
    ctx.body = 'hello koa'
})

// 3.错误处理中间件
app.use(async (ctx,next)=>{
    next()
    if(ctx.status == 404){
        ctx.status = 404
        ctx.body = '404页面'
    }
})

// 4.第三方中间件 , 例如 ejs 的使用

app.use(router.routes())            // 启动路由
app.use(router.allowedMethods)      // 建议配置， 在所有路由中间件最后调用，根据 ctx.status 设置response响应头
app.listen(3001)