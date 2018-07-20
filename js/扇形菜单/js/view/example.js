
define(['jquery','template'],function($,template){
        function Example(){
                this.setArcMenu();
        }
        Example.prototype={
                setArcMenu: function () {
                        //获取菜单数据
                        var arcMenuData={
                                arcParentItems:[
                                        {mid:1,'title':'标题说明一',iconClass:'icon-picture',arcChildItems:[
                                                {mid:1000001,'title':'子标题说明一',iconClass:'icon-picture'}
                                        ]},
                                        {mid:2,'title':'标题说明二',iconClass:'icon-headphones',arcChildItems:[
                                                {mid:2000001,'title':'子标题说明一',iconClass:'icon-picture'},
                                                {mid:2000002,'title':'子标题说明二',iconClass:'icon-headphones'},
                                                {mid:2000003,'title':'子标题说明三',iconClass:'icon-home'}
                                        ]},
                                        {mid:3,'title':'标题说明三',iconClass:'icon-home',arcChildItems:[
                                                {mid:3000001,'title':'子标题说明一',iconClass:'icon-picture'},
                                                {mid:3000002,'title':'子标题说明二',iconClass:'icon-headphones'},
                                                {mid:3000003,'title':'子标题说明三',iconClass:'icon-home'},
                                                {mid:3000004,'title':'子标题说明四',iconClass:'icon-facetime-video'}
                                        ]},
                                        {mid:4,'title':'标题说明四',iconClass:'icon-facetime-video',arcChildItems:[
                                                {mid:4000001,'title':'子标题说明一',iconClass:'icon-picture'},
                                                {mid:4000002,'title':'子标题说明二',iconClass:'icon-headphones'},
                                                {mid:4000003,'title':'子标题说明三',iconClass:'icon-home'},
                                                {mid:4000004,'title':'子标题说明四',iconClass:'icon-facetime-video'},
                                                {mid:4000005,'title':'子标题说明五',iconClass:'icon-envelope-alt'}
                                        ]},
                                        {mid:5,'title':'标题说明五',iconClass:'icon-envelope-alt',arcChildItems:[
                                                {mid:5000001,'title':'子标题说明一',iconClass:'icon-picture'},
                                                {mid:5000002,'title':'子标题说明二',iconClass:'icon-headphones'},
                                                {mid:5000003,'title':'子标题说明三',iconClass:'icon-home'},
                                                {mid:5000004,'title':'子标题说明四',iconClass:'icon-facetime-video'},
                                                {mid:5000005,'title':'子标题说明五',iconClass:'icon-envelope-alt'},
                                                {mid:5000006,'title':'子标题说明六',iconClass:'icon-envelope-alt'}
                                        ]}
                                ]
                        };
                        //渲染菜单模板
                        function arcMenuRender(){
                                $('#J_ArcMenu').html(template("J_ArcMenuTpl",arcMenuData));
                        }
                        arcMenuRender();
                        //菜单形状初始化
                        function arcMenuInit(arcEle,revert) {
                                var arcParentList =arcEle.children('li'), arcParentListA = arcParentList.children('a'),arcParentListSpan=arcParentListA.children('span');;
                                var arcDeg = 180 / arcParentList.length, skewDeg = 90 - arcDeg, revertDeg = -(90 - (arcDeg / 2));
                                var childContent;
                                function isIE(){
                                        return (window.navigator.userAgent.indexOf("MSIE")>=1||!!window.ActiveXObject || "ActiveXObject" in window)?true:false
                                }
                                //兼容IE
                                childContent=isIE()?arcParentListSpan:arcParentListA;
                                if(!revert){
                                        if(arcParentList.length==1){
                                              arcParentList.each(function(){
                                                      $(this).css({
                                                              'marginLeft':"-180px",
                                                              'marginTop':"-180px",
                                                              'webkitTransformOrigin': '50% 50%',
                                                              'transform': 'rotate(' + 0 + 'deg) skew(' + 0 + 'deg)',
                                                              'transitionDuration':'0s'
                                                      });
                                              });
                                                arcParentListA.css({
                                                        'transform': 'skew(-' + 0 + 'deg) rotate(' + 0 + 'deg) scale(1)',
                                                        'webkitTransform': 'skew(-' + 0 + 'deg) rotate(' + 0 + 'deg) scale(1)',
                                                        'msTransform': 'skew(-' + 0 + 'deg) rotate(' + 0 + 'deg) scale(1)',
                                                        'mozTransform': 'skew(-' + 0 + 'deg) rotate(' + 0 + 'deg) scale(1)',
                                                        'left':"50%",
                                                        'top':"50%",
                                                        "marginLeft":"-180px",
                                                        "marginTop":"-180px"
                                                });
                                        }else{
                                                arcParentList.each(function (i, el) {
                                                        var _this=this;
                                                        var angle = i * arcDeg;
                                                        $(this).css({
                                                                'transform': 'rotate(' + angle + 'deg) skew(' + skewDeg + 'deg)',
                                                                'webkitTransform': 'rotate(' + angle + 'deg) skew(' + skewDeg + 'deg)',
                                                                'msTransform': 'rotate(' + angle + 'deg) skew(' + skewDeg + 'deg)',
                                                                'mozTransform': 'rotate(' + angle + 'deg) skew(' + skewDeg + 'deg)'
                                                        });
                                                });
                                                childContent.css({
                                                        'transform': 'skew(-' + skewDeg + 'deg) rotate(' + revertDeg + 'deg) scale(1)',
                                                        'webkitTransform': 'skew(-' + skewDeg + 'deg) rotate(' + revertDeg + 'deg) scale(1)',
                                                        'msTransform': 'skew(-' + skewDeg + 'deg) rotate(' + revertDeg + 'deg) scale(1)',
                                                        'mozTransform': 'skew(-' + skewDeg + 'deg) rotate(' + revertDeg + 'deg) scale(1)',
                                                        'border-radius': '50%',
                                                        'text-align': 'center',
                                                        'zIndex': '9999'
                                                });
                                        }
                                }else{
                                        if(!isIE()){
                                                arcParentList.each(function (i, el) {
                                                        $(this).css({
                                                                'transform': 'rotate(0deg) skew(0deg)',
                                                                'webkitTransform': 'rotate(0deg) skew(0deg)',
                                                                'msTransform': 'rotate(0deg) skew(0deg)',
                                                                'mozTransform': 'rotate(0deg) skew(0deg)'
                                                        });
                                                });
                                                childContent.css({
                                                        'transform': 'skew(0deg) rotate(0deg) scale(0.1)',
                                                        'webkitTransform': 'skew(0deg) rotate(0deg) scale(0.1)',
                                                        'msTransform': 'skew(0deg) rotate(0deg) scale(0.1)',
                                                        'mozTransform': 'skew(0deg) rotate(0deg) scale(0.1)'
                                                });
                                        }
                                }

                        }

                        var timer1=null,timer2=null,selectedArr=[];
                        var timer1Fn=function(){
                                clearTimeout(timer1);
                                timer1=setTimeout(function(){
                                        $('.arc-parent').removeClass('arc-menu-opened');
                                        arcMenuInit($('.arc-parent'),true);
                                },700);
                        };
                        var timer2Fn=function(){
                                clearTimeout(timer2);
                                timer2=setTimeout(function(){
                                        $('.arc-child').removeClass('arc-menu-opened');
                                        arcMenuInit($('.arc-child'),true);
                                },700);
                        };
                        $(document).on({
                                mouseenter: function () {
                                        clearTimeout(timer1);
                                        $(this).siblings('.arc-parent').addClass('arc-menu-opened');
                                        arcMenuInit($('.arc-parent'));
                                },
                                mouseleave: function () {
                                        timer1Fn();
                                }
                        },'.arc-menu .menu-all-in');
                        $(document).on({
                                mouseenter: function () {
                                        clearTimeout(timer1);
                                        clearTimeout(timer2);
                                        $(this).addClass('active').siblings('li').removeClass('active');
                                        $('.arc-child').eq($(this).index()).show().addClass('arc-menu-opened').siblings('.arc-child').hide();
                                        arcMenuInit($('.arc-child').eq($(this).index()));
                                },
                                mouseleave: function () {
                                        timer2Fn();
                                        timer1Fn();
                                }
                        },'.arc-menu .arc-parent li');
                        $(document).on({
                                mouseenter: function () {
                                        clearTimeout(timer1);
                                        clearTimeout(timer2);
                                },
                                mouseleave: function () {
                                        timer2Fn();
                                        timer1Fn();
                                },
                                click:function(){
                                        var unique=function(arr){
                                                for(var i=0;i<arr.length;i++){
                                                        for(var j=i+1;j<arr.length-1;j++){
                                                                if(arr[i]==arr[j]){
                                                                        arr.splice(j,1);
                                                                        j--
                                                                }
                                                        }
                                                }
                                                return arr;
                                        };
                                        var remove=function (arr, val) {
                                                for(var i=0; i<arr.length; i++) {
                                                        if(arr[i] == val) {
                                                                arr.splice(i, 1);
                                                                break;
                                                        }
                                                }
                                        };
                                        var curId=$(this).data('id');
                                        if($(this).hasClass('active')){
                                                $(this).removeClass('active');
                                                remove(selectedArr,curId);
                                        }else{
                                                $(this).addClass('active');
                                                selectedArr.push(curId);

                                        }
                                        //获取选择的id数组
                                        console.info(unique(selectedArr));
                                }
                        },'.arc-menu .arc-child li');
                }
        };
        return Example;
});

