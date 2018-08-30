/**
 * Created by yudon on 2018/8/30.
 */

const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
    ctx.body = 'Hello World';
});

app.listen(3001);