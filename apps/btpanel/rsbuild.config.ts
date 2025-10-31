import { defineConfig, type RsbuildPlugins } from '@rsbuild/core' // 引入 RsbuildPlugins 类型 和 defineConfig 函数
import { pluginVue } from '@rsbuild/plugin-vue' // 引入 渲染 Vue 组件插件
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx' // 引入 Vue 组件的 JSX 插件
import { pluginSass } from '@rsbuild/plugin-sass' // 引入 Sass 插件
// import { pluginBasicSsl } from '@rsbuild/plugin-basic-ssl' // https协议处理。
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser'

import path from 'node:path'
import sass from 'sass'
import AutoImport from 'unplugin-auto-import/rspack'
import AutoComponents from 'unplugin-vue-components/rspack'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import UnoCSS from '@unocss/postcss'

import DevTools from './config/bak/panel.build'

// const { proxyConfig: proxy, sourceConfig: source, htmlConfig: html, isDev, proxyInfo, aliasConfig } = new DevTools()

const otherPlugins: RsbuildPlugins = []

export default defineConfig({
	mode: isDev ? 'development' : 'production',
	plugins: [
		// ...(proxyInfo?.https ? [pluginBasicSsl()] : otherPlugins),
		pluginVue(),
		pluginVueJsx(),
		pluginSass({
			sassLoaderOptions: {
				api: 'legacy',
				implementation: sass,
				additionalData: '@use "@/styles/element/variable.scss"; ',
			},
		}),
		pluginHtmlMinifierTerser({
			minifyJS: true,
			minifyCSS: true,
			removeComments: true,
		}),
	],
	dev: {
		lazyCompilation: true,
	},
	html,
	resolve: {
		alias: aliasConfig,
	},
	source,
	server: {
		port: 3001,
		compress: true,
		proxy,
		publicDir: {
			copyOnBuild: false,
		},
		host: '0.0.0.0',
	},
	performance: {
		removeConsole: !isDev ? ['log', 'info'] : false,
		printFileSize: true,
		prefetch: true,
		preload: true,
		chunkSplit: {
			override: {
				cacheGroups: {
					styles: {
						name: 'styles',
						chunks: 'all',
						test: /\.(?:css|less|sass|scss|styl)$/,
						priority: 99,
					},
					baseLib: {
						name: 'base-lib',
						test: /node_modules[\\/](vue|vue-router|pinia|pinia-plugin-persistedstate|@vueuse|nprogress)[\\/]/,
						priority: 99,
						chunks: 'all',
					},
					utilsLib: {
						name: 'utils-lib',
						test: /node_modules[\\/](ramda|sortablejs)[\\/]|src[\\/](utils|router|directive)[\\/]/,
					},
					xtermLib: {
						name: 'xterm-lib',
						test: /node_modules[\\/](@xterm)[\\/]/,
						priority: 80,
						chunks: 'all',
					},
				},
			},
		},
	},
	output: {
		polyfill: 'entry',
		legalComments: 'none',
		filename: {
			js: '[name].js',
			css: '[name].css',
			svg: '[name][ext]',
			font: '[name][ext]',
			image: '[name][ext]',
		},
		distPath: ((p: string) => {
			const types = ['js', 'jsAsync', 'css', 'cssAsync', 'svg', 'font', 'image', 'wasm', 'media']
			const obj: Record<string, string> = {}
			for (const t of types) obj[t] = `${p}${t}`
			return obj
		})('static/'),
		cssModules: {
			mode: 'pure',
			localIdentName: isDev ? '[hash:base64:4]' : '[hash:base64:8]',
		},
	},
	tools: {
		htmlPlugin(config, { entryName }) {
			if (!isDev && entryName.includes('index')) config.filename = 'index1.html'
		},
		rspack: config => {
			config.plugins ||= []
			config.plugins.push(
				AutoImport({
					imports: ['vue', '@vueuse/core', 'vue-router', 'pinia'],
					dts: './types/auto-imports.d.ts',
					resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
					biomelintrc: {
						enabled: true,
						filepath: './types/.biomelintrc-auto-import.json',
					},
				}) as any
			)
			config.plugins.push(
				AutoComponents({
					dts: './types/components.d.ts',
					dirs: ['src/components'],
					extensions: ['vue', 'tsx'],
					directoryAsNamespace: false,
					resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
				}) as any
			)
			config.module ||= {} as any
			;(config.module as any).rules ||= []
			;(config.module as any).rules.push({
				test: /\.svg$/,
				include: [path.resolve(process.cwd(), 'src/icons')],
				use: [
					{
						loader: 'svg-sprite-loader',
						options: { symbolId: 'icon-[name]' },
					},
				],
			})
			return config
		},
		postcss: opts => {
			opts.postcssOptions ??= {}
			opts.postcssOptions.plugins ??= []
			opts.postcssOptions.plugins.push(UnoCSS())
		},
	},
})
