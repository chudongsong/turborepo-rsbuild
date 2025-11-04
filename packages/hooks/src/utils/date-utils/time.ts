import { curry } from 'ramda'
import { isString, isDate, isNumber } from '../type-utils/is'

export type Time = DateConstructor | Date | number | string

/**
 * Get a default date from various input types
 * @param time - Time input (Date, timestamp, or string)
 * @returns Date object
 */
const getDefaultDate = (time?: Time): Date => {
	let date: Time = new Date()
	if (isDate(time)) {
		date = time
	}
	time = Math.round(time as number)
	const str = time.toString()
	if (str.length === 13) {
		date = new Date(time)
	}
	if (str.length === 10) {
		date = new Date(time * 1000)
	}
	return date
}

/**
 * Format time to specified format
 * @param time - Time to format (optional, defaults to current time)
 * @param format - Format string (default: 'yyyy-MM-dd HH:mm:ss')
 * @param isHover24 - Whether to use 24-hour format (default: false)
 * @returns Formatted time string
 */
export const formatTime = curry(
	(
		time?: Time,
		format: string = 'yyyy-MM-dd HH:mm:ss',
		isHover24: boolean = false
	): string => {
		const date = getDefaultDate(time) as Date

		// Date mapping
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

		// Handle 12/24 hour format
		if (!isHover24) {
			const hour = Number(map.get('H'))
			if (hour > 12) {
				map.set('h', `${hour - 12}`)
			} else {
				map.set('h', `${hour}`)
			}
		} else {
			map.set('h', map.get('H')!)
		}

		// Convert format
		let all = ''
		let val = ''
		let fmt = format
		const reg = 'yMdHhmsqf'

		for (let i = 0; i < reg.length; i++) {
			const regChar = reg[i]
			let n = format.indexOf(regChar)

			if (n < 0) continue

			all = ''
			for (; n < format.length; n++) {
				if (format[n] !== regChar) {
					break
				}
				all += regChar
			}

			if (all.length > 0) {
				const mapVal = map.get(regChar) || ''

				if (all.length === mapVal.length) {
					val = mapVal
				} else if (all.length > mapVal.length) {
					if (regChar === 'f') {
						val = mapVal + '0'.repeat(all.length - mapVal.length)
					} else {
						val = '0'.repeat(all.length - mapVal.length) + mapVal
					}
				} else {
					switch (regChar) {
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
)

/**
 * Get simplified time string (e.g., "5 minutes ago")
 * @param dateTime - Timestamp in milliseconds or seconds
 * @returns Simplified time string
 */
export const getSimplifyTime = (dateTime: number): string => {
	let newDateTime = dateTime
	if (dateTime.toString().length === 10) {
		newDateTime *= 1000
	}

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

		if (!item.cut) {
			sumTime = time
		}

		remaining = Math.floor(diffTime / time)

		if (i === list.length - 1 && remaining > 0) {
			return `${remaining}${item.label}前`
		}

		if (i === list.length - 1) {
			break
		}

		if (remaining < list[i + 1].num && remaining > 0) {
			return `${remaining}${item.label}前`
		}
	}

	return '刚刚'
}

/**
 * Add days to a date
 * @param day - Number of days to add (can be negative)
 * @param date - Date to add to (defaults to current date)
 * @returns New date with days added
 */
export const addDay = (day: number, date: string | Date = new Date()): Date => {
	if (isString(date)) {
		date = new Date(date)
	}
	const addTimer = date.getTime() + day * 86400000
	return new Date(addTimer)
}

/**
 * Get time frame (start and end timestamps)
 * @param num - Number of days
 * @param isToday - Whether to include today (default: false)
 * @returns Array of [startTime, endTime] in milliseconds
 */
export const getTimeFrame = (
	num: number,
	isToday: boolean = false
): [number, number] => {
	const now = new Date()
	const yesterday = new Date(now.toLocaleDateString()).getTime()
	const start: number = yesterday - (num > 0 ? num - 1 : num) * 86400000
	const end: number = isToday ? now.getTime() : yesterday
	return [start, end]
}

/**
 * Convert simplified time string to time frame
 * @param time - Time identifier ('today', 'yesterday', 'l7', 'l30')
 * @returns Array of [startTime, endTime] in milliseconds
 */
export const conversionTime = (time?: string): [number, number] => {
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

/**
 * Get the start of a time unit
 * @param time - Time input (optional)
 * @param type - Time unit type ('month', 'day', 'hour', 'minute', 'second')
 * @returns Date at the start of the specified unit
 */
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
 * Convert seconds to human-readable duration
 * @param second - Number of seconds
 * @returns Formatted duration string (e.g., "2 hours 30 minutes")
 */
export const getDuration = (second: number): string => {
	let duration = ''
	const days = Math.floor(second / 86400)
	const hours = Math.floor((second % 86400) / 3600)
	const minutes = Math.floor(((second % 86400) % 3600) / 60)
	const seconds = Math.floor(((second % 86400) % 3600) % 60)

	if (days > 0) {
		duration = `${days}天${hours}小时${minutes}分${seconds}秒`
	} else if (hours > 0) {
		duration = `${hours}小时${minutes}分${seconds}秒`
	} else if (minutes > 0) {
		duration = `${minutes}分${seconds}秒`
	} else if (seconds >= 0) {
		duration = `${seconds}秒`
	}

	return duration
}
