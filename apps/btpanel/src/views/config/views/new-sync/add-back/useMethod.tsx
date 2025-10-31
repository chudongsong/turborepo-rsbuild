import type { TableCheckboxTypes, TableColumnProps, TableColumnSwitchProps } from '@/components/data/bt-table/types'
import { Message, useConfirm, useDialog } from '@/hooks/tools'
import { addBackupApi, addRestoreApi, cancelSyncTaskApi, getBackTotal, getDetailApi, getProgressApi } from '@/api/config'
import { getByteUnit, isEmpty } from '@/utils'
import { detailData, isRefreshBackList } from '../useMethod'
import { openPluginView } from '@/public'
import { useCheckbox } from '@/hooks/tools/table/column'
import { ElCheckbox } from 'element-plus'

export const isAdd = computed(() => detailData.value.operateType === 'add')
export const isRestore = computed(() => detailData.value.operateType === 'restore')
export const isDetail = computed(() => detailData.value.operateType === 'detail')

export const activeNames = ref(['1'])

// 备份参数
export const copyPrams = ref({})

// 遇见失败自动退出
export const auto_exit = ref(false)

// 存在同名时是否覆盖还原
export const forceRestore = ref(false)

// socket方法实例
export const socketInstance = ref<any>(null)

// 迁移数据总大小
export const sizeTotal = ref('计算中...')

// 服务器列表
export const orderOpt = ref<any>([])

// 是否可以配置
export const disabledConfig = ref(false)

// 搜索数据
export const searchData = reactive({
	web: '', // 网站
	ftp: '', // FTP
	database: '', // 数据库
})
export const refreshLoading = ref(false) // 加载loading

// 当前空间大小
export const backSizeData = reactive({
	size: 0,
	current: 0,
})

// 是否可以备份
export const canBack = computed(() => backSizeData.size < backSizeData.current) // 是否可以备份

export const restoreSize = ref(0)

/**
 * @description 获取当前时间
 * @returns
 */
export const currentTime = (time?: any) => {
	//备份-202x-xx-xx-hhmm 不足两位补0
	const date = new Date(time || new Date())
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	return `备份-${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}-${hour < 10 ? '0' + hour : hour}${minute < 10 ? '0' + minute : minute}`
}

/**
 * @description 确认添加备份
 * @param params
 */
export const onSubmitBack = async (params: any, checkStatus?: any, siteList?: any, dbList?: any) => {
	const checkObj = {
		site: 'site',
		database: 'database',
		wptools: 'wp_tools',
		plugin: 'plugin',
		runtime: 'soft',
		Ftp: 'ftp',
		Crontab: 'crontab',
		Vmail: 'vmail',
		Terminal: 'ssh',
		Firewall: 'firewall',
		node: 'node',
	}
	copyPrams.value = params // 备份参数
	// 初始化进度框
	progressData.status = 1
	progressData.progress = 0
	progressData.msg = '准备' + (isRestore.value ? '还原' : '备份') + '数据'

	if (params.exec_time === '' && detailData.value.operateType === 'restore') {
		progressDialog.value = openProgress()
	}

	if (detailData.value.operateType === 'restore') {
		const r_params = {
			timestamp: detailData.value.timestamp,
			auto_exit: auto_exit.value ? 1 : 0, // 自动退出
			force_restore: forceRestore.value ? 1 : 0, // 强制还原
		}
		const res = await addRestoreApi(r_params)
		console.log(res, 'addRestoreApi')
		return
	}
	const data_list: any = []
	Object.entries(checkStatus).map(([key, value]) => {
		if (key === 'database') {
			if (dbList.length > 0) {
				data_list.push(checkObj[key])
				return
			}
		}
		if (key === 'site') {
			if (siteList.length > 0) {
				data_list.push(checkObj[key])
				return
			}
		}
		if (value) {
			data_list.push(checkObj[key])
		}
	})
	let data = {
		backup_name: params.name, // 备份名称
		auto_exit: auto_exit.value ? 1 : 0, // 自动退出
		storage_type: params.path, // 存储类型
		timestamp: params.exec_time / 1000, // 时间戳
		site_id: JSON.stringify(siteList.map((item: any) => item.id)),
		database_id: JSON.stringify(dbList.map((item: any) => item.id)),
		data_list: JSON.stringify(data_list),
	}
	const res = await addBackupApi(data)

	// 刷新
	isRefreshBackList.value = true
	Message.request(res)
	if (params.exec_time === '') {
		if (res.status) {
			progressDialog.value = openProgress()
		}
	}
	console.log(res, 'addBackupApi')
}

/**
 * @description  刷新备份大小
 */
export const refreshBackSize = async (confirmBtn: any) => {
	if (refreshLoading.value) return
	refreshLoading.value = true
	await getBackupInfo(undefined, true)

	if (isRestore.value) {
		// await getRestoreInfo()
		Message.success('刷新成功')
		confirmBtn.disabled = backSizeData.size > backSizeData.current
		refreshLoading.value = false
	} else {
		// await getBackupInfo(null, true)
		//getBackupInfo中已经处理过Message.success('刷新成功')+size了
	}
}

/**
 * @description 打开进度弹窗
 * @returns
 */
export const openProgress = (type?: string) => {
	return useDialog({
		title: false,
		component: () => import('./back-progress.vue'),
		compData: {
			type,
		},
		area: 52,
	})
}

/**
 * @description 获取进度日志
 */
export const getProgressLog = async (type?: string) => {
	const { data: res } = await getProgressApi({ type: isRestore.value || type === 'restore' ? 'restore' : 'backup' })
	console.log(res, 'getProgressLog')

	// 未获取到数据情况
	if (typeof res.data === 'string') {
		Object.assign(progressData, {
			status: 1,
			progress: 0,
			msg: '获取进度日志中...',
			time: 0,
		})
		progressLog.value = res.data + '，或请稍等片刻后检查进度是否更新，若未更新请重新进行操作'
		if (progressDialog.value) setTimeout(getProgressLog, 1500)
		return
	}

	progressData.status = res.data.task_status
	progressData.time = res.data.left_time || 0
	progressLog.value = res.data.exec_log || '暂无日志'

	// 判断是否完成
	const isCompleted = res.data.task_status === 2 || res.data.task_status === 3

	if (isCompleted) {
		progressData.progress = 100
		progressData.msg = '备份' + (res.data.task_status === 2 ? '成功' : '结束')

		if (res.data.backup_file_info) {
			Object.assign(successData.value, {
				name: res.data.backup_file_info.backup_name,
				files_size: getByteUnit(Number(res.data.backup_file_info.backup_file_size)),
				end_time: res.data.backup_file_info.done_time,
				time_count: res.data.backup_file_info.restore_total_time || res.data.backup_file_info.total_time,
				backup_file_sha256: res.data.backup_file_info.backup_file_sha256,
			})
		}

		if (res.data.task_status === 3) {
			progressData.msg = '备份失败'
			progressData.progress = 0
			errorData.value = res.data.err_info || []
		}
		// 刷新备份列表
		isRefreshBackList.value = true
	} else {
		progressData.progress = res.data.progress
		progressData.msg = res.data.task_msg
		if (progressDialog.value) setTimeout(getProgressLog, 1500)
	}
}

/**
 * @description 获取备份信息
 * @returns
 */
export const getBackupInfo = async (data?: any, isRefresh?: boolean) => {
	try {
		refreshLoading.value = true

		if (detailData.value.operateType === 'restore') {
			// 获取详情数据
			const { data: res } = await getDetailApi({ timestamp: detailData.value.timestamp, type: 'backup' })
			console.log(res, 'getDetailApi')
			setData(res.data.data_status) // 设置数据

			// 获取当前大小 计算所有列表的大小
			backSizeData.size = res.data.disk_use
			backSizeData.current = res.data.disk_free

			refreshLoading.value = false
			return
		}

		if (!isEmpty(data) && data !== undefined) {
			// 获取详情数据
			setData(data) // 设置数据
		} else {
			const { data: res } = await getBackTotal()
			if (detailData.value.operateType === 'add') setLocation(res.data) // 设置云存储
			setData(res.data) // 设置数据
		}
		refreshLoading.value = false
		if (isRefresh) {
			Message.success('刷新成功')
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 设置云存储
 * @param data
 */
export const setLocation = (data: any) => {
	// 云存储
	orderOpt.value =
		data.oss_list?.map((item: any) => ({
			label: item.name,
			value: item.value,
			status: Boolean(item.status),
			disabled: item.value !== 'localhost' && !item.status,
			render: (item: any) => {
				return (
					<div class="flex items-center justify-between">
						<span>{item.label}</span>
						<span
							onClick={() => {
								openPluginView({ name: item.value })
							}}
							class={`float-right text-small text-danger cursor-pointer ml-12px ${item.value !== 'localhost' ? '' : '!hidden'}`}>
							{item.status ? '' : '[未配置]'}
						</span>
					</div>
				)
			},
		})) || []

	// 添加服务器磁盘
	if (!orderOpt.value || orderOpt.value[0]?.value !== 'local') {
		console.log(orderOpt.value, 'orderOpt.value')
		orderOpt.value?.unshift({ label: '本地存储', value: 'local' })
	}
}

/**
 * @description 设置数据
 * @param data
 */
export const setData = (data: any) => {
	const terminalData: any = {
		command_size: '命令列表',
		ssh_size: '终端数据',
	}

	const firewallData: any = {
		firewall_conutry: '地区规则',
		firewall_ip: 'IP规则',
		firewall_forward: '端口转发规则',
		firewall_malicious_ip: '恶意IP',
		// firewall_domain: '地区规则',
		firewall_new: '端口规则',
	}

	// 网站
	webList.value = data.site_list
	// 数据库
	dbList.value = data.database_list
	// 多机节点
	nodeList.value = data.btnode_list
	// FTP
	otherData.value.ftpList = data.ftp_list
	// 计划任务
	otherData.value.crontabList = data.crontab_list
	// 邮局服务器
	otherData.value.vmailList = data.vmail_list
	// 终端
	otherData.value.termList = Object.keys(data.ssh_list)
		.filter(key => key !== 'status' && key !== 'err_msg')
		.map(key => ({ name: terminalData[key], size: data.ssh_list[key] }))
	// 防火墙
	otherData.value.firewallList =
		Object.keys(data.firewall_list).length > 0
			? Object.keys(firewallData)
					.filter(key => key !== 'firewall_conutry')
					.map(key => ({ name: firewallData[key], total: data.firewall_list[key] || '--' }))
			: []
	// 插件
	pluginList.value = data.plugin_list || []
	// 运行环境
	runtimeList.value = data.soft_data || []
	// wp工具
	wpList.value = data.wp_tools_list || []

	Object.keys(typeLoading.value).forEach((item: any) => (typeLoading.value[item.toLowerCase()] = false))

	if (detailData.value.operateType !== 'restore') {
		// 获取当前大小 计算所有列表的大小
		backSizeData.size = data.disk_use
		backSizeData.current = data.disk_free
	}
}

// ************************备份进度************************

export const progressLog = ref('') // 进度日志
export const progressDialog = ref() // 进度弹窗
export const progressData = reactive<any>({
	status: 1, // 0 未开始 1 备份中 2 已完成 3 异常/失败
	progress: 0, // 进度
	time: 0, // 剩余时间
	msg: '准备开始操作', // 消息
})

export const successData = ref({
	name: '',
	backup_file: '',
	files_size: '',
	end_time: '',
	time_count: '',
	backup_file_sha256: '',
})
export const errorData = ref([]) // 失败项
export const progressColumn = [{ type: 'index' }, { label: '失败项', prop: 'name' }, { label: '失败原因', prop: 'msg', width: 140, render: (row: any) => <span class="text-dangerDark">{row.msg}</span> }, { label: '类型', prop: 'type' }]

// ************************导入备份************************
export const tableColumn = [
	{ label: '服务', prop: 'type' },
	{
		label: '环境错误',
		render: (row: any) => {
			return <span class={`text-dangerDark`}>{row.error}</span>
		},
	},
]

export const $reset = () => {
	webList.value = []
	otherData.value.ftpList = []
	otherData.value.crontabList = []
	otherData.value.termList = []
	otherData.value.firewallList = []
	pluginList.value = []
	runtimeList.value = []

	Object.keys(typeLoading.value).forEach((item: any) => (typeLoading.value[item.toLowerCase()] = true))
	activeNames.value = ['1']
}

/**
 * @description 重启 备份 还原 服务
 */
export const restartRequest = async () => {
	try {
		await useConfirm({
			title: '确认继续' + (isRestore.value ? '还原' : '备份'),
			content: '即将尝试继续' + (isRestore.value ? '还原' : '备份') + '数据，是否继续操作？',
		})

		let dialog = await progressDialog.value
		dialog.unmount()
		progressDialog.value = null
		onSubmitBack(copyPrams.value)
	} catch (error) {
		console.log(error)
	}
}

// -------------------------

// 网站列表
export const webList = ref([])
export const webCount = computed(() => {
	return getByteUnit(webList.value.reduce((acc: number, item: any) => acc + Number(item.size), 0))
})

// 数据库列表
export const dbList = ref([])
export const dbCount = computed(() => {
	return getByteUnit(dbList.value.reduce((acc: number, item: any) => acc + Number(item.size), 0))
})

// 多机节点列表
export const nodeList = ref([])

// wp列表
export const wpList = ref([])
export const wpCount = computed(() => {
	return getByteUnit(wpList.value.reduce((acc: number, item: any) => acc + Number(item.size), 0))
})

// 插件列表
export const pluginList = ref([])
export const pluginCount = computed(() => {
	return getByteUnit(pluginList.value.reduce((acc: number, item: any) => acc + Number(item.size), 0))
})

// 运行环境列表
export const runtimeList = ref([])
export const runtimeCount = computed(() => {
	return getByteUnit(runtimeList.value.reduce((acc: number, item: any) => acc + Number(item.size), 0))
})

// 其他项目列表
export const otherData = ref<any>({
	ftpList: [], // FTP
	crontabList: [], // 计划任务
	vmailList: [], // 邮局服务器
	termList: [], // 终端
	firewallList: [], // 系统防火墙
})

export const countData = (type: string) => {
	// 传入对应的列表，计算otherdata中对应列表的size大小
	return getByteUnit(otherData.value[type].reduce((acc: number, item: any) => acc + Number(item.size || item.vmail_size || 0), 0))
}

/**
 * @description 类型加载
 */
export const typeLoading = ref<any>({
	site: true, // 网站
	database: true, // 数据库
	ftp: true, // FTP
	crontab: true, // 计划任务
	vmail: true, // 邮局服务器
	terminal: true, // 终端
	firewall: true, // 系统防火墙
	wptools: true, // wp工具
	plugin: true, // 插件
	runtime: true, // 运行环境
	node: true, // 多机节点
	other: true, // 其他
})

// 其他项目配置
export const otherItemsConfig = computed<Record<string, any>>(() => ({
	Ftp: {
		title: 'FTP', // 标题
		icon: 'ftp', // 图标
		dataKey: 'ftpList', // 数据key
		loadingKey: 'ftp', // 加载key
		tooltip: '仅备份FTP账号和密码，不备份FTP目录', // 提示
	},
	Crontab: {
		title: '计划任务',
		icon: 'crontab',
		dataKey: 'crontabList',
		loadingKey: 'crontab',
	},
	Vmail: {
		title: '邮局服务器',
		icon: 'mail',
		dataKey: 'vmailList',
		loadingKey: 'vmail',
		count: true,
	},
	Terminal: {
		title: '终端',
		icon: 'xterm',
		dataKey: 'termList',
		loadingKey: 'terminal',
		// count: true,
	},
	Firewall: {
		title: '系统防火墙',
		icon: 'firewall',
		dataKey: 'firewallList',
		loadingKey: 'firewall',
	},
}))

// 网站表格列配置
export const siteTableColumn = computed(() => [
	...(!isRestore.value
		? [
				{
					type: 'CheckBox',
					width: 36,
					renderHeader: () => {
						return h('div')
					},
					render: (row: any, index: number, { handleScopeChange }: TableCheckboxTypes) => {
						return <ElCheckbox v-model={row.keys_scopes_status} onChange={(value: any) => handleScopeChange(value, row, index, 'id')} />
					},
				},
		  ]
		: []),
	{ label: '网站名称', prop: 'name' },
	{ label: '网站大小', render: (row: any) => getByteUnit(Number(row.size)) },
	{ label: '网站类型', prop: 'type' },
])

// 数据库表格列配置
export const databaseColumn = computed(() => [
	...(!isRestore.value
		? [
				{
					type: 'CheckBox',
					width: 36,
					renderHeader: () => {
						return h('div')
					},
					render: (row: any, index: number, { handleScopeChange }: TableCheckboxTypes) => {
						return <ElCheckbox v-model={row.keys_scopes_status} onChange={(value: any) => handleScopeChange(value, row, index, 'id')} />
					},
				},
		  ]
		: []),
	{ label: '数据库名称', prop: 'name' },
	{ label: '数据库大小', render: (row: any) => getByteUnit(Number(row.size)) },
	{ label: '数据库类型', prop: 'type' },
])

// wp工具表格列配置
export const wpToolsColumn = [
	{ label: '网站名称', prop: 'name', width: 120 },
	{ label: '网站大小', render: (row: any) => getByteUnit(Number(row.size)) },
	{ label: '网站类型', render: (row: any) => (row.type === 'local' ? '本地' : '远程') },
]

// 插件表格列配置
export const pluginColumn = [
	{ label: '插件名称', prop: 'name' },
	{ label: '大小', render: (row: any) => getByteUnit(Number(row.size)) },
]

// 运行环境表格列配置
export const runtimeColumn = [
	{ label: '运行环境', prop: 'name' },
	{ label: '版本', prop: 'version' },
	{ label: '大小', render: (row: any) => getByteUnit(Number(row.size)) },
]

// 多机节点表格列配置
export const nodeColumn = [
	{ label: '名称', prop: 'name' },
	{ label: '服务器IP', prop: 'server_ip' },
]

/**
 * @description 取消备份、还原任务
 */
export const cancelEvent = async () => {
	await useConfirm({
		title: '确认取消' + (isRestore.value ? '还原' : '备份'),
		content: '即将取消' + (isRestore.value ? '还原' : '备份') + '数据，是否继续操作？',
	})
	let loading = Message.load('正在取消任务，请稍后...')
	const res = await cancelSyncTaskApi({ timestamp: detailData.value.timestamp })
	let dialog = await progressDialog.value
	dialog.unmount()
	progressDialog.value = null
	loading.close()
	Message.request(res)

	// 刷新备份列表
	isRefreshBackList.value = true
}
