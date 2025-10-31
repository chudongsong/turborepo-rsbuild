import { getAllContainerLog, getContainerLog, clearContainerLog, setContainerCutLog } from '@/api/docker'
import { useDataHandle, Message, useConfirm } from '@/hooks/tools'

import { ElDatePicker } from 'element-plus'

export const activeTab = ref('') // 选中的tab

const tableData = ref()
export const tableShow = ref<any>([]) // 要展示的日志
export const loading = ref(false) // 加载状态

// 获取所有日志
export const getAllLog = async ({ list, row }: { list: any[]; row: any }, popupClose: AnyFunction): Promise<void> => {
	// 默认展示showList第一项的日志
	activeTab.value = list?.at(0)?.id || ''
	await useDataHandle({
		loading,
		request: getAllContainerLog(),
		data: Array,
		success: (data: any[]) => {
			// 如果没有日志，就不显示
			if (data.length === 0) {
				Message.error('容器列表为空')
				popupClose()
				return
			}
			tableData.value = data
			tableData.value.forEach((item: any) => {
				// 查找外面容器列表当前页数据的id
				if (list?.findIndex((i: any) => i.id === item.id) > -1) {
					tableShow.value.push(item)
				}
				// 当前页数据的id和外面容器列表当前页数据的id相同，就显示当前项日志
				if (item.id === row.id) activeTab.value = item.id
			})
		},
	})
}

// 销毁
export const unMountHandle = () => {
	activeTab.value = ''
	tableData.value = []
	tableShow.value = []
	loading.value = false
}

// 日志详情
export const defaultTime = ref([new Date(new Date().setHours(0, 0, 0, 0)), new Date(new Date().setHours(23, 59, 59, 999))])
export const log = ref({
	logs: '',
	split_status: true,
	split_type: 'size',
	split_size: 1388444647424,
	split_hour: 2,
	split_minute: 0,
	save: 180,
	logs_path: '',
}) // 日志相关信息
export const day = ref('3') // 日期
export const datePicker = ref([]) // 日期选择器
export const isDate = ref(false) // 是否自定义日期
export const dateData = reactive({
	date: [] as any[],
})
export const options = [
	{ label: '最近3天', value: '3' },
	{ label: '最近7天', value: '7' },
	{ label: '全部', value: 'all' },
] // 日期
let logId: string | number = ''

// 设置快捷日期
export const setQuick = (val: any) => {
	datePicker.value = []
	dateData.date = []
	day.value = val
	isDate.value = false
	getLog()
}

// 设置自定义日期
export const setDate = (datePickerRef: Ref<typeof ElDatePicker>) => {
	datePickerRef.value.handleOpen()
}
// 自定义日期限制
export const pickerOptions = reactive<any>({
	disabledDate: (time: any) => {
		// 获取当前日期
		const today = new Date()

		// 将时间设置为23:59:59
		today.setHours(23, 59, 59, 999)

		// 获取时间戳
		const timestamp = today.getTime()
		return time.getTime() > timestamp
	},
})
// 选择自定义日期
export const changeDate = (val: any) => {
	day.value = ''
	val.forEach((item: any, index: number) => {
		if (index == 1) item.setHours(23, 59, 59, 999)
		dateData.date[index] = Math.floor(item / 1000)
	})
	isDate.value = true
	getLog()
}

// 获取日志
export const getLog = async (isRefresh?: boolean) => {
	const params: any = { id: logId }
	if (day.value != 'all') {
		if (dateData.date.length > 0) {
			// 自定义时间
			params.time_search = dateData.date
		} else {
			// all之外的快捷时间
			// 获取当前时间的时间戳
			const currentTimeStamp = Math.floor(Date.now() / 1000)
			let leastTimeStamp = 0
			if (day.value == '7') {
				// 获取7天前的时间戳
				leastTimeStamp = currentTimeStamp - 7 * 24 * 60 * 60
			} else if (day.value == '3') {
				// 获取3天前的时间戳
				leastTimeStamp = currentTimeStamp - 3 * 24 * 60 * 60
			}
			params.time_search = [leastTimeStamp, currentTimeStamp]
		}
	}
	await useDataHandle({
		request: getContainerLog({ data: JSON.stringify(params) }),
		success: ({ data }: any) => {
			log.value = data
			if (isRefresh) Message.success('刷新成功')
		},
	})
}

// 下载日志
export const downloadLog = async () => {
	if (log.value.logs === '' || log.value.logs_path === '') {
		Message.error('暂无日志可下载')
		return
	}
	console.log('downloadLog', log.value)
	window.open(`/download?filename=${log.value.logs_path}`, '_blank', 'noopener,noreferrer')
}

// 清空日志
export const clearLog = async () => {
	await useConfirm({
		title: `清空日志`,
		content: `删除当前容器的所有日志吗,是否继续！`,
	})

	await useDataHandle({
		request: clearContainerLog({
			log_path: log.value.logs_path,
		}),
		message: true,
		success: ({ status }: { status: boolean }) => {
			if (status) {
				getLog()
			}
		},
	})
}

// 初始化
export const initLog = (props: any) => {
	logId = props.compData.id || ''
	getLog()
}

// 销毁
export const unMountLogHandle = () => {
	log.value = {
		logs: '',
		split_status: true,
		split_type: 'size',
		split_size: 1388444647424,
		split_hour: 2,
		split_minute: 0,
		save: 180,
		logs_path: '',
	}
	day.value = '3'
	datePicker.value = []
	isDate.value = false
	dateData.date = []
}
