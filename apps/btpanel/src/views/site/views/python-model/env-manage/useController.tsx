import { editPythonRequirement, getPythonEnvInfo, PythonRequirementSetting } from '@/api/site'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { useSiteStore } from '@site/useStore'

const Message = useMessage()
const { siteInfo } = useSiteStore()

export const rowData = ref<any>() // 行数据

export const isRefreshList = ref(false) // 是否刷新列表
export const pipSource = ref<any[]>([]) // pip镜像源
export const envData = reactive<any>({
	pyVersion: '',
	path: '',
	search: '',
})

/**
 * @description: 格式化镜像源
 * @param {object} source 镜像源对象
 */
const formatSource = (source: any) => {
	const arr = Object.entries(source).map(([key, value]) => {
		return {
			label: key,
			key: value,
			value: key,
		}
	})
	return arr
}

const isRorcedRefresh = ref(false) // 是否强制刷新

/**
 * @description: 强制刷新
 */
export const forcedRefresh = () => {
	isRorcedRefresh.value = true
	isRefreshList.value = true
}

/**
 * @description 获取环境管理数据
 * @param path
 */
export const getEnvData = async (param: any) => {
	try {
		const res = await getPythonEnvInfo({
			project_name: siteInfo.value.name,
			force: isRorcedRefresh.value ? 1 : 0,
			search: param.search,
		})
		isRorcedRefresh.value = false
		if (res.data.status === false) {
			Message.error(res.data.msg)
			return { data: [], total: 0 }
		}
		// 设置数据
		envData.pyVersion = res.data.python_version
		envData.path = res.data.requirement_path
		// 设置镜像源
		pipSource.value = formatSource(res.data.pip_source) as any

		// 表格数据
		let data = res.data.pip_list
		if (param.search !== '') {
			// 搜索
			data = data.filter((item: any) => {
				return item.name.includes(param.search)
			})
		}
		return { data: data, total: data.length }
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description: 安装事件
 */
export const openInstall = (row?: any) => {
	rowData.value = row ? row : null
	useDialog({
		area: 75,
		isAsync: true,
		title: `安装第三方库`,
		btn: '安装',
		component: () => import('./install-package.vue'),
		compData: {
			row,
			path: envData.path,
			project_name: siteInfo.value.name,
			pipSource: pipSource.value,
			refreshEvent: () => {
				// getEnvData()
			},
		},
	})
}

/**
 * @description: 卸载事件
 * @param {string} row.name
 */
export const unInstallEvent = async (row: { name: string }) => {
	await useConfirm({
		title: '卸载第三方库',
		icon: 'warning-filled',
		content: `是否卸载第三方库【${row.name}】?`,
	})
	const res: AnyObject = await useDataHandle({
		loading: '正在卸载，请稍后...',
		request: PythonRequirementSetting({
			project_name: siteInfo.value.name,
			package_name: row.name,
			active: 'uninstall',
		}),
		message: true,
	})
	if (res.status) isRefreshList.value = true
}

/**
 * @description: 修改项目依赖记录文件
 * @param {string} path
 */
const editRequirement = async (path: string) => {
	const res: AnyObject = await useDataHandle({
		loading: '正在修改，请稍后...',
		request: editPythonRequirement({
			project_name: siteInfo.value.name,
			requirement_path: path,
		}),
		message: true,
	})
	if (res.status) isRefreshList.value = true
}

/**
 * @description: 触发目录选择
 */
export const onPathChange = () => {
	fileSelectionDialog({
		type: 'file',
		path: envData.path,
		change: (path: string) => {
			editRequirement(path)
		},
	})
}

// ----------- 安装第三方库 -----------
export const installFormRef = ref<any>() // 表单ref
export const installForm = reactive({
	type: 'common',
	name: '',
	version: '',
	file: '',
	pip: '',
})
export const rules = reactive({
	name: [
		{
			validator: (rule: any, value: any, callback: any) => {
				// 批量安装不验证
				if (installForm.type !== 'common') {
					callback()
					return
				}
				if (value) {
					callback()
				} else {
					callback(new Error('请输入名称'))
				}
			},
		},
	],
	file: [
		{
			validator: (rule: any, value: any, callback: any) => {
				// 批量安装不验证
				if (installForm.type !== 'file') {
					callback()
					return
				}
				if (value) {
					callback()
				} else {
					callback(new Error('请选择记录文件'))
				}
			},
		},
	],
})

/**
 * @description: 触发目录选择
 */
export const onPathChangeInstall = () => {
	fileSelectionDialog({
		type: 'file',
		path: installForm.file,
		change: (path: string) => {
			installForm.file = path
		},
	})
}

/**
 * @description: 获取数据
 */
export const getData = async () => {
	installForm.name = rowData.value?.name || ''
	installForm.file = envData.path || ''
	installForm.pip = pipSource.value[0]?.label || ''
}

// 批量安装：requirement_path pip_source   普通安装： package_name package_version pip_source active
export const onConfirmInstall = async (popupClose: any) => {
	try {
		await installFormRef.value.validate()
		const isMult = installForm.type === 'file'
		let params: any = {
			project_name: siteInfo.value.name,
			pip_source: installForm.pip,
		}
		if (isMult) {
			params = {
				...params,
				requirement_path: installForm.file,
			}
		} else {
			params = {
				...params,
				package_name: installForm.name,
				package_version: installForm.version,
				active: 'install',
			}
		}
		useDialog({
			title: '正在安装，请耐心等候...',
			area: 52,
			component: () => import('./log.vue'),
			compData: {
				type: 'createPythonProject',
				logPath: `/www/server/python_project//vhost/logs/pip_${params.project_name}.log`,
				endMsg: '安装结束',
				failMsg: '环境准备失败',
				successMsg: '安装结束',
				isClear: true,
				completeEvent: (status: boolean, close: any) => {
					isRefreshList.value = true
					close()
				},
			},
		})
		popupClose()
		const res = await PythonRequirementSetting(params)
		Message.request(res)
	} catch (error) {
		console.log(error)
	} finally {
	}
}
