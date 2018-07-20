/**
 * Created by Administrator on 2017/4/10.
 */
require.config({
    baseUrl: 'js/',
    paths: {
        text:'plugins/text/text',
        jquery: 'plugins/jquery/jquery-1.9.1',
        template:'plugins/template/template',
        example:'view/example'
    },
    shim: {
        template:{
            exports:'template'
        }
    }
});

require(['example'], function (Example) {
    new Example();
});