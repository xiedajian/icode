var start=0;
var started=false;

/**
 * content-script主动发消息给后台
 * @param message {string} 发送的信息
 */
function sendMessageToChrome(message) {
    chrome.runtime.sendMessage({greeting: message}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
}

/**
 * 向当前页面添加iframe
 */
function addIframe() {
    if(started){
        console.log("本插件已经启动!");
        //向插件后台发送 提示信息
        sendMessageToChrome("一键采集插件已经启动!");
        return;
    }
    $("body").append("<iframe id='xiedajian-iframe' class='linkeddb-iframe' src='"+chrome.extension.getURL("../iframe.html")+"' scrolling='no' seamless='seamless'>");
    started = true;
}

//content-script 监听 扩展popup/background 发过来的事件
chrome.runtime.onMessage.addListener(function(request, sender, response) {
        if(request.startIframe){
            response({finishInit:true});
            addIframe();
        }
});

// content-script主动发消息给后台
// chrome.runtime.sendMessage({greeting: '你好，我是content-script呀，我主动发消息给后台！'}, function(response) {
//     console.log('收到来自后台的回复：' + response);
// });


// content-script与页面的通讯
//监听页面传过来的事件
// window.addEventListener("message", function(e)
// {
//     console.log(e.data);
// }, false);
//页面中执行下面向content-script发送消息
// window.postMessage({"test": '你好！'}, '*');