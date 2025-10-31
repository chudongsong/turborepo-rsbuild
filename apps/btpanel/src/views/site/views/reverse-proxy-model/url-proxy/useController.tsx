import { addProxyUrlData, addProxyUrlReplace, delProxyUrlData, delProxyUrlReplace, editProxyUrlDataRemark, editProxyUrlInfo, getProxyUrlData, proxyUrlAddLimit, proxyUrlBatchDelLimit, proxyUrlCache, proxyUrlCompress, proxyUrlDelLimit, setProxyUrlCustom } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle, useDialog, useHandleError, useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public'
import { ResponseResult } from '@/types'
import { defaultVerify } from '@/utils'
import { useSiteStore } from '@/views/site/useStore'
import { ElTooltip } from 'element-plus'

const Message = useMessage()

const { siteInfo } = useSiteStore() // 站点信息

export const rowData = ref<any>({}) // 当前行数据
export const isRefreshList = ref(false) // 是否刷新列表

/*********  url代理主视图  ************/

export const helpList = [
	{
		content: '支持添加多个不同目录的代理',
	},
	{
		content: '如添加后访问异常请尝试清理浏览器缓存',
	},
]

/**
 * @description 获取URL代理列表
 */
export const getUrlList = async () => {
	try {
		const res: ResponseResult = await useDataHandle({
			request: getProxyUrlData({
				site_name: siteInfo.value.name,
			}),
			data: {
				data: Array,
			},
		})
		if (!Array.isArray(res.data)) {
			return { data: [], total: 0 }
		}
		return { data: res.data, total: res.data.length }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description 添加url
 */
export const addUrlEvent = () => {
	useDialog({
		isAsync: true,
		title: '添加URL代理',
		area: 60,
		btn: '确认',
		component: () => import('@site/views/reverse-proxy-model/url-proxy/add-url-proxy.vue'),
	})
}

/**
 * @description 设置备注
 * @param row  当前行数据
 * @param remark  备注
 */
export const setPsEvent = async (row: any, remark: string) => {
	useDataHandle({
		loading: '正在修改URL代理备注，请稍后...',
		request: editProxyUrlDataRemark({
			site_name: siteInfo.value.name,
			proxy_path: row.proxy_path,
			remark,
		}),
		message: true,
	})
}

export const openSetting = (row: any) => {
	rowData.value = row
	useDialog({
		isAsync: true,
		title: `URL代理设置【${row.proxy_path}】`,
		area: [76, 60],
		component: () => import('@site/views/reverse-proxy-model/url-proxy/setting.vue'),
		compData: {
			row,
		},
	})
}

/**
 * @description 删除事件
 * @param data  选中的数据
 * @param isMult  是否是多选
 */
export const deleteEvent = async (data?: any) => {
	if (data.proxy_path === '/') {
		Message.error('根目录不能删除')
		return
	}
	await useConfirm({
		title: `删除反向代理【${data.proxy_path}】`,
		width: '35rem',
		icon: 'warning-filled',
		content: `您真的要删除反向代理【${data.proxy_path}】吗？`,
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: delProxyUrlData({
			site_name: siteInfo.value.name,
			proxy_path: data.proxy_path,
		}),
		message: true,
	})
	if (res.status) isRefreshList.value = true
}
/*********  url代理主视图 end  ************/

/*********  添加url代理  ************/
export const addHelpList = [
	{
		content: '目标：可以填写你需要代理的站点，目标如果选URL地址则必须为可正常访问的URL，如果选UNIX则必须是套接字文件',
	},
	{
		content: 'http地址示例：http://127.0.0.1:15700',
	},
	{
		content: 'unix地址示例：/tmp/panel.sock',
	},
	{
		content: () => (
			<span>
				发送域名：将域名添加到请求头传递到后端服务器，默认为目标URL域名，若设置不当可能导致代理无法正常访问，例如：
				<br />
				http://192.168.100.20:19888，则发送域名保持$http_host即可
				<br />
				http://www.bt.cn，则发送域名应当改为www.bt.cn
				<br />
				上面例子仅为常见情况，请以实际为准
			</span>
		),
	},
]
export const targetOptions = [
	{
		label: 'URL地址',
		value: 'http',
	},
	{
		label: 'UNIX地址',
		value: 'unix',
	},
]

/**
 * @description 选择sock文件
 */
export const onSockChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: setProxyData.proxysite || '/www',
		change: (path: string) => {
			setProxyData.proxysite = path
		},
	})
}

export const urlData = reactive({
	targetType: 'http', // 目标类型
	sitename: '',
	cachetime: 1,
	proxysite: 'http://', // 目标URL
	todomain: '$http_host',
	path: '', // 代理目录
	ps: '',
	websocket: false,
})
export const popoverFocus = ref(false) // 域名popover
export const formLoading = ref(false) // 表单加载状态
export const formDisabled = ref(false) // 表单禁用状态
export const proxyFormRef = ref<any>() // 表单ref

export const proxyFormRules = reactive({
	proxyname: [
		{ required: true, message: '请输入代理名称', trigger: 'blur' },
		{
			validator: (rule: unknown, value: string, callback: any) => {
				// 代理名称必须大于3个字符串
				if (value.length < 3) {
					callback(new Error('代理名称必须大于3个字符串'))
				} else if (!value.match(/^[a-zA-Z0-9_.-]+$/g)) {
					callback(new Error('代理名称不能包含特殊字符'))
				} else {
					callback()
				}
			},
		},
	],
	proxysite: [
		{ required: true, message: '请输入目标地址', trigger: 'blur' },
		{
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error(urlData.targetType === 'http' ? '目标地址不能为空' : '请选择sock文件'))
					return
				}
				if (urlData.targetType === 'unix') {
					callback()
					return
				}
				const ipReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/

				let val = value.replace(/^http[s]?:\/\//, '')
				val = val.replace(/(:|\?|\/|\\)(.*)$/, '')

				if (ipReg.test(val)) {
					urlData.todomain = '$http_host'
				} else {
					urlData.todomain = val
				}
				callback()
			},
		},
		{},
	],
	todomain: [{ required: true, message: '请输入发送域名', trigger: ['blur', 'change'] }],
	path: [{ required: true, message: '请输入根目录', trigger: 'blur' }],
}) // 表单验证规则

/**
 * @description 设置目标类型
 */
export const setTypeEvent = async () => {
	urlData.proxysite = urlData.targetType === 'http' ? 'http://' : ''
}

export const handelInputTodo = (val: string) => {
	if (urlData.targetType === 'unix') {
		urlData.todomain = '$http_host'
		return
	}
	let value = val.replace(/^http[s]?:\/\//, '')
	value = value.replace(/(:|\?|\/|\\)(.*)$/, '')
	urlData.todomain = value
}

export const handelInputURL = (val: string) => {
	if (setProxyData.targetType === 'unix') {
		setProxyData.todomain = '$http_host'
		return
	}
	let value = val.replace(/^http[s]?:\/\//, '')
	value = value.replace(/(:|\?|\/|\\)(.*)$/, '')
	setProxyData.todomain = value
}

export const onPathChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: urlData.proxysite,
		change: (path: string) => {
			urlData.proxysite = path
		},
	})
}

/**
 * @description 确认添加
 * @param close
 */
export const onConfirmAdd = async () => {
	const { path: proxy_path, proxysite: proxy_pass, todomain: proxy_host, targetType: proxy_type, ps: remark } = urlData
	let params = {
		site_name: siteInfo.value.name,
		proxy_path,
		proxy_pass,
		proxy_host,
		proxy_type,
		remark,
	}
	await proxyFormRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: formDisabled,
		request: addProxyUrlData(params),
		message: true,
	})

	if (res.status) {
		isRefreshList.value = true
	}
	return res.status
}

/*********  添加url代理 end  ************/

export const tabActive = ref('proxy')

/*********  设置url代理  ************/
export const proxyData = ref<any>({
	proxy_type: '',
	proxy_path: '',
	proxy_pass: '',
	proxy_host: '$http_host',
	ip_limit: {},
	basic_auth: {},
	proxy_cache: {},
	gzip: {},
	sub_filter: {},
	websocket: {},
	proxy_log: {},
	custom_config: [],
	security_referer: {},
	proxy_conf: '',
	remark: '',
	template_proxy_conf: '',
})

/**
 * @description 获取公共信息
 */
export const getCommonData = async () => {
	try {
		const res = await getProxyUrlData({
			site_name: siteInfo.value.name,
			proxy_path: rowData.value.proxy_path,
		})
		if (!res.status) {
			Message.error(res.msg)
			return
		}
		proxyData.value = res.data.data
	} catch (error) {
		useHandleError(error)
	}
}

/*********  设置url代理 end  ************/

/*********  设置反向代理   ************/
export const globalWs = ref(false) // 全局websocket状态

export const setProxyData = reactive({
	targetType: 'http', // 目标类型
	sitename: '',
	proxysite: '', // 目标URL
	todomain: '$http_host',
	path: '', // 代理目录
	ps: '',
	websocket: false,
	proxy_connect_timeout: 30,
	proxy_send_timeout: 30,
	proxy_read_timeout: 30,
})
export const setProxyFormRules = computed(() => ({
	proxysite: [
		{
			required: true,
			message: setProxyData.targetType !== 'http' ? '请选择sock文件' : '请输入目标url',
			trigger: 'blur',
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error(setProxyData.targetType !== 'http' ? '请选择sock文件' : '请输入目标url'))
				} else {
					callback()
				}
			},
		},
	],
	todomain: [{ required: true, message: '请输入发送域名', trigger: ['blur', 'change'] }],
	proxy_connect_timeout: [
		{
			required: true,
			message: '请输入连接超时时间',
			trigger: ['blur', 'change'],
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error('连接超时时间不能为空'))
				} else if (isNaN(Number(value))) {
					callback(new Error('请输入数字'))
				} else {
					callback()
				}
			},
		},
	],
	proxy_send_timeout: [
		{
			required: true,
			message: '请输入后端请求超时时间',
			trigger: ['blur', 'change'],
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error('后端请求超时时间不能为空'))
				} else if (isNaN(Number(value))) {
					callback(new Error('请输入数字'))
				} else {
					callback()
				}
			},
		},
	],
	proxy_read_timeout: [
		{
			required: true,
			message: '请输入代理响应超时时间',
			trigger: ['blur', 'change'],
			validator: (rule: unknown, value: string, callback: any) => {
				if (!value) {
					callback(new Error('代理响应超时时间不能为空'))
				} else if (isNaN(Number(value))) {
					callback(new Error('请输入数字'))
				} else {
					callback()
				}
			},
		},
	],
})) // 表单验证规则

/**
 * @description 设置初始值
 */
export const setInitValue = (data: any) => {
	const { proxy_type, proxy_pass, proxy_host, proxy_path, remark, global_websocket, websocket, timeout } = data
	setProxyData.targetType = proxy_type
	setProxyData.proxysite = proxy_pass
	setProxyData.todomain = proxy_host
	setProxyData.path = proxy_path
	setProxyData.ps = remark
	globalWs.value = global_websocket
	setProxyData.websocket = websocket?.websocket_status
	setProxyData.proxy_connect_timeout = timeout?.proxy_connect_timeout
	setProxyData.proxy_send_timeout = timeout?.proxy_send_timeout
	setProxyData.proxy_read_timeout = timeout?.proxy_read_timeout
}

/**
 * @description 确认添加
 * @param close
 */
export const onConfirmProxy = async () => {
	const { path: proxy_path, proxysite: proxy_pass, todomain: proxy_host, targetType: proxy_type, ps: remark, websocket, proxy_connect_timeout, proxy_send_timeout, proxy_read_timeout } = setProxyData
	const params = {
		site_name: siteInfo.value.name,
		proxy_path,
		proxy_pass,
		proxy_host,
		proxy_type,
		remark,
		websocket: websocket ? 1 : 0,
		proxy_connect_timeout,
		proxy_send_timeout,
		proxy_read_timeout,
	}
	await proxyFormRef.value.validate()
	const res: any = await useDataHandle({
		loading: formDisabled,
		request: editProxyUrlInfo(params),
		message: true,
	})
	return res.status
}
/*********  设置反向代理 end  ************/

/*********  设置自定义配置   ************/
export const customTip = `一行一条配置，请以;结尾，例如：\nproxy_set_header Cookie "cookie_name=cookie_value";\nallow 192.168.1.0/24;\naccess_log /www/wwwlogs/xxx.log;`
export const customData = reactive({
	config: '',
})
export const customHelpList = [
	{ content: '注意：一行一条配置，请以;结尾' },
	{
		content: () => (
			<>
				案例：
				<br />
				重定向请求：return 301 /new-page;
				<br />
				重写URL：rewrite ^/blog/(.*)$ /$1 break;
				<br />
				文件上传限制：client_max_body_size 10M;
				<br />
				处理特定http方法：
				<br />
				limit_except POST {'{'} <br />
				&nbsp;&nbsp;&nbsp;&nbsp;allow 192.168.1.0/24;
				<br />
				&nbsp;&nbsp;&nbsp;&nbsp;deny all;
				<br />
				{'}'}
				<br />
				限制请求速率：limit_rate 100k;
				<br />
			</>
		),
	},
	{ content: '保存配置前请核对配置是否正确，错误的配置可能会导致反向代理无法正常访问' },
]
/**
 * @description 确认添加
 * @param close
 */
export const onConfirmCustom = async (close: any) => {
	try {
		let params = {
			site_name: siteInfo.value.name,
			proxy_path: proxyData.value.proxy_path,
			custom_conf: customData.config,
		}
		const res = await setProxyUrlCustom(params)
		Message.request(res)
		return res.status
	} catch (error) {}
}

export const initCustomData = () => {
	customData.config = proxyData.value.custom_conf || ''
}
/*********  设置自定义配置 end  ************/

/*********  设置内容替换   ************/
export const replaceData = reactive({
	subfilter: [] as any[],
})
export const replaceHelpList = [
	{
		content: '规则解释如下',
	},
	{
		content: 'g：替换所有匹配到的关键字',
	},
	{
		content: 'i：不区分大小写',
	},
	{
		content: 'o：只替换匹配到的第一个',
	},
	{
		content: 'r：使用正则表达式',
	},
]
const useTableColumn = () => {
	return ref<TableColumnProps[]>([
		{
			label: '原关键词', // 用户名
			prop: 'oldstr',
		},
		{
			label: '替换词', // 用户名
			prop: 'newstr',
		},
		{
			label: '规则', // 用户名
			prop: 'mode',
			width: 50,
			render: (row: any) => {
				return (
					<ElTooltip class="item" effect="dark" open-delay={500} content={setResult(row)} placement="top-start">
						<div class="flex items-center">{`${row.sub_type}`}</div>
					</ElTooltip>
				)
			},
		},
		useOperate([
			{
				title: '删除',
				onClick: (row: any) => {
					delSub(row)
				},
			},
		]),
	])
}

/**
 * @description 删除内容替换
 * @param id 要删除的id
 */
const delSub = async (row: { oldstr: string; newstr: string }) => {
	await useDataHandle({
		loading: '正在删除，请稍后...',
		request: delProxyUrlReplace({
			site_name: siteInfo.value.name,
			proxy_path: proxyData.value.proxy_path,
			oldstr: row.oldstr,
			newstr: row.newstr,
		}),
		message: true,
	})
	getCommonData()
}

/**
 * @description: 设置替换效果
 * @param {any} row
 */
const setResult = (row: any) => {
	const textList = [row.oldstr, row.newstr]
	const type = row.sub_type.replace(/g/g, '')
	const i = type.includes('i') ? '不区分大小写' : ''
	const o = type.includes('o') ? '只替换第一个' : ''
	const r = type.includes('r') ? '使用正则表达式' : ''
	switch (type.length) {
		case 0:
			return `效果:将全部'${textList[0]}'替换为'${textList[1]}''`
			break
		case 1:
			return `效果:将${!!o ? `` : `全部`}'${textList[0]}'替换为'${textList[1]}'，匹配时${i || o || r}`
			break
		case 2:
			return `效果:将${!!o ? `` : `全部`}'${textList[0]}'替换为'${textList[1]}'，匹配时${i || o || r}并且${r || o || i}`
			break
		case 3:
			return `效果:将'${textList[0]}'替换为'${textList[1]}'，匹配时${i}、${o}并且${r}`
			break
	}
}

/**
 * @description 获取	数据
 * @param close
 */
export const initReplaceData = (data: { sub_filter_str: any[] }) => {
	try {
		replaceData.subfilter = data.sub_filter_str
	} catch (error) {}
}

export const tableColumns = useTableColumn()

/**
 * @description 添加内容替换
 */
export const addReplaceView = () => {
	Object.assign(addReplaceData, {
		oldstr: '',
		newstr: '',
	})
	replaceMode.value = []
	resultText.value = `默认效果:将全部'http://www.bt.cn'替换为'https://www.bt.cn'`
	useDialog({
		isAsync: true,
		title: `添加内容替换【${proxyData.value.proxy_path}】`,
		area: 60,
		btn: '确认',
		component: () => import('@site/views/reverse-proxy-model/url-proxy/setting-replace-add.vue'),
		compData: {
			proxy_path: proxyData.value.proxy_path,
			subs_filter: proxyData.value.subs_filter,
		},
	})
}

/*********  设置内容替换 end  ************/

/*********  设置内容替换添加   ************/
// 表单数据
export const addReplaceData = reactive<any>({
	oldstr: '',
	newstr: '',
})
export const replaceRules = {
	oldstr: [defaultVerify({ message: '请输入原关键词' })],
}
export const replaceMode = ref([]) // 替换模式
export const resultText = ref(`默认效果:将全部'http://www.bt.cn'替换为'https://www.bt.cn'`)

export const replaceFormRef = ref() // 表单ref

/**
 * @description: 设置替换效果
 */
export const setInputResult = (val: string) => {
	setResultEvent(replaceMode.value)
}

/**
 * @description: 设置替换效果
 * @param {Array} value
 */
export const setResultEvent = (value: any) => {
	const i = value.includes('i') ? '不区分大小写' : ''
	const o = value.includes('o') ? '只替换第一个' : ''
	const r = value.includes('r') ? '使用正则表达式' : ''
	switch (value.length) {
		case 0:
			resultText.value = `默认效果:将全部${addReplaceData.oldstr}替换为${addReplaceData.newstr}`
			break
		case 1:
			resultText.value = `效果:将${!!o ? `` : `全部`}${addReplaceData.oldstr}替换为${addReplaceData.newstr}，匹配时${i || o || r}`
			break
		case 2:
			resultText.value = `效果:将${!!o ? `` : `全部`}${addReplaceData.oldstr}替换为${addReplaceData.newstr}，匹配时${i || o || r}并且${r || o || i}`
			break
		case 3:
			resultText.value = `效果:将${addReplaceData.oldstr}替换为${addReplaceData.newstr}，匹配时${i}、${o}并且${r}`
			break
	}
}
/**
 * @description: 提交表单
 */
export const onConfirmReplace = async () => {
	await replaceFormRef.value.validate()

	const params = {
		site_name: siteInfo.value.name,
		oldstr: addReplaceData.oldstr,
		newstr: addReplaceData.newstr,
		proxy_path: proxyData.value.proxy_path,
		sub_type: replaceMode.value.length ? replaceMode.value.join('') : 'g',
	}

	const res: AnyObject = await useDataHandle({
		loading: formDisabled,
		request: addProxyUrlReplace(params),
		message: true,
	})

	if (res.status) {
		getCommonData()
	}
	return res.status
}
/*********  设置内容替换添加 end  ************/

/*********  设置缓存   ************/
export const cacheFormRef = ref<any>() // 表单ref
export const cacheData = reactive({
	status: false, // 静态资源缓存
	time: '1', // 缓存时间
	unit: 'd', // 缓存时间单位
	cache_suffix: 'css,js,jpe,jpeg,gif,png,webp,woff,eot,ttf,svg,ico,css.map,js.map', // 缓存的文件后缀
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

export const cacheFormRules = {
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
	],
} // 表单验证规则

/**
 * @description 设置缓存
 * @param status 缓存状态
 */
export const setCacheEvent = (status: string | number | boolean) => {
	onConfirmCache()
}

/**
 * @description 确认添加
 * @param close
 */
export const onConfirmCache = async () => {
	const params = {
		site_name: siteInfo.value.name,
		proxy_path: proxyData.value.proxy_path,
		cache_status: cacheData.status ? 1 : 0,
		expires: `${cacheData.time}${cacheData.unit}`,
		cache_suffix: cacheData.cache_suffix.replace(/，/g, ','),
	}
	await cacheFormRef.value.validate()
	const res: any = await useDataHandle({
		loading: formDisabled,
		request: proxyUrlCache(params),
		message: true,
	})
	return res.status
}
/*********  设置缓存 end  ************/

/*********  设置内容压缩   ************/

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
export const compressFormRules = {
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
 * @description 设置压缩
 * @param status 压缩状态
 */
export const setComPressEvent = (status: boolean | string | number) => {
	onConfirmCompress()
}

/**
 * @description 确认添加
 * @param close
 */
export const onConfirmCompress = async () => {
	const params: any = {
		site_name: siteInfo.value.name,
		proxy_path: proxyData.value.proxy_path,
		gzip_status: compressData.status ? 1 : 0,
		gzip_min_length: `${compressData.minLength}${compressData.unit}`,
		gzip_comp_level: compressData.level,
		gzip_types: compressData.type,
	}
	await compressFormRef.value.validate()
	const res: any = await useDataHandle({
		loading: formDisabled,
		request: proxyUrlCompress(params),
		message: true,
	})
	return res.status
}

/*********  设置内容压缩 end  ************/

/*********  设置IP黑名单 IP白名单   ************/
export const settingIpRef = ref<any>() // 表格实例
export const settingIpWhiteRef = ref<any>() // 表格实例
export const listData = reactive({
	loading: false, // 加载状态
	type: 'black' as 'white' | 'black', // 类型
	white: [], // 白名单
	black: [], // 黑名单
})

export const useIpTableColumn = () => {
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
					deleteIpEvent(row)
				},
			},
		]),
	])
}

/**
 * @description 设置数据
 * @param data
 */
export const setIpValueEvent = (data: any) => {
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
const deleteIpEvent = async (data?: any) => {
	const isMult = Array.isArray(data) ? true : false
	await useConfirm({
		title: `${isMult ? '批量删除' : '删除'}${listData.type === 'white' ? '白' : '黑'}名单`,
		content: `${isMult ? '批量删除选中的ip，是否继续操作？' : `删除${listData.type === 'white' ? '白' : '黑'}名单【${data.ip}】，是否继续操作？`}`,
	})

	let params: any = {
		site_name: siteInfo.value.name,
		proxy_path: proxyData.value.proxy_path,
	}
	if (isMult) {
		params.ips = data.map((item: any) => item.ip).join('\n')
		params.ip_type = listData.type
	} else {
		params.ip = data.ip
		params.ip_type = data.type
	}

	const requestFun = isMult ? proxyUrlBatchDelLimit : proxyUrlDelLimit

	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: requestFun(params),
		message: true,
	})
	if (res.status) {
		getCommonData()
	}
}
const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '删除IP',
			value: 'delete',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				const requestHandle = async (item: any) =>
					await proxyUrlDelLimit({
						site_name: siteInfo.value.name,
						proxy_path: proxyData.value.proxy_path,
						ip: item.ip,
						ip_type: tabActive.value === 'ipBlackList' ? 'black' : 'white',
					})
				await batchConfirm({
					title: '批量删除',
					content: '批量删除选中的ip，是否继续操作？',
					column: [{ prop: 'ip', label: 'IP' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
					onConfirm: async () => {
						await nextAll(requestHandle) // 递归操作所有选中的数据
						getCommonData() // 执行完毕的代码，刷新列表
						return false
					},
				})
			},
		},
	]
}

export const ipTableColumns = useIpTableColumn()
export const TableBatchOptions = batchOptions()

export const initIpData = () => {
	listData.type = tabActive.value === 'ipBlackList' ? 'black' : 'white'
	setIpValueEvent(proxyData.value.ip_limit)
}

export const addIpView = () => {
	ipData.value.address = ''
	useDialog({
		isAsync: true,
		title: `添加IP${tabActive.value === 'ipBlackList' ? '黑' : '白'}名单【${proxyData.value.proxy_path}】`,
		area: 40,
		btn: '确认',
		component: () => import('@site/views/reverse-proxy-model/url-proxy/setting-ip-add.vue'),
		compData: {
			name: siteInfo.value.name,
			proxy_path: proxyData.value.proxy_path,
			listType: listData.type,
			refreshEvent: () => {
				getCommonData()
			},
		},
	})
}

//  添加ip
// 表单数据
export const ipData = ref<any>({
	types: listData.type,
	address: '',
})
export const addIpFormRef = ref() // 表单ref
export const ipHelpList = [{ content: '一行一条配置，多个IP请换行' }]
export const addIpRules = {
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
		proxy_path: proxyData.value.proxy_path,
		ip_type: tabActive.value === 'ipBlackList' ? 'black' : 'white',
		ips,
	}
	await addIpFormRef.value.validate()
	const res: AnyObject = await useDataHandle({
		loading: formDisabled,
		request: proxyUrlAddLimit(params),
		message: true,
	})
	if (res.status) {
		getCommonData()
	}
	return res.status
}

/*********  设置IP黑名单 IP白名单 end  ************/
