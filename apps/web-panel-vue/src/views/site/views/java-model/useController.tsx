import { addJavaProject, batchDelSite, batchStatus, fixProject, getTomcat, getTomcatVersion, modifyJavaProject } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps } from '@/components/extension/bt-table-batch/types'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { assembBatchParams, assembBatchResults, openResultView } from '@/public'
import { isEmpty } from '@/utils'
import { SITE_STORE, useSiteStore } from '@site/useStore'

const { siteInfo, activeType, isRefreshList } = useSiteStore()
const { setSiteInfo } = SITE_STORE()

export const isEdit = computed(() => !!siteInfo.value) // 是否编辑状态

export const openAddJavaView = () => {
	siteInfo.value = null
	useDialog({
		title: '添加Java项目',
		area: [68],
		compData: {
			isEdit: false,
		},
		component: () => import('@site/views/java-model/add-java/index.vue'),
		showFooter: true,
	})
}

/**
 * @description 打开java漏洞扫描
 */
export const openVulScanView = () => {
	useDialog({
		title: 'Java漏洞扫描',
		area: [80, 60],
		component: () => import('@site/views/java-model/vul-scan/index.vue'),
	})
}

/**
 * @description 打开项目组管理
 */
export const openProjectGroupView = () => {
	useDialog({
		title: '项目组管理',
		area: 60,
		component: () => import('@site/views/java-model/project-group/index.vue'),
		showFooter: false,
	})
}

/**
 * @description 打开设置
 */
export const openSettingView = (row: any, tab: string = '') => {
	// 设置网站信息
	setSiteInfo(row, tab)
	useDialog({
		title: 'Java项目管理[' + row.name + '] -- 添加时间[' + row.addtime + ']',
		area: [84, 72],
		component: () => import('@site/views/java-model/setting/index.vue'),
	})
}

/**
 * @description 添加Java项目
 */
export const addJavaSite = async (param: any, radioType: string) => {
	const params = { data: JSON.stringify(param) }
	const res: AnyObject = await useDataHandle({
		loading: '正在提交，请稍后...',
		request: isEdit.value ? modifyJavaProject(params) : addJavaProject(params),
		message: true,
	})
	if (res.status) {
		isRefreshList.value = true
	}
	return res.status
}

/**
 * @description 打开JDK环境管理
 */
export const openJdkView = (name: string = 'jdkSettings') => {
	useDialog({
		isAsync: true,
		title: `JAVA环境管理`,
		area: [110, 54],
		component: () => import('@site/views/java-model/env-manage/index.vue'),
		compData: { name },
	})
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchCofirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchCofirm, nextAll, selectedList, options, clearBatch, config) => {
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
			case 'delete':
				if (fn) {
					const delParams = assembBatchParams(selectedList.value, exclude, enable, {
						params: { project_type: activeType.value.toUpperCase() },
					})
					return await fn(delParams)
				}
		}
	}
	await batchCofirm({
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

/**
 * @description 修复项目
 */
export const repairEvent = async (row: any) => {
	try {
		const res = await getTomcat()
		// 安装状态判断
		const isInstall = !isEmpty(res.data) || Object.values(res.data).some((item: any) => item.status)
		if (!isInstall) {
			Message.error('当前tomcat版本未安装，请安装后重试！')
			// 打开tomcat管理
			openJdkView('newTomCat')
		} else {
			await useConfirm({
				title: '修复项目',
				content: '您正在修复Java项目-[ ' + row.name + ' ]，是否继续吗？',
			})
			let loading = Message.load('正在修复中,请稍后...')
			const rdata = await fixProject({ data: JSON.stringify({ project_name: row.name }) })
			loading.close()
			Message.request(rdata)
			isRefreshList.value = true
		}
	} catch (error) {
		console.log(error)
	}
}
