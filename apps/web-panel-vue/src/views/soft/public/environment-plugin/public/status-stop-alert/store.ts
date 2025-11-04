import { defineStore } from 'pinia'
import { getAlarmTaskList, setTaskStatus, setNewAlarmTask, upDateNewAlarmTask } from '@/api/global'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'
import { defaultVerify } from '@/utils/index'

const SOFT_STATUS_STOP_ALERT = defineStore('SOFT-STATUS-STOP-ALERT', () => {
	const compData = ref<any>({}) // 组件数据

	const isLoading = ref<boolean>(false) // 加载状态
	const status = ref<boolean>(false) // 告警状态
	const currentInfo = ref<any>() // 当前信息
	const name = ref<string>('') // 名称

	/**
	 * @description 打开设置
	 */
	const openPopupEvent = (config: any) => {
		if (currentInfo.value) {
			const { number_rule, task_data, sender, status } = currentInfo.value
			Object.assign(alertForm, {
				count: task_data.count || 1,
				interval: task_data.interval || 600,
				day_num: number_rule.day_num,
				sender,
				status,
			})
		}
		if (config.hasOwnProperty('onStatus')) {
			alertForm.status = config.onStatus
		}
		useDialog({
			title: '状态停止告警设置',
			area: 50,
			component: () => import('./config.vue'),
			btn: true,
			onCancel: () => {
				config.onCancel && config.onCancel()
			},
			onConfirm,
		})
	}

	/**
	 * @description 改变状态
	 */
	const changeStatusEvent = async (value: boolean) => {
		if (value) {
			openPopupEvent({
				onCancel: () => {
					status.value = !value
				},
				onStatus: value,
			})
		} else {
			await useDataHandle({
				loading: '正在设置状态，请稍后...',
				request: setTaskStatus({
					status: 0,
					task_id: currentInfo.value?.id,
				}),
				message: true,
				success: async (res: any) => {
					if (!res.status) status.value = !value
					if (res.status) {
						currentInfo.value.status = Boolean(status)
						alertForm.status = Boolean(status)
					}
				},
			})
		}
	}

	/**
	 * @description 获取告警信息
	 */
	const getPushData = async () => {
		await useDataHandle({
			loading: isLoading,
			request: getAlarmTaskList(),
			data: {
				data: Array,
				status: Boolean,
				msg: String,
			},
			success: (res: any) => {
				if (res.status) {
					currentInfo.value = res.data.find((item: any) => item.keyword === name.value)
					status.value = currentInfo.value?.status || false
				}
			},
		})
	}

	const alertFormRef = ref<any>() // 表单ref
	const alarmRef = ref<any>() // 告警方式ref
	const alertForm = reactive({
		status: true, // 停止告警
		count: 1, // 自动重启
		interval: 100, // 间隔时间
		day_num: 3, // 发送次数
		sender: [], // 告警方式
	}) // 表单数据
	const countOptions = [
		{
			label: '自动尝试重启项目',
			value: 1,
		},
		{
			label: '不做重启尝试',
			value: 2,
		},
	]
	const rules = reactive({
		interval: [
			defaultVerify({ message: '请输入间隔时间' }),
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value < 60 && !Number.isInteger(parseFloat(value))) {
						callback(new Error('间隔时间范围应为大于60的正整数'))
					} else {
						callback()
					}
				},
				trigger: ['blur', 'change'],
			},
		],
		day_num: [
			defaultVerify({ message: '请输入发送次数' }),
			{
				validator: (rule: any, value: any, callback: any) => {
					if (value < 0 && !Number.isInteger(parseFloat(value))) {
						callback(new Error('发送次数范围应为大于等于0的正整数'))
					} else {
						callback()
					}
				},
				trigger: ['blur', 'change'],
			},
		],
		sender: [defaultVerify({ message: '请选择告警方式' })],
	})

	const getParams = () => {
		const { status, count, interval, sender, day_num } = alertForm
		const taskData = {
			task_data: {
				type: 'services',
				project: name.value,
				status,
				tid: '5',
				cycle: 0,
				count: Number(count),
				interval: Number(interval),
				title: '服务停止告警',
			},
			sender,
			number_rule: {
				day_num: Number(day_num),
				total: 0,
			},
			time_rule: {
				time_range: [0, 86399],
				send_interval: 0,
			},
		}

		return {
			template_id: currentInfo.value?.template_id,
			status: status ? 1 : 0,
			task_data: JSON.stringify(taskData),
			task_id: currentInfo.value?.id || undefined,
			title: currentInfo.value?.title,
		}
	}

	const onConfirm = async (instance: any) => {
		await alertFormRef.value.validate()
		const params = getParams()

		await useDataHandle({
			loading: '正在设置状态，请稍后...',
			request: currentInfo.value?.template_id ? upDateNewAlarmTask(params) : setNewAlarmTask({ ...params, template_id: '5' }),
			message: true,
			success: (res: any) => {
				if (res.status) {
					init(compData.value)
					instance.unmount()
				}
			},
		})
	}

	/**
	 * @description 手动刷新
	 */
	const alarmRefreshEvent = async () => {
		await alarmRef.value?.refresh()
		Message.success('刷新成功')
	}

	const init = (data: any) => {
		if (data) compData.value = data
		name.value = compData.value.name
		if (compData.value.name === 'mysqld') name.value = 'mysql'
		getPushData()
	}

	return {
		isLoading,
		status,
		currentInfo,
		openPopupEvent,
		changeStatusEvent,
		alertFormRef,
		alarmRef,
		alertForm,
		rules,
		countOptions,
		alarmRefreshEvent,
		getPushData,
		init,
	}
})

export default SOFT_STATUS_STOP_ALERT
