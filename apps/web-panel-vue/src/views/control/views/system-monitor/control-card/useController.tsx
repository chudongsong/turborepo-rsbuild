import { GetNetWorkIoByDay } from '@/api/control'
import { useDataHandle, useDialog } from '@/hooks/tools'
import { AxiosCanceler } from '@/hooks/tools/axios/model/axios-cancel'
import { controlValue, networkIoKey, days, acceptAllId, initAllData, changeAllDay, changeNetworkUnit } from '../useController'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { getByteUnit } from '@/utils'

export const updateEvent = () => {
	controlValue.value = true
}

/**
 * @description 打开网络IO统计弹窗
 */
const networkDayDialog = async () => {
	await useDialog({
		isAsync: true,
		title: '网络IO总流量统计',
		area: [70, 50],
		component: () => import('@control/views/system-monitor/control-card/network-day-dialog.vue'),
	})
}

/**
 * 打开网络IO统计弹窗
 */
export const openPopup = (chartModulesRef: any) => {
	// 判断是否为全屏状态
	if (document.fullscreenElement) {
		nextTick(async () => {
			await networkDayDialog()
			if (document.querySelector('.el-overlay')) {
				// 将Dialog的DOM元素添加到需要全屏的元素
				// chartModulesRef.value.$el.appendChild(document.querySelector('.el-dialog__wrapper'))
				chartModulesRef.$el.appendChild(document.querySelector('.el-overlay'))
			}
		})
	} else {
		networkDayDialog()
	}
}

const cutDays = (day: any, type: string) => {
	changeAllDay(day, type)
}

const cutSelect = (day: string) => {
	changeNetworkUnit(day)
}

/**
 * @description: 获取网络IO表格列配置
 * @returns
 */
const useNetworkTableColumn = () => {
	return ref<TableColumnProps[]>([
		{
			label: '时间',
			prop: 'time',
		},
		{
			label: '上行',
			prop: 'total_up',
			render: (row: { total_up: number }) => {
				return getByteUnit(row.total_up)
			},
		},
		{
			label: '下行',
			prop: 'total_down',
			render: (row: { total_down: number }) => {
				return getByteUnit(row.total_down)
			},
		},
	])
}

export const tableColumn = useNetworkTableColumn()
export const loading = ref(false)

const axiosCanceler = new AxiosCanceler()

export const day = ref<number>(30)

export const tableData = ref([]) // 表格数据

export const changeDay = useDebounceFn((val: string) => {
	const numValue = Number(val)
	if (!Number.isInteger(numValue) || numValue <= 0) {
		day.value = 1
		return
	}
	day.value = numValue
	getNetWorkIoByDay(val)
}, 500)

/**
 * @description 获取网络IO每天总流量统计
 * @param {string} day 天数
 * @returns {Promise<void>} void
 */
export const getNetWorkIoByDay = async (day: string): Promise<void> => {
	axiosCanceler.removePending({
		method: 'post',
		url: '/ajax?action=GetNetWorkIoByDay',
	})
	useDataHandle({
		request: GetNetWorkIoByDay({ day }),
		data: [Array, tableData],
		loading,
	})
}
