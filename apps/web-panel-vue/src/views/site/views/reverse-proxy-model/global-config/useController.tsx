import { clearProxyCache, proxyGetGlobal, proxyGlobalAddBasic, proxyGlobalAddLimit, proxyGlobalBatchDelLimit, proxyGlobalCache, proxyGlobalCompress, proxyGlobalDelBasic, proxyGlobalDelLimit, proxyGlobalEditBasic, proxyGlobalSetLogs, proxyGlobalSetWebsocket } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public'
import { getRandomPwd } from '@/utils'
import { useSiteStore } from '@/views/site/useStore'

const Message = useMessage()
const { siteInfo } = useSiteStore() // 站点信息

export const tabActive = ref('compress')
export const globalConfig = ref<any>({
	site_name: '',
	domain_list: [],
	site_port: [],
	port_conf: '',
	ssl_port_conf: '',
	site_path: '',
	ssl_info: {},
	err_age_404: '',
	err_age_502: '',
	ip_limit: {
		ip_black: [],
		ip_white: [],
	},
	basic_auth: [],
	proxy_cache: {},
	gzip: {},
	sub_filter: {},
	websocket: {},
	security: {},
	redirect: {},
	proxy_log: {},
	http_block: '',
	server_block: '',
	remark: '',
	proxy_info: [],
}) // 全局配置

/**
 * @description 获取全局配置
 */
export const getGlobalConfig = async () => {
	const res = await proxyGetGlobal({ site_name: siteInfo.value.name })
	if (!res.status) {
		Message.error(res.msg)
		return
	}
	globalConfig.value = res.data
}

export const formLoading = ref(false) // 表单加载状态
export const formDisabled = ref(false) // 表单禁用状态

/**************** 缓存 *********************/

export const cacheFormRef = ref<any>() // 表单ref
export const cacheData = reactive({
	status: false, // 静态资源缓存
	time: '', // 缓存时间
	unit: 'm', // 缓存时间单位
})
export const timeUnit = [
	{ label: '分钟', value: 'm' },
	{
		label: '小时',
		value: 'h',
	},
	{
		label: '天',
		value: 'd',
	},
] // 缓存时间单位
export const cacheHelpList = [
	{ content: '缓存是一种用于加速网站性能和提高用户体验的技术' },
	{
		content: '开启后资源会被缓存，如果影响网站访问请关闭',
	},
	{
		content: '缓存键由主机名、URI 和请求参数组成',
	},
	{
		content: '默认忽略的响应头有：Set-Cookie|Cache-Control|expires|X-Accel-Expires',
	},
	{
		content: '默认缓存的静态资源有：css|js|jpg|jpeg|gif|png|webp|woff|eot|ttf|svg|ico|css.map|js.map',
	},
]

export const cacheRules = {
	time: [
		{
			required: true,
			message: '请输入正确的缓存时间',
			trigger: 'blur',
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error('目标URL不能为空'))
				} else if (isNaN(Number(value))) {
					callback(new Error('请输入数字'))
				} else if (Number(value) < 1) {
					callback(new Error('请输入正确数字'))
				} else {
					callback()
				}
			},
		},
		{},
	],
} // 表单验证规则

/**
 * @description 清理缓存
 */
export const clearCache = async () => {
	await useConfirm({
		title: `清理缓存【${siteInfo.value.name}】`,
		width: '35rem',
		icon: 'warning-filled',
		content: `清理后包含所有URL的及站点的缓存都会被清空,是否继续？`,
	})
	await useDataHandle({
		loading: '正在清理缓存，请稍后...',
		request: clearProxyCache({
			site_name: siteInfo.value.name,
		}),
		message: true,
	})
}

/**
 * @description 确认添加
 * @param close
 */
export const onConfirmCache = async () => {
	let params = {
		site_name: siteInfo.value.name,
		cache_status: cacheData.status ? 1 : 0,
		expires: `${cacheData.time}${cacheData.unit}`,
	}
	await cacheFormRef.value.validate()
	await useDataHandle({
		loading: formDisabled,
		request: proxyGlobalCache(params),
		message: true,
	})
}
/**************** 缓存 end *********************/

/**************** 内容压缩 *********************/

export const compressFormRef = ref<any>() // 表单ref
export const compressData = reactive({
	status: false, // 内容压缩
	type: '', // 压缩类型
	level: 1, // 压缩级别
	minLength: '', // 压缩最小长度
	unit: 'm', // 压缩最小长度单位
})

export const lengthUnit = [
	{ label: 'k', value: 'k' },
	{
		label: 'm',
		value: 'm',
	},
] // 缓存时间单位
export const compressHelpList = [
	{ content: '用于对 HTTP 响应的内容进行压缩，以减少数据传输量，提高网站性能和加载速度' },
	{
		content: '压缩级别1-9，例如：1为压缩速度最快，但压缩率较低；9为压缩速度最慢，但压缩率最高，建议默认',
	},
	{
		content: '如果开启gzip后影响网站正常访问，请关闭此功能 和请求参数组成',
	},
]
export const compressRules = {
	type: [{ required: true, message: '请输入压缩类型', trigger: ['blur', 'change'] }],
	// level: [{ required: true, message: '请输入压缩级别', trigger: 'blur' }],
	minLength: [
		{
			required: true,
			message: '请输入正确的压缩最小长度',
			trigger: 'blur',
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error('压缩最小长度不能为空'))
				} else if (isNaN(Number(value))) {
					callback(new Error('请输入数字'))
				} else if (Number(value) < 1) {
					callback(new Error('请输入正确数字'))
				} else {
					callback()
				}
			},
		},
		{},
	],
} // 表单验证规则

/**
 * @description 设置数据
 * @param data
 */
export const setValueEvent = (data: any) => {
	compressData.status = data.gzip_status
	compressData.type = data.gzip_types
	compressData.level = data.gzip_comp_level
	let minLength = '',
		unit = 'm'
	if (data.gzip_min_length && data.gzip_min_length.length > 1) {
		minLength = data.gzip_min_length.slice(0, -1)
		unit = data.gzip_min_length.slice(-1)
	}
	compressData.minLength = minLength
	compressData.unit = unit
}

/**
 * @description 确认添加
 * @param close
 */
export const onConfirmCompress = async () => {
	const params: any = {
		site_name: siteInfo.value.name,
		gzip_status: compressData.status ? 1 : 0,
		gzip_min_length: `${compressData.minLength}${compressData.unit}`,
		gzip_comp_level: compressData.level,
		gzip_types: compressData.type,
	}
	await compressFormRef.value.validate()
	const res: any = await useDataHandle({
		loading: formDisabled,
		request: proxyGlobalCompress(params),
		message: true,
	})
	return res.status
}
/**************** 内容压缩 end *********************/

/**************** IP黑名单 IP白名单 *********************/
export const listData = reactive({
	loading: false, // 加载状态
	type: 'black' as 'white' | 'black', // 类型
	white: [], // 白名单
	black: [], // 黑名单
})
export const ipListRef = ref<any>() // 表格ref
export const ipWhiteListRef = ref<any>() // 表格ref

const useIpTableColumn = () => {
	return ref<TableColumnProps[]>([
		useCheckbox({ key: 'ip' }),
		{
			label: 'IP', // 用户名
			prop: 'ip',
			minWidth: 120,
		},
		useOperate([
			{
				title: '删除',
				onClick: (row: any) => {
					deleteEvent(row)
				},
			},
		]),
	])
}

/**
 * @description 设置数据
 * @param data
 */
export const initIpData = (data: any) => {
	listData.type = tabActive.value === 'ipBlackList' ? 'black' : 'white'
	listData.white = data.ip_white.map((ip: string) => {
		return {
			ip,
			type: 'white',
		}
	})
	listData.black = data.ip_black.map((ip: string) => {
		return {
			ip,
			type: 'black',
		}
	})
}

/**
 * @description 删除事件
 * @param data  选中的数据
 * @param isMult  是否是多选
 */
const deleteEvent = async (data?: any) => {
	const isMult = Array.isArray(data) ? true : false

	await useConfirm({
		title: `${isMult ? '批量删除IP' : `删除${data.type === 'white' ? '白名单' : '黑名单'}【${data.ip}】`}`,
		content: isMult ? '批量删除选中的IP，是否继续操作？' : `删除${data.type === 'white' ? '白名单' : '黑名单'}【${data.ip}】，是否继续操作？`,
	})

	let params: any = {
		site_name: siteInfo.value.name,
	}
	if (isMult) {
		params.ip_type = tabActive.value === 'ipBlackList' ? 'black' : 'white'
		params.ips = data.map((item: any) => item.ip).join('\n')
	} else {
		params.ip_type = data.type
		params.ip = data.ip
	}

	const requestFun = isMult ? proxyGlobalBatchDelLimit : proxyGlobalDelLimit

	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: requestFun(params),
		message: true,
	})
	if (res.status) getGlobalConfig()
}

const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '删除IP',
			value: 'delete',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				const requestHandle = async (item: any) =>
					await proxyGlobalDelLimit({
						site_name: siteInfo.value.name,
						ip: item.ip,
						ip_type: tabActive.value === 'ipBlackList' ? 'black' : 'white',
					})
				await batchConfirm({
					title: '批量删除',
					content: '批量删除选中的ip，是否继续操作？',
					column: [{ prop: 'ip', label: 'IP' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
					onConfirm: async () => {
						await nextAll(requestHandle) // 递归操作所有选中的数据
						getGlobalConfig() // 执行完毕的代码，刷新列表
						return false
					},
				})
			},
		},
	]
}

export const tableColumns = useIpTableColumn() // 表格列

export const TableBatchOptions = batchOptions()

export const addIpView = () => {
	ipData.value.address = ''
	useDialog({
		isAsync: true,
		title: `添加IP${tabActive.value === 'ipBlackList' ? '黑' : '白'}名单`,
		area: 40,
		btn: '确认',
		component: () => import('@site/views/reverse-proxy-model/global-config/add-ip.vue'),
		compData: {
			listType: listData.type,
			refreshEvent: () => {
				getGlobalConfig()
			},
		},
	})
}

// 添加
export const ipData = ref<any>({
	types: listData.type,
	address: '',
})
export const ipHelpList = [{ content: '一行一条配置，多个IP请换行' }]

export const ipFormRef = ref() // 表单ref
// 校验规则
export const ipRules = {
	address: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length > 0) {
					callback()
				} else {
					callback(new Error('请输入IP地址'))
				}
			},
			trigger: ['blur', 'change'],
		},
	],
}
/**
 * @description: 提交表单
 */
export const onConfrimIp = async () => {
	const { address: ips } = ipData.value
	const params = {
		site_name: siteInfo.value.name,
		ip_type: tabActive.value === 'ipBlackList' ? 'black' : 'white',
		ips,
	}
	const res: AnyObject = await useDataHandle({
		loading: formDisabled,
		request: proxyGlobalAddLimit(params),
		message: true,
	})
	if (res.status) {
		getGlobalConfig()
	}
	return res.status
}
/**************** IP黑名单 IP白名单 end *********************/

/**************** http认证 *********************/
export const authData = ref<any>([]) // http认证数据
const useAuthTableColumn = () => {
	return ref<TableColumnProps[]>([
		{
			label: '名称', // 用户名
			prop: 'auth_name',
		},
		{
			label: '路径', // 用户名
			prop: 'auth_path',
		},
		useOperate([
			{ onClick: editHttpAuthEvent, title: '编辑' },
			{ onClick: deleteAuthEvent, title: '删除' },
		]),
	])
}

export const editHttpAuthEvent = (row?: any) => {
	rowData.value = row ? row : false
	useDialog({
		isAsync: true,
		title: `${row ? '编辑' : '添加'}http认证${row ? `【${row.auth_name}】` : ''}`,
		area: 48,
		btn: '确认',
		component: () => import('@site/views/reverse-proxy-model/global-config/http-auth-add.vue'),
		compData: {
			refreshEvent: getGlobalConfig,
			proxy_info: globalConfig.value.proxy_info,
			isEdit: row ? true : false,
			row,
		},
	})
}

/**
 * @description 删除事件
 * @param data  选中的数据
 * @param isMult  是否是多选
 */
const deleteAuthEvent = async (data?: any) => {
	await useConfirm({
		title: `删除http认证【${data.auth_name}】`,
		content: `删除http认证【${data.auth_name}】，是否继续操作？`,
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除http认证，请稍候...',
		request: proxyGlobalDelBasic({
			site_name: siteInfo.value.name,
			auth_path: data.auth_path,
			name: data.auth_name,
		}),
		message: true,
	})
	if (res.status) {
		getGlobalConfig()
	}
}

export const authTableColumns = useAuthTableColumn()

/**
 * @description 设置数据
 * @param data
 */
export const initAuthData = (data: any) => {
	authData.value = data || []
}
// 添加
// 表单数据
export const rowData = ref<any>() // 行数据
export const authFormData = ref<any>({
	name: getRandomPwd(5),
	path: '',
	user: '',
	password: '',
})

export const authHelpList = [{ content: '例如我设置了加密访问/test/,那我访问http://aaa.com/test/时就要输入账号密码才能访问' }]
export const authRef = ref() // 表单ref
export const authRules = {
	name: [{ required: true, message: '请输入名称', trigger: ['blur', 'change'] }],
	path: [{ required: true, message: '请输入路径', trigger: ['blur', 'change'] }],
	user: [{ required: true, message: '请输入用户名', trigger: ['blur', 'change'] }],
	password: [{ required: true, message: '请输入密码', trigger: ['blur', 'change'] }],
}

// 选择路径
export const querySearch = (queryString: any, cb: any) => {
	const list = globalConfig.value.proxy_info.map((item: any) => {
		return { value: item.proxy_path }
	})
	const results = queryString
		? list.filter((item: any) => {
				return item.value.includes(queryString)
		  })
		: list
	// 调用 callback 返回建议列表的数据
	cb(results)
}

/**
 * @description: 提交表单
 */
export const onConfirmAuth = async () => {
	let data = authFormData.value
	await authRef.value.validate()

	const params = {
		site_name: siteInfo.value.name,
		auth_path: data.path,
		username: data.user,
		password: data.password,
		name: data.name,
	}

	const requestFun = rowData.value ? proxyGlobalEditBasic : proxyGlobalAddBasic

	const res: AnyObject = await useDataHandle({
		loading: formDisabled,
		request: requestFun(params),
	})

	if (res.status) {
		getGlobalConfig()
	}
	return res.status
}
/**
 * @description: 初始化
 */
export const initAddAuthData = () => {
	Object.assign(authFormData.value, {
		name: rowData.value ? rowData.value.auth_name : getRandomPwd(5),
		path: rowData.value ? rowData.value.auth_path : '',
		user: '',
		password: '',
	})
}
/**************** http认证 end *********************/

/**************** 日志 *********************/
export const logFormRef = ref<any>() // 表单ref
export const logData = reactive({
	type: 'default', // 日志记录类型
	accessLog: '', //日志目录
	address: '', //接收地址
	port: '514', //接收端口
})
export const logRules = {
	accessLog: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (logData.type === 'file' && !value) {
					callback(new Error('请选择日志目录'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	address: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (logData.type === 'rsyslog' && !value) {
					callback(new Error('请输入接收地址'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
}
export const logHelpList = [
	{ content: '指定目录可选择自定义的日志存储目录，请注意此目录必须www用户可写' },
	{
		content: '发送到远程服务器设置之后本地不会保存日志内容，填写前请确保日志接收端可正常访问',
	},
]

export const typeOptions = [
	{ label: '默认', value: 'default' },
	{
		label: '不记录日志',
		value: 'off',
	},
	{
		label: '指定目录',
		value: 'file',
	},
	{
		label: '发送到远程服务器',
		value: 'rsyslog',
	},
] // 日志类型

/**
 * @description 打开文件选择对话框
 * @param key 选择文件的日志类型
 */
export const openPathDialog = (key: string) => {
	fileSelectionDialog({
		type: 'dir',
		path: '/www/wwwroot',
		change: (path: string) => {
			logData.accessLog = path
		},
	})
}

/**
 * @description 设置数据
 * @param data
 */
export const initLogData = (data: any) => {
	if (data) {
		logData.type = data.log_type
		logData.accessLog = data.log_path
		logData.address = data.rsyslog_host
		// logData.port = data.server_port
	} else {
		logData.type = 'default'
	}
}

/**
 * @description 确认添加
 * @param close
 */
export const onConfirmLog = async () => {
	await logFormRef.value.validate()
	const params = {
		site_name: siteInfo.value.name,
		log_type: logData.type,
		log_path: logData.type == 'file' ? logData.accessLog : logData.address,
	}
	const res: any = await useDataHandle({
		loading: formDisabled,
		request: proxyGlobalSetLogs(params),
		message: true,
	})
	return res.status
}

/**************** 日志 end *********************/

/**************** websocket *********************/
export const formData = reactive({
	websocket: false, // 静态资源缓存
})

/**
 * @description 设置缓存
 * @param status 缓存状态
 */
export const setSocketEvent = async (status: boolean) => {
	const res: AnyObject = await useDataHandle({
		loading: formDisabled,
		request: proxyGlobalSetWebsocket({
			site_name: siteInfo.value.name,
			websocket_status: status ? 1 : 0,
		}),
		message: true,
	})
	if (!res.status) {
		formData.websocket = !status
	}
}

/**
 * @description 设置数据
 * @param data
 */
export const initSocketData = (data: any) => {
	formData.websocket = data ? data.websocket_status : false
}

/**************** websocket end *********************/
