import { crontabDelLog, getLogPath, getLogs } from '@/api/crontab'
import CRONTAB_TASK_STORE from '../useStore'
import { useConfirm, useMessage } from '@/hooks/tools'
import { ws, startTaskEvent } from '../useController'

const Message = useMessage()

const crontanTaskStore = CRONTAB_TASK_STORE()
const { rowData } = storeToRefs(crontanTaskStore)

export const logMsg = ref('正在获取中....') // 日志信息
export const logInfo = ref<any>({
	log_path: '',
	size: '',
}) // 日志信息
export const logDialog = ref(false) // 日志弹窗
export const logContent = ref('') // 日志内容
export const logsData = ref<any>([]) // 日志内容

export const btnActive = ref(0) // 按钮激活状态
export const customTime = ref('') // 自定义时间
export const player = ref<any>() //获取时间选择器
export const refreshNum = ref()
export const refreshForm = reactive({
	status: false,
	time: 3,
})
export const defaultTime = ref<[Date, Date]>([new Date(new Date().setHours(0, 0, 0, 0)), new Date(new Date().setHours(23, 59, 59, 999))])

export const storageData = ref()

export const logsTimeOptions = [
	{ label: '全部', value: 0 },
	{ label: '近7天', value: 1 },
	{ label: '近30天', value: 2 },
	{ label: '自定义时间', value: 3 },
]

/**
 *  @description  设置激活
 * @param num
 */
export const setActive = (num: number) => {
	btnActive.value = num
	if (num !== 3) {
		customTime.value = ''
		getLog(false)
	} else {
		player.value.focus() //出发时间选择器
	}
}

/**
 * @description: 选择时间
 * @param time 		选择的时间
 */
export const selectTime = (time: any) => {
	btnActive.value = 3
	customTime.value = time
	getLog(false)
}

/**
 * @description 获取时间
 */
const getTimes = (time: number) => {
	let times = Number(time)
	times = times < 3 ? 3 : times // 最小3秒
	return times
}

/**
 * @description 获取日志
 */
export const getLog = async (isClick?: boolean) => {
	try {
		if (isClick) refreshNum.value = getTimes(refreshForm.time)
		let start_timestamp: any = 0,
			end_timestamp: any = 0
		if (btnActive.value !== 0) {
			const time = btnActive.value === 1 ? 7 : 30
			const now = new Date().getTime()
			start_timestamp = (new Date(now - time * 24 * 60 * 60 * 1000).getTime() / 1000).toFixed(0)
			end_timestamp = (now / 1000).toFixed(0)
			// 自定义
			if (btnActive.value === 3) {
				start_timestamp = (new Date(customTime.value[0]).getTime() / 1000).toFixed(0)
				end_timestamp = (new Date(customTime.value[1]).getTime() / 1000).toFixed(0)
			}
		} else {
			start_timestamp = ''
			end_timestamp = ''
		}

		const res = await getLogs({ id: rowData.value.id, start_timestamp, end_timestamp })
		logMsg.value = res.data.msg || '暂无日志'
		scrollToBottom()
		if (isClick) getLogPathInfo()
	} catch (error) {
		console.log(error)
	}
}

const scrollToBottom = () => {
	nextTick(() => {
		const el: any = document.querySelector('.pre-box')
		if (el) el.scrollTop = el.scrollHeight
	})
}

/**
 * @description 获取日志路径 大小信息
 */
const getLogPathInfo = async () => {
	try {
		const { data } = await getLogPath({ id: rowData.value.id })
		logInfo.value.log_path = data.log_path
		logInfo.value.size = data.size
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置session数据
 */
export const setSessionData = (form: any) => {
	refreshForm.status = form.status
	refreshForm.time = form.time
	storageData.value[rowData.value.id] = refreshForm
	storageData.value[rowData.value.id].id = rowData.value.id
	sessionStorage.setItem('CRONTAB-LOGS', JSON.stringify(storageData.value))
}

export const initLog = () => {
	// 取出本地存储值
	const storage = sessionStorage.getItem('CRONTAB-LOGS')
	storageData.value = storage ? JSON.parse(storage) : {}
	if (storageData.value && storageData.value[rowData.value.id]) {
		refreshForm.status = storageData.value[rowData.value.id].status
		refreshForm.time = Number(storageData.value[rowData.value.id].time) || 3
		storageData.value[rowData.value.id].id = rowData.value.id
	} else {
		setSessionData({ status: false, time: 5, id: rowData.value.id })
	}

	// 获取日志路径+大小
	getLogPathInfo()
	// 获取日志
	getLog()
}

/**
 * @description 日志事件-清空
 */
export const logEvent = async () => {
	try {
		await useConfirm({ title: '提示', content: '确定清空日志吗？' })
		const res = await crontabDelLog({ id: rowData.value.id })
		Message.request(res)
		getLog(true)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 检查并安装Crontab
 */
export const executeScript = async () => {
	try {
		logDialog.value = true
		logContent.value = ''
		logsData.value = []
		ws.request('/crontab/set_execute_script', {
			customType: 'model',
			onMessage: (data: any) => {
				if (data !== true && data !== 'successful') {
					logsData.value.push(data)
					logContent.value = logsData.value.join('\n')
				}
			},
		})
	} catch (error) {}
}

export const disabledDate = (time: any) => {
	const today = new Date()
	today.setHours(23, 59, 59, 999)
	return time.getTime() > today.getTime()
}

export const startTask = async () => {
	await startTaskEvent(false, true)
	initLog()
}
