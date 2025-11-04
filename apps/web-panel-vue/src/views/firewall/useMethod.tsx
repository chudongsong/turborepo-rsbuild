import { getFirewallInfo, getSSHInfo, getFirewallStatus as getStatus } from '@/api/firewall'
import { getLines, getPluginInfo } from '@/api/global'
import type { TableColumnProps } from '@/components/data/bt-table/types'
import type { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'
import type { RiskTableDataProps, StringObject } from '@firewall/types'
// import { refresh } from '@files/components/file-list/popup/file-ace/components/sidebar/hook/methods';
import { useDataHandle, useDialog, useHandleError, useMessage } from '@hooks/tools'
import { useBatchStatus, useOperate } from '@hooks/tools/table/column'
import { checkVariable, formatTime } from '@utils/index'
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElTooltip } from 'element-plus'
import { getFirewallStore } from './useStore'
import { openEditor } from '@/public'

const Message = useMessage()

const {
	refs: { sshInfo, firewallInfo },
} = getFirewallStore()

/**
 * @description 获取防火墙信息
 */
export const getSSHInfoEvent = async () => {
	try {
		const res = await getSSHInfo()
		sshInfo.value = res.data
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取防火墙信息
 */
export const getFirewallInfoEvent = async () => {
	const res = await useDataHandle({
		// loading: '正在获取防火墙信息，请稍后...',
		request: getFirewallInfo(),
	})
	firewallInfo.value = { ...firewallInfo.value, ...res.data }
	firewallInfo.value.ping = !res.data.ping
}

/**
 * @description: 获取防火墙状态
 */
export const getFirewallStatus = async () => {
	const {
		data: { status, init_status },
	} = await getStatus()
	firewallInfo.value.status = status || false
	firewallInfo.value.init_status = init_status?.status || false
	// checkFirewallLog(init_status)
}

/**
 * @description 获取插件状态
 * @param sName 插件名称
 * @returns
 */
export const getPluginStatus = async (sName: string) => {
	let load: any
	try {
		load = Message.load('正在获取插件状态，请稍后...')
		const res: any = await getPluginInfo({ sName })
		return res.data
	} catch (error) {
		useHandleError(error)
	} finally {
		load.close()
	}
}

export const showLogDialog = ref(false)
export const logContent = ref('初始化防火墙中...') // 日志内容
const timer = ref<any>(null)
export const checkFirewallLog = async (id: string) => {
	// if (!res.status) {
	timer.value = null
	showLogDialog.value = true
	timer.value = setInterval(async () => {
		// 展示日志 每秒轮询
		const rdata = await getLines({ num: 10, filename: '/www/server/panel/tmp/' + id + '.log' })
		logContent.value = rdata.msg.replace(/\n/g, '<br/>')
		if (rdata.msg.indexOf('结束') > -1 || !rdata.status) {
			showLogDialog.value = false
			getFirewallStatus()
			if (!rdata.status) {
				Message.request(rdata)
			}
			clearInterval(timer.value)
		}
	}, 1000)
	// }
}

export const methodMap = reactive<StringObject>({
	1: '全站扫描',
	2: '快速扫描',
	3: '单URL',
})

// 违规词检测-概览
export const typeMap = reactive<StringObject>({
	title: '标题',
	body: '网页内',
	keywords: '关键词',
	descriptions: '描述',
	title_update: '标题更新',
	keywords_update: '关键词更新',
	description_update: '描述更新',
	tail_hash_update: '尾部script代码块更新',
	title_hash_update: '头部head代码块更新',
})

/**
//  * @description 显示两个文件的对比
//  * @param {string} row 行数据
//  * @param {string} baseUrl 文件地址
//  */
// const showBothFile = (row: RiskTableDataProps, baseUrl: string) => {}

// /**
//  * @description 显示文件详情
//  * @param {string} path 文件地址
//  * @param {string} content 关键词
//  */
// const showFile = (path: string, content: string) => {}

// /**
//  * @description 展示详情
//  */
// const showFileEvent = (row: RiskTableDataProps) => {
// 	const baseUrl = '/www/server/panel/class/projectModel/content/source/'
// 	const url = baseUrl + row.source_file
// 	//需编辑器
// 	if (row.risk_type?.indexOf('_update') > -1) {
// 		showBothFile(row, baseUrl)
// 	} else {
// 		showFile(url, row.content)
// 	}
// }

/**
 * @description 风险检测表格
 */
export const riskColumn = () => {
	return [
		{
			label: '巡检时间',
			width: 150,
			render: (row: any) => {
				const time = checkVariable(row.time, 'number', 0)
				return <span>{formatTime(time)}</span>
			},
		},
		{
			label: 'URL',
			showOverflowTooltip: true,
			render: (row: any) => (
				<span class="bt-link" title={row.url} onClick={() => window.open(row.url, '_blank', 'noopener,noreferrer')}>
					{row.url}
				</span>
			),
		},
		{ label: '关键词', prop: 'content', width: 180 },
		{ label: '类型', prop: 'risk_content', width: 180 },
		{
			label: '风险位置',
			width: 120,
			showOverflowTooltip: true,
			render: (row: any) => typeMap[row.risk_type],
		},
		useOperate([{ onClick: showFileEvent, title: '详情' }]),
	]
}

/**
 * @description 显示文件
 * @param row
 */
export const showFileEvent = (data: RiskTableDataProps) => {
	let baseUrl = '/www/server/panel/class/projectModel/content/source/'
	let url = baseUrl + data.source_file
	//需编辑器
	if (data.risk_type?.indexOf('_update') > -1) {
		showBothFile(data, baseUrl)
	} else {
		showFile(url, data.content)
	}
}

/**
 * @description 显示两个文件的对比
 * @param {string} row 行数据
 * @param {string} baseUrl 文件地址
 */
const showBothFile = (row: RiskTableDataProps, baseUrl: string) => {
	if (row.risk_type === 'title_hash_update' || row.risk_type === 'tail_hash_update') {
		baseUrl = '/www/server/panel/class/projectModel/content/hash/' + row.site_name + '/'
	}
	let nPath = baseUrl + row.new_content_file
	showFile(nPath, '')
}

/**
 * @description 显示文件详情
 * @param {string} path 文件地址
 * @param {string} content 关键词
 */
const showFile = (path: string, content: string) => {
	openEditor(path, 'editor', 'html')
}

/**
 * @description 打开风险详情
 * @param row
 */
export const openRiskDetails = (row: RiskTableDataProps) => {
	useDialog({
		title: '风险详情',
		area: [70, 55],
		component: () => import('@firewall/public/risk-detail/index.vue'),
		compData: row,
	})
}

/**
 * @description 渲染图标提示
 * @param label  标签
 * @param tips  提示/链接
 * @param suffix  后缀/链接
 */
export const renderIconTip = (label: string, tips: string, suffix?: string) => {
	if (tips === 'link') {
		return (
			<div>
				{label}
				<span class="ml-4px bt-ico-ask" onClick={() => window.open(suffix, '_blank', 'noopener,noreferrer')}>
					?
				</span>
			</div>
		)
	}
	return (
		<div>
			<span>{label}</span>
			<ElTooltip content={tips} placement="top">
				<span class="ml-4px bt-ico-ask">{suffix || '?'}</span>
			</ElTooltip>
		</div>
	)
}

/**
 * @description 端口提示
 */
export const portsPs = {
	'3306': 'MySQL服务默认端口',
	'888': 'phpMyAdmin默认端口',
	'22': 'SSH远程服务',
	'20': 'FTP主动模式数据端口',
	'21': 'FTP协议默认端口',
	'39000-40000': 'FTP被动模式端口范围',
	'30000-40000': 'FTP被动模式端口范围',
	'11211': 'Memcached服务端口',
	'873': 'rsync数据同步服务',
	'8888': '宝塔Linux面板默认端口',
}

/**
 * @description 筛选选项
 */
export const chainOptions = [
	// 导出方向
	{ label: '所有方向', value: 'ALL' },
	{ label: '入站', value: 'INPUT' },
	{ label: '出站', value: 'OUTPUT' },
]

export const statusFilterKey = ref('ALL') // 状态筛选 入栈出栈

/**
 * @description 防火墙表格公共配置
 */
export const useFirewallColumn = ({ changePolicy, change }: any) => {
	return [
		{
			label: '策略',
			render: (row: any, index: number) => {
				return (
					<span class={'cursor-pointer'} style={`color:${row.Strategy === 'accept' ? 'var(--el-color-primary)' : '#ef0808'}`} onClick={() => changePolicy(row)}>
						{row.Strategy == 'accept' ? '放行' : '禁止'}
					</span>
				)
			},
		},
		{
			label: '方向',
			renderHeader() {
				const menu: any[] = [
					{ title: '所有方向', key: 'ALL' },
					{ title: '入站', key: 'INPUT' },
					{ title: '出站', key: 'OUTPUT' },
				]
				const title = menu.find((items: any) => items.key === statusFilterKey.value)?.title
				return h('div', { class: 'flex items-center flex-nowrap' }, [
					'',
					h(
						ElDropdown,
						{ onCommand: (key: string) => change(key) },
						{
							default: () =>
								h('span', { class: 'text-small flex items-center' }, [
									[
										<span class="status-header-text">
											状态
											{statusFilterKey.value === 'ALL' ? '' : title ? `(${title})` : ''}
										</span>,
									],
									h('i', { class: 'svgtofont-el-arrow-down ' }),
								]),
							dropdown: () => (
								<ElDropdownMenu>
									{menu.map(item => (
										<ElDropdownItem command={item.key}>{item.title}</ElDropdownItem>
									))}
								</ElDropdownMenu>
							),
						}
					),
				])
			},
			render: (row: any, index: number) => (row.Chain === 'INPUT' ? '入站' : '出站'),
		},
	]
}

/**
 * @description 防火墙操作公共配置
 */
export const useFirewallOperate = ({ editEvent, deleteEvent }: any) => {
	return useOperate([
		{ onClick: editEvent, title: '修改' },
		{ onClick: deleteEvent, title: '删除' },
	])
}

/**
 * @description 上传文件
 * @param {any} e 上传文件
 */
export const changeInputFile = async (e: any) => {
	// const file = vm.$refs.fileIpRef.fileData.f_name
	// const loadings = vm.$load('正在导入规则，请稍后...')
	// const rdata = await firewallInput({
	// 	rule: 'ip',
	// 	file: vm.$refs.fileIpRef.fileData.f_path + '/' + file,
	// })
	// if (rdata.status) getIpRulesData()
	// loadings.close()
	// vm.$message.request(rdata)
}

/**
 * @description 导出规则确认
 */
export const exportConfirmReq = async (params: any) => {
	// await useDataHandle({
	// 	loading: '正在导出规则，请稍后...',
	// 	request: outPutRules({ rule: 'port', chain: outputData.type }),
	// 	success: ({ data }: any) => {
	// 		if (data.status) window.open('/download?filename=' + data.msg)
	// 		else Message.error(data.msg)
	// 	},
	// })
}

/**
 * @description 批量操作公共配置
 * @param param0
 */
export const useBatchEvent = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, requestHandle: any, tableColumn: TableColumnProps, refreshEvent: any) => {
	await batchConfirm({
		title: `批量删除`,
		content: `即将删除所选中的数据，是否继续操作?`,
		column: [tableColumn, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			await nextAll(requestHandle)
			refreshEvent()
			return false
		},
	})
}
