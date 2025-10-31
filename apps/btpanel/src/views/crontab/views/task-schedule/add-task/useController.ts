import { getTomorrowFormatted } from '@/views/crontab/useController'
import { isRefreshSchedule, rowData } from '../useController'
import { formatTime } from '@/utils'
import { createTrigger, modifyTrigger } from '@/api/crontab'
import { useDataHandle } from '@/hooks/tools'

export const scriptData = ref<any>([]) // 脚本库数据
export const alertFormRef = ref<any>() // 时间表单实例
export const scriptCascaderRef = ref<any>() // 脚本库实例
export const taskArrangementRef = ref() // 表单实例
export const formDataRef = ref() // 表单ref
export const cycleTime = ref(0) // 周期时间

export const timeRule = {
	where1: [
		{
			validator: (rule: any, value: string, callback: any) => {
				if (timeForm.type === 'day-n' || timeForm.type === 'month') {
					if (Number.parseInt(value) > 31 || Number.parseInt(value) < 1 || !Number.isInteger(parseFloat(value))) {
						callback(new Error('请输入1-31的整数'))
					} else if (value === '') {
						callback(new Error('请输入天数'))
					}
					callback()
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
	hour: [
		{
			validator: (rule: any, value: number, callback: any) => {
				if (timeForm.type === 'minute-n' || timeForm.type === 'hour' || timeForm.type === 'second-n') callback()
				if (value > 23 || value < 0 || !value) {
					callback(new Error('请输入0-23的整数'))
				} else if (timeForm.type === 'hour-n' && value === 0) {
					callback(new Error('小时不能为0'))
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
	minute: [
		{
			validator: (rule: any, value: number, callback: any) => {
				if (value > 59 || value < 0 || !value) {
					callback(new Error('请输入0-59的整数'))
				} else if (timeForm.type === 'minute-n' && (value < 1 || !value)) {
					// n分钟不能小于1
					callback(new Error('请输入1-59的整数'))
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
}

export const timeType = [
	{ type: 'day', text: '每天', showDay: false, showHour: true, showMinute: true },
	{ type: 'day-n', text: 'N天', showDay: true, showHour: true, showMinute: true },
	{ type: 'hour', text: '每小时', showDay: false, showHour: false, showMinute: true },
	{ type: 'hour-n', text: 'N小时', showDay: false, showHour: true, showMinute: true },
	{ type: 'minute-n', text: 'N分钟', showDay: false, showHour: false, showMinute: true },
	{ type: 'week', text: '每周', showDay: false, showHour: true, showMinute: true },
	{ type: 'month', text: '每月', showDay: true, showHour: true, showMinute: true },
	{ type: 'custom', text: '自定义', showDay: false, showHour: false, showMinute: false },
]

// ----------------------------------------------
// 添加脚本
// ----------------------------------------------
export const taskForm = reactive<any>({
	name: '',
	on: 'script',
	script_id: '',
	ps: '',
	args: '',
	script_body: '',
	crontab_expression: '',
	exec_count: 1,
	start_time: getTomorrowFormatted(),
}) // 响应式数据

// 时间表单
export const timeForm = reactive<any>({
	type: 'day',
	week: 1,
	where1: '1' as number | string,
	hour: 1,
	minute: 30,
})

export const argsForm = reactive<any>({
	is_args: '',
	args_holder: '',
	args_title: '',
}) // 响应式数据

/**
 * @description 禁用时间
 * @param time
 */
export const disabledDate = (time: any) => {
	return time.getTime() < Date.now() - 8.64e7
}

// 执行周期为自定义显示的温馨提示
export const helpList = computed(() => {
	if (timeForm.type === 'custom') {
		return [{ content: '设置了开始时间后，任务将在该时间点之后才开始执行' }, { content: '执行次数为0表示不限次数，每次修改执行次数后，计数将重新开始。' }, { content: '只支持标准的crontab表达式，不支持设置年份字段' }]
	}
	return [{ content: '设置了开始时间后，任务将在该时间点之后才开始执行' }, { content: '执行次数为0表示不限次数，每次修改执行次数后，计数将重新开始。' }]
})

export const rules = {
	name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
	args: [{ required: true, message: '请输入参数', trigger: 'blur' }],
	script_id: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (taskForm.on === 'script' && value === '') {
					callback(new Error('请选择脚本'))
				} else {
					callback()
				}
			},
			trigger: ['change'],
		},
	],
	exec_count: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (!/^[0-9]\d*$/.test(value) || value < 0) {
					callback(new Error('请输入大于等于0的整数'))
				} else {
					callback()
				}
			},
			trigger: ['change'],
		},
	],
	crontab_expression: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (timeForm.type === 'custom' && value === '') {
					callback(new Error('请输入crontab表达式'))
				} else {
					callback()
				}
			},
			trigger: ['change'],
		},
	],
} // 表单验证规则

/**
 * @description 切换脚本
 * @param val
 */

export const changeScript = (val: any) => {
	let data = scriptCascaderRef.value.getCheckedNodes()[0].data
	if (data.is_args === 1) {
		argsForm.is_args = true
		argsForm.args_holder = data.args_ps
		argsForm.args_title = data.args_title
	} else {
		argsForm.is_args = false
	}
}

/**
 *@description 切换脚本库和自定义脚本
 * @param val 选中的值
 */
export const changeScriptType = (val: any) => {
	if (val === '0') {
		taskForm.script_body = '' // 重置脚本内容
		argsForm.is_args = false
	}
	taskForm.script_id = '' // 重置脚本库
	taskForm.args = '' // 重置args表单
}

export const initAddTask = () => {
	if (rowData.value) {
		const { args_ps: args_holder, args_title } = rowData.value.script_info
		const { name, ps, script_id, args, script_body, crontab_expression, start_time, exec_count, cycle_type: type, cycle_hour: hour, cycle_minute: minute, cycle_where: where } = rowData.value
		let n_start_time = start_time == 0 ? '' : formatTime(Number(start_time), 'yyyy-MM-dd HH:mm:ss')
		Object.assign(taskForm, {
			name,
			ps,
			args,
			script_id,
			script_body,
			on: script_id === '0' || script_id === 0 || script_id == '' ? '0' : 'script',
			crontab_expression,
			start_time: n_start_time,
			exec_count: exec_count || 0,
		})
		Object.assign(timeForm, {
			type,
			hour,
			minute,
			week: type === 'week' ? Number(where) : 1,
			where1: where,
		})
		handleTypeChange(type)
		// 当args有值时，展示args表单
		if (rowData.value.args && rowData.value.script_info.is_args && script_body === '') {
			Object.assign(argsForm, {
				is_args: true,
				args_holder,
				args_title,
			})
		} else {
			argsForm.is_args = false
		}
	}
}

/**
 * @description 确认添加
 */
export const onConfirm = async (close: AnyFunction) => {
	try {
		await taskArrangementRef.value.validate()
		await alertFormRef.value.formDataRef.validate()
		const isScript = taskForm.on === 'script'
		const { type, hour, minute, week, where1 } = timeForm
		let params: any = {
			...taskForm,
			cycle_type: type,
			cycle_hour: hour,
			cycle_minute: minute,
			//  ['day-n', 'month'].includes(type) ? where1 : ''
			cycle_where: type === 'week' ? week : where1,
			operator_where: [],
			start_time: taskForm.start_time ? Date.parse(taskForm.start_time) / 1000 : '',
			script_id: isScript ? taskForm.script_id[1] : '',
			script_body: isScript ? '' : taskForm.script_body,
		}
		delete params.on
		const isEdit = rowData.value
		if (isEdit) {
			params.trigger_id = rowData.value.trigger_id
			params.script_id = isScript ? params.script_id || rowData.value.script_id : ''
		}

		const requestFun = isEdit ? modifyTrigger : createTrigger

		useDataHandle({
			loading: '正在添加任务，请稍后...',
			request: requestFun({ data: JSON.stringify(params) }),
			message: true,
			success: (res: any) => {
				if (res.status) {
					close()
					isRefreshSchedule.value = true
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 周期变化
 * @param val
 * @param isSelect
 */
export const handleTypeChange = (val: string, isSelect: boolean = false) => {
	timeForm.type = val
	// 查找当前选中的周期在配置中的索引
	cycleTime.value = timeType.findIndex((item: any) => item.type === val)

	// 特殊赋值情况
	if (timeForm.type === 'minute-n') timeForm.where1 = timeForm.minute
	if (timeForm.type === 'hour-n') timeForm.where1 = timeForm.hour
}

export const $reset_add_task = () => {
	rowData.value = {}
	timeForm.type = 'day'
	timeForm.where1 = '1'
	timeForm.hour = 1
	timeForm.minute = 30
	Object.assign(taskForm, {
		name: '',
		on: 'script',
		script_id: '',
		ps: '',
		args: '',
		script_body: '',
		crontab_expression: '',
		exec_count: 1,
		start_time: getTomorrowFormatted(),
	})
	Object.assign(argsForm, {
		is_args: '',
		args_holder: '',
		args_title: '',
	})
}
