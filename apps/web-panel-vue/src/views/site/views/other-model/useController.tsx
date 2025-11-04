import { addSiteTypes, modifySiteTypes, removeProject, removeSiteType, setProject } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps } from '@/components/extension/bt-table-batch/types'
import { Message, useConfirm, useDialog } from '@/hooks/tools'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { fileSelectionDialog } from '@/public'
import { checkVariable } from '@/utils/check'
import { SITE_STORE, useSiteStore } from '../../useStore'
import { SITE_OTHER_STORE } from './useStore'

const { activeType, settingTabActive, siteInfo, isRefreshList } = useSiteStore()
const { addGeneralProject, editGeneralProject, delGeneralProjectEvent, setSiteInfo, getRootUser, getProjectConfig } = SITE_STORE()

export const userList = ref([]) // 运行用户列表

/**
 * @description 打开添加通用项目弹窗
 */
export const openAddOtherSiteView = () => {
	siteInfo.value = null
	useDialog({
		title: '添加通用项目',
		area: 62,
		component: () => import('@site/views/other-model/add-other/index.vue'),
		showFooter: true,
	})
}

/**
 * @description 打开设置
 */
export const openSettingView = (row: any, tab?: string) => {
	// 设置网站信息
	setSiteInfo(row, tab)
	useDialog({
		title: '通用项目管理[' + row.name + '] -- 添加时间[' + row.addtime + ']',
		area: [84, 72],
		component: () => import('@site/views/other-model/setting/index.vue'),
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
export const useBatchEventHandle: TableBatchEventProps = async (batchCofirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['start', '批量启动选中项目后，项目将正常访问'],
		['stop', '批量停用选中的项目后，项目将会停止运行'],
		['restart', '批量重启选中的项目后，项目将会重新启动'],
		['delete', '批量删除选中的项目后，项目将无法恢复'],
	])
	const requestHandle = async (item: AnyObject, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['start', setProject],
			['stop', setProject],
			['restart', setProject],
			['delete', removeProject],
		])
		const { name: username } = item
		const fn = requestList.get(value)
		switch (value) {
			case 'start':
			case 'stop':
			case 'restart':
				if (fn) {
					const res = await fn({ data: JSON.stringify({ project_name: username }) }, activeType.value, value)
					const batchStatus = res.status ? 1 : 2
					// 自定义返回数据
					if (value === 'start') {
						return {
							...item,
							batchStatus,
							message: res.msg.replace(/<br>/g, '\n'),
						}
					}
					return {
						...item,
						batchStatus,
						message: res.status ? res.data.msg : res.data.data,
					}
				}
			case 'delete':
				if (fn) {
					return await fn({ data: JSON.stringify({ project_name: username }) }, activeType.value)
				}
		}
	}
	await batchCofirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [{ label: '项目名称', prop: 'name' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
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
 * @description: 触发目录选择
 */
export const onPathFileChange = (path: string, callback?: AnyFunction) => {
	fileSelectionDialog({
		type: 'file',
		path: path,
		change: (path: string) => {
			callback && callback(path)
		},
	})
}

export const addOtherMounted = async (): Promise<AnyObject> => {
	const { data: arr } = await getRootUser()
	userList.value = arr.map((item: any) => ({ label: item, value: item }))
	if (!!siteInfo.value) {
		// 编辑
		const { data } = await getProjectConfig({
			data: JSON.stringify({ project_name: siteInfo.value.name }),
		})
		return {
			...data?.project_config,
			project_ps: data?.ps,
			is_power_on: data?.project_config.is_power_on ? true : false,
			project_log: data?.project_config.project_log ? 1 : 0,
			web_log: data?.project_config.web_log ? 1 : 0,
		}
	}
	return {
		project_exe: '', // 项目jar路径
		project_name: '', // 项目名称
		port: '', // 项目端口
		project_cmd: '', // 项目执行命令
		run_user: 'www', // 项目用户
		project_ps: '', // 项目备注
		domains: '', // 绑定域名
		release_firewall: false, // 放行端口
		is_power_on: false, // 是否开机启动
		bind_extranet: false, // 是否绑定外网
	}
}

/**
 * @description 添加通用项目
 * @param param
 * @param validate
 * @param ref
 * @returns
 */
export const setOtherSite = async (param: any) => {
	try {
		const params = { ...param }
		if (params.domains !== '') {
			params.bind_extranet = 1
			const domains = checkVariable(params.domains, 'string', '')
			params.domains = domains.split('\n')
		} else {
			params.bind_extranet = 0
			delete params.domains
		}

		if (siteInfo.value) params.id = siteInfo.value.id

		const request = siteInfo.value ? editGeneralProject : addGeneralProject

		const res = await request({ data: JSON.stringify(params) })

		Message.msg({
			dangerouslyUseHTMLString: true,
			message: res.msg,
			type: res.status ? 'success' : 'error',
			duration: res.status ? 2000 : 0,
			showClose: !res.status,
			customClass: '!max-w-[66rem]',
		}) // 提示
		isRefreshList.value = true
		return res.status
	} catch (error) {
		console.log(error)
		return { status: false, msg: '发生错误' }
	}
}

export const delProjectEvent = async (row: any) => {
	try {
		await useConfirm({
			title: `删除项目-${row.name}`,
			content: `风险操作，此操作不可逆，删除${row.name}项目后您将无法管理该项目，是否继续操作？`,
			type: 'calc',
		})

		const params = {
			data: JSON.stringify({ project_name: row.name }),
		}
		const res = await delGeneralProjectEvent(params)
		Message.request(res)
		isRefreshList.value = true

		return res
	} catch (error) {
		console.log(error)
		return { status: false, msg: '删除项目失败' }
	}
}
