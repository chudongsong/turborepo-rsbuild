// 颜色相关接口定义
interface RGB {
	r: number
	g: number
	b: number
}

interface HSL {
	h: number
	s: number
	l: number
}

// 完整的颜色配置接口
interface ColorConfig {
	menuTextColor: string // 菜单栏文字颜色
	// 消息提示颜色
	menuMessageBgHoverColor: string // 消息盒子悬停背景色
	menuMessageColor: string // 消息提示颜色
	menuMessageBgColor: string // 消息盒子背景色
	menuMessageNoticeColor: string // 消息提示颜色
	menuMessageNoticeBgColor: string // 消息提示背景色

	// 菜单栏颜色
	menuSidebarBgColor: string // 菜单栏背景色
	menuSidebarActiveBgColor: string // 菜单栏激活状态背景色
	menuSidebarHoverBgColor: string // 菜单栏项悬停状态背景色
	menuSidebarTextColor: string // 菜单栏文字颜色
	menuSidebarIcoColor: string // 菜单栏图标颜色
	menuSidebarActiveShadowColor: string // 菜单栏激活状态阴影颜色
	menuSidebarLeftLineColor: string // 菜单栏左侧激活线条颜色

	// 菜单栏图标颜色
	svgStrokeColor: string // 菜单栏图标颜色
	svgInnerGradientColor1: string // 菜单栏图标渐变颜色1
	svgInnerGradientColor2: string // 菜单栏图标渐变颜色2

	// 工具栏颜色
	menuToolbarBorderColor: string // 工具栏边框颜色
	menuToolbarBgColor: string // 工具栏背景色
	menuToolbarTextColor: string // 工具栏文字颜色
	menuToolbarHoverColor: string // 工具栏项悬停状态文字颜色
	menuToolbarHoverBgColor: string // 工具栏项悬停状态背景色
}

// 将十六进制颜色转换为RGB
const hexToRgb = (hex: string): RGB | null => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null
}

/**
 * 将十六进制颜色转换为 RGBA 格式
 * @param hex - 十六进制颜色字符串 (例如, "#RRGGBB")
 * @param alpha - 透明度 (0 到 1)
 * @returns RGBA 格式的颜色字符串 (例如, "rgba(r, g, b, a)"), 如果 hex 无效则返回空字符串
 */
export const hexToRgba = (hex: string, alpha: string | number): string => {
	const rgb = hexToRgb(hex)
	if (!rgb) {
		return ''
	}
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

// 创建静态主题配置的函数
function createStaticThemeConfigs(): Record<string, ColorConfig> {
	const configs: Record<string, ColorConfig> = {}

	// 默认深色主题
	configs['#3c444d'] = {
		menuTextColor: '#ffffff',
		// 消息提示颜色
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: '#2c3138',
		menuMessageBgColor: '#3c444d',
		menuMessageNoticeColor: '#ffffff',
		menuMessageNoticeBgColor: '#0e673d',

		// 菜单栏颜色
		menuSidebarBgColor: '#3c444d',
		menuSidebarActiveBgColor: '#2c3138',
		menuSidebarHoverBgColor: '#2c3138',
		menuSidebarTextColor: '#ffffff',
		menuSidebarIcoColor: '#bbbbbb',
		menuSidebarActiveShadowColor: '#0000001c',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		// 菜单栏图标颜色
		svgStrokeColor: '#bbbbbb',
		svgInnerGradientColor1: '#ffffff',
		svgInnerGradientColor2: '#cccccc',

		// 工具栏颜色
		menuToolbarBorderColor: '#404a55',
		menuToolbarBgColor: '#2c3138',
		menuToolbarTextColor: '#bbbbbb',
		menuToolbarHoverColor: '#ffffff',
		menuToolbarHoverBgColor: '#404a55',
	}

	// 纯白主题
	configs['#ffffff'] = {
		menuTextColor: '#333333',
		// 消息提示颜色
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: '#666666',
		menuMessageBgColor: '#ffffff',
		menuMessageNoticeColor: '#ffffff',
		menuMessageNoticeBgColor: 'var(--el-color-primary)',

		// 菜单栏颜色
		menuSidebarBgColor: '#ffffff',
		menuSidebarActiveBgColor: '#ffffff',
		menuSidebarHoverBgColor: '#ffffff',
		menuSidebarTextColor: '#333333',
		menuSidebarIcoColor: '#666666',
		menuSidebarActiveShadowColor: '#0000001c',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		// 菜单栏图标颜色
		svgStrokeColor: '#666666',
		svgInnerGradientColor1: 'var(--el-color-primary)',
		svgInnerGradientColor2: '#068f20',

		// 工具栏颜色
		menuToolbarBorderColor: '#e1e4e8',
		menuToolbarBgColor: '#f8f9fa',
		menuToolbarTextColor: '#666666',
		menuToolbarHoverColor: '#333333',
		menuToolbarHoverBgColor: '#f0f0f0',
	}

	// 深紫色主题
	configs['#A736FF'] = {
		menuTextColor: '#ffffff',
		// 消息提示颜色
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: '#8e2de2',
		menuMessageBgColor: '#A736FF',
		menuMessageNoticeColor: '#ffffff',
		menuMessageNoticeBgColor: '#0e673d',

		// 菜单栏颜色
		menuSidebarBgColor: '#A736FF',
		menuSidebarActiveBgColor: '#8e2de2',
		menuSidebarHoverBgColor: '#9333ea',
		menuSidebarTextColor: '#ffffff',
		menuSidebarIcoColor: '#e5ccff',
		menuSidebarActiveShadowColor: '#a736ff33',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		// 菜单栏图标颜色
		svgStrokeColor: '#e5ccff',
		svgInnerGradientColor1: '#ffffff',
		svgInnerGradientColor2: '#d1b3ff',

		// 工具栏颜色
		menuToolbarBorderColor: '#b84eff',
		menuToolbarBgColor: '#8e2de2',
		menuToolbarTextColor: '#e5ccff',
		menuToolbarHoverColor: '#ffffff',
		menuToolbarHoverBgColor: '#9333ea',
	}

	// 暗黑主题
	configs['#1e2329'] = {
		menuTextColor: '#ffffff',
		// 消息提示颜色
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: '#141821',
		menuMessageBgColor: '#1e2329',
		menuMessageNoticeColor: '#ffffff',
		menuMessageNoticeBgColor: '#0e673d',

		// 菜单栏颜色
		menuSidebarBgColor: '#1e2329',
		menuSidebarActiveBgColor: '#141821',
		menuSidebarHoverBgColor: '#1a1d24',
		menuSidebarTextColor: '#ffffff',
		menuSidebarIcoColor: '#8c9196',
		menuSidebarActiveShadowColor: '#00000026',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		// 菜单栏图标颜色
		svgStrokeColor: '#8c9196',
		svgInnerGradientColor1: '#ffffff',
		svgInnerGradientColor2: '#b1b5bb',

		// 工具栏颜色
		menuToolbarBorderColor: '#2a2e37',
		menuToolbarBgColor: '#141821',
		menuToolbarTextColor: '#8c9196',
		menuToolbarHoverColor: '#ffffff',
		menuToolbarHoverBgColor: '#1a1d24',
	}

	return configs
}

// 静态主题配置
const STATIC_THEME_CONFIGS = createStaticThemeConfigs()

/**
 * 根据菜单栏主色动态生成其他相关颜色（用于自定义颜色）
 * @param mainColor - 主色，格式为十六进制颜色值，例如 "#3c444d"
 * @returns 包含所有生成颜色的ColorConfig对象
 */
export function generateDynamicColors(mainColor: string): ColorConfig {
	// 将RGB转换为十六进制
	const rgbToHex = (r: number, g: number, b: number): string => {
		const rInt = Math.round(r)
		const gInt = Math.round(g)
		const bInt = Math.round(b)
		const rHex = rInt.toString(16).padStart(2, '0')
		const gHex = gInt.toString(16).padStart(2, '0')
		const bHex = bInt.toString(16).padStart(2, '0')
		return `#${rHex}${gHex}${bHex}`
	}

	// RGB转HSL
	const rgbToHsl = (r: number, g: number, b: number): HSL => {
		r /= 255
		g /= 255
		b /= 255

		const max = Math.max(r, g, b)
		const min = Math.min(r, g, b)
		let h = 0
		let s = 0
		const l = (max + min) / 2

		if (max !== min) {
			const d = max - min
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0)
					break
				case g:
					h = (b - r) / d + 2
					break
				case b:
					h = (r - g) / d + 4
					break
			}

			h /= 6
		}

		return { h, s, l }
	}

	// HSL转RGB
	const hslToRgb = (h: number, s: number, l: number): RGB => {
		let r = 0
		let g = 0
		let b = 0

		if (s === 0) {
			r = l
			g = l
			b = l
		} else {
			const hue2rgb = (p: number, q: number, t: number): number => {
				if (t < 0) t += 1
				if (t > 1) t -= 1
				if (t < 1 / 6) return p + (q - p) * 6 * t
				if (t < 1 / 2) return q
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
				return p
			}

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s
			const p = 2 * l - q

			r = hue2rgb(p, q, h + 1 / 3)
			g = hue2rgb(p, q, h)
			b = hue2rgb(p, q, h - 1 / 3)
		}

		return {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255),
		}
	}

	// 调整HSL值
	const adjustHsl = (color: RGB, hDelta = 0, sFactor = 1, lFactor = 1): RGB => {
		const { r, g, b } = color
		const { h, s, l } = rgbToHsl(r, g, b)

		const newH = (h + hDelta) % 1
		const newS = Math.max(0, Math.min(1, s * sFactor))
		const newL = Math.max(0, Math.min(1, l * lFactor))

		return hslToRgb(newH, newS, newL)
	}

	// 判断是否为浅色主题
	const isLightTheme = (color: RGB): boolean => {
		const { r, g, b } = color
		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness > 180
	}

	// 判断背景是否非常亮
	const isVeryBrightBg = (color: RGB): boolean => {
		const { r, g, b } = color
		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness > 230
	}

	// 解析主色
	const mainColorRgb = hexToRgb(mainColor)
	if (!mainColorRgb) {
		throw new Error('无效的颜色格式')
	}

	// 检查是否为浅色主题
	const isLight = isLightTheme(mainColorRgb)

	// 生成相关颜色
	const activeBg = isLight ? adjustHsl(mainColorRgb, 0, 1.1, 0.9) : adjustHsl(mainColorRgb, 0, 0.9, 0.75)

	const hoverBg = isLight ? adjustHsl(mainColorRgb, 0, 1.05, 0.95) : adjustHsl(mainColorRgb, 0, 0.95, 0.85)

	// 文字和图标颜色
	const textColor = isVeryBrightBg(mainColorRgb) ? '#333333' : '#ffffff'
	const iconColor = isVeryBrightBg(mainColorRgb) ? '#666666' : '#bbbbbb'

	// 工具栏相关颜色
	const toolbarBg = adjustHsl(mainColorRgb, 0, 0.9, 0.8)
	const toolbarBorder = adjustHsl(mainColorRgb, 0, 0.9, 1.1)

	return {
		menuTextColor: textColor,
		// 消息提示颜色
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: rgbToHex(activeBg.r, activeBg.g, activeBg.b),
		menuMessageBgColor: mainColor,
		menuMessageNoticeColor: textColor,
		menuMessageNoticeBgColor: '#0e673d',

		// 菜单栏颜色
		menuSidebarBgColor: mainColor,
		menuSidebarActiveBgColor: rgbToHex(activeBg.r, activeBg.g, activeBg.b),
		menuSidebarHoverBgColor: rgbToHex(hoverBg.r, hoverBg.g, hoverBg.b),
		menuSidebarTextColor: textColor,
		menuSidebarIcoColor: iconColor,
		menuSidebarActiveShadowColor: isLight ? '#0000000d' : '#0000001c',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		// 菜单栏图标颜色
		svgStrokeColor: iconColor,
		svgInnerGradientColor1: textColor,
		svgInnerGradientColor2: iconColor,

		// 工具栏颜色
		menuToolbarBorderColor: rgbToHex(toolbarBorder.r, toolbarBorder.g, toolbarBorder.b),
		menuToolbarBgColor: rgbToHex(toolbarBg.r, toolbarBg.g, toolbarBg.b),
		menuToolbarTextColor: iconColor,
		menuToolbarHoverColor: textColor,
		menuToolbarHoverBgColor: rgbToHex(hoverBg.r, hoverBg.g, hoverBg.b),
	}
}

/**
 * 获取主题配置（静态或动态生成）
 * @param mainColor - 主色，格式为十六进制颜色值
 * @returns 颜色配置对象
 */
export function getThemeConfig(mainColor: string): ColorConfig {
	// 检查是否为预设的静态主题
	if (STATIC_THEME_CONFIGS[mainColor]) {
		return STATIC_THEME_CONFIGS[mainColor]
	}

	// 如果不是预设主题，则动态生成
	return generateDynamicColors(mainColor)
}

/**
 * 将颜色配置应用到CSS变量
 * @param colors - 颜色配置对象
 */
export function applyThemeColors(colors: ColorConfig): void {
	const root = document.documentElement

	// 创建CSS变量映射
	const cssVariableMapping = [
		['--menu-text-color', colors.menuTextColor],
		['--menu-message-bg-hover-color', hexToRgba(colors.menuMessageBgHoverColor, 'var(--menu-global-opacity)')],
		['--menu-message-bg-color', hexToRgba(colors.menuMessageBgColor, 'var(--menu-global-opacity)')],
		['--menu-message-notice-color', colors.menuMessageNoticeColor],
		['--menu-message-notice-bg-color', hexToRgba(colors.menuMessageNoticeBgColor, 'var(--menu-global-opacity)')],
		['--menu-sidebar-bg-color', hexToRgba(colors.menuSidebarBgColor, 'var(--menu-global-opacity)')],
		['--menu-sidebar-active-bg-color', hexToRgba(colors.menuSidebarActiveBgColor, 'var(--menu-global-opacity)')],
		['--menu-sidebar-hover-bg-color', hexToRgba(colors.menuSidebarHoverBgColor, 'var(--menu-global-opacity)')],
		['--menu-sidebar-text-color', colors.menuSidebarTextColor],
		['--menu-sidebar-ico-color', colors.menuSidebarIcoColor],
		['--menu-sidebar-active-shadow-color', colors.menuSidebarActiveShadowColor],
		['--menu-sidebar-left-line-color', colors.menuSidebarLeftLineColor],
		['--svg-stroke-color', colors.svgStrokeColor],
		['--svg-inner-gradient-color-1', colors.svgInnerGradientColor1],
		['--svg-inner-gradient-color-2', colors.svgInnerGradientColor2],
		['--menu-toolbar-border-color', colors.menuToolbarBorderColor],
		['--menu-toolbar-bg-color', hexToRgba(colors.menuToolbarBgColor, 'var(--menu-global-opacity)')],
		['--menu-toolbar-text-color', colors.menuToolbarTextColor],
		['--menu-toolbar-hover-color', colors.menuToolbarHoverColor],
		['--menu-toolbar-hover-bg-color', hexToRgba(colors.menuToolbarHoverBgColor, 'var(--menu-global-opacity)')],
	]
	// 应用所有CSS变量
	cssVariableMapping.forEach(([property, value]) => {
		root.style.setProperty(property, value)
	})
}

/**
 * 预设主题颜色
 */
export const themePresets = {
	default: '#3c444d', // 默认深色主题
	white: '#ffffff', // 纯白主题
	purple: '#A736FF', // 深紫色主题
	dark: '#1e2329', // 暗黑主题
} as const

/**
 * 切换主题
 * @param themeName - 主题名称或自定义颜色值
 * @returns 应用的颜色配置对象
 */
export function switchTheme(themeName: string): ColorConfig {
	// 如果是预设主题名称，则转换为对应的颜色值
	const mainColor = (themePresets as any)[themeName] || themeName
	console.log(mainColor)
	// 获取主题配置（静态或动态）
	const colors = getThemeConfig(mainColor)

	// 应用主题
	applyThemeColors(colors)

	return colors
}

// 保持向后兼容性
export const generateMenuColors = generateDynamicColors
export const applyMenuColors = applyThemeColors
