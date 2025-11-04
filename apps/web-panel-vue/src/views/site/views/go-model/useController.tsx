import { batchStatus, createProject, modifyProject, batchDelSite, getVersionList, setGoEnvironment } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps } from '@/components/extension/bt-table-batch/types'
import { useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { assembBatchParams, assembBatchResults, openResultView } from '@/public'
import { checkVariable, isString } from '@/utils'
import { SITE_STORE, useSiteStore } from '@site/useStore'

const Message = useMessage()

const { siteInfo, isRefreshList, activeType } = useSiteStore()
const { setSiteInfo } = SITE_STORE()

export const currentVersion = ref('') // 当前版本
export const goVersion = ref<any>([]) // go版本

export const openAddGoSite = () => {
	siteInfo.value = null
	useDialog({
		title: '添加Go项目',
		area: 62,
		component: () => import('@site/views/go-model/add-go/index.vue'),
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
		title: 'Go项目管理[' + row.name + '] -- 添加时间[' + row.addtime + ']',
		area: [84, 72],
		component: () => import('@site/views/go-model/setting/index.vue'),
	})
}
/**
 * @description 获取版本列表
 */
export const getVersionListEvent = async () => {
	// 获取版本列表
	try {
		let res: any
		res = await getVersionList('go')
		currentVersion.value = res.data.used
		goVersion.value = res.data.sdk['all']
			.filter((item: any) => item.installed)
			.map((item: any) => ({
				label: item.version,
				value: item.version,
			}))
	} catch (error) {
		console.log(error)
	}
}
/**
 * @description 设置版本
 */
export const setVersion = async () => {
	const res: AnyObject = await useDataHandle({
		loading: '正在设置，请稍后...',
		request: setGoEnvironment({ name: currentVersion.value }),
		message: true,
	})
	if (res.status) getVersionListEvent()
}

/**
 * @description: 处理环境变量
 */
const setEnv = (envStr: string) => {
	let env = envStr.split('\n').filter(item => item !== '')
	let arrs: any = []
	env.forEach(item => {
		let arr = item.split('=')
		arrs.push({
			k: arr[0],
			v: arr[1],
		})
	})
	return arrs
}

/**
 * @description 添加Go项目
 */
export const addGoConfirm = async (param: any, validate: () => void, envType: number) => {
	let data: any = Object.assign({}, param.value)
	if (data.domains !== '') {
		data.bind_extranet = 1
		data.domains = isString(data.domains) ? data.domains.split('\n') : data.domains
	} else {
		data.bind_extranet = 0
		delete data.domains
	}
	let env = param.value.env

	if (envType === 1) {
		// 环境变量
		env = setEnv(env)
	}
	data.env_file = envType === 2 ? param.value.envPath : ''
	data.env_list = JSON.stringify(envType === 1 ? env : [])

	await validate()

	const params = { data: JSON.stringify(data) }

	const requestFun = !!siteInfo.value ? modifyProject : createProject

	const res: AnyObject = await useDataHandle({
		request: requestFun(params, 'go'),
	})
	let data1 = res.data
	Message.msg({
		dangerouslyUseHTMLString: true,
		message: data1.status ? data1.data : data1.error_msg,
		type: data1.status ? 'success' : 'error',
		duration: data1.status ? 2000 : 0,
		showClose: !data1.status,
		customClass: '!max-w-[66rem]',
	}) // 提示
	if (res.status) {
		isRefreshList.value = true
	}
	return res.status
}

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
		['start', '批量启动选中项目后，项目将正常访问'],
		['stop', '批量停用选中的项目后，项目将会停止运行'],
		['restart', '批量重启选中的项目后，项目将会重新启动'],
		['delete', '批量删除选中的项目后，项目将无法恢复'],
	])
	const requestHandle = async (item?: any) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['start', batchStatus],
			['stop', batchStatus],
			['restart', batchStatus],
			['delete', batchDelSite],
		])
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
			case 'stop':
			case 'restart':
				if (fn) {
					const list = selectedList.value.map(item => ({ project_name: item.name }))
					const params = assembBatchParams(false, exclude, enable, {
						params: {
							site_list: JSON.stringify(list),
							status: value,
							project_type: activeType.value.toUpperCase(),
						},
					})
					return await fn(params, activeType.value)
				}
				break
			case 'delete':
				if (fn) {
					const delParams = assembBatchParams(selectedList.value, exclude, enable, {
						params: { project_type: activeType.value.toUpperCase() },
					})
					return await fn(delParams)
				}
		}
	}
	await batchConfirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [{ label: '项目名称', prop: 'name' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			const res = await requestHandle()
			// 执行完毕的代码，刷新列表
			isRefreshList.value = true
			clearBatch && clearBatch()
			let { data } = assembBatchResults(res.data)
			data = data.map((item: any) => ({ ...item, name: item.name || item.project_name }))
			openResultView(data, { title: `${label}网站` })
		},
	})
}
