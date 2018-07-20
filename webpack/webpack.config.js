const path = require('path');

const webpack = require('webpack');

// 用于清空 dist 目录。
const CleanWebpackPlugin = require('clean-webpack-plugin');

// 用于把src的文件复制到dist
const CopyWebpackPlugin = require('copy-webpack-plugin');

// 用于把最终的 css 分离成单独文件 警告：由于webpack v4 extract-text-webpack-plugin不应该用于css。改为使用mini-css-extract-plugin。
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 生成html
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 打开浏览器
const OpenBrowserPlugin = require('open-browser-webpack-plugin');

// 获取html-webpack-plugin参数的方法
let getHtmlConfig = function(name, title){
  return {
    template    : './src/view/' + name + '.html',   // html模板路径
    filename    : 'view/' + name + '.html',         // 生成的html存放路径，相对于 path
    // favicon     : './favicon.ico',               // favicon路径
    title       : title,                            // html模板路径
    inject      : true,                             // 允许插件修改哪些内容，包括head与body
    hash        : true,                             // 为静态资源生成hash值
    chunks      : [name],                           // 引入的模块
    minify: {
      removeComments: true,                         // 移除HTML中的注释
      collapseWhitespace: false                     // 删除空白符与换行符
    }
  };
};

/* 自动获取多入口  有缺陷，暂未使用 */
let glob = require('glob');
let getEntry = function () {
  let entry = {};
  glob.sync('./src/pages/**/*.js').forEach(function (name) {
    let n = name.slice(name.lastIndexOf('source/') + 7, name.length - 3);
    n = n.slice(0, n.lastIndexOf('/'));
    entry[n] = name;
  });
  console.log(entry);
  return entry;
};

module.exports = {
  // 入口文件的配置项，可以指定多个入口起点
  entry: {
    'index_index': './src/pages/index/index.js',
    'index_login': './src/pages/login/index.js',
  },

  // 出口文件的配置项，只可指定一个输出配置
  output: {
    path: path.resolve(__dirname, './dist/'),
    // publicPath 表示资源的发布地址，当配置过该属性后，打包文件中所有通过相对路径引用的资源都会被配置的路径所替换
    publicPath: '/',        // 此处
    filename: 'js/[name].js',
  },

  // 外部扩展
  externals: {
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    'window.$': 'jquery',
  },

  /*optimization: {
    // 代码分割
    splitChunks: {
      cacheGroups: {
        commons: {              // 抽离自己写的公共代码
          chunks: 'initial',
          name: 'common',     // 打包后的文件名，任意命名
          minChunks: 2,       // 最小引用2次
          minSize: 0          // 只要超出0字节就生成一个新包
        },
        vendor: {                    // 抽离第三方插件
          test: /node_modules/,    // 指定是node_modules下的第三方包
          chunks: 'initial',
          name: 'vendor',         // 打包后的文件名，任意命名
          priority: 10            // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
        },
      }
    }
  },*/

  module: {
    rules: [
      /* 要在 html 中使用模板变量引入，这里需要注释掉  */
      /*{
        test: /\.html$/,
        loader: 'html-loader',
      },*/
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
        // loader: 'style-loader!css-loader!postcss-loader'
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1 // 0 => no loaders (default); 1 => postcss-loader; 2 => postcss-loader, sass-loader
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: 'postcss.config.js'  // 这个得在项目根目录创建此文件
              }
            }
          },
          'less-loader'
        ],
        // loader: 'style-loader!css-loader?importLoaders=1!postcss-loader!less-loader'
      },
      {
        test:/\.(png|jpg|gif)$/,
        use:[{
          loader:'url-loader',
          options:{
            outputPath:'assets/image/',
            name:'[name].[ext]',
            limit:8000, // 表示小于8kb的图片转为base64,大于50kb的是路径
          }
        }]
      }
    ]
  },

  plugins: [
    // 清空dist目录，第一个参数是要清理的目录的字符串数组
    new CleanWebpackPlugin(['./dist/']),

    // 复制文件，把src的img文件复制到dist下
    new CopyWebpackPlugin([
      {from:path.resolve(__dirname,'./src/assets/'),to:path.resolve(__dirname,'./dist/assets/')},
    ]),

    // 生成html
    new HtmlWebpackPlugin(getHtmlConfig('index_index','首页')),
    new HtmlWebpackPlugin(getHtmlConfig('index_login','登录')),

    // 打开浏览器url
    new OpenBrowserPlugin({ url: 'http://localhost:8000/view/index_index.html' }),
  ],

  devServer:{
    contentBase:path.resolve(__dirname,'./dist/'),
    host:'localhost',
    disableHostCheck: true, // 绕过主机检查
    hot:true,
    https: false,           // 是否采用https，默认是http
    inline:true,
    progress:true,          // 输出运行进度到控制台。
    watchContentBase:true,  // 观察contentBase选项提供的文件。文件更改将触发整页重新加载
    compress:true,
    port:8000
  }
};
