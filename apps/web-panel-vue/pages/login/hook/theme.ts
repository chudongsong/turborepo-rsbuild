/* eslint-disable @typescript-eslint/naming-convention */
import { ColorConfig, GeneratorOptions, ColorVariables, LightLevel, DarkLevel, RgbColor } from './type'
/**
 * 颜色生成器类 - 基于面向对象的方式组织颜色生成功能
 */
export class ColorGenerator {
	private readonly defaultColors: Required<ColorConfig> = {
		primary: '#20a53a',
		success: '#67c23a',
		warning: '#f2711c',
		danger: '#db2828',
		error: '#db2828',
		info: '#909399',
	}

	private readonly lightRatios: Record<LightLevel, number> = {
		3: 0.3,
		5: 0.5,
		7: 0.7,
		8: 0.8,
		9: 0.9,
	}

	private readonly darkRatios: Record<DarkLevel, number> = {
		2: 0.2,
	}

	private readonly darkModeLightRatios: Record<LightLevel, number> = {
		3: 0.15,
		5: 0.25,
		7: 0.35,
		8: 0.45,
		9: 0.55,
	}

	private readonly darkModeDarkRatios: Record<DarkLevel, number> = {
		2: 0.3,
	}

	/**
	 * 将十六进制颜色转换为RGB值
	 * @param {string} hex - 十六进制颜色值 (如: #20a53a)
	 * @returns {object} RGB对象 {r, g, b}
	 */
	private hexToRgb(hex: string): RgbColor | null {
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
	 * 将RGB值转换为十六进制颜色
	 * @param {number} r - 红色值 (0-255)
	 * @param {number} g - 绿色值 (0-255)
	 * @param {number} b - 蓝色值 (0-255)
	 * @returns {string} 十六进制颜色值
	 */
	private rgbToHex(r: number, g: number, b: number): string {
		// eslint-disable-next-line no-bitwise
		return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
	}

	/**
	 * 混合两个颜色
	 * @param {object} color1 - 第一个颜色的RGB对象
	 * @param {object} color2 - 第二个颜色的RGB对象
	 * @param {number} ratio - 混合比例 (0-1)
	 * @returns {object} 混合后的RGB对象
	 */
	private mixColors(color1: RgbColor, color2: RgbColor, ratio: number): RgbColor {
		return {
			r: Math.round(color1.r * (1 - ratio) + color2.r * ratio),
			g: Math.round(color1.g * (1 - ratio) + color2.g * ratio),
			b: Math.round(color1.b * (1 - ratio) + color2.b * ratio),
		}
	}

	/**
	 * 生成颜色的浅色变体 (亮色模式)
	 * @param {string} baseColor - 基础颜色 (十六进制)
	 * @param {number} level - 浅色等级 (3, 5, 7, 8, 9)
	 * @returns {string} 生成的浅色十六进制值
	 */
	private generateLightColor(baseColor: string, level: LightLevel): string {
		const baseRgb = this.hexToRgb(baseColor)
		if (!baseRgb) {
			throw new Error(`Invalid color format: ${baseColor}`)
		}
		const white = { r: 255, g: 255, b: 255 }
		const mixedColor = this.mixColors(baseRgb, white, this.lightRatios[level])
		return this.rgbToHex(mixedColor.r, mixedColor.g, mixedColor.b)
	}

	/**
	 * 生成颜色的深色变体 (亮色模式)
	 * @param {string} baseColor - 基础颜色 (十六进制)
	 * @param {number} level - 深色等级 (2)
	 * @returns {string} 生成的深色十六进制值
	 */
	private generateDarkColor(baseColor: string, level: DarkLevel): string {
		const baseRgb = this.hexToRgb(baseColor)
		if (!baseRgb) {
			throw new Error(`Invalid color format: ${baseColor}`)
		}
		const black = { r: 0, g: 0, b: 0 }
		const mixedColor = this.mixColors(baseRgb, black, this.darkRatios[level])
		return this.rgbToHex(mixedColor.r, mixedColor.g, mixedColor.b)
	}

	/**
	 * 生成暗色模式的浅色变体 (实际上是更深的颜色)
	 * @param {string} baseColor - 基础颜色 (十六进制)
	 * @param {number} level - 浅色等级 (3, 5, 7, 8, 9)
	 * @returns {string} 生成的深色十六进制值
	 */
	private generateDarkModeLightColor(baseColor: string, level: LightLevel): string {
		const baseRgb = this.hexToRgb(baseColor)
		if (!baseRgb) {
			throw new Error(`Invalid color format: ${baseColor}`)
		}
		const black = { r: 0, g: 0, b: 0 }
		const mixedColor = this.mixColors(baseRgb, black, this.darkModeLightRatios[level])
		return this.rgbToHex(mixedColor.r, mixedColor.g, mixedColor.b)
	}

	/**
	 * 生成暗色模式的深色变体 (实际上是更浅的颜色)
	 * @param {string} baseColor - 基础颜色 (十六进制)
	 * @param {number} level - 深色等级 (2)
	 * @returns {string} 生成的浅色十六进制值
	 */
	private generateDarkModeDarkColor(baseColor: string, level: DarkLevel): string {
		const baseRgb = this.hexToRgb(baseColor)
		if (!baseRgb) {
			throw new Error(`Invalid color format: ${baseColor}`)
		}
		const white = { r: 255, g: 255, b: 255 }
		const mixedColor = this.mixColors(baseRgb, white, this.darkModeDarkRatios[level])
		return this.rgbToHex(mixedColor.r, mixedColor.g, mixedColor.b)
	}

	/**
	 * 根据主色生成完整的颜色变量对象
	 * @param {object} colors - 颜色配置对象
	 * @param {object} options - 选项配置
	 * @returns {object} 生成的完整颜色变量对象
	 */
	public generateColorVariables(colors: ColorConfig = {}, options: GeneratorOptions = {}): ColorVariables {
		const finalColors = { ...this.defaultColors, ...colors }
		const finalOptions = { darkMode: false, ...options }
		const variables: ColorVariables = {}

		Object.keys(finalColors).forEach(colorType => {
			const baseColor = finalColors[colorType as keyof typeof finalColors]
			if (!baseColor) return

			// 基础颜色
			variables[`--el-color-${colorType}`] = baseColor

			// 根据模式生成浅色和深色变体
			if (finalOptions.darkMode) {
				// 暗色模式：light变体是更深的颜色，dark变体是更浅的颜色
				;([3, 5, 7, 8, 9] as const).forEach(level => {
					variables[`--el-color-${colorType}-light-${level}`] = this.generateDarkModeLightColor(baseColor, level)
				})
				variables[`--el-color-${colorType}-dark-2`] = this.generateDarkModeDarkColor(baseColor, 2)
			} else {
				// 亮色模式：标准的颜色生成
				;([3, 5, 7, 8, 9] as const).forEach(level => {
					variables[`--el-color-${colorType}-light-${level}`] = this.generateLightColor(baseColor, level)
				})
				variables[`--el-color-${colorType}-dark-2`] = this.generateDarkColor(baseColor, 2)
			}
		})

		return variables
	}

	/**
	 * 应用颜色变量到CSS (已弃用，现在由StyleManager统一管理)
	 * @param {ColorVariables} _colorVariables - 颜色变量对象
	 * @deprecated 请使用StyleManager.registerColorVariables()代替
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public applyColorVariables(_colorVariables: ColorVariables): void {
		// 保留方法以保持向后兼容性，但不再直接操作DOM
		// CSS变量现在由StyleManager统一管理
		console.warn('applyColorVariables已弃用，请使用StyleManager.registerColorVariables()代替')
	}

	/**
	 * 根据主色动态生成并应用所有颜色变量
	 * @param {object} colors - 颜色配置对象
	 * @param {object} options - 选项配置
	 * @returns {object} 生成的完整颜色变量对象
	 */
	public generateAndApplyColors(colors: ColorConfig, options: GeneratorOptions = {}): ColorVariables {
		const colorVariables = this.generateColorVariables(colors, options)
		// 不再直接应用CSS变量，由调用方通过StyleManager处理
		return colorVariables
	}
}
