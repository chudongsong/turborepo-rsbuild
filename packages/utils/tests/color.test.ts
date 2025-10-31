import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb, normalizeColorInput, relativeLuminance, calculateContrast, isLightColor, adjustHsl, generateColorScale } from '../src/color'

describe('color utils', () => {
  it('hexToRgb & rgbToHex', () => {
    const rgb = hexToRgb('#20a53a')!
    expect(rgbToHex(rgb.r, rgb.g, rgb.b)).toBe('#20a53a')
  })
  it('hexToRgb invalid and 3-digit', () => {
    expect(hexToRgb('#xyz')).toBeNull()
    expect(hexToRgb('xyz')).toBeNull()
    const rgb3 = hexToRgb('#0f3')!
    expect(rgb3).toEqual({ r: 0x00, g: 0xff, b: 0x33 })
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
  })
  it('rgbToHsl & hslToRgb', () => {
    const hsl = rgbToHsl(32, 165, 58)
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l)
    expect(rgb.r).toBeGreaterThan(0)
  })
  it('rgbToHsl achromatic and primary hues', () => {
    // 灰度（s=0）
    const g = rgbToHsl(128, 128, 128)
    expect(g.s).toBeCloseTo(0, 5)
    // 纯红/绿/蓝分别落在 0/1/3 区段
    const r = rgbToHsl(255, 0, 0)
    const gn = rgbToHsl(0, 255, 0)
    const b = rgbToHsl(0, 0, 255)
    expect(r.h).toBeGreaterThanOrEqual(0)
    expect(gn.h).toBeGreaterThan(r.h)
    expect(b.h).toBeGreaterThan(gn.h)
  })
  it('normalizeColorInput', () => {
    expect(normalizeColorInput('#000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(normalizeColorInput({ r: 0, g: 0, b: 0 })).toEqual({ r: 0, g: 0, b: 0 })
    // HSL 输入与无效字符串
    expect(normalizeColorInput({ h: 0.3, s: 0, l: 0.5 } as any)).toEqual({ r: 128, g: 128, b: 128 })
    expect(normalizeColorInput(null as any)).toBeNull()
    // 无效对象应返回 null（触发最终 return null 分支）
    expect(normalizeColorInput({ foo: 'bar' } as any)).toBeNull()
  })
  it('relative luminance & contrast', () => {
    const L = relativeLuminance({ r: 255, g: 255, b: 255 })
    expect(L).toBeGreaterThan(0.9)
    const c = calculateContrast({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })
    expect(c).toBeGreaterThan(20)
  })
  it('isLightColor', () => {
    expect(isLightColor('#ffffff')).toBe(true)
    expect(isLightColor('#000000')).toBe(false)
    expect(isLightColor('#zzzzzz')).toBe(false)
    // 触发对象分支
    expect(isLightColor({ r: 200, g: 200, b: 200 })).toBe(true)
  })
  it('adjustHsl & generateColorScale', () => {
    const rgb = adjustHsl({ r: 32, g: 165, b: 58 }, 0, 1.1, 1.1)
    expect(rgb.r).toBeGreaterThan(0)
    const scale = generateColorScale('#20a53a', 'hex') as any
    expect(scale.base).toBe('#20a53a')
    expect(scale.light3).toMatch(/^#/)
  })
  it('hslToRgb edge and generateColorScale rgb/invalid', () => {
    // s=0 灰度
    expect(hslToRgb(0.3, 0, 0.5)).toEqual({ r: 128, g: 128, b: 128 })
    // rgb 格式
    const scale = generateColorScale('#20a53a', 'rgb') as any
    expect(scale.base).toHaveProperty('r')
    // 无效 hex 抛错
    expect(() => generateColorScale('invalid', 'hex')).toThrow()
  })

  it('rgbToHsl branches: l>0.5 uses (2-max-min) & g<b adds 6', () => {
    // l > 0.5 分支
    const light = rgbToHsl(250, 240, 230)
    expect(light.l).toBeGreaterThan(0.5)
    expect(light.s).toBeGreaterThan(0)

    // r 为 max 且 g < b，触发 (g < b ? 6 : 0) 的 6 分支
    const hsl = rgbToHsl(200, 0, 100)
    expect(hsl.h).toBeCloseTo(0.9167, 3)
  })

  it('hslToRgb hue2rgb wrap-around: t<0 / t>1 / t<2/3 分支', () => {
    // 触发 t>1 与 t<2/3，且走 l>=0.5 的 q 分支
    const rgb1 = hslToRgb(0.9, 0.8, 0.8)
    expect(rgb1).toEqual({ r: 245, g: 163, b: 212 })

    // 触发 t<0 且走 l<0.5 的 q 分支
    const rgb2 = hslToRgb(0.1, 0.7, 0.4)
    expect(rgb2).toEqual({ r: 173, g: 116, b: 31 })
  })

  it('adjustHsl default args should be near identity', () => {
    const src = { r: 30, g: 60, b: 90 }
    const out = adjustHsl(src)
    const diff = (a: number, b: number) => Math.abs(a - b)
    // 允许转换四舍五入带来的最大 1 误差
    expect(diff(out.r, src.r)).toBeLessThanOrEqual(1)
    expect(diff(out.g, src.g)).toBeLessThanOrEqual(1)
    expect(diff(out.b, src.b)).toBeLessThanOrEqual(1)
  })

  it('generateColorScale default format is hex', () => {
    const scale = generateColorScale('#20a53a') as any
    expect(scale.base).toBe('#20a53a')
    expect(scale.light7).toMatch(/^#/)
  })
})