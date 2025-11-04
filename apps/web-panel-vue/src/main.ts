import { createApp } from 'vue'
import { ElLoading } from 'element-plus'
// import * as Sentry from '@sentry/vue'
import App from '@/app.vue'

import 'nprogress/nprogress.css' // 引入全局样式 - nprogress
import '@/icons/register' // 注册svg图标（Rsbuild via svg-sprite-loader）
import 'uno.css' // 引入uno.css-原子化css（PostCSS集成）
import '@/styles/font/unfonts.css' // 引入自定义字体样式（替代 Vite unplugin-fonts）

import '@unocss/reset/tailwind-compat.css' // 引入uno.css-重置样式tailwind兼容
import '/public/static/font/svgtofont.css' // 引入全局样式 - svgtofont
import '@/styles/font/home-fonts.css' // 引入阿里巴巴普惠体自定义字体样式，首页依赖
import '@/styles/index.scss' // 引入全局样式
import '@/styles/element/index.scss' // element 默认调整
import '@/styles/theme/index.scss' // 主题配置
import '@/styles/theme/dark.scss' // 主题配置

import { router } from '@/router' // 引入路由配置
import { pinia } from '@/store' // 引入状态管理

import { mountDirective } from '@/directive' // 指令
import { mountErrorHandler } from '@axios/model/error' // 错误处理
import { createCSSVariableManager, setSchemeTheme, watchSystemTheme } from '@/utils/theme-config'

const example = createApp(App) // 创建实例
example.directive('loading', ElLoading.directive) // 挂载loading指令

// 创建主题管理器实例(将变量)
window.themeManager = createCSSVariableManager()

// 监听系统主题变化
watchSystemTheme()

// 初始化主题
setSchemeTheme()

example.use(router) // 使用路由
example.use(pinia) // 使用状态管理

// // 挂载全局函数
mountDirective(example) // 指令
mountErrorHandler(example) // 错误处理

// Sentry.init({
// 	app: example,
// 	dsn: 'https://e96b37fd485baa3bb2337f9a51623993@o4510077747658752.ingest.us.sentry.io/4510077748641792',
// 	// Setting this option to true will send default PII data to Sentry.
// 	// For example, automatic IP address collection on events
// 	sendDefaultPii: true,
// })

// 挂载到#app
example.mount('#root')
