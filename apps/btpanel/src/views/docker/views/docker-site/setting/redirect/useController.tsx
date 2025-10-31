import { modifyRedirect, removeRedirect } from '@/api/docker'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps } from '@/components/extension/bt-table-batch/types'
import { Message, useConfirm, useDialog } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { checkVariable } from '@/utils'
import { useDockerSiteStore } from '@docker/views/docker-site/useStore'
import { SITE_REDIRECT_STORE, useSiteRedirectStore } from './useStore'

const { siteInfo } = useDockerSiteStore() // 站点信息

const { isRefreshList } = useSiteRedirectStore()
const { getDomainListEvent, changeStatusEvent, delRedirectEvent, getRedirectDataEvent, getRedirectFileEvent, submitRedirectEvent, saveFileEvent } = SITE_REDIRECT_STORE()

export const redirectList = ref<any[]>([]) // 重定向列表

export const configPopup = ref(false) // 配置文件弹窗
export const contentLoading = ref(false) // 内容加载中
export const configContent = ref('') // 配置文件内容
export const configPath = ref('') // 配置文件路径

export const isHaveErrorRedirect = ref(false) // 是否存在404重定向
export const errorRedirect = ref() // 404重定向数据
export const isEdit = ref(false) // 是否编辑状态
export const domainOptions = ref() // 域名数据;

export const rowData = ref<any>() // 行数据

export const helpList = [
	{ content: '设置域名重定向后，该域名的404重定向将失效' },
	{
		content: '取消重定向时，由于浏览器会缓存重定向信息，在清除缓存前，浏览器仍会根据缓存自动重定向',
	},
]
export const addHelpList = [
	{ content: '重定向类型：表示访问选择的“域名”或输入的“路径”时将会重定向到指定URL' },
	{
		content: '目标URL：可以填写你需要重定向到的站点，目标URL必须为可正常访问的URL，否则将返回错误',
	},
	{ content: '重定向方式：使用301表示永久重定向，使用302表示临时重定向' },
	{
		content: '保留URI参数：表示重定向后访问的URL是否带有子路径或参数如设置访问http://b.com',
	},
	{
		content: '重定向到http://a.com 保留URI参数： http://b.com/1.html ---> http://a.com/1.html',
	},
	{ content: '不保留URI参数：http://b.com/1.html ---> http://a.com' },
] // 提示列表

/**
 * @description 处理修改参数
 */
const handleModifyParams = (row: any) => {
	let params: AnyObject = {
		...row,
		type: row.type ? 0 : 1,
		redirectdomain: JSON.stringify(row.redirectdomain),
	}
	delete params.redirect_conf_file
	params.site_name = siteInfo.value.name
	delete params.sitename
	return params
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchCofirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchCofirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['start', '批量启用选中的规则后，配置的重定向域名/目录将会生效'],
		['stop', '批量停用选中的规则后，配置的重定向域名/目录将会失效'],
		['delete', '批量删除当前选中的规则后，配置的重定向域名/目录将会彻底失效'],
	])
	const requestHandle = async (item: any) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['start', modifyRedirect],
			['stop', modifyRedirect],
			['delete', removeRedirect],
		])
		const { redirectname } = item
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
			case 'stop':
				if (fn) {
					const params = handleModifyParams({
						...item,
						type: value === 'stop' ? 1 : 0,
					})
					return await fn(params)
				}
			case 'delete':
				if (fn) {
					return await fn({ site_name: siteInfo.value.name, redirectname: redirectname })
				}
		}
	}
	await batchCofirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [
			{
				label: '规则名称',
				render: (row: AnyObject) => {
					if (row.errorpage) return '404错误页面'
					return row.domainorpath === 'domain' ? checkVariable(row.redirectdomain, 'array', [])?.join('、') : row.redirectpath
				},
			},
			useBatchStatus(),
		] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshList.value = true
			return false
		},
	})
}

/**
 * @description 修改状态事件
 */
export const changeStatus = async (row: any) => {
	try {
		const params = handleModifyParams(row)
		const res = await changeStatusEvent(params)
		if (res.status) isRefreshList.value = true
		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '修改状态失败' }
	}
}

/**
 * @description 删除重定向
 */
export const delRedirect = async (row: any) => {
	try {
		await useConfirm({
			title: `删除重定向【${row.domainorpath === 'domain' ? checkVariable(row.redirectdomain, 'array', [])?.join('、') : row.redirectpath}】`,
			content: `删除选中的规则后，配置的重定向域名/目录将指向源地址，是否继续操作？`,
			icon: 'warning-filled',
			type: 'calc',
		})
		const { name } = siteInfo.value
		const { redirectname } = row
		const params: AnyObject = {
			proxy: { site_name: name, redirectname: redirectname },
		}

		const res = await delRedirectEvent(params.proxy)
		if (res.status) isRefreshList.value = true
		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '删除重定向失败' }
	}
}

/**
 * @description 获取配置文件内容
 */
export const openConfigPopupEvent = (row: any) => {
	// rowData.value = row
	configPopup.value = true
	// getFileEvent(row)
}

/**
 * @description 获取配置文件内容
 * @param row
 */
export const getRedirectFile = async (row: any) => {
	try {
		contentLoading.value = true
		let params = {
			path: row.redirect_conf_file,
		}

		const res: any = await getRedirectFileEvent(params)
		if (res.status) {
			configPopup.value = true
			configContent.value = res.data.content
			configPath.value = res.data.redirect_conf_file
		} else {
			Message.error(res.msg)
			configPopup.value = false
		}

		contentLoading.value = false
	} catch (error) {
		console.log(error)
		configPopup.value = false
	}
}

/**
 * @description 保存文件
 */
export const saveFile = async (
	params: { data: string; encoding: string; path: string } = {
		data: configContent.value,
		encoding: 'utf-8',
		path: configPath.value,
	}
) => {
	const res = await saveFileEvent(params)
	return res
}

/**
 * @description 获取重定向数据
 */
export const getRedirectData = async (isRefresh: boolean = false) => {
	const params = { sitename: siteInfo.value.name }
	try {
		const res = await getRedirectDataEvent(params)
		if (isRefresh) Message.success('刷新成功')
		// 判定是否存在404重定向
		isHaveErrorRedirect.value = false
		errorRedirect.value = null
		if (Array.isArray(res.data))
			res.data.forEach((item: any) => {
				if (item.errorpage) {
					isHaveErrorRedirect.value = true
					errorRedirect.value = item
				}
			})
		return res
	} catch (error) {
		console.log(error)
		return { data: [], total: 0, other: {} }
	}
}

/**
 * @description 添加编辑重定向
 */
export const editRedirectEvent = (row?: any) => {
	isEdit.value = !!row
	rowData.value = row || false
	useDialog({
		title: `${row ? '编辑' : '添加'}重定向${row ? `【${row.sitename}】` : ''}`,
		area: 68,
		component: () => import('./add-redirect.vue'),
		// compData: {
		// 	rowData: row,
		// 	siteType: siteType.value,
		// 	refresh: () => (isRefreshList.value = true),
		// },
		btn: true,
	})
}

export const initRedirect = async () => {
	try {
		const res = await getRedirectData()
		redirectList.value = Array.isArray(res.data) ? res.data.map((item: any) => item.redirectdomain).flat() : []
		return {
			...res,
			data: res.data?.map((item: any, index: number) => ({ ...item, id: index + 1 })) || [],
		}
	} catch (error) {
		console.log(error)
	}
}

/***************** 添加重定向*********************/

/**
 * @description 处理提交参数
 */
const handleConfirmParams = (param: any) => {
	const { name } = siteInfo.value
	const { holdpath, type, redirectdomain } = param

	let params: AnyObject = {
		...param,
		site_name: name,
		holdpath: holdpath ? '1' : '0',
		type: type ? '1' : '0',
		redirectdomain: JSON.stringify(redirectdomain),
		redirectname: param.redirectname || new Date().getTime(),
	}
	return params
}

/**
 * @description 提交重定向
 * @param param
 * @returns
 */
export const submitRedirect = async (param: any) => {
	try {
		// 提交参数
		const params: any = handleConfirmParams(param)
		const res = await submitRedirectEvent(params, isEdit.value)
		if (res.status) {
			// props.compData.refresh();
			isRefreshList.value = true
		}
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/**
 * @description 获取域名参数
 * @param row
 */
const handleDomainParams = () => {
	return { site_name: siteInfo.value.name, id: siteInfo.value.id }
}

/**
 * @description 获取域名
 * @param row
 */
export const getDomainData = async () => {
	try {
		const params = handleDomainParams() // 处理参数
		const res = await getDomainListEvent(params)
		// 根据isEdit状态决定是否过滤域名
		domainOptions.value = isEdit.value ? res.data.domain_list : res.data.domain_list.filter((item: any) => !redirectList.value.some((row: any) => row.includes(item.name)))
		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '获取域名失败' }
	}
}

export const initErrorRedirectForm = (row: any) => {
	// errForm.type = rowData.type === 1;
	// errForm.redirecttype = rowData.redirecttype;
	// errForm.topath = rowData.topath;
	// errForm.tourl = rowData.tourl;
}
