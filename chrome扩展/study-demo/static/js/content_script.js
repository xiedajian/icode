
//把页面背景变成红色
// document.body.style.backgroundColor="red";

var start=0;
var started=false;


function addIframe() {
    if(started){
        alert("本插件已经启动!");

        return;
    }
    // alert("准备启动!");
    $("body").append("<iframe id='linkeddb-iframe' class='linkeddb-iframe' src='"+chrome.extension.getURL("../iframe.html")+"' scrolling='no' seamless='seamless'>");
    started = true;
    alert("准备ok!");
}

//content-script 监听 扩展popup/background 发过来的事件
chrome.runtime.onMessage.addListener(function(request, sender, response) {
        if(request.startIframe){

            response({finishInit:true});
            addIframe();
            // if(started){
            //     alert("本插件已经启动!");
            //     return;
            // }
            // alert("准备启动!");
            // $("body").append("<iframe class='iam-iframe' src='"+chrome.extension.getURL("iframe.html")+"' scrolling='no' seamless='seamless'>");
            // started = true;
            // alert("准备ok!");
            // alert('ok')

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