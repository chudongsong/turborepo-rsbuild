declare type AnyFunction<T = any> = (...args: any) => T

// biome-ignore lint/complexity/noBannedTypes: <explanation>
declare interface AnyObject extends Object {
	[anyKey: PropertyKey]: any
}

declare module 'asciinema-player'

declare module 'v-contextmenu'

declare module 'vue-top-progress'

// declare module 'qrcode'

declare module 'element-plus/dist/locale/zh-cn.mjs'

declare module 'vue-virtual-scroller'

declare module '*.scss'

// 补充构建插件/工具的类型声明，避免 TS 模块缺失报错
declare module 'unplugin-auto-import/rspack'
declare module 'unplugin-vue-components/rspack'
declare module 'unplugin-vue-components/resolvers'
declare module '@unocss/postcss'
declare module 'rsbuild-plugin-html-minifier-terser'
declare module 'svg-sprite-loader'
