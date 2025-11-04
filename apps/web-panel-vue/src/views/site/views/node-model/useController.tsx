import { getPluginInfo } from '@/api/global'
import { batchDelSite, batchStatus, delNodeProject, getNodeJsEnvironment, getNodeVersionList, getPackageManagers, modifyNodeProject, setDefaultEnv, setProject } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle, useDialog, useHandleError, useMessage } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { assembBatchParams, assembBatchResults, openPluginView, openResultView } from '@/public'
import { checkVariable } from '@/utils'
import { useSiteStore, SITE_STORE } from '@site/useStore'

const Message = useMessage()

const { siteInfo, isRefreshList, activeType } = useSiteStore()
const { setSiteInfo } = SITE_STORE()

export const isEdit = computed(() => !!siteInfo.value) // 是否编辑状态
export const currentVersion = ref('0') // 当前版本
export const nodeVersion = ref<any>([]) // node版本
// export const maskLayer = ref<boolean>(false) // 环境检测遮罩层
export const maskLayer = useSessionStorage<boolean>('_node_mask', false) // 环境检测遮罩层

/**
 * @description 获取Node版本
 */
export const getNodeVersionData = async () => {
	try {
		const res = await getNodeVersionList()
		// 当版本有安装时，显示
		nodeVersion.value = []
		if (!res.status) {
			maskLayer.value = true
			return
		}
		maskLayer.value = false
		res.data?.forEach((item: any) => {
			if (item.setup) {
				nodeVersion.value.push({
					label: item.version,
					value: item.version,
				})
			}
			if (item.is_default === 1) currentVersion.value = item.version
		})
		nodeVersion.value.unshift({
			label: '未设置',
			value: '0',
		})
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
		request: setDefaultEnv({ version: currentVersion.value }),
	})
	Message.request({
		status: res.data?.status,
		msg: res.data.data || res.data.error_msg,
	})
}

/**
 * @description 打开Node版本管理
 */
export const openNodeVersionEvent = async () => {
	// 打开插件
	try {
		const { data } = await getPluginInfo({
			sName: 'nodejs',
		})
		await openPluginView({ name: 'nodejs', softData: data })
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 添加Node项目
 */
export const openAddNodeSite = () => {
	siteInfo.value = null
	useDialog({
		title: '添加Node项目',
		area: 80,
		component: () => import('@site/views/node-model/add-node/index.vue'),
		showFooter: true,
	})
}

/**
 * @description 打开PM2监控
 */
export const openPm2View = () => {
	useDialog({
		title: 'PM2监控',
		area: 120,
		showFooter: false,
		component: () => import('@site/views/node-model/pm-monitor/index.vue'),
	})
}

/**
 * @description 删除项目
 */
export const delProject = async (row: any) => {
	await useConfirm({
		type: 'default',
		title: `删除项目-${row.name}`,
		content: `风险操作，此操作不可逆，删除【${row.name}】项目后您将无法管理该项目，是否继续操作？`,
		input: {
			content: '删除项目',
		},
	})
	try {
		let config = row.project_config
		let params: any = {
			project_name: config.project_name,
			project_type: config.project_type || 'nodejs',
		}
		if (config.pm2_name) params['pm2_name'] = config.pm2_name
		const res = await delNodeProject(params)
		Message.request(res)
		isRefreshList.value = true
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 打开Node项目设置
 */
export const openSettingView = (data: any, name?: string) => {
	setSiteInfo(data, name)
	useDialog({
		isAsync: true,
		title: 'Node项目管理[' + data.name + '] -- 添加时间[' + data.addtime + ']',
		area: [87, 71],
		component: () => import('@site/views/node-model/setting/index.vue'),
	})
}

/**
 * @description 检查节点版本
 */
export const useCheckNodeVersionNpm = async (version: string) => {
	try {
		const { data: res } = await getPackageManagers({ version })
		return res.package_managers
	} catch (error) {
		useHandleError(error)
	}
}

export const nodeData = ref({
	nodejs_versions: [], // Node版本
	package_managers: [], // 包管理器
	user_list: [], // 用户列表
	maximum_memory: 0, // 最大内存
}) // 配置数据，node版本，运行用户，包管理
/**
 * @description: 获取节点配置
 */
export const getNodeConfig = async () => {
	try {
		const res = await getNodeJsEnvironment()
		Object.assign(nodeData.value, {
			...res?.data,
			maximum_memory: res?.data?.maximum_memory || 0,
			nodejs_versions: checkVariable(res?.data?.nodejs_versions, 'array', []),
			user_list: checkVariable(res?.data?.user_list, 'array', []),
			package_managers: checkVariable(res?.data?.package_managers, 'array', []),
		})
		return res.data
	} catch (error) {
		console.log(error)
		return nodeData.value
	}
}

/**
 * @description 提交修改的node数据
 * @param params 修改的数据
 */
export const submitEditNodeData = async (params: any) => {
	if (params) {
		await useDataHandle({
			loading: '正在保存修改，请稍后...',
			request: modifyNodeProject(params),
			message: true,
		})
		isRefreshList.value = true
	}
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
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
	const requestHandle = async (item?: AnyObject) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['start', batchStatus],
			['stop', batchStatus],
			['restart', batchStatus],
		])
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
			case 'stop':
			case 'restart':
				if (fn) {
					const list = selectedList.value.map(item => {
						if (item.project_config.pm2_name) {
							return { id: item.id, project_name: item.name, project_type: item.project_config.project_type || 'nodejs', pm2_name: item.project_config.pm2_name }
						}
						return { id: item.id, project_name: item.name, project_type: item.project_config.project_type || 'nodejs' }
					})
					const params = assembBatchParams(false, exclude, enable, {
						params: {
							site_list: JSON.stringify(list),
							status: value,
							project_type: 'NODE',
						},
					})
					return await fn(params, activeType.value)
				}
			case 'delete':
				// const { name: username, project_config } = item
				// let params: any = {
				// 	project_name: username,
				// 	project_type: project_config.project_type || 'nodejs',
				// }
				// if (params.project_type === 'pm2') {
				// 	params['pm2_name'] = project_config.pm2_name
				// }
				const list = selectedList.value.map(item => {
					if (item.project_config.pm2_name) {
						return { id: item.id, name: item.name, project_type: item.project_config.project_type || 'nodejs', pm2_name: item.project_config.pm2_name }
					}
					return { id: item.id, name: item.name, project_type: item.project_config.project_type || 'nodejs' }
				})
				const delParams = assembBatchParams(false, exclude, enable, {
					params: { project_type: activeType.value.toUpperCase(), site_list: JSON.stringify(list) },
				})

				return await batchDelSite(delParams)
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
