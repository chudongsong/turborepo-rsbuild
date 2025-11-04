import { getNetVersion, getPluginInfo } from '@/api/site'

import { Message, useDialog } from '@/hooks/tools'
import { fileSelectionDialog, openPluginView } from '@/public'
import { SITE_STORE, useSiteStore } from '../../useStore'
import { swapString } from '@/utils'

const { isRefreshList, siteInfo } = useSiteStore()
const { editGeneralProject, addGeneralProject, setSiteInfo } = SITE_STORE()
/**
 * @description 打开添加通用项目弹窗
 */
export const openAddNetSiteView = () => {
	siteInfo.value = null
	useDialog({
		title: '添加.Net项目',
		area: 72,
		component: () => import('@site/views/net-model/add-net/index.vue'),
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
		title: '.Net项目管理[' + row.name + '] -- 添加时间[' + row.addtime + ']',
		area: [84, 72],
		component: () => import('@site/views/net-model/setting/index.vue'),
	})
}

export const inputCmd = (val: string) => {
	// if (val !== '') {
	//   let data: any = netAddForm.value.project_cmd.match(/([0-9]*)$/)[0];
	//   netAddForm.value.port = data ? data : netAddForm.value.port;
	// }
}

export const versionData = ref([]) // 版本数据
export const isEdit = computed(() => !!siteInfo.value) // 是否编辑
export const netAddForm = ref<AnyObject>({
	project_path: '', // 项目jar路径
	project_name: '', // 项目名称
	port: '', // 项目端口
	project_cmd: '', // 项目执行命令
	run_user: 'www', // 项目用户
	project_ps: '', // 项目备注
	release_firewall: false, // 放行端口
	dotnet_version: '', // dotnet版本
	is_power_on: false, // 是否开机启动
	bind_extranet: false, // 是否外网映射
})

/**
 * @description 添加.Net项目
 */
export const addNetSite = async (param: Ref<T>, validate: () => Promise<'closed' | true>, ref: Ref<any>) => {
	try {
		await ref.value.validate()
		const params = {
			data: JSON.stringify({
				...param.value,
				is_power_on: param.value.is_power_on ? 1 : 0,
			}),
		}
		const request = siteInfo.value ? editGeneralProject : addGeneralProject

		const res = await request(params)

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
		return false
		// return { status: false, msg: '添加项目失败' }
	}
}

export const editNetSite = async () => {}

/**
 * @description: 触发目录选择
 */
export const onPathChange = () => {
	fileSelectionDialog({
		type: 'all',
		path: netAddForm.value.project_path,
		change: (path: string) => {
			netAddForm.value.project_path = path
		},
	})
}

/**
 * 获取dotnet版本
 */
export const getVersion = async (isRefresh: boolean = false) => {
	try {
		const res = await getNetVersion()
		versionData.value = res.data.map((item: any) => ({ label: item, value: item }))
		if (isRefresh) return Message.success('Net版本，刷新成功')
		netAddForm.value.dotnet_version = res.data[0]
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description: 初始化添加.Net项目表单
 */
export const initNetAddForm = async () => {
	await getVersion()
	if (isEdit.value) {
		const { project_config, ps } = siteInfo.value
		Object.assign(netAddForm.value, {
			...project_config,
			project_ps: swapString(ps),
			bind_extranet: project_config.bind_extranet === 1,
			is_power_on: project_config.is_power_on === 1,
			port: project_config.port,
		})
	}
}

/**
 * @description: 重置添加.Net项目表单
 */
export const $resetNetAddForm = () => {
	Object.assign(netAddForm.value, {
		project_path: '', // 项目jar路径
		project_name: '', // 项目名称
		port: '', // 项目端口
		project_cmd: '', // 项目执行命令
		run_user: 'www', // 项目用户
		project_ps: '', // 项目备注
		release_firewall: false, // 放行端口
		dotnet_version: '', // dotnet版本
		is_power_on: false, // 是否开机启动
		bind_extranet: false, // 是否外网映射
	})
}

/**
 * @description: 打开插件
 */
export const openVersionPlugin = async () => {
	try {
		// 打开插件
		const { data } = await getPluginInfo({
			sName: 'dotnet',
		})
		await openPluginView({ name: 'dotnet', softData: data })
	} catch (error) {
		console.log(error)
	}
}
