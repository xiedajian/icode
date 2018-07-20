
var isCollecting=false;

/**
 *  popup 或者 background 向 content_script主动发送消息
 * @param message {JSON}
 * @param callback  {Function}
 */
function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}

// Add the browserAction (the button in the browser toolbar) listener.
chrome.browserAction.onClicked.addListener(function(tab) {
    // chrome.tabs.sendMessage(tab.id, {action: 'button-click', });
    currentPageAddIframe();
});

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

    })
}

//星关系一键采集
function oneStepCollect(type,callback) {
    console.log('正在采集中');
    if(isCollecting)return;
    isCollecting=true;
    //1.获取当前页面的属性信息
    chrome.tabs.query({
        active:true,
        currentWindow:true
    },function (tabs) {
        var url=tabs[0].url;    //获取当前页面url
        console.log('当前页面的url：' +url);

        currentPageAddIframe();
        // 上传页面url
        $.ajax({
            url: "https://api.linkeddb.com/bot/confirm",
            type:"POST",
            data:{
              url:url,
              type:type
            },
            dataType: 'json',
            async: true,
            timeout:120000,
            success: function(data) {
                if(data.response=='ok'){
                    var str=type+'-'+data.data.name+'采集成功';
                    if(callback){
                        callback();
                    }

                    // showChromeNotifications(str);

                }else {
                    if(callback){
                        callback();
                    }
                    showChromeNotifications('失败：'+data.message);
                }
                isCollecting=false;
                console.log('采集完成');
            },
            error: function(err) {
                isCollecting=false;
                if(callback){
                    callback();
                }
                showChromeNotifications('服务器链接失败，请稍后再试');
                console.log(err);
                console.log('采集完成');
            }
        });
    })
}

// //创建一个鼠标右键菜单
// chrome.contextMenus.create({
//     title:'星关系一键采集-电视',
//     id:'starRelCollectTV',
//     onclick:function (params) {
//         console.log(params);
//         oneStepCollect('tv');
//     }
// }, function(){
//     console.log(chrome.runtime.lastError);
// });
//
// //创建一个鼠标右键菜单
// chrome.contextMenus.create({
//     title:'星关系一键采集-电影',
//     id:'starRelCollectMV',
//     onclick:function (params) {
//         console.log(params);
//         oneStepCollect('mv');
//     }
// }, function(){
//     console.log(chrome.runtime.lastError);
// });

//复制到剪切板
var hb_ctws_c2c = function (p_t) {
    var ret_bool = false;
    var ne = $('<textarea></textarea>');
    ne.css('height', '1px').css('width', '1px');
    ne.attr('contentEditable', true);
    $('body').append(ne);
    ne.text(p_t);
    ne.attr('unselectable', 'off');
    ne.focus();
    //execCommand方法是执行一个对当前文档进行操作的命令，具体命令指令可以查阅
    document.execCommand('SelectAll');
    //复制选中的文字到剪贴板;
    if (document.execCommand('Copy', false, null)) {
        ret_bool = true;
    }
    ne.remove();
    return ret_bool;
};

//创建一个鼠标右键菜单 : 纯文本复制
chrome.contextMenus.create({
    title:'星关系：纯文本复制',
    id:'copyText',
    contexts: ['selection'],    //选中才会出现
    onclick:function (p_args) {
        // console.log(p_args);
        // 方法1：用chrome api获取选中的文字
        // if (typeof p_args.selectionText !== 'undefined') {
        //     console.log('selectionText',p_args.selectionText);
        //     var s_str = $.trim(p_args.selectionText);
        //     console.log('s_str',s_str);
        //     if (s_str) {
        //         s_str = s_str.replace(/\n/g,`\n`);  //匹配 2次以上的空白 替换为 换行
        //         // s_str = s_str.replace(/\s{2,}/g,`\n`);  //匹配 2次以上的空白 替换为 换行
        //         // s_str = s_str.replace(/\s/g,String.raw` `);  //匹配空白 替换为 换行
        //         console.log('s_str3',s_str);
        //         if (hb_ctws_c2c(s_str)) {
        //
        //         }
        //     }
        // }

        //方法2：用content_script的js获取选中内容
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {startIframe:false,getSelectionText:true},function(response){
                console.log(response);
                if(response.getSelectionText){
                    var getSelectionText=response.getSelectionText;
                    console.log(getSelectionText);
                    hb_ctws_c2c(getSelectionText);
                }
            });
        });

    }
}, function(){
    console.log(chrome.runtime.lastError);
});


//创建一个鼠标右键菜单 ：数据采集
chrome.contextMenus.create({
    title:'星关系：数据采集',
    id:'oneStepCollect',
    onclick:function (params) {
        console.log(params);
        currentPageAddIframe();
    }
}, function(){
    console.log(chrome.runtime.lastError);
});

// 监听页面鼠标右键菜单的点击
chrome.contextMenus.onClicked.addListener(function(menuItem) {
    if (menuItem.menuItemId === "starRel2") {


    }
});

//向当前页面注入iframe
function currentPageAddIframe() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {startIframe:true},function(response){
        });
    });
}

// 监听来自content-script的消息
//TODO，注意1： content_scripts向popup主动发消息的前提是popup必须打开！否则需要利用background作中转；
//TODO，注意2：如果background和popup同时监听，那么它们都可以同时收到消息，但是只有一个可以sendResponse，一个先发送了，那么另外一个再发送就无效；
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
    console.log('收到来自content-script的消息：');
    if(request.greeting){
        showChromeNotifications(request.greeting);
    }
    console.log(request, sender, sendResponse);
    sendResponse('我是后台，我已收到你的消息');
});
