---
title: webpack 原理以及进阶
date: 2024-01-30 22:08:23
categories:
  - Webpack 源码
tags:
  - Webpack
---

**本文的项目链接： https://github.com/Kelly-kml/kelly-webpack-test**

本文我们通过自己搭建一个测试 `demo` 来实现对 `webpack` 一些基本配置以及进阶优化功能的练手以及测试,建议读者跟着文章自己手操作一遍，并且要保持版本的一致。

## 1. 初始化项目：

使用 `npm init -y` 进行初始化

要使用 webpack，那么就得安装 webpack、webpacl-cli

```json
npm install webpack webpack-cli -D
```

本文使用的版本号为：

```json
├── webpack@5.89.0
└── webpack-cli@5.1.4
└── node@v18.16.0
```

从 webpack V4.0 开始，webpack 就是开箱机用的，因此，接下来我们可以直接利用一个入口文件来尝试一下。

新建 src/index.js 文件：

```js
const getString = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('hello world');
    }, 2000);
  });
};

const helloWorld = async () => {
  const str = await getString();
  console.log(str);
};

export default helloWorld;
```

使用 `npx webpack --mode=development` 进行构建，默认是 `production` 模式，我们为了更清楚得查看打包后的代码，使用 `development` 模式。

构建完成之后，会在项目下产生一个 `disk` 目录，里面有一个打包文件：main.js

查看 `main.js` 文件，可以看到：`index.js` 并没有被转义为低版本的代码

```js
/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ './src/index.js':
      /*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
      /***/ () => {
        eval(
          "/*\r\n * @Description: \r\n * @author: kelly\r\n * @Date: 2024-01-18 23:38:32\r\n * @LastEditTime: 2024-01-19 10:13:51\r\n */\r\n//index.js\r\nclass Person {\r\n  constructor(name) {\r\n    this.name = name;\r\n  }\r\n  getName () {\r\n    return this.name;\r\n  }\r\n}\r\n\r\nconst student = new Person('kelly');\r\n\r\n\n\n//# sourceURL=webpack://webpack_basic/./src/index.js?"
        );

        /***/
      },

    /******/
  };
  /******/ var __webpack_exports__ = {};
  /******/ __webpack_modules__['./src/index.js']();
  /******/
  /******/
})();
```

## 2. 将 JS 转义为低版本

这时，我们前面讲的 webpack 的核心 `loader` 就得派上场啦

我们可以利用 `babel-loader` 来实现将 JS 转义为低版本。

首先我先安装 `babel-loader`

- `babel-loader` 在 webpack 用来解析 ES6

```js
npm install babel-loader -D
```

此外，我们还需要配置 babel 的依赖包：

- `@babel/core` babel 核心模块
- `@babel/preset-env` babel 预设 一组 babel 插件的集合

```js
npm i @babel/core @babel/preset-env -D
```

接下来在 `webpack.config.js` 配置 rules:

```js
module: {
  //设置模块
  rules: [
    //设置loader
    {
      test: /\.js$/, //已作为js扩展名这样类型的文件
      exclude: /node_modules/, //排除node_modules文件夹
      use: {
        loader: 'babel-loader', //转换成es5
        options: {
          presets: ['@babel/preset-env'], //设置编译的规则
        },
      },
    },
  ];
}
```

但是这样子直接打包会失败，因为目前解析不了 ES6 中的 async/ await 语法。

我们需要给安装插件 `regeneratorRuntime`

- `regeneratorRuntime` 是 webpack 打包生成的全局辅助函数
- 由 babel 生成 用于兼容 `async/await` 的语法

```js
npm i @babel/runtime -D // 包含了regeneratorRuntime运行时候需要的内容
npm i @babel/plugin-transform-runtime // 这个插件在需要regeneratorRuntime的地方自动导入包 就是在需要的时候会自动运行他
```

响应地，在 babel 中 的 rules 也新增 plugin 的配置：

```js
 {
    test:/\.js$/, //已作为js扩展名这样类型的文件
    exclude:/node_modules/, //排除node_modules文件夹
    use:{
      loader:'babel-loader', //转换成es5
      options:{
        presets:['@babel/preset-env'], //设置编译的规则
        plugins:[ // 设置编译的插件
          ['@babel/plugin-transform-runtime'] //设置编译的规则
        ]
      }
    }
  }
```

## 3. 构建打包

此时，运行 `npx webpack ` 构建就可以成功完成打包了。

![19a05ae4124d4691027172239364d88.png](https://s2.loli.net/2024/02/01/kft523UESrOncMZ.png)

紧接着，可以在 dist/bundle.js 可以看到：src/index.js 中的代码成功地转为 ES5。

![c701a0a0d10ad03b69ea77eeafd3c8b.png](https://s2.loli.net/2024/02/01/aJrnz9UPlxehcg3.png)

项目进行到目前为止，我们就搭建好了 webpack 基本的构建打包配置了。

接下来，我们就可以根据项目开发中的情况来进行某些特定场景的配置啦 ！

## 4.管理输出：

### （1）多入口设置：

我们知道 webpack 可以利用 `entry` 设置多入口起点，那么具体是怎么设置的呢？

- 先在 src 文件夹下新建一个新的文件 `print.js`

```js
export default function printMe() {
  console.log('I get called from print.js!');
}
```

- 并在 `src/index.js` 文件中使用这个函数：

```js
import printMe from './print';

const getString = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('hello world');
    }, 2000);
  });
};

const helloWorld = async () => {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  btn.innerHTML = 'Click me and check the console!';
  btn.onclick = printMe;
  element.appendChild(btn);

  const str = await getString();
  console.log(str);

  return element;
};

export default helloWorld;
```

- 更新 `dist/index.html` 文件，为 webpack 分离入口文件做好准备：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>资源管理</title>
    <script src="./print.bundle.js"></script>
  </head>
  <body>
    <script src="./index.bundle.js"></script>
  </body>
</html>
```

- 调整 `entry` 配置：在 entry 添加 `src/print.js` 作为新的入口起点（命名为 `print`），然后修改 output 使得能够根据入口起点定义的名称动态生成 bundle 名称。

```js
module.exports = {
  entry: {
    index: './src/index.js',
    print: './src/print.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

- 重新构建，会看到在 `dist` 文件夹下生成两个新的 bundle.js 文件。

### （2）`HtmlWebpackPlugin`

不过这也产生了新的问题，如果我们更改起点的名称，在构建时就会出现新的 bundle，而 index.html 仍然在引用旧的名称，这导致了 dist 文件夹下生成非常多 bundle，乍一看就很乱。

后来，我们可以使用 `HtmlWebpackPlugin` 插件解决这个问题。

`HtmlWebpackPlugin` 可以简化 HTML 文件的创建，每次 webpack 进行构建可以整合全部的 bundle 文件存于 index.html，每个 bundle 用 Hash 值形成一个映射关系，而且每次构建生成的 index.html 会替换旧 index.html。

**插件细节可以查看相关[源码](https://github.com/jantimon/html-webpack-plugin)**。

```js
npm install --save-dev html-webpack-plugin
```

重新构建后，会发现：**代码编辑器中打开 `index.html` 会发现 `HtmlWebpackPlugin` 创建了一个全新的文件，而所有的 bundle 都已自动添加到其中**。

相应地，在 `webpack.config.js` 中配置：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      title: '管理输出',
    }),
  ],
};
```

需要注意，在执行构建之前，虽然在 `dist/` 文件夹已经有了自定义的 `index.html` 文件，但是 `HtmlWebpackPlugin` 插件仍然会默认生成 `index.html` 文件，即使用新生成的 `index.html` 文件替换原有文件。

不知道你有没有注意到： dist/ 文件夹下的文件就会很多，新旧产生的都混在一起，我们无法清晰知道最近一次构建的情况，因此，我们可以利用 `clean: true,` 这个 `output` 配置来清楚旧 bundle 文件。

```js
module.exports = {
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};
```

### （3）`webpack-manifest-plugin`

这是一个用于生成 webpack 构建资产清单的插件，webpack 通过 manifest 追踪所有模块到输出的 bundle 之间的映射。**详细配置细节可查看[源码](https://github.com/shellscape/webpack-manifest-plugin)**。

- 安装：

```js
npm install webpack-manifest-plugin --save-dev
```

- 在 `webpack.config.js` 中配置：

```js
const WebpackManifestPlugin = require('webpack-manifest-plugin');
module.exports = {
  plugins: [
    new WebpackManifestPlugin(), // 可以接受一个options 参数，默认在dist目录下生成 manifest.json
  ],
};
```

重新打包，可以看见 dist 目录新生成了一个 manifest.json。

## 5. 开发环境设置

### （1）Source map：

Source map 本质上是一个信息文件，记录了转换压缩后的代码所对应的转换前的源码位置，是源代码和生产代码的映射。Source map 解决了在打包过程中，代码经过压缩，去空格以及 babel 编译转化后，由于代码之间差异性过大，造成无法 debug 的问题。

Source map 的作用就是能够让浏览器的调试面版将生成后的代码映射到源码文件当中，开发者可以在源码文件中 debug，这样就会让程序员调试轻松、简单很多。

options 种类很多[【点击查看更多】](https://webpack.docschina.org/configuration/devtool)，在生产环境下可以用 ` peocess.env` 判断一下。webpack 中可以在 devtool 中设置，

- 在开发环境中可以配置 `devtool: cheap-module-source-map` ，方便调试。
- 生产环境下建议采用`devtool: none` 或者 `devtool: nosources-source-map` ，这样子既可以定位源码位置，又可以不暴露源码。

### （2）服务启动工具：

- ### 使用 webpack-dev-server

  ```js
  npm install --save-dev webpack-dev-server
  ```

  接下来修改配置文件 `webpack.config.js` ，告诉 dev server 应从什么位置开始查找文件

  ```js
  module.exports = {
  +	devServer: {
  +   	static: './dist',
  +  	},
  +    optimization: {
  +        runtimeChunk: 'single',
  +    },
  }
  ```

  以上配置告知 `webpack-dev-server` 将 `dist` 目录下的文件作为可访问资源部署在 `localhost:8080`

- #### 使用 webpack-dev-middleware：模块热替换

  webapck-dev-middleware 是一个包装器，它可以把 webpack 处理过的文件发送到 server。这是 webpack-dev-server 内部的原理，但是它也可以作为一个单独的包使用，以便根据需求进行更多自定义设置。下面是一个 webpack-dev-middleware 配合 express server 的示例。

  ```js
  npm install --save-dev express webpack-dev-middleware
  ```

  现在调整 webpack 配置文件，以确保能够正确启用中间件：

  ```js
  module.exports = {
     mode: 'development',
     entry: {
       index: './src/index.js',
       print: './src/print.js',
     },
     devtool: 'inline-source-map',
     devServer: {
       static: './dist',
     },
     plugins: [
       new HtmlWebpackPlugin({
         title: 'Development',
       }),
     ],
     output: {
       filename: '[name].bundle.js',
       path: path.resolve(__dirname, 'dist'),
       clean: true,
   +   publicPath: '/',
     },
   };
  ```

  在 server 脚本使用 publicPath，以确保文件资源能够作为可访问资源正确部署在 `http://localhost:3000`， 接下来设置自定义 `express` server：

  **project**

  ```
  webpack-demo
    |- package.json
    |- package-lock.json
    |- webpack.config.js
    |- server.js(++++)
    |- /dist
    |- /src
      |- index.js
      |- print.js
    |- /node_modules
  ```

  **server.js**

  ```js
  const express = require('express');
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');

  const app = express();
  const config = require('./webpack.config.js');
  const compiler = webpack(config);

  // 告知 express 使用 webpack-dev-middleware，
  // 以及将 webpack.config.js 配置文件作为基础配置。
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
    })
  );

  // 将文件 serve 到 port 3000。
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!\n');
  });
  ```

  **package.json**

  ```json
  {
    "name": "webpack5_demo",
    "version": "1.0.0",
    "description": "",
    "private": true,
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "watch": "webpack --watch",
      "start": "webpack serve --open",
  +   "server": "node server.js",
      "build": "webpack"
    },
    "keywords": [],
    "author": "",
    "license": "ISC",
    "devDependencies": {
      "@babel/core": "^7.23.5",
      "@babel/preset-env": "^7.23.8",
      "@babel/runtime": "^7.23.8",
      "babel-loader": "^9.1.3",
      "css-loader": "^6.9.1",
      "express": "^4.18.2",
      "html-webpack-plugin": "^5.5.3",
      "style-loader": "^3.3.3",
      "webpack": "^5.89.0",
      "webpack-cli": "^5.1.4",
      "webpack-dev-middleware": "^7.0.0",
      "webpack-dev-server": "^4.15.1",
      "webpack-manifest-plugin": "^5.0.0",
      "xml-loader": "^1.2.1"
    },
    "dependencies": {
      "@babel/plugin-transform-runtime": "^7.23.7",
      "lodash": "^4.17.21"
    }
  }
  ```

  打开浏览器，访问 `http://localhost:3000`，应该看到 webpack 应用程序已经运行！

## 6. 代码分离：

### （1）`SplitChunksPlugin `：防止重复

`SplitChunkPlugin` 插件可以将公共的依赖模块提取到已有的入口 chunk 中，或者提取到一个新生成的 chunk。

使用这个插件去除之前示例中重复的 `lodash` 模块：

```js
const path = require('path');

  module.exports = {
    mode: 'development',
    entry: {
      index: './src/index.js',
      another: './src/another-module.js',
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
+   optimization: {
+     splitChunks: {
+       chunks: 'all',
+     },
+   },
  };
```

使用 [`optimization.splitChunks`](https://webpack.docschina.org/plugins/split-chunks-plugin/#optimizationsplitchunks) 配置选项后构建，将会发现 `index.bundle.js` 和 `print.bundle.js` 已经移除了重复的依赖模块。从插件将 `lodash` 分离到单独的 chunk，并且将其从 main bundle 中移除，减轻了 bundle 大小。

### （2）[`mini-css-extract-plugin`](https://webpack.docschina.org/plugins/mini-css-extract-plugin)：用于将 CSS 从主应用程序中分离

### （3）分析 bundle：

- [webpack-chart](https://alexkuz.github.io/webpack-chart/)：webpack stats 可交互饼图。

- [webpack-visualizer](https://chrisbateman.github.io/webpack-visualizer/)：分析并可视化 bundle，检查哪些模块占用空间，哪些可能是重复使用的。

- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)：一个 plugin 和 CLI 工具，它将 bundle 内容展示为一个便捷的、交互式、可缩放的树状图形式，实现可视化 webpack 输出文件的大小。

  修改 webpack 配置文件，可以生成一个 bundle 模块大小分析的 html 页面：

  ```js
  const BundleAnalyzerPlugin =
    require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  module.exports = {
    plugin: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'server',
        analyzerHost: '127.0.0.1',
        analyzerPort: 3001,
        reportFilename: 'report.html',
        defaultSizes: 'parsed',
        openAnalyzer: true,
        generateStatsFile: false,
        statsFilename: 'stats.json',
        statsOptions: null,
        logLevel: 'info',
      }),
    ],
  };
  ```

  ![70582940427](C:\Users\ADMINI~1\AppData\Local\Temp\1705829404271.png)

- [webpack bundle optimize helper](https://webpack.jakoblind.no/optimize)：这个工具会分析 bundle，并提供可操作的改进措施，以减少 bundle 的大小。

- [bundle-stats](https://github.com/bundle-stats/bundle-stats)：生成一个 bundle 报告（bundle 大小、资源、模块），并比较不同构建之间的结果。

## 7. 模块热替换（Hot module replacement）

模块热替换（HMR）功能会在应用程序运行过程中，替换、添加或者删除模块，而无需重新加载整个页面。

**_警告：HMR 绝对不能被用在生产环境。_**

主要是通过以下几种方式，来提高开发速度：

- 保留在完全重新加载页面期间丢失的应用程序状态
- 只更新变更的内容，以节省宝贵的开发时间
- 在源代码中 CSS/JS 产生修改时，会立刻在浏览器中进行更新，这几乎相当于在浏览器 devtools 直接更改样式

**这一切是怎么运行的呢？或者说ＨＭＲ的工作原理是什么样子？**

（１）在应用程序中通过**置换模块**实现：

ａ．应用程序要求 HMR runtime 检查更新

b . HMR runtime 异步下载更新，然后通知应用程序

c . 应用程序要求 HMR runtime 应该更新

d . HMR runtime 同步应用更新

这里我们可以设置 HMR ，以使此进程自动触发更新，或者你可以选择要求在用户交互时进行更新。

（2）在 compiler 中：

除了普通资源，compiler 需要发出“update"，将之前的版本更新到最新的版本。”update"由 2 部分组成：

a . 更新后的 manifest（JSON）【manifest 跟踪所有模块与打包 bundle 之间的一种 hash 映射】

b . 一个或者多个 update chunk（JS）

**manifest** 包括新的 compilation hash 和所有的 updated chunk 列表。每个 chunk 都包含着全部更新模块的最新代码（或一个 flag 用于表明此模块需要被移除）。

**compiler** 会确保在这些构建之间的模块 ID 和 chunk ID 保持一致。通常将这些 ID 存储在内存中（例如，使用 [webpack-dev-server](https://webpack.docschina.org/configuration/dev-server/) 时），但是也可能会将它们存储在一个 JSON 文件中。

（3）在模块中：

HMR 是可选功能，只会影响包含 HMR 代码的模块。举个例子，通过 [`style-loader`](https://github.com/webpack-contrib/style-loader) 为 style 追加补丁。为了运行追加补丁，`style-loader` 实现了 HMR 接口；当它通过 HMR 接收到更新，它会使用新的样式替换旧的样式。

类似的，当在一个模块中实现了 HMR 接口，你可以描述出当模块被更新后发生了什么。然而在多数情况下，不需要在每个模块中强行写入 HMR 代码。如果一个模块没有 HMR 处理函数，更新就会冒泡(bubble up)。这意味着某个单独处理函数能够更新整个模块树。如果在模块树的一个单独模块被更新，那么整组依赖模块都会被重新加载。

（4）在 runtime 中：

对于模块系统运行时(module system runtime)，会发出额外代码，来跟踪模块 `parents` 和 `children` 关系。在管理方面，runtime 支持两个方法 `check` 和 `apply`。

**`check` 方法， 用来下载最新模块代码。**

具体步骤：

发送一个 Http 请求来更新 manifest 。如果请求失败，说明没有可用更新。如果请求成功，那么会将 updateed chunk 列表与当前的 loaded chunk 列表进行比较。每个 loaded chunk 都会下载响应的 updated chunk。当所有更新 chunk 完成下载，runtime 就会切换到 ready 状态。

**`apply` 方法， 用于更新模块，主要将要更新的模块打上 tag，然后调用模块的（也有可能是父模块）的更新 handler 执行更新。**

具体步骤：

1. 将所有 updated modules 标记为 无效。对于每个无效 module，都需要在模块中有一个 update handler ，或者在此模块的父级模块中有 update handler。否则，会进行无效标记冒泡，并且父级也会被标记为无效。继续每个冒泡，直到到达应用程序入口起点，或者到达带有 update handler 的 module（以最先到达为准，冒泡停止）。如果它从入口起点开始冒泡，则此过程失败。
2. 所有无效 module 都会被（通过 dispose handler）处理和解除加载。然后更新当前 hash，并且调用所有 `accept` handler。runtime 切换回 `idle` 状态，一切照常继续。

## 8. [Tree-shaking](https://webpack.docschina.org/guides/tree-shaking/)：

### （1）对于 Tree-shaking 是怎么理解的？

**tree shaking** 是一种基于 ES Module 规范的 Dead Code Elimination 技术，通常用于描述移除 JavaScript 上下文中的死代码（不使用的代码）。具体是通过在运行过程中静态分析模块之间的导入导出，确定 ESM 模块中哪些导出值未曾被其他模块使用过，并将其删除，以此实现打包产物的优化。

我们打一个形象的比方：将应用程序想象成一棵树。绿色表示实际用到的源码和库，是树上活的树叶。灰色表示未引用代码，是秋天树上枯萎的树叶。为了除去死去的树叶，你必须摇动（shake）这棵树，使它们落下。

### （2）实现原理：

Webapck 中， Tree-shaking 的实现的关键是：

- 标记出模块导出值中哪些没有被用过；
- 使用 Terser 删掉这些没有被用过的导出语句。

Tree-shaking 过程大致分为四步：

> 标记功能需要配置 `optimization.usedExports = true` 开启

1）Make 阶段：在 `FlagDependencyExportsPlugin` 插件中根据模块的 `dependencies` 列表，收集模块导出变量并记录到模块依赖关系图 ModuleGraph 体系的 exportsInfo 变量中

2）Seal 阶段： 利用 `FlagDependencyUsagePlugin` 插件，遍历 ModuleGraph 标记模块导出变量，然后收集模块的导出值的使用情况，并记录到 `exportInfo._usedInRuntime` 集合中

3）生成产物阶段：在 `HarmonyExportXXXDependency.Template.apply` 方法中根据导出值的使用情况生成不同的导出语句，若变量没有被其它模块使用过则删除对应的导出语句

4）删除阶段：使用 DCE 工具删除 Dead Code，实现完整的树摇效果

## 9. 手写一个 plugin:

### 1. 从 html-webpack-plugin 源码中了解一个 plugin 的基本结构：

![a4fd0df4f28ef2849cd232f511013fb.png](https://s2.loli.net/2024/02/01/Ecjmr4ANixML6wK.png)

![cb711427a9240e1c21cb8de26ba875a.png](https://s2.loli.net/2024/02/01/5gyhrTGeKCajDXd.png)

源码中，使用的是 Class 类的方式来书写插件 `html-webpack-plugin` ，我们将一个功能性的函数缩起来，可以清晰得看到，其实，插件就是一个 apply() 的 Javascript 代码，在 apply() 中传入参数 compiler，然后我们可以在 compiler 对象上绑定一些 hooks 实现订阅，当监听到响应的 hooks 时，就会执行相应的插件来干预 webpack 的执行结果，达到实现某种特定功能的拓展效果。

### 2. 手写的插件并且测试有没有成功引入：

接下来我们来启动一个 demo 来测试手写的 plugin 是否能顺利被引入。

(1)先在插件文件的 `index.js` 中书写插件的功能；

![2a0a7b00f01bbd72c225f7974e86e3f.png](https://s2.loli.net/2024/02/01/a2DyIS1V54zC9F8.png)

(2)然后在 `webpack.config.js` 中引入自己书写的 plugin，如果已经上传上 `npm` 上的插件，那就可以和其他插件一样引入，不然就引入本地文件；

![bf059714495b16b1ccea62f65796509.png](https://s2.loli.net/2024/02/01/mTi35OjzHAMuKay.png)

(3)通过 `npx webpack build ` 构建测试是否成功引入。

![0fc851173a4f7a89e31e106ac1ec649.png](https://s2.loli.net/2024/02/01/bOEwHCpZvc867IK.png)

## 10. 优秀参考文档：

- [webpack 源码](https://github.com/webpack/webpack/tree/main)
- [手写 plugin](https://zhuanlan.zhihu.com/p/410749514)
- [webpack 源码阅读方法](https://github.com/gweid/webpack-source-code?tab=readme-ov-file)
