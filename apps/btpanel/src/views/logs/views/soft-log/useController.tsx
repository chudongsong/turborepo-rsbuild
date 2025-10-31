import { delSoftLog } from '@/api/logs'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'
import { Message, useConfirm } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { isArray, isObject } from '@/utils'
import { useLogStore } from '../../useStore'
import { LOG_SOFT_STORE, useSoftStore } from './useStore'

type CallBackProps = (res?: any) => void
const { payment } = useGlobalStore()
const { currentName, logsMsg, phpChecked, phpData, mysqlActive, ftpType, logPath, refreshPlugin } = useSoftStore()

const { getSoftLog, getFtpMenu, getFtpLogStatus, startFtpLog, getFtpActionLog, getFtpLogData, delMysqlAllLogEvent, delAllLogDataEvent, getMysqlLogsData, getErrorMysqlData, delSoftLogEvent } = LOG_SOFT_STORE()

export const plugin = ['Docker', '宝塔系统加固', '堡塔防入侵'] // 插件数据

export const productData = {
	title: 'FTP日志-功能介绍',
	ps: '记录FTP登录记录，FTP上传、下载、重命名和删除记录.',
	source: 131,
	desc: ['FTP登录记录', 'FTP上传记录', 'FTP重命名记录', 'FTP删除记录'],
	tabImgs: [
		{
			title: 'FTP日志',
			imgSrc: 'https://www.bt.cn/Public/new/plugin/introduce/logs/ftp-logs.png',
		},
	],
}
export const isInit = ref(true) // 是否初始化

export const menuOptions = shallowRef() // 菜单选项
export const search = ref('') // 搜索关键字
export const userName = ref('') // ftp用户名
export const ftpList = ref([]) // ftp用户名列表
export const isRefreshList = ref(false) // 是否刷新列表
/**
 * @description tab切换
 * @param {string} item.name  当前点击的菜单项-name
 * @param {string | number} item.id  当前点击的菜单项-id
 */
export const handleTabClick = async (item: any, params: any) => {
	const { selectedItem } = useLogStore()
	currentName.value = item.name // 更改当前选中项为当前点击项
	selectedItem.value = item.name // 更改当前选中项为当前点击项
	// 清除搜索关键字
	search.value = ''

	// 若为特殊数据，则不请求数据
	if (plugin.includes(item.name)) {
		// return await getPluginLogData();
		return refreshPlugin.value && refreshPlugin.value()
		// return await getPluginLogData({ p: 1, ROWS: 10, search: '' });
	} else if (item.name === 'Mysql') {
	} else if (item.name === 'FTP') {
	} else {
		return await renderSoftLog(item)
	}
}

/**
 * @description 渲染软件日志-常规类型
 * @param item
 * @returns
 */
export const renderSoftLog = async (item: any, search?: string) => {
	currentName.value = item.name
	const res = await getSoftLog(search)
	const isPhp = currentName.value === 'Php'

	// 是否为PHP日志;
	if (isPhp) {
		if (!isArray(res)) {
			phpData.value = Object.values(res) as any[]
		} else {
			phpData.value = res as any
		}
		phpData.value = phpData.value.filter((item: any) => item.status)
		if (phpChecked.value === '') phpChecked.value = phpData.value[0].version
		changePhpVersion(phpChecked.value)
	} else if (isObject(res)) {
		const newData: { file: string; msg: string } = res
		logPath.value = newData?.file || ''
		logsMsg.value = newData?.msg || '暂无数据'
	}
	return res
}

/**
 * @description 清空日志-常规
 * @param callBack
 */
export const delAllLogData = async (callBack: CallBackProps) => {
	await useConfirm({
		title: `清空日志【${currentName.value}】`,
		icon: 'warning-filled',
		type: 'calc',
		content: '风险操作，清空该日志后，将无法查到以往的日志记录，此操作不可逆，是否继续清空？',
	})
	await delAllLogDataEvent()
	renderSoftLog({ name: currentName.value })
}

/**
 * @description 切换php版本
 */
export const changePhpVersion = (val: string) => {
	// 切换php版本,在phpData查询对应版本的msg，赋值给logsMsg
	phpData.value?.forEach((item: any) => {
		if (item.version == val) {
			logsMsg.value = item.msg
			logPath.value = item.file
		}
	})
}

/**
 * @description 导出日志
 */
export const outSoftSite = () => window.open('/download?filename=' + logPath.value, '_blank', 'noopener,noreferrer')

/************* 软件日志 ftp ************/

export const getFtpList = async () => {
	if (payment.value.authType !== 'ltd') return
	const { data } = await getFtpMenu()
	ftpList.value = data.map((item: any) => ({
		label: item.name,
		value: item.name,
		key: item.id,
	}))
	userName.value = data[0]?.name || ''
}

/**
 * @description 获取FTP日志状态
 * @returns
 */
export const checkFtpStatus = async () => {
	const res = await getFtpLogStatus()
	if (res.data === 'stop') {
		await useConfirm({
			title: 'FTP服务',
			content: 'FTP服务未启动，无法获取日志,是否立即开启FTP服务?',
		})
		const res = await startFtpLog()
		Message.request(res)
		isRefreshList.value = true
		return false
	}
	return true
}

/**
 * @description 渲染FTP日志列表，自带状态判断
 * @returns
 */
export const renderFtpList = async (params: any) => {
	if (payment.value.authType !== 'ltd') return { data: [], total: 0, other: {} }

	// 初始化时请求user列表
	if (isInit.value) {
		await getFtpList()
		isInit.value = false
	}

	try {
		const status = await checkFtpStatus()
		if (!status) return { data: [], total: 0, other: {} }
		// 判断日志类型
		const data = { ...params }
		data.user_name = userName.value
		delete data.ftpType

		if (params.ftpType === 'login') return await getFtpLogData(data)
		if (params.ftpType === 'action') return await getFtpActionLog(data)
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 切换ftp日志类型
 * @param val
 */
export const changeFtpLogsType = (val: any, params: any) => {
	ftpType.value = String(val)
	renderFtpList(params)
}

/**
 * @description 切换ftp用户名
 * @param {string} val 用户名
 */
export const changeFtpName = (val: string) => {
	// ftpParams.user_name = val;
	// renderFtpList();
}

/************* 软件日志 ************/

// 日志类型-中文
enum LogType {
	TamperProof = '网站防篡改',
	Syssafe = '宝塔系统加固',
	Security = '堡塔防入侵',
	TamperProofRefactored = '网站防篡改程序-重构版',
}

export const logTypeContrast = {
	Nginx: ['Nginx', 'logs'],
	Apache: ['Apache', 'logs'],
	[LogType.TamperProof]: 'bt_security',
	[LogType.Syssafe]: 'syssafe',
	[LogType.Security]: 'security',
	[LogType.TamperProofRefactored]: 'bt_security',
}

export const deleteSoftLog = async (row: any) => {
	await useConfirm({
		title: `删除日志【${currentName.value}】`,
		type: 'calc',
		content: '风险操作，删除该日志后，将无法查到以往的日志记录，此操作不可逆，是否继续清空？',
	})
	delSoftLogEvent(row)
}

export const tabsData = [
	{ label: 'Mysql慢日志', value: 'mysqlSlow' },
	{ label: 'Mysql错误日志', value: 'mysqlError' },
] // tab数据

export const TableBatchOptions = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
			const requestHandle = async (item: any) => await delSoftLog({ type: 0, id: item.id })
			await batchConfirm({
				title: `批量删除`,
				content: `即将删除所选中的日志，是否继续操作?`,
				column: [{ prop: 'log', label: '日志内容' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
				onConfirm: async () => {
					await nextAll(requestHandle)
					refreshPlugin.value()
					// 返回false则不关闭弹窗
					return false
				},
			})
		},
	},
]

/**
 * @description 表格列配置
 */
export const useTableColumn = () => {
	return [useCheckbox(), { label: '用户', prop: 'username' }, { label: '详情', prop: 'log' }, { label: '操作时间', prop: 'addtime', align: 'right' }, useOperate([{ title: '删除', onClick: deleteSoftLog }])]
}

export const pluginColumn = computed(() => {
	return currentName.value === '宝塔系统加固' ? () => useTableColumn().slice(1) : () => useTableColumn()
})

/************* 软件日志 mysql ************/

export const mysqlLogMsg = ref('') // mysql日志内容

// Mysql错误日志级别
export const rankOptions = [
	{ label: '警告', value: 'warning' },
	{ label: '错误', value: 'error' },
	{ label: '记录', value: 'note' },
]

/**
 * @description 删除mysql日子
 */
export const deleteMysqlLog = async () => {
	await useConfirm({
		title: `清空日志【Mysql${mysqlActive.value === 'mysqlSlow' ? '慢日志' : '错误日志'}】`,
		icon: 'warning-filled',
		content: `您真的要清空所有【Mysql${mysqlActive.value === 'mysqlSlow' ? '慢日志' : '错误日志'}】吗？`,
	})
	await delMysqlAllLogEvent()
	getMysqlLogs()
}

/**
 * @description 获取mysql日志 -错误+慢日志
 */
export const getMysqlLogs = async (search?: string) => {
	let res: any = null
	if (mysqlActive.value === 'mysqlSlow') {
		res = await getMysqlLogsData(search)
	}
	if (mysqlActive.value === 'mysqlError') {
		res = await getErrorMysqlData(search)
	}
	mysqlLogMsg.value = res.data || '暂无数据'
}

export const handleClickMysqlTab = async ({ props }: any) => {
	mysqlActive.value = props.name
	getMysqlLogs('')
}

const specialData = ['Mysql', 'FTP', 'Docker', '宝塔系统加固', '堡塔防入侵'] // 特殊数据
export const isSpecialData = computed(() => specialData.includes(currentName.value)) // 是否是特殊数据
