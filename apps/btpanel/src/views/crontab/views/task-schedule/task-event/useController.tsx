import { createOperatorWhere, getOperatorLogs, getOperatorWhereList, modifyOperatorWhere, removeOperatorWhere } from '@/api/crontab'
import { useConfirm, useDataHandle, useDialog, useMessage } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import CRONTAB_STORE from '@/views/crontab/useStore'
import { rowData } from '../useController'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { getScripDataEvent } from '@/views/crontab/useController'

const crontabStore = CRONTAB_STORE()
const { logCompData } = storeToRefs(crontabStore)

const Message = useMessage()

const eventRowData = ref() // 表格行数据
export const eventData = ref([]) // 响应式数据
export const eventLoad = ref(false) // 加载状态

/**
 * @description 查看日志
 */
const openLogEvent = (row: any) => {
	logCompData.value = { request: getOperatorLogs, data: { where_id: row.where_id } }
	useDialog({
		title: '执行日志',
		area: 86,
		compData: { request: getOperatorLogs, data: { where_id: row.where_id } },
		component: () => import('@/views/crontab/public/action-logs/index.vue'),
	})
}

/**
 * @description 删除数据
 */
const deleteDataEvent = async ({ where_id }: any) => {
	await useConfirm({
		title: '删除触发事件',
		icon: 'warning-filled',
		content: `删除后不再触发事件规则,是否继续操作？`,
	})

	await useDataHandle({
		loading: '正在删除，请稍后...',
		request: removeOperatorWhere({ where_id }),
		message: true,
		success: getTaskEventList,
	})
}

/**
 * @description 获取任务事件列表
 */
export const getTaskEventList = async () => {
	await useDataHandle({
		loading: eventLoad,
		request: getOperatorWhereList({ trigger_id: rowData.value.trigger_id }),
		data: [Array, eventData],
	})
}

/**
 * @description 添加任务事件
 */
export const openAddEventView = (isEdit?: boolean, row?: any) => {
	$reset_event_form()
	if (isEdit) eventRowData.value = row
	useDialog({
		title: `${isEdit ? '编辑' : '创建'}触发事件`,
		area: 60,
		showFooter: true,
		component: () => import('./add-event.vue'),
	})
}

export const tableColumns = shallowRef<TableColumnProps[]>([
	{
		label: '触发内容',
		render: (row: any) => {
			let data: any = {
				in: '包含',
				'not in': '不包含',
				'=': '等于',
				'!=': '不等于',
				'>': '大于',
				'>=': '大于等于',
				'<': '小于',
				'<=': '小于等于',
			}
			return h('span', `当执行结果【${data[row.operator]}】【${row.op_value}】时，执行【${row.script_info.name}】`)
		},
	},
	useOperate([
		{ onClick: (row: any) => openAddEventView(true, row), title: '编辑' },
		{ onClick: openLogEvent, title: '日志' },
		{ onClick: deleteDataEvent, title: '删除' },
	]),
])

export const scriptSectionRef = ref<any>() // 脚本库ref
export const scriptLibraryData = ref<any>([]) // 脚本库数据
export const taskEventRef = ref<any>() // 表单ref
const operatorValue = shallowRef<string[] | number[]>([]) // 操作符

export const taskEventForm = reactive({
	on: 'script',
	run_script_id: '',
	operator: 'in',
	op_value: '',
	run_script: '',
	trigger_id: rowData.value.trigger_id,
	args: '',
})

export const argsForm = reactive<any>({
	is_args: '',
	args_holder: '',
	args_title: '',
}) // 响应式数据

export const rules = {
	op_value: [{ required: true, message: '请输入比较值', trigger: 'blur' }],
	args: [{ required: true, message: '请输入参数', trigger: 'blur' }],
	run_script_id: [{ required: true, message: '请选择脚本', trigger: 'change' }],
}

/**
 * @description 创建事件
 */
export const onConfirm = async (close: AnyFunction) => {
	await taskEventRef.value.validate()
	if (taskEventForm.run_script_id.length === 0) {
		Message.error('请选择脚本')
		return
	}
	const params: any = {
		...taskEventForm,
		run_script_id: taskEventForm.run_script_id[1] || taskEventForm.run_script_id[0][1],
	}
	delete params.on
	const isEdit = eventRowData.value?.where_id
	if (isEdit) {
		delete params.trigger_id
		params.where_id = eventRowData.value.where_id
	}
	// 告警允许多选
	if (operatorValue.value.length > 0) {
		params.actions = operatorValue.value.join(',')
		params.run_script_id = ''
	}
	await useDataHandle({
		loading: '正在提交，请稍后...',
		message: true,
		request: isEdit ? modifyOperatorWhere(params) : createOperatorWhere(params),
	})
	close()
	getTaskEventList() // 刷新列表
}

/**
 * @description 切换脚本
 * @param val
 */
export const changeScript = (val: any) => {
	if (val.length === 0) return
	const data = scriptSectionRef.value.getCheckedNodes()[0].data
	if (data.is_args === 1) {
		argsForm.is_args = true
		argsForm.args_holder = data.args_ps
		argsForm.args_title = data.args_title
	} else {
		argsForm.is_args = false
	}
	// 告警允许多选
	const newData = scriptSectionRef.value.getCheckedNodes()
	const isAllAlarm = newData.every((item: any) => item.data.type_id === 3)
	const newSelect = newData.find((item: any) => item.value === val[val.length - 1][1])
	if (newSelect.data.type_id === 3 && isAllAlarm) {
		// 最新选中的是告警，且所有选中的都是告警,则在原值上追加
		taskEventForm.run_script_id = val
		operatorValue.value = val.map((item: any) => item[1])
	} else {
		// 最新选中的不是告警，或者不是所有选中的都是告警，则直接赋值
		taskEventForm.run_script_id = val[val.length - 1]
		if (newSelect.data.type_id === 3) {
			// 最新选中的是告警
			operatorValue.value = [newSelect.data.type_id as number]
		} else {
			// 最新选中的不是告警
			operatorValue.value = []
		}
	}
}

/**
 * @description 获取脚本库数据
 */
const getScriptType = async () => (scriptLibraryData.value = await getScripDataEvent())

export const setLabelClick = (val: boolean) => {
	if (val) {
		setTimeout(() => {
			setCascaderDomEvent()
		}, 200)
	}
}

const currentLevel = shallowRef(1)

// 点击标签选中
export const expandChange = (e: any) => {
	currentLevel.value = e.length
	setTimeout(() => {
		setCascaderDomEvent()
	}, 200)
}

export const setCascaderDomEvent = () => {
	let cascaderDom = document.querySelectorAll('.task-cascader .el-cascader-menu__list')
	if (cascaderDom.length >= currentLevel.value - 1) {
		let optionDom = cascaderDom[currentLevel.value]
		if (!optionDom) return
		optionDom.querySelectorAll('.el-cascader-node__label').forEach(label => {
			let nextDom = label.nextElementSibling
			if (!nextDom) {
				label.addEventListener('click', cascaderCheckEvent)
			}
		})
	}
}
const cascaderCheckEvent = (e: any) => {
	let brother = e.target.previousElementSibling
	const input = brother.querySelector('input[type="checkbox"]')
	if (input) input.click() // 模拟点击复选框
}

export const initAddEvent = () => {
	getScriptType()
	if (eventRowData.value?.trigger_id) {
		const { operator, op_value, trigger_id, run_script_id, args, run_script } = eventRowData.value
		Object.assign(taskEventForm, {
			operator,
			op_value,
			trigger_id,
			run_script_id: [undefined, run_script_id], // 级联选中值
			args,
			run_script,
		})
		if (eventRowData.value.actions) {
			const arr = eventRowData.value.actions.split(',')
			operatorValue.value = arr
			taskEventForm.run_script_id = arr.map((item: any) => [undefined, Number(item)])
		}
		if (op_value) {
			const { args_ps, args_title, is_args } = eventRowData.value.script_info
			argsForm.args_holder = args_ps
			argsForm.args_title = args_title
			argsForm.is_args = is_args ? true : false
		}
	}
}

export const $reset = () => {
	eventData.value = []
	eventLoad.value = false
	rowData.value = {}
	eventRowData.value = {}
}

export const $reset_event_form = () => {
	eventRowData.value = {}
	Object.assign(taskEventForm, {
		on: 'script',
		run_script_id: '',
		operator: 'in',
		op_value: '',
		run_script: '',
		trigger_id: rowData.value.trigger_id,
		args: '',
	})
	argsForm.is_args = ''
}
