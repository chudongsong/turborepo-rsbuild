import { isDate, isString } from './type'
import { getRepeatChar } from './data'

export type Time = DateConstructor | Date | number | string

const getDefaultDate = (time?: Time) => {
	let date: Time = new Date()
	if (isDate(time)) date = time
	time = Math.round(time as number)
	const str = time.toString()
	if (str.length === 13) date = new Date(time)
	if (str.length === 10) date = new Date(time * 1000)
	return date
}

/**
 * @description 格式化时间格式
 * @param { Time } time 时间戳 / 时间 Date / 时间字符串
 * @param { string } format 时间格式,可为空
 * @returns { string } 格式化后的时间
 */
export const formatTime = (
	time?: Time,
	format: string = 'yyyy-MM-dd HH:mm:ss',
	isHover24: boolean = false
): string => {
	// 获取默认参数
	const date = getDefaultDate(time) as Date
	// 日期映射
	const map = new Map([
		['y', `${date.getFullYear()}`], // 年份
		['M', `${date.getMonth() + 1}`], // 月份
		['d', `${date.getDate()}`], // 日
		['H', `${date.getHours()}`], // 小时 24
		['m', `${date.getMinutes()}`], // 分
		['s', `${date.getSeconds()}`], // 秒
		['q', `${Math.floor((date.getMonth() + 3) / 3)}`], // 季度
		['f', `${date.getMilliseconds()}`], // 毫秒
	])
	if (!isHover24) {
		// 小时 12
		const hour = Number(map.get('H'))
		if (hour > 12) {
			map.set('h', `${hour - 12}`)
		} else {
			map.set('h', `${hour}`)
		}
	} else {
		map.set('h', map.get('H')!)
	}
	// 转换格式
	let all = ''
	let val = ''
	let fmt = format
	const reg = 'yMdHhmsqf'
	for (let i = 0, n = 0; i < reg.length; i++) {
		n = format.indexOf(reg[i])
		if (n < 0) continue
		all = ''
		for (; n < format.length; n++) {
			if (format[n] !== reg[i]) {
				break
			}
			all += reg[i]
		}
		if (all.length > 0) {
			const mapVal = map.get(reg[i]) || ''
			if (all.length === mapVal.length) {
				val = mapVal
			} else if (all.length > mapVal.length) {
				if (reg[i] === 'f') {
					val = mapVal + getRepeatChar('0', all.length - mapVal.length)
				} else {
					val = getRepeatChar('0', all.length - mapVal.length) + mapVal
				}
			} else {
				switch (reg[i]) {
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

/**
 * @description 返回时间简化缩写
 * @param {number} dateTime 需要转换的时间戳
 * @return {String} 简化后的时间格式
 */
export const getSimplifyTime = (dateTime: number): string => {
	let newDateTime = dateTime
	if (dateTime.toString().length === 10) newDateTime *= 1000

	const now = new Date()
	const nowTime = now.getTime()
	const diffTime = nowTime - newDateTime
	if (diffTime <= 0) return '刚刚'
	const list = [
		{ label: '分钟', num: 60 },
		{ label: '小时', num: 60 },
		{ label: '天', num: 24 },
		{ label: '周', num: 7, cut: true },
		{ label: '月', num: 30, cut: true },
		{ label: '年', num: 365, cut: true },
	]
	let time = 0
	let remaining = 0
	let sumTime = 1000
	for (let i = 0; i < list.length; i++) {
		const item = list[i]
		time = sumTime
		time *= item.num
		if (!item.cut) sumTime = time
		remaining = Math.floor(diffTime / time)
		if (i === list.length - 1 && remaining > 0) {
			return `${remaining}${item.label}前`
		}
		if (i === list.length - 1) {
			break
		}
		if (remaining < list[i + 1].num && remaining > 0) return `${remaining}${item.label}前`
	}
	return '刚刚'
}

// 日期添加天数
export const addDay = (day: number, date: string | Date = new Date()) => {
	if (isString(date)) date = new Date(date)
	const addTimer = date.getTime() + day * 86400000
	return new Date(addTimer)
}

/**
 * @description 获取时间范围
 * @param {number} num 天数
 * @param {boolean} isToday 是否包含今天
 * @returns {Array<number>} 时间范围
 */
export const getTimeFrame = (num: number, isToday: boolean = false): Array<number> => {
	const now = new Date()
	const yesterday = new Date(now.toLocaleDateString()).getTime()
	const start: number = yesterday - (num > 0 ? num - 1 : num) * 86400000
	const end: number = isToday ? now.getTime() : yesterday
	return [start, end]
}

/**
 * @description 将简写的时间转换为天数
 */
export const conversionTime = (time?: string): Array<number> => {
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

export const getStartTime = (
	time?: Time,
	type: 'month' | 'day' | 'hour' | 'minute' | 'second' = 'day'
): Date => {
	const date = getDefaultDate(time)
	switch (type) {
		case 'month':
			date.setMonth(0)
		case 'day':
			date.setDate(1)
		case 'hour':
			date.setHours(0)
		case 'minute':
			date.setMinutes(0)
		case 'second':
			date.setSeconds(0)
	}
	return date
}

/**
 * @description 秒转换天为时分秒
 */
export const getDuration = (second: number): string => {
	let duration = ''
	const days = Math.floor(second / 86400)
	const hours = Math.floor((second % 86400) / 3600)
	const minutes = Math.floor(((second % 86400) % 3600) / 60)
	const seconds = Math.floor(((second % 86400) % 3600) % 60)
	if (days > 0) duration = `${days}天${hours}小时${minutes}分${seconds}秒`
	else if (hours > 0) duration = `${hours}小时${minutes}分${seconds}秒`
	else if (minutes > 0) duration = `${minutes}分${seconds}秒`
	else if (seconds >= 0) duration = `${seconds}秒`
	return duration
}
