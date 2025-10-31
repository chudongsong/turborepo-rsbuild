/**
 * 颜色相关纯函数：HEX/RGB/HSL 转换、亮度与对比度、色阶生成。
 */

export interface RGB { r: number; g: number; b: number }
export interface HSL { h: number; s: number; l: number }

/** HEX 转 RGB */
export function hexToRgb(hex: string): RGB | null {
  const m = hex.trim().toLowerCase().match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const num = parseInt(h, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

/** RGB 转 HEX */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** RGB 转 HSL */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h, s, l }
}

/** HSL 转 RGB */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  let r: number, g: number, b: number
  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
}

/** 标准化颜色输入为 RGB */
export function normalizeColorInput(color: string | RGB | HSL): RGB | null {
  if (color == null) return null
  if (typeof color === 'string') return hexToRgb(color)
  if ('r' in color && 'g' in color && 'b' in color) return color as RGB
  if ('h' in color && 's' in color && 'l' in color) return hslToRgb(color.h, color.s, color.l)
  return null
}

/** 相对亮度（WCAG）*/
export function relativeLuminance({ r, g, b }: RGB): number {
  const srgb = [r, g, b].map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

/** 计算两颜色的对比度（比值 1~21）*/
export function calculateContrast(c1: RGB, c2: RGB): number {
  const L1 = relativeLuminance(c1)
  const L2 = relativeLuminance(c2)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** 判断颜色是否为浅色 */
export function isLightColor(color: string | RGB): boolean {
  const rgb = typeof color === 'string' ? hexToRgb(color) : color
  if (!rgb) return false
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 180
}

/** 调整 HSL（轻微变亮/变暗）*/
export function adjustHsl(rgb: RGB, hDelta = 0, sFactor = 1, lFactor = 1): RGB {
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const h = Math.max(0, Math.min(1, hsl.h + hDelta))
  const s = Math.max(0, Math.min(1, hsl.s * sFactor))
  const l = Math.max(0, Math.min(1, hsl.l * lFactor))
  return hslToRgb(h, s, l)
}

export type ColorFormat = 'hex' | 'rgb'

export interface ColorScaleHex {
  base: string
  light3: string
  light5: string
  light7: string
  light8: string
  light9: string
  dark2: string
}

export interface ColorScaleRGB {
  base: RGB
  light3: RGB
  light5: RGB
  light7: RGB
  light8: RGB
  light9: RGB
  dark2: RGB
}

/** 根据基础色生成色阶（亮/暗模式通用简化版）*/
export function generateColorScale(baseHex: string, format: ColorFormat = 'hex'): ColorScaleHex | ColorScaleRGB {
  const base = hexToRgb(baseHex)
  if (!base) throw new Error('无效的颜色格式')
  const mk = (rgb: RGB, s: number, l: number) => adjustHsl(rgb, 0, s, l)
  const scaleRGB: ColorScaleRGB = {
    base,
    light3: mk(base, 1.05, 1.05),
    light5: mk(base, 1.1, 1.1),
    light7: mk(base, 1.15, 1.15),
    light8: mk(base, 1.18, 1.18),
    light9: mk(base, 1.22, 1.22),
    dark2: mk(base, 0.95, 0.85),
  }
  if (format === 'rgb') return scaleRGB
  const toHex = (c: RGB) => rgbToHex(c.r, c.g, c.b)
  return {
    base: rgbToHex(base.r, base.g, base.b),
    light3: toHex(scaleRGB.light3),
    light5: toHex(scaleRGB.light5),
    light7: toHex(scaleRGB.light7),
    light8: toHex(scaleRGB.light8),
    light9: toHex(scaleRGB.light9),
    dark2: toHex(scaleRGB.dark2),
  }
}