import { delSiteScanLog, getCronTask, getLogAnalysis, getLogAnalysisData, getSiteLogFile, getSpeedLog } from '@/api/logs'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { ResponseResult } from '@/hooks/tools/axios/types'
import { useGlobalStore } from '@/store/global'
import { getPageTotal } from '@/utils'
import { scanOptionsProps } from '@/views/logs/type'
import { LOG_STORE } from '@/views/logs/useStore'
import { LOG_ANALYSE_STORE, useLogAnalyseStore } from './useStore'
import { delTaskStatus, setNewAlarmTask } from '@/api/config'

const Message = useMessage()
const { push } = useGlobalStore()

export const columnData = [
	['xss', 'XSS'],
	['sql', 'SQL'],
	['san', '扫描'],
	['php', 'PHP攻击'],
	['ip', 'IP(top100)'],
	['url', 'URL(top100)'],
] // 表格列数据

const store = LOG_ANALYSE_STORE()
const { routeData, logPath, rowData, msgForm, isRefreshList } = storeToRefs(store)

const { getLogsPath, getLogsTableData, getScanData, startScanTimer, logScanEvent, delAllLogDataEvent, getDetailData, onConfirmScanConfig } = LOG_ANALYSE_STORE()

/**
 * @description 获取日志分析表格数据
 */
export const renderLogAnalysis = async (params: any, props: { name: string; type: string }) => {
	try {
		routeData.value = props

		if (props.type === 'site') {
		} else {
			const { selectedWebSite: website } = storeToRefs(LOG_STORE())
			routeData.value = { name: website.value, type: props.type }
		}
		if (!routeData.value.name) return { data: [], total: 0 }
		await getLogsPath()
		await getScanData()
		return await getLogsTableData({
			...params,
			path: logPath.value,
		})
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description 清空日志
 */
export const delAllLogData = async () => {
	await useConfirm({
		title: `清空扫描日志【${routeData.value.name}】`,
		type: 'input',
		input: { content: '清空日志' },
		icon: 'warning-filled',
		content: '风险操作，清空该扫描日志后，将无法查到以往的扫描日志记录，此操作不可逆，是否继续清空？',
	})
	await delAllLogDataEvent()
	isRefreshList.value = true
}

/**
 * @description 日志扫描事件
 */
export const startLogScan = async () => {
	await useConfirm({
		title: '日志扫描',
		icon: 'warning-filled',
		content: `建议在服务器负载较低时进行安全分析，本次将对【${routeData.value.name}.log】文件进行扫描，可能等待时间较长，是否继续？`,
	})
	const res = await logScanEvent()
	if (!res.status) return Message.error(res.msg)
	startScanTimer()
}

const ipCol = ref([
	{ label: '访问次数', prop: 'num', width: 80 },
	{ label: '访问路径', prop: 'path', showOverflowTooltip: true },
]) // 其他列

/**
 * @description 打开日志详情弹窗
 * @param {} row
 */
export const openLogDetailView = async (row: any, type: string) => {
	rowData.value = row
	rowData.value.type = type
	const data = ['sql', 'san', 'xss', 'php']
	if (!data.includes(type)) {
		ipCol.value[1].label = type === 'url' ? '访问URL' : '访问ip'
	}
	useDialog({
		title: '日志详情',
		area: 72,
		compData: { row, type },
		component: () => import('@logs/views/web-log/analyse-log/log-detail.vue'),
	})
}

const sqlCol = shallowRef([
	{ label: '攻击ip', prop: 'ip' },
	{ label: '攻击时间', prop: 'time' },
	{ label: 'user-agent', prop: 'ua', showOverflowTooltip: true },
	{
		label: '请求URL',
		width: 210,
		render(row: any) {
			if (rowData.value.type === 'san') return row.url
			return <span class="bg-lighter text-danger break-words">{row.url}</span>
		},
	},
]) // sql\xss\san\php公用列

export const tableColumn = ref() // 表格列

export const renderDetailData = async (type: string) => {
	try {
		const { data, status } = await getDetailData()
		const column = ['sql', 'san', 'xss', 'php']
		tableColumn.value = column.includes(type) ? sqlCol.value : ipCol.value
		if (!status) return { data: [], total: 0, other: {} }
		return { data, total: data.length, other: {} }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 提交扫描
 * @param param
 * @param validate
 * @param ref
 */
export const submitScanConfig = async (param: Ref<T>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
	try {
		await validate()
		const { give, cycle, status, task_id } = msgForm.value
		const params = {
			template_id: 110,
			task_data: JSON.stringify({
				task_data: {
					tid: '110',
					type: 'web_log_scan',
					title: 'Web日志扫描告警',
					status,
					count: 0,
					interval: 600,
					project: '',
					site_name: routeData.value.name,
				},
				sender: give || [],
			}),
		}
		let res
		if (status) {
			res = (await useDataHandle({
				request: setNewAlarmTask(params),
				loading: '正在设置定期扫描告警',
				message: true,
			})) as any
		} else {
			if (!task_id) {
				Message.error('请开启自动扫描')
				return false
			}
			res = (await useDataHandle({
				loading: '正在关闭告警任务，请稍候...',
				request: delTaskStatus({ task_id }),
				message: true,
			})) as any
		}
		// 刷新
		isRefreshList.value = true
		return res.status
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化，获取信息配置
 */
export const initPushConfig = async () => {
	push.value.checkedLoad = true
	// await getPushConfigInfo()
	push.value.checkedLoad = false
}

/**
 * @description 打开定期扫描弹窗
 */
export const openPeriodicScan = () => {
	if (logPath.value === '') return Message.error('配置文件丢失')
	useDialog({
		title: '定期扫描',
		area: 48,
		showFooter: true,
		component: () => import('@logs/views/web-log/analyse-log/scan-form.vue'),
	})
}

export const openLogProgress = () => {
	return useDialog({
		title: false,
		component: () => import('./progress.vue'),
		area: 40,
	})
}
