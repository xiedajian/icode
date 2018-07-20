### 不同类型的文件:

- .json 后缀的 JSON 配置文件
- .wxml 后缀的 WXML 模板文件
- .wxss 后缀的 WXSS 样式文件
- .js 后缀的 JS 脚本逻辑文件

#### JSON 配置
1. 项目的根目录有一个 app.json 和 project.config.json，
2. 此外在 pages/logs 目录下还有一个 logs.json，我们依次来说明一下他们的用途。


##### app.json
小程序的全局配置
app.json 配置项列表

| 属性 | 类型  | 必填 | 描述 |
| ----: |  ----: | ---: | ---: |
| pages	| String Array	| 是 	| 设置页面路径  |
| window |	Object |	否	| 设置默认页面的窗口表现 |
| tabBar | Object |	否	| 设置底部 tab 的表现 |
| networkTimeout |	Object|	否 | 	设置网络超时时间 |
| debug	| Boolean	| 否	| 设置是否开启debug 模式 |

```json
{
  "pages":[
    "pages/index/index",
    "pages/logs/logs"
  ],
  "window":{
    "backgroundTextStyle":"light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "WeChat",
    "navigationBarTextStyle":"black"
  }
}
```