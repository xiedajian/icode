
# webpack 开发结构模板

快速用这个webpack配置来进行开发测试等

## 目录

```
|-src
  |-assets                (静态资源目录)
    |-img               (图片)
    |-css               (第三方css)
    |-js                (简单的第三方js)
    |-font              (字体)
    |-vendor            (复杂的第三方扩展插件，比如ueditor)

  |-components            (自己开发的可以多项目复用的库)
      |-common.css        (案例：可复用的css)
      |-util.js           (案例：util工具模块)
      |-modal             (案例：带html的模块)
          |-index.html
          |-index.js
          |-index.css
  |-pages                 (页面模块，一个页面是一个模块，包含js，css)
    |-index             (案例页面)
        |-index.js
        |-index.css
    |-login
        |-index.js
        |-index.css
    |-view                  (用于存放html页面)
        |-layout            (用于存放公共的html)
            |- header.html
        |-index.html        (案例)
        |-login.html

|-dist
    |-assets                (由src复制过来的，结构与src一样)
    |-view                  (存放编译生成的html文件)
        |-index.html
        |-login.html
    |-js                    (存放编译后的js)
        |-index.js
        |-login.js
    |-css                   (用于存放编译后的css，默认不生成此目录)
        |-common.css   
         
```
## 注意：

- css 引用资源采用相对路径

- html 引用资源采用相对路径  `<img  src="../assets/images/xx.png" />`

- assets 目录存放静态资源 (不会改变的资源，自己写的组件放到components中)

- assets 会原封不同的复制到 dist 目录，再次强调，只放静态资源

- 默认 css 会编译到 js 中，单独提取的项目单独配置

- html 文件的命名与对应的 page 里的 js 保持一致性

- 命名规范  （模块和文件名之间 _ 链接 例如 index_loginPage.html）

- **不要改结构**

- eslint 最好在编辑器中配置，编写时即可检查

- 此项目只用于拉取，谨慎提交，建议下载压缩包使用

## 使用

- 安装依赖：
```
npm install
```

- devserver 模式开发：
```
npm run server
```

- watch 监听文件模式开发：
```
npm run watch
```

- 开发环境打包:
```
npm run dev
```

- 生成环境打包:
```
npm run build
```

- 查看打包后的站点：
```
node websit.js
```

- 然后打开下面网址浏览: `localhost:3000/view/index.html`
