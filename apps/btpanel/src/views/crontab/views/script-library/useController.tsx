import { useGlobalStore } from '@/store/global'
import CRONTAB_STORE from '../../useStore'
import { Message, useConfirm, useDataHandle, useDataPage, useDialog } from '@/hooks/tools'
import { createScript, getScriptList, getScriptLogs, modifyScript, removeScript, testScript } from '@/api/crontab'
import { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { formatTime } from '@/utils'
import { getScripDataEvent } from '../../useController'

const { mainHeight } = useGlobalStore()
const crontabStore = CRONTAB_STORE()
const { logCompData } = storeToRefs(crontabStore)

export const tableParam = reactive<any>({
	p: 1,
	rows: 20,
	search: '',
	type_id: '',
}) // 响应式数据
export const scriptTableRef = ref() // 实例
export const tabLoading = ref(false) // tab加载中
export const total = ref(0) // 总条数
export const tableData = ref([]) // 表格数据
export const tableLoad = ref<boolean>(false) // 加载状态
export const scriptMenuData = ref<any>([]) // 脚本库数据

/**
 * @description 执行脚本任务前置判断
 */
const executionEvent = async (row: any, isArgs: boolean) => {
	const { is_args, args_title, name, args_ps, script_id } = row
	Object.assign(argsForm, {
		script_id,
		name,
		form: {
			args: '',
			placeholder: name === '端口检测' ? '127.0.0.1:433' : args_ps,
		},
		title: args_title,
	})
	if (is_args) {
		useDialog({
			title: '执行脚本参数',
			component: () => import('./execute-setting/index.vue'),
			showFooter: true,
			area: 42,
			onConfirm: async () => {
				await argsFormRef.value.validate()
				return testScriptEvent()
			},
		})
		return
	} else {
		testScriptEvent()
	}
}

/**
 * @description 执行脚本任务
 */
const testScriptEvent = async () => {
	const { name, script_id, form } = argsForm
	const params = {
		script_id,
		args: form.args,
	}
	await useConfirm({
		title: '执行脚本',
		icon: 'warning-filled',
		content: `立即执行【${name}】脚本任务，执行过程可能等待时间较长，请耐心等待。是否继续？`,
	})
	const loading = Message.load('正在执行脚本,请稍后...')
	try {
		const { data: res } = await testScript({ data: JSON.stringify(params) })
		loading.close()
		if (res.status) {
			$resetForm()
		}
		useDialog({
			title: '执行结果',
			area: [60, 40],
			component: {
				render(h: any) {
					return <pre class="h-full w-full bg-darkPrimary !overflow-auto whitespace-pre-line text-white break-all p-12px">{res.msg}</pre>
				},
			},
		})
		return res.status
	} catch (error) {
		loading.close()
		console.log(error)
		return false
	}
}

/**
 * @description 查看日志
 * @param row
 */
const openLogEvent = (row: any) => {
	logCompData.value = {
		request: getScriptLogs,
		data: { script_id: row.script_id },
	}
	useDialog({
		title: '执行日志',
		area: 86,
		compData: { request: getScriptLogs, data: { script_id: row.script_id } },
		component: () => import('@/views/crontab/public/action-logs/index.vue'),
	})
}

/**
 * @description 删除脚本
 * @param row
 */
const deleteScriptEvent = async (row: any) => {
	await useConfirm({
		title: '删除脚本',
		icon: 'warning-filled',
		content: `删除后脚本信息不可恢复,是否继续操作？`,
	})

	await useDataHandle({
		loading: '正在删除脚本,请稍后...',
		request: removeScript(row),
		message: true,
		success: getScriptData,
	})
}

/**
 * @description 获取脚本库数据
 */
export const getScriptTabData = async () => {
	const res = await getScripDataEvent()
	scriptMenuData.value = res
	if (scriptMenuData.value.length) tableParam.type_id = String(scriptMenuData.value[0].type_id)
}

/**
 * @description 获取脚本列表
 */
export const getScriptData = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getScriptList(tableParam),
		data: { data: [Array, tableData], page: useDataPage(total) },
	})
}

/**
 * @description 切换tab
 */
export const handleChangeTab = (val: any) => {
	tableParam.type_id = val.props.name
	getScriptData()
}

/**
 * @description 创建脚本
 */
export const openAddScriptView = (isEdit?: Boolean, row?: any) => {
	$resetForm()
	addScriptForm.type_id = tableParam.type_id
	if (isEdit) {
		const { script_id, name, return_type, is_args, ps, script, args_title, args_ps, type_id } = row
		Object.assign(addScriptForm, {
			name,
			return_type,
			is_args: String(is_args),
			ps,
			script,
			type_id,
			script_id,
		})
		if (is_args == '1') {
			Object.assign(addArgsForm, {
				args_title,
				args_ps,
			})
		}
	}
	useDialog({
		title: (isEdit ? '编辑' : '创建') + '脚本',
		area: 57,
		component: () => import('./add-script/index.vue'),
		onConfirm: () => {
			return onConfirmAddScript(!!isEdit)
		},
		showFooter: true,
	})
}

export const tableColumns = shallowRef<TableColumnProps[]>([
	useCheckbox({ key: 'script_id' }),
	{ label: '名称', prop: 'name' },
	{ label: '类型', prop: 'script_type' },
	{ label: '返回类型', prop: 'return_type' },
	{ label: '备注', prop: 'ps', showOverflowTooltip: true },
	{ label: '创建时间', render: (row: any) => formatTime(row.create_time) },
	{
		label: '上次执行时间',
		render: (row: any) => {
			// 判定last_exec_time是否为数组，如果是数组展示'--'
			if (Array.isArray(row.last_exec_time)) return '--'
			return formatTime(row.last_exec_time)
		},
	},
	useOperate([
		{
			onClick: (row: any) => executionEvent(row, false),
			title: '执行',
		},
		{ onClick: (row: any) => openAddScriptView(true, row), title: '编辑' },
		{ onClick: openLogEvent, title: '日志' },
		{ onClick: deleteScriptEvent, title: '删除' },
	]),
])

export const TableBatchOptions = [
	{
		label: '删除脚本',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
			const requestHandle = async (item: any) => await removeScript({ script_id: item.script_id })
			await batchConfirm({
				title: `批量删除`,
				content: `即将删除所选中的数据，是否继续操作?`,
				column: [{ prop: 'name', label: '脚本名称' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
				onConfirm: async () => {
					await nextAll(requestHandle)
					getScriptData()
					return false
				},
			})
		},
	},
]

export const argsFormRef = ref()
export const argsForm = reactive({
	title: '脚本参数',
	form: {
		args: '',
		placeholder: '请输入脚本参数',
	},
	name: '',
	script_id: '',
})

export const rules = {
	args: [
		{ required: true, message: '请输入脚本参数', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				if (argsForm.name === '端口检测') {
					// IP:端口
					const reg = /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/
					if (!reg.test(value)) {
						callback(new Error('请输入正确的IP:端口格式'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
		},
	],
}

export const addScriptFormRef = ref<any>() // 表单ref
export const addArgsForm = reactive<any>({
	args_title: '',
	args_ps: '',
}) // 脚本参数
export const addScriptForm = reactive<any>({
	name: '',
	return_type: 'string',
	is_args: '0',
	ps: '',
	script: '',
	type_id: '',
	script_id: '',
}) // 脚本库数据

export const helpList = [
	{ content: '当前仅支持Python和Shell脚本' },
	{ content: '请根据返回类型在脚本执行结束时输出符合预期的值' },
	{ content: '如果选择需要脚本参数，使用当前脚本时需传递一个参数，在脚本中的第一个参数中接收' },
	{
		content: 'Python 脚本需指定编码（如 #coding: utf-8）；Shell 脚本可以用 #!/bin/bash 或 #!/bin/sh 开头，未指定类型时默认按 Shell 脚本执行。',
	},
] // 帮助列表

export const addScriptRules = reactive<any>({
	name: [{ required: true, message: '请输入脚本名称', trigger: 'blur' }],
	script: [{ required: true, message: '请输入脚本内容', trigger: 'blur' }],
})

const onConfirmAddScript = async (isEdit: boolean) => {
	await addScriptFormRef.value.validate()
	let params: any = { ...addScriptForm }
	// 如果需要脚本参数，就把参数加入到请求参数中
	if (addScriptForm.is_args == '1') {
		params = { ...addScriptForm, ...addArgsForm }
	}
	if (!isEdit) delete params.type_id
	params = { data: JSON.stringify(params) }
	const requestFun = isEdit ? modifyScript : createScript
	const res: any = await useDataHandle({
		loading: `正在${isEdit ? '编辑' : '创建'}脚本，请稍后...`,
		request: requestFun(params),
		message: true,
		success: (res: any) => {
			if (res.status) {
				$resetForm()
			}
			getScriptData()
		},
	})
	return res.status
}

/**
 * @description 重置表单
 */
const $resetForm = () => {
	Object.assign(addScriptForm, {
		name: '',
		return_type: 'string',
		is_args: '0',
		ps: '',
		script: '',
		type_id: '',
		script_id: '',
	})
	Object.assign(addArgsForm, {
		args_title: '',
		args_ps: '',
	})
	Object.assign(argsForm, {
		title: '脚本参数',
		form: {
			args: '',
			placeholder: '请输入脚本参数',
		},
		name: '',
		script_id: '',
	})
}

/**
 * @description 重置数据
 */
export const $reset = () => {
	tableData.value = []
	scriptMenuData.value = []
}
