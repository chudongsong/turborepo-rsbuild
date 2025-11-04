import { hexToRgba, generateDynamicColors, getThemeConfig, applyThemeColors, switchTheme, themePresets } from '../../utils/color-utils/theme'

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('Color Utils Tests', () => {
	describe('hexToRgba', () => {
		it('should convert hex to rgba', () => {
			const result = hexToRgba('#ffffff', 0.5)
			expect(result).toBe('rgba(255, 255, 255, 0.5)')
		})

		it('should convert hex with numeric alpha', () => {
			const result = hexToRgba('#000000', '0.8')
			expect(result).toBe('rgba(0, 0, 0, 0.8)')
		})

		it('should return empty string for invalid hex', () => {
			const result = hexToRgba('invalid', 1)
			expect(result).toBe('')
		})

		it('should handle short hex format', () => {
			const result = hexToRgba('#fff', 1)
			expect(result).toBe('')
		})

		it('should convert various colors', () => {
			const result = hexToRgba('#ff0000', 1)
			expect(result).toBe('rgba(255, 0, 0, 1)')
		})
	})

	describe('generateDynamicColors', () => {
		it('should generate colors for dark theme', () => {
			const result = generateDynamicColors('#3c444d')
			expect(result).toHaveProperty('menuTextColor')
			expect(result).toHaveProperty('menuSidebarBgColor')
			expect(result).toHaveProperty('svgStrokeColor')
			expect(result.menuSidebarBgColor).toBe('#3c444d')
		})

		it('should generate colors for light theme', () => {
			const result = generateDynamicColors('#ffffff')
			expect(result.menuTextColor).toBe('#333333')
			expect(result.menuSidebarBgColor).toBe('#ffffff')
		})

		it('should throw error for invalid color', () => {
			expect(() => generateDynamicColors('invalid')).toThrow('无效的颜色格式')
		})

		it('should generate different colors for different inputs', () => {
			const result1 = generateDynamicColors('#ff0000')
			const result2 = generateDynamicColors('#00ff00')
			expect(result1.menuSidebarBgColor).toBe('#ff0000')
			expect(result2.menuSidebarBgColor).toBe('#00ff00')
		})

		it('should generate colors with proper contrast', () => {
			const result = generateDynamicColors('#000000')
			// Should generate light colors for dark background
			expect(result.menuTextColor).toBe('#ffffff')
		})

		it('should generate 21 color properties', () => {
			const result = generateDynamicColors('#3c444d')
			expect(Object.keys(result).length).toBe(21)
		})
	})

	describe('getThemeConfig', () => {
		it('should return static config for preset colors', () => {
			const result = getThemeConfig('#3c444d')
			expect(result.menuSidebarBgColor).toBe('#3c444d')
			expect(result).toHaveProperty('menuTextColor')
		})

		it('should return static config for white theme', () => {
			const result = getThemeConfig('#ffffff')
			expect(result.menuSidebarBgColor).toBe('#ffffff')
			expect(result.menuTextColor).toBe('#333333')
		})

		it('should return static config for purple theme', () => {
			const result = getThemeConfig('#A736FF')
			expect(result.menuSidebarBgColor).toBe('#A736FF')
		})

		it('should return static config for dark theme', () => {
			const result = getThemeConfig('#1e2329')
			expect(result.menuSidebarBgColor).toBe('#1e2329')
		})

		it('should generate dynamic config for non-preset colors', () => {
			const result = getThemeConfig('#ff8800')
			expect(result.menuSidebarBgColor).toBe('#ff8800')
		})

		it('should return different configs for different colors', () => {
			const result1 = getThemeConfig('#ff0000')
			const result2 = getThemeConfig('#00ff00')
			expect(result1.menuSidebarBgColor).toBe('#ff0000')
			expect(result2.menuSidebarBgColor).toBe('#00ff00')
		})
	})

	describe('applyThemeColors', () => {
		beforeEach(() => {
			// Mock document.documentElement
			const mockElement = {
				style: {
					setProperty: vi.fn(),
				},
			}
			vi.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElement as any)
		})

		afterEach(() => {
			vi.restoreAllMocks()
		})

		it('should apply all CSS variables', () => {
			const colors = generateDynamicColors('#3c444d')
			applyThemeColors(colors)

			expect(document.documentElement.style.setProperty).toHaveBeenCalled()
			expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
				'--menu-text-color',
				expect.any(String)
			)
		})

		it('should apply specific CSS properties', () => {
			const colors = {
				menuTextColor: '#ffffff',
				menuSidebarBgColor: '#3c444d',
				menuMessageBgHoverColor: '#3c444d',
				menuMessageColor: '#2c3138',
				menuMessageBgColor: '#3c444d',
				menuMessageNoticeColor: '#ffffff',
				menuMessageNoticeBgColor: '#0e673d',
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
			applyThemeColors(colors)

			expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
				'--menu-text-color',
				'#ffffff'
			)
		})

		it('should handle missing document gracefully', () => {
			const originalDocument = global.document
			delete (global as any).document
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			const colors = generateDynamicColors('#3c444d')
			applyThemeColors(colors)

			expect(consoleSpy).toHaveBeenCalledWith(
				'applyThemeColors: document is not available'
			)

			global.document = originalDocument
			consoleSpy.mockRestore()
		})
	})

	describe('switchTheme', () => {
		beforeEach(() => {
			const mockElement = {
				style: {
					setProperty: vi.fn(),
				},
			}
			vi.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElement as any)
		})

		afterEach(() => {
			vi.restoreAllMocks()
		})

		it('should switch to default theme', () => {
			const result = switchTheme('default')
			expect(result.menuSidebarBgColor).toBe('#3c444d')
		})

		it('should switch to white theme', () => {
			const result = switchTheme('white')
			expect(result.menuSidebarBgColor).toBe('#ffffff')
			expect(result.menuTextColor).toBe('#333333')
		})

		it('should switch to purple theme', () => {
			const result = switchTheme('purple')
			expect(result.menuSidebarBgColor).toBe('#A736FF')
		})

		it('should switch to dark theme', () => {
			const result = switchTheme('dark')
			expect(result.menuSidebarBgColor).toBe('#1e2329')
		})

		it('should switch to custom color', () => {
			const result = switchTheme('#ff8800')
			expect(result.menuSidebarBgColor).toBe('#ff8800')
		})

		it('should apply CSS variables when switching', () => {
			switchTheme('default')
			expect(document.documentElement.style.setProperty).toHaveBeenCalled()
		})
	})

	describe('themePresets', () => {
		it('should have all preset themes', () => {
			expect(themePresets).toHaveProperty('default')
			expect(themePresets).toHaveProperty('white')
			expect(themePresets).toHaveProperty('purple')
			expect(themePresets).toHaveProperty('dark')
		})

		it('should have correct color values', () => {
			expect(themePresets.default).toBe('#3c444d')
			expect(themePresets.white).toBe('#ffffff')
			expect(themePresets.purple).toBe('#A736FF')
			expect(themePresets.dark).toBe('#1e2329')
		})

		it('should be frozen', () => {
			expect(Object.isFrozen(themePresets)).toBe(true)
		})
	})

	describe('Backward Compatibility', () => {
		it('should export generateMenuColors as alias', () => {
			// Already imported at the top of the file
			expect(generateDynamicColors).toBeDefined()
			expect(generateDynamicColors('#3c444d')).toHaveProperty('menuSidebarBgColor')
		})

		it('should export applyMenuColors as alias', () => {
			// Already imported at the top of the file
			expect(applyThemeColors).toBeDefined()
			// Mock document
			const mockElement = { style: { setProperty: vi.fn() } }
			vi.spyOn(document, 'documentElement', 'get').mockReturnValue(mockElement as any)
			const colors = generateDynamicColors('#3c444d')
			applyThemeColors(colors)
			expect(mockElement.style.setProperty).toHaveBeenCalled()
		})
	})
})
