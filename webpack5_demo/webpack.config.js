/*
 * @Description: 
 * @author: kelly
 * @Date: 2024-01-19 17:36:05
 * @LastEditTime: 2024-01-30 22:12:55
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const kellyTestPlugin = require(path.resolve('../kelly-test-plugin'));

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    print: './src/print.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true,
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: '管理输出',
    }),
    new WebpackManifestPlugin(),
    new kellyTestPlugin({
      // fromEmail: "123456@qq.com", // 发送方邮箱
      // password: "xxx", // 如果是QQ邮箱，则为QQ邮箱授权码
      // toEmail: "xx@163.com", // 接收方邮箱
      // host: "smtp.qq.com"
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, //已作为js扩展名这样类型的文件
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/, //排除node_modules文件夹
        use: {
          loader: 'babel-loader', //转换成es5
          options: {
            presets: ['@babel/preset-env'], //设置编译的规则
            plugins: [ // 设置编译的插件
              ['@babel/plugin-transform-runtime'] //设置编译的规则
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.xml$/i,
        use: ['xml-loader'],
      },
    ]
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};