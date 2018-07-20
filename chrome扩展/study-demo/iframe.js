
function  oneStep() {
    //1.获取当前页面的属性信息
    chrome.tabs.query({
        active:true,
        currentWindow:true
    },function (tabs) {
        console.info('满足查询条件的页面数组：',tabs);
        console.info(typeof tabs);
        var url=tabs[0].url;
        alert('当前页面的url：' +url);

        //上传页面url
        $.ajax({
            url: "http://118.190.150.148:9001/jfsc/userLoginRegisterjfsc/selecIntegralApi?userId=1",
            dataType: 'json',
            async: false,
            success: function(data) {
                alert(data.sum);
            },
            error: function(err) {
                console.log(err);
            }
        });
    })
}

$(".oneStep").on('click',function () {
    oneStep();
})