
/**
 * 显示chrome通知信息
 * @param message
 */
function showChromeNotifications(message) {
    chrome.notifications.create( '',{
        type:'basic',
        iconUrl:'img/logo.png',
        title:'提示',
        message:message
    },function (nid) {

    });
}

/**
 * 采集api    （查询，添加，更新）
 * @param apiUrl
 * @param data
 * @param callback
 * @param errback
 */
function collect(apiUrl,data,callback,errback) {
    chrome.tabs.query({
        active:true,
        currentWindow:true
    },function (tabs) {
        var url=tabs[0].url;
        console.log('当前页面的url：' +url);
        data.url=url;

        // 上传页面url
        $.ajax({
            url: apiUrl,
            type:"POST",
            data:data,
            dataType: 'json',
            async: true,
            timeout:120000,
            success: function(data) {
                console.log(data);
                if(data.response=='ok'){
                    if(callback){
                        callback(data.data);
                    }
                }else {
                    if(errback){
                        errback();
                    }
                    showChromeNotifications('采集失败：'+data.message);
                }
            },
            error: function(err) {
                if(errback){
                    errback();
                }
                showChromeNotifications('服务器链接失败，请稍后再试');
            }
        });
    });

}



var app = new Vue({
    el: '#app',
    data: {
        isCollecting:false,     //是否正在采集
        showTwoMenu:false,      //是否显示二级菜单，update，add
        hasCollectFinalResult:false,     //是否有采集最终结果了
        type:'mv',
        items:[],
        finalResObj:{},
        title:'二级菜单的标题',
        message:'最终结果提示信息',
        btns:[
            {text:'电视',type:'tv'},
            {text:'电影',type:'mv'},
            {text:'人物',type:'person'},
        ],
    },
    methods: {

        //采集确认
        collect:function (type) {
            this.type=type;
            this.showTwoMenu=false;
            this.isCollecting=true;
            this.hasCollectFinalResult=false;
            collect('https://api.linkeddb.com/bot/confirm',{
                type:type
            },(data)=>{
                console.log(data);
                this.isCollecting=false;
                if(data && data.length>0){
                    //数据库已有数据时，进行数据简介展示，并再次确认操作（更新，添加）
                    this.showTwoMenu=true;
                    this.items=data;
                    this.title='数据库存在相同数据,请选择替换或者添加';
                }else {
                    //没有数据时直接执行添加操作
                    this.collectAdd(type);
                }
            },()=> {
                this.isCollecting=false;
            });
        },
        //添加新的
        collectAdd:function(type){
            type= type || this.type;
            console.log('type:'+type);
            this.showTwoMenu=false;
            this.isCollecting=true;

            collect('https://api.linkeddb.com/bot/add',{
                type:type,
            },(data)=>{
                this.hasCollectFinalResult=true;
                this.isCollecting=false;
                this.finalResObj=data;
                this.message='新增成功';
            },()=>{
                this.isCollecting=false;
                this.showTwoMenu=false;
                this.hasCollectFinalResult=true;
                this.finalResObj={};
                this.message='添加失败，请稍后重试';
            });
        },
        //更有已有数据
        collectUpdate:function(type,neo_id){
            console.log('type:'+type);
            console.log('neo_id:'+neo_id);
            this.showTwoMenu=false;
            this.isCollecting=true;

            collect('https://api.linkeddb.com/bot/update',{
                type:type,
                neo_id:neo_id
            },(data)=>{
                this.hasCollectFinalResult=true;
                this.isCollecting=false;
                this.finalResObj=data;
                this.message='更新成功';
            },()=>{
                this.isCollecting=false;
                this.showTwoMenu=false;
                this.hasCollectFinalResult=true;
                this.message='更新失败，请稍后重试';
                this.finalResObj={};
            });
        },

    }
})
