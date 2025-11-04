import type { RsbuildPlugins } from '@rsbuild/core' // rsbuild 核心库类型
import { defineConfig } from '@rsbuild/core' // rsbuild 核心库
import { pluginBabel } from '@rsbuild/plugin-babel' // babel处理
import { pluginSass } from '@rsbuild/plugin-sass' // sass处理
import { pluginVue } from '@rsbuild/plugin-vue' // vue 插件
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx' // jsx处理

import { pluginBasicSsl } from '@rsbuild/plugin-basic-ssl' // ssl 插件
import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin' // rsBuild 构建分析工具
// import { pluginImageCompress } from '@rsbuild/plugin-image-compress'; // 图片压缩插件
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser' // html压缩插件

import AutoImport from 'unplugin-auto-import/rspack' // 自动导入
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers' // element-plus解析器
import AutoComponents from 'unplugin-vue-components/rspack' // 自动导入组件

// import { pluginVueInspector } from 'rsbuild-plugin-vue-inspector'; // vue调试插件
// import { pluginTypeCheck } from '@rsbuild/plugin-type-check'; // 类型检查插件

import DevTools from './config/panel.build' // 配置文件

import {
	FileEmptyDirPlugin as pluginFileEmptyDir, // 清空空白目录
	FileMapsPlugin as pluginFileMaps, // 文件映射处理
	FileReplacePlugin as pluginFileReplace, // 文件内容替换
	SyncRemoteServerPlugin as pluginSyncRemoteServer, // 同步远程服务器
	// SyncLocalGitFilePlugin as pluginSyncLocalGitFile, // 同步本地git文件
	SyncResultAnalysisPlugin as pluginSyncResultAnalysis, // 同步和分析结果
} from './config/compatible.plugin'
import { utils } from 'sortablejs'

const { proxyConfig: proxy, sourceConfig: source, htmlConfig: html, proxyInfo, isDev } = new DevTools()

// 插件配置
const otherPlugin: RsbuildPlugins = []

// 是否开启https
if (proxyInfo.https) otherPlugin.push(pluginBasicSsl())

export default defineConfig({
	mode: isDev ? 'development' : 'production',
	// 插件处理
	plugins: [
		// 通过状态判断是否开启的插件
		...otherPlugin,

		// babel处理
		pluginBabel({
			include: /\.(?:jsx|tsx)$/,
		}),
		// vue处理
		pluginVue(),
		// jsx处理
		pluginVueJsx(),
		// sass处理
		pluginSass({
			sassLoaderOptions: {
				api: 'legacy',
				implementation: require.resolve('sass'),
				additionalData: '@use "@/styles/element/variable.scss"; ',
			},
		}),
		// pluginImageCompress(), // 部分图片有问题
		// pluginTypeCheck(),
		// pluginVueInspector(),

		// html压缩
		pluginHtmlMinifierTerser({
			minifyJS: true,
			minifyCSS: true,
			removeComments: true,
		}),

		// 文件路径处理-会改变目录解构，由于rsbuild的特性，存在文件流上下关联，导致产出文件不一样，所以改为手动插件处理。
		pluginFileMaps([
			{ entry: './public/editor/**/*', export: './dist/static/editor', copy: true }, // ace编辑器
			{ entry: './public/font/**/*', export: './dist/static/font', copy: true }, // 字体文件
			{ entry: './dist/favicon.ico', export: './dist/static', copy: true }, // 图标文件
			{ entry: './dist/*.html', export: './dist/templates/default' }, // html文件
		]),

		// 文件内容处理
		pluginFileReplace([
			{
				entry: './dist/templates/default/*.html',
				replaceList: [{ replace: /\&\#39;/g, content: '"' }], // 替换html变量导致的规则问题
			}, // 替换html
		]),

		// 清空空白/空目录
		pluginFileEmptyDir(),

		// 同步远程服务器，匹配参数 --ip 服务器地址
		pluginSyncRemoteServer({ param: '--ip' }),

		// 同步本地git文件，匹配参数 --git 分支信息
		// pluginSyncLocalGitFile({
		// 	remote: '',
		// 	branch: '9.2.0',
		// 	localPath: '/linux',
		// }),

		// 同步和分析结果
		pluginSyncResultAnalysis(),
	],
	// 构建配置
	dev: {
		lazyCompilation: true, // 是否开启	懒编译
	},
	// html模板配置
	html,
	// 入口文件配置
	source,
	// 服务配置
	server: {
		port: 3000, // 服务端口
		compress: true, // 是否启用gzip压缩
		proxy, // 代理配置
		publicDir: {
			copyOnBuild: false, // 是否在构建时复制，手动复制
		},
		// open: false,
	},
	// 拆包配置
	performance: {
		removeConsole: !isDev ? ['log', 'info'] : false, // 是否移除console.log
		printFileSize: true, // 是否打印文件大小
		prefetch: true, // 是否启用prefetch，预加载
		preload: true, // 是否启用preload，预加载
		chunkSplit: {
			override: {
				cacheGroups: {
					styles: {
						name: 'styles',
						chunks: 'all',
						test: /\.(?:css|less|sass|scss|styl)$/,
						priority: 99,
						// enforce: true, // 强制拆包
					},
				},
			},
			// override: {
			// 	cacheGroups: {
			// 		styles: {
			// 			name: 'styles',
			// 			minSize: 0,
			// 			chunks: 'all',
			// 			test: /\.(?:css|less|sass|scss|styl)$/,
			// 			priority: 99,
			// 		},
			// 		// vue拆包
			// 		vueLib: {
			// 			name: 'vue-lib',
			// 			test: /node_modules[\\/](vue|vue-router|pinia|@vueuse)[\\/]/,
			// 			priority: 99,
			// 			chunks: 'all',
			// 		},
			// 		// element-plus拆包
			// 		element: {
			// 			name: 'element-plus',
			// 			test: /node_modules[\\/](element-plus)[\\/]/,
			// 			priority: 99,
			// 			chunks: 'all',
			// 		},
			// 		// 工具库拆包
			// 		utils: {
			// 			name: 'utils-lib',
			// 			test: /node_modules[\\/](axios|md5|ramda|jsencrypt)[\\/]/,
			// 		},
			// 		// xterm拆包
			// 		xterm: {
			// 			name: 'xterm',
			// 			test: /node_modules[\\/](@xterm)[\\/]/,
			// 			priority: 99,
			// 			chunks: 'all',
			// 		},
			// 		// login拆包
			// 		login: {
			// 			name: 'login-lib',
			// 			test: /src[\\/]pages[\\/]login[\\/]/,
			// 			priority: 99,
			// 			chunks: 'all',
			// 		},
			// 		// home拆包
			// 		home: {
			// 			name: 'home-lib',
			// 			test: /src[\\/]views[\\/]home[\\/]/,
			// 			priority: 99999,
			// 			chunks: 'all',
			// 		},
			// 	},
			// },
		}, // 是否启用拆包
	},
	// 输出配置
	output: {
		// 内链资源限制
		// dataUriLimit: 5 * 1024 * 102, // 图片转base64限制,
		// 地图配置输出
		// sourceMap: {
		// 	// js: false,
		// 	// !isDev ? 'source-map' : 'cheap-module-source-map'
		// },
		// copy: [{ from: './public/**/*', to: '/static/vite' }], // 直接复制文件，避免中间处理
		// 兼容性输入-入口注入
		polyfill: 'entry',
		// 配置 legal comment 注释
		legalComments: 'none',
		// 配置文件名
		filename: {
			js: isDev ? '[name].js' : '[name].js?v=[contenthash:8]',
			css: isDev ? '[name].css' : '[name].css?v=[contenthash:8]',
			svg: '[name][ext]',
			font: '[name][ext]',
			image: '[name][ext]',
		},
		// 配置文件编译路径(将所有类型的文件移动dist目录下)
		distPath: ((path: string) => {
			const typeList = ['js', 'jsAsync', 'css', 'cssAsync', 'svg', 'font', 'image', 'wasm', 'media']
			const obj: { [key: string]: string } = {}
			for (const key of typeList) {
				obj[key] = `${path}${key}`
			}
			return obj
		})('static/vite/'),
		// 配置css模块
		cssModules: {
			mode: 'pure',
			localIdentName: isDev ? '[hash:base64:4]' : '[hash:base64:8]',
		},
	},
	tools: {
		// 配置文件路径
		htmlPlugin(config, { entryName }) {
			if (!isDev && entryName.includes('index')) {
				config.filename = 'index1.html'
			}
		},
		// 配置文件路径
		rspack: (_, { appendPlugins }) => {
			// 自动导入方法
			appendPlugins(
				AutoImport({
					imports: ['vue', '@vueuse/core', 'vue-router', 'pinia'],
					dts: './types/auto-imports.d.ts',
					resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
					biomelintrc: {
						enabled: true, // 默认false, true启用。生成一次就可以，避免每次工程启动都生成
						filepath: './types/.biomelintrc-auto-import.json', // 生成json文件
					},
				})
			)
			// 自动导入组件
			appendPlugins(
				AutoComponents({
					dts: './types/components.d.ts',
					dirs: ['src/components'],
					extensions: ['vue', 'tsx'],
					directoryAsNamespace: false, // 是否将目录作为命名空间
					resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
				})
			)
			// 构建分析工具
			if (process.env.RSDOCTOR) {
				appendPlugins(new RsdoctorRspackPlugin({}))
			}
		},
	},
})
