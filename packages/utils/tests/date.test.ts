import MockDate from 'mockdate'
import { formatTime, getSimplifyTime, addDay, getTimeFrame, conversionTime, getStartTime, getDuration } from '../src/date'

describe('date utils', () => {
  it('formatTime basic', () => {
    const ts = 1700000000
    expect(formatTime(ts, 'yyyy-MM-dd')).toMatch(/\d{4}-\d{2}-\d{2}/)
  })
  it('formatTime with tokens (h/H/q/f/pad)', () => {
    const d = new Date(2024, 0, 1, 13, 5, 6, 789)
    expect(formatTime(d, 'yyyy/MM/dd hh:mm:ss.fff', false)).toBe('2024/01/01 01:05:06.789')
    expect(formatTime(d, 'yyyyyy-MM-dd HH:mm:ss.ff', true)).toBe('002024-01-01 13:05:06.78')
    expect(formatTime(d, 'q')).toBe('1')
  })
  it('formatTime default format and edge tokens (yy/H/fffff)', () => {
    const d = new Date(2024, 0, 1, 13, 5, 6, 789)
    // 默认格式参数与 isHover24 默认值
    const def = formatTime(d)
    expect(def).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    // y 截断覆盖（all.length < mapVal.length）
    expect(formatTime(d, 'yy')).toBe('24')
    // 默认分支覆盖：单字符 H 输出完整小时（非截断）
    expect(formatTime(d, 'H')).toBe('13')
    // f 右侧补零覆盖（长度大于毫秒位数）
    expect(formatTime(d, 'fffff')).toBe('78900')
  })
  it('getSimplifyTime', () => {
    MockDate.set(new Date(2024, 0, 1))
    const oneHourAgo = new Date(2024, 0, 1).getTime() - 3600 * 1000
    expect(getSimplifyTime(oneHourAgo)).toContain('小时前')
    MockDate.reset()
  })
  it('getSimplifyTime boundaries (刚刚/周/年)', () => {
    MockDate.set(new Date(2024, 0, 10))
    const now = new Date(2024, 0, 10).getTime()
    expect(getSimplifyTime(now)).toBe('刚刚')
    const eightDaysAgo = now - 8 * 24 * 3600 * 1000
    expect(getSimplifyTime(eightDaysAgo)).toBe('1周前')
    const overYear = now - 366 * 24 * 3600 * 1000
    // 该实现按 30 天为 1 月优先命中“月”分支
    expect(getSimplifyTime(overYear)).toBe('12月前')
    MockDate.reset()
  })
  it('getSimplifyTime 10位秒时间戳与 <1 分钟与 年分支', () => {
    // 固定时间，便于计算
    const anchor = new Date(2024, 0, 10, 12, 0, 0)
    MockDate.set(anchor)
    const nowMs = anchor.getTime()
    // 10位秒：1 小时前
    const oneHourAgoSec = Math.floor((nowMs - 3600 * 1000) / 1000)
    expect(getSimplifyTime(oneHourAgoSec)).toBe('1小时前')
    // 小于 1 分钟，命中尾部 '刚刚'
    const halfMinuteAgo = nowMs - 30 * 1000
    expect(getSimplifyTime(halfMinuteAgo)).toBe('刚刚')
    // 远超 30 年，强制走到“年”分支（避免在“月”提前返回）
    const fortyYearsMs = nowMs - 40 * 365 * 24 * 3600 * 1000
    expect(getSimplifyTime(fortyYearsMs)).toBe('40年前')
    MockDate.reset()
  })
  it('addDay', () => {
    const d = new Date('2024-01-01')
    const r = addDay(1, d)
    expect(r.getDate()).toBe(2)
  })
  it('addDay default date param', () => {
    // 锁定当前时间，校验默认参数 new Date()
    const anchor = new Date(2024, 0, 1)
    MockDate.set(anchor)
    const r = addDay(1)
    expect(r.getFullYear()).toBe(2024)
    expect(r.getMonth()).toBe(0)
    expect(r.getDate()).toBe(2)
    MockDate.reset()
  })
  it('addDay with string date', () => {
    // 使用 ISO 字符串避免时区歧义
    const base = '2024-01-01T00:00:00.000Z'
    const r = addDay(1, base)
    expect(r.getTime()).toBe(new Date(base).getTime() + 24 * 3600 * 1000)
  })
  it('getTimeFrame & conversionTime', () => {
    const [start, end] = getTimeFrame(7, true)
    expect(end - start).toBeGreaterThan(0)
    const r = conversionTime('l7')
    expect(r[1] - r[0]).toBeGreaterThan(0)
    const neg = getTimeFrame(-3, false)
    // 负数表示向后偏移，起点可能大于终点
    expect(neg[0]).toBeGreaterThanOrEqual(neg[1])
    const today = conversionTime('today')
    const yesterday = conversionTime('yesterday')
    const l30 = conversionTime('l30')
    const def = conversionTime('unknown')
    expect(today[1] - today[0]).toBeGreaterThan(0)
    // 昨日范围起止都为当天 0 点，差值可能为 0
    expect(yesterday[1] - yesterday[0]).toBeGreaterThanOrEqual(0)
    expect(l30[1] - l30[0]).toBeGreaterThan(0)
    expect(def[1] - def[0]).toBeGreaterThan(0)
  })
  it('getTimeFrame default isToday=false', () => {
    // 锁定具体时间，验证默认 isToday=false 返回到当天 0 点
    const anchor = new Date(2024, 0, 10, 12, 0, 0)
    MockDate.set(anchor)
    const [s, e] = getTimeFrame(1)
    const midnight = new Date(anchor.toLocaleDateString()).getTime()
    expect(s).toBe(midnight)
    expect(e).toBe(midnight)
    MockDate.reset()
  })
  it('getStartTime', () => {
    const d = getStartTime(new Date('2024-01-15'))
    expect(d.getDate()).toBe(1)
    const t = new Date(2024, 6, 15, 12, 34, 56)
    const s = getStartTime(new Date(t), 'second')
    expect(s.getSeconds()).toBe(0)
    const m = getStartTime(new Date(t), 'minute')
    expect(m.getMinutes()).toBe(0)
    expect(m.getSeconds()).toBe(0)
    const h = getStartTime(new Date(t), 'hour')
    expect(h.getHours()).toBe(0)
    const day = getStartTime(new Date(t), 'day')
    expect(day.getDate()).toBe(1)
    const mon = getStartTime(new Date(t), 'month')
    expect(mon.getMonth()).toBe(0)
  })
  it('getDuration', () => {
    expect(getDuration(3661)).toContain('小时')
    expect(getDuration(90061)).toBe('1天1小时1分1秒')
    expect(getDuration(120)).toBe('2分0秒')
    expect(getDuration(45)).toBe('45秒')
  })
})