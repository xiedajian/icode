$(function () {
    // var isClicking=false;
    // $(".btn").on('click',function () {
    //     if(isClicking==true)return;
    //     isClicking=true;
    //     var _this=this;
    //     var oldHtml=$(this).html();
    //     var type=$(this).attr('data-type');
    //     $(this).html('正在采集...');
    //
    //     //1.获取background.js实例
    //     var bg = chrome.extension.getBackgroundPage();
    //     console.log(bg);
    //     bg.oneStepCollect(type,function () {
    //         $(_this).html(oldHtml);
    //         isClicking=false;
    //     });
    // });

    $('#oneTepCollect').on('click',function () {
        var bg = chrome.extension.getBackgroundPage();
        bg.currentPageAddIframe();
    })
});


