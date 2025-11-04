// Color-related interfaces
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

// Complete color configuration interface
interface ColorConfig {
	menuTextColor: string
	// Message colors
	menuMessageBgHoverColor: string
	menuMessageColor: string
	menuMessageBgColor: string
	menuMessageNoticeColor: string
	menuMessageNoticeBgColor: string

	// Menu bar colors
	menuSidebarBgColor: string
	menuSidebarActiveBgColor: string
	menuSidebarHoverBgColor: string
	menuSidebarTextColor: string
	menuSidebarIcoColor: string
	menuSidebarActiveShadowColor: string
	menuSidebarLeftLineColor: string

	// Menu bar icon colors
	svgStrokeColor: string
	svgInnerGradientColor1: string
	svgInnerGradientColor2: string

	// Toolbar colors
	menuToolbarBorderColor: string
	menuToolbarBgColor: string
	menuToolbarTextColor: string
	menuToolbarHoverColor: string
	menuToolbarHoverBgColor: string
}

/**
 * Convert hex color to RGB
 * @param hex - Hex color string
 * @returns RGB object or null if invalid
 */
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
 * Convert hex color to RGBA format
 * @param hex - Hex color string
 * @param alpha - Alpha value (0 to 1)
 * @returns RGBA color string, or empty string if hex is invalid
 */
export const hexToRgba = (hex: string, alpha: string | number): string => {
	const rgb = hexToRgb(hex)
	if (!rgb) {
		return ''
	}
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

// Create static theme configurations
function createStaticThemeConfigs(): Record<string, ColorConfig> {
	const configs: Record<string, ColorConfig> = {}

	// Default dark theme
	configs['#3c444d'] = {
		menuTextColor: '#ffffff',
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: '#2c3138',
		menuMessageBgColor: '#3c444d',
		menuMessageNoticeColor: '#ffffff',
		menuMessageNoticeBgColor: '#0e673d',

		menuSidebarBgColor: '#3c444d',
		menuSidebarActiveBgColor: '#2c3138',
		menuSidebarHoverBgColor: '#2c3138',
		menuSidebarTextColor: '#ffffff',
		menuSidebarIcoColor: '#bbbbbb',
		menuSidebarActiveShadowColor: '#0000001c',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		svgStrokeColor: '#bbbbbb',
		svgInnerGradientColor1: '#ffffff',
		svgInnerGradientColor2: '#cccccc',

		menuToolbarBorderColor: '#404a55',
		menuToolbarBgColor: '#2c3138',
		menuToolbarTextColor: '#bbbbbb',
		menuToolbarHoverColor: '#ffffff',
		menuToolbarHoverBgColor: '#404a55',
	}

	// Pure white theme
	configs['#ffffff'] = {
		menuTextColor: '#333333',
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: '#666666',
		menuMessageBgColor: '#ffffff',
		menuMessageNoticeColor: '#ffffff',
		menuMessageNoticeBgColor: 'var(--el-color-primary)',

		menuSidebarBgColor: '#ffffff',
		menuSidebarActiveBgColor: '#ffffff',
		menuSidebarHoverBgColor: '#ffffff',
		menuSidebarTextColor: '#333333',
		menuSidebarIcoColor: '#666666',
		menuSidebarActiveShadowColor: '#0000001c',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		svgStrokeColor: '#666666',
		svgInnerGradientColor1: 'var(--el-color-primary)',
		svgInnerGradientColor2: '#068f20',

		menuToolbarBorderColor: '#e1e4e8',
		menuToolbarBgColor: '#f8f9fa',
		menuToolbarTextColor: '#666666',
		menuToolbarHoverColor: '#333333',
		menuToolbarHoverBgColor: '#f0f0f0',
	}

	// Deep purple theme
	configs['#A736FF'] = {
		menuTextColor: '#ffffff',
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: '#8e2de2',
		menuMessageBgColor: '#A736FF',
		menuMessageNoticeColor: '#ffffff',
		menuMessageNoticeBgColor: '#0e673d',

		menuSidebarBgColor: '#A736FF',
		menuSidebarActiveBgColor: '#8e2de2',
		menuSidebarHoverBgColor: '#9333ea',
		menuSidebarTextColor: '#ffffff',
		menuSidebarIcoColor: '#e5ccff',
		menuSidebarActiveShadowColor: '#a736ff33',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		svgStrokeColor: '#e5ccff',
		svgInnerGradientColor1: '#ffffff',
		svgInnerGradientColor2: '#d1b3ff',

		menuToolbarBorderColor: '#b84eff',
		menuToolbarBgColor: '#8e2de2',
		menuToolbarTextColor: '#e5ccff',
		menuToolbarHoverColor: '#ffffff',
		menuToolbarHoverBgColor: '#9333ea',
	}

	// Dark theme
	configs['#1e2329'] = {
		menuTextColor: '#ffffff',
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: '#141821',
		menuMessageBgColor: '#1e2329',
		menuMessageNoticeColor: '#ffffff',
		menuMessageNoticeBgColor: '#0e673d',

		menuSidebarBgColor: '#1e2329',
		menuSidebarActiveBgColor: '#141821',
		menuSidebarHoverBgColor: '#1a1d24',
		menuSidebarTextColor: '#ffffff',
		menuSidebarIcoColor: '#8c9196',
		menuSidebarActiveShadowColor: '#00000026',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		svgStrokeColor: '#8c9196',
		svgInnerGradientColor1: '#ffffff',
		svgInnerGradientColor2: '#b1b5bb',

		menuToolbarBorderColor: '#2a2e37',
		menuToolbarBgColor: '#141821',
		menuToolbarTextColor: '#8c9196',
		menuToolbarHoverColor: '#ffffff',
		menuToolbarHoverBgColor: '#1a1d24',
	}

	return configs
}

// Static theme configurations
const STATIC_THEME_CONFIGS = createStaticThemeConfigs()

/**
 * Dynamically generate related colors based on menu bar main color
 * @param mainColor - Main color in hex format
 * @returns ColorConfig object with all generated colors
 */
export function generateDynamicColors(mainColor: string): ColorConfig {
	// Convert RGB to hex
	const rgbToHex = (r: number, g: number, b: number): string => {
		const rInt = Math.round(r)
		const gInt = Math.round(g)
		const bInt = Math.round(b)
		const rHex = rInt.toString(16).padStart(2, '0')
		const gHex = gInt.toString(16).padStart(2, '0')
		const bHex = bInt.toString(16).padStart(2, '0')
		return `#${rHex}${gHex}${bHex}`
	}

	// RGB to HSL
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

	// HSL to RGB
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

	// Adjust HSL values
	const adjustHsl = (color: RGB, hDelta = 0, sFactor = 1, lFactor = 1): RGB => {
		const { r, g, b } = color
		const { h, s, l } = rgbToHsl(r, g, b)

		const newH = (h + hDelta) % 1
		const newS = Math.max(0, Math.min(1, s * sFactor))
		const newL = Math.max(0, Math.min(1, l * lFactor))

		return hslToRgb(newH, newS, newL)
	}

	// Determine if it's a light theme
	const isLightTheme = (color: RGB): boolean => {
		const { r, g, b } = color
		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness > 180
	}

	// Check if background is very bright
	const isVeryBrightBg = (color: RGB): boolean => {
		const { r, g, b } = color
		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness > 230
	}

	// Parse main color
	const mainColorRgb = hexToRgb(mainColor)
	if (!mainColorRgb) {
		throw new Error('无效的颜色格式')
	}

	// Check if it's a light theme
	const isLight = isLightTheme(mainColorRgb)

	// Generate related colors
	const activeBg = isLight ? adjustHsl(mainColorRgb, 0, 1.1, 0.9) : adjustHsl(mainColorRgb, 0, 0.9, 0.75)
	const hoverBg = isLight ? adjustHsl(mainColorRgb, 0, 1.05, 0.95) : adjustHsl(mainColorRgb, 0, 0.95, 0.85)

	// Text and icon colors
	const textColor = isVeryBrightBg(mainColorRgb) ? '#333333' : '#ffffff'
	const iconColor = isVeryBrightBg(mainColorRgb) ? '#666666' : '#bbbbbb'

	// Toolbar colors
	const toolbarBg = adjustHsl(mainColorRgb, 0, 0.9, 0.8)
	const toolbarBorder = adjustHsl(mainColorRgb, 0, 0.9, 1.1)

	return {
		menuTextColor: textColor,
		menuMessageBgHoverColor: 'var(--el-color-primary)',
		menuMessageColor: rgbToHex(activeBg.r, activeBg.g, activeBg.b),
		menuMessageBgColor: mainColor,
		menuMessageNoticeColor: textColor,
		menuMessageNoticeBgColor: '#0e673d',

		menuSidebarBgColor: mainColor,
		menuSidebarActiveBgColor: rgbToHex(activeBg.r, activeBg.g, activeBg.b),
		menuSidebarHoverBgColor: rgbToHex(hoverBg.r, hoverBg.g, hoverBg.b),
		menuSidebarTextColor: textColor,
		menuSidebarIcoColor: iconColor,
		menuSidebarActiveShadowColor: isLight ? '#0000000d' : '#0000001c',
		menuSidebarLeftLineColor: 'var(--el-color-primary)',

		svgStrokeColor: iconColor,
		svgInnerGradientColor1: textColor,
		svgInnerGradientColor2: iconColor,

		menuToolbarBorderColor: rgbToHex(toolbarBorder.r, toolbarBorder.g, toolbarBorder.b),
		menuToolbarBgColor: rgbToHex(toolbarBg.r, toolbarBg.g, toolbarBg.b),
		menuToolbarTextColor: iconColor,
		menuToolbarHoverColor: textColor,
		menuToolbarHoverBgColor: rgbToHex(hoverBg.r, hoverBg.g, hoverBg.b),
	}
}

/**
 * Get theme configuration (static or dynamic)
 * @param mainColor - Main color in hex format
 * @returns Color configuration object
 */
export function getThemeConfig(mainColor: string): ColorConfig {
	// Check if it's a preset static theme
	if (STATIC_THEME_CONFIGS[mainColor]) {
		return STATIC_THEME_CONFIGS[mainColor]
	}

	// If not preset theme, generate dynamically
	return generateDynamicColors(mainColor)
}

/**
 * Apply color configuration to CSS variables
 * @param colors - Color configuration object
 */
export function applyThemeColors(colors: ColorConfig): void {
	const root = typeof document !== 'undefined' ? document.documentElement : null

	if (!root) {
		console.warn('applyThemeColors: document is not available')
		return
	}

	// Create CSS variable mapping
	const cssVariableMapping: [string, string][] = [
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

	// Apply all CSS variables
	cssVariableMapping.forEach(([property, value]) => {
		root.style.setProperty(property, value)
	})
}

/**
 * Preset theme colors
 */
export const themePresets = {
	default: '#3c444d',
	white: '#ffffff',
	purple: '#A736FF',
	dark: '#1e2329',
} as const

// Freeze the object to make it immutable
Object.freeze(themePresets)

/**
 * Switch theme
 * @param themeName - Theme name or custom color value
 * @returns Applied color configuration object
 */
export function switchTheme(themeName: string): ColorConfig {
	const mainColor = (themePresets as any)[themeName] || themeName

	const colors = getThemeConfig(mainColor)
	applyThemeColors(colors)

	return colors
}

// Backward compatibility
export const generateMenuColors = generateDynamicColors
export const applyMenuColors = applyThemeColors
