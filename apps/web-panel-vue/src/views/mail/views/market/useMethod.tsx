import { useLocalStorage } from '@vueuse/core'

// 添加天数到指定日期
export function addDays(date: Date, days: number): Date {
	const result = new Date(date)
	result.setDate(result.getDate() + days)
	return result
}

// 获取指定日期的开始时间（00:00:00.000）
export function startOfDay(date: Date | number): Date {
	const result = new Date(date)
	result.setHours(0, 0, 0, 0)
	return result
}

// 获取指定日期的结束时间（23:59:59.999）
export function endOfDay(date: Date | number): Date {
	const result = new Date(date)
	result.setHours(23, 59, 59, 999)
	return result
}

/**
 * @description 将值转换为数字
 * @param value 需要转换的值
 * @returns number
 */
function toNumber(value: unknown): number {
	if (value === null || value === undefined) return 0
	if (typeof value === 'number') return value
	if (typeof value === 'boolean') return value ? 1 : 0

	// 处理字符串
	if (typeof value === 'string') {
		const parsed = parseFloat(value)
		return Number.isNaN(parsed) ? 0 : parsed
	}

	return 0
}

/**
 * @description 转化数字，将非数字转化为0
 * @param val 值
 * @returns
 */
export const getNumber = (val: unknown) => {
	return !Number.isNaN(toNumber(val)) ? toNumber(val) : 0
}

export const menu = useLocalStorage('menu-mail-market', 'overview')

export const tempId = ref<null | number>(null)

export const taskShowVisible = ref(false)

export const typeId = ref(-1)

export const setMenu = (val: string) => {
	menu.value = val
}

export const showAddTemplate = (id: number) => {
	setMenu('task')
	tempId.value = id
	nextTick(() => {
		taskShowVisible.value = true
	})
}

export const showContacts = (id: number) => {
	typeId.value = id
	setMenu('contact')
}
