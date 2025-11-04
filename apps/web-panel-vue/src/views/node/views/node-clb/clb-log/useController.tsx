import { formatTime, addDay } from '@/utils/date'
import { useClbLogStore } from './useStore'
import { exportHttpClbLog, exportTcpUdpClbLog } from '@/api/node'
import { Message } from '@/hooks/tools'

import { useNodeClbStore } from '../useStore'
const { activeTabs } = useNodeClbStore()

const { logCustomDate, currentDate } = useClbLogStore()

export const exportLog = async (row?: any) => {
	const res = activeTabs.value === 'http' ? await exportHttpClbLog({ load_id: row.load_id, date: currentDate.value }) : await exportTcpUdpClbLog({ load_id: row.load_id, date: currentDate.value })
	if (res.status) {
		window.open('/download?filename=' + res.data.filename)
	} else {
		Message.error('导出失败')
	}
}

export const getLogDateParam = (tabType: string) => {
	let selectedDate = ''
	if (tabType === 'today') {
		selectedDate = formatTime(new Date(), 'yyyy-MM-dd')
	}
	if (tabType === 'yesterday') {
		selectedDate = formatTime(addDay(-1), 'yyyy-MM-dd')
	}
	if (tabType === 'custom') {
		selectedDate = logCustomDate?.value
	}
	currentDate.value = selectedDate
	return selectedDate
}

export function parseLogTime(logTime: string): string {
	const match = logTime.match(/^(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})/)
	if (!match) return logTime
	const [, day, monStr, year, hour, min, sec] = match
	const monthMap: Record<string, string> = {
		Jan: '01',
		Feb: '02',
		Mar: '03',
		Apr: '04',
		May: '05',
		Jun: '06',
		Jul: '07',
		Aug: '08',
		Sep: '09',
		Oct: '10',
		Nov: '11',
		Dec: '12',
	}
	const month = monthMap[monStr]
	return `${year}-${month}-${day} ${hour}:${min}:${sec}`
}
