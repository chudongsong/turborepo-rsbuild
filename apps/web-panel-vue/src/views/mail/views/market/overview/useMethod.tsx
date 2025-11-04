import { createEventHook, EventHook } from '@vueuse/core'
import { formatTime, isObject } from '@/utils'
import { getOverviewInfo } from '@/api/mail'

class Singleton {
	private static instance: EventHook<any>
	private constructor() {}

	public static getInstance() {
		if (!Singleton.instance) {
			Singleton.instance = createEventHook<any>()
		}

		return Singleton.instance
	}
}

// 加载状态
export const loading = ref(false)

// 域名
export const domain = ref('value')

// 时间
export const time = ref({
	type: 'today',
	data: getTimeData(),
})

function getStartAndEndDate(date: Date) {
	const start = new Date(date)
	start.setHours(0, 0, 0, 0) // 设置为当天 00:00:00.000

	const end = new Date(date)
	end.setHours(23, 59, 59, 999) // 设置为当天 23:59:59.999

	return { start, end }
}

// 获取时间
function getTimeData(): [number, number] {
	const { start, end } = getStartAndEndDate(new Date())
	return [start.getTime(), end.getTime()]
}

export function useOverview() {
	const fetchResult = Singleton.getInstance()

	function getParams() {
		return {
			...(domain.value !== 'value' ? { domain: domain.value } : {}),
			start_time: Math.floor(time.value.data[0] / 1000),
			end_time: Math.floor(time.value.data[1] / 1000),
		}
	}

	async function getOverview() {
		try {
			loading.value = true
			const { data } = await getOverviewInfo(getParams())
			if (isObject<any>(data)) {
				fetchResult.trigger(data)
			}
		} finally {
			loading.value = false
		}
	}

	const getRate = (val: number) => {
		return val >= 0 ? `${val}%` : '--'
	}

	const getChartTime = (type: string, x: number) => {
		let date = new Date()
		if (type === 'hourly') {
			date.setMinutes(0)
			date.setSeconds(0)
			date.setHours(x)
		} else if (type === 'daily') {
			date = new Date(x * 1000)
		}
		return formatTime(date)
	}

	return {
		getRate,
		getChartTime,
		getOverview,
		onResult: fetchResult.on,
	}
}
