
//求两点间的距离
function getDis(s, t) {
    return Math.sqrt((s.cxy[0] - t.cxy[0]) * (s.cxy[0] - t.cxy[0]) + (s.cxy[1] - t.cxy[1]) * (s.cxy[1] - t.cxy[1]));
}

//求两点间的平移及旋转角度
function getTransform(source, target, _dis) {
    var r;
    if (target.cxy[0] > source.cxy[0]) {
        if (target.cxy[1] > source.cxy[1]) {
            r = Math.asin((target.cxy[1] - source.cxy[1]) / _dis)
        } else {
            r = Math.asin((source.cxy[1] - target.cxy[1]) / _dis)
            r = -r;
        }

    } else {
        if (target.cxy[1] > source.cxy[1]) {
            r = Math.asin((target.cxy[1] - source.cxy[1]) / _dis)
            r = Math.PI - r;
        } else {
            r = Math.asin((source.cxy[1] - target.cxy[1]) / _dis)
            r -= Math.PI;
        }
    }
    r = r * (180 / Math.PI);
    return "translate(" + source.cxy[0] + "," + source.cxy[1] + ")rotate(" + r + ")"
}

/**
 * 生成静态svg图片的类
 * @param id    {string}    图形生成在哪个
 * @param config    {json Object}   配置对象
 */
function makeSvgClass(id,config) {

    var defaultConfig={
        nodes:[],
        links:[],
        svgWidth:window.innerWidth,     //画布的宽度
        nodeWidth:100,   //每个node节点所占的宽度，正方形
        margin:20,      //node节点距离父亲div的margin
        r:45,     //头像的半径
        strokeColor:'#ccf1fc',  //头像外围包裹的颜色
        strokeWidth:5,  //头像外围包裹的颜色
    };
    $.extend(true,defaultConfig,config);
    console.log(defaultConfig);


    //画布的高度
    var svgHeight=defaultConfig.nodeWidth*(defaultConfig.nodes.length-1);
    console.log('画布高度:'+svgHeight);

    defaultConfig.nodes=defaultConfig.nodes.map(function (node,index) {
        if(index==0){
            node.cxy=[defaultConfig.nodeWidth/2+defaultConfig.margin,parseInt(svgHeight)/2];
        }else {
            //每个点的坐标
            node.cxy=[defaultConfig.svgWidth-defaultConfig.nodeWidth/2-defaultConfig.margin,index*defaultConfig.nodeWidth-defaultConfig.nodeWidth/2];
        }

        return node;
    });
    // console.log(defaultConfig.nodes);


    this.SVG=d3.select("#"+id).append("svg:svg")
                .attr("width",defaultConfig.svgWidth)
                .attr("height",svgHeight);

    //添加箭头
    this.SVG.append("svg:defs").selectAll("marker")
        .data(["end"])
        .enter().append("svg:marker")
        .attr("id","arrow")
        .attr('class','arrow')
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", defaultConfig.r+20)     //箭头距离节点的x距离
        .attr("refY", 0)
        .attr("markerWidth", 9)
        .attr("markerHeight", 16)
        .attr("markerUnits","userSpaceOnUse")
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr('fill','#666');


    //添加一个容器g
    this.gAll=this.SVG.append('g').attr('svgWidth','all')
        .attr("width", defaultConfig.svgWidth)
        .attr("height", svgHeight);

    // 在<defs>标签内定义图案，<pattern>元素中的内容直到引用的时候才会显示。
    this.def = this.gAll.selectAll("defs.patternClass").data(defaultConfig.nodes);

    this.pattern = this.def.enter().append("svg:defs")
        .append("svg:pattern")
        .attr("class", "patternClass")
        .attr("id", function (d, index) {
            return 'avatar' +id+index;
        })
        //两个取值userSpaceOnUse  objectBoundingBox
        .attr('patternUnits', 'objectBoundingBox')
        // <pattern>，x、y值的改变决定图案的位置，宽度、高度默认为pattern图案占填充图形的百分比。
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", "1")
        .attr("height", "1")

    //头像
    this.pattern.append("svg:image")
        .attr("class", "circle")
        .attr("xlink:href", function (d) {
            return d.avatar; //修改节点头像
        })
        .attr("height", defaultConfig.r*3)
        .attr("width", defaultConfig.r*2)

    //名字
    this.pattern.append("rect").attr("x", "0").attr("y", defaultConfig.r*2-30).attr("width",  defaultConfig.r*2).attr("height", "30").attr("fill", "black").attr("opacity", "0.5")
    this.pattern.append("text").attr("class", "nodetext")
        .style('linehight',20)
        .attr("x", defaultConfig.r).attr("y", defaultConfig.r*2-10)
        .attr('text-anchor', 'middle')
        .attr("fill", "#fff")
        .text(function (d) {
            return d.name
        });

    //绘制线
    //创建连线
    var edges_g = this.gAll.selectAll("g.edges").data(defaultConfig.links)
                    .enter().append("g").attr("class", "edges");



    //修改每条连线，添加备注
    edges_g.each(function (d) {

        //画线
/*        d3.select(this).append("path").attr("class", "links")
            .attr("d", "M" + defaultConfig.nodes[d.source].cxy[0] + "," + + " L" + defaultConfig.nodes[d.target].cxy[0] + "," + defaultConfig.nodes[d.target].cxy[1])
            .style("marker-end", "url(#arrow)")
            .attr("refX", 455)
            .attr('id', function (d) {
                return 'link'+d.source + '_' + d.target
            })
            .attr('stroke', function () {
                var str = '#bad4ed';
                if (d.color) {
                    str = "#" + d.color;
                }
                return str;
            })*/


        d3.select(this).append("path").attr("class", "links")
            .attr("d", "M" + defaultConfig.r + "," + 0 + " L" + getDis(defaultConfig.nodes[d.source], defaultConfig.nodes[d.target]) + ",0")
            .style("marker-end", "url(#arrow)")
            .attr("refX", defaultConfig.r+20)
            .attr('stroke', function () {
                var str = '#bad4ed';
                if (d.color) {
                    str = "#" + d.color;
                }
                return str;
            })


/*

        d3.select(this).append("svg:text")
            .attr("x",(defaultConfig.nodes[d.source].cxy[0]+defaultConfig.nodes[d.target].cxy[0])/2-60)
            .attr("transform","rotate(180 "+(defaultConfig.nodes[d.source].cxy[0]+defaultConfig.nodes[d.target].cxy[0])/2+","+(defaultConfig.nodes[d.source].cxy[1]+defaultConfig.nodes[d.target].cxy[1])/2+")")
            .append("svg:textPath").attr("class", "textlinks")
            .attr('xlink:href', function (d) {
                return '#link'+d.source + '_' + d.target
            })
            // .attr('text-anchor', 'middle')
            .text( function (d) {
                return d.relation;
            })
*/

        //画矩形
        var rect_g = d3.select(this).append("g").attr("class", "rect_g"),
            text_g = d3.select(this).append("g").attr("class", "text_g");
        //画文字
        var text = text_g.append("text").attr("x", getDis(defaultConfig.nodes[d.source], defaultConfig.nodes[d.target]) / 2)
            .attr("y", 0).attr("dy", ".3em").attr("text-anchor", "middle").text(d.relation);

        var bbox = text.node().getBBox();
        // console.log(bbox);

        rect_g.append("rect").attr("x", bbox.x - 5)
            .attr("y", bbox.y)
            .attr("width", bbox.width + 10)
            .attr("height", bbox.height)
            .attr("fill", "white")
            .attr('stroke', function () {
                var str = '#bad4ed';
                if (d.color) {
                    str = "#" + d.color;
                }
                return str;
            })

        // edges_g.merge(edges_g).each(function (d) {
        //     d3.select(this).select("path")
        //         .attr("d", "M" + 30 + "," + 0 + " L" + (getDis(defaultConfig.nodes[d.source], defaultConfig.nodes[d.target]) - defaultConfig.r) + ",0")
        //     var text = d3.select(this).select("text").attr("x", getDis(defaultConfig.nodes[d.source], defaultConfig.nodes[d.target]) / 2);
        //     // var bbox = text.node().getBBox();
        //
        //     d3.select(this).select("rect").attr("x", getDis(defaultConfig.nodes[d.source], defaultConfig.nodes[d.target]) / 2 - 25)
        // })

        edges_g.attr("transform", function (d) {
                return getTransform(defaultConfig.nodes[d.source], defaultConfig.nodes[d.target], getDis(defaultConfig.nodes[d.source], defaultConfig.nodes[d.target]))
            }
        )


    })

    //文字旋转朝上
    d3.selectAll("g.edges").select("text").attr( "transform",function (d) {
        if (defaultConfig.nodes[d.target].cxy[0]<defaultConfig.nodes[d.source].cxy[0]){
            var x=getDis(defaultConfig.nodes[d.source], defaultConfig.nodes[d.target]) / 2
            return 'rotate(180 '+x+' '+0+')';
        }
        else {
            return 'rotate(0)';
        }
    })





    //创建头像
    var circle = this.gAll
        .selectAll("circle").data(defaultConfig.nodes)
        .enter().append("circle")
        .attr("cx", function (d) {
            return d.cxy[0];
        })
        .attr("cy", function (d) {
            return d.cxy[1];
        })
        .attr("fill", function (d,index) {
            return "url(#avatar"+id+index+")";
        })
        // .attr("fill", "transparent")
        .attr("stroke", defaultConfig.strokeColor)
        .attr("stroke-width", defaultConfig.strokeWidth)
        .attr("r", defaultConfig.r)


}


/***** 业务逻辑 *****/

var pageNum=2;
var pageIndex=1;
var pageTotal=3;
var allData=[];
var nodesData=[];
var linksData=[];


/**
 * 初始化svg图谱
 * @param id
 */
function initSVG(id){
    if(nodesData.length<=(pageNum+1)){
        new makeSvgClass(id,{
            nodes:nodesData,
            links:linksData,
            svgWidth:$("#"+id).width()
        });
    }else {
        //大于6个节点就要分批显示
        new makeSvgClass(id,{
            nodes:nodesData.slice(0,(pageNum*pageIndex+1)),
            links:linksData.slice(0,(pageNum*pageIndex)),
            svgWidth:$("#"+id).width()
        });
        $("#"+id).append('<div class="showMoreData" data-container-id="'+id+'">查看更多关系</div>');
    }
}

/**
 * 获取关系数据，并初始化svg图谱
 * @param id  父容器的id
 * @param url   数据地址
 */
function initData(id,url) {
    $.getJSON(url,function (data) {

        if(data.nodes.length <1){
            return;
        }
        allData=data;
        console.log(allData);
        nodesData=data.nodes;
        linksData=data.links;
        //线条排序
        linksData.sort(function (a, b) {
            return a.source-b.source;
        });
        //初始化svg图谱
        initSVG(id);
    })
}

//加载更多
$('body').on('click','.showMoreData',function () {
    var id=$(this).attr('data-container-id');
    $("#"+id).empty();
    new makeSvgClass(id,{
        nodes:nodesData,
        links:linksData,
        svgWidth:$("#"+id).width()
    });
    $("#"+id).append('<div class="hideMoreData" data-container-id="'+id+'">隐藏更多关系</div>');
})

//隐藏更多
$('body').on('click','.hideMoreData',function () {
    var id=$(this).attr('data-container-id');
    $("#"+id).empty();
    initSVG(id);
})
