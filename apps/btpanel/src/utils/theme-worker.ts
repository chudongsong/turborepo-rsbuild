// Web Worker for theme configuration calculations
// 处理主题配置的性能密集型计算

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

interface ColorScale {
	base: string
	light3: string
	light5: string
	light7: string
	light8: string
	light9: string
	dark2: string
}

interface WorkerMessage {
	id: string
	type: 'generateColorScale' | 'convertColor' | 'analyzeColor' | 'clearCache'
	payload: any
}

interface WorkerResponse {
	id: string
	type: string
	success: boolean
	data?: any
	error?: string
}

// 缓存系统
const colorConversionCache = new Map<string, any>()
const colorScaleCache = new Map<string, any>()
const MAX_CACHE_SIZE = 500

// 缓存清理函数
function clearCacheIfNeeded(cache: Map<string, any>): void {
	if (cache.size > MAX_CACHE_SIZE) {
		const entries = Array.from(cache.entries())
		const toDelete = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2))
		toDelete.forEach(([key]) => cache.delete(key))
	}
}

// 颜色转换函数
function hexToRgb(hex: string): RGB | null {
	const cacheKey = `hexToRgb:${hex}`
	if (colorConversionCache.has(cacheKey)) {
		return colorConversionCache.get(cacheKey)
	}

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	const rgb = result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null

	colorConversionCache.set(cacheKey, rgb)
	clearCacheIfNeeded(colorConversionCache)
	return rgb
}

function rgbToHex(r: number, g: number, b: number): string {
	const cacheKey = `rgbToHex:${r},${g},${b}`
	if (colorConversionCache.has(cacheKey)) {
		return colorConversionCache.get(cacheKey)
	}

	const toHex = (n: number): string => {
		const hex = n.toString(16)
		return hex.length === 1 ? `0${hex}` : hex
	}

	const result = `#${toHex(r)}${toHex(g)}${toHex(b)}`
	colorConversionCache.set(cacheKey, result)
	clearCacheIfNeeded(colorConversionCache)
	return result
}

function rgbToHsl(r: number, g: number, b: number): HSL {
	const cacheKey = `rgbToHsl:${r},${g},${b}`
	if (colorConversionCache.has(cacheKey)) {
		return colorConversionCache.get(cacheKey)
	}

	const rNorm = r / 255
	const gNorm = g / 255
	const bNorm = b / 255

	const max = Math.max(rNorm, gNorm, bNorm)
	const min = Math.min(rNorm, gNorm, bNorm)
	const diff = max - min

	let h = 0
	let s = 0
	const l = (max + min) / 2

	if (diff !== 0) {
		s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

		if (max === rNorm) {
			h = (gNorm - bNorm) / diff + (gNorm < bNorm ? 6 : 0)
		} else if (max === gNorm) {
			h = (bNorm - rNorm) / diff + 2
		} else {
			h = (rNorm - gNorm) / diff + 4
		}
		h /= 6
	}

	const result = { h: h * 360, s: s * 100, l: l * 100 }
	colorConversionCache.set(cacheKey, result)
	clearCacheIfNeeded(colorConversionCache)
	return result
}

function hslToRgb(h: number, s: number, l: number): RGB {
	const cacheKey = `hslToRgb:${h},${s},${l}`
	if (colorConversionCache.has(cacheKey)) {
		return colorConversionCache.get(cacheKey)
	}

	const hNorm = h / 360
	const sNorm = s / 100
	const lNorm = l / 100

	const hue2rgb = (p: number, q: number, t: number): number => {
		let tNorm = t
		if (tNorm < 0) tNorm += 1
		if (tNorm > 1) tNorm -= 1
		if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm
		if (tNorm < 1 / 2) return q
		if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6
		return p
	}

	let r = 0
	let g = 0
	let b = 0

	if (sNorm === 0) {
		r = lNorm
		g = lNorm
		b = lNorm
	} else {
		const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm
		const p = 2 * lNorm - q
		r = hue2rgb(p, q, hNorm + 1 / 3)
		g = hue2rgb(p, q, hNorm)
		b = hue2rgb(p, q, hNorm - 1 / 3)
	}

	const result = {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	}

	colorConversionCache.set(cacheKey, result)
	clearCacheIfNeeded(colorConversionCache)
	return result
}

// 颜色分析函数
function calculateLuminance(rgb: RGB): number {
	const { r, g, b } = rgb
	const normalize = (c: number): number => {
		const normalized = c / 255
		return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
	}

	const rs = normalize(r)
	const gs = normalize(g)
	const bs = normalize(b)

	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function isLightColor(color: string): boolean {
	const rgb = hexToRgb(color)
	if (!rgb) return false
	const luminance = calculateLuminance(rgb)
	return luminance > 0.5
}

// 色阶生成函数
function generateStandardColorScale(primaryColor: string, mode: 'light' | 'dark' = 'light'): ColorScale {
	const cacheKey = `standardColorScale:${primaryColor}:${mode}`
	if (colorScaleCache.has(cacheKey)) {
		return colorScaleCache.get(cacheKey)
	}

	const rgb = hexToRgb(primaryColor)
	if (!rgb) {
		throw new Error('Invalid color format')
	}

	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
	const baseHex = primaryColor

	const result: ColorScale = {
		base: baseHex,
		light3: '',
		light5: '',
		light7: '',
		light8: '',
		light9: '',
		dark2: '',
	}

	if (mode === 'light') {
		const light3Rgb = hslToRgb(hsl.h, hsl.s, Math.min(95, hsl.l + 20))
		const light5Rgb = hslToRgb(hsl.h, hsl.s * 0.8, Math.min(95, hsl.l + 30))
		const light7Rgb = hslToRgb(hsl.h, hsl.s * 0.6, Math.min(95, hsl.l + 40))
		const light8Rgb = hslToRgb(hsl.h, hsl.s * 0.4, Math.min(95, hsl.l + 50))
		const light9Rgb = hslToRgb(hsl.h, hsl.s * 0.2, Math.min(95, hsl.l + 60))
		const dark2Rgb = hslToRgb(hsl.h, hsl.s, Math.max(5, hsl.l - 15))

		result.light3 = rgbToHex(light3Rgb.r, light3Rgb.g, light3Rgb.b)
		result.light5 = rgbToHex(light5Rgb.r, light5Rgb.g, light5Rgb.b)
		result.light7 = rgbToHex(light7Rgb.r, light7Rgb.g, light7Rgb.b)
		result.light8 = rgbToHex(light8Rgb.r, light8Rgb.g, light8Rgb.b)
		result.light9 = rgbToHex(light9Rgb.r, light9Rgb.g, light9Rgb.b)
		result.dark2 = rgbToHex(dark2Rgb.r, dark2Rgb.g, dark2Rgb.b)
	} else {
		const light3Rgb = hslToRgb(hsl.h, hsl.s, Math.max(5, hsl.l - 10))
		const light5Rgb = hslToRgb(hsl.h, hsl.s * 0.9, Math.max(5, hsl.l - 20))
		const light7Rgb = hslToRgb(hsl.h, hsl.s * 0.7, Math.max(5, hsl.l - 30))
		const light8Rgb = hslToRgb(hsl.h, hsl.s * 0.5, Math.max(5, hsl.l - 40))
		const light9Rgb = hslToRgb(hsl.h, hsl.s * 0.3, Math.max(5, hsl.l - 50))
		const dark2Rgb = hslToRgb(hsl.h, Math.min(100, hsl.s + 20), Math.min(95, hsl.l + 25))

		result.light3 = rgbToHex(light3Rgb.r, light3Rgb.g, light3Rgb.b)
		result.light5 = rgbToHex(light5Rgb.r, light5Rgb.g, light5Rgb.b)
		result.light7 = rgbToHex(light7Rgb.r, light7Rgb.g, light7Rgb.b)
		result.light8 = rgbToHex(light8Rgb.r, light8Rgb.g, light8Rgb.b)
		result.light9 = rgbToHex(light9Rgb.r, light9Rgb.g, light9Rgb.b)
		result.dark2 = rgbToHex(dark2Rgb.r, dark2Rgb.g, dark2Rgb.b)
	}

	colorScaleCache.set(cacheKey, result)
	clearCacheIfNeeded(colorScaleCache)
	return result
}

function generateSmartColorScale(primaryColor: string, config: any = {}): ColorScale {
	const cacheKey = `smartColorScale:${primaryColor}:${JSON.stringify(config)}`
	if (colorScaleCache.has(cacheKey)) {
		return colorScaleCache.get(cacheKey)
	}

	const { mode = 'auto' } = config
	const actualMode = mode === 'auto' ? (isLightColor(primaryColor) ? 'light' : 'dark') : mode
	const result = generateStandardColorScale(primaryColor, actualMode)

	colorScaleCache.set(cacheKey, result)
	clearCacheIfNeeded(colorScaleCache)
	return result
}

// 消息处理函数
function handleMessage(message: WorkerMessage): WorkerResponse {
	try {
		switch (message.type) {
			case 'generateColorScale': {
				const { primaryColor, config } = message.payload
				const result = config?.mode === 'light' || config?.mode === 'dark' ? generateStandardColorScale(primaryColor, config.mode) : generateSmartColorScale(primaryColor, config)

				return {
					id: message.id,
					type: message.type,
					success: true,
					data: result,
				}
			}

			case 'convertColor': {
				const { color, from, to } = message.payload
				let result: any = null

				if (from === 'hex' && to === 'rgb') {
					result = hexToRgb(color)
				} else if (from === 'rgb' && to === 'hex') {
					result = rgbToHex(color.r, color.g, color.b)
				} else if (from === 'rgb' && to === 'hsl') {
					result = rgbToHsl(color.r, color.g, color.b)
				} else if (from === 'hsl' && to === 'rgb') {
					result = hslToRgb(color.h, color.s, color.l)
				}

				return {
					id: message.id,
					type: message.type,
					success: true,
					data: result,
				}
			}

			case 'analyzeColor': {
				const { color } = message.payload
				const rgb = hexToRgb(color)
				if (!rgb) throw new Error('Invalid color')

				const luminance = calculateLuminance(rgb)
				const isLight = luminance > 0.5

				return {
					id: message.id,
					type: message.type,
					success: true,
					data: {
						isLight,
						luminance,
						rgb,
						hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
					},
				}
			}

			case 'clearCache': {
				colorConversionCache.clear()
				colorScaleCache.clear()

				return {
					id: message.id,
					type: message.type,
					success: true,
					data: { message: 'Cache cleared' },
				}
			}

			default:
				throw new Error(`Unknown message type: ${message.type}`)
		}
	} catch (error) {
		return {
			id: message.id,
			type: message.type,
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

// Worker 消息监听
onmessage = (event: MessageEvent<WorkerMessage>) => {
	const response = handleMessage(event.data)
	postMessage(response)
}

// 导出类型（用于主线程）
export type { WorkerMessage, WorkerResponse, ColorScale, RGB, HSL }
