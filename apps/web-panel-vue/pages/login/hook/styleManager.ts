/* eslint-disable @typescript-eslint/naming-convention */
import type { ColorVariables } from './type'
import type { GlobalTheme } from '../../../src/types/theme'

/**
 * 样式管理器 - 集中管理CSS变量的生成和注入
 */
export default class StyleManager {
	private styleElement: HTMLStyleElement | null = null

	private readonly styleId = 'dynamic-theme-variables'

	private currentVariables: Record<string, string> = {}

	constructor() {
		this.init()
	}

	/**
	 * 初始化样式管理器
	 */
	private init() {
		this.createStyleElement()
	}

	/**
	 * 创建或获取样式元素
	 */
	private createStyleElement(): HTMLStyleElement {
		// 检查是否已存在样式元素
		const existingStyle = document.getElementById(this.styleId) as HTMLStyleElement
		if (existingStyle) {
			this.styleElement = existingStyle
			return existingStyle
		}

		// 创建新的样式元素
		const styleElement = document.createElement('style')
		styleElement.id = this.styleId
		styleElement.type = 'text/css'

		// 添加View Transitions API和主题切换动画的CSS样式
		const viewTransitionStyles = `
			/* View Transitions API 支持 */
			::view-transition-old(root),
			::view-transition-new(root) {
				animation-duration: 0.5s;
				z-index: 99999;
			}

			/* 当支持View Transitions时的圆形扩散动画 */
			html.theme-switching::view-transition-old(root) {
				clip-path: circle(var(--circle-size, 100%) at var(--circle-x, 50%) var(--circle-y, 50%));
			}

			html.theme-switching::view-transition-new(root) {
				clip-path: circle(var(--circle-size, 0px) at var(--circle-x, 50%) var(--circle-y, 50%));
			}

			/* 降级动画 - 当不支持View Transitions时 */
			.theme-transition-fallback {
				position: fixed;
				top: 0;
				left: 0;
				width: 100vw;
				height: 100vh;
				background: var(--fallback-bg-color, #ffffff);
				border-radius: 50%;
				transform: scale(0);
				transform-origin: var(--circle-x, 50%) var(--circle-y, 50%);
				z-index: 99999;
				pointer-events: none;
				transition: transform 0.5s ease-in-out;
			}

			.theme-transition-fallback.active {
				transform: scale(3);
			}

			/* 主题切换按钮状态 */
			.theme-toggle-button {
				transition: transform 0.2s ease;
			}

			.theme-toggle-button:hover {
				transform: scale(1.1);
			}

			.theme-toggle-button.transitioning {
				pointer-events: none;
			}
		`

		styleElement.textContent = viewTransitionStyles

		// 插入到head中
		document.head.appendChild(styleElement)
		this.styleElement = styleElement

		return styleElement
	}

	/**
	 * 注册CSS变量
	 * @param variables CSS变量对象
	 * @param namespace 命名空间，用于分组管理
	 */
	public registerVariables(variables: Record<string, string>, namespace?: string) {
		const prefixedVariables: Record<string, string> = {}

		// 如果有命名空间，为变量名添加前缀
		Object.keys(variables).forEach(key => {
			const variableName = namespace ? `--${namespace}-${key.replace(/^--/, '')}` : key
			prefixedVariables[variableName] = variables[key]
		})

		// 合并到当前变量集合
		Object.assign(this.currentVariables, prefixedVariables)

		// 更新样式
		this.updateStyles()
	}

	/**
	 * 注册颜色变量（专门用于ColorGenerator生成的变量）
	 * @param colorVariables 颜色变量对象
	 * @param namespace 命名空间
	 */
	public registerColorVariables(colorVariables: ColorVariables, namespace?: string) {
		this.registerVariables(colorVariables, namespace)
	}

	/**
	 * 注册主题配置变量
	 * @param themeConfig 主题配置对象
	 */
	public registerThemeVariables(themeConfig: GlobalTheme) {
		const themeVariables: Record<string, string> = {}

		// 主题相关变量
		if (themeConfig.theme) {
			if (themeConfig.theme.color) {
				themeVariables['--theme-primary-color'] = themeConfig.theme.color
			}
		}

		// 界面圆角配置
		if (themeConfig.interface && themeConfig.interface.rounded) {
			const roundedValue = themeConfig.interface.rounded
			// 根据圆角配置设置对应的CSS变量值
			switch (roundedValue) {
				case 'none':
					themeVariables['--el-border-radius-small'] = '0px'
					themeVariables['--el-border-radius-base'] = '0px'
					themeVariables['--el-border-radius-medium'] = '0px'
					themeVariables['--el-border-radius-large'] = '0px'
					themeVariables['--el-border-radius-extra-large'] = '0px'
					break
				case 'small':
					themeVariables['--el-border-radius-small'] = '2px'
					themeVariables['--el-border-radius-base'] = '4px'
					themeVariables['--el-border-radius-medium'] = '6px'
					themeVariables['--el-border-radius-large'] = '8px'
					themeVariables['--el-border-radius-extra-large'] = '16px'
					break
				case 'medium':
					themeVariables['--el-border-radius-small'] = '4px'
					themeVariables['--el-border-radius-base'] = '6px'
					themeVariables['--el-border-radius-medium'] = '8px'
					themeVariables['--el-border-radius-large'] = '12px'
					themeVariables['--el-border-radius-extra-large'] = '20px'
					break
				case 'large':
					themeVariables['--el-border-radius-small'] = '8px'
					themeVariables['--el-border-radius-base'] = '12px'
					themeVariables['--el-border-radius-medium'] = '16px'
					themeVariables['--el-border-radius-large'] = '20px'
					themeVariables['--el-border-radius-extra-large'] = '24px'
					break
				default:
					// 默认使用medium圆角
					themeVariables['--el-border-radius-small'] = '4px'
					themeVariables['--el-border-radius-base'] = '6px'
					themeVariables['--el-border-radius-medium'] = '8px'
					themeVariables['--el-border-radius-large'] = '12px'
					themeVariables['--el-border-radius-extra-large'] = '16px'
					break
			}
		}

		// 登录页面相关变量
		if (themeConfig.login) {
			if (themeConfig.login.bg_image) {
				themeVariables['--login-bg-image'] = `url('${themeConfig.login.bg_image}')`
			}
			if (themeConfig.login.bg_image_opacity !== undefined) {
				themeVariables['--login-bg-opacity'] = String(themeConfig.login.bg_image_opacity / 100)
			}
			if (themeConfig.login.content_opacity !== undefined) {
				themeVariables['--login-content-opacity'] = String(themeConfig.login.content_opacity / 100)
			}
			if (themeConfig.login.logo) {
				themeVariables['--login-logo-url'] = `url('${themeConfig.login.logo}')`
			}
		}

		// Logo相关变量
		if (themeConfig.logo) {
			if (themeConfig.logo.image) {
				themeVariables['--logo-image-url'] = `url('${themeConfig.logo.image}')`
			}
			if (themeConfig.logo.favicon) {
				themeVariables['--logo-favicon-url'] = `url('${themeConfig.logo.favicon}')`
			}
		}

		this.registerVariables(themeVariables, '')
	}

	/**
	 * 移除指定命名空间的变量
	 * @param namespace 命名空间
	 */
	public removeVariablesByNamespace(namespace: string) {
		const prefix = `--${namespace}-`
		Object.keys(this.currentVariables).forEach(key => {
			if (key.startsWith(prefix)) {
				delete this.currentVariables[key]
			}
		})
		this.updateStyles()
	}

	/**
	 * 清空所有变量
	 */
	public clearAllVariables() {
		this.currentVariables = {}
		this.updateStyles()
	}

	/**
	 * 更新样式元素的内容
	 */
	private updateStyles() {
		if (!this.styleElement) {
			this.createStyleElement()
		}

		// 生成CSS规则
		const cssRules = this.generateCSSRules()

		// 更新样式元素内容
		if (this.styleElement) {
			this.styleElement.textContent = cssRules
		}
	}

	private getSystemTheme() {
		try {
			return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		} catch (error) {
			return 'light'
		}
	}

	private isDark(): boolean {
		try {
			const { preset } = window.vite_public_panel_theme.theme
			if (preset === 'auto') {
				return this.getSystemTheme() === 'dark'
			}
			return preset === 'dark'
		} catch (error) {
			return false
		}
	}

	/**
	 * 生成CSS规则字符串
	 */
	private generateCSSRules(): string {
		const variables = Object.keys(this.currentVariables)
			.map(key => `  ${key}: ${this.currentVariables[key]};`)
			.join('\n')
		return `${this.isDark() ? 'html.dark {' : ':root {'}\n${variables}\n}`
	}

	/**
	 * 获取当前所有变量
	 */
	public getCurrentVariables(): Record<string, string> {
		return { ...this.currentVariables }
	}

	/**
	 * 获取指定变量的值
	 * @param variableName 变量名
	 */
	public getVariable(variableName: string): string | undefined {
		return this.currentVariables[variableName]
	}

	/**
	 * 检查变量是否存在
	 * @param variableName 变量名
	 */
	public hasVariable(variableName: string): boolean {
		return variableName in this.currentVariables
	}

	/**
	 * 销毁样式管理器
	 */
	public destroy() {
		if (this.styleElement && this.styleElement.parentNode) {
			this.styleElement.parentNode.removeChild(this.styleElement)
		}
		this.styleElement = null
		this.currentVariables = {}
	}
}
