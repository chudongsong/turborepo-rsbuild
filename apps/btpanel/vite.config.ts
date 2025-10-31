/* eslint-disable @typescript-eslint/naming-convention */

import { EventEmitter } from 'events'

import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue' // vue3处理插件
import Yaml from '@rollup/plugin-yaml' // yaml格式处理插件

import { chunkSplitPlugin } from 'vite-plugin-chunk-split' // 代码分割
import { createHtmlPlugin } from 'vite-plugin-html' // html模板
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons' // svg图标
import VueDevTools from 'vite-plugin-vue-devtools' // vue3调试工具
import VueJsx from '@vitejs/plugin-vue-jsx' // jsx处理
import basicSsl from '@vitejs/plugin-basic-ssl' // https协议兼容
import legacy from '@vitejs/plugin-legacy'
import AutoImport from 'unplugin-auto-import/vite' // 模块自动导入
import Components from 'unplugin-vue-components/vite' // 组件自动导入
import ElementPlus from 'unplugin-element-plus/vite' // element-plus组件自动导入，用于按需导入
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers' // element-plus组件自动导入
import Unfonts from 'unplugin-fonts/vite'
// import { visualizer } from 'rollup-plugin-visualizer' // 可视化打包分析
import Unocss from 'unocss/vite' // unocss 原子化css

import DevTools from './config/index'

const { isDev, isDevelop, prefixEnv, isHttps, proxyInfo, proxyConfig, getdefaultAlias } = new DevTools()
const pathSrc = resolve(__dirname, 'src') // 源码目录
const packPath = 'static/' // 打包后的vite目录
EventEmitter.defaultMaxListeners = 0 // 取消最大监听数限制

export default defineConfig({
	mode: isDev ? 'development' : 'production',
	base: './',
	css: {
		preprocessorOptions: {
			scss: {
				api: 'legacy',
				additionalData: '@use "@/styles/element/theme/index.scss";',
			},
			sass: {
				api: 'legacy',
			},
		},
		modules: {
			localsConvention: 'camelCase', // 本地变量命名规则
		},
	},
	plugins: [
		// vue3处理
		Vue({
			script: {
				defineModel: true,
			},
		}),
		// element-plus组件
		ElementPlus({
			defaultLocale: 'zh-cn',
		}),
		// jsx处理
		VueJsx(),
		// yaml格式处理
		Yaml(),
		// 原子化css
		Unocss(),
		// vue3调试工具
		VueDevTools(),
		// 字体处理
		Unfonts({
			// 自定义字体配置
			custom: {
				/**
				 * 字体家族列表
				 */
				families: [
					{
						/**
						 * 阿里巴巴普惠体 - 半粗体 (SemiBold)
						 */
						name: 'Alibaba PuHuiTi',
						local: 'AlibabaPuHuiTi-2-75-SemiBold',
						src: './public/static/font/AlibabaPuHuiTi-2-75-SemiBold-new.ttf',
						transform(font) {
							font.weight = 600 // SemiBold 字重
							font.style = 'normal'
							return font
						},
					},
					{
						/**
						 * 阿里巴巴普惠体 - 重体 (Heavy)
						 */
						name: 'Alibaba PuHuiTi',
						local: 'AlibabaPuHuiTi-2-105-Heavy',
						src: './public/static/font/AlibabaPuHuiTi-2-105-Heavy-new.ttf',
						transform(font) {
							font.weight = 900 // Heavy 字重
							font.style = 'normal'
							return font
						},
					},
				],
				/**
				 * 字体显示策略：swap - 立即显示后备字体，字体加载完成后替换
				 */
				display: 'swap',
				/**
				 * 启用字体预加载以提升性能
				 */
				preload: false,
				/**
				 * 字体加载标签插入位置
				 */
				injectTo: 'head-prepend',
			},
		}),
		// 动态导入组件
		Components({
			dts: './types/components.d.ts',
			dirs: ['src/components'],
			extensions: ['vue', 'tsx'],
			directoryAsNamespace: false, // 是否将目录作为命名空间
			resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
		}),
		// 自动导入vue3方法
		AutoImport({
			imports: ['vue', '@vueuse/core', 'pinia'],
			dts: './types/auto-imports.d.ts',
			resolvers: [ElementPlusResolver()],
			eslintrc: {
				enabled: true, // 默认false, true启用。生成一次就可以，避免每次工程启动都生成
				filepath: './types/.eslintrc-auto-import.json', // 生成json文件
				globalsPropValue: true,
			},
		}),
		// Html模板注入全局模块
		createHtmlPlugin({
			minify: true,
			pages: [
				{
					entry: 'pages/software/main.ts',
					filename: 'software.html',
					template: 'software.html',
					injectOptions: {
						data: {
							...prefixEnv,
							proxyKey: proxyInfo.proxyKey, // 界面-代理key
							proxyIp: proxyInfo.proxyIp, // 界面-代理IP
							proxyPort: proxyInfo.proxyPort, // 界面-代理端口
						},
					},
				},
				{
					entry: 'pages/login/main.ts',
					filename: 'login.html',
					template: 'login.html',
					injectOptions: {
						data: { ...prefixEnv },
					},
				},
				{
					entry: 'src/main.ts',
					filename: 'index.html',
					template: 'index.html',
					injectOptions: {
						data: {
							...prefixEnv,
							proxyKey: proxyInfo.proxyKey, // 界面-代理key
							proxyIp: proxyInfo.proxyIp, // 界面-代理IP
							proxyPort: proxyInfo.proxyPort, // 界面-代理端口
						},
					},
				},
			],
		}),

		// 指定需要缓存的图标文件夹
		createSvgIconsPlugin({
			iconDirs: [resolve(process.cwd(), 'src/icons')],
			symbolId: 'icon-[dir]-[name]',
		}),

		// 按需拆分chunk
		chunkSplitPlugin({
			strategy: 'single-vendor', // 拆分策略
			customSplitting: {
				'base-lib': [/\/node_modules\/vue\//, /\/node_modules\/vue-router\//, /\/node_modules\/pinia\//, /\/node_modules\/pinia-plugin-persistedstate\//, /\/node_modules\/@vueuse\/core\//, /\/node_modules\/nprogress\//, /\/node_modules\/universal-cookie\//, /\/node_modules\/element-plus\/es\//],
				'utils-lib': [/\/node_modules\/encryption\//, /\/node_modules\/ramda\//, /\/node_modules\/sortablejs\//, /\/src\/utils\//, /\/src\/router/, /\/src\/directive/],
				'xterm-lib': [/\/node_modules\/xterm\//, /\/node_modules\/xterm-addon-attach\//, /\/node_modules\/xterm-addon-fit\//, /\/node_modules\/xterm-addon-web-links\//],
			},
		}),

		// 兼容低版本浏览器
		(() => {
			if (!isDevelop()) {
				return legacy({
					targets: ['>0.1%', 'Firefox > 55', 'Chrome > 60', 'safari > 11'],
				})
			}
			return {}
		})(),

		// https协议兼容
		(() => {
			if (isHttps) return basicSsl()
			return {}
		})(),
	],
	resolve: { alias: getdefaultAlias(pathSrc) },
	build: {
		minify: 'terser', // 混淆器，terser构建后文件体积更小
		assetsDir: `${packPath}/`, // 静态资源目录
		sourcemap: false,
		cssCodeSplit: false, // 不分割css代码
		reportCompressedSize: false, // 不统计gzip压缩后的文件大小
		chunkSizeWarningLimit: 800, // 警告阈值
		assetsInlineLimit: 2048, // 小于2kb的资源内联
		modulePreload: false, // 禁用预加载
		terserOptions: {
			// 打包后移除console和注释
			compress: {
				drop_console: !isDevelop(), // 生产环境移除console
				drop_debugger: !isDevelop(), // 生产环境移除debugger
			},
		},
		rollupOptions: {
			input: {
				software: resolve(__dirname, 'software.html'), // 软件页面
				login: resolve(__dirname, 'login.html'), // 登录页面
				main: resolve(__dirname, 'index.html'), // 主页面
			},
			strictDeprecations: true, // 严格弃用
			output: {
				entryFileNames: `${packPath}js/[name].js`,
				chunkFileNames: `${packPath}js/[name].js`,
				assetFileNames: chunkInfo => {
					const { name } = chunkInfo
					let ext = '[ext]'
					if (name) {
						const str = name.substring(name.lastIndexOf('.') + 1)
						if (str === 'ttf' || str === 'woff' || str === 'woff2') ext = 'font'
					}
					return `${packPath}${ext}/[name].[ext]`
				},
			},
		},
	},
	server: {
		https: ((): any => {
			return isHttps ? { rejectUnauthorized: false } : false
		})(),
		host: '0.0.0.0',
		port: 3001,
		proxy: proxyConfig,
	},
})
