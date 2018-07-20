

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
// chrome.browserAction.onClicked.addListener(function(tab) {
//     // chrome.tabs.sendMessage(tab.id, {action: 'button-click', });
//     currentPageAddIframe();
// });

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



//创建一个鼠标右键菜单
chrome.contextMenus.create({
    title:'星关系数据采集',
    id:'oneStepCollect',
    onclick:function (params) {
        console.log(params);
        currentPageAddIframe();
    }
}, function(){
    console.log(chrome.runtime.lastError);
});



chrome.browserAction.onClicked.addListener(function(tab) {

    chrome.desktopCapture.chooseDesktopMedia([
        'screen', 'window'//, 'tab'
    ], tab, function(streamId) {
        if (chrome.runtime.lastError) {
            alert('Failed to get desktop media: ' +
                chrome.runtime.lastError.message);
            return;
        }

        var code = '(' + function(streamId) {
            navigator.webkitGetUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: streamId
                    }
                }
            }, function onSuccess(stream) {
                var url = URL.createObjectURL(stream);
                var vid = document.createElement('video');
                vid.src = url;
                document.body.appendChild(vid);
            }, function onError() {
                alert('Failed to get user media.');
            });
        } + ')(' + JSON.stringify(streamId) + ')';

        chrome.tabs.executeScript(tab.id, {
            code: code
        }, function() {
            if (chrome.runtime.lastError) {
                alert('Failed to execute script: ' +
                    chrome.runtime.lastError.message);
            }
        });
    });
});

// 截屏
// chrome.tabs.captureVisibleTab(integer windowId, object options, function callback)
function captureVisibleTab() {
    chrome.tabs.captureVisibleTab(null, {format: "png", quality: 100}, function(data) {
        var image = new Image();
        image.onload = function() {
            var width = image.width;
            var height = image.height;

            console.log(width);
            console.log(height);
        };
        image.src = data;
    });
}


// 监听来自content-script的消息
//TODO，注意1： content_scripts向popup主动发消息的前提是popup必须打开！否则需要利用background作中转；
//TODO，注意2：如果background和popup同时监听，那么它们都可以同时收到消息，但是只有一个可以sendResponse，一个先发送了，那么另外一个再发送就无效；
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
// {
//     console.log('收到来自content-script的消息：');
//     if(request.greeting){
//         showChromeNotifications(request.greeting);
//     }
//     console.log(request, sender, sendResponse);
//     sendResponse('我是后台，我已收到你的消息');
// });


var id = 100;

var Capturer = {
    canvas: document.createElement("canvas"),
    yPos: 0,
    scrollHeight: 0,
    scrollWidth: 0,
    fetchPageSize: function (tabId){
        var self = this;
        chrome.tabs.sendMessage(tabId, {act: 'fetchPageSize'}, self.onResponseVisibleSize);
        // this.captureVisibleBlock();
    },
    scrollPage: function(tabId, x, y){
        var self = this;
        chrome.tabs.sendMessage(tabId, {act: 'scrollPage', x: x, y: y}, self.onScrollDone);
    },
    onScrollDone: function(resMsg) {
        console.log('onScrollDone', resMsg);
        setTimeout(function(){
            Capturer.captureVisibleBlock();
        }, 1000)
    },
    startCapture: function(){
        // scroll to top

        this.yPos = 0;
        this.scrollPage(this.tabId, 0, -1 * this.scrollHeight);
        // self.postImg();
    },
    onResponseVisibleSize: function (pageSize) {
        Capturer.scrollWidth = pageSize.scrollWidth;
        Capturer.scrollHeight = pageSize.scrollHeight;
        Capturer.clientWidth = pageSize.clientWidth;
        Capturer.clientHeight = pageSize.clientHeight;

        Capturer.canvas.width = pageSize.scrollWidth;
        Capturer.canvas.height = pageSize.scrollHeight;

        Capturer.startCapture();
    },
    captureVisibleBlock: function (w, h){
        var self = this;
        var width = w || self.clientWidth;
        var height = h || self.clientHeight;

        chrome.tabs.captureVisibleTab(null, function(img) {
            var blockImg = new Image();
            var canvas = self.canvas;

            if (Capturer.yPos + Capturer.clientHeight >= Capturer.scrollHeight) {
                blockImg.onload = function() {
                    var ctx = canvas.getContext("2d");
                    var y = Capturer.clientHeight - Capturer.scrollHeight % Capturer.clientHeight;
                    ctx.drawImage(blockImg, 0, 0, width, height, 0, self.yPos - y, width, height);
                    Capturer.postImg();
                };
            } else {
                blockImg.onload = function() {
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(blockImg, 0, 0, width, height, 0, Capturer.yPos, width, height);
                    Capturer.yPos += Capturer.clientHeight;
                    self.scrollPage(self.tabId, 0, Capturer.clientHeight);
                };
            }

            blockImg.src = img;
        });

    },
    scrollToNextBlock: function () {

    },
    postImg: function () {
        var canvas = Capturer.canvas;
        var screenshotUrl = canvas.toDataURL();
        var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + id++);
        chrome.tabs.create({url: viewTabUrl}, function(tab) {
            var targetId = tab.id;

            var addSnapshotImageToTab = function(tabId, changedProps) {
                // We are waiting for the tab we opened to finish loading.
                // Check that the the tab's id matches the tab we opened,
                // and that the tab is done loading.
                if (tabId != targetId || changedProps.status != "complete")
                    return;

                // Passing the above test means this is the event we were waiting for.
                // There is nothing we need to do for future onUpdated events, so we
                // use removeListner to stop geting called when onUpdated events fire.
                chrome.tabs.onUpdated.removeListener(addSnapshotImageToTab);

                // Look through all views to find the window which will display
                // the screenshot.  The url of the tab which will display the
                // screenshot includes a query parameter with a unique id, which
                // ensures that exactly one view will have the matching URL.
                var views = chrome.extension.getViews();
                for (var i = 0; i < views.length; i++) {
                    var view = views[i];
                    if (view.location.href == viewTabUrl) {
                        view.setScreenshotUrl(screenshotUrl);
                        break;
                    }
                }
            };
            chrome.tabs.onUpdated.addListener(addSnapshotImageToTab);
        });
    }
};
function takeScreenshot() {
    var tabId = chrome.tabs.getSelected(function(tab){
        Capturer.tabWin = window;
        Capturer.tabId = tab.id;
        Capturer.fetchPageSize(tab.id);
    });
}
/*

document.body.clientWidth
    height: document.documentElement.clientHeight

document.body.scrollWidth

Document.body.scrollTop

window.scrollX

网页可见区域宽： document.body.clientWidth
网页可见区域高： document.body.clientHeight
网页可见区域宽： document.body.offsetWidth (包括边线的宽)
网页可见区域高： document.body.offsetHeight (包括边线的高)
网页正文全文宽： document.body.scrollWidth
网页正文全文高： document.body.scrollHeight
网页被卷去的高： document.body.scrollTop
网页被卷去的左： document.body.scrollLeft
网页正文部分上： window.screenTop
网页正文部分左： window.screenLeft
屏幕分辨率的高： window.screen.height
屏幕分辨率的宽： window.screen.width
屏幕可用工作区高度： window.screen.availHeight
屏幕可用工作区宽度： window.screen.availWidth */


