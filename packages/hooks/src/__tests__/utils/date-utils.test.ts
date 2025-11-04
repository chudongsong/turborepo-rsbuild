import {
	formatTime,
	getSimplifyTime,
	addDay,
	getTimeFrame,
	conversionTime,
	getStartTime,
	getDuration,
} from '../../utils/date-utils/time'

describe('Date Utils Tests', () => {
	describe('formatTime', () => {
		it('should format date with default format', () => {
			const date = new Date('2024-01-15 14:30:45')
			const result = formatTime(date)
			expect(result).toMatch(/^2024-01-15 \d{2}:\d{2}:\d{2}$/)
		})

		it('should format date with custom format', () => {
			const date = new Date('2024-01-15 14:30:45')
			const result = formatTime(date, 'yyyy/MM/dd')
			expect(result).toBe('2024/01/15')
		})

		it('should handle 24-hour format', () => {
			const date = new Date('2024-01-15 22:30:45')
			const result = formatTime(date, 'yyyy-MM-dd HH:mm', true)
			expect(result).toContain('22')
		})

		it('should handle 12-hour format', () => {
			const date = new Date('2024-01-15 22:30:45')
			const result = formatTime(date, 'yyyy-MM-dd hh:mm', false)
			expect(result).toContain('10')
		})

		it('should handle timestamp (milliseconds)', () => {
			const timestamp = 1705327845000 // 2024-01-15 14:30:45
			const result = formatTime(timestamp, 'yyyy-MM-dd')
			expect(result).toBe('2024-01-15')
		})

		it('should handle timestamp (seconds)', () => {
			const timestamp = 1705327845 // seconds
			const result = formatTime(timestamp, 'yyyy-MM-dd')
			expect(result).toBe('2024-01-15')
		})

		it('should use current date when no time provided', () => {
			const result = formatTime(undefined, 'yyyy')
			const currentYear = new Date().getFullYear().toString()
			expect(result).toBe(currentYear)
		})
	})

	describe('getSimplifyTime', () => {
		it('should return "刚刚" for future time', () => {
			const future = Date.now() + 10000
			const result = getSimplifyTime(future)
			expect(result).toBe('刚刚')
		})

		it('should return "刚刚" for recent time', () => {
			const now = Date.now()
			const result = getSimplifyTime(now)
			expect(result).toBe('刚刚')
		})

		it('should return minutes ago', () => {
			const minutesAgo = Date.now() - 5 * 60 * 1000
			const result = getSimplifyTime(minutesAgo)
			expect(result).toContain('分钟')
		})

		it('should return hours ago', () => {
			const hoursAgo = Date.now() - 3 * 60 * 60 * 1000
			const result = getSimplifyTime(hoursAgo)
			expect(result).toContain('小时')
		})

		it('should return days ago', () => {
			const daysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000
			const result = getSimplifyTime(daysAgo)
			expect(result).toContain('天')
		})

		it('should handle timestamp in seconds', () => {
			const secondsAgo = Math.floor((Date.now() - 5 * 60 * 1000) / 1000)
			const result = getSimplifyTime(secondsAgo)
			expect(result).toContain('分钟')
		})
	})

	describe('addDay', () => {
		it('should add days to date', () => {
			const date = new Date('2024-01-15')
			const result = addDay(5, date)
			const expected = new Date('2024-01-20')
			expect(result.getTime()).toBe(expected.getTime())
		})

		it('should subtract days with negative number', () => {
			const date = new Date('2024-01-15')
			const result = addDay(-5, date)
			const expected = new Date('2024-01-10')
			expect(result.getTime()).toBe(expected.getTime())
		})

		it('should handle date string', () => {
			const result = addDay(1, '2024-01-15')
			const expected = new Date('2024-01-16')
			expect(result.getTime()).toBe(expected.getTime())
		})

		it('should use current date when not provided', () => {
			const result = addDay(1)
			const expected = new Date()
			expected.setDate(expected.getDate() + 1)
			expect(result.getFullYear()).toBe(expected.getFullYear())
			expect(result.getMonth()).toBe(expected.getMonth())
			expect(result.getDate()).toBe(expected.getDate())
		})
	})

	describe('getTimeFrame', () => {
		it('should return time frame for specified days', () => {
			const result = getTimeFrame(7)
			expect(result).toHaveLength(2)
			expect(result[0]).toBeLessThan(result[1])
		})

		it('should include today when isToday is true', () => {
			const result = getTimeFrame(1, true)
			const end = new Date().getTime()
			expect(result[1]).toBeGreaterThanOrEqual(end - 1000) // Allow 1s tolerance
		})

		it('should not include today when isToday is false', () => {
			const result = getTimeFrame(1, false)
			const end = new Date().getTime()
			expect(result[1]).toBeLessThan(end)
		})
	})

	describe('conversionTime', () => {
		it('should convert "today" to time frame', () => {
			const result = conversionTime('today')
			expect(result).toHaveLength(2)
			expect(result[0]).toBeLessThanOrEqual(result[1])
		})

		it('should convert "yesterday" to time frame', () => {
			const result = conversionTime('yesterday')
			expect(result).toHaveLength(2)
		})

		it('should convert "l7" to 7 days frame', () => {
			const result = conversionTime('l7')
			const days7 = getTimeFrame(7)
			// The result should be approximately 7 days
			const diff = Math.abs(result[1] - result[0] - 7 * 24 * 60 * 60 * 1000)
			expect(diff).toBeLessThanOrEqual(24 * 60 * 60 * 1000)
		})

		it('should convert "l30" to 30 days frame', () => {
			const result = conversionTime('l30')
			expect(result).toHaveLength(2)
		})

		it('should default to today for unknown values', () => {
			const result = conversionTime('unknown')
			const today = getTimeFrame(0, true)
			expect(result).toEqual(today)
		})
	})

	describe('getStartTime', () => {
		it('should get start of day', () => {
			const date = new Date('2024-01-15 14:30:45')
			const result = getStartTime(date, 'day')
			expect(result.getHours()).toBe(0)
			expect(result.getMinutes()).toBe(0)
			expect(result.getSeconds()).toBe(0)
		})

		it('should get start of hour', () => {
			const date = new Date('2024-01-15 14:30:45')
			const result = getStartTime(date, 'hour')
			expect(result.getMinutes()).toBe(0)
			expect(result.getSeconds()).toBe(0)
		})

		it('should get start of month', () => {
			const date = new Date('2024-01-15 14:30:45')
			const result = getStartTime(date, 'month')
			expect(result.getMonth()).toBe(0)
			expect(result.getDate()).toBe(1)
			expect(result.getHours()).toBe(0)
		})

		it('should handle timestamp', () => {
			const timestamp = new Date('2024-01-15 14:30:45').getTime()
			const result = getStartTime(timestamp, 'day')
			expect(result.getHours()).toBe(0)
		})
	})

	describe('getDuration', () => {
		it('should format seconds to days format', () => {
			const result = getDuration(90000) // 1 day, 1 hour, 0 minutes, 0 seconds
			expect(result).toContain('天')
			expect(result).toContain('小时')
		})

		it('should format seconds to hours format', () => {
			const result = getDuration(7500) // 2 hours, 5 minutes, 0 seconds
			expect(result).toContain('小时')
			expect(result).toContain('分')
		})

		it('should format seconds to minutes format', () => {
			const result = getDuration(125) // 2 minutes, 5 seconds
			expect(result).toContain('分')
			expect(result).toContain('秒')
		})

		it('should format seconds to seconds format', () => {
			const result = getDuration(45)
			expect(result).toBe('45秒')
		})

		it('should handle zero seconds', () => {
			const result = getDuration(0)
			expect(result).toBe('0秒')
		})
	})
})
