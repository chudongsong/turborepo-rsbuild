import { addMigrateTask, checkSSHAuth, getBackTotal, getMigrateProgressApi, getMigrateTaskStatus, stopMigrateTask } from '@/api/config'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { getByteUnit } from '@/utils'
import { detailData } from '../new-sync/useMethod'

// 迁移成功数据
export const successData = ref({
	last_update: '', // 完成时间
	total_time: '', // 耗时
	start_time: '', // 开始时间
	panel_addr: '', // 目标服务器信息
	panel_user: '', // 目标服务器登陆账号
	panel_password: '', // 目标服务器登陆密码
	panel_port: '', // 目标服务器登陆端口
})

// 迁移数据总大小
export const sizeTotal = ref('计算中...')
// 剩余空间
export const otherSize = ref('计算中...')
// 原始数据
export const sizeData = ref({
	total: 0,
	use: 0,
})

const customMoveData = ref<any>({}) // 自定义迁移数据

// 迁移失败数据
export const errorData = ref([]) // 失败项

// 迁移进度数据
export const progressData = ref({ status: 0, progress: 0, msg: '准备开始迁移', progressLog: '', remain_time: 100 })

// 是否正在迁移
export const isRunMigrate = ref(false) // 是否正在迁移

// 迁移进度表格列配置
export const progressColumn = [
	{ type: 'index' },
	{ label: '失败项', prop: 'name' },
	{
		label: '失败原因',
		prop: 'msg',
		width: 320,
		render: (row: any) => {
			return <span class="text-dangerDark">{row.msg}</span>
		},
	},
]

// 参数备份
const paramsCopy = ref<any>({})

/**
 * @description 点击开始迁移
 * @param data
 */
export const startMigrate = async (data: any) => {
	paramsCopy.value = data
	try {
		await useConfirm({
			title: '整机迁移提醒',
			content: '迁移至目标服务器【' + data.server_ip + '】，迁移过程中网站访问受影响，是否继续操作？',
			type: 'calc',
		})
		// 隐藏开始迁移按钮
		isRunMigrate.value = true
		// 重置进度条
		resetprogressData()
		// 检查
		const sshLoad = Message.load('正在检查目标服务器连接，请稍后...')
		const res = await checkSSHAuth(data)
		sshLoad.close()
		if (res.status) {
			// 发送开始迁移请求
			let loading = Message.load('正在开始迁移，请稍后...')
			const rdata = await addMigrateTask({ ...data, ...customMoveData.value })
			loading.close()
			if (rdata.status) {
				// 开始展示进度条
				progressData.value.status = 0
				progressData.value.msg = '准备迁移中...'
				progressData.value.progress = 0
				progressData.value.progressLog = ''
				getMigrateProgress()
			} else {
				Message.error(rdata.msg)
			}
		} else {
			Message.error(res.msg)
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 重试
 */
export const retryMigrate = async () => {
	try {
		// 重置进度条
		resetprogressData()
		// 展示迁移进度
		progressData.value.status = 1
		isRunMigrate.value = true

		const rdata = await addMigrateTask(paramsCopy.value)
		progressData.value.msg = '准备迁移中...'
		progressData.value.progress = 0
		progressData.value.progressLog = ''

		getMigrateProgress()
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 打开迁移详情
 */
export const openMigrateData = () => {
	customMoveData.value = {}
	detailData.value.operateType = 'add'
	return useDialog({
		area: 84,
		title: '设置迁移数据',
		component: () => import('@/views/config/views/new-sync/add-back/index.vue'),
		compData: {
			saveConfig: (param: any, checkStatus: any, siteList: any, dbList: any) => {
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
				customMoveData.value = {
					site_id: JSON.stringify(siteList.map((item: any) => item.id)),
					database_id: JSON.stringify(dbList.map((item: any) => item.id)),
					backup_data: JSON.stringify(data_list),
				}
			},
		},
		btn: ['确定', '取消'],
		showFooter: true,
	})
}

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

// wp列表
export const wpList = ref([])
export const wpCount = computed(() => {
	return getByteUnit(wpList.value.reduce((acc: number, item: any) => acc + Number(item.size), 0))
})

// 插件列表
export const pluginList = ref([])

// 运行环境列表
export const runtimeList = ref([])
export const runtimeCount = computed(() => {
	return getByteUnit(runtimeList.value.reduce((acc: number, item: any) => acc + Number(item.size), 0))
})

// 其他项目列表
export const otherData = ref<any>({
	ftpList: [], // FTP
	crontabList: [], // 计划任务
	termList: [], // 终端
	firewallList: [], // 系统防火墙
})

export const countData = (type: string) => {
	// 传入对应的列表，计算otherdata中对应列表的size大小
	return getByteUnit(otherData.value[type].reduce((acc: number, item: any) => acc + Number(item.size), 0))
}

/**
 * @description 类型加载
 */
export const typeLoading = ref<any>({
	site: true, // 网站
	database: true, // 数据库
	ftp: true, // FTP
	crontab: true, // 计划任务
	terminal: true, // 终端
	firewall: true, // 系统防火墙
	wptools: true, // wp工具
	plugin: true, // 插件
	runtime: true, // 运行环境
})

// 其他项目配置
export const otherItemsConfig = computed<Record<string, any>>(() => ({
	Ftp: {
		title: 'FTP', // 标题
		icon: 'ftp', // 图标
		dataKey: 'ftpList', // 数据key
		loadingKey: 'Ftp', // 加载key
		tooltip: '仅备份FTP账号和密码，不备份FTP目录', // 提示
	},
	Crontab: {
		title: '计划任务',
		icon: 'crontab',
		dataKey: 'crontabList',
		loadingKey: 'Crontab',
	},
	Terminal: {
		title: '终端',
		icon: 'xterm',
		dataKey: 'termList',
		loadingKey: 'Terminal',
		// count: true,
	},
	Firewall: {
		title: '系统防火墙',
		icon: 'firewall',
		dataKey: 'firewallList',
		loadingKey: 'Firewall',
	},
}))

/**
 * @description 获取迁移数据
 */
export const getMigrateData = async () => {
	try {
		const { data: res } = await getBackTotal()
		setData(res.data) // 设置数据
	} catch (error) {
		console.log(error)
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
		// firewall_conutry: '地区规则',
		firewall_ip: 'IP规则',
		firewall_forward: '端口转发规则',
		firewall_malicious_ip: '恶意IP',
		firewall_domain: '地区规则',
		firewall_new: '端口规则',
	}

	// 网站
	webList.value = data.site_list
	// 数据库
	dbList.value = data.database_list
	// FTP
	otherData.value.ftpList = data.ftp_list
	// 计划任务
	otherData.value.crontabList = data.crontab_list
	// 终端
	otherData.value.termList = Object.keys(data.ssh_list)
		.filter(key => key !== 'status' && key !== 'err_msg')
		.map(key => ({ name: terminalData[key], size: data.ssh_list[key] }))
	// 防火墙
	otherData.value.firewallList = Object.keys(firewallData)
		.filter(key => key !== 'firewall_conutry')
		.map(key => ({ name: firewallData[key], total: data.firewall_list[key] }))
	// 插件
	pluginList.value = data.plugin_list || []
	// 运行环境
	runtimeList.value = data.soft_data || []
	// wp工具
	wpList.value = data.wp_tools_list || []
	//
	sizeTotal.value = getByteUnit(data.disk_free)
	otherSize.value = getByteUnit(data.disk_use)
	sizeData.value = {
		total: data.disk_total,
		use: data.disk_use,
	}

	Object.keys(typeLoading.value).forEach((item: any) => (typeLoading.value[item.toLowerCase()] = false))
}

/**
 * @description 获取迁移状态
 */
export const getMigrateStatus = async () => {
	try {
		const { data: res } = await getMigrateTaskStatus()
		// 重置进度条
		resetprogressData()
		// 上一次迁移成功 展示状态为2
		// 上一次迁移失败 展示状态为3
		if (res.data.task_status) {
			// 正在迁移
			isRunMigrate.value = true
			// 请求进度
			getMigrateProgress()
		} else {
			// 未在迁移中
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 重置
 */
export const resetprogressData = () => {
	progressData.value = { status: 0, progress: 0, msg: '准备开始迁移', progressLog: '', remain_time: 100 }
}

/**
 * @description 获取迁移进度
 */
export const getMigrateProgress = async () => {
	try {
		const { data: res } = await getMigrateProgressApi()
		progressData.value.progress = res.data.migrate_progress
		progressData.value.progressLog = res.data.migrate_log
		progressData.value.msg = res.data.migrate_msg
		progressData.value.status = res.data.run_status

		// 继续请求
		if (res.data.run_status !== 2 && res.data.run_status !== 3) {
			setTimeout(() => {
				getMigrateProgress()
			}, 1000)
		} else {
			// 成功或失败 结束请求
			if (res.data.run_status === 2) {
				// 迁移成功
			} else {
				// 迁移失败
				errorData.value = res.data.err_info
			}
			successData.value = res.data
			if (res.data.task_info.panel_info) {
				const { panel_url, password, username } = res.data.task_info.panel_info
				successData.value.panel_addr = panel_url
				successData.value.panel_user = username
				successData.value.panel_password = password
			}
			isRunMigrate.value = false
			openMigreateProgress()
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 取消迁移
 */
export const cancelMigrate = async (isConfirm: boolean = true) => {
	if (isConfirm) {
		await useConfirm({
			title: '取消迁移',
			content: '取消迁移后，迁移任务将被删除，是否继续操作？',
		})
	}
	// 发送取消迁移请求
	useDataHandle({
		loading: '正在取消迁移，请稍后...',
		request: stopMigrateTask(),
		message: true,
		success: (res: any) => {
			Message.success('迁移任务已取消')
			isRunMigrate.value = false
			progressData.value.status = 0
			progressData.value.msg = '准备开始迁移'
			progressData.value.progress = 0
			progressData.value.progressLog = ''
		},
	})
}

/**
 * @description 打开迁移历史
 */
export const openMigrateHistory = () => {
	useDialog({
		area: 60,
		title: '迁移历史',
		component: () => import('./migrate-history.vue'),
	})
}

/**
 * @description 打开迁移进度
 */
export const openMigreateProgress = () => {
	useDialog({
		area: 60,
		title: false,
		component: () => import('./migrate-progress.vue'),
	})
}
