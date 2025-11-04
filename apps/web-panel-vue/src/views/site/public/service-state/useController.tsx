import { Message, useConfirm, useDialog } from '@/hooks/tools'
import { fileSelectionDialog } from '@/public'
import { setProjectStatus } from '../../useController'
import { SITE_STORE, useSiteStore } from '../../useStore'
import { SITE_SERVICE_STORE, useSiteServiceStore } from './useStore'
import { setTaskStatus } from '@/api/global'
import { defaultVerify } from '@/utils'
import { SelectOptionProps } from '@/components/form/bt-select/types'

const { siteInfo, siteType } = useSiteStore()
const { getPhpVersionList, setSiteInfo, jumpTabEvent } = SITE_STORE()

const { setAlertConfigEvent, getAlarmConfig, getJavaServiceEvent, getRestartConfigEvent, setRestartStatusEvent, saveSitePathEvent, getRunInfoEvent, getAsyncSystemUserList, getDirInIEvent, releasePortEvent, submitAsyncConfigEvent } = SITE_SERVICE_STORE()

export const isLoading = ref(false) // 加载状态
export const status = computed(() => (siteType.value === 'java' ? siteInfo.value?.pid !== null : siteType.value === 'phpasync' ? !!siteInfo.value?.status : siteInfo.value.run))

export const restartPopup = ref(false) // 重启弹窗
export const starting = computed(() => siteInfo.value?.starting) // 项目是否启动中
export const rowData = ref<any>({}) // 项目信息
export const versionOptions = ref([]) // php版本
export const msgData = reactive<any>({
	status: false,
	id: '',
})
export const msgForm = reactive<any>({
	module: [],
	status: msgData.status,
	interval: 60,
	count: 1,
	push_count: 1,
})

export const systemUserOptions = ref() // 系统用户列表
export const fileOptions = ref<SelectOptionProps[]>([]) // 目录列表
export const releasePortPopup = ref(false) // 放行端口弹窗
export const releasePortRef = ref<any>() // 放行端口ref

export const restartStatus = ref(false) // 重启状态暂存
export const restartFormRef = ref<any>() // 重启表单
export const restartForm = ref<any>({
	status: false,
	time: 0,
	where_hour: 0,
	where_minute: 0,
})

export const restartRules = reactive({
	where_hour: [
		defaultVerify({ message: '请输入小时' }),
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!/^[0-9]*$/.test(value) || value < 0 || value > 23 || !Number.isInteger(parseFloat(value))) {
					callback(new Error('请输入0-23之间的整数'))
				} else {
					callback()
				}
			},
		},
	],
	where_minute: [
		defaultVerify({ message: '请输入分钟' }),
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!/^[0-9]*$/.test(value) || value < 0 || value > 59 || !Number.isInteger(parseFloat(value))) {
					callback(new Error('请输入0-59之间的整数'))
				} else {
					callback()
				}
			},
		},
	],
})

/**
 * @description 项目状态
 * @param type
 */
export const statusData = (type: boolean) => {
	if (starting.value) return '开启中'
	return type ? '运行中' : '已停止'
}

/**
 * @description 项目图标
 * @param type
 */
export const statusIcon = (type: boolean) => {
	if (starting.value) return 'el-icon-loading'
	return type ? 'bt-link svgtofont-icon-start' : 'bt-danger svgtofont-icon-stop'
}

/**
 * @description 跳转日志tab
 */
export const goLogTab = () => {
	if (!starting.value) return
	jumpTabEvent('logsManager')
}

/**
 * @description 获取phpasync项目状态信息
 */
export const getPhpAsyncProjectInfo = async () => {
	try {
		const res = await getRunInfoEvent()
		if (res.status) {
			// 更新 siteInfo 中的状态信息
			setSiteInfo({
				...siteInfo.value,
				...res.data,
				status: res.data.status,
			})
			// 同时更新 rowData，避免重复请求
			Object.assign(rowData.value, res.data)
			rowData.value['is_power_on'] = res.data['is_power_on'] === 1
			rowData.value['allPort'] = res.data['Listen']?.map((item: any) => item[1])?.join(', ')
		}
		return res
	} catch (error) {
		console.log(error)
		return { msg: '获取项目状态失败', status: false }
	}
}

/**
 * @description 服务管理
 * @param type
 */
export const setService = async (type: 'restart' | 'stop' | 'start') => {
	const res = await setProjectStatus(siteInfo.value, type, siteType.value)
	if (siteType.value === 'java' && res?.status) {
		getProjectInfo()
	} else if (siteType.value === 'phpasync' && res?.status) {
		getPhpAsyncProjectInfo()
	}
}

/**
 * @description
 * @param val
 * @returns
 */
export const changeUnusualStatus = async (val: boolean | string | number) => {
	try {
		if (msgForm.status) {
			await getPushConfig()
			// msgData.value.status = false
			// msgForm.status = true
			// 打开弹窗
			openAlarmPopup('open')
			return
		}
		const res = await setTaskStatus({
			task_id: msgData.id,
			status: val ? 1 : 0,
		})
		Message.request(res)
		if (!res.status) openAlarmPopup()
	} catch (error) {
		console.log(error)
		return { msg: '修改状态失败', status: false }
	}
}

/**
 * @description 打开弹窗
 */
export const openAlarmPopup = (type?: 'open') => {
	useDialog({
		isAsync: true,
		title: msgData.title || '项目异常停止告警设置',
		component: () => import('./project-exception-alarm.vue'),
		area: 48,
		btn: true,
		compData: { refreshEvent: getPushConfig, type },
	})
}

/**
 * @description 获取推送配置
 */
export const getPushConfig = async () => {
	try {
		const res: any = await getAlarmConfig()
		if (res.status) {
			const task = res.data.find((item: any) => item.source === 'project_status' && item.task_data.project === siteInfo.value.id)
			if (task) {
				const { task_data, status, sender, number_rule, id } = task
				Object.assign(msgForm, {
					...task_data,
					status,
					interval: task_data.interval,
					count: task_data.count,
					push_count: task_data.push_count || number_rule.day_num,
					module: sender,
				})
				Object.assign(msgData, {
					status,
					id,
				})
			} else {
				Object.assign(msgForm, {
					status: false,
					type: 'project_status',
					title: '项目停止告警',
					tid: '9',
					interval: 600,
					count: 1,
					push_count: 1,
					module: [],
				})
				Object.assign(msgData, {
					status: false,
					id: '',
				})
			}
		}
		return { data: msgForm, status: true }
	} catch (error) {
		console.log(error)
		return { msg: '获取告警配置失败', status: false }
	}
}

/**
 * @description 获取项目信息
 */
export const getProjectInfo = async (showMsg?: boolean) => {
	try {
		const data = JSON.stringify({ project_name: siteInfo.value.name })
		const res = await getJavaServiceEvent({ data })
		if (showMsg === true && res.status) Message.success('刷新成功')
		if (res.status) {
			setSiteInfo(res.data)
		}
		return res
	} catch (error) {
		console.log(error)
		return { msg: '获取项目配置失败', status: false }
	}
}

/**
 * @description 获取项目重启配置
 */
export const getRestartConfig = async (name: string = siteInfo.value.name, type: string = siteType.value) => {
	try {
		isLoading.value = true
		const res = await getRestartConfigEvent({
			model_name: siteType.value,
			project_name: siteInfo.value.name,
		})
		isLoading.value = false
		Object.assign(restartForm.value, {
			...res.data,
			status: res.data.status ? true : false,
		})
		restartStatus.value = Boolean(res.data.status)

		// 如果是 phpasync 项目，同时获取项目状态信息
		if (siteType.value === 'phpasync') {
			await getPhpAsyncProjectInfo()
		}

		return {
			data: {
				...res.data,
				status: res.data.status ? true : false,
			},
			status: true,
		}
	} catch (error) {
		console.log(error)
		return { msg: '获取重启配置失败', status: false }
	}
}

export const onCancelRestart = () => {
	restartForm.value.status = restartStatus.value
	restartForm.value.where_hour = 0
	restartForm.value.where_minute = 0
}

/**
 * @description 项目重启设置 提交事件
 * @param val
 */
export const setRestartStatus = async (data: any) => {
	try {
		if (!restartPopup.value && data) {
			restartPopup.value = true
			return
		}
		if (restartPopup.value) await restartFormRef.value.validate()

		const params = {
			model_name: siteType.value,
			project_name: siteInfo.value.name,
			status: data ? 1 : 0,
			hour: restartForm.value.where_hour,
			minute: restartForm.value.where_minute,
		}
		const res: AnyObject = await setRestartStatusEvent(params)
		if (res.status) {
			restartPopup.value = false
			await getRestartConfig()
			// 如果是 phpasync 项目，确保状态已更新
			if (siteType.value === 'phpasync') {
				await getPhpAsyncProjectInfo()
			}
		} else {
			onCancelRestart()
		}
	} catch (error) {
		console.log(error)
		return { msg: '修改状态失败', status: false }
	}
}

export const initService = async () => {
	getPushConfig()
	getRestartConfig()
	if (siteType.value === 'java') {
		getProjectInfo()
	}
}

/****************************************/
/**
 * @description 获取保存告警参数
 */
const handleConfirmParams = (param: any) => {
	const cycleType: any = {
		java: 1,
		nodejs: 2,
		go: 3,
		python: 4,
		other: 5,
	}

	return {
		template_id: '9',
		task_data: JSON.stringify({
			task_data: {
				...param,
				cycle: cycleType[siteType.value],
				project: siteInfo.value.id,
				interval: Number(param.interval),
			},
			sender: param.module,
			time_rule: {
				send_interval: Number(param.interval),
				time_range: [0, 86399],
			},
			number_rule: {
				day_num: Number(param.push_count),
				total: 0,
			},
		}),
		title: '项目' + siteInfo.value.name + '停止告警',
		status: param.status ? 1 : 0,
		// id: param.id || new Date().getTime(),
		// name: 'site_push',
		// data: JSON.stringify({
		//   ...param,
		//   module: param.module?.join(','),
		//   cycle: cycleType[siteType.value],
		//   interval: Number(param.interval),
		//   push_count: Number(param.push_count),
		// }),
	}
}

/**
 * @description 修改告警设置
 */
export const setAlertConfig = async (param: any) => {
	try {
		const params = handleConfirmParams(param)
		const res = await setAlertConfigEvent(params)
		if (res.status) getPushConfig()
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

/****************************************/

/**
 * @description 选择目录
 */
export const openPathDialog = (spath: string, name: string) => {
	// 当最后一个字符是/时，去掉
	if (spath && spath[spath.length - 1] === '/') {
		spath = spath.slice(0, -1)
	}
	fileSelectionDialog({
		type: 'all',
		path: spath ? spath : '/www/wwwroot',
		change: (path: string) => {
			rowData.value[name] = path
			savePath()
		},
	})
}

export const savePath = async () => {
	try {
		const res = await saveSitePathEvent({
			path: rowData.value.project_path,
			id: siteInfo.value.id,
		})
		getDirUserINI()
		return res
	} catch (error) {
		console.log(error)
		return { msg: '保存路径失败', status: false }
	}
}

/**
 * @description 获取项目信息
 */
export const getInfoEvent = async () => {
	try {
		const res = await getRunInfoEvent()
		if (res.status) {
			Object.assign(rowData.value, res.data)
			rowData.value['is_power_on'] = res.data['is_power_on'] === 1
			rowData.value['allPort'] = res.data['Listen']?.map((item: any) => item[1])?.join(', ')
		}
	} catch (error) {
		console.log(error)
		return { msg: '获取项目信息失败', status: false }
	}
}

/**
 * @description 获取php版本
 */
export const getPhpVersion = async () => {
	const res = await getPhpVersionList()
	//排除纯静态
	versionOptions.value = res.data.map((item: any) => ({ ...item, key: item.value, label: item.name, value: item.version })).filter((item: any) => item.name !== '纯静态')
	// 倒序排序
	versionOptions.value = versionOptions.value.reverse()
}

export const getUserList = async () => {
	try {
		const res = await getAsyncSystemUserList()
		if (res.status) {
			systemUserOptions.value = Array.isArray(res.data) ? res.data.map((item: any) => ({ label: item, value: item })) : []
		}
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 获取目录用户配置
 */
export const getDirUserINI = async () => {
	try {
		const params = {
			path: rowData.value.project_path,
			id: siteInfo.value.id,
		}
		const res: any = await getDirInIEvent(params)
		if (res.status) fileOptions.value = res.data.map((item: any) => ({ label: item, value: item }))
		return res
	} catch (error) {
		console.log(error)
		return { msg: '获取目录用户配置失败', status: false }
	}
}

/**
 * @description 一键放行端口
 * list: 选中的端口 需要外部传入
 */
export const releasePort = async (list: any) => {
	try {
		if (rowData?.value.Listen?.length > 1 && !releasePortPopup.value) {
			releasePortPopup.value = true
			return
		}
		let port = '',
			local: any = [],
			accept: any = [],
			arr: any = []
		if (releasePortPopup.value) {
			if (list.length === 0) {
				Message.error('最少选择一个端口进行放行')
				return false
			}
			arr = list
		} else {
			arr = rowData?.value.Listen
		}
		port = arr
			.map((item: any) => {
				if (item[0] === '127.0.0.1' || item[0] === 'localhost') local.push(item[1])
				else accept.push(item[1])
				return item[1]
			})
			.join(',')

		await useConfirm({
			icon: 'warning-filled',
			title: `放行端口`,
			content: `放行端口${accept.length ? ' [ ' + accept.join(',') + ' ] 后，当前端口将正常访问，' : ''}  ${local.length ? ' [ ' + local.join(',') + ' ] 为本地端口，只能本地访问，' : ''} 是否继续操作？`,
		})

		const params = {
			data: JSON.stringify({
				protocol: 'tcp',
				ports: port,
				choose: 'all',
				types: 'accept',
				brief: siteInfo.value.name + '项目放行端口',
				address: '',
				domain: '',
				source: '',
			}),
		}
		const res = await releasePortEvent(params)
		if (res.status && releasePortPopup.value) releasePortPopup.value = false
	} catch (error) {
		console.log(error)
		return { msg: '放行端口失败', status: false }
	}
}

export const submitAsyncConfig = async (params: any, validate: any) => {
	try {
		await validate()
		let param: any = {
			sitename: siteInfo.value.name,
			...params.value,
			is_power_on: rowData.value.is_power_on ? 1 : 0,
		}
		delete param.status
		delete param.ps

		const res = await submitAsyncConfigEvent(param)
		if (res.status) siteInfo.value.php_version = (param.php_version / 10).toFixed(1)
		getInfoEvent()
		return res.status
	} catch (error) {
		console.log(error)
		return { msg: '提交配置失败', status: false }
	}
}

export const initAsyncService = async () => {
	if (siteInfo.value.project_type === 'phpasync') {
		await getPhpVersion() // 获取php版本
		await getUserList() // 获取系统用户
		// 检查 rowData 是否已经有数据，避免重复请求
		// 如果 getPhpAsyncProjectInfo 已经被调用过，rowData 应该已经有数据了
		if (!rowData.value || !rowData.value.pid) {
			await getInfoEvent()
		}
		await getDirUserINI() // 获取目录用户配置
	}
}
