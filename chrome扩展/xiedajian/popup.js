var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        items: [
            {name: 'github', url: 'https://github.com/xiedajian'},
            {name: '博客', url: 'https://xiedajian.github.io/'},
            {name: '简书', url: 'http://www.jianshu.com/u/17065b4870ba'},
        ],
        showMore: false,
        pageMessage:''
    },
    methods: {
        reverseMessage: function () {
            this.message = this.message.split('').reverse().join('')
        },
        openNewWindow: function (item) {
            window.open(item.url);
        },
        showMoreMethod: function () {
            this.showMore = true;
        },
        hideMoreMethod: function () {
            this.showMore = false;
        },
        getCurrentPageInfo: function () {
            //1.获取当前页面的属性信息
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function (tabs) {
                console.info('满足查询条件的页面数组：', tabs);
                console.info(typeof tabs);
                this.pageMessage=JSON.parse(tabs[0]);
                var url = tabs[0].url;
                console.info('当前页面的url：' + url);
            })
        },
        openWindow: function () {
            // 打开新的页面
            window.open('main.html');
        },
        tabsCreate: function () {
            // 打开新的页面
            chrome.tabs.create({
                url: 'https://www.baidu.com'
            }, function (tab) {
                console.log('ok');
                console.info(tab);
            })
        },
        innerJS: function () {
            //向页面注入js
            var script = 'document.body.style.backgroundColor="red";';
            chrome.tabs.executeScript({code: script});
            //通常不会直接插入代码，而是将代码放在一个文件中,插入文件
            // chrome.tabs.executeScript(null, {file: "./static/js/content_script.js"});
        },
        addIframe: function () {
            //向当前页面添加iframe
            var bg = chrome.extension.getBackgroundPage();
            bg.currentPageAddIframe();
        },
        crateNotifications: function () {
            //新建通知
            var bg = chrome.extension.getBackgroundPage();
            bg.showChromeNotifications('this is a message');
        },


    }
})

/**
 *  popup 或者 background 向 content_script主动发送消息
 * @param message {JSON}
 * @param callback  {Function}
 */
function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}

//例如
sendMessageToContentScript({cmd: 'test', value: '你好，我是popup！'}, function (response) {
    console.log('来自content的回复：' + response);
});

// 监听来自content-script的消息
//TODO，注意1： content_scripts向popup主动发消息的前提是popup必须打开！否则需要利用background作中转；
//TODO，注意2：如果background和popup同时监听，那么它们都可以同时收到消息，但是只有一个可以sendResponse，一个先发送了，那么另外一个再发送就无效；
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('收到来自content-script的消息：');
    console.log(request, sender, sendResponse);
    sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
});

// popup 或者 background 向 页面donm 动态注入或执行JS
// 动态执行JS代码
// chrome.tabs.executeScript(tabId, {code: 'document.body.style.backgroundColor="red"'});
// 动态执行JS文件
// chrome.tabs.executeScript(tabId, {file: 'some-script.js'});

// 动态执行CSS代码，TODO，这里有待验证
// chrome.tabs.insertCSS(tabId, {code: 'xxx'});
// 动态执行CSS文件
// chrome.tabs.insertCSS(tabId, {file: 'some-style.css'});

// 本地存储 TODO，建议用chrome.storage而不是普通的localStorage
// TODO， chrome.storage是针对插件全局的，即使你在background中保存的数据，在content-script也能获取到；
//  TODO，chrome.storage.sync可以跟随当前登录用户自动同步，这台电脑修改的设置会自动同步到其它电脑，很方便，如果没有登录或者未联网则先保存到本地，等登录了再同步至网络；