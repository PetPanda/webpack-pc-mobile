
const path = require('path');
const fs = require('fs');

const HTMLWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const utils = require('./utils');

// 入口html数组
let HTMLDirs = utils.getFileNameList('./src/html');

let HTMLPlugins = [];

// 入口文件集合处理
let entries = {};
HTMLDirs.forEach(page => {
	const htmlPlugin = new HTMLWebpackPlugin({
		filename: `${page}.html`,
		template: path.resolve(__dirname, `../src/html/${page}.html`),
		chunks: [page, 'commons']
	});
	HTMLPlugins.push(htmlPlugin);
	entries[page] = path.resolve(__dirname, `../src/js/app/${page}.js`);
});

const platforms  = process.env.NODE_ENV === 'developmentW' ? { 'jquery': '$' } : { 'zepto': '$' }

module.exports = {
	entry: entries,
	devtool: 'cheap-module-source-map',
	output: {
		filename: 'js/[name].bundle.[hash].js',
		path: path.resolve(__dirname, '../dist'),
		publicPath: '/'
	},
	externals: platforms,
	// 加载器
	module: {
		rules: [
			{
				test: /\.html$/,
				loader: 'html-withimg-loader'
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['es2015', 'stage-0']
					}
				}
			},
			{
				test: /\.css$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								minimize: true
							}
						}
					]
				})
			},
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ['css-loader', 'sass-loader']
				})
			},
			{
				test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: '[name].[hash].[ext]',
					outputPath: 'img/'
				}
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: ['file-loader']
			},
			{
				test: /\.(html|js|css|scss)$/,
				loader: `preprocess-loader`
			}
		]
	},
	plugins: [
    // 自动清理 dist 文件夹
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, `../`)
    }),
		// 将 css 抽取到某个文件夹
		new ExtractTextPlugin({
			// 生成css文件名
			filename: 'css/[name].[hash].css',
			disable: false,
			allChunks: true
		}),
		// 自动生成 HTML 插件
		...HTMLPlugins
	]
};