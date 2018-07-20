console.log('content');

// content-script主动发消息给后台
function sendMessageToChrome(message) {
    chrome.runtime.sendMessage( message, function(response) {
      console.log('收到来自后台的回复：' + response);
    });
}





//content-script 监听 扩展popup/background 发过来的事件
chrome.runtime.onMessage.addListener(function(request, sender, response) {

    console.log(request);
    if (request.act == 'fetchPageSize') {
        console.log('fetchPageSize');
        var pageSize = {
            scrollHeight: document.body.scrollHeight,
            scrollWidth: document.body.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            clientHeight: document.documentElement.clientHeight
        };
        response(pageSize);
    } else if (request.act = 'scrollPage') {
        window.scrollBy(request.x, request.y);
        var pageSize = {};
        response(pageSize);
    }

});


/**
 * Indicate if the current page can be captured.
 * 判断当前页面是否能被截图
 */
var isPageCapturable = function() {
    return !page.checkPageIsOnlyEmbedElement();
};

function getCount() {
    var scrollWidth = document.body.scrollWidth;
    var scrollHeight = document.body.scrollHeight;
    var visibleWidth = document.documentElement.clientWidth;
    var visibleHeight = document.documentElement.clientHeight;
// 根据可视区域计算整个网页可以拆分成多少行多少列
    var columns = Math.ceil(scrollWidth*1.0 / visibleWidth);
    var rows = Math.ceil(scrollHeight*1.0 / visibleHeight);
    return {scrollHeight:scrollHeight,visibleHeight:visibleHeight}
}






