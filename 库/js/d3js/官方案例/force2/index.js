function makeSvg(url) {

var W = 1200,
    H = 600;

d3.json(url, function (error, json) {
    if (error) {
        console.log('获取数据失败', error);
        return;
    }
    //节点数组
    var nodes = json.nodes;
    //连线数组
    var links = json.links;
    //画布
    var SVG = d3.select("svg")
        .attr("width", W)
        .attr("height", H)
    .call(d3.zoom()
        .scaleExtent([0.7,2])
        .on("zoom",function(){
            d3.select(this).attr("transform", d3.event.transform);
        }))
    .on("dblclick.zoom", null);
    //容器
    var g = SVG.append("g").attr("class", "force_g").attr("width", W).attr("height", H);
    //半径
    var R = 30;
    //力模型
    var simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(W / 2, H / 2))
        .force("collide", d3.forceCollide(100).strength(0.2).iterations(5))       //碰撞作用力，为节点指定一个radius区域来防止节点重叠，设置碰撞力的强度，范围[0,1], 默认为0.7。设置迭代次数，默认为1，迭代次数越多最终的布局效果越好，但是计算复杂度更高
        .on("tick", ticked)

    //节点
    // 在<defs>标签内定义图案，<pattern>元素中的内容直到引用的时候才会显示。
    var def = SVG.select("g.force_g")
        .selectAll("defs.outline").data(nodes);
    def.exit().remove()

    var pattern = def.enter().append("svg:defs")
        .append("svg:pattern")
        .attr("class", "outline")
        .attr("id", function (d, index) {
            return 'avatar' + d.index;
        })
        //两个取值userSpaceOnUse  objectBoundingBox
        .attr('patternUnits', 'objectBoundingBox')
        // <pattern>，x、y值的改变决定图案的位置，宽度、高度默认为pattern图案占填充图形的百分比。
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", "1")
        .attr("height", "1")

    //头像
    pattern.append("svg:image")
        .attr("class", "circle")
        .attr("xlink:href", function (d) {
            return d.avatar; //修改节点头像
        })
        .attr("width", "100px")
    //名字
    pattern.append("rect").attr("x", "0").attr("y", "65").attr("width", "100").attr("height", "35").attr("fill", "black").attr("opacity", "0.5")
    pattern.append("text").attr("class", "nodetext")
        .attr("x", "50").attr("y", "85")
        .attr('text-anchor', 'middle')
        .attr("fill", "#fff")
        .text(function (d) {
            return d.name
        });


    function ticked() {

        //创建连线
        var edges_g = SVG.select("g.force_g")
            .selectAll("g.edges").data(links);
        var enter = edges_g.enter().append("g").attr("class", "edges")
                            .on('mouseover',function () {
                                d3.select(this).selectAll('path.links').attr('stroke-width',4)
                            })
                            .on('mouseout',function () {
                                d3.select(this).selectAll('path.links').attr('stroke-width',1)
                            })
                            .attr('fill', function (d) {
                                var str = '#bad4ed';
                                if (d.color) {
                                    str = "#" + d.color;
                                }
                                return str;
                            })


        //修改每条连线，添加备注
        enter.each(function (d) {
            d3.select(this).append("path").attr("class", "links")
                .attr("d", "M" + R + "," + 0 + " L" + getDis(d.source, d.target) + ",0")
                .style("marker-end", "url(#marker)")
                .attr("refX", 55)
                .attr('stroke', function () {
                    var str = '#bad4ed';
                    if (d.color) {
                        str = "#" + d.color;
                    }
                    return str;
                })
            var rect_g = d3.select(this).append("g").attr("class", "rect_g"),
                text_g = d3.select(this).append("g").attr("class", "text_g");
            var text = text_g.append("text").attr("x", getDis(d.source, d.target) / 2)
                .attr("y", 0).attr("dy", ".3em").attr("text-anchor", "middle").text(d.relation);

            var bbox = text.node().getBBox();

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
        })

        edges_g.merge(edges_g).each(function (d) {
            d3.select(this).select("path")
                .attr("d", "M" + R + "," + 0 + " L" + (getDis(d.source, d.target) - R) + ",0")
            var text = d3.select(this).select("text").attr("x", getDis(d.source, d.target) / 2);
            var bbox = text.node().getBBox();

            d3.select(this).select("rect").attr("x", bbox.x - 5)
        })

        edges_g.attr("transform", function (d) {
                return getTransform(d.source, d.target, getDis(d.source, d.target))
            }
        )
        d3.selectAll("g.edges").select("text").attr( "transform",function (d) {
            if (d.target.x<d.source.x){
                var x=getDis(d.source, d.target) / 2
                return 'rotate(180 '+x+' '+0+')';
            }
            else {
                return 'rotate(0)';
            }
        })

        //创建头像
        var circle = SVG.select("g.force_g")
            .selectAll("circle").data(nodes);
        circle.exit().remove();
        circle.enter().append("circle")
            .merge(circle);
        circle.attr("cx", function (d) {
            return d.x;
        })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("fill", function (d) {
                return ("url(#avatar" + d.index + ")")
            })
            .attr("stroke", "#ccf1fc")
            .attr("stroke-width", "5")
            .attr("r", 50)
            .on('mouseover', function (d) {
                d3.select(this).attr('stroke-width', '8');
                d3.select(this).attr('stroke', '#a3e5f9');
                highlightObject(d);
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke-width', '5');
                d3.select(this).attr('stroke', '#c5dbf0');
                highlightObject(null);
            })
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        /*        //创建文本
                var tag = SVG.select("g.force_g")
                    .selectAll("text.tag").data(nodes);
                tag.exit().remove();
                tag.enter().append("text").attr("class", "tag").merge(tag);
                tag.attr("x", function (d) {
                    return d.x;
                })
                    .attr("y", function (d) {
                        return d.y;
                    })
                    .attr("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .text(function (d) {
                            return d.name
                        }
                    )*/

    }

    function getDis(s, t) {
        return Math.sqrt((s.x - t.x) * (s.x - t.x) + (s.y - t.y) * (s.y - t.y));
    }

    function getTransform(source, target, _dis) {
        var r;
        if (target.x > source.x) {
            if (target.y > source.y) {
                r = Math.asin((target.y - source.y) / _dis)
            } else {
                r = Math.asin((source.y - target.y) / _dis)
                r = -r;
            }

        } else {
            if (target.y > source.y) {
                r = Math.asin((target.y - source.y) / _dis)
                r = Math.PI - r;
            } else {
                r = Math.asin((source.y - target.y) / _dis)
                r -= Math.PI;
            }
        }
        r = r * (180 / Math.PI);
        return "translate(" + source.x + "," + source.y + ")rotate(" + r + ")"
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    var _this=this,highlighted=null,dependsNode=[],dependsLinkAndText=[];
    function highlightObject(obj){
        if (obj) {
            var objIndex= obj.index;
            dependsNode=dependsNode.concat([objIndex]);
            dependsLinkAndText=dependsLinkAndText.concat([objIndex]);
            links.forEach(function(lkItem){
                if(objIndex==lkItem['source']['index']){
                    dependsNode=dependsNode.concat([lkItem.target.index])
                }else if(objIndex==lkItem['target']['index']){
                    dependsNode=dependsNode.concat([lkItem.source.index])
                }
            });

            // 隐藏节点
            d3.selectAll('circle').filter(function (d) {
                return (dependsNode.indexOf(d.index)==-1);
                }).style('opacity',0.1);
            // 隐藏线
            d3.selectAll('.edges').filter(function(d) {
                // return true;
                return ((dependsLinkAndText.indexOf(d.source.index)==-1)&&(dependsLinkAndText.indexOf(d.target.index)==-1))
            }).style('opacity',0.1);

        } else {
            //取消高亮
            // 恢复隐藏的线
            d3.selectAll('circle').filter(function () {
                return true;
            }).transition().style('opacity',1);
            // 恢复隐藏的线
            d3.selectAll('.edges').filter(function(d) {
                // return true;
                return ((dependsLinkAndText.indexOf(d.source.index)==-1)&&(dependsLinkAndText.indexOf(d.target.index)==-1))
            }).transition().style('opacity',1);
            highlighted=null,dependsNode=[],dependsLinkAndText=[];
        }
    };
});


}