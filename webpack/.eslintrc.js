module.exports = {
  //此项是用来告诉eslint找当前配置文件不能往父级查找
  "root": true,
  //此项是用来指定eslint解析器的，解析器必须符合规则，babel-eslint解析器是对babel解析器的包装使其与ESLint解析
  "parser": 'babel-eslint',
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "jquery": true
  },
  "extends": "eslint:recommended",
  //此项是用来指定javaScript语言类型和风格，sourceType用来指定js导入的方式，默认是script，此处设置为module，指某块导入方式
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "esversion": 6,
    "ecmaVersion": 6,
    "sourceType": "module"
  },
  // "off" 或 0 - 关闭规则
  // "warn" 或 1 - 将规则视为一个警告
  // "error" 或 2 - 将规则视为一个错误
  "rules": {
    // 使用严格模式
    "strict": [
      "error"
    ],
    // 禁止使用 var 变量
    "init-declarations": [
      "error"
    ],
    // 使用两个空格缩进
    "indent": [
      "error",
      2
    ],
    // 使用 unix 规则
    "linebreak-style": [
      "error",
      "unix"
    ],
    // 禁止在字符串和注释之外不规则的空白
    "no-irregular-whitespace": [
      "error"
    ],
    // 禁止多次声明同一变量
    "no-redeclare": [
      "error"
    ],
    // 强制在 parseInt() 使用基数参数
    "radix": [
      "error"
    ],
    // 强制使用一致的反勾号、双引号或单引号
    "quotes": [
      "error",
      "single"
    ],
    // 要求或禁止使用分号代替 ASI
    "semi": [
      "error",
      "always"
    ],
    // 要求使用 === 和 !==
    "eqeqeq": [
      "error"
    ],
    // 启用 alert、confirm 和 prompt
    "no-alert": [
      "off"
    ],
    // 启用 console
    "no-console": [
      "off"
    ],
    "no-debugger": [
      "off"
    ]
  }
};
