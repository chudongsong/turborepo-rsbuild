import { batchPhpBack, batchPhpStatus, getDomains, getScanList, getSiteTypes, modifyProjectRunState, setSiteBackup, setSiteStatus, batchPhpBasedir, batchPhpDomain } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { Message, useConfirm, useDataHandle, useDialog, useHandleError } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { checkDomain, checkDomainPort, copyText, defaultVerify, domainPortVerify, portVerify, setCookie } from '@/utils'
import { SITE_STORE } from '@site/useStore'
import { SITE_PHP_STORE, useSitePhpStore } from '@site/views/php-model/useStore'
import { openResultDialog, useBatchClassConfig, useBatchSslConfig } from '../../useController'
import { getPluginInfo } from '@/api/global'
import { assembBatchParams, assembBatchResults, openPluginView, openResultView, pluginInstallDialog } from '@/public'
import { useWPLocalStore } from '@/views/wordpress/view/local/useStore'

const { isRefreshList, selectedList: sList, batchConfig, isSiteMult } = storeToRefs(SITE_STORE())
const { setSiteInfo } = SITE_STORE()
const { plugin, payment } = useGlobalStore()
const { isRefreshLocalList } = storeToRefs(useWPLocalStore())

export const classList = ref<any>([]) // 分类列表
export const tableList = ref<any>([]) // 表格数据
export const categoryRefs = ref<any>() // 分类数据

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchCofirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm, nextAll, selectedList, options, clearBatch, config) => {
	const { label, value } = options
	const { enable, exclude } = config
	const template: Map<string, string> = new Map([
		['start', '批量启用选中的站点后，站点将恢复正常访问'],
		['stop', '批量停用选中的站点后，站点将无法正常访问，用户访问会显示当前网站停用后的提示页'],
		['backSite', '批量备份选中的站点，可能耗费时间较长'],
	])
	const requestHandle = async () => {
		const requestList: Map<string, AnyFunction> = new Map([['backSite', batchPhpBack]])
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
			case 'stop':
				const site_list = selectedList.value.map((item: any) => ({ id: item.id, name: item.name, phpsync: Number(item.project_config?.type === 'PHPMOD') }))
				const params = assembBatchParams(false, exclude, enable, {
					params: { option: value === 'start' ? '1' : '0', project_type: 'PHP', site_list: JSON.stringify(site_list) },
				})
				return await batchPhpStatus(params)
			case 'backSite':
				if (fn) {
					const params = assembBatchParams(selectedList.value, exclude, enable, { params: { project_type: 'PHP' } })
					return await fn(params)
				}
				break
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [{ label: '网站名', prop: 'rname' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const res = await requestHandle()
			// 执行完毕的代码，刷新列表
			isRefreshList.value = true
			isRefreshLocalList.value = true
			clearBatch && clearBatch()
			let { data } = assembBatchResults(res.data)
			openResultView(data, { title: `${label}` })
		},
	})
}

export const phpBatchOptions = [
	{ label: '启动站点', value: 'start', event: useBatchEventHandle },
	{
		label: '停用站点',
		value: 'stop',
		event: useBatchEventHandle,
	},
	{
		label: '备份站点',
		value: 'backSite',
		event: useBatchEventHandle,
	},
	{
		label: '设置到期时间',
		value: 'setTimeSite',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			useDialog({
				title: '批量设置到期时间',
				area: 48,
				compData: {
					rowData: selectedList.value,
					config,
				},
				component: () => import('@site/public/set-expirat-time/index.vue'),
				showFooter: true,
				onCancel: () => clearSelection && clearSelection(),
			})
		},
	},
	{
		label: '设置PHP版本',
		value: 'setPhpSite',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			batchConfig.value = config
			useDialog({
				title: '批量设置PHP版本',
				area: 42,
				compData: selectedList.value,
				component: () => import('@site/views/php-model/batch-set-php-version/index.vue'),
				onCancel: () => clearSelection && clearSelection(),
				showFooter: true,
			})
		},
	},
	{
		label: '防跨站',
		value: 'antiCrossingStation',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			useConfirm({
				title: '批量设置防跨站',
				content: '批量开启后，可防止黑客通过其他网站目录进行入侵攻击，是否继续操作？',
				type: 'check',
				check: {
					content: '防跨站攻击(open_basedir)',
					value: true,
					onConfirm: async (status: boolean) => {
						let asyncList = [] as Array<AnyObject> // 异步项目列表
						selectedList.value.forEach((item: any) => {
							if (item?.project_config?.type === 'PHPMOD') {
								asyncList.push({
									name: item.name,
									msg: '异步项目不支持',
									status: false,
								})
							}
						})

						// 非异步项目
						const otherList = selectedList.value.filter((item: any) => item?.project_config?.type !== 'PHPMOD')
						// 组装参数
						const { enable, exclude } = config
						const params = assembBatchParams(otherList, exclude, enable, { params: { project_type: 'PHP', stat: status ? 'open' : 'close' } })

						await useDataHandle({
							request: batchPhpBasedir(params),
							success: (res: any) => {
								const { data }: any = assembBatchResults(res.data)
								clearSelection && clearSelection()

								openResultDialog({
									title: '批量设置防跨站',
									resultData: asyncList.concat(data),
									resultTitle: '设置防跨站',
								})
							},
						})
					},
				},
			})
		},
	},
	{
		label: '防盗链',
		value: 'hotLinkProtect',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			useDialog({
				title: '批量设置防盗链',
				area: 50,
				compData: { selectedList: selectedList.value, config },
				component: () => import('@site/public/hotlink-protection/index.vue'),
				showFooter: true,
				onCancel: () => clearSelection && clearSelection(),
			})
		},
	},
	{
		label: '流量限制',
		value: 'limitFlowSite',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			sList.value = selectedList.value
			batchConfig.value = config
			useDialog({
				title: '批量设置流量限制',
				area: 44,
				compData: { selectedList: selectedList.value, config },
				component: () => import('@site/public/flow-setting/flow-limit/index.vue'),
				showFooter: true,
				onCancel: () => {
					clearSelection && clearSelection()
					sList.value = []
				},
			})
		},
	},
	useBatchSslConfig(),
	{
		label: '部署伪静态',
		value: 'setPseudoStatic',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			batchConfig.value = config
			useDialog({
				title: '批量部署伪静态',
				area: 72,
				compData: selectedList.value,
				component: () => import('@site/views/php-model/batch-set-pseudo-static/index.vue'),
				showFooter: true,
				onCancel: () => clearSelection && clearSelection(),
			})
		},
	},
	useBatchClassConfig({
		callback: () => {},
		classList: classList,
	}),
	{
		label: '复制网站域名',
		value: 'copySiteDomain',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			await useConfirm({
				title: '批量复制网站域名',
				content: `批量复制网站所有域名，是否继续操作？`,
			})
			const { enable, exclude } = config
			const params = assembBatchParams(selectedList.value, exclude, enable, { params: { project_type: 'PHP' } })
			useDataHandle({
				loading: '正在复制网站域名，请稍后...',
				request: batchPhpDomain(params),
				success: (res: any) => {
					clearSelection && clearSelection()
					copyText({ value: res.data.data.join('\n') })
				},
			})
		},
	},
	{
		label: '删除站点',
		value: 'delete',
		event: async (batchConfirm, nextAll, selectedList, options, clearSelection, config) => {
			batchConfig.value = config
			openDeleteSiteView(selectedList.value, clearSelection)
		},
	},
] as TableBatchOptionsProps[]

export const openAddPhpSite = () => {
	useDialog({
		title: '添加站点-支持批量建站',
		area: 80,
		// compData: {
		//   refresh: getTypeList,
		//   typeList: typeList.value,
		// },
		component: () => import('@site/views/php-model/add-site/index.vue'),
		showFooter: true,
	})
}

/**
 * @description 打开备份
 */
export const openBackupView = (row: any) => {
	useDialog({
		isAsync: true,
		title: '网站备份数据【' + row.name + '】',
		area: 90,
		component: () => import('@site/views/php-model/backup/index.vue'),
		compData: row,
	})
}

/**
 * @description 打开设置
 */
export const openSettingView = (row: any, tab: string = '') => {
	const isAsync = row?.project_config?.type === 'PHPMOD'

	// 设置网站信息
	setSiteInfo(row, tab)
	if (isAsync && plugin.value.webserver !== 'nginx') return Message.error(`当前为动态项目仅支持nginx服务器使用`)
	useDialog({
		title: `站点修改[${row.rname}] -- 添加时间[${row.addtime}]${isAsync ? ' -- <code class="tag">异步项目</code>' : ''}`,
		area: [86, 71],
		component: () => {
			if (isAsync) {
				return import('@site/views/php-model/setting/phpasync-setting.vue')
			}
			return import('@site/views/php-model/setting/index.vue')
		},
	})
}

/**
 * @description: 打开插件购买来源
 */
const checkSourceId = (name: string) => {
	// total:47,iconWaf:49 bt_waf:48
	switch (name) {
		case 'monitor':
			return 47
		case 'bt_waf':
			return 48
		case 'iconWaf':
			return 49
	}
}

/**
 * @description 打开插件
 * @param {any} row 行数据
 * @param {string} type 类型：total、btwaf
 */
export const openPlugin = async (row: any, type: string) => {
	if (type === 'monitor-setting') type = 'monitor'
	if (type === 'monitor') {
		// 存储cookie值
		const res = await openTotalFlow(row, false)
		if (!res) return
		setCookie('total_website', row.name)
	}
	// 环境
	const webEnType = plugin.value.web.type === 'nginx' ? 'btwaf' : 'btwaf_httpd'
	const source = checkSourceId(type)
	if (type !== 'monitor') type = webEnType
	await openPluginView({
		source,
		name: type,
		callback: (appWin: any) => {
			if (appWin && type !== 'monitor') {
				const interval = setInterval(() => {
					const pluginView = appWin.document.getElementsByClassName('layui-layer-page')[0] as HTMLElement
					if (appWin.site_waf_config && pluginView) {
						clearInterval(interval)
						if (pluginView) pluginView.style.display = 'none'
						appWin.site_waf_config(row.name) // 旧版代码，兼容使用
						const layerView2 = appWin.document.getElementsByClassName('layui-layer-page')[1] as HTMLElement
						if (layerView2) {
							layerView2.querySelector('.layui-layer-close')?.addEventListener('click', () => {
								pluginView.querySelector('.layui-layer-close')?.click()
							})
						}
					}
				}, 50)
			}
		},
	})
}

/**
 * @description 打开流量数据
 */
export const openTotalFlowView = (row: any) => {
	useDialog({
		isAsync: true,
		title: '流量数据',
		area: 50,
		component: () => import('@site/views/php-model/daily-flow/index.vue'),
		compData: row,
		showFooter: false,
	})
}

/**
 * @description: 网站安全
 */
export const openSiteSafety = () => {
	useDialog({
		isAsync: true,
		title: '网站安全扫描',
		area: [75, 65],
		component: () => import('@site/views/php-model/site-safety/index.vue'),
	})
}

/**
 * @description: 漏洞扫描
 */
export const openVulnerabilityScan = () => {
	useDialog({
		isAsync: true,
		title: '漏洞扫描',
		area: [80, 71],
		component: () => import('@firewall/public/vulnerability-scanning/index.vue'),
		compData: { isSiteModule: true },
	})
}
export const pluginPopup = ref(false)
export const productData = {
	title: '网站监控报表 --功能介绍',
	imgSrc: '/soft_ico/ico-total.png',
	ps: '快速浏览不同时间段的流量数据，发现高峰和趋势，助您迅速优化网站！',
	source: 142,
	desc: ['分析近期攻击', '快速分析流量状况', '多时段切换', '排查趋势变化'],
	tabImgs: ['https://www.bt.cn/Public/new/plugin/total/siteTraffic/traffic.png'],
}

/**
 * @description 打开总流量
 * @param row
 */
export const openTotalFlow = async (row: any, isOpen: boolean = true) => {
	// 查询是否安装
	try {
		const { data } = await getPluginInfo({ sName: 'monitor' })
		if (data.endtime < 0) {
			// 弹出功能介绍页
			// productIntroductionDialog(productData)
			pluginPopup.value = true
			return false
		}
		if (!data.setup) {
			await pluginInstallDialog({
				name: data?.name,
				type: 'i',
				pluginInfo: data,
			})
			return false
		} else {
			// 打开插件
			if (isOpen) openTotalFlowView(row) // 测试版功能
			return true
		}
	} catch (error) {
		useHandleError(error)
	}
}

/**
 * @description 修改状态
 * @param {AnyObject} row 行数据
 */
export const changeStatus = async (row: any) => {
	// 是否为动态项目
	const isAsync = row?.project_config?.type === 'PHPMOD'
	// 项目状态
	const status = Number(row.status)
	// 项目状态字段
	const action = status ? 'stop' : 'start'

	if (isAsync && row?.project_config?.dependence === 1) {
		if (plugin.value.webserver !== 'nginx') return Message.error(`当前仅支持nginx服务器使用`)
		// 打开设置
		// openSettingView({ ...row, logTab: 'installLogs' }, 'log');
		// return;
	}
	const todayStart = new Date().setHours(0, 0, 0, 0)
	const isExpired = row.edate !== '0000-00-00' && new Date(row.edate).getTime() / 1000 < todayStart / 1000
	if (isExpired) {
		return Message.error('项目已过期，请设置站点到期时间后再操作')
	}

	await useConfirm({
		title: '提示',
		content: status ? `停用站点【${row.name}】后，用户访问会显示当前网站停用后的提示页，是否继续操作？` : `启动站点【${row.name}】后，用户可以正常访问网站内容，是否继续操作？`,
		icon: 'warning-filled',
	})
	const { changeStatusEvent } = SITE_PHP_STORE()
	const res = await changeStatusEvent({ row, action }, { isAsync, status })
	if (res.status) isRefreshList.value = true
	return res
}

/**
 * @description 删除站点
 */
export const delPhpSite = async () => {
	try {
	} catch (error) {
		console.log(error)
	}
}

// 通过历史搜索推荐点击得付费功能 购买来源都使用260
export const recommendList = ref([
	{ name: '漏洞扫描', callback: openVulnerabilityScan },
	{
		name: '网站安全扫描',
		callback: () => {
			recommendClick(tableList.value[0], 'siteSecurity')
		},
	},
	{
		name: '网站拨测告警',
		callback: () => {
			recommendClick(tableList.value[0], 'siteAlarm')
		},
	},
	{
		name: '日志安全分析',
		callback: () => {
			recommendClick({ ...tableList.value[0], tabName: 'safe' }, 'siteLogs')
		},
	},
	{
		name: '网站防篡改',
		callback: () => {
			recommendClick(tableList.value[0], 'antiTamper')
		},
	},
	{
		name: '网站容量限制',
		callback: () => {
			if (tableList.value.length && tableList.value[0]?.project_config?.type === 'PHPMOD') return Message.error('异步项目不支持容量限制')
			recommendClick({ ...tableList.value[0], tabName: 'flowQuota' }, 'directory')
		},
	},
])

const recommendClick = (row: any, tab: string) => {
	if (!tableList.value.length)
		return Message.msg({
			message: '暂无网站，请添加网站后使用',
			type: 'warning',
		})
	openSettingView(row, tab)
}

/**
 * @description 高级设置
 */
export const phpAdvancedSettingsDialog = (name: any = 'setDefaultPage') =>
	useDialog({
		isAsync: true,
		title: '高级设置',
		area: [96, 62],
		component: () => import('@site/views/php-model/advanced-setting/index.vue'),
		compData: name,
		showFooter: false,
	})

/**
 * @description 获取扫描列表
 */
export const getScanData = async () => {
	try {
		// 非企业版不请求
		// if (payment.value.authType !== 'ltd') return
		const { data: res }: any = await getScanList()
		// 错误拦截
		if (res.hasOwnProperty('status') && !res.status) return
		const { scanData } = useSitePhpStore()
		scanData.value = {
			loophole_num: res?.loophole_num || 0,
			web_scaning_times: res?.web_scaning_times || 0,
			time: res?.time || 0,
			site_num: res?.site_num || 0,
		}
	} catch (error) {
		useHandleError(error)
	}
}

export const openDeleteSiteView = (row: any, clearSelection?: any) => {
	useDialog({
		title: '删除站点确认',
		component: () => import('@site/views/php-model/delete-site/index.vue'),
		area: 'auto',
		compData: row,
		onCancel: () => {
			clearSelection && clearSelection()
		},
	})
}

/**
 * @description 规则
 */
export const rules = reactive({
	project_jar: [defaultVerify({ message: '请输入项目jar路径' })],
	project_name: [defaultVerify({ message: '请输入项目名称' })],
	project_file: [{ required: true, message: '请输入项目启动文件', trigger: ['blur', 'change'] }],
	port: [defaultVerify({ message: '请输入端口号', trigger: 'blur' }), portVerify()],
	project_jdk: [defaultVerify({ message: '请输入项目JDK' })],
	project_cmd: [defaultVerify({ message: '请输入项目执行命令' })],
	php_version: [defaultVerify({ message: '请选择PHP版本', trigger: 'change' })],
	project_path: [defaultVerify({ message: '请输入项目路径' })],
	domain: [defaultVerify({ message: '请输入项目域名' })],
	tomcat_version: [defaultVerify({ message: '请选择tomcat版本', trigger: 'change' })],
	project_script: [defaultVerify({ message: '请选择项目启动脚本' })],
	project_cwd: [defaultVerify({ message: '请输入项目启动目录' })],
	userCmd: [defaultVerify({ message: '请输入命令', trigger: ['blur', 'input'] })],
	config_body: [{ required: true, message: '请输入配置内容', trigger: ['blur', 'input'] }],
	cluster: [{ required: true, message: '请输入负载实例数量', trigger: ['blur', 'change'] }],
	max_memory_limit: [{ required: true, message: '请输入内存上限', trigger: ['blur', 'change'] }],
	project_exe: [defaultVerify({ message: '请选择项目可执行文件' })],
	rfile: [defaultVerify({ message: '请选择项目运行文件' })],
	run_user: [{ required: true, message: '请选择运行用户', trigger: 'change' }],
	pjname: [defaultVerify({ message: '请输入项目名称' })],
	path: [defaultVerify({ message: '请选择路径' })],
	nodejs_version: [{ required: true, message: '请选择Node版本', trigger: ['blur', 'change'] }],
	dotnet_version: [{ required: true, message: '请选择Net版本', trigger: ['blur', 'change'] }],
	webname: [defaultVerify({ message: '请输入域名', trigger: 'blur' }), domainPortVerify()],
	processes: [defaultVerify({ message: '请输入进程数' })],
	threads: [defaultVerify({ message: '请输入线程数' })],
	ftp_username: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (value.length === 0) {
					callback(new Error('FTP用户名不能为空！'))
				} else if (!/^[a-zA-Z0-9_]+$/g.test(value)) {
					callback(new Error('FTP用户名只能包含字母、数字和下划线！'))
				} else if (value.length <= 3) {
					callback(new Error('FTP用户名长度错误，需要大于3个字符！'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	datauser: [
		{
			trigger: ['blur', 'change'],
			validator: (rule: any, value: any, callback: any) => {
				if (value.length === 0) {
					callback(new Error('名称不能为空！'))
				} else if (!/^[a-zA-Z0-9_]+$/g.test(value)) {
					callback(new Error('名称只能包含字母、数字和下划线！'))
				} else if (value.length <= 3) {
					callback(new Error('名称长度错误，不能少于3个字符！'))
				} else if (value.length > 16) {
					callback(new Error('名称长度错误，不能大于16个字符！'))
				} else {
					callback()
				}
			},
		},
	],
	site_path: [
		{ required: true, message: '请输入项目目录', trigger: ['blur', 'change'] },
		{
			valitor: (rule: any, value: any, callback: any) => {
				if (!value) {
					callback(new Error('请输入项目目录'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'input', 'change'],
		},
	],
	// 域名 swoole
	domains: [
		{ required: true, message: '请输入域名', trigger: 'blur' },
		{
			trigger: ['blur', 'input', 'change'],
			validator: (rule: unknown, value: string, callback: any) => {
				// 使用换行符分割字符串为域名数组
				const domainsArr = value.split('\n').filter((item: any) => item.length)
				const invalidIndex = domainsArr.findIndex(domain => domain.split(':')[0].length < 3)
				domainsArr.map((domain, index) => {
					let isPort = domain.includes(':')
					if ((isPort && !checkDomainPort(domain)) || (!isPort && !checkDomain(domain))) {
						callback(new Error(`当前域名格式错误，第${index + 1}行，内容:${domain}`))
					}
				})
				// 域名必须大于3个字符串
				if (invalidIndex !== -1) {
					callback(new Error(`第 ${invalidIndex + 1} 个域名长度不符合要求（必须大于3个字符）`))
				} else {
					callback()
				}
			},
		},
	],
})

/**
 * 安全解析 localStorage 的 JSON 数组
 * @param key localStorage 的 key
 * @returns 解析后的数组，失败时返回空数组
 */
export const parseLocalStorageArray = (key: string): any[] => {
	try {
		const value = localStorage.getItem(key)
		if (!value) return []
		const parsed = JSON.parse(value)
		return Array.isArray(parsed) ? parsed : []
	} catch (error) {
		// 解析失败时清空损坏的本地存储数据
		localStorage.removeItem(key)
		return []
	}
}
