import { getFileBody, getJavaInfo, getSystemUserList, getTomcat, installTomcatNew, saveFileBody, settingsTomcat, setTomcatStatus, uninstallTomcat, getTomcatRandomInstall } from '@/api/site'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { msgBoxDialog } from '@/public'
import { has } from 'ramda'
import { tabActive } from '../useController'

export const isRefreshTomcatList = ref(false) // 是否刷新Tomcat列表
export const tomcatVersionList = ref<any>([]) // Tomcat版本列表
export const jdkVersionList = ref<any>([]) // JDK版本列表
export const jdkSetList = ref<any>([]) // JDK版本列表
export const userList = ref([]) // 用户列表

export const rowData = ref({}) // 行数据

/**
 * @description 安装新的Tomcat
 */
export const openInstallDailog = () => {
	useDialog({
		title: 'Java环境管理 - Tomcat安装',
		area: 60,
		component: () => import('./install-tomcat.vue'),
		showFooter: true,
	})
}

/**
 * @description 安装Tomcat
 * @param params
 */
export const installTomcat = async (params: any) => {
	try {
		if (params.install_type === 'global') {
			params.ps = ''
			params.name = params.base_version
		}
		let loading = Message.load('正在安装Tomcat，请稍后...')
		const res = await installTomcatNew(params)
		Message.request(res)
		loading.close()
		isRefreshTomcatList.value = true
		if (res.msg?.includes('已添加到安装任务')) {
			msgBoxDialog()
		}
		return res.status
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取Tomcat列表
 */
export const getTomcatList = async () => {
	try {
		const { data: res } = await getTomcat()
		const data = Object.keys(res).map(key => {
			return {
				...res[key],
				t_name: key,
			}
		})
		if (!res.status && has('msg', res)) return { data: [], total: 0, other: {} }
		return { data: data, total: 0, other: {} }
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 打开Tomcat配置
 */
export const openSetConfigDialog = (row: any) => {
	rowData.value = row
	useDialog({
		title: `Java环境管理 - Tomcat【${row.t_name}】配置`,
		area: 60,
		component: () => import('./config-file.vue'),
		showFooter: true,
	})
}

export const configContent = ref('') // 配置文件内容

/**
 * @description 获取配置文件内容
 */
export const getConfigDataEvent = async () => {
	try {
		const res = await getFileBody({ path: rowData.value.config_path })
		configContent.value = res.data.data
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 保存配置文件内容
 */
export const saveConfigDataEvent = async () => {
	try {
		const res = await saveFileBody({ encoding: 'utf-8', data: configContent.value, path: rowData.value.config_path })
		Message.request(res)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 打开Tomcat设置
 */
export const openSetting = (row: any) => {
	rowData.value = row
	useDialog({
		title: `Java环境管理 - Tomcat【${row.t_name}】设置`,
		area: 60,
		component: () => import('./set-tomcat.vue'),
		showFooter: true,
	})
}

/**
 * @description 设置Tomcat
 * @param parmas
 */
export const setTomcat = async (parmas: any) => {
	let loading = Message.load('正在设置Tomcat，请稍后...')
	try {
		// console.log(parmas, 'parmas')
		let data = {
			tomcat_name: rowData.value.t_name,
			user: parmas.user,
			auto_restart: parmas.auto_restart,
			port: parmas.port,
			jdk_path: parmas.jdk_path,
			ps: parmas.ps,
		}
		const res = await settingsTomcat(data)
		Message.request(res)
		isRefreshTomcatList.value = true
		return res.status
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

/**
 * @description 卸载Tomcat
 * @param item
 */
export const unInstallTomcat = async (item: any) => {
	await useConfirm({
		title: '卸载Tomcat',
		isHtml: true,
		content: `是否卸载【 ${item.t_name}】，<span class="text-danger">此操作将会删除该Tomcat目录下的所有文件，请确保该Tomcat未被使用</span>，是否继续操作？`,
	})
	await useDataHandle({
		loading: '正在卸载Tomcat，请稍后...',
		request: uninstallTomcat({ tomcat_name: item.t_name }),
		success: () => (isRefreshTomcatList.value = true),
		message: true,
	})
}

/**
 * @description 设置Tomcat状态
 * @param status
 * @param item
 */
export const setStatus = async (item: any, isRestart: boolean) => {
	const status = item.running
	const isStop = status
	await useConfirm({
		title: 'Tomcat状态',
		content: `是否${isRestart ? '重启' : isStop ? '停止' : '启动'}【${item.t_name}】，是否继续操作？`,
	})

	let loading = Message.load(`正在${isRestart ? '重启' : isStop ? '停止' : '启动'}Tomcat【${item.t_name}】，请稍后...`)
	// let version = item.name.replace('Tomcat', '')
	try {
		//  data: JSON.stringify({ })
		const res = await setTomcatStatus({ type: isRestart ? 'restart' : isStop ? 'stop' : 'start', tomcat_name: item.t_name })
		Message.request(res)
		isRefreshTomcatList.value = true
	} catch (error) {
		console.log(error)
	} finally {
		loading.close()
	}
}

export const getIntallList = async () => {
	try {
		const res = await getJavaInfo()
		tomcatVersionList.value = []
		res.data.tomcat_status.forEach((item: any) => {
			if (!item.is_install)
				tomcatVersionList.value.push({
					label: `Tomcat${item.version}`,
					value: `tomcat${item.version}`,
					...item,
				})
		})

		jdkVersionList.value = res.data.jdk_info.filter((item: any) => item.operation === 1 || item.operation === 2)
		jdkVersionList.value = jdkVersionList.value.map((item: any) => ({
			label: item.name,
			value: item.path,
		}))
		jdkSetList.value = jdkVersionList.value.map((item: any) => ({ ...item, value: item.value.replace('/bin/java', '') }))
	} catch (error) {}
}

/**
 * @description 添加 获取系统用户列表
 */
export const getRootUser = async () => {
	try {
		const res = await getSystemUserList({ springboot: 0 })
		userList.value = res.data.map((item: any) => ({ label: item, value: item }))
		return { data: res.data, status: res.status }
	} catch (error) {
		console.log(error)
		return { msg: '获取用户列表失败', status: false }
	}
}

/**
 * @description 添加JDK
 */
export const goAddJdk = () => {
	tabActive.value = 'jdkSettings'
}

/**
 * @description 生成随机端口
 */
export const getRandomPort = async (formData: Ref<any>) => {
	console.log(formData)
	const res = await getTomcatRandomInstall()
	formData.value.port = res.msg
}
