//从url字符串中提取参数
function getQueryString(name, url) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = url.split('?')[1].match(reg);
    if (r != null)
        return decodeURI(r[2]);
    return null;
}

//利用js按顺序执行的小技巧，在执行到这个文件的时候，这个js文件是最后一个script标签
// var scripts = document.getElementsByTagName('script');
// var currentScript = scripts[scripts.length - 1];
// var url=currentScript.src;
// var type=getQueryString('type',url);
// var person=getQueryString('person',url);

/**
 * PC端- 人物关系力导向图- d3.js制作
 * @param id    {string} 父容器id
 * @param wdith     {number}    不带单位的数字
 * @param json      {JSON对象}    接口请求到的数据
 * @constructor
 */
function MakeSvgPicClass(id, wdith, json) {
    //节点数组
    this.nodes = json.nodes;
    //连线数组
    this.links = json.links;
    this.width = wdith;
    this.height = wdith / 2;
    this.R = 30;

    //画布
    //添加新的svg画布
    this.SVG = d3.select("#" + id).append("svg")
        .attr("id", "svgPic")
        .attr("width", this.width)
        .attr("height", this.height)
    // .call(d3.zoom()
    //     .scaleExtent([0.7,2])
    //     .on("zoom",function(){
    //         d3.select(this).attr("transform", d3.event.transform);
    //     }))
    // .on("dblclick.zoom", null);

    //手机缩小
    if (this.width < 1000) {
        this.SVG.attr('viewBox', " -400, -200, 1200, 600").attr("preserveAspectRatio", "xMidYMid  meet");
    }

    //添加箭头
    this.SVG.append('svg:defs').append("svg:marker")
        .attr('id', "marker")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 30)
        .attr("refY", 4)
        .attr("orient", "auto")
        .attr("markerUnits", "userSpaceOnUse")
        .append("svg:path")
        .attr("d", "M 0 0 8 4 0 8Z")
        .attr("fill", "steelblue");

    //容器
    this.g = this.SVG.append("g").attr("class", "force_g").attr("width", this.width).attr("height", this.height);

    //力模型
    this.simulation = d3.forceSimulation(this.nodes)
        .force("link", d3.forceLink(this.links))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force("collide", d3.forceCollide(100).strength(0.2).iterations(5)) //碰撞作用力，为节点指定一个radius区域来防止节点重叠，设置碰撞力的强度，范围[0,1], 默认为0.7。设置迭代次数，默认为1，迭代次数越多最终的布局效果越好，但是计算复杂度更高
        .on("tick", function () {
            _this.ticked();
        })

    //节点
    // 在<defs>标签内定义图案，<pattern>元素中的内容直到引用的时候才会显示。
    this.def = this.SVG.select("g.force_g")
        .selectAll("defs.outline").data(this.nodes);
    this.def.exit().remove()

    this.pattern = this.def.enter().append("svg:defs")
        .append("svg:pattern")
        .attr("class", "outline")
        .attr("id", function (d, index) {
            return 'avatar' + id + d.index;
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
        .attr("src", function (d) {
            return d.avatar; //修改节点头像
        })
        .attr("height", "150")
        .attr("width", "100")
        .attr("preserveAspectRatio", "xMidYMin slice")

    //名字
    this.pattern.append("rect").attr("x", "0").attr("y", "65").attr("width", "100").attr("height", "35").attr("fill", "black").attr("opacity", "0.5")
    this.pattern.append("text").attr("class", "nodetext")
        .attr("x", "50").attr("y", "85")
        .attr('text-anchor', 'middle')
        .attr("fill", "#fff")
        .text(function (d) {
            return d.name;
        });
    this.edges_g = null;
    var _this = this;

    this.ticked = function () {
        //创建连线
        var edges_g = _this.SVG.select("g.force_g")
            .selectAll("g.edges").data(_this.links);
        // _this.edges_g.exit().remove();
        var enter = edges_g.enter().append("g").attr("class", "edges")
            .on('mouseover', function () {
                d3.select(this).selectAll('path.links').attr('stroke-width', 4)
            })
            .on('mouseout', function () {
                d3.select(this).selectAll('path.links').attr('stroke-width', 1)
            })
        // .attr('fill', function (d) {
        //     var str = '#bad4ed';
        //     if (d.color) {
        //         str = "#" + d.color;
        //     }
        //     return str;
        // })

        //修改每条连线，添加备注
        enter.each(function (d) {
            d3.select(this).append("path").attr("class", "links")
                .attr("d", "M" + _this.R + "," + 0 + " L" + _this.getDis(d.source, d.target) + ",0")
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
            var text = text_g.append("text").attr("x", _this.getDis(d.source, d.target) / 2)
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

            edges_g.merge(edges_g).each(function (d) {
                d3.select(this).select("path")
                    .attr("d", "M" + _this.R + "," + 0 + " L" + (_this.getDis(d.source, d.target) - R) + ",0")
                var text = d3.select(this).select("text").attr("x", _this.getDis(d.source, d.target) / 2);
                var bbox = text.node().getBBox();

                d3.select(this).select("rect").attr("x", bbox.x - 5)
            })

            edges_g.attr("transform", function (d) {
                return _this.getTransform(d.source, d.target, _this.getDis(d.source, d.target))
            })


        })


        edges_g.merge(edges_g).each(function (d) {
            d3.select(this).select("path")
                .attr("d", "M" + _this.R + "," + 0 + " L" + (_this.getDis(d.source, d.target) - _this.R) + ",0")
            var text = d3.select(this).select("text").attr("x", _this.getDis(d.source, d.target) / 2);
            var bbox = text.node().getBBox();

            d3.select(this).select("rect").attr("x", bbox.x - 5)
        })

        edges_g.attr("transform", function (d) {
            return _this.getTransform(d.source, d.target, _this.getDis(d.source, d.target))
        })

        //文字旋转朝上
        d3.selectAll("g.edges").select("text").attr("transform", function (d) {
            if (d.target.x < d.source.x) {
                var x = _this.getDis(d.source, d.target) / 2
                return 'rotate(180 ' + x + ' ' + 0 + ')';
            } else {
                return 'rotate(0)';
            }
        })

        //创建头像
        var circle = _this.SVG.select("g.force_g")
            .selectAll("circle").data(_this.nodes);
        circle.exit().remove();
        circle.enter().append("circle")
            .style("cursor", "pointer")
            .merge(circle);
        circle.attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("fill", function (d) {
                return ("url(#avatar" + id + d.index + ")")
            })
            .attr("stroke", "#ccf1fc")
            .attr("stroke-width", "5")
            .attr("r", 50)
            .on('mouseover', function (d) {
                d3.select(this).attr('stroke-width', '8');
                d3.select(this).attr('stroke', '#a3e5f9');
                _this.highlightObject(d);
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke-width', '5');
                d3.select(this).attr('stroke', '#c5dbf0');
                _this.highlightObject(null);
            }).on('click', function (d) {
                console.log(d.id);
                if (d.link) {
                    window.location.href = d.link;
                }
                if (d.role_id) {
                    if (window.location.href.indexOf("relation") >= 0) {
                        window.location.href = "../role/" + d.role_id + '/';
                    } else {
                        window.location.href = "../" + d.role_id + '/';
                    }

                }
            })
            .call(d3.drag()
                .on('start', _this.dragstarted)
                .on('drag', _this.dragged)
                .on('end', _this.dragended));

    }


    this.getDis = function (s, t) {
        return Math.sqrt((s.x - t.x) * (s.x - t.x) + (s.y - t.y) * (s.y - t.y));
    }

    this.getTransform = function (source, target, _dis) {
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

    this.dragstarted = function (d) {
        if (!d3.event.active) _this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    this.dragged = function (d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    this.dragended = function (d) {
        if (!d3.event.active) _this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    this.highlighted = null;
    this.dependsNode = [];
    this.dependsLinkAndText = [];

    this.highlightObject = function (obj) {
        if (obj) {
            var objIndex = obj.index;
            _this.dependsNode = _this.dependsNode.concat([objIndex]);
            _this.dependsLinkAndText = _this.dependsLinkAndText.concat([objIndex]);
            _this.links.forEach(function (lkItem) {
                if (objIndex == lkItem['source']['index']) {
                    _this.dependsNode = _this.dependsNode.concat([lkItem.target.index])
                } else if (objIndex == lkItem['target']['index']) {
                    _this.dependsNode = _this.dependsNode.concat([lkItem.source.index])
                }
            });

            // 隐藏节点
            _this.SVG.selectAll('circle').filter(function (d) {
                return (_this.dependsNode.indexOf(d.index) == -1);
            }).transition().style('opacity', 0.1);
            // 隐藏线
            _this.SVG.selectAll('.edges').filter(function (d) {
                // return true;
                return ((_this.dependsLinkAndText.indexOf(d.source.index) == -1) && (_this.dependsLinkAndText.indexOf(d.target.index) == -1))
            }).transition().style('opacity', 0.1);

        } else {
            //取消高亮
            // 恢复隐藏的线
            _this.SVG.selectAll('circle').filter(function () {
                return true;
            }).transition().style('opacity', 1);
            // 恢复隐藏的线
            _this.SVG.selectAll('.edges').filter(function (d) {
                // return true;
                return ((_this.dependsLinkAndText.indexOf(d.source.index) == -1) && (_this.dependsLinkAndText.indexOf(d.target.index) == -1))
            }).transition().style('opacity', 1);
            _this.highlighted = null, _this.dependsNode = [], _this.dependsLinkAndText = [];
        }
    };



}

/**
 * 制作pc 端的svg图
 * @param id
 * @param url
 * @param wdith
 */
function makeSvgPic(id, url, wdith) {
    d3.json(url, function (error, json) {
        if (error) {
            console.log('获取数据失败', error);
            return;
        }


    });


}

/**
 * PC端- 获取接口数据并制作人物关系svg图
 * @param id    {string}    承载svg图的父容器id
 * @param url   {string}    API地址
 * @param data  {json}      API请求参数
 * @param width {number}    需要制作的svg宽度
 */
function getDataToMakeSVG(id,url,data,width) {
    $.ajax({
        type: 'POST',
        url: url,
        data: data,
        dataType: 'json',
        success: function (data, textStatus, jqXHR) {
            new MakeSvgPicClass(id, width, data);
        }
    });
}

