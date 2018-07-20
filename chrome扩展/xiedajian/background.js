
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

/**
 * 显示chrome通知信息
 * @param message
 */
function showChromeNotifications(message) {
    chrome.notifications.create( '',{
        type:'basic',
        iconUrl:'img/icon_32.png',
        title:'提示',
        message:message
    },function (nid) {

    })
}

//向当前页面注入iframe
function currentPageAddIframe() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {startIframe:true},function(response){
        });
    });
}

// 监听扩展browserAction图标的点击事件
chrome.browserAction.onClicked.addListener(function(tab) {
    // chrome.tabs.sendMessage(tab.id, {action: 'button-click', });
    console.log('点击了browserAction图标');
});

//创建一个鼠标右键菜单
chrome.contextMenus.create({
    title:'谢大见',
    id:'starRel',
    onclick:function (params) {
        console.log(params);
        currentPageAddIframe();
    }
}, function(){
    console.log(chrome.runtime.lastError);
});

// 监听鼠标右键菜单的点击
chrome.contextMenus.onClicked.addListener(function(menuItem) {
    if (menuItem.menuItemId === "starRel") {

    }
});

// 获取当前选项卡ID
function getCurrentTabId(callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        if(callback) callback(tabs.length ? tabs[0].id: null);
    });
}

// 向页面注入JS文件
function injectCustomJs(jsPath)
{
    jsPath = jsPath || 'js/inject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath);
    temp.onload = function()
    {
        // 放在页面不好看，执行完后移除掉
        this.parentNode.removeChild(this);
    };
    document.head.appendChild(temp);
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