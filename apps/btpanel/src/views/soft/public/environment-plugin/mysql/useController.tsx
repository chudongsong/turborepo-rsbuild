import { Message, useConfirm, useDataHandle, useDialog, useHandleError, useMessage } from '@hooks/tools'
import { getFileBody, getPluginInfo, getStartErrType, saveFileBody, serviceManage, setInnodbRecovery } from '@/api/global'
import { clearErrorLog, clearMySQLBinlog, delDataBaseFile, getBinlogConfig, getBinlogList, getDatabaseInfo, getDatabaseStatus, getDbStatus, getErrorLog, getSlowLog, protectionStatus, setDataDir, setDbConf, SetMySQLPort } from '@/api/soft'
import { fileSelectionDialog } from '@/public/index'
import { formatTime, getByteUnit, isNumber } from '@utils/index'
import HOME_STORE from '@/views/home/store'
import { router } from '@/router'
import SOFT_STATUS_STOP_ALERT from '../public/status-stop-alert/store'
import SOFT_SERVICE_STATUS_STORE from '../public/service-status/store'

const statusStopStore = SOFT_STATUS_STOP_ALERT()
const serviceStatusStore = SOFT_SERVICE_STATUS_STORE()
const { compData } = storeToRefs(SOFT_SERVICE_STATUS_STORE())

// const compData = ref<any>({}) // 组件数据

const homeStore = HOME_STORE()
const { memory } = storeToRefs(homeStore)

export const tabActive = ref<string>('service') // 当前激活的tab
export const isLoading = ref<boolean>(false) // 内容加载
const isInit = ref(true) // 是否初始化

// 服务
export const status = ref<string>('') // 状态
export const isRecoverPopup = ref<boolean>(false) // 恢复弹窗
export const form = reactive({
	re_level: 1,
	tips: '',
})
export const levelOptions = [
	{
		label: '级别一',
		value: 1,
	},
	{
		label: '级别二',
		value: 2,
	},
	{
		label: '级别三',
		value: 3,
	},
	{
		label: '级别四',
		value: 4,
	},
	{
		label: '级别五',
		value: 5,
	},
	{
		label: '级别六',
		value: 6,
	},
]

export const progressDialog = ref<any>(null) // 进度框

export const helpList = {
	recover: [
		{
			content: '启动完成后请立即备份和检查数据库完整性',
		},
		{
			content: '恢复级别说明（从1到6进行尝试）：',
		},
		{
			content: '级别一：尝试忽略损坏的页，适用于轻微损坏的情况，可以尝试从数据中恢复。',
		},
		{
			content: '级别二：禁用后台线程，适合解决由于并发操作导致的问题。',
		},
		{
			content: '级别三：适用于需要快速恢复的场景，但可能会导致最近的数据丢失。',
		},
		{
			content: '级别四：适用于插入缓冲区引起问题时的恢复，可能会导致数据文件损坏。',
		},
		{
			content: '级别五：适合于需要快速启动但可能会导致数据一致性问题的情况。',
		},
		{
			content: '级别六：适用于最严重的情况，可能会导致较高的数据丢失及数据文件损坏。',
		},
	],
	config: [
		{
			content: '此处为mysql主配置文件，若您不了解配置规则，请勿随意修改',
		},
	],
	storage: [{ content: '风险提示：迁移过程中Mysql将会停止运行，请谨慎操作' }, { content: '风险提示：迁移过程中请等待迁移完成后再进行其他操作' }],
	memoryProtection: [{ content: '说明：开启后将调整Mysql内存优先级，设置mysql为永不被系统杀死，可确保Mysql稳定运行。但可能导致其他进程异常被杀，严重时可能影响系统运行，建议需要Mysql稳定运行时在开启。' }],
}

/**
 * @description 修复启动
 */
export const repairStartEvent = async () => {
	await useConfirm({
		title: `mysqld服务`,
		icon: 'warning-filled',
		content: `即将开始修复mysql启动问题，是否继续？`,
	})
	await useDataHandle({
		loading: '正在修复启动，请稍后...',
		request: getStartErrType(),
		success: async (res: any) => {
			if (res.err_type === 'data_err') {
				form.tips = res.msg
				isRecoverPopup.value = true
			} else if (res.err_type === 'log_err') {
				logRunMysqlEvent(res.msg)
			} else {
				getPluginData()
				Message.msg({
					dangerouslyUseHTMLString: true,
					message: res.msg,
					type: res.status ? 'success' : 'error',
					duration: res.status ? 2000 : 0,
					showClose: !res.status,
					customClass: `${res.err_type === 'port_in_use' ? 'max-w-[48rem]' : ''}`,
				}) // 提示错误信息
			}
		},
	})
}

/**
 * @description 恢复数据启动mysql 清理日志
 */
const logRunMysqlEvent = async (content: string) => {
	await useConfirm({
		title: `修复MySQL启动`,
		icon: 'warning-filled',
		content,
	})
	useDataHandle({
		loading: '正在修复MySQL启动，请稍后...',
		request: clearMySQLBinlog(),
		message: true,
		success: (res: any) => {
			getPluginData()
		},
	})
}

/**
 * @description 修复启动-恢复模式
 */
export const onConfirm = async () => {
	if (form.re_level >= 4)
		await useConfirm({
			title: '修复MYSQL启动',
			width: '39rem',
			isHtml: true,
			content: '警告：当前选择的恢复等级将可能导致<span class="text-danger">数据文件损坏会丢失</span>，请做好服务器快照或备份好数据库数据目录【/www/server/data】如果启动成功，数据库将会进入只读模式',
		})

	await useDataHandle({
		loading: '正在修复启动，请稍后...',
		request: setInnodbRecovery({ re_level: form.re_level }),
		message: true,
		success: async (res: any) => {
			if (res.status) isRecoverPopup.value = false
			getPluginData()
		},
	})
}

/**
 * @description 获取数据库信息
 */
const getPluginData = () => {
	useDataHandle({
		request: getPluginInfo({ sName: 'mysql' }),
		success: (res: any) => {
			compData.value = res.data
		},
	})
}

// 配置文件
export const staticContent = ref<string>('') // 静态内容

/**
 * @description 保存配置文件
 */
export const saveFileEvent = async () => {
	await useDataHandle({
		loading: '正在保存配置，请稍后...',
		request: saveFileBody({
			path: '/etc/my.cnf',
			data: staticContent.value,
			encoding: 'utf-8',
		}),
		message: true,
	})
}

/**
 * @description 获取配置文件
 */
const getConfigEvent = async () => {
	await useDataHandle({
		loading: isLoading,
		request: getFileBody({ path: '/etc/my.cnf' }),
		data: {
			data: [String, staticContent],
		},
	})
}

export const mysqlData = reactive<any>({
	path: '', // 存储路径
	port: '', // 端口
	oldData: {
		path: '',
		port: '',
	},
})

/**
 * @description: 触发目录选择
 */
export const onPathChange = () => {
	fileSelectionDialog({
		type: 'dir',
		path: mysqlData.path,
		change: path => {
			mysqlData.path = path
		},
	})
}

/**
 * @description 设置mysql配置
 */
export const setMysqlConfig = async () => {
	// 修改端口 or 存储位置
	const isPort = tabActive.value === 'port'

	if (!mysqlData.path && !isPort) return Message.error('存储位置不能为空')
	if (!mysqlData.port && isPort) return Message.error('端口不能为空')

	// 判断是否有修改 未修改则不提交
	if (isPort && mysqlData.port === mysqlData.oldData.port) {
		return Message.success('未修改端口数据')
	}
	if (!isPort && mysqlData.path === mysqlData.oldData.path) {
		return Message.success('未修改存储位置数据')
	}

	// 修改存储位置时,提示是否确认修改
	!isPort &&
		(await useConfirm({
			title: '数据库迁移',
			icon: 'warning-filled',
			content: `请确定是否迁移至:【${mysqlData.path}】？`,
		}))

	const params = {
		[isPort ? 'port' : 'datadir']: mysqlData[isPort ? 'port' : 'path'],
	}
	const requestFun = isPort ? SetMySQLPort : setDataDir

	useDataHandle({
		loading: '正在设置，请稍后...',
		request: requestFun(params),
		message: true,
		success: async (res: any) => {
			let dialog = await progressDialog.value
			dialog.unmount()
			// 刷新
			getMysqlConfig()
		},
	})

	setTimeout(() => {
		// 若为存储位置修改,需要打开进度框
		!isPort && openProgress()
	}, 1000)
}

const openProgress = async () => {
	progressDialog.value = useDialog({
		title: '迁移任务',
		area: 60,
		component: () => import('./progress.vue'),
	})
}

/**
 * @description 获取mysql配置
 */
const getMysqlConfig = async () => {
	await useDataHandle({
		loading: isLoading,
		request: getDatabaseInfo(),
		success: (res: any) => {
			mysqlData.path = res?.data?.datadir || ''
			mysqlData.port = res?.data?.port || ''
			// 历史值存储
			mysqlData.oldData.path = res?.data?.datadir || ''
			mysqlData.oldData.port = res?.data?.port || ''
		},
	})
}

// 当前状态
export const noPsTitle = ref([
	{
		name: '启动时间',
		field: 'Run',
		value: '无',
		function: (data: any) => formatTime(data.Run),
	},
	{
		name: '总连接次数',
		field: 'Connections',
		value: '无',
	},
	{
		name: '发送',
		value: '无',
		field: 'other',
		function: (data: any) => getByteUnit(Number(data.Bytes_sent)),
	},
	{
		name: '接收',
		value: '无',
		field: 'other',
		function: (data: any) => getByteUnit(Number(data.Bytes_received)),
	},
	{
		name: '每秒查询',
		value: '无',
		field: 'other',
		function: (data: any) => {
			// 取整 data.Questions / data.Uptime
			return parseInt((data.Questions / data.Uptime).toString())
		},
	},
	{
		name: '每秒事务',
		value: '无',
		// parseInt((parseInt(rdata.Com_commit) + parseInt(rdata.Com_rollback)) / rdata.Uptime) +
		field: 'other',
		function: (data: any) => {
			return parseInt(((parseInt(data.Com_commit) + parseInt(data.Com_rollback)) / data.Uptime).toString())
		},
	},
	{
		name: 'File',
		value: '无',
		field: 'File',
	},
	{
		name: 'Position',
		value: '无',
		field: 'Position',
	},
]) // 无提示标题)
export const psTitle = ref([
	{
		name: '活动/峰值连接数',
		function: (data: any) => {
			return data.Threads_running + '/' + data.Max_used_connections
		},
		value: '',
		ps: '若值过大,增加max_connections',
	},
	{
		name: '线程缓存命中率',
		value: '',
		function: (data: any) => {
			let value: any = ((1 - data.Threads_created / data.Connections) * 100).toFixed(2)
			return !isNaN(value) ? value + '%' : '0'
		},
		ps: '若过低,增加thread_cache_size',
	},
	{
		value: '',
		name: '索引命中率',
		function: (data: any) => {
			let value: any = ((1 - data.Key_reads / data.Key_read_requests) * 100).toFixed(2)
			return !isNaN(value) ? value + '%' : '0'
		},
		ps: '若过低,增加key_buffer_size',
	},
	{
		value: '',
		name: 'Innodb索引命中率',
		function: (data: any) => {
			let value: any = ((1 - data.Innodb_buffer_pool_reads / data.Innodb_buffer_pool_read_requests) * 100).toFixed(2)
			return !isNaN(value) ? value : '0'
		},
		ps: '若过低,增加innodb_buffer_pool_size',
	},
	{
		value: '',
		name: '查询缓存命中率',
		function: (data: any) => {
			let cache_size = ((parseInt(data.Qcache_hits) / (parseInt(data.Qcache_hits) + parseInt(data.Qcache_inserts))) * 100).toFixed(2) + '%'
			if (cache_size == 'NaN%') cache_size = 'OFF'
			return cache_size
		},
		ps: '若过低,增加query_cache_size',
	},
	{
		value: '',
		name: '创建临时表到磁盘',
		function: (data: any) => {
			let value: any = ((data.Created_tmp_disk_tables / data.Created_tmp_tables) * 100).toFixed(2)
			return !isNaN(value) ? value + '%' : '0'
		},
		ps: '若过大,尝试增加tmp_table_size',
	},
	{
		value: '',
		name: '已打开的表',
		function: (data: any) => {
			return data.Open_tables
		},
		ps: 'table_open_cache配置值应大于等于此值',
	},
	{
		value: '',
		name: '没有使用索引的量',
		function: (data: any) => {
			return data.Select_full_join
		},
		ps: '若不为0,请检查数据表的索引是否合理',
	},
	{
		value: '',
		name: '没有索引的JOIN量',
		function: (data: any) => {
			return data.Select_range_check
		},
		ps: '若不为0,请检查数据表的索引是否合理',
	},
	{
		value: '',
		name: '排序后的合并次数',
		function: (data: any) => {
			return data.Sort_merge_passes
		},
		ps: '若值过大,增加sort_buffer_size',
	},
	{
		value: '',
		name: '锁表次数',
		function: (data: any) => {
			return data.Table_locks_waited
		},
		ps: '若值过大,请考虑增加您的数据库性能',
	},
]) // 有提示标题

/**
 * @description 获取运行状态
 */
const getRunState = async () => {
	await useDataHandle({
		loading: isLoading,
		request: getDatabaseStatus(),
		success: (res: any) => {
			if (res.status === false || res.data?.status) {
				return Message.msg({
					customClass: 'bt-message-error-html',
					dangerouslyUseHTMLString: true,
					message: res.msg || res.data.msg,
					type: 'error',
					showClose: true,
				})
			} // 提示错误信息
			noPsTitle.value.forEach((item: any) => {
				if (item.function) {
					item.value = item.function(res.data)
				} else {
					item.value = res.data[item.field]
				}
			})
			// 循环psTitle,判定是否存在value,存在则执行function，value赋值为function结果
			psTitle.value.forEach((item: any) => {
				if (item.function) {
					item.value = item.function(res.data)
				}
			})
		},
	})
}

// 性能调整
export const mysqlSelect = [
	{
		title: '1-2GB',
		data: {
			key_buffer_size: 32,
			query_cache_size: 32,
			tmp_table_size: 32,
			innodb_buffer_pool_size: 64,
			sort_buffer_size: 256,
			read_buffer_size: 256,
			read_rnd_buffer_size: 256,
			join_buffer_size: 512,
			thread_stack: 256,
			binlog_cache_size: 64,
			thread_cache_size: 64,
			table_open_cache: 128,
			max_connections: 100,
		},
	},
	{
		title: '2-4GB',
		data: {
			key_buffer_size: 64,
			query_cache_size: 64,
			tmp_table_size: 64,
			innodb_buffer_pool_size: 128,
			sort_buffer_size: 512,
			read_buffer_size: 512,
			read_rnd_buffer_size: 512,
			join_buffer_size: 1024,
			thread_stack: 256,
			binlog_cache_size: 64,
			thread_cache_size: 96,
			table_open_cache: 192,
			max_connections: 200,
		},
	},
	{
		title: '4-8GB',
		data: {
			key_buffer_size: 128,
			query_cache_size: 128,
			tmp_table_size: 128,
			innodb_buffer_pool_size: 256,
			sort_buffer_size: 1024,
			read_buffer_size: 1024,
			read_rnd_buffer_size: 768,
			join_buffer_size: 2048,
			thread_stack: 256,
			binlog_cache_size: 128,
			thread_cache_size: 128,
			table_open_cache: 384,
			max_connections: 300,
		},
	},
	{
		title: '8-16GB',
		data: {
			key_buffer_size: 256,
			query_cache_size: 256,
			tmp_table_size: 256,
			innodb_buffer_pool_size: 1024,
			sort_buffer_size: 1024,
			read_buffer_size: 2048,
			read_rnd_buffer_size: 1024,
			join_buffer_size: 2048,
			thread_stack: 384,
			binlog_cache_size: 192,
			thread_cache_size: 192,
			table_open_cache: 1024,
			max_connections: 400,
		},
	},
	{
		title: '16-32GB',
		data: {
			key_buffer_size: 512,
			query_cache_size: 384,
			tmp_table_size: 1024,
			innodb_buffer_pool_size: 2048,
			sort_buffer_size: 4096,
			read_buffer_size: 4096,
			read_rnd_buffer_size: 2048,
			join_buffer_size: 4096,
			thread_stack: 512,
			binlog_cache_size: 256,
			thread_cache_size: 256,
			table_open_cache: 2048,
			max_connections: 500,
		},
	},
	{
		title: '32-48GB',
		data: {
			key_buffer_size: 1024,
			query_cache_size: 512,
			tmp_table_size: 1536,
			innodb_buffer_pool_size: 4096,
			sort_buffer_size: 4096,
			read_buffer_size: 4096,
			read_rnd_buffer_size: 3072,
			join_buffer_size: 6144,
			thread_stack: 512,
			binlog_cache_size: 384,
			thread_cache_size: 384,
			table_open_cache: 3072,
			max_connections: 750,
		},
	},
	{
		title: '48-64GB',
		data: {
			key_buffer_size: 2048,
			query_cache_size: 768,
			tmp_table_size: 2048,
			innodb_buffer_pool_size: 8192,
			sort_buffer_size: 4096,
			read_buffer_size: 4096,
			read_rnd_buffer_size: 4096,
			join_buffer_size: 8192,
			thread_stack: 512,
			binlog_cache_size: 512,
			thread_cache_size: 512,
			table_open_cache: 4096,
			max_connections: 1000,
		},
	},
	{
		title: '64-96GB',
		data: {
			key_buffer_size: 2048,
			query_cache_size: 1024,
			tmp_table_size: 3072,
			innodb_buffer_pool_size: 16384,
			sort_buffer_size: 8192,
			read_buffer_size: 8192,
			read_rnd_buffer_size: 4096,
			join_buffer_size: 8192,
			thread_stack: 768,
			binlog_cache_size: 768,
			thread_cache_size: 768,
			table_open_cache: 6144,
			max_connections: 1500,
		},
	},
	{
		title: '96-128GB',
		data: {
			key_buffer_size: 2048,
			query_cache_size: 1536,
			tmp_table_size: 4096,
			innodb_buffer_pool_size: 32768,
			sort_buffer_size: 8192,
			read_buffer_size: 8192,
			read_rnd_buffer_size: 8192,
			join_buffer_size: 8192,
			thread_stack: 1024,
			binlog_cache_size: 1024,
			thread_cache_size: 1024,
			table_open_cache: 8192,
			max_connections: 2000,
		},
	},
	{
		title: '128-256GB',
		data: {
			key_buffer_size: 4096,
			query_cache_size: 2048,
			tmp_table_size: 8192,
			innodb_buffer_pool_size: 65536,
			sort_buffer_size: 8192,
			read_buffer_size: 8192,
			read_rnd_buffer_size: 8192,
			join_buffer_size: 8192,
			thread_stack: 2048,
			binlog_cache_size: 2048,
			thread_cache_size: 2048,
			table_open_cache: 16384,
			max_connections: 4000,
		},
	},
] as any
const mysqlPsData = {
	key_buffer_size: 'MB,用于索引的缓冲区大小',
	query_cache_size: 'MB,查询缓存,不开启请设为0',
	tmp_table_size: 'MB,临时表缓存大小',
	innodb_buffer_pool_size: 'MB,Innodb缓冲区大小',
	innodb_log_buffer_size: 'MB,Innodb日志缓冲区大小',
	sort_buffer_size: 'KB * 连接数,每个线程排序的缓冲大小',
	read_buffer_size: 'KB * 连接数读入缓冲区大小',
	read_rnd_buffer_size: 'KB * 连接数随机读取缓冲区大小',
	join_buffer_size: 'KB * 连接数关联表缓存大小',
	thread_stack: 'KB * 连接数每个线程的堆栈大小',
	binlog_cache_size: 'KB * 连接数二进制日志缓存大小(4096的倍数)',
	thread_cache_size: '线程池大小',
	table_open_cache: '表缓存',
	max_connections: '最大连接数',
} as AnyObject
export const mysqlSelectData = ref<number | string>('') // mysql优化方案
export const performanceData = ref<any>([]) // 性能调整数据
export const mysqlUseMem = ref() // mysql最大使用内存

/**
 * 根据当前配置数据匹配优化方案
 * @param memData 从接口获取的内存配置数据
 * @returns 匹配到的方案索引，如果没有匹配则返回空字符串
 */
const findMatchingScheme = (memData: any): number | string => {
	if (!memData || typeof memData !== 'object') {
		return ''
	}
	for (let i = 0; i < mysqlSelect.length; i++) {
		const scheme = mysqlSelect[i]
		const schemeData = scheme.data
		let isMatch = true
		for (const [key, value] of Object.entries(schemeData)) {
			let memKey = key
			let expectedValue = value
			if (key === 'query_cache_size') {
				if (memData['query_cache_supprot'] === 'disable') {
					continue
				} else if (memData['bt_query_cache_size'] !== undefined) {
					memKey = 'bt_query_cache_size'
				} else if (memData['query_cache_type'] !== undefined) {
					if (memData['query_cache_type'] === 0 && Number(value) === 0) {
						continue
					} else if (memData['query_cache_type'] === 1 && Number(value) > 0) {
						if (memData['query_cache_size'] !== value) {
							isMatch = false
							break
						}
						continue
					}
				}
			}
			if (memData[memKey] === undefined) {
				continue
			}
			if (memData[memKey] !== expectedValue) {
				isMatch = false
				break
			}
		}
		if (isMatch) {
			return i
		}
	}
	return ''
}

export const changeDbScheme = async (val: number | string) => {
	// 将performanceData中每一项的value设置为mysqlSelect[val].data中对应的值
	const index = Number(val)
	performanceData.value.forEach((item: any) => {
		if (mysqlSelect[index].data[item.name]) {
			item.value = mysqlSelect[index].data[item.name]
		}
		if (item.name === 'query_cache_size' && !mysqlSelect[index].data['query_cache_size']) {
			item.value = 0
		}
	})
	changeMysqlInput()
}

/**
 * @description mysql输入框改变
 */
export const changeMysqlInput = () => {
	// 监听值改变，计算最大使用内存
	let sum = 0,
		a = 0,
		b = 0
	// 需要再次除1024的值
	// const secondaryData = ['sort_buffer_size', 'read_buffer_size', 'read_rnd_buffer_size', 'join_buffer_size', 'thread_stack', 'binlog_cache_size']
	const aValue = ['key_buffer_size', 'query_cache_size', 'tmp_table_size', 'innodb_buffer_pool_size', 'innodb_log_buffer_size']
	const bValue = ['sort_buffer_size', 'read_buffer_size', 'read_rnd_buffer_size', 'join_buffer_size', 'thread_stack', 'binlog_cache_size']
	const max_connections = Number(performanceData.value.find((item: any) => item.name === 'max_connections').value)
	performanceData.value.forEach((item: any) => {
		// 当是aValue中的数据则累加至变量a，当是bValue中的数据则累加至变量b，同时判定是否需要除1024
		if (aValue.includes(item.name)) {
			// if (secondaryData.includes(item.name)) {
			// a += Number(item.value) / 1024
			// }
			// else {
			a += Number(item.value)
			// }
		} else if (bValue.includes(item.name)) {
			// if (secondaryData.includes(item.name)) {
			b = b + Number(item.value) / 1024
			// } else {
			// b += Number(item.value)
			// }
		}
	})
	sum = a + b * max_connections
	mysqlUseMem.value = sum
	// if (mysqlSelectData.value === '' && isInit.value) {
	// 	mysqlUseMem.value = ''
	// 	mysqlSelectData.value !== '' && (isInit.value = false)
	// }
}

/**
 * 保存后重新匹配优化方案
 */
const reMatchAfterSave = () => {
	const currentConfig: Record<string, any> = {}
	performanceData.value.forEach((item: any) => {
		if (item.name && item.value !== undefined && item.value !== null) {
			currentConfig[item.name] = Number(item.value)
		}
	})
	if (currentConfig.query_cache_size === 0) {
		currentConfig.query_cache_supprot = 'disable'
	}

	const matchedScheme = findMatchingScheme(currentConfig)
	mysqlSelectData.value = matchedScheme
}

/**
 * @description 保存数据
 */
export const saveDbData = async () => {
	// 提取performanceData中每一项的value
	let params: any = {
		query_cache_type: 0,
	}
	performanceData.value.forEach((item: any) => {
		const key = item.name === 'bt_query_cache_size' ? 'query_cache_size' : item.name
		params[key] = item.value
	})
	if (params.query_cache_size > 0) params.query_cache_type = 1
	delete params['query_cache_supprot']
	params['max_heap_table_size'] = params.tmp_table_size
	// if (mysqlUseMem.value > memory.value.memTotal * 1.5) {
	// 	Message.error('内存不足，请重新调整配置')
	// 	return
	// }
	await useDataHandle({
		loading: '正在保存中，请稍后...',
		request: setDbConf(params),
		message: true,
		success: (res: any) => {
			if (res.status) {
				Message.success('设置成功，重启数据库后配置生效，请重启数据库')
				reMatchAfterSave()
			}
		},
	})
}

/**
 * @description 服务管理-重启，停止，重载配置
 */
export const serviceManageEvent = async (type: 'restart' | 'stop' | 'reload' | 'start') => {
	const data = {
		restart: '重启',
		stop: '停止',
		reload: '重载配置',
		start: '启动',
	}
	await useConfirm({
		title: `${data[type]}mysqld服务`,
		content: `是否${data[type]}mysqld服务？`,
	})
	await useDataHandle({
		loading: `正在${data[type]}mysqld服务，请稍后...`,
		request: serviceManage({
			name: 'mysqld',
			type: type,
		}),
		message: true,
		success: (res: any) => {
			if (res.status) router.go(0)
		},
	})
}

/**
 * @description 获取mysql性能调整
 */
const getMysqlPerformance = async () => {
	isLoading.value = true
	try {
		// const countData = ['key_buffer_size', 'query_cache_size', 'tmp_table_size', 'innodb_buffer_pool_size', 'innodb_log_buffer_size', 'innodb_additional_mem_pool_size', 'sort_buffer_size', 'read_buffer_size', 'read_rnd_buffer_size', 'join_buffer_size', 'thread_stack', 'binlog_cache_size']
		const { data: res } = await getDbStatus()
		performanceData.value = []

		if (!res.mem.hasOwnProperty('join_buffer_size')) res.mem.join_buffer_size = 512
		if (!res.mem.hasOwnProperty('thread_stack')) res.mem.thread_stack = 256
		if (!res.mem.hasOwnProperty('binlog_cache_size')) res.mem.binlog_cache_size = 32
		const isDisable = res.mem.query_cache_supprot === 'disable'
		// isCount
		// ? getByteUnit(Number(res.mem[key]), false, 0)
		if (res.mem.hasOwnProperty('bt_query_cache_size') && !isDisable) {
			performanceData.value.push({
				name: 'query_cache_size',
				value: res.mem['bt_query_cache_size'],
				ps: mysqlPsData['query_cache_size'] ? mysqlPsData['query_cache_size'] : '',
			})
		}

		Object.keys(res.mem).forEach((key: any) => {
			if (key === 'query_cache_size' || key === 'bt_query_cache_size') {
				return
			}

			performanceData.value.push({
				name: key,
				value: res.mem[key],
				ps: mysqlPsData[key] ? mysqlPsData[key] : '',
			})
		})
		mysqlUseMem.value = res.mem.bt_mem_size

		const matchedScheme = findMatchingScheme(res.mem)
		mysqlSelectData.value = matchedScheme

		changeMysqlInput()
	} catch (error) {
		useHandleError(error)
	} finally {
		isLoading.value = false
	}
}

// 错误日志
export const content = ref<string>('') // 日志内容

/**
 * @description 清空错误日志
 */
export const clearLogsEvent = async () => {
	await useConfirm({
		title: '清空日志操作提示',
		icon: 'warning-filled',
		content: '清空日志会导致运行错误信息丢失，无法排除问题，请谨慎操作，是否继续？',
	})
	await useDataHandle({
		loading: '正在清空日志，请稍后...',
		request: clearErrorLog({ close: 1 }),
		message: true,
		success: getErrorLogs,
	})
}

/**
 * @description 获取错误日志
 */
export const getErrorLogs = async () => {
	await useDataHandle({
		loading: isLoading,
		request: getErrorLog(),
		data: [String, content],
	})
	content.value = content.value || '当前暂无数据'
}

// 慢日志
/**
 * @description 获取慢日志
 */
export const getSlowLogs = async () => {
	await useDataHandle({
		loading: isLoading,
		request: getSlowLog(),
		data: {
			msg: [String, content],
		},
	})
	content.value = content.value || '当前暂无数据'
}

// 二进制日志
export const formDisabled = ref<boolean>(false) // 表单禁用
export const binlogFormRef = ref<any>() // 清理日志表单ref
export const binData = ref([]) // 二进制日志数据
export const binlogData = reactive({
	status: false,
	size: '',
}) // 二进制日志数据
export const clearPopup = ref(false) // 清理日志弹窗
export const clearForm = reactive({
	days: '',
}) // 清理日志表单

export const rules = reactive({
	// 输入的天数必须大于7且不可为空
	days: [
		{ required: true, message: '请输入天数', trigger: 'blur' },
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value < 7) {
					callback(new Error('请输入大于7的天数'))
				} else {
					callback()
				}
			},
		},
	],
}) // 清理日志表单验证规则

/**
 * @description 修改二进制日志状态
 * @param status
 */
export const changeBinlogStastus = async (status: boolean | string | number) => {
	binlogData.status = !status
	await useConfirm({
		title: (status ? '开启' : '关闭') + '二进制日志',
		icon: 'warning-filled',
		content: (status ? '开启二进制日志可以保护Mysql的数据安全，但同时会消耗一定磁盘存储，是否继续?' : '关闭二进制日志后，将不会再记录所有对数据库的修改操作') + '二进制日志?',
	})
	await useDataHandle({
		loading: '正在' + (status ? '开启' : '关闭') + '二进制日志，请稍后...',
		request: getBinlogConfig(),
		message: true,
		success: (res: any) => {
			getBinlogSetting()
		},
	})
}

/**
 * @description 清理二进制日志
 */
export const clearBinlog = async () => {
	await binlogFormRef.value.validate()
	await useConfirm({
		title: '清理日志',
		content: '即将清理【' + clearForm.days + '】天前的MySQL二进制日志，是否继续？',
		icon: 'warning-filled',
	})
	await useDataHandle({
		loading: '正在清理日志，请稍后...',
		request: clearMySQLBinlog({ days: clearForm.days }),
		message: true,
		success: (res: any) => {
			if (res.status) {
				clearPopup.value = false
				cancelButtonEvent()
				getBinlogSetting()
				getBinlog()
			}
		},
	})
}

export const cancelButtonEvent = () => {
	clearPopup.value = false
	binlogFormRef.value?.clearValidate() // 清除验证
	binlogFormRef.value?.resetFields() // 重置表单
}

/**
 * @description 获取二进制日志配置
 */
const getBinlogSetting = async () => {
	await useDataHandle({
		request: getBinlogConfig({ status: 1 }),
		success: (res: any) => {
			binlogData.status = res.data.binlog_status
			binlogData.size = getByteUnit(res.data.size)
		},
	})
}

/**
 * @description 获取二进制日志
 */
const getBinlog = async () => {
	await useDataHandle({
		loading: isLoading,
		request: getBinlogList(),
		data: {
			data: [Array, binData],
		},
	})
}

export const delLogs = async ({ row }: any) => {
	await useConfirm({
		title: '删除日志',
		icon: 'warning-filled',
		content: `您真的要删除【${row.name}】日志？`,
		type: 'calc',
	})
	await useDataHandle({
		loading: `正在删除【${row.name}】日志，请稍后...`,
		request: delDataBaseFile({ path: row.path }),
		message: true,
		success: getBinlog,
	})
}

// 内存保护
export const protectionMemory = ref<boolean>(false) // 内存保护

/**
 * @description 内存保护
 */
export const changeProtectionStatus = async (e: any) => {
	try {
		let param = e === 'get' ? {} : { status: Number(e) }
		const data = await protectionStatus(param)
		if (e === 'get') {
			if (!data.status && data.msg !== '当前状态关闭中！') {
				Message.request(data)
			}
			protectionMemory.value = Boolean(data.status)
		} else {
			Message.request(data)
		}
	} catch (error) {
		useHandleError(error)
	}
}

export const handleTabClick = async (name: string) => {
	switch (name) {
		case 'config':
			getConfigEvent()
			break
		case 'port':
		case 'storage':
			getMysqlConfig()
			break
		case 'state':
			getRunState()
			break
		case 'performance':
			getMysqlPerformance()
			break
		case 'errorLogs':
			getErrorLogs()
			break
		case 'slowLogs':
			getSlowLogs()
			break
		case 'binaryLogs':
			await getBinlog()
			getBinlogSetting()
			break
		case 'memoryProtection':
			changeProtectionStatus('get')
			break
		default:
			break
	}
}

/**
 * @description 初始化事件
 */
export const init = (data?: any) => {
	tabActive.value = 'service'
	if (data) compData.value = data

	const obj = {
		...compData.value,
		name: 'mysqld',
	}
	// 加载服务状态
	serviceStatusStore.init(obj)

	// 初始化状态停止告警
	statusStopStore.init(obj)

	status.value = compData.value.status
}
