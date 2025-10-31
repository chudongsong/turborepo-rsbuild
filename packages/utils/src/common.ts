/**
 * 通用工具函数（纯函数）：清理空格、字节单位转换、样式单位、分页总数。
 */

import { isArray, isNull, isNumber, isString } from './types'

/** 清理所有空格 */
export function clearBlankSpace(str: string): string {
  return str.replace(/\s+/g, '')
}

/**
 * 字节转换（到指定单位结束）
 * @param bytes 字节数
 * @param isUnit 是否显示单位后缀
 * @param fixed 小数位数（0 表示按四舍五入）
 * @param endUnit 结束单位（可选：B/KB/MB/GB/TB/PB/EB）
 */
export function getByteUnit(bytes: number = 0, isUnit: boolean = true, fixed: number = 2, endUnit: string = ''): string {
  let newBytes = bytes
  const c = 1024
  const units = [' B', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB']
  for (let i = 0; i < units.length; i++) {
    const unit = units[i]
    const showValue = fixed === 0 ? Math.round(newBytes) : newBytes.toFixed(fixed)
    const result: number | string = i === 0 ? newBytes : showValue
    if (endUnit) {
      if (unit.trim() === endUnit.trim()) {
        return isUnit ? String(result) + unit : String(result)
      }
    } else if (newBytes < c) {
      return isUnit ? String(result) + unit : String(result)
    }
    newBytes /= c
  }
  return ''
}

/** 返回样式值加单位 */
export function getStyleUnit(val: string | number, unit: string = 'rem'): string {
  return isNull(val) ? String(val) : `${val}${unit}`
}

/** 获取分页总数（解析简单 HTML 文本）*/
export function getPageTotal(page: string): number {
  const match = page.match(/class='Pcount'>共([0-9]*)条</)
  if (isArray(match) && match.length >= 2) return Number(match[1])
  return 0
}