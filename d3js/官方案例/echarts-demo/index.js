
function makeSvgPic(id,url) {
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById(id));

    $.getJSON(url,function (data) {
        console.log(data);
        var nodes=data.nodes;
        nodes=nodes.map(function (node, index) {
            return {name:node.name,category: 1, draggable: true}
        })
        var links=data.links;
        links=links.map(function (link, index) {
            return {                  source: link.source,
                target: link.target,
                value: link.relation}
        })
        var option = {
            title: {
                text: ''
            },
            // tooltip: {},
            animationDurationUpdate: 1500,
            animationEasingUpdate: 'quinticInOut',
            label: {
                normal: {
                    show: true,
                    textStyle: {
                        fontSize: 12
                    },
                }
            },
            legend: {
                x: "center",
                show: false,
                data: ["朋友", "战友", '亲戚']
            },
            series: [

                {
                    type: 'graph',
                    layout: 'force',
                    symbolSize: 45,
                    focusNodeAdjacency: true,
                    roam: true,
                    categories: [{
                        name: '朋友',
                        itemStyle: {
                            normal: {
                                color: "#009800",
                            }
                        }
                    }, {
                        name: '战友',
                        itemStyle: {
                            normal: {
                                color: "#4592FF",
                            }
                        }
                    }, {
                        name: '亲戚',
                        itemStyle: {
                            normal: {
                                color: "#3592F",
                            }
                        }
                    }],
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 12
                            },
                        }
                    },
                    force: {
                        repulsion: 1000
                    },
                    edgeSymbolSize: [4, 50],
                    edgeLabel: {
                        normal: {
                            show: true,
                            textStyle: {
                                fontSize: 10
                            },
                            formatter: "{c}"
                        }
                    },
                    data: nodes,
                    links: links,
                    lineStyle: {
                        normal: {
                            opacity: 0.9,
                            width: 1,
                            curveness: 0
                        }
                    }
                }
            ]
        };
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);

    })

}