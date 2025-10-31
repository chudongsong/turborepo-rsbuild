/* eslint-disable @typescript-eslint/naming-convention */
/**
 * 主题配置工具 - 性能优化版
 * 实现颜色格式转换、主色调处理和CSS变量处理功能
 * 函数式实现，支持RGB和HEX导出格式
 * 集成VueUse工具库实现动态主题管理
 * 优化版本：添加缓存机制，减少重复计算，提升性能
 */

import { useGlobalStore } from '@/store/global'
import { useStyleTag } from '@vueuse/core'
import type { Ref } from 'vue'
import type { Theme } from '@/types/theme'
import { getWorkerManager } from './worker-manager'

// ===== Worker 配置 =====

// 是否启用 Worker 模式
let workerEnabled = true

// Worker 降级标志
let workerFallback = false

// 启用/禁用 Worker 模式

export function enableWorkerMode(enabled: boolean = true): void {
	workerEnabled = enabled
}

// 检查 Worker 是否可用
export function isWorkerEnabled(): boolean {
	return workerEnabled && !workerFallback && typeof Worker !== 'undefined'
}

// Worker 降级处理
function handleWorkerFallback(): void {
	if (!workerFallback) {
		console.warn('Worker mode disabled, falling back to main thread')
		workerFallback = true
	}
}

// ===== 性能优化：缓存机制 =====

// 颜色转换缓存
const colorConversionCache = new Map<string, any>()
const colorScaleCache = new Map<string, any>()
const colorAnalysisCache = new Map<string, any>()

// 缓存大小限制，防止内存泄漏
const MAX_CACHE_SIZE = 500

// 清理缓存函数
function clearCacheIfNeeded(cache: Map<string, any>) {
	if (cache.size > MAX_CACHE_SIZE) {
		// 清理最旧的一半缓存
		const entries = Array.from(cache.entries())
		const toDelete = entries.slice(0, Math.floor(entries.length / 2))
		toDelete.forEach(([key]) => cache.delete(key))
	}
}

// 性能监控
const performanceEnabled = false
const performanceMetrics = new Map<string, { count: number; totalTime: number }>()

function measurePerformance<T>(name: string, fn: () => T): T {
	if (!performanceEnabled) return fn()

	const start = performance.now()
	const result = fn()
	const end = performance.now()

	const metric = performanceMetrics.get(name) || { count: 0, totalTime: 0 }
	metric.count++
	metric.totalTime += end - start
	performanceMetrics.set(name, metric)

	return result
}

// 导出性能工具
// export function enablePerformanceMonitoring(enabled: boolean = true) {
// 	performanceEnabled = enabled
// }

// 导出性能工具
// export function getPerformanceMetrics() {
// 	const metrics: Record<string, { count: number; avgTime: number; totalTime: number }> = {}
// 	performanceMetrics.forEach((value, key) => {
// 		metrics[key] = {
// 			count: value.count,
// 			totalTime: value.totalTime,
// 			avgTime: value.totalTime / value.count,
// 		}
// 	})
// 	return metrics
// }

export function clearPerformanceMetrics() {
	performanceMetrics.clear()
}

// 清理所有缓存的函数
// export function clearAllCaches() {
// 	colorConversionCache.clear()
// 	colorScaleCache.clear()
// 	colorAnalysisCache.clear()
// }

// 颜色相关接口定义
export interface RGB {
	r: number
	g: number
	b: number
}

export interface HSL {
	h: number
	s: number
	l: number
}

// 色阶配置接口 - HEX格式
export interface ColorScale {
	base: string // 基础色
	light3: string // 浅色调-3
	light5: string // 浅色调-5
	light7: string // 浅色调-7
	light8: string // 浅色调-8
	light9: string // 浅色调-9
	dark2: string // 暗色调-2
}

// 色阶配置接口 - RGB格式
export interface ColorScaleRGB {
	base: RGB // 基础色
	light3: RGB // 浅色调-3
	light5: RGB // 浅色调-5
	light7: RGB // 浅色调-7
	light8: RGB // 浅色调-8
	light9: RGB // 浅色调-9
	dark2: RGB // 暗色调-2
}

// 导出格式类型
export type ColorFormat = 'hex' | 'rgb'

// 颜色输入格式类型
export type ColorInput = string | RGB | HSL

// 主题模式类型
export type ThemeMode = 'light' | 'dark' | 'auto'

// 默认主题色
export const DEFAULT_PRIMARY_COLOR = '#20a53a'

// 默认色阶配置 - 亮色模式
export const DEFAULT_LIGHT_COLOR_SCALE: ColorScale = {
	base: '#20a53a',
	light3: '#63c075',
	light5: '#90d29d',
	light7: '#bce4c4',
	light8: '#d2edd8',
	light9: '#e9f6eb',
	dark2: '#1a842e',
}

// 默认色阶配置 - 暗色模式
export const DEFAULT_DARK_COLOR_SCALE: ColorScale = {
	base: '#1e7e34',
	light3: '#1c7a2f',
	light5: '#1a5d27',
	light7: '#18401f',
	light8: '#16311c',
	light9: '#152318',
	dark2: '#4db761',
}

// WCAG对比度等级
export type WCAGLevel = 'AA' | 'AAA'

// 圆角尺寸类型
export type BorderRadiusSize = 'none' | 'small' | 'medium' | 'large'

// 透明度级别类型
export type OpacityLevel = 'low' | 'medium' | 'high' | 'custom'

// 文件上传配置接口
export interface UploadConfig {
	action: string
	headers?: Record<string, string>
	data?: Record<string, any>
	beforeUpload?: (file: File) => boolean | Promise<boolean>
	onSuccess?: (response: any, file: File) => void
	onError?: (error: any, file: File) => void
}

// CSS变量管理器接口
export interface CSSVariableManager {
	variables: Map<string, string>
	mountedVariables: Set<string>
	target: HTMLElement
}

// 主题管理器配置接口
export interface ThemeManagerConfig {
	prefix?: string // CSS变量前缀
	format?: ColorFormat // 颜色格式
	target?: HTMLElement // 目标元素
	autoInject?: boolean // 是否自动注入样式
}

// 主题状态接口
export interface ThemeState {
	primaryColor: string
	colorScale: ColorScale | ColorScaleRGB
	cssVariables: Record<string, string>
	isActive: boolean
}

// 样式标签管理器接口
export interface StyleTagManager {
	id: string
	css: Ref<string>
	load: () => void
	unload: () => void
	isLoaded: Ref<boolean>
}

// 样式标签配置接口
export interface StyleTagConfig {
	id?: string
	media?: string
	immediate?: boolean
	manual?: boolean
}

// 智能主题配置接口
export interface SmartThemeConfig {
	mode?: ThemeMode // 主题模式
	wcagLevel?: WCAGLevel // WCAG对比度等级
	autoAdjust?: boolean // 是否自动调整颜色
	preserveHue?: boolean // 是否保持色相
	minContrast?: number // 最小对比度比例
}

// 颜色分析结果接口
export interface ColorAnalysis {
	isLight: boolean // 是否为浅色
	luminance: number // 相对亮度
	contrast: number // 与白色的对比度
	wcagAA: boolean // 是否符合WCAG AA标准
	wcagAAA: boolean // 是否符合WCAG AAA标准
}

// ===== 颜色格式转换函数 =====

/**
 * HEX颜色码转换为RGB格式 - 优化版
 * @param {string} hex - 十六进制颜色字符串 (例如: "#RRGGBB" 或 "RRGGBB")
 * @returns {RGB | null} RGB对象，如果格式无效则返回null
 */
export function hexToRgb(hex: string): RGB | null {
	return measurePerformance('hexToRgb', () => {
		const cacheKey = `hexToRgb:${hex}`

		// 检查缓存
		if (colorConversionCache.has(cacheKey)) {
			return colorConversionCache.get(cacheKey)
		}

		// 移除可能的 # 前缀
		const cleanHex = hex.replace('#', '')

		// 验证格式
		if (!/^[a-fA-F0-9]{6}$/.test(cleanHex)) {
			colorConversionCache.set(cacheKey, null)
			return null
		}

		const result = {
			r: parseInt(cleanHex.slice(0, 2), 16),
			g: parseInt(cleanHex.slice(2, 4), 16),
			b: parseInt(cleanHex.slice(4, 6), 16),
		}

		// 缓存结果
		clearCacheIfNeeded(colorConversionCache)
		colorConversionCache.set(cacheKey, result)

		return result
	})
}

/**
 * RGB颜色值转换为HEX格式 - 优化版
 * @param {number} r - 红色分量 (0-255)
 * @param {number} g - 绿色分量 (0-255)
 * @param {number} b - 蓝色分量 (0-255)
 * @returns {string} 十六进制颜色字符串
 */
export function rgbToHex(r: number, g: number, b: number): string {
	return measurePerformance('rgbToHex', () => {
		const cacheKey = `rgbToHex:${r},${g},${b}`

		// 检查缓存
		if (colorConversionCache.has(cacheKey)) {
			return colorConversionCache.get(cacheKey)
		}

		// 确保值在有效范围内 - 优化版本
		const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

		const rHex = clamp(r).toString(16).padStart(2, '0')
		const gHex = clamp(g).toString(16).padStart(2, '0')
		const bHex = clamp(b).toString(16).padStart(2, '0')

		const result = `#${rHex}${gHex}${bHex}`

		// 缓存结果
		clearCacheIfNeeded(colorConversionCache)
		colorConversionCache.set(cacheKey, result)

		return result
	})
}

/**
 * RGB对象转换为HEX格式
 * @param {RGB} rgb - RGB对象
 * @returns {string} 十六进制颜色字符串
 */
export function rgbObjectToHex(rgb: RGB): string {
	return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * RGB转HSL - 优化版
 * @param {number} r - 红色分量 (0-255)
 * @param {number} g - 绿色分量 (0-255)
 * @param {number} b - 蓝色分量 (0-255)
 * @returns {HSL} HSL对象
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
	return measurePerformance('rgbToHsl', () => {
		const cacheKey = `rgbToHsl:${r},${g},${b}`

		// 检查缓存
		if (colorConversionCache.has(cacheKey)) {
			return colorConversionCache.get(cacheKey)
		}

		// 优化：预计算常用值
		const rNorm = r / 255
		const gNorm = g / 255
		const bNorm = b / 255

		const max = Math.max(rNorm, gNorm, bNorm)
		const min = Math.min(rNorm, gNorm, bNorm)
		let h = 0
		let s = 0
		const l = (max + min) / 2

		if (max !== min) {
			const d = max - min
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

			switch (max) {
				case rNorm:
					h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
					break
				case gNorm:
					h = (bNorm - rNorm) / d + 2
					break
				case bNorm:
					h = (rNorm - gNorm) / d + 4
					break
			}
			h /= 6
		}

		const result = { h, s, l }

		// 缓存结果
		clearCacheIfNeeded(colorConversionCache)
		colorConversionCache.set(cacheKey, result)

		return result
	})
}

/**
 * HSL转RGB - 优化版
 * @param {number} h - 色相 (0-1)
 * @param {number} s - 饱和度 (0-1)
 * @param {number} l - 亮度 (0-1)
 * @returns {RGB} RGB对象
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
	return measurePerformance('hslToRgb', () => {
		const cacheKey = `hslToRgb:${h.toFixed(3)},${s.toFixed(3)},${l.toFixed(3)}`

		// 检查缓存
		if (colorConversionCache.has(cacheKey)) {
			return colorConversionCache.get(cacheKey)
		}

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

		const result = {
			r: Math.round(r * 255),
			g: Math.round(g * 255),
			b: Math.round(b * 255),
		}

		// 缓存结果
		clearCacheIfNeeded(colorConversionCache)
		colorConversionCache.set(cacheKey, result)

		return result
	})
}

// ===== 主色调处理函数 =====

/**
 * 智能调整颜色亮度以确保WCAG合规性
 * @param {RGB} rgb - 原始RGB颜色
 * @param {number} targetLuminance - 目标亮度 (0-1)
 * @param {boolean} preserveHue - 是否保持色相
 * @returns {RGB} 调整后的RGB颜色
 */
export function adjustColorForWCAG(rgb: RGB, targetLuminance: number, preserveHue: boolean = true): RGB {
	if (!preserveHue) {
		// 简单的亮度调整
		const currentLuminance = calculateLuminance(rgb)
		const factor = targetLuminance / currentLuminance
		return {
			r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
			g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
			b: Math.min(255, Math.max(0, Math.round(rgb.b * factor))),
		}
	}

	// 保持色相的HSL调整
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
	const currentLuminance = calculateLuminance(rgb)

	// 二分查找最佳亮度值
	let low = 0
	let high = 1
	let bestL = hsl.l
	let bestDiff = Math.abs(currentLuminance - targetLuminance)

	for (let i = 0; i < 20; i++) {
		// 最多迭代20次
		const midL = (low + high) / 2
		const testRgb = hslToRgb(hsl.h, hsl.s, midL)
		const testLuminance = calculateLuminance(testRgb)
		const diff = Math.abs(testLuminance - targetLuminance)

		if (diff < bestDiff) {
			bestDiff = diff
			bestL = midL
		}

		if (testLuminance < targetLuminance) {
			low = midL
		} else {
			high = midL
		}

		if (diff < 0.001) break // 足够接近
	}

	return hslToRgb(hsl.h, hsl.s, bestL)
}

/**
 * 检查是否为默认主题色
 * @param {ColorInput} primaryColor - 主色调
 * @returns {boolean} 是否为默认色
 */
export function isDefaultPrimaryColor(primaryColor: ColorInput): boolean {
	const normalizedColor = typeof primaryColor === 'string' ? primaryColor.toLowerCase() : rgbObjectToHex(normalizeColorInput(primaryColor)!).toLowerCase()
	return normalizedColor === DEFAULT_PRIMARY_COLOR.toLowerCase()
}

/**
 * 根据主题模式生成标准色阶 - 性能优化版
 * 改进的算法确保色阶过渡更自然，符合视觉设计规范
 * 支持智能亮度调整和饱和度优化
 * @param {ColorInput} primaryColor - 主色调
 * @param {ThemeMode} mode - 主题模式
 * @returns {ColorScale} 完整的色阶配置
 */
export function generateStandardColorScale(primaryColor: ColorInput, mode: ThemeMode = 'light'): ColorScale {
	return measurePerformance('generateStandardColorScale', () => {
		const cacheKey = `standardColorScale:${JSON.stringify(primaryColor)},${mode}`

		// 检查缓存
		if (colorScaleCache.has(cacheKey)) {
			return colorScaleCache.get(cacheKey)
		}

		// 检查是否为默认色，如果是则直接返回预设的色阶
		if (isDefaultPrimaryColor(primaryColor)) {
			const result = mode === 'dark' ? DEFAULT_DARK_COLOR_SCALE : DEFAULT_LIGHT_COLOR_SCALE
			colorScaleCache.set(cacheKey, result)
			return result
		}

		const rgb = normalizeColorInput(primaryColor)
		if (!rgb) {
			throw new Error('无效的颜色格式')
		}

		const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
		const baseHex = rgbObjectToHex(rgb)
		const analysis = analyzeColor(rgb)!

		if (mode === 'dark') {
			// 暗色模式：优化的深色变体生成算法
			const generateDarkModeColor = (level: number): string => {
				// 优化的暗色因子，确保更平滑的过渡
				const darkFactors: Record<string, number> = {
					level3: 0.12, // 减少12%亮度，更温和的过渡
					level5: 0.28, // 减少28%亮度
					level7: 0.45, // 减少45%亮度
					level8: 0.58, // 减少58%亮度
					level9: 0.72, // 减少72%亮度
				}

				const factor = darkFactors[`level${level}`] || 0.5

				// 智能亮度调整：根据原始亮度动态调整
				const baseLuminance = analysis.luminance
				const adjustedFactor = factor * (0.8 + baseLuminance * 0.4) // 亮色调整更多，暗色调整较少

				const newL = Math.max(0.08, hsl.l * (1 - adjustedFactor))

				// 智能饱和度调整：保持色彩鲜活度
				const saturationBoost = Math.min(0.15, factor * 0.12)
				const newS = Math.min(1, hsl.s * (1 + saturationBoost))

				const newRgb = hslToRgb(hsl.h, newS, newL)
				return rgbObjectToHex(newRgb)
			}

			// 暗色模式的dark2变体：优化的高亮色生成
			const generateDarkModeDark2 = (): string => {
				// 根据原始颜色亮度智能调整增亮程度
				const brightnessBoost = analysis.isLight ? 0.35 : 0.5
				const newL = Math.min(0.92, hsl.l + (1 - hsl.l) * brightnessBoost)

				// 适度降低饱和度，避免过于刺眼
				const newS = Math.max(0.15, hsl.s * 0.85)

				const newRgb = hslToRgb(hsl.h, newS, newL)
				return rgbObjectToHex(newRgb)
			}

			const result = {
				base: baseHex,
				light3: generateDarkModeColor(3),
				light5: generateDarkModeColor(5),
				light7: generateDarkModeColor(7),
				light8: generateDarkModeColor(8),
				light9: generateDarkModeColor(9),
				dark2: generateDarkModeDark2(),
			}

			colorScaleCache.set(cacheKey, result)
			clearCacheIfNeeded(colorScaleCache)
			return result
		}

		// 亮色模式：优化的浅色调生成算法
		const generateLightModeColor = (level: number): string => {
			// 优化的亮色因子，确保更自然的渐变
			const lightFactors: Record<string, number> = {
				level3: 0.25, // 25%的亮度提升
				level5: 0.45, // 45%的亮度提升
				level7: 0.65, // 65%的亮度提升
				level8: 0.78, // 78%的亮度提升
				level9: 0.88, // 88%的亮度提升
			}

			const factor = lightFactors[`level${level}`] || 0.5

			// 智能亮度调整：根据原始亮度和目标级别动态调整
			const baseLuminance = analysis.luminance
			const adjustedFactor = factor * (0.9 + (1 - baseLuminance) * 0.2) // 暗色提升更多，亮色提升适中

			const newL = Math.min(0.98, hsl.l + (1 - hsl.l) * adjustedFactor)

			// 智能饱和度调整：随着亮度增加逐渐降低饱和度
			const saturationReduction = Math.min(0.5, factor * 0.45)
			const newS = Math.max(0.05, hsl.s * (1 - saturationReduction))

			const newRgb = hslToRgb(hsl.h, newS, newL)
			return rgbObjectToHex(newRgb)
		}

		// 亮色模式的dark2变体：优化的深色生成
		const generateLightModeDark2 = (): string => {
			// 根据原始颜色特性智能调整深色程度
			const darknessFactor = analysis.isLight ? 0.25 : 0.18
			const newL = Math.max(0.05, hsl.l * (1 - darknessFactor))

			// 适度增加饱和度，增强深色的表现力
			const saturationBoost = Math.min(0.15, darknessFactor * 0.6)
			const newS = Math.min(1, hsl.s * (1 + saturationBoost))

			const newRgb = hslToRgb(hsl.h, newS, newL)
			return rgbObjectToHex(newRgb)
		}

		const result = {
			base: baseHex,
			light3: generateLightModeColor(3),
			light5: generateLightModeColor(5),
			light7: generateLightModeColor(7),
			light8: generateLightModeColor(8),
			light9: generateLightModeColor(9),
			dark2: generateLightModeDark2(),
		}

		colorScaleCache.set(cacheKey, result)
		clearCacheIfNeeded(colorScaleCache)
		return result
	})
}

/**
 * 智能生成色阶 - 全面优化版
 * 根据输入颜色的明暗自动调整，支持高级色彩理论和视觉设计规范
 * 集成WCAG无障碍标准，确保生成的色阶具有良好的可访问性
 * @param {ColorInput} primaryColor - 主色调
 * @param {SmartThemeConfig} config - 智能主题配置
 * @returns {ColorScale} 完整的色阶配置
 */
export function generateSmartColorScale(primaryColor: ColorInput, config: SmartThemeConfig = {}): ColorScale {
	return measurePerformance('generateSmartColorScale', () => {
		const cacheKey = `smartColorScale:${JSON.stringify(primaryColor)},${JSON.stringify(config)}`

		// 检查缓存
		if (colorScaleCache.has(cacheKey)) {
			return colorScaleCache.get(cacheKey)
		}

		const { mode = 'auto', autoAdjust = true, preserveHue = true } = config
		const rgb = normalizeColorInput(primaryColor)
		if (!rgb) {
			throw new Error('无效的颜色格式')
		}

		const analysis = analyzeColor(rgb)!
		const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
		const baseHex = rgbObjectToHex(rgb)

		// 智能模式判断：基于颜色分析和用户配置
		let shouldGenerateDarkVariants = false
		const shouldOptimizeContrast = autoAdjust

		if (mode === 'auto') {
			// 自动模式：根据颜色亮度和饱和度智能判断
			shouldGenerateDarkVariants = analysis.isLight && analysis.luminance > 0.6
		} else if (mode === 'dark') {
			shouldGenerateDarkVariants = true
		} else {
			shouldGenerateDarkVariants = false
		}

		// 优化的浅色调生成函数
		const generateLightColor = (level: number): string => {
			// 基于色彩理论的渐变因子
			const lightFactors: Record<string, number> = {
				level3: 0.22, // 22%的渐变强度
				level5: 0.42, // 42%的渐变强度
				level7: 0.62, // 62%的渐变强度
				level8: 0.75, // 75%的渐变强度
				level9: 0.86, // 86%的渐变强度
			}

			const baseFactor = lightFactors[`level${level}`] || 0.5

			if (shouldGenerateDarkVariants && autoAdjust) {
				// 为亮色生成深色变体：智能暗化算法
				const luminanceWeight = Math.min(1, analysis.luminance * 1.2)
				const adjustedFactor = baseFactor * (0.7 + luminanceWeight * 0.4)

				// 智能亮度调整：保持视觉层次
				const newL = Math.max(0.06, hsl.l * (1 - adjustedFactor))

				// 动态饱和度调整：增强深色的表现力
				const saturationBoost = Math.min(0.18, baseFactor * 0.15 + (1 - analysis.luminance) * 0.1)
				const newS = Math.min(0.95, hsl.s * (1 + saturationBoost))

				let newRgb = hslToRgb(hsl.h, newS, newL)

				// WCAG合规性检查和调整
				if (shouldOptimizeContrast) {
					const targetLuminance = Math.max(0.05, analysis.luminance * (1 - adjustedFactor * 0.8))
					newRgb = adjustColorForWCAG(newRgb, targetLuminance, preserveHue)
				}

				return rgbObjectToHex(newRgb)
			}

			// 标准亮色调生成：优化的渐变算法
			const luminanceBonus = (1 - analysis.luminance) * 0.15 // 暗色获得更多提升
			const adjustedFactor = baseFactor * (0.85 + luminanceBonus)

			const newL = Math.min(0.97, hsl.l + (1 - hsl.l) * adjustedFactor)

			// 智能饱和度衰减：确保高亮度下的视觉舒适性
			const saturationDecay = Math.min(0.55, baseFactor * 0.48 + analysis.luminance * 0.1)
			const newS = Math.max(0.08, hsl.s * (1 - saturationDecay))

			const newRgb = hslToRgb(hsl.h, newS, newL)
			return rgbObjectToHex(newRgb)
		}

		// 优化的暗色调生成函数
		const generateDarkColor = (): string => {
			if (shouldGenerateDarkVariants && autoAdjust) {
				// 为亮色生成深色变体：高级暗化算法
				const baseDarkFactor = 0.55
				const luminanceWeight = Math.max(0.3, analysis.luminance)
				const adjustedDarkFactor = baseDarkFactor * (0.8 + luminanceWeight * 0.4)

				const newL = Math.max(0.04, hsl.l * (1 - adjustedDarkFactor))

				// 增强饱和度以保持色彩识别度
				const saturationEnhancement = Math.min(0.25, adjustedDarkFactor * 0.2 + (1 - analysis.luminance) * 0.15)
				const newS = Math.min(0.98, hsl.s * (1 + saturationEnhancement))

				let newRgb = hslToRgb(hsl.h, newS, newL)

				// WCAG合规性优化
				if (shouldOptimizeContrast) {
					const targetLuminance = Math.max(0.03, analysis.luminance * 0.25)
					newRgb = adjustColorForWCAG(newRgb, targetLuminance, preserveHue)
				}

				return rgbObjectToHex(newRgb)
			}

			// 标准暗色调生成：平衡的深化算法
			const baseDarkFactor = analysis.isLight ? 0.28 : 0.2
			const newL = Math.max(0.02, hsl.l * (1 - baseDarkFactor))

			// 适度增强饱和度
			const saturationBoost = Math.min(0.12, baseDarkFactor * 0.5)
			const newS = Math.min(0.95, hsl.s * (1 + saturationBoost))

			const newRgb = hslToRgb(hsl.h, newS, newL)
			return rgbObjectToHex(newRgb)
		}

		const result = {
			base: baseHex,
			light3: generateLightColor(3),
			light5: generateLightColor(5),
			light7: generateLightColor(7),
			light8: generateLightColor(8),
			light9: generateLightColor(9),
			dark2: generateDarkColor(),
		}

		colorScaleCache.set(cacheKey, result)
		clearCacheIfNeeded(colorScaleCache)
		return result
	})
}

/**
 * 根据主色调生成完整的色阶 (HEX格式) - 增强版
 * 支持多种颜色格式输入和智能主题模式
 * @param {ColorInput} primaryColor - 主色调
 * @param {SmartThemeConfig} config - 智能主题配置
 * @returns {ColorScale} 完整的色阶配置
 */
export function generateColorScale(primaryColor: ColorInput, config: SmartThemeConfig = {}): ColorScale {
	// 优先使用标准色阶生成，支持默认色特殊处理
	if (config.mode === 'light' || config.mode === 'dark') {
		return generateStandardColorScale(primaryColor, config.mode)
	}

	// 如果没有特殊配置，使用标准亮色模式
	if (Object.keys(config).length === 0) {
		return generateStandardColorScale(primaryColor, 'light')
	}

	// 使用智能色阶生成
	return generateSmartColorScale(primaryColor, config)
}

/**
 * 异步生成色阶 - Worker版本
 * 使用Web Worker处理性能密集型计算，避免阻塞主线程
 * @param {ColorInput} primaryColor - 主色调
 * @param {SmartThemeConfig} config - 智能主题配置
 * @returns {Promise<ColorScale>} 异步返回完整色阶配置
 */
export async function generateColorScaleAsync(primaryColor: ColorInput, config: SmartThemeConfig = {}): Promise<ColorScale> {
	// 检查Worker是否可用
	if (!isWorkerEnabled()) {
		handleWorkerFallback()
		// 降级到主线程处理
		return generateColorScale(primaryColor, config)
	}

	try {
		// 标准化颜色输入
		const normalizedColor = typeof primaryColor === 'string' ? primaryColor : rgbObjectToHex(primaryColor as RGB)

		// 使用Worker处理
		const workerManager = getWorkerManager()
		const result = await workerManager.generateColorScale(normalizedColor, config)

		return result
	} catch (error) {
		console.warn('Worker color scale generation failed, falling back to main thread:', error)
		handleWorkerFallback()
		// 降级到主线程处理
		return generateColorScale(primaryColor, config)
	}
}

/**
 * 根据主色调生成完整的色阶 (RGB格式) - 增强版
 * 支持多种颜色格式输入和智能主题模式
 * @param {ColorInput} primaryColor - 主色调
 * @param {SmartThemeConfig} config - 智能主题配置
 * @returns {ColorScaleRGB} RGB格式的完整色阶配置
 */
export function generateColorScaleRGB(primaryColor: ColorInput, config: SmartThemeConfig = {}): ColorScaleRGB {
	const hexScale = generateColorScale(primaryColor, config)

	return {
		base: hexToRgb(hexScale.base)!,
		light3: hexToRgb(hexScale.light3)!,
		light5: hexToRgb(hexScale.light5)!,
		light7: hexToRgb(hexScale.light7)!,
		light8: hexToRgb(hexScale.light8)!,
		light9: hexToRgb(hexScale.light9)!,
		dark2: hexToRgb(hexScale.dark2)!,
	}
}

/**
 * 根据指定格式生成色阶 - 增强版
 * 支持多种颜色格式输入和智能主题模式
 * @param {ColorInput} primaryColor - 主色调
 * @param {ColorFormat} format - 导出格式 ('hex' | 'rgb')
 * @param {SmartThemeConfig} config - 智能主题配置
 * @returns {T extends 'hex' ? ColorScale : ColorScaleRGB} 指定格式的色阶配置
 */
export function generateColorScaleWithFormat<T extends ColorFormat>(primaryColor: ColorInput, format: T, config: SmartThemeConfig = {}): T extends 'hex' ? ColorScale : ColorScaleRGB {
	if (format === 'hex') {
		return generateColorScale(primaryColor, config) as any
	}
	return generateColorScaleRGB(primaryColor, config) as any
}

// ===== 便捷的智能主题函数 =====

/**
 * 此函数未被使用
 * 为亮色主题生成暗色变体
 * 当输入颜色为亮色时，生成对应的暗色色阶
 * @param {ColorInput} primaryColor - 主色调
 * @param {Partial<SmartThemeConfig>} options - 配置选项
 * @returns {ColorScale} 暗色主题色阶配置
 */
export function generateDarkThemeFromLight(primaryColor: ColorInput, options: Partial<SmartThemeConfig> = {}): ColorScale {
	const analysis = analyzeColor(primaryColor)
	if (!analysis) {
		throw new Error('无效的颜色格式')
	}

	// 如果输入的是暗色，直接返回标准色阶
	if (!analysis.isLight) {
		return generateColorScale(primaryColor, { mode: 'light', ...options })
	}

	// 为亮色生成暗色变体
	return generateSmartColorScale(primaryColor, {
		mode: 'dark',
		autoAdjust: true,
		preserveHue: true,
		...options,
	})
}

/**
 * 此函数未被使用
 * 自动生成适应性主题色阶
 * 根据输入颜色的明暗自动判断并生成最佳色阶
 * @param {ColorInput} primaryColor - 主色调
 * @param {Partial<SmartThemeConfig>} options - 配置选项
 * @returns {ColorScale} 自适应色阶配置
 */
export function generateAdaptiveColorScale(primaryColor: ColorInput, options: Partial<SmartThemeConfig> = {}): ColorScale {
	return generateSmartColorScale(primaryColor, {
		mode: 'auto',
		autoAdjust: true,
		preserveHue: true,
		...options,
	})
}

/**
 * 此函数未被使用
 * 生成符合WCAG标准的主题色阶
 * 确保生成的色阶符合指定的WCAG对比度标准
 * @param {ColorInput} primaryColor - 主色调
 * @param {WCAGLevel} wcagLevel - WCAG标准等级
 * @param {Partial<SmartThemeConfig>} options - 配置选项
 * @returns {ColorScale} 符合WCAG标准的色阶配置
 */
export function generateWCAGCompliantColorScale(primaryColor: ColorInput, wcagLevel: WCAGLevel = 'AA', options: Partial<SmartThemeConfig> = {}): ColorScale {
	return generateSmartColorScale(primaryColor, {
		mode: 'auto',
		wcagLevel,
		autoAdjust: true,
		preserveHue: true,
		...options,
	})
}

/**
 * 此函数未被使用
 * 批量生成多个主题的色阶配置
 * @param {ColorInput[]} colors - 颜色数组
 * @param {SmartThemeConfig} config - 智能主题配置
 * @returns {ColorScale[]} 色阶配置数组
 */
export function generateMultipleColorScales(colors: ColorInput[], config: SmartThemeConfig = {}): ColorScale[] {
	return colors.map(color => generateSmartColorScale(color, config))
}

// ===== CSS变量处理函数 =====

/**
 * 此函数未被使用
 * 将色阶配置转换为CSS变量对象
 * @param {ColorScale} colorScale - 色阶配置
 * @param {string} prefix - CSS变量前缀 (默认为 'el-color-primary')
 * @returns {Record<string, string>} CSS变量对象
 */
export function createCSSVariables(colorScale: ColorScale, prefix: string = 'el-color-primary'): Record<string, string> {
	return {
		[`--${prefix}`]: colorScale.base,
		[`--${prefix}-light-3`]: colorScale.light3,
		[`--${prefix}-light-5`]: colorScale.light5,
		[`--${prefix}-light-7`]: colorScale.light7,
		[`--${prefix}-light-8`]: colorScale.light8,
		[`--${prefix}-light-9`]: colorScale.light9,
		[`--${prefix}-dark-2`]: colorScale.dark2,
	}
}

/**
 * 此函数未被使用
 * 将RGB色阶配置转换为CSS变量对象
 * @param {ColorScaleRGB} colorScale - RGB色阶配置
 * @param {string} prefix - CSS变量前缀 (默认为 'el-color-primary')
 * @returns {Record<string, string>} CSS变量对象
 */
export function createCSSVariablesFromRGB(colorScale: ColorScaleRGB, prefix: string = 'el-color-primary'): Record<string, string> {
	return {
		[`--${prefix}`]: rgbObjectToHex(colorScale.base),
		[`--${prefix}-light-3`]: rgbObjectToHex(colorScale.light3),
		[`--${prefix}-light-5`]: rgbObjectToHex(colorScale.light5),
		[`--${prefix}-light-7`]: rgbObjectToHex(colorScale.light7),
		[`--${prefix}-light-8`]: rgbObjectToHex(colorScale.light8),
		[`--${prefix}-light-9`]: rgbObjectToHex(colorScale.light9),
		[`--${prefix}-dark-2`]: rgbObjectToHex(colorScale.dark2),
	}
}

// ===== 颜色工具函数 =====

/**
 * 标准化颜色输入为RGB格式
 * 支持HEX、RGB对象、HSL对象等多种输入格式
 * @param {ColorInput} color - 颜色输入 (支持HEX字符串、RGB对象、HSL对象)
 * @returns {RGB | null} RGB对象，如果格式无效则返回null
 */
export function normalizeColorInput(color: ColorInput): RGB | null {
	// 检查输入是否为 undefined 或 null
	if (color == null) {
		return null
	}

	if (typeof color === 'string') {
		// HEX格式
		return hexToRgb(color)
	}

	// 确保 color 是对象类型再使用 'in' 操作符
	if (typeof color === 'object' && color !== null) {
		if ('r' in color && 'g' in color && 'b' in color) {
			// RGB对象
			return color
		}
		if ('h' in color && 's' in color && 'l' in color) {
			// HSL对象
			return hslToRgb(color.h, color.s, color.l)
		}
	}

	return null
}

/**
 * 计算颜色的相对亮度 (WCAG标准)
 * 使用WCAG 2.1规范中的相对亮度计算公式
 * @param {RGB} rgb - RGB颜色对象
 * @returns {number} 相对亮度值 (0-1)
 */
export function calculateLuminance(rgb: RGB): number {
	// 将RGB值转换为0-1范围
	const normalize = (value: number): number => {
		const normalized = value / 255
		return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
	}

	const r = normalize(rgb.r)
	const g = normalize(rgb.g)
	const b = normalize(rgb.b)

	// WCAG相对亮度公式
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 计算两个颜色之间的对比度 (WCAG标准)
 * @param {RGB} color1 - 第一个颜色
 * @param {RGB} color2 - 第二个颜色
 * @returns {number} 对比度比例 (1-21)
 */
export function calculateContrast(color1: RGB, color2: RGB): number {
	const lum1 = calculateLuminance(color1)
	const lum2 = calculateLuminance(color2)
	const lighter = Math.max(lum1, lum2)
	const darker = Math.min(lum1, lum2)
	return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 分析颜色特性，包括亮度、对比度和WCAG合规性
 * @param {ColorInput} color - 颜色输入
 * @returns {ColorAnalysis | null} 颜色分析结果，如果颜色无效则返回null
 */
export function analyzeColor(color: ColorInput): ColorAnalysis | null {
	const rgb = normalizeColorInput(color)
	if (!rgb) return null

	const luminance = calculateLuminance(rgb)
	const whiteRgb: RGB = { r: 255, g: 255, b: 255 }
	const blackRgb: RGB = { r: 0, g: 0, b: 0 }

	// 计算与白色和黑色的对比度
	const contrastWithWhite = calculateContrast(rgb, whiteRgb)
	const contrastWithBlack = calculateContrast(rgb, blackRgb)

	// 选择更高的对比度作为主要对比度
	const contrast = Math.max(contrastWithWhite, contrastWithBlack)

	return {
		isLight: luminance > 0.5,
		luminance,
		contrast,
		wcagAA: contrast >= 4.5, // WCAG AA标准要求4.5:1
		wcagAAA: contrast >= 7.0, // WCAG AAA标准要求7:1
	}
}

/**
 * 此函数未被使用
 * 判断颜色是否为浅色 (增强版)
 * 支持多种颜色格式输入，使用WCAG相对亮度标准
 * @param {ColorInput} color - 颜色输入
 * @returns {boolean} 是否为浅色
 */
export function isLightColor(color: ColorInput): boolean {
	const analysis = analyzeColor(color)
	return analysis ? analysis.isLight : false
}

/**
 * 此函数未被使用
 * 根据背景色自动选择合适的文字颜色 (增强版)
 * 基于WCAG对比度标准选择最佳文字颜色
 * @param {ColorInput} backgroundColor - 背景色
 * @param {WCAGLevel} wcagLevel - WCAG标准等级
 * @returns {string} 文字颜色 (HEX格式)
 */
export function getContrastTextColor(backgroundColor: ColorInput, wcagLevel: WCAGLevel = 'AA'): string {
	const rgb = normalizeColorInput(backgroundColor)
	if (!rgb) return '#000000'

	const whiteRgb: RGB = { r: 255, g: 255, b: 255 }
	const blackRgb: RGB = { r: 0, g: 0, b: 0 }

	const contrastWithWhite = calculateContrast(rgb, whiteRgb)
	const contrastWithBlack = calculateContrast(rgb, blackRgb)

	const minContrast = wcagLevel === 'AAA' ? 7.0 : 4.5

	// 优先选择符合WCAG标准的颜色
	if (contrastWithWhite >= minContrast && contrastWithBlack >= minContrast) {
		// 两者都符合标准，选择对比度更高的
		return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000'
	}
	if (contrastWithWhite >= minContrast) {
		return '#ffffff'
	}
	if (contrastWithBlack >= minContrast) {
		return '#000000'
	}
	// 都不符合标准，选择对比度相对更高的
	return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000'
}

/**
 * 此函数未被使用
 * 检查颜色是否符合WCAG对比度标准
 * @param {ColorInput} foreground - 前景色
 * @param {ColorInput} background - 背景色
 * @param {WCAGLevel} level - WCAG标准等级
 * @returns {boolean} 是否符合标准
 */
export function checkWCAGCompliance(foreground: ColorInput, background: ColorInput, level: WCAGLevel = 'AA'): boolean {
	const fgRgb = normalizeColorInput(foreground)
	const bgRgb = normalizeColorInput(background)

	if (!fgRgb || !bgRgb) return false

	const contrast = calculateContrast(fgRgb, bgRgb)
	const minContrast = level === 'AAA' ? 7.0 : 4.5

	return contrast >= minContrast
}

// ===== 主题切换功能 =====

// 颜色方案 - 与主题设置保持一致
export const scheme = useLocalStorage('color-scheme', 'light')

// 获取系统主题
export const getSystemTheme = () => {
	try {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	} catch (error) {
		return 'light'
	}
}

export const systemTheme = ref(getSystemTheme())

// 是否为深色模式
export const isDark = computed(() => {
	if (scheme.value === 'auto') return systemTheme.value === 'dark'
	return scheme.value === 'dark'
})

// 获取面板主题
export const getPanelTheme = () => {
	const { globalTheme } = useGlobalStore()
	try {
		return globalTheme.value.theme.preset || window.vite_public_panel_theme.theme.preset
	} catch (error) {
		return 'light'
	}
}

// ===== 主题切换动画配置 =====

// 动画配置接口
export interface ThemeTransitionConfig {
	duration?: number // 动画持续时间（毫秒）
	easing?: string // 缓动函数
	enableViewTransition?: boolean // 是否启用View Transition API
	enableCSSTransition?: boolean // 是否启用CSS过渡
	onStart?: () => void // 动画开始回调
	onComplete?: () => void // 动画完成回调
	reducedMotion?: boolean // 是否遵循用户的减少动画偏好
	performanceMode?: 'auto' | 'high' | 'low' // 性能模式
	enableGPUAcceleration?: boolean // 是否启用GPU加速
	enableWillChange?: boolean // 是否使用will-change属性
	debounceDelay?: number // 防抖延迟（毫秒）
	maxConcurrentTransitions?: number // 最大并发动画数量
}

// 默认动画配置
export const DEFAULT_THEME_TRANSITION_CONFIG: ThemeTransitionConfig = {
	duration: 300,
	easing: 'ease-in-out',
	enableViewTransition: false,
	enableCSSTransition: false,
	reducedMotion: false,
	performanceMode: 'auto',
	enableGPUAcceleration: false,
	enableWillChange: false,
	debounceDelay: 50,
	maxConcurrentTransitions: 1,
}

// 当前动画状态
let isThemeTransitioning = false

// 动画配置
let themeTransitionConfig: ThemeTransitionConfig = { ...DEFAULT_THEME_TRANSITION_CONFIG }

/**
 * 设置主题切换动画配置
 * @param config - 动画配置
 */
export function setThemeTransitionConfig(config: Partial<ThemeTransitionConfig>): void {
	themeTransitionConfig = { ...themeTransitionConfig, ...config }
}

/**
 * 获取当前动画配置
 */
export function getThemeTransitionConfig(): ThemeTransitionConfig {
	return { ...themeTransitionConfig }
}

/**
 * 检查是否正在进行主题切换动画
 */
export function isThemeTransitionActive(): boolean {
	return isThemeTransitioning
}

/**
 * 添加CSS过渡样式
 */
function addThemeTransitionStyles(): void {
	const styleId = 'theme-transition-styles'

	// 检查是否已存在样式
	if (document.getElementById(styleId)) {
		return
	}

	const style = document.createElement('style')
	style.id = styleId
	style.textContent = `
		/* 主题切换过渡动画 */
		:root {
			--theme-transition-duration: ${themeTransitionConfig.duration}ms;
			--theme-transition-easing: ${themeTransitionConfig.easing};
		}

		/* 为所有可能受主题影响的元素添加过渡 */
		*,
		*::before,
		*::after {
			transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow;
			transition-duration: var(--theme-transition-duration);
			transition-timing-function: var(--theme-transition-easing);
		}

		/* 主题切换时的特殊处理 */
		.theme-transitioning {
			pointer-events: none; /* 防止动画期间的交互 */
		}

		.theme-transitioning *,
		.theme-transitioning *::before,
		.theme-transitioning *::after {
			transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, backdrop-filter;
			transition-duration: var(--theme-transition-duration);
			transition-timing-function: var(--theme-transition-easing);
		}

		/* 特殊元素的过渡优化 */
		.theme-transitioning .el-button,
		.theme-transitioning .el-input,
		.theme-transitioning .el-card,
		.theme-transitioning .el-menu,
		.theme-transitioning .el-header,
		.theme-transitioning .el-aside,
		.theme-transitioning .el-main {
			transition-property: all;
			transition-duration: var(--theme-transition-duration);
			transition-timing-function: var(--theme-transition-easing);
		}

		/* View Transition API 支持 */
		@supports (view-transition-name: none) {
			::view-transition-old(root),
			::view-transition-new(root) {
				animation-duration: var(--theme-transition-duration);
				animation-timing-function: var(--theme-transition-easing);
			}
		}
	`

	document.head.appendChild(style)
}

/**
 * 移除CSS过渡样式
 */
function removeThemeTransitionStyles(): void {
	const style = document.getElementById('theme-transition-styles')
	if (style) {
		style.remove()
	}
}

/**
 * 执行主题切换动画
 * @param themeChangeCallback - 主题切换回调函数
 * @returns Promise<void>
 */
async function executeThemeTransition(themeChangeCallback: () => void): Promise<void> {
	// 防止重复执行
	if (isThemeTransitioning) {
		return
	}

	isThemeTransitioning = true

	try {
		// 触发开始回调
		themeTransitionConfig.onStart?.()

		// 如果用户偏好减少动画，直接执行切换
		if (themeTransitionConfig.reducedMotion || themeTransitionConfig.duration === 0) {
			themeChangeCallback()
			themeTransitionConfig.onComplete?.()
			return
		}

		// 创建遮罩层
		const overlay = document.createElement('div')
		overlay.id = 'theme-transition-overlay'
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100vw;
			height: 100vh;
			background-color: var(--el-bg-color, #ffffff);
			z-index: 9999;
			opacity: 0;
			transition: opacity ${themeTransitionConfig.duration || 300}ms ${themeTransitionConfig.easing || 'ease-in-out'};
			pointer-events: none;
		`

		// 添加遮罩层到页面
		document.body.appendChild(overlay)

		// 强制重绘，确保初始状态生效
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _ = overlay.offsetHeight

		// 显示遮罩层
		overlay.style.opacity = '1'

		// 等待遮罩层完全显示
		await new Promise<void>(resolve => {
			setTimeout(() => resolve(), (themeTransitionConfig.duration || 300) / 2)
		})

		// 执行主题切换
		themeChangeCallback()

		// 等待主题切换完成 - 使用更长的时间确保DOM更新完成
		await new Promise<void>(resolve => {
			// 使用 requestAnimationFrame 确保DOM渲染完成
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTimeout(() => resolve(), 100)
				})
			})
		})

		// 更新遮罩层背景色为新主题色
		overlay.style.backgroundColor = 'var(--el-bg-color, #ffffff)'

		// 等待一小段时间确保主题切换完成
		await new Promise<void>(resolve => {
			setTimeout(() => resolve(), 200)
		})

		// 隐藏遮罩层
		overlay.style.opacity = '0'

		// 等待遮罩层完全隐藏后移除
		await new Promise<void>(resolve => {
			const duration = themeTransitionConfig.duration || 300
			setTimeout(() => {
				if (overlay.parentNode) {
					overlay.parentNode.removeChild(overlay)
				}
				resolve()
			}, duration)
		})
	} finally {
		// 清理状态
		isThemeTransitioning = false

		// 触发完成回调
		themeTransitionConfig.onComplete?.()
	}
}

// 设置全局主题 - 增强版本，支持动画
export const setSchemeTheme = async (theme?: Theme, enableAnimation: boolean = false, isLocalEdit: boolean = true) => {
	try {
		// 准备主题切换逻辑
		const performThemeSwitch = () => {
			if (isLocalEdit) {
				if (!theme) {
					theme = window.vite_public_panel_theme.theme.preset
				} else {
					const { globalTheme } = useGlobalStore()
					window.vite_public_panel_theme.theme.preset = globalTheme.value.theme.preset
				}
				scheme.value = theme
			}

			// 应用实际的主题类名（auto模式时使用系统主题）
			const actualTheme = theme === 'auto' ? getSystemTheme() : theme
			document.documentElement.setAttribute('class', actualTheme)
			document.body.classList.remove('no-bg-image')

			// 处理暗色模式下背景图片的兼容问题
			if (window.vite_public_panel_theme.interface.bg_image === '/static/images/bg-default.png' && actualTheme === 'dark') {
				document.body.classList.add('no-bg-image')
			} else {
				document.body.classList.remove('no-bg-image')
			}
		}

		// 如果启用动画且不在动画过程中，则执行动画切换
		if (enableAnimation && !isThemeTransitioning) {
			await executeThemeTransition(performThemeSwitch)
		} else {
			// 直接切换，不使用动画
			performThemeSwitch()
		}
	} catch (error) {
		console.error('设置全局主题失败:', error)
		// 确保在错误情况下也能清理状态
		isThemeTransitioning = false
		document.documentElement.classList.remove('theme-transitioning')
	}
}

/**
 * 设置主题切换动画（兼容旧版本调用）
 * @param theme - 主题类型
 */
export const setSchemeThemeWithAnimation = (theme?: Theme) => {
	return setSchemeTheme(theme, true)
}

/**
 * 设置主题切换（无动画）
 * @param theme - 主题类型
 */
export const setSchemeThemeInstant = (theme?: Theme) => {
	return setSchemeTheme(theme, false)
}

/**
 * 切换主题模式（亮色/暗色）
 * @param enableAnimation - 是否启用动画
 */
export const toggleThemeMode = async (enableAnimation: boolean = true) => {
	const currentTheme = scheme.value
	let newTheme: Theme = 'light' // 默认值

	if (currentTheme === 'light') {
		newTheme = 'dark'
	} else if (currentTheme === 'dark') {
		newTheme = 'light'
	} else {
		// auto 模式下根据系统主题切换
		const systemTheme = getSystemTheme()
		newTheme = systemTheme === 'light' ? 'dark' : 'light'
	}

	await setSchemeTheme(newTheme, enableAnimation)
}

/**
 * 预加载主题切换动画样式
 * 在应用启动时调用，避免首次切换时的延迟
 */
export function preloadThemeTransitionStyles(): void {
	// 预先添加样式，但不激活动画状态
	addThemeTransitionStyles()
}

/**
 * 清理主题切换相关资源
 */
export function cleanupThemeTransition(): void {
	isThemeTransitioning = false
	document.documentElement.classList.remove('theme-transitioning')
	removeThemeTransitionStyles()
}

/**
 * 检测用户是否偏好减少动画
 */
export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 检测设备性能等级
 */
export function detectPerformanceLevel(): 'high' | 'medium' | 'low' {
	// 检测硬件并发数
	const hardwareConcurrency = navigator.hardwareConcurrency || 4

	// 检测内存（如果可用）
	const memory = (navigator as any).deviceMemory || 4

	// 检测连接速度（如果可用）
	const { connection } = navigator as any
	const effectiveType = connection?.effectiveType || '4g'

	// 综合评估
	if (hardwareConcurrency >= 8 && memory >= 8 && effectiveType === '4g') {
		return 'high'
	}
	if (hardwareConcurrency >= 4 && memory >= 4) {
		return 'medium'
	}
	return 'low'
}

/**
 * 根据性能模式调整动画配置
 */
export function optimizeConfigForPerformance(config: ThemeTransitionConfig): ThemeTransitionConfig {
	const optimizedConfig = { ...config }

	// 检查用户偏好
	if (prefersReducedMotion()) {
		optimizedConfig.reducedMotion = true
		optimizedConfig.duration = 0
		optimizedConfig.enableViewTransition = false
		optimizedConfig.enableCSSTransition = false
		return optimizedConfig
	}

	// 根据性能模式调整
	const performanceLevel = config.performanceMode === 'auto' ? detectPerformanceLevel() : config.performanceMode === 'high' ? 'high' : 'low'

	switch (performanceLevel) {
		case 'low':
			optimizedConfig.duration = Math.min(optimizedConfig.duration || 300, 150)
			optimizedConfig.enableViewTransition = false
			optimizedConfig.enableGPUAcceleration = false
			optimizedConfig.enableWillChange = false
			break
		case 'medium':
			optimizedConfig.duration = Math.min(optimizedConfig.duration || 300, 250)
			optimizedConfig.enableViewTransition = true
			optimizedConfig.enableGPUAcceleration = true
			optimizedConfig.enableWillChange = false
			break
		case 'high':
			// 保持默认配置
			break
	}

	return optimizedConfig
}

// 防抖计时器
let themeTransitionDebounceTimer: number | null = null

/**
 * 防抖版本的主题切换函数
 */
export const setSchemeThemeDebounced = (theme?: Theme, enableAnimation: boolean = true) => {
	const delay = themeTransitionConfig.debounceDelay || 50

	if (themeTransitionDebounceTimer) {
		clearTimeout(themeTransitionDebounceTimer)
	}

	themeTransitionDebounceTimer = window.setTimeout(() => {
		setSchemeTheme(theme, enableAnimation)
		themeTransitionDebounceTimer = null
	}, delay)
}

// 重置背景图片
export const resetBgImage = () => {
	document.body.classList.remove('no-bg-image')
}

// 监听系统主题变化
export const watchSystemTheme = () => {
	try {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = () => {
			// 只有在auto模式下才响应系统主题变化
			if (scheme.value === 'auto') {
				systemTheme.value = getSystemTheme()
				setSchemeTheme(getSystemTheme(), false, false)
				updateAllCSSVariables()
			}
		}
		// 添加监听器
		mediaQuery.addEventListener('change', handleChange)
		// 返回清理函数
		return () => {
			mediaQuery.removeEventListener('change', handleChange)
		}
	} catch (error) {
		console.error('监听系统主题变化失败:', error)
		return () => {}
	}
}

// ===== CSS变量管理功能 =====

/**
 * 创建CSS变量管理器
 * @param {HTMLElement} target - 目标元素，默认为document.documentElement
 * @returns {CSSVariableManager} CSS变量管理器实例
 */
export function createCSSVariableManager(target: HTMLElement = document.documentElement): CSSVariableManager {
	return {
		variables: new Map<string, string>(),
		mountedVariables: new Set<string>(),
		target,
	}
}

/**
 * 此函数未被使用
 * 设置CSS变量
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @param {string} name - 变量名（不包含--前缀）
 * @param {string} value - 变量值
 */
export function setCssVariable(manager: CSSVariableManager, name: string, value: string): void {
	const variableName = name.startsWith('--') ? name : `--${name}`
	manager.variables.set(variableName, value)
}

/**
 * 此函数未被使用
 * 批量设置CSS变量
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @param {Record<string, string>} variables - 变量对象
 */
export function setCssVariables(manager: CSSVariableManager, variables: Record<string, string>): void {
	Object.entries(variables).forEach(([name, value]) => {
		setCssVariable(manager, name, value)
	})
}

/**
 * 使用样式标签挂载CSS变量到DOM
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @param {string[]} variableNames - 要挂载的变量名数组，如果不提供则挂载所有变量
 * @param {string} styleId - 样式标签ID，默认为'css-variables'
 */
export function mountCssVariable(manager: CSSVariableManager, variableNames?: string[], styleId: string = 'css-variables'): void {
	const namesToMount = variableNames || Array.from(manager.variables.keys())
	// 生成CSS变量样式内容
	const cssContent = namesToMount
		.map(name => {
			const variableName = name.startsWith('--') ? name : `--${name}`
			const value = manager.variables.get(variableName)
			return value !== undefined ? `${variableName}: ${value};` : ''
		})
		.filter(Boolean)
		.join('\n')

	if (cssContent) {
		// 使用样式标签管理器创建或更新样式
		const styleManager = createStyleTagManager(isDark.value ? `html.dark {\n${cssContent}\n}` : `:root {\n${cssContent}\n}`, {
			id: styleId,
			immediate: true,
		})

		// 记录已挂载的变量
		namesToMount.forEach(name => {
			const variableName = name.startsWith('--') ? name : `--${name}`
			if (manager.variables.has(variableName)) {
				manager.mountedVariables.add(variableName)
			}
		})

		// 将样式管理器存储到manager中以便后续操作
		;(manager as any).styleManager = styleManager
	}
}

/**
 * 使用样式标签卸载CSS变量
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @param {string[]} variableNames - 要卸载的变量名数组，如果不提供则卸载所有已挂载的变量
 * @param {string} styleId - 样式标签ID，默认为'css-variables'
 */
export function unmountCssVariable(manager: CSSVariableManager, variableNames?: string[], styleId: string = 'css-variables'): void {
	const namesToUnmount = variableNames || Array.from(manager.mountedVariables)

	if (namesToUnmount.length === 0) return

	// 如果要卸载所有变量，直接移除样式标签
	if (!variableNames || variableNames.length === manager.mountedVariables.size) {
		const { styleManager } = manager as any
		if (styleManager) {
			removeStyleTag(styleManager)
		}
		manager.mountedVariables.clear()
		return
	}

	// 部分卸载：重新生成剩余变量的样式
	namesToUnmount.forEach(name => {
		const variableName = name.startsWith('--') ? name : `--${name}`
		manager.mountedVariables.delete(variableName)
	})

	// 重新挂载剩余的变量
	if (manager.mountedVariables.size > 0) {
		const remainingVariables = Array.from(manager.mountedVariables)
		mountCssVariable(manager, remainingVariables, styleId)
	} else {
		const { styleManager } = manager as any
		if (styleManager) {
			removeStyleTag(styleManager)
		}
	}
}

/**
 * 获取已挂载的CSS变量
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @returns {string[]} 已挂载的变量名数组
 */
export function getMountedVariables(manager: CSSVariableManager): string[] {
	return Array.from(manager.mountedVariables)
}

// ===== 扩展主题设置功能 =====

/**
 * 设置颜色主题（基于CSS变量管理方法重新实现）
 * @param {string} primaryColor - 主色调 (HEX格式)
 * @param {CSSVariableManager} manager - CSS变量管理器，如果不提供则创建新的
 * @param {string} prefix - CSS变量前缀
 * @returns {CSSVariableManager} CSS变量管理器实例
 */
export function setColorTheme(primaryColor: string, manager?: CSSVariableManager, prefix: string = 'el-color-primary', mode: ThemeMode = 'auto'): CSSVariableManager {
	const cssManager = manager || createCSSVariableManager()

	// 1. 先创建变量
	const colorScale = generateColorScale(primaryColor, { mode })
	const variables = createCSSVariables(colorScale, prefix)

	// 2. 合并所有变量
	setCssVariables(cssManager, variables)

	// 3. 最后统一挂载
	mountCssVariable(cssManager)

	return cssManager
}

// ===== 样式标签管理功能 =====

/**
 * 此函数未被使用
 * 创建样式标签管理器
 * 使用VueUse的useStyleTag实现动态样式管理
 * @param {string} css - 初始CSS样式内容
 * @param {StyleTagConfig} config - 样式标签配置
 * @returns {StyleTagManager} 样式标签管理器实例
 */
export function createStyleTagManager(css: string = '', config: StyleTagConfig = {}): StyleTagManager {
	const { id = `style-tag-${Date.now()}`, media, immediate = true, manual = false } = config

	const styleTag = useStyleTag(css, {
		id,
		media,
		immediate,
		manual,
	})

	return {
		id,
		css: styleTag.css,
		load: styleTag.load,
		unload: styleTag.unload,
		isLoaded: styleTag.isLoaded,
	}
}

/**
 * 此函数未被使用
 * 更新样式标签内容
 * @param {StyleTagManager} manager - 样式标签管理器
 * @param {string} css - 新的CSS样式内容
 */
export function updateStyleTag(manager: StyleTagManager, css: string): void {
	manager.css.value = css
}

/**
 * 此函数未被使用
 * 批量更新样式标签内容
 * @param {StyleTagManager} manager - 样式标签管理器
 * @param {Record<string, string>} variables - CSS变量对象
 * @param {string} prefix - CSS变量前缀
 */
export function updateStyleTagWithVariables(manager: StyleTagManager, variables: Record<string, string>, prefix: string = ''): void {
	const cssRules = Object.entries(variables)
		.map(([property, value]) => {
			const varName = property.startsWith('--') ? property : `--${prefix}${property}`
			return `${varName}: ${value};`
		})
		.join('\n\t')

	const css = `:root {\n\t${cssRules}\n}`
	updateStyleTag(manager, css)
}

/**
 * 创建主题样式标签
 * 根据主色调生成完整的主题样式
 * @param {string} primaryColor - 主色调 (HEX格式)
 * @param {StyleTagConfig} config - 样式标签配置
 * @param {string} prefix - CSS变量前缀
 * @returns {StyleTagManager} 样式标签管理器实例
 */
export function createThemeStyleTag(primaryColor: string, config: StyleTagConfig = {}, prefix: string = 'el-color-primary'): StyleTagManager {
	// 生成色阶
	const colorScale = generateColorScale(primaryColor)
	const variables = createCSSVariables(colorScale, prefix)

	// 生成CSS内容
	const cssRules = Object.entries(variables)
		.map(([property, value]) => `${property}: ${value};`)
		.join('\n\t')

	const css = `:root {\n\t${cssRules}\n}`

	// 创建样式标签管理器
	return createStyleTagManager(css, {
		id: `theme-${prefix}-${Date.now()}`,
		...config,
	})
}

/**
 * 此函数未被使用
 * 移除样式标签
 * @param {StyleTagManager} manager - 样式标签管理器
 */
export function removeStyleTag(manager: StyleTagManager): void {
	manager.unload()
}

/**
 * 此函数未被使用
 * 切换样式标签的加载状态
 * @param {StyleTagManager} manager - 样式标签管理器
 * @param {boolean} shouldLoad - 是否加载样式
 */
export function toggleStyleTag(manager: StyleTagManager, shouldLoad?: boolean): void {
	if (shouldLoad !== undefined) {
		if (shouldLoad && !manager.isLoaded.value) {
			manager.load()
		} else if (!shouldLoad && manager.isLoaded.value) {
			manager.unload()
		}
	} else if (manager.isLoaded.value) {
		// 切换当前状态
		manager.unload()
	} else {
		manager.load()
	}
}

// ===== 文件上传功能 =====

/**
 * 此函数未被使用
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string} 文件扩展名
 */
export function getFileExtension(fileName: string): string {
	const lastDotIndex = fileName.lastIndexOf('.')
	return lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1) : 'png'
}

/**
 * 此函数未被使用
 * 生成上传文件名
 * @param {string} type - 文件类型标识
 * @param {string} originalName - 原始文件名
 * @returns {string} 新的文件名
 */
export function generateUploadFileName(type: string, originalName: string): string {
	const ext = getFileExtension(originalName)
	return `${type}_${Date.now()}.${ext}`
}

/**
 * 此函数未被使用
 * 创建统一的文件上传配置
 * @param {string} type - 上传类型
 * @param {Partial<UploadConfig>} config - 上传配置
 * @returns {UploadConfig} 完整的上传配置
 */
export function createUploadConfig(type: string, config: Partial<UploadConfig> = {}): UploadConfig {
	return {
		action: config.action || '/files',
		headers: config.headers || {},
		data: config.data || {},
		beforeUpload:
			config.beforeUpload ||
			((file: File) => {
				const isImage = file.type.startsWith('image/')
				if (!isImage) {
					console.error('只能上传图片文件!')
					return false
				}
				return true
			}),
		onSuccess: config.onSuccess,
		onError: config.onError,
	}
}

/**
 * 此函数未被使用
 * 生成上传数据
 * @param {string} type - 上传类型
 * @param {File} file - 文件对象
 * @returns {Record<string, string>} 上传数据对象
 */
export function generateUploadData(type: string, file: File): Record<string, string> {
	const fileName = generateUploadFileName(type, file.name)
	return {
		action: 'upload',
		fPath: '/www/server/panel/BTPanel/static/temp',
		fName: fileName,
		fSize: String(file.size),
		fStart: '0',
	}
}

/**
 * 此函数未被使用
 * 获取上传请求头
 * @returns 请求头对象
 */
export function getUploadHeaders(): Record<string, string> {
	const token = localStorage.getItem('token')
	return {
		Authorization: token ? `Bearer ${token}` : '',
	}
}

/**
 * 此函数未被使用
 * 自定义上传请求处理器
 * @param {Object} options - 上传选项
 * @param {File} options.file - 文件对象
 * @param {function} options.onProgress - 进度回调
 * @param {function} options.onSuccess - 成功回调
 * @param {function} options.onError - 错误回调
 * @param config - 上传配置
 * @returns Promise
 */
export async function customUploadRequest(options: { file: File; onProgress?: (percent: number) => void; onSuccess?: (response: any) => void; onError?: (error: Error) => void }, config: UploadConfig): Promise<void> {
	const { file, onSuccess, onError } = options

	try {
		// 上传前检查
		if (config.beforeUpload && !config.beforeUpload(file)) {
			return
		}

		// 准备上传数据
		const formData = new FormData()
		// 添加文件和其他数据
		formData.append('blob', file as Blob)

		// 添加额外数据
		if (config.data) {
			Object.entries(config.data).forEach(([key, value]) => {
				formData.append(key, value)
			})
		}

		// 发送请求
		const response = await fetch(config.action, {
			method: 'POST',
			headers: {
				...getUploadHeaders(),
				...config.headers,
			},
			body: formData,
		})

		if (!response.ok) {
			throw new Error(`上传失败: ${response.statusText}`)
		}

		const result = await response.json()

		// 调用成功回调
		if (onSuccess) {
			onSuccess(result)
		}
		if (config.onSuccess) {
			config.onSuccess(result, file)
		}
	} catch (error) {
		const uploadError = error instanceof Error ? error : new Error('上传失败')

		// 调用错误回调
		if (onError) {
			onError(uploadError)
		}
		if (config.onError) {
			config.onError(uploadError, file)
		}
	}
}

// ===== 侧边栏设置功能 =====

/**
 * 此函数未被使用
 * 设置侧边栏样式
 * @param {string} color - 侧边栏颜色
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @returns {CSSVariableManager} CSS变量管理器实例
 */
export function setSidebarTheme(color: string, manager?: CSSVariableManager): CSSVariableManager | false {
	const cssManager = manager || createCSSVariableManager()
	const rgbColor = hexToRgb(color)
	if (!rgbColor) return false
	const { r, g, b } = rgbColor
	// 计算文本颜色（根据主色明暗度决定）
	const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
	const textColor = luminance > 0.5 ? '#303133' : '#ffffff' // 亮色背景用深色文本，暗色背景用白色文本

	// 计算激活状态颜色（主色略深一点）
	const activeR = Math.max(0, r - 4)
	const activeG = Math.max(0, g - 4)
	const activeB = Math.max(0, b - 4)

	// 计算图标颜色（比文本色稍浅）
	const iconColor = luminance > 0.5 ? '#666666' : '#bbbbbb'

	// 计算操作元素颜色
	const operationColor = luminance > 0.5 ? '#909399' : '#cccccc'

	const variables = {
		'bt-menu-icon-color': iconColor,
		'bt-menu-sidebar-color': `rgba(${r}, ${g}, ${b}, var(--bt-menu-sidebar-bg-opacity))`,
		'bt-menu-sidebar-color-active': `rgba(${activeR}, ${activeG}, ${activeB}, var(--bt-menu-sidebar-bg-opacity))`,
		'bt-menu-shadow-color': 'rgba(var(--bt-menu-shadow-color), 0.1)',
		'bt-menu-text-color': textColor,
		'bt-menu-operation-color': operationColor,
		'bt-menu-operation-color-active': textColor,
		'bt-menu-operation-bg-color': `rgb(${activeR}, ${activeG}, ${activeB})`,
	}
	// 2. 合并所有变量
	setCssVariables(cssManager, variables)

	// 3. 最后统一挂载
	mountCssVariable(cssManager)

	return cssManager
}

// ===== 圆角设置功能 =====

/**
 * 此函数未被使用
 * 获取圆角配置
 * @param {BorderRadiusSize} size - 圆角尺寸
 * @returns 圆角配置对象
 */
export function getBorderRadiusConfig(size: BorderRadiusSize): Record<string, string> {
	const configs = {
		none: {
			'el-border-radius-small': '0px',
			'el-border-radius-base': '0px !important',
			'el-border-radius-medium': '0px',
			'el-border-radius-large': '0px',
			'el-border-radius-extra-large': '0px',
			'el-border-radius-round': '0px',
			'el-border-radius-extra-round': '50px',
			'el-border-radius-circle': '100%',
		},
		small: {
			'el-border-radius-small': '2px',
			'el-border-radius-base': '4px',
			'el-border-radius-medium': '6px',
			'el-border-radius-large': '8px',
			'el-border-radius-extra-large': '12px',
			'el-border-radius-round': '20px',
			'el-border-radius-extra-round': '50px',
			'el-border-radius-circle': '100%',
		},
		medium: {
			'el-border-radius-small': '4px',
			'el-border-radius-base': '6px',
			'el-border-radius-medium': '8px',
			'el-border-radius-large': '12px',
			'el-border-radius-extra-large': '16px',
			'el-border-radius-round': '24px',
			'el-border-radius-extra-round': '50px',
			'el-border-radius-circle': '100%',
		},
		large: {
			'el-border-radius-small': '6px',
			'el-border-radius-base': '8px',
			'el-border-radius-medium': '12px',
			'el-border-radius-large': '16px',
			'el-border-radius-extra-large': '20px',
			'el-border-radius-round': '28px',
			'el-border-radius-extra-round': '50px',
			'el-border-radius-circle': '100%',
		},
	}

	return configs[size]
}

/**
 * 此函数未被使用
 * 设置圆角样式
 * @param {BorderRadiusSize} size - 圆角尺寸
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @returns {CSSVariableManager} CSS变量管理器实例
 */
export function setBorderRadiusTheme(size: BorderRadiusSize, manager?: CSSVariableManager): CSSVariableManager {
	const cssManager = manager || createCSSVariableManager()

	// 1. 先创建变量
	const variables = getBorderRadiusConfig(size)

	// 2. 合并所有变量
	setCssVariables(cssManager, variables)

	// 3. 最后统一挂载
	mountCssVariable(cssManager)

	return cssManager
}

// ===== 透明度设置功能 =====

/**
 * 此函数未被使用
 * 获取透明度配置
 * @param {OpacityLevel | number} level - 透明度级别或自定义透明度值 (0-1)
 * @param {string} name - CSS变量名称 (不包含--前缀)
 * @returns 透明度配置对象
 */
export function getOpacityConfig(level: OpacityLevel | number, name: string): Record<string, string> {
	let opacityValue: number = 0.5 // 默认值

	// 根据级别设置透明度值
	if (typeof level === 'number') {
		// 自定义透明度值，确保在0-1范围内
		opacityValue = Math.max(0, Math.min(1, level))
	} else {
		// 预设透明度级别
		const presetLevels = {
			low: 0.3,
			medium: 0.6,
			high: 0.9,
			custom: 0.5, // 默认值
		}
		opacityValue = presetLevels[level]
	}

	// 生成CSS变量名
	const variableName = name.startsWith('--') ? name.slice(2) : name

	return {
		[variableName]: opacityValue.toString(),
	}
}

/**
 * 此函数未被使用
 * 设置透明度样式
 * @param {OpacityLevel | number} level - 透明度级别或自定义透明度值 (0-1)
 * @param {string} name - CSS变量名称 (不包含--前缀)
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @returns {CSSVariableManager} CSS变量管理器实例
 */
export function setOpacityTheme(level: OpacityLevel | number, name: string, manager?: CSSVariableManager): CSSVariableManager {
	const cssManager = manager || createCSSVariableManager()

	// 1. 先创建变量
	const variables = getOpacityConfig(level, `bt-${name}`)

	// 2. 合并所有变量
	setCssVariables(cssManager, variables)

	// 3. 最后统一挂载
	mountCssVariable(cssManager)

	return cssManager
}

// ===== 阴影颜色设置功能 =====

/**
 * 此函数未被使用
 * 设置阴影颜色
 * @param {string} color - 阴影颜色 (HEX格式)
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @returns {CSSVariableManager} CSS变量管理器实例
 */
export function setShadowColorTheme(color: string, manager?: CSSVariableManager): CSSVariableManager {
	const cssManager = manager || createCSSVariableManager()

	// 1. 先创建变量
	const rgbColor = hexToRgb(color) || { r: 0, g: 0, b: 0 }
	const variables = {
		'bt-main-shadow-color': `${rgbColor.r},${rgbColor.g},${rgbColor.b}`,
	}

	// 2. 合并所有变量
	setCssVariables(cssManager, variables)

	// 3. 最后统一挂载
	mountCssVariable(cssManager)

	return cssManager
}

// ===== 首页字体设置功能 =====

/**
 * 此函数未被使用
 * 设置首页字体大小
 * @param {number} fontSize - 字体大小 (12-36px)
 * @param {CSSVariableManager} manager - CSS变量管理器
 * @returns {CSSVariableManager} CSS变量管理器实例
 */
export function setHomeFontSize(fontSize: number, manager?: CSSVariableManager): CSSVariableManager {
	const cssManager = manager || createCSSVariableManager()

	// 验证字体大小范围
	const clampedSize = Math.max(12, Math.min(36, fontSize))

	// 1. 先创建变量
	const variables = {
		'bt-home-overview-font-size': `${clampedSize}px`,
	}

	// 2. 合并所有变量
	setCssVariables(cssManager, variables)

	// 3. 最后统一挂载
	mountCssVariable(cssManager)

	return cssManager
}

/**
 * 此函数未被使用
 * 设置主题色 (函数式实现)
 * 基于现有的函数式工具，提供简洁的主题设置功能
 * @param primaryColor - 主色调 (HEX格式)
 * @param manager - css变量空间
 * @param options - 配置选项
 * @param options.prefix - CSS变量前缀 (默认为 'el-color-primary')
 * @param options.format - 颜色格式 ('hex' | 'rgb', 默认为 'hex')
 * @returns Promise<ThemeState> 主题状态对象
 */
export function setTheme(
	primaryColor: string,
	manager?: CSSVariableManager,
	options: {
		prefix?: string
		format?: ColorFormat
		mode?: ThemeMode
	} = {}
): CSSVariableManager {
	const { prefix = 'el-color-primary', format = 'hex', mode = 'auto' } = options
	const cssManager = manager || createCSSVariableManager()
	try {
		// 生成色阶
		const colorScale = format === 'hex' ? generateColorScale(primaryColor, { mode }) : generateColorScaleRGB(primaryColor, { mode })

		// 生成CSS变量
		const cssVariables = format === 'hex' ? createCSSVariables(colorScale as ColorScale, prefix) : createCSSVariablesFromRGB(colorScale as ColorScaleRGB, prefix)

		// 2. 合并所有变量
		setCssVariables(cssManager, cssVariables)

		// 3. 最后统一挂载
		mountCssVariable(cssManager)
	} catch (error) {
		console.error('设置主题失败:', error)
		throw error
	}
	return cssManager
}

/**
 * 此函数未被使用
 * @description 更新所有CSS变量
 * @param images
 * @param key
 * @param manager
 * @returns
 */
export function setGeneralCssVar(name: string, value: string, manager?: CSSVariableManager) {
	const cssManager = manager || createCSSVariableManager()

	// 1. 定义变量
	const variables = { [name]: value }

	// 2. 合并所有变量
	setCssVariables(cssManager, variables)

	// 3. 最后统一挂载
	mountCssVariable(cssManager)

	return cssManager
}

/**
 * @description 更新所有CSS变量
 */
export const updateAllCSSVariables = async () => {
	const { globalTheme } = useGlobalStore()

	// 处理深色颜色主题和预设主题的冲突
	if (globalTheme.value.theme.color === '#3c444d' && isDark.value) {
		globalTheme.value.theme.color = '#20a53a'
	}

	const themeColor = globalTheme.value.theme.color || DEFAULT_PRIMARY_COLOR

	// 设置主题颜色
	setTheme(themeColor, window.themeManager, { mode: isDark.value ? 'dark' : 'light' })

	// 更新圆角设置
	setBorderRadiusTheme(globalTheme.value.interface.rounded as BorderRadiusSize, window.themeManager)

	// 更新背景图片
	setGeneralCssVar('bt-main-bg-images', `url(${globalTheme.value.interface.bg_image})`, window.themeManager)

	// 更新阴影颜色
	setShadowColorTheme(globalTheme.value.interface.shadow_color, window.themeManager)

	// 更新首页字体大小
	setHomeFontSize(globalTheme.value.home.overview_size, window.themeManager)

	// 更新侧边栏透明度
	setOpacityTheme(globalTheme.value.sidebar.opacity / 100, 'menu-sidebar-bg-opacity', window.themeManager)

	// 更新背景图片透明度
	setOpacityTheme(globalTheme.value.interface.bg_image_opacity / 100, 'main-bg-images-opacity', window.themeManager)

	// 更新内容透明度
	setOpacityTheme(globalTheme.value.interface.content_opacity / 100, 'main-content-opacity', window.themeManager)

	// 更新阴影透明度
	setOpacityTheme(globalTheme.value.interface.shadow_opacity / 100, 'main-shadow-opacity', window.themeManager)

	// 当侧边栏为暗色或当前为暗色主题时，卸载侧边栏颜色
	if (!globalTheme.value.sidebar.dark || isDark.value) {
		unmountCssVariable(window.themeManager, ['bt-menu-icon-color', 'bt-menu-sidebar-color', 'bt-menu-sidebar-color-active', 'bt-menu-shadow-color', 'bt-menu-text-color', 'bt-menu-operation-color', 'bt-menu-operation-color-active', 'bt-menu-operation-bg-color'])
	} else {
		setSidebarTheme(globalTheme.value.sidebar.color, window.themeManager)
	}
}

// ===== 异步Worker函数 =====

/**
 * 异步颜色转换 - Worker版本
 * 使用Web Worker处理颜色格式转换，避免阻塞主线程
 * @param {ColorInput} color - 输入颜色
 * @param {string} targetFormat - 目标格式 ('hex' | 'rgb' | 'hsl')
 * @returns {Promise<string | RGB | HSL | null>} 异步返回转换后的颜色
 */
export async function convertColorAsync(color: ColorInput, targetFormat: 'hex' | 'rgb' | 'hsl'): Promise<string | RGB | HSL | null> {
	// 检查Worker是否可用
	if (!isWorkerEnabled()) {
		handleWorkerFallback()
		// 降级到主线程处理
		const rgb = normalizeColorInput(color)
		if (!rgb) return null

		switch (targetFormat) {
			case 'hex':
				return rgbObjectToHex(rgb)
			case 'rgb':
				return rgb
			case 'hsl':
				return rgbToHsl(rgb.r, rgb.g, rgb.b)
			default:
				return null
		}
	}

	try {
		// 标准化颜色输入
		const normalizedColor = typeof color === 'string' ? color : rgbObjectToHex(color as RGB)

		// 使用Worker处理
		const workerManager = getWorkerManager()
		const result = await workerManager.convertColor(normalizedColor, 'hex', targetFormat)

		return result
	} catch (error) {
		console.warn('Worker color conversion failed, falling back to main thread:', error)
		handleWorkerFallback()
		// 降级到主线程处理
		const rgb = normalizeColorInput(color)
		if (!rgb) return null

		switch (targetFormat) {
			case 'hex':
				return rgbObjectToHex(rgb)
			case 'rgb':
				return rgb
			case 'hsl':
				return rgbToHsl(rgb.r, rgb.g, rgb.b)
			default:
				return null
		}
	}
}

/**
 * 异步颜色分析 - Worker版本
 * 使用Web Worker处理颜色分析计算，避免阻塞主线程
 * @param {ColorInput} color - 输入颜色
 * @returns {Promise<ColorAnalysis | null>} 异步返回颜色分析结果
 */
export async function analyzeColorAsync(color: ColorInput): Promise<ColorAnalysis | null> {
	// 检查Worker是否可用
	if (!isWorkerEnabled()) {
		handleWorkerFallback()
		// 降级到主线程处理
		return analyzeColor(color)
	}

	try {
		// 标准化颜色输入
		const normalizedColor = typeof color === 'string' ? color : rgbObjectToHex(color as RGB)

		// 使用Worker处理
		const workerManager = getWorkerManager()
		const result = await workerManager.analyzeColor(normalizedColor)

		return result
	} catch (error) {
		console.warn('Worker color analysis failed, falling back to main thread:', error)
		handleWorkerFallback()
		// 降级到主线程处理
		return analyzeColor(color)
	}
}

/**
 * 异步批量颜色处理 - Worker版本
 * 使用Web Worker处理多个颜色的批量操作，提高性能
 * @param {ColorInput[]} colors - 颜色数组
 * @param {SmartThemeConfig} config - 配置选项
 * @returns {Promise<ColorScale[]>} 异步返回色阶数组
 */
export async function generateMultipleColorScalesAsync(colors: ColorInput[], config: SmartThemeConfig = {}): Promise<ColorScale[]> {
	// 检查Worker是否可用
	if (!isWorkerEnabled()) {
		handleWorkerFallback()
		// 降级到主线程处理
		return generateMultipleColorScales(colors, config)
	}

	try {
		// 标准化颜色输入
		const normalizedColors = colors.map(color => (typeof color === 'string' ? color : rgbObjectToHex(color as RGB)))

		// 使用Worker处理
		const workerManager = getWorkerManager()
		const results = await Promise.all(normalizedColors.map(color => workerManager.generateColorScale(color, config)))

		return results
	} catch (error) {
		console.warn('Worker batch color processing failed, falling back to main thread:', error)
		handleWorkerFallback()
		// 降级到主线程处理
		return generateMultipleColorScales(colors, config)
	}
}
