import { saveFileBody } from '@api/global'
import {
	getFileBody,
	getPHPStatus,
	getFpmSlowLogs,
	getFpmLogs,
	setPHPMaxTime,
	get_php_config,
	setPHPMaxSize,
	getPHPConfig,
	uninstallSoft,
	installSoft,
	getPHPConf,
	setPHPConf,
	setPHPDisable,
	setFpmConfig,
	getFpmConfig,
	setSessionConf,
	clearSessionFile,
	getSessionCount,
	getSessionConf,
	getPHPInfoData,
	getPHPInfo,
	getRegetCloudPHPExt,
	uninstallPecl,
	getPeclList,
	installPecl,
	getPeclLog,
} from '@api/soft'

import { Message, useConfirm, useDataHandle, useHandleError } from '@hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { msgBoxDialog } from '@/public/index'
import type { TableColumnProps } from '@/components/data/bt-table/types'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'

const serviceStatusStore = SOFT_SERVICE_STATUS_STORE()

const compData = ref<any>({}) // 组件数据

export const tabActive = ref<string>('service') // 当前激活的tab
export const viewLoading = ref<boolean>(false) // 视图加载

const status = ref<boolean>(false) // 服务状态
const name = ref<string>('') // 服务名称
const phpVersion = ref<string>('') // PHP版本
const version = ref<string>('') // 版本

const phpLoad = {
	pool: '应用池(pool)',
	process_manager: '进程管理方式(process manager)',
	dynamic: '动态',
	static: '静态',
	start_time: '启动日期(start time)',
	accepted_conn: '请求数(accepted conn)',
	listen_queue: '请求队列(listen queue)',
	max_listen_queue: '最大等待队列(max listen queue)',
	len_queue: 'socket队列长度(listen queue len)',
	idle_processes: '空闲进程数量(idle processes)',
	active_processes: '活跃进程数量(active processes)',
	total_processes: '总进程数量(total processes)',
	max_active_processes: '最大活跃进程数量(max active processes)',
	max_children_reached: '到达进程上限次数(max children reached)',
	slow_requests: '慢请求数量(slow requests)',
} as any

export const loadData = ref<any>([]) // 响应式数据
export const textLoading = ref<boolean>(false) // 文本加载

export const logsData = reactive({
	slowLogs: '',
	logs: '',
}) // 日志数据

export const staticContent = ref<string>('') // 静态内容
export const phpData = reactive({
	uploadLimit: '',
	timeLimit: '',
}) // php数据

/**
 * @description 获取慢日志
 */
export const getSlowLogs = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getFpmSlowLogs({
			version: phpVersion.value,
		}),
		success: (res: any) => {
			logsData.slowLogs = res.data.msg || '当前暂无数据'
		},
	})
}

/**
 * @description 获取慢日志
 */
export const getLogs = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getFpmLogs({
			version: phpVersion.value,
		}),
		success: (res: any) => {
			logsData.logs = res.msg ? res.msg : '当前暂无数据'
		},
	})
}

/**
 * @description 获取php配置
 */
const getConfig = async () => {
	await useDataHandle({
		loading: viewLoading,
		request: get_php_config({
			version: phpVersion.value,
		}),
		success: (res: any) => {
			phpData.uploadLimit = res.data.max
			phpData.timeLimit = res.data.maxTime
		},
	})
}

const checkNumber = (type: 'timeout' | 'upload') => {
	if (type === 'timeout') {
		// 超时限制 30-86400 且为正整数
		if (!/^[1-9]\d*$/.test(phpData.timeLimit)) {
			Message.error('请输入正整数')
			return false
		}
		if (Number(phpData.timeLimit) < 30 || Number(phpData.timeLimit) > 86400) {
			Message.error('超时限制范围为30-86400')
			return false
		}
	} else {
		// 限定只能输入正整数
		if (!/^[1-9]\d*$/.test(phpData.uploadLimit)) {
			Message.error('请输入正整数')
			return false
		}
		// 上传限制不可小于2
		if (Number(phpData.uploadLimit) < 2) {
			Message.error('上传大小限制不可小于2M')
			return false
		}
	}

	return true
}

/**
 * @description 保存配置 - 上传.超时限制
 */
export const setConfig = async () => {
	const canSave = checkNumber(tabActive.value as 'timeout' | 'upload')
	if (!canSave) return
	const isTime = tabActive.value === 'timeout'
	const requestFun = isTime ? setPHPMaxTime : setPHPMaxSize

	const params = {
		version: phpVersion.value,
		[isTime ? 'time' : 'max']: isTime ? phpData.timeLimit : phpData.uploadLimit,
	}

	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: requestFun(params),
		message: true,
	})
}

/**
 * @description 获取运行状态
 */
const getRunState = async () => {
	viewLoading.value = true
	try {
		const res = await getPHPStatus({
			version: phpVersion.value,
		})
		// 循环提取key为name，value为value的数据
		loadData.value = []
		Object.keys(res.data).forEach((key: any) => {
			if (phpLoad[key.replaceAll(' ', '_')]) {
				loadData.value.push({
					name: phpLoad[key.replaceAll(' ', '_')],
					value: res.data[key],
				})
			}
		})
		if (loadData.value.length === 0) {
			loadData.value = [
				{
					name: '当前暂无数据',
					value: 'null',
				},
			]
		}
	} catch (error) {
		useHandleError(error)
	} finally {
		viewLoading.value = false
	}
}

/**
 * @description 获取配置文件
 */
const getConfigEvent = async (path: string) => {
	await useDataHandle({
		loading: textLoading,
		request: getFileBody({ path: path }),
		data: {
			data: [String, staticContent],
		},
	})
}

/**
 * @description 保存配置文件
 */
export const saveFileEvent = async (path: string) => {
	await useDataHandle({
		loading: '正在保存配置，请稍后...',
		request: saveFileBody({
			path: '/www/server/php/' + phpVersion.value + '/etc/' + path,
			data: staticContent.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

// 安装扩展------------------
export const tableColumns = ref<TableColumnProps[]>([
	{ label: '名称', prop: 'name' },
	{ label: '类型', prop: 'type' },
	{ label: '说明', prop: 'msg', width: 320 },
	{
		label: '状态',
		prop: 'status',
		width: 60,
		render: (row: any) => {
			return row.status ? <i class="svgtofont-el-check font-bold "></i> : <i class="svgtofont-el-close font-bold "></i>
		},
	},
	{
		label: '操作',
		align: 'right',
		render: (row: any) => {
			if (row.task === '-1' && row.phpversions.indexOf(version.value) != '-1') {
				return (
					<span class="bt-link" onClick={msgBoxDialog}>
						正在安装
					</span>
				)
			} else if (row.task === '0' && row.phpversions.indexOf(version.value) != '-1') {
				return (
					<span class="!text-small bt-link" onClick={msgBoxDialog}>
						等待安装..
					</span>
				)
			} else if (row.status) {
				return (
					<span
						class="!text-danger bt-link"
						onClick={() => {
							useDataHandle({
								loading: '正在卸载中，请稍后...',
								request: uninstallSoft({ name: row.name, version: version.value }),
								message: true,
							})
						}}>
						卸载
					</span>
				)
			} else {
				return (
					<span
						class="bt-link"
						onClick={() => {
							useDataHandle({
								loading: '正在安装中，请稍后...',
								request: installSoft({
									name: row.name.toLowerCase(),
									version: version.value,
									type: 1,
								}),
								message: true,
								success: () => {
									// 打开消息盒子
									msgBoxDialog()
									getDevelopList()
								},
							})
						}}>
						安装
					</span>
				)
			}
		},
	},
]) // 响应式数据
export const tableData = ref<any>([]) // 响应式数据

export const functionData = reactive({
	list: [] as any,
	functionInput: '',
}) // 响应式数据

/**
 * @description 获取扩展列表
 */
const getDevelopList = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getPHPConfig({
			version: phpVersion.value,
		}),
		data: {
			libs: [Array, tableData],
			disable_functions: String,
		},
		success: (res: any) => {
			const data = res.libs.filter((item: any) => {
				return item.versions.includes(phpVersion.value)
			})
			tableData.value = data
			functionData.list = res.disable_functions
				? res.disable_functions.split(',').map((item: any) => {
						return { name: item }
				  })
				: []
		},
	})
}

// 配置修改 ---------------

export const settingsData = ref<any>([])

/**
 * @description: 保存php配置
 */
export const saveSettings = async () => {
	// 提取settingsData中每一项的name和value
	let params: any = {
		version: phpVersion.value,
	}
	settingsData.value.forEach((item: any) => {
		params[item.name] = item.value
	})
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setPHPConf(params),
		message: true,
	})
}

/**
 * @description: 获取php配置
 */
export const getPhpSettings = async (isRefresh: boolean = false) => {
	await useDataHandle({
		loading: viewLoading,
		request: getPHPConf({
			version: phpVersion.value,
		}),
		data: [Array, settingsData],
		success: (res: any) => {
			if (isRefresh) Message.success('刷新成功')
		},
	})
}

// 禁用函数 -----------------------
const getParams = () => {
	const disable_functions = functionData.list
		.map((item: any) => {
			return item.name
		})
		.join(',')
	const params = {
		version: phpVersion.value,
		disable_functions,
	}
	return params
}

const useSetPhpDisable = async (loading: string) => {
	const params = getParams()
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setPHPDisable(params),
		message: true,
		success: (res: any) => {
			if (res.status) {
				functionData.functionInput = ''
				getDevelopList()
			}
		},
	})
}

/**
 * @description: 增加禁用函数
 */
export const addFunction = async () => {
	functionData.list.push({
		name: functionData.functionInput,
	})
	await useSetPhpDisable('正在保存中，请稍后...')
}

/**
 * @description 删除禁用函数
 * @param row
 */
const delFunction = async (row: any) => {
	functionData.list.splice(functionData.list.indexOf(row), 1)
	await useSetPhpDisable('正在删除中，请稍后...')
}

export const functionColumn = ref<TableColumnProps[]>([
	{ label: '名称', prop: 'name' },
	useOperate([
		{
			title: '删除',
			onClick: delFunction,
		},
	]),
]) // 响应式数据

// 性能调整 ----------------
const phpPerformance = {
	'1GB内存': {
		max_children: 30,
		start_servers: 5,
		min_spare_servers: 5,
		max_spare_servers: 20,
	},
	'2GB内存': {
		max_children: 50,
		start_servers: 5,
		min_spare_servers: 5,
		max_spare_servers: 30,
	},
	'4GB内存': {
		max_children: 80,
		start_servers: 10,
		min_spare_servers: 10,
		max_spare_servers: 30,
	},
	'8GB内存': {
		max_children: 120,
		start_servers: 10,
		min_spare_servers: 10,
		max_spare_servers: 30,
	},
	'16GB内存': {
		max_children: 200,
		start_servers: 15,
		min_spare_servers: 15,
		max_spare_servers: 50,
	},
	'32GB内存': {
		max_children: 300,
		start_servers: 20,
		min_spare_servers: 20,
		max_spare_servers: 50,
	},
	'48GB内存': {
		max_children: 400,
		start_servers: 20,
		min_spare_servers: 20,
		max_spare_servers: 50,
	},
	'64GB内存': {
		max_children: 500,
		start_servers: 30,
		min_spare_servers: 30,
		max_spare_servers: 60,
	},
	'96GB内存': {
		max_children: 700,
		start_servers: 40,
		min_spare_servers: 40,
		max_spare_servers: 70,
	},
	'128GB内存': {
		max_children: 1000,
		start_servers: 50,
		min_spare_servers: 50,
		max_spare_servers: 100,
	},
} as any
export const performanceForm = reactive<any>({
	limit: '',
	listen: '',
	bind_port: '',
	allowed: '',
	pm: '',
	max_children: '',
	start_servers: '',
	min_spare_servers: '',
	max_spare_servers: '',
}) // 性能调整表单
export const performanceData = ref<any>([]) // 性能调整数据

const performanceTips: any = {
	max_children: '允许创建的最大子进程数',
	start_servers: '起始进程数（服务启动后初始进程数量）',
	min_spare_servers: '最小空闲进程数（清理空闲进程后的保留数量）',
	max_spare_servers: '最大空闲进程数（当空闲进程达到此值时清理）',
}

/**
 * @description 更改性能调整
 * @param val
 */
export const changePerformance = (val: string) => {
	performanceData.value = Object.entries(phpPerformance[val]).map((item: any) => {
		return {
			name: item[0],
			value: item[1],
			tips: performanceTips[item[0]],
		}
	})
}

/**
 * @description: 获取php-fpm配置
 */
export const savePerformance = async () => {
	// 同步performanceForm，performanceData数据
	performanceData.value.forEach((item: any, index: any) => {
		if (index < 4) performanceForm[item.name] = item.value
	})
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setFpmConfig({
			version: phpVersion.value,
			...performanceForm,
			btn_children_submit: '',
		}),
		message: true,
	})
}

/**
 * @description 获取mysql性能调整
 */
const getFpmPerformance = async () => {
	viewLoading.value = true
	try {
		const { data: res } = await getFpmConfig({
			version: phpVersion.value,
		})
		performanceData.value = []
		Object.keys(res).forEach((key: any) => {
			performanceData.value.push({
				name: key,
				value: res[key],
				tips: performanceTips[key],
			})
		})
		performanceForm.listen = res.unix
		performanceForm.allowed = res.allowed
		performanceForm.bind_port = res.bind + (res.port ? ':' + res.port : '')
		performanceForm.pm = res.pm
		// 判定当前并发方案选中项
		Object.keys(phpPerformance).forEach((key: any) => {
			if (phpPerformance[key].max_children === Number(res.max_children)) {
				performanceForm.limit = key
			}
		})
	} catch (error) {
		useHandleError(error)
	} finally {
		viewLoading.value = false
	}
}

// Session配置 ----------------
export const sessionForm = reactive({
	save_handler: '',
	save_path: '',
	port: '',
	passwd: '',
}) // session表单
export const sessionData = reactive({
	total: 0,
	oldfile: 0,
}) // session数据

/**
 * @description 保存session配置
 */
export const saveSession = async () => {
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setSessionConf({
			version: phpVersion.value,
			save_handler: sessionForm.save_handler,
			ip: sessionForm.save_path,
			port: sessionForm.port,
			passwd: sessionForm.passwd,
		}),
		message: true,
	})
}

/**
 * @description 清理session配置
 */
export const clearSession = async () => {
	await useConfirm({
		title: '清理php_session文件',
		icon: 'warning-filled',
		content: '是否清理php_session文件？',
	})
	useDataHandle({
		loading: '正在清理，请稍后...',
		request: clearSessionFile(),
		message: true,
		success: getSessionCountEvent,
	})
}

/**
 * @description 获取session文件数量
 */
const getSessionCountEvent = async () => {
	await useDataHandle({
		loading: textLoading,
		request: getSessionCount({
			version: phpVersion.value,
		}),
		success: (res: any) => {
			sessionData.total = res.data.total
			sessionData.oldfile = res.data.oldfile
		},
	})
}

/**
 * @description 更改session
 */
export const changeSession = async () => {
	// 当选项变化时 数据改变
	switch (sessionForm.save_handler) {
		case 'redis':
			sessionForm.save_path = '127.0.0.1'
			sessionForm.port = '6379'
			break
		case 'memcache':
		case 'memcached':
			sessionForm.save_path = '127.0.0.1'
			sessionForm.port = '11211'
			break
		case 'files':
			sessionForm.save_path = ''
			sessionForm.port = ''
			sessionForm.passwd = ''
			break
	}
}

/**
 * @description 获取session配置
 */
const getSession = async () => {
	await useDataHandle({
		loading: viewLoading,
		request: getSessionConf({
			version: phpVersion.value,
		}),
		success: (res: any) => {
			sessionForm.save_handler = res.data.save_handler
			sessionForm.save_path = res.data.save_path
			sessionForm.port = res.data.port
			sessionForm.passwd = res.data.passwd
		},
	})
}

export const installedTable = ref([]) // 已安装扩展表格

// phpinfo ----------------
export const infoPopup = ref(false) // phpinfo弹窗
export const infoHtml = ref('') // phpinfo弹窗内容

export const phpInfoData = reactive<any>({
	data: {},
	key: [],
}) // phpinfo数据

/**
 * @description 获取phpinfo
 */
const getPHPInfoEvent = async () => {
	await useDataHandle({
		loading: viewLoading,
		request: getPHPInfoData({
			php_version: phpVersion.value,
		}),
		success: (res: any) => {
			phpInfoData.data = res.data
			phpInfoData.key = Object.keys(phpInfoData.data.phpinfo.keys)
			const list = res.data.phpinfo.modules.split(' ') || []
			installedTable.value = list.map((item: any) => ({ name: item }))
		},
	})
}

/**
 * @description 打开phpinfo
 */
export const openPHPInfo = async () => {
	await useDataHandle({
		request: getPHPInfo({
			version: phpVersion.value,
		}),
		success: (res: any) => {
			infoHtml.value = res.data.replace('a:link {color: #009; text-decoration: none; background-color: #fff;}', '').replace('a:link {color: #000099; text-decoration: none; background-color: #ffffff;}', '')
			infoPopup.value = true
		},
	})
}

/**
 * @description tab切换
 * @param tab
 */
export const handleTabClick = async ({ props: { name } }: any) => {
	switch (name) {
		case 'development':
		case 'function':
			getDevelopList()
			break
		case 'performance':
			getFpmPerformance()
			break
		case 'session':
			getSession()
			getSessionCountEvent()
			break
		case 'phpinfo':
			getPHPInfoEvent()
			break
		case 'settings':
			getPhpSettings()
			break
		case 'config':
			// 获取配置文件
			getConfigEvent('/www/server/php/' + phpVersion.value + '/etc/php.ini')
			break
		case 'fpm':
			getConfigEvent('/www/server/php/' + phpVersion.value + '/etc/php-fpm.conf')
			break
		case 'state':
			getRunState() // 获取当前状态
			break
		case 'logs':
			getLogs()
			break
		case 'slowLogs':
			getSlowLogs() // 获取慢日志
			break
		case 'timeout':
		case 'upload':
			getConfig()
			break
	}
}

export const getNewList = async () => {
	try {
		useDataHandle({
			loading: '正在获取中，请稍后...',
			request: getRegetCloudPHPExt(),
			message: true,
		})
	} catch (error) {
		console.log(error)
	}
}

export const init = (data: any) => {
	tabActive.value = 'service'
	if (data) compData.value = data
	// 加载服务状态
	serviceStatusStore.init(compData.value)

	status.value = compData.value.status
	name.value = compData.value.s_version + '-' + compData.value.name.replace('php-', '').replace('.', '')
	phpVersion.value = compData.value.name.replace('php-', '').replace('.', '')
	version.value = compData.value.version.split('.')[0] + compData.value.version.split('.')[1]
}

export const developTabActive = ref<string>('list') // 当前激活的tab
export const handleDevelopTabClick = async ({ props: { name } }: any) => {
	developTabActive.value = name
	if (name === 'list') {
		getDevelopList()
	} else if (name === 'installed') {
		getPHPInfoEvent()
	} else if (name === 'pecl') {
		getPeclListData()
	}
}

//  pecl

export const peclData = ref<any>([]) // pecl数据
export const peclName = ref('') // pecl名称

export const peclLogPopup = ref(false) // pecl日志弹窗
export const peclLogs = ref('') // pecl日志

/**
 * @description 安装扩展
 * @param row
 */
export const installPeclEvent = async () => {
	if (!peclName.value) return Message.error('请输入扩展名称')
	try {
		await useDataHandle({
			loading: '正在安装中，请稍后...',
			request: installPecl({
				name: peclName.value,
				version: phpVersion.value,
			}),
			message: true,
		})
		peclName.value = ''
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 卸载扩展
 * @param row
 */
export const delPecl = async (row: any) => {
	try {
		await useConfirm({
			title: '删除扩展',
			icon: 'warning-filled',
			content: '是否删除扩展【' + row.name + '】？',
		})
		await useDataHandle({
			loading: '正在删除中，请稍后...',
			request: uninstallPecl({
				phpv: phpVersion.value,
				name: row.name,
			}),
			message: true,
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取pecl列表
 */
export const getPeclListData = async () => {
	try {
		await useDataHandle({
			request: getPeclList({ version: phpVersion.value }),
			data: [Array, peclData],
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 打开pecl日志
 */
export const openPeclLog = async () => {
	try {
		const res = await useDataHandle({
			loading: '正在获取中，请稍后...',
			request: getPeclLog({ version: phpVersion.value }),
		})
		peclLogs.value = res.data.msg || '当前暂无数据'
		peclLogPopup.value = true
	} catch (error) {
		console.log(error)
	}
}

export const peclColumn = ref<TableColumnProps[]>([{ label: '扩展名称', prop: 'name' }, { label: '版本', prop: 'version' }, { label: '类型', prop: 'type' }, useOperate([{ title: '删除', onClick: delPecl }])])
