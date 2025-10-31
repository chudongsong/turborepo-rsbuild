/**
 * 日期与时间工具函数
 */

import { isDate, isString } from './types'

export type Time = DateConstructor | Date | number | string

function getDefaultDate(time?: Time): Date {
  let date: Time = new Date()
  if (isDate(time)) date = time
  const num = Math.round(time as number)
  const str = String(num)
  if (str.length === 13) date = new Date(num)
  if (str.length === 10) date = new Date(num * 1000)
  return date as Date
}

/**
 * 格式化时间
 * @param time 时间戳/Date/字符串
 * @param format 格式，默认 yyyy-MM-dd HH:mm:ss
 * @param isHover24 小时是否强制 24 制（兼容原逻辑）
 */
export function formatTime(time?: Time, format: string = 'yyyy-MM-dd HH:mm:ss', isHover24: boolean = false): string {
  const date = getDefaultDate(time)
  const map = new Map<string, string>([
    ['y', `${date.getFullYear()}`],
    ['M', `${date.getMonth() + 1}`],
    ['d', `${date.getDate()}`],
    ['H', `${date.getHours()}`],
    ['m', `${date.getMinutes()}`],
    ['s', `${date.getSeconds()}`],
    ['q', `${Math.floor((date.getMonth() + 3) / 3)}`],
    ['f', `${date.getMilliseconds()}`],
  ])
  if (!isHover24) {
    const hour = Number(map.get('H'))
    map.set('h', `${hour > 12 ? hour - 12 : hour}`)
  } else {
    map.set('h', map.get('H')!)
  }
  let fmt = format
  const reg = 'yMdHhmsqf'
  for (let i = 0; i < reg.length; i++) {
    const ch = reg[i]
    let n = format.indexOf(ch)
    if (n < 0) continue
    let all = ''
    while (n < format.length && format[n] === ch) {
      all += ch
      n += 1
    }
    /* istanbul ignore else */
    if (all.length > 0) {
      const mapVal = map.get(ch) || /* istanbul ignore next */ ''
      let val = ''
      if (all.length === mapVal.length) {
        val = mapVal
      } else if (all.length > mapVal.length) {
        if (ch === 'f') {
          val = mapVal + '0'.repeat(all.length - mapVal.length)
        } else {
          val = '0'.repeat(all.length - mapVal.length) + mapVal
        }
      } else {
        switch (ch) {
          case 'y':
            val = mapVal.substring(mapVal.length - all.length)
            break
          case 'f':
            val = mapVal.substring(0, all.length)
            break
          default:
            val = mapVal
            break
        }
      }
      fmt = fmt.replace(all, val)
    }
  }
  return fmt
}

/** 返回时间简化缩写（例如：3天前、刚刚）*/
export function getSimplifyTime(dateTime: number): string {
  let newDateTime = dateTime
  if (String(dateTime).length === 10) newDateTime *= 1000
  const now = Date.now()
  const diffTime = now - newDateTime
  if (diffTime <= 0) return '刚刚'
  const list = [
    { label: '分钟', num: 60 },
    { label: '小时', num: 60 },
    { label: '天', num: 24 },
    { label: '周', num: 7, cut: true },
    { label: '月', num: 30, cut: true },
    { label: '年', num: 365, cut: true },
  ] as const
  let sumTime = 1000
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    const time = sumTime * item.num
    if (!('cut' in item)) sumTime = time
    const remaining = Math.floor(diffTime / time)
    if (i === list.length - 1 && remaining > 0) return `${remaining}${item.label}前`
    if (i === list.length - 1) break
    if (remaining < list[i + 1].num && remaining > 0) return `${remaining}${item.label}前`
  }
  return '刚刚'
}

/** 日期添加天数 */
export function addDay(day: number, date: string | Date = new Date()): Date {
  const d = isString(date) ? new Date(date) : (date as Date)
  const addTimer = d.getTime() + day * 86400000
  return new Date(addTimer)
}

/** 获取时间范围（近 N 天）*/
export function getTimeFrame(num: number, isToday: boolean = false): [number, number] {
  const now = new Date()
  const yesterday = new Date(now.toLocaleDateString()).getTime()
  const start = yesterday - (num > 0 ? num - 1 : num) * 86400000
  const end = isToday ? now.getTime() : yesterday
  return [start, end]
}

/** 将简写的时间转换为范围 */
export function conversionTime(time?: string): [number, number] {
  let days = 0
  let isToday = false
  switch (time) {
    case 'today':
      isToday = true
      break
    case 'yesterday':
      days = 1
      break
    case 'l7':
      days = 7
      break
    case 'l30':
      days = 30
      break
    default:
      isToday = true
      break
  }
  return getTimeFrame(days, isToday)
}

/** 获取起始时间（对齐到月/日/时/分/秒起点）*/
export function getStartTime(time?: Time, type: 'month' | 'day' | 'hour' | 'minute' | 'second' = 'day'): Date {
  const date = getDefaultDate(time)
  switch (type) {
    case 'month':
      date.setMonth(0)
    // fallthrough
    case 'day':
      date.setDate(1)
    // fallthrough
    case 'hour':
      date.setHours(0)
    // fallthrough
    case 'minute':
      date.setMinutes(0)
    // fallthrough
    case 'second':
      date.setSeconds(0)
  }
  return date
}

/** 秒转为“天时分秒”描述 */
export function getDuration(second: number): string {
  const days = Math.floor(second / 86400)
  const hours = Math.floor((second % 86400) / 3600)
  const minutes = Math.floor(((second % 86400) % 3600) / 60)
  const seconds = Math.floor(((second % 86400) % 3600) % 60)
  if (days > 0) return `${days}天${hours}小时${minutes}分${seconds}秒`
  if (hours > 0) return `${hours}小时${minutes}分${seconds}秒`
  if (minutes > 0) return `${minutes}分${seconds}秒`
  return `${seconds}秒`
}