/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */
import { ColorGenerator } from './theme'
import StyleManager from './styleManager'
import type { GlobalTheme } from '../../../src/types/theme'

export default class ThemeManager {
	private currentTheme: string

	private themeToggleBtn: HTMLElement | null

	private themeIcon: SVGElement | null

	private colorGenerator: ColorGenerator

	private styleManager: StyleManager

	private panelTheme: GlobalTheme | null

	constructor() {
		this.themeToggleBtn = null
		this.themeIcon = null
		this.colorGenerator = new ColorGenerator()
		this.styleManager = new StyleManager()
		this.panelTheme = (window as any).vite_public_panel_theme || null

		// 获取初始主题，优先使用panelTheme配置
		// this.currentTheme = this.getInitialTheme()

		// 立即应用主题，确保在DOM渲染前设置正确的主题
		// this.applyThemeImmediate(this.currentTheme)

		// 等待DOM加载完成后进行完整初始化
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => this.init())
		} else {
			// DOM已经加载完成，直接初始化
			this.init()
		}
	}

	// 初始化主题管理器
	private init() {
		this.bindElements()
		this.applyTheme(this.currentTheme)
		this.applyPanelThemeColors()
		this.updateThemeIcon(this.currentTheme)
		this.updateThemeTips(this.currentTheme)
		this.bindEvents()
	}

	// 绑定DOM元素
	private bindElements() {
		this.themeToggleBtn = document.querySelector('#theme-toggle-btn')
		this.themeIcon = document.querySelector('#theme-toggle-btn .theme-icon')
	}

	// 绑定事件
	private bindEvents() {
		if (this.themeToggleBtn) {
			// 添加主题切换按钮的CSS类
			this.themeToggleBtn.classList.add('theme-toggle-button')
			this.themeToggleBtn.addEventListener('click', (event: MouseEvent) => {
				this.toggleTheme(event)
			})
		}
	}

	// 切换主题 - 带动画效果
	public async toggleTheme(event?: MouseEvent) {
		// 防止重复触发
		if (document.documentElement.classList.contains('theme-switching')) {
			return
		}

		const newTheme = this.currentTheme === 'light' ? 'dark' : 'light'

		// 如果有点击事件，实现动画效果
		if (event) {
			await this.animateThemeToggle(event, newTheme)
		} else {
			// 直接切换主题（无动画）
			this.setTheme(newTheme)
		}
	}

	// 实现主题切换动画效果
	private async animateThemeToggle(event: MouseEvent, newTheme: 'light' | 'dark') {
		event.preventDefault()
		event.stopPropagation()

		const x = event.clientX
		const y = event.clientY

		// 计算从点击位置到视窗边缘的最大距离作为圆的半径
		const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

		// 设置CSS变量用于动画
		document.documentElement.style.setProperty('--circle-x', `${x}px`)
		document.documentElement.style.setProperty('--circle-y', `${y}px`)
		document.documentElement.style.setProperty('--circle-size', `${endRadius * 2}px`)

		// 添加调试日志
		console.log('Theme animation triggered:', {
			x,
			y,
			endRadius,
			newTheme,
			supportsViewTransitions: typeof (document as any).startViewTransition === 'function',
		})

		// 添加主题切换状态类
		document.documentElement.classList.add('theme-switching')

		// 禁用按钮防止重复点击
		if (this.themeToggleBtn) {
			this.themeToggleBtn.classList.add('transitioning')
		}

		const performThemeSwitch = () => {
			this.setTheme(newTheme)
		}

		// 检查浏览器是否支持View Transitions API
		if (typeof (document as any).startViewTransition === 'function') {
			console.log('Using View Transitions API for theme animation')
			// 使用View Transitions API实现平滑的主题切换动画
			try {
				const transition = (document as any).startViewTransition(performThemeSwitch)
				console.log('View transition started successfully')

				// 监听动画完成事件
				transition.finished
					.then(() => {
						console.log('View transition animation completed')
						// 动画完成后移除状态类
						document.documentElement.classList.remove('theme-switching')
						if (this.themeToggleBtn) {
							this.themeToggleBtn.classList.remove('transitioning')
						}
					})
					.catch((error: any) => {
						// 如果动画失败，确保状态类被移除
						console.warn('View transition animation failed:', error)
						document.documentElement.classList.remove('theme-switching')
						if (this.themeToggleBtn) {
							this.themeToggleBtn.classList.remove('transitioning')
						}
					})
			} catch (error) {
				console.warn('View Transitions API failed:', error)
				// 降级处理：使用CSS过渡效果
				setTimeout(() => {
					performThemeSwitch()
					document.documentElement.classList.remove('theme-switching')
				}, 100)
			}
		} else {
			console.log('Using fallback CSS animation for theme switching')
			// 降级处理：使用CSS过渡效果
			this.createFallbackAnimation(x, y, newTheme === 'dark' ? '#1a1a1a' : '#ffffff')
			setTimeout(performThemeSwitch, 250)
			// 延迟移除状态类以确保过渡完成
			setTimeout(() => {
				console.log('Fallback animation completed')
				document.documentElement.classList.remove('theme-switching')
				this.removeFallbackAnimation()
				if (this.themeToggleBtn) {
					this.themeToggleBtn.classList.remove('transitioning')
				}
			}, 500)
		}
	}

	// 创建降级动画元素
	private createFallbackAnimation(x: number, y: number, bgColor: string) {
		const fallbackElement = document.createElement('div')
		fallbackElement.className = 'theme-transition-fallback'
		fallbackElement.style.setProperty('--circle-x', `${x}px`)
		fallbackElement.style.setProperty('--circle-y', `${y}px`)
		fallbackElement.style.setProperty('--fallback-bg-color', bgColor)
		fallbackElement.id = 'theme-fallback-animation'

		document.body.appendChild(fallbackElement)

		// 触发动画
		setTimeout(() => {
			fallbackElement.classList.add('active')
		}, 10)
	}

	// 移除降级动画元素
	private removeFallbackAnimation() {
		const fallbackElement = document.getElementById('theme-fallback-animation')
		if (fallbackElement) {
			fallbackElement.remove()
		}
	}

	// 设置主题
	public setTheme(theme: string) {
		this.currentTheme = theme
		this.applyTheme(theme)
		// this.storeTheme(theme)
		this.updateThemeIcon(theme)
		this.updateThemeTips(theme)
	}

	// 立即应用主题（仅设置基础属性，不依赖DOM元素）
	private applyThemeImmediate(theme: string) {
		const htmlElement = document.documentElement
		if (theme === 'dark') {
			htmlElement.setAttribute('data-theme', 'dark')
		} else {
			htmlElement.removeAttribute('data-theme')
		}
	}

	// 应用主题
	private applyTheme(theme: string) {
		this.applyThemeImmediate(theme)
		// 应用动态颜色变量
		this.applyPanelThemeColors()
	}

	// 应用面板主题颜色配置
	private applyPanelThemeColors() {
		if (!this.panelTheme) return

		const isDarkMode = this.currentTheme === 'dark'
		const themeColor = this.panelTheme.theme?.color || '#20a53a'

		// 生成并应用主题色相关的颜色变量
		const colorVariables = this.colorGenerator.generateAndApplyColors(
			{
				primary: themeColor,
				success: '#67c23a',
				warning: '#f2711c',
				danger: '#db2828',
				error: '#db2828',
				info: '#909399',
			},
			{ darkMode: isDarkMode }
		)

		// 通过StyleManager注册颜色变量
		this.styleManager.registerColorVariables(colorVariables, '')

		// 应用其他主题配置
		this.applyInterfaceStyles()
		this.applyLoginStyles()
	}

	// 应用界面样式配置
	private applyInterfaceStyles() {
		// 通过StyleManager注册主题变量，替代直接设置CSS属性
		if (this.panelTheme) {
			this.styleManager.registerThemeVariables(this.panelTheme)
		}
	}

	// 应用登录页面样式配置
	private applyLoginStyles() {
		// 登录样式已在registerThemeVariables中处理
		// 这里保留方法以保持接口一致性
	}

	// 更新主题图标
	private updateThemeIcon(theme: string) {
		if (!this.themeIcon) return
		if (theme === 'dark') {
			// 太阳图标 (暗色主题时显示太阳，表示点击后切换到亮色主题)
			this.themeIcon.innerHTML = `
				<circle cx="12" cy="12" r="5"/>
				<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
			`
		} else {
			// 月亮图标 (亮色主题时显示月亮，表示点击后切换到暗色主题)
			this.themeIcon.innerHTML = `
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
			`
		}
	}

	// 更新主题提示文本
	private updateThemeTips(theme: string) {
		if (!this.themeToggleBtn) return

		if (theme === 'dark') {
			this.themeToggleBtn.setAttribute('title', '切换到亮色主题')
		} else {
			this.themeToggleBtn.setAttribute('title', '切换到暗色主题')
		}
	}

	// // 获取存储的主题
	// private getStoredTheme(): string | null {
	// 	return localStorage.getItem('theme')
	// }

	// // 存储主题
	// private storeTheme(theme: string) {
	// 	localStorage.setItem('theme', theme)
	// }

	// // 获取当前主题
	// public getCurrentTheme(): string {
	// 	return this.currentTheme
	// }

	// // 获取初始主题，优先级：panelTheme配置 > localStorage > 系统主题
	// private getInitialTheme(): string {
	// 	// 1. 优先使用panelTheme配置中的theme.dark设置
	// 	if (this.panelTheme?.theme?.dark !== undefined) {
	// 		return this.panelTheme.theme.dark ? 'dark' : 'light'
	// 	}

	// 	// 2. 其次使用localStorage中存储的用户偏好
	// 	const storedTheme = this.getStoredTheme()
	// 	if (storedTheme) {
	// 		return storedTheme
	// 	}

	// 	// 3. 最后使用系统主题偏好
	// 	return this.detectSystemTheme()
	// }

	// // 检测系统主题偏好
	// public detectSystemTheme(): string {
	// 	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	// 		return 'dark'
	// 	}
	// 	return 'light'
	// }

	// // 监听系统主题变化
	// public watchSystemTheme() {
	// 	if (window.matchMedia) {
	// 		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
	// 		mediaQuery.addEventListener('change', e => {
	// 			// 如果有panelTheme配置的主题设置，则不跟随系统主题变化
	// 			if (this.panelTheme?.theme?.dark !== undefined) {
	// 				return
	// 			}

	// 			if (!this.getStoredTheme()) {
	// 				// 只有在用户没有手动设置主题时才跟随系统
	// 				const systemTheme = e.matches ? 'dark' : 'light'
	// 				this.setTheme(systemTheme)
	// 			}
	// 		})
	// 	}
	// }

	// // 更新面板主题配置
	// public updatePanelTheme(newTheme: GlobalTheme) {
	// 	this.panelTheme = newTheme

	// 	// 如果新的面板主题配置包含主题模式设置，则应用对应的主题
	// 	if (newTheme?.theme?.dark !== undefined) {
	// 		const newThemeMode = newTheme.theme.dark ? 'dark' : 'light'
	// 		if (this.currentTheme !== newThemeMode) {
	// 			this.setTheme(newThemeMode)
	// 		}
	// 	}

	// 	this.applyPanelThemeColors()
	// }

	// /**
	//  * 获取当前面板主题配置
	//  */
	// public getPanelTheme(): GlobalTheme | null {
	// 	return this.panelTheme
	// }

	/**
	 * 获取StyleManager实例
	 */
	public getStyleManager(): StyleManager {
		return this.styleManager
	}

	/**
	 * 注册自定义CSS变量
	 * @param variables CSS变量对象
	 * @param namespace 命名空间
	 */
	public registerCustomVariables(variables: Record<string, string>, namespace?: string) {
		this.styleManager.registerVariables(variables, namespace)
	}

	/**
	 * 获取当前所有CSS变量
	 */
	public getAllVariables(): Record<string, string> {
		return this.styleManager.getCurrentVariables()
	}
}
