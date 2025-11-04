import { Message, useConfirm, useDialog, useDataHandle } from '@/hooks/tools'
import { fileSelectionDialog, openPluginView } from '@/public'
import { RiskTableDataProps } from '../../types'
import { SITE_STORE, useSiteStore } from '../../useStore'
import { SITE_PROXY_STORE } from './useStore'
import { openResultDialog } from '@site/useController'
import { setCookie } from '@/utils'
import { useGlobalStore } from '@/store/global'
import { proxyTcpAction } from '@api/site'

const { plugin } = useGlobalStore()
const { isRefreshList } = useSiteStore()
const { setSiteInfo } = SITE_STORE()
const { deleteProxySiteEvent, multDeleteProxySiteEvent, addProxySiteEvent, addProxyTcpEvent, getConfigEvent } = SITE_PROXY_STORE()
const { proxyType } = storeToRefs(SITE_PROXY_STORE())

/**
 * @description 打开添加通用项目弹窗
 */
export const openAddProxySiteView = () => {
	useDialog({
		title: '添加反向代理项目',
		area: 62,
		component: () => import('@site/views/reverse-proxy-model/add-reverse-proxy/index.vue'),
		showFooter: true,
	})
}

/**
 * @description 打开设置
 */
export const openSettingView = (row: any, tab: string = '') => {
	// 设置网站信息
	setSiteInfo(row, tab)
	useDialog({
		title: '反向代理项目管理[' + row.name + '] -- 添加时间[' + row.addtime + ']',
		area: [84, 70],
		component: () => import('@site/views/reverse-proxy-model/setting/index.vue'),
	})
}

/**
 * @description 打开插件
 * @param {any} row 行数据
 * @param {string} type 类型：total、btwaf
 */
export const openPlugin = async (row: any, type: string) => {
	if (type === 'monitor') {
		setCookie('total_website', row.name)
	}
	// 环境
	const webEn = plugin.value?.web?.type
	const webEnType = webEn === 'nginx' ? 'btwaf' : 'btwaf_httpd'
	await openPluginView({
		name: type === 'total' ? 'total' : type === 'monitor' ? 'monitor' : webEnType,
		callback: (appWin: any) => {
			if (type === 'monitor') {
				return
			}

			if (appWin && !['total', 'monitor'].includes(type) && webEnType === 'btwaf') {
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
 * @description 删除反向代理项目
 */
export const deleteProxySite = async (row: any) => {
	await useConfirm({
		title: `${`删除反向代理项目【${row.name}】`}`,
		content: `${`风险操作，此操作不可逆，删除【${row.name}】项目后您将无法管理该项目，是否继续操作？`}`,
		type: 'check',
		check: {
			content: '同时删除网站根目录',
			onConfirm: async (status: boolean) => {
				return await deleteProxySiteEvent(row, status)
			},
		},
	})
}

/**
 * @description 批量删除反向代理项目
 */
export const multDeleteProxySite = async (rows: any, clearSelection: any) => {
	await useConfirm({
		title: '批量删除反向代理项目',
		content: '批量删除选中的项目后，项目将无法恢复，是否继续操作？',
		type: 'check',
		check: {
			content: '同时删除网站根目录',
			onConfirm: async (status: boolean) => {
				let params: any = {
					remove_path: status ? 1 : 0,
					site_list: JSON.stringify(
						rows.map((item: any) => ({
							id: item.id,
							site_name: item.name,
						}))
					),
				}
				const { data } = await multDeleteProxySiteEvent(params)
				openResultDialog({
					resultData: data,
					resultTitle: '批量删除反向代理项目',
				})
				clearSelection() // 清除选中
			},
		},
	})
}

export const helpList = [
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
			<>
				发送域名：将域名添加到请求头传递到后端服务器，默认为目标URL域名，若设置不当可能导致代理无法正常访问，例如：
				<br />
				http://192.168.100.20:19888，则发送域名保持$http_host即可
				<br />
				http://www.bt.cn，则发送域名应当改为www.bt.cn
				<br />
				上面例子仅为常见情况，请以实际为准
			</>
		),
	},
]

export const targetOptions = [
	{ value: 'url', label: 'URL地址' },
	{ value: 'unix', label: 'unix地址' },
]

// const handelInputTodo = (val: string) => {
//   if (rowData.targetType === 'unix') {
//     rowData.todomain = '$http_host';
//     return;
//   }
//   let value = val.replace(/^http[s]?:\/\//, '');
//   value = value.replace(/(:|\?|\/|\\)(.*)$/, '');
//   rowData.todomain = value;
// };

// const handleInputName = (val: any) => {
//   rowData.domains = val;
//   rowData.remark = val.split('\n')[0];
// };

export const refreshTcpTable = ref(false)
export const addProxyTcp = async (param: Ref<T>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
	let load
	try {
		await validate()
		const { ps, listen_port, protocol, proxy_pass, isEdit } = param.value
		const params = {
			ps,
			listen_port,
			protocol,
			proxy_pass,
			handle: isEdit ? 'update' : 'create',
		}
		load = Message.load('正在' + (isEdit ? '编辑' : '添加') + '项目，请稍后...') // 加载提示
		const res: any = await addProxyTcpEvent(params)
		Message.msg({
			dangerouslyUseHTMLString: true,
			message: res.msg,
			type: res.status ? 'success' : 'error',
			duration: res.status ? 2000 : 0,
			showClose: !res.status,
			customClass: '!max-w-[66rem] bt-message-error-html',
		}) // 提示错误信息
		if (res.status) {
			// 刷新
			refreshTcpTable.value = true
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	} finally {
		load?.close()
	}
}

/**
 * @description 获取URL代理列表
 */
export const getUrlList = async (params: any) => {
	try {
		const res: any = await useDataHandle({
			request: proxyTcpAction({
				handle: 'list',
			}),
			data: {
				data: Array,
			},
		})
		if (!Array.isArray(res.data)) {
			return { data: [], total: 0 }
		}
		return {
			data: res.data
				.map((item: any) => {
					const [listen_port, protocol] = item.listen_port.split(' ')
					return {
						...item,
						listen_port,
						protocol: protocol || 'tcp',
					}
				})
				.filter((item: any) => {
					// 如果没有搜索关键词，返回所有数据
					if (!params.search) return true
					// 如果有搜索关键词，判断listen_port是否包含该关键词
					return item.listen_port.toString().includes(params.search)
				})
				.sort((a: any, b: any) => {
					try {
						// 转换为数字进行比较,处理可能的非数字情况
						const idA = parseInt(a.id)
						const idB = parseInt(b.id)

						// 如果转换结果是NaN,将其视为0
						if (isNaN(idA) && isNaN(idB)) return 0
						if (isNaN(idA)) return 1
						if (isNaN(idB)) return -1

						// 降序排列,大的在前面
						return idB - idA
					} catch (error) {
						console.warn('排序出错:', error)
						return 0 // 出错时保持原有顺序
					}
				}),
			total: res.data.length,
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description 删除事件
 * @param data  选中的数据
 * @param isMult  是否是多选
 */
export const deleteEvent = async (data: any, refresh: () => void) => {
	await useConfirm({
		title: `删除代理【${data.listen_port}】`,
		width: '35rem',
		icon: 'warning-filled',
		content: `您真的要删除代理【${data.listen_port}】吗？`,
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在删除，请稍后...',
		request: proxyTcpAction({
			handle: 'delete',
			protocol: data.protocol,
			listen_port: data.listen_port,
			proxy_pass: data.proxy_pass,
		}),
		message: true,
	})
	if (res.status) refresh()
}

/**
 * @description 打开TCP/UDP代理设置
 */
export const openTcpSettingView = (row: any) => {
	useDialog({
		isAsync: true,
		title: `${row.protocol.toUpperCase()}代理设置【${row.listen_port}】`,
		area: [76, 60],
		component: () => import('@site/views/reverse-proxy-model/tcp-proxy/setting.vue'),
		compData: {
			row,
		},
	})
}

export const addProxySite = async (param: Ref<T>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
	let load
	try {
		await validate()
		const { remark, targetType, proxysite: proxy_pass, domains, todomain: proxy_host } = param.value
		const params = {
			remark,
			proxy_type: targetType === 'url' ? 'http' : 'unix',
			proxy_pass,
			domains,
			proxy_host,
		}
		load = Message.load('正在添加项目，请稍后...') // 加载提示
		const res: any = await addProxySiteEvent(params)
		Message.msg({
			dangerouslyUseHTMLString: true,
			message: res.msg,
			type: res.status ? 'success' : 'error',
			duration: res.status ? 2000 : 0,
			showClose: !res.status,
			customClass: '!max-w-[66rem] bt-message-error-html',
		}) // 提示错误信息
		if (res.status) {
			proxyType.value = 'http'
			nextTick(() => {
				isRefreshList.value = true
			})
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	} finally {
		load?.close()
	}
}

/**
 * @description 选择路径
 */
export const onPathChange = (params: any) => {
	fileSelectionDialog({
		type: 'file',
		path: params.proxysite,
		change: (path1: string) => {
			params.proxysite = path1
		},
	})
}

/*******************配置文件*********************/

export const options = [
	{ value: 'server_block', label: 'server块' },
	{ value: 'http_block', label: 'HTTP块' },
]
export const fileHelpList = [
	{
		content: '主配置文件不允许修改，如需自定义配置请到上方自定义配置文件中操作',
	},
]
export const serverList = [
	{
		content: '保存前请检查输入的配置文件是否正确，错误的配置可能会导致网站访问异常',
	},
	{ content: '如果您对此配置不熟悉，请勿添加自定义配置' },
	{
		content: () => (
			<>
				server块的nginx官方配置文档：
				<a class="text-primary cursor-pointer" href="https://nginx.org/en/docs/http/ngx_http_core_module.html#server" target="_blank" rel="noreferrer noopener">
					点击跳转
				</a>
			</>
		),
	},
]
export const httpList = [
	{
		content: '保存前请检查输入的配置文件是否正确，错误的配置可能会导致网站访问异常',
	},
	{ content: '如果您对此配置不熟悉，请勿添加自定义配置' },
	{
		content: () => (
			<span>
				http块的nginx官方配置文档：
				<a class="text-primary cursor-pointer" href="https://nginx.org/en/docs/http/ngx_http_core_module.html#http" target="_blank" rel="noreferrer noopener">
					点击跳转
				</a>
			</span>
		),
	},
]

/**
 * @description 获取配置文件列表
 * @param path
 */
const getConfigData = async (params: { site_name: string }) => {
	try {
		// textLoading.value = true;
		const res = await getConfigEvent(params)
		// if (tab === 'master') {
		//   staticContent.value = res.data.site_conf;
		// } else {
		//   staticContent.value = res.data[fileType.value];
		//   customHelp.value =
		//     fileType.value === 'server_block' ? serverList : httpList;
		// }
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 打开风险详情
 * @param row
 */
export const openRiskDetails = (row: RiskTableDataProps) => {
	// useDialog({
	// 	title: '风险详情',
	// 	area: [70, 55],
	// 	component: () => import('@firewall/public/risk-detail/index.vue'),
	// 	compData: row,
	// });
}

// 违规词检测-概览
export const typeMap = reactive<{
	[key: string]: string
}>({
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
