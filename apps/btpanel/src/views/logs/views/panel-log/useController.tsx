import CrontabLog from '@logs/views/panel-log/crontab-log.vue'
import LoginLog from '@logs/views/panel-log/login-log.vue'
import OperateLog from '@logs/views/panel-log/operate-log.vue'
import RunLog from '@logs/views/panel-log/run-log.vue'

import { Message, useConfirm, useDialog } from '@/hooks/tools'
import { CrontabParams } from '@/types/log'
import { checkVariable, isArray } from '@/utils'
import { LOG_PANEL_STORE, usePanelLogStore } from '@/views/logs/views/panel-log/useStore'
import BtTable from '@components/data/bt-table'
import * as R from 'ramda'
import { LOG_STORE, useLogStore } from '../../useStore'

type CallBackProps = (res?: any) => void

const { getLogsMenu, outWebSiteEvent, getLogsInfoEvent, clearRunLogsEvent, clearOpLogsEvent, getLogsDataEvent, clearShellLogEvent, outShellLogEvent, getIpDataEvent, outLoginLogEvent, clearLoginLogEvent } = LOG_PANEL_STORE()

const { clearDataForm, outDataForm, configData, selectedItem } = useLogStore()
const { currentItem, isRefreshList, crontabForm } = usePanelLogStore()
const logsStore = LOG_STORE()

export const menuOptions = ref([]) // 菜单数据
export const isShellLog = ref(false) // 是否木马查杀日志

export const tabComponent = [
	{
		label: '操作日志',
		name: 'operateLog',
		render: () => <OperateLog></OperateLog>,
	},
	{
		label: '登录日志',
		name: 'loginLog',
		lazy: true,
		render: () => <LoginLog></LoginLog>,
	},
	{
		label: '运行日志',
		name: 'runLog',
		lazy: true,
		render: () => <RunLog></RunLog>,
	},
	{
		label: '计划任务日志',
		name: 'crontabLog',
		lazy: true,
		render: () => <CrontabLog></CrontabLog>,
	},
]

export const typeOptions = [
	{ label: '全部', value: '' },
	{ label: '登录成功', value: '1' },
	{ label: '登录失败', value: '0' },
]

export const logTypeOptions = [
	{ label: '全部', value: '全部' },
	{ label: '网站管理', value: '网站管理' },
	{ label: '用户登录', value: '用户登录' },
	{ label: '数据库管理', value: '数据库管理' },
	{ label: 'FTP管理', value: 'FTP管理' },
	{ label: '文件管理', value: '文件管理' },
	{ label: '安装器', value: '安装器' },
	{ label: '软件管理', value: '软件管理' },
	{ label: '守护程序', value: '守护程序' },
	{ label: '面板设置', value: '面板设置' },
	{ label: '进程管理', value: '进程管理' },
	{ label: '面板配置', value: '面板配置' },
	{ label: 'PHP配置', value: 'PHP配置' },
	{ label: '计划任务', value: '计划任务' },
	{ label: '防火墙管理', value: '防火墙管理' },
]

export const changeTabs = (tab: string) => {
	// 切换标签时的处理逻辑
}

/**
 * @description 导出日志
 */
export const outWebSite = async ({ search }: any, callback?: CallBackProps) => {
	search &&
		(await useConfirm({
			title: `导出日志`,
			icon: 'warning-filled',
			content: `是否导出关键字为【${search}】的面板操作日志？`,
		}))

	const res = await outWebSiteEvent(search)

	window.open('/download?filename=' + res.data.output_file, '_blank', 'noopener,noreferrer')
	callback && callback(res)
}

/**
 * @description 获取日志数据
 */
export const getLogsInfo = async (params: any) => {
	try {
		const data = params
		if (!data.search) delete data.search
		if (data.log_type === '全部') data.log_type = ''
		return await getLogsInfoEvent(data)
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 清空日志
 */
export const clearLogs = async (callback?: CallBackProps) => {
	await useConfirm({
		icon: 'warning-filled',
		type: 'input',
		title: '清空面板操作日志',
		input: { content: '清空日志' },
		content: '风险操作，清空该日志后，将无法查询面板以往的操作记录，是否继续操作？',
	})
	const res = await clearOpLogsEvent()
	callback && callback(res)
}

// IP表格列
const ipTableColumn = [
	{ label: 'IP地址', prop: 'ip' },
	{ label: 'IP属地', prop: 'info' },
	{ label: '操作次数', prop: 'operation_num' },
]

/**
 * @description IP操作统计弹窗
 */
export const ipOperateDialog = async () => {
	const { data } = await getIpDataEvent()
	// 按操作次数排序
	data.sort((a: any, b: any) => b.operation_num - a.operation_num)
	useDialog({
		title: 'IP操作统计',
		area: 60,
		component: () => (
			<div class="p-20px">
				<BtTable v-bt-loading="ipLoading" v-bt-loading:title="'正在加载表格数据,请稍后...'" max-height="360" column={ipTableColumn} data={data} />
			</div>
		),
	})
}

/****************** 登录日志 ******************/

/**
 * @description 排序
 */
export const sortChange = ({ column, prop, order }: AnyObject, data: any) => {
	// 获取比较函数
	const getComparator = (prop: string, order: any) => {
		return order === 'ascending' ? R.ascend(R.prop(prop)) : R.descend(R.prop(prop))
	}
	// 使用 Ramda 的 R.sort 函数对表格数据进行排序
	const sortedTable = R.sort(getComparator(prop, order), data)
	// loginData.value = sortedTable;
	return { data: sortedTable, total: sortedTable.length, other: {} }
}

/**
 * @description 清空日志
 * @param callback
 */
export const clearAllLoginLog = async (callback?: CallBackProps) => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			type: 'input',
			title: '清空面板登录日志',
			input: { content: '清空日志' },
			content: '风险操作，清空该日志后，将无法查到以往的日志记录，此操作不可逆，是否继续清空？',
		})
		await clearLoginLogEvent()
		// getLoginLogsEvent();
		// 刷新
		isRefreshList.value = true
		callback && callback()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 导出日志-登录
 * @param params
 * @param callback
 */
export const outLoginLog = async (data: any[]) => {
	if (data.length === 0) return Message.error('暂无数据导出')
	outDataForm.value.type = logsStore.getType('login')
	configData.value = { type: 'login' }
	useDialog({
		title: '导出日志',
		area: 44,
		component: () => import('@logs/public/out-log/index.vue'),
		showFooter: true,
	})
}

/****************** 运行日志 ******************/

/**
 * @description 清理日志
 */
export const clearRunLogs = async (callback?: CallBackProps) => {
	await useConfirm({
		icon: 'warning-filled',
		title: '清空面板运行日志',
		type: 'calc',
		content: '风险操作，清空该日志后，将无法查到以往的日志记录，此操作不可逆，是否继续清空？',
	})
	callback && callback()
	return await clearRunLogsEvent()
}

/****************** 计划任务日志 ******************/

export const typeCrontabOptions = [
	{ label: '全部', value: '' },
	{ label: '异常', value: 'warring' },
]

/**
 * @description 获取日志详细数据
 * @param {CrontabParams} item  当前点击的菜单项
 */
export const getCrontabLogs = async (item: CrontabParams) => {
	try {
		const check = checkVariable(item, 'object', false, null, true)
		if (!check) return Message.error('当前未选定日志数据')
		currentItem.value = item
		selectedItem.value = String(item.id)
		isShellLog.value = item.sType === 'webshell'
		const { type, time_search } = crontabForm.value
		let timeSearch: number[] = []
		const time: any = time_search // 时间搜索
		if (isArray(time) && time.length) timeSearch = [time[0] / 1000, time[1] / 1000]
		const param = {
			type: type,
			id: item.id,
			time_search: JSON.stringify(timeSearch),
		}

		const { status, msg } = await getLogsDataEvent(param)
		if (!status) Message.error(msg)
	} catch (error) {
		console.log(error)
		return { data: '获取日志错误!', status: false }
	}
}

/**
 * @description 清理日志弹框
 */
export const openClearShellView = async (item: any) => {
	// let tips = '注意：关闭回收站，将永久删除文件，不滞留在回收站'
	useDialog({
		title: '清理【' + item.name + '】日志',
		area: 44,
		component: () => import('@logs/public/clear-log/index.vue'),
		compData: { tips: '', type: 'crontab', clearEvent: () => clearShellLog() },
		showFooter: true,
	})
}

/**
 * @description 清理木马查杀日志
 */
export const clearShellLog = async (callback?: CallBackProps) => {
	const { day } = clearDataForm.value
	await useConfirm({
		icon: 'warning-filled',
		type: 'calc',
		title: '清空日志',
		content: `清空${day !== 'all' ? day + '天外' : ''}日志后，将无法查询${day !== 'all' ? day + '天外' : ''}日志记录，此操作不可逆，是否继续清理？`,
	})

	const res = await clearShellLogEvent({ id: currentItem.value.id, day: day === 'all' ? '' : day })
	// 刷新
	isRefreshList.value = true
	callback && callback()
	return res
}

/**
 * @description 导出日志 弹窗
 */
export const openOutShellView = async () => {
	outDataForm.value.type = LOG_STORE().getType('crontab')
	configData.value = { type: 'crontab' }
	useDialog({
		title: '导出日志',
		area: 44,
		component: () => import('@logs/public/out-log/index.vue'),
		compData: { type: 'crontab' },
		showFooter: true,
	})
}

// /**
//  * @description 导出木马查杀日志
//  */
// export const outShellLog = async (close: any, callback?: CallBackProps) => {
//   const { status, data, msg } = await outShellLogEvent();
//   if (status) {
//     close();
//     window.open('/download?filename=' + data.msg);
//   } else {
//     Message.error(msg);
//   }
//   callback && callback();
// };

/**
 * @description 搜索菜单
 */
export const getMenuData = async (params?: string) => {
	const res = await getLogsMenu(params)
	menuOptions.value = res.data
}

// // 表格左上方按钮组
// const tableBtnGroup: BtnGroupProps[] = [
//   {
//     content: '导出日志',
//     event: () => {
//       if (operateData.value.length === 0)
//         return Message.error('暂无数据导出');
//       outWebSiteEvent();
//     },
//   },
//   {
//     content: '清空日志',
//     event: async () => {
//       await clearRunLogsEvent();
//       getLogsInfoEvent();
//     },
//   },
//   { content: 'IP操作统计', event: () => ipOperateDialog() },
// ];
