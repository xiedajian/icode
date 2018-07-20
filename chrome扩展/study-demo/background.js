







//创建一个鼠标右键菜单
chrome.contextMenus.create({
    title:'谢大见快捷键',
    id:'starRel',
    onclick:function (params) {

    }
}, function(){
    console.log(chrome.runtime.lastError);
});

// 监听菜单的点击
chrome.contextMenus.onClicked.addListener(function(menuItem) {
    if (menuItem.menuItemId === "starRel") {
        alert('右键菜单点击');
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

// 向页面注入JS
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