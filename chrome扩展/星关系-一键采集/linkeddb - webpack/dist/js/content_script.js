var start=0;
var started=false;

// content-script主动发消息给后台
function sendMessageToChrome(message) {
    chrome.runtime.sendMessage({greeting: message}, function(response) {
      console.log('收到来自后台的回复：' + response);
    });
}



function addIframe() {
    if(started){
        console.log("本插件已经启动!");
        //向插件后台发送 提示信息
        sendMessageToChrome("一键采集插件已经启动!");
        return;
    }
    $("body").append("<iframe id='linkeddb-iframe' class='linkeddb-iframe' src='"+chrome.extension.getURL("../iframe.html")+"' scrolling='no' seamless='seamless'>");
    started = true;
}

//content-script 监听 扩展popup/background 发过来的事件
chrome.runtime.onMessage.addListener(function(request, sender, response) {
    if(request.startIframe){
        response({finishInit:true});
        addIframe();
    }else if(request.getSelectionText){
        response({'obj':window.getSelection(),'getSelectionText':getSelectionText()});
    }
});

function getSelectionText() {return window.getSelection().toString().replace(/\n+/g,'\n')}
function getSelectedContents(){
    if (window.getSelection) { //chrome,firefox,opera
        var range=window.getSelection().getRangeAt(0);
        var container = document.createElement('div');
        container.appendChild(range.cloneContents());
        return container.innerHTML;
        //return window.getSelection(); //只复制文本
    }
    else if (document.getSelection) { //其他
        var range=document.getSelection().getRangeAt(0);
        var container = document.createElement('div');
        container.appendChild(range.cloneContents());
        return container.innerHTML;
        //return document.getSelection(); //只复制文本
    } // by www.jquerycn.cn
    else if (document.selection) { //IE特有的
        return document.selection.createRange().htmlText;
        //return document.selection.createRange().text; //只复制文本
    }
}