import { Message, useConfirm, useDataHandle, useDataPage, useDialog } from '@/hooks/tools'
import { getScriptList, createScript, modifyScript, deleteScript as removeScript } from '@/api/node'
import { TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { useNodeScriptMassStore } from '@node/views/script-mass/useStore'
import { formatTime } from '@/utils'

export const tableParam = reactive<any>({
	p: 1,
	limit: 20,
	search: '',
	script_type: 'all' as 'all' | 'python' | 'shell', // 脚本类型
	group_id: '-1', // 分组id
}) // 响应式数据
export const scriptTableRef = ref() // 实例
export const tabLoading = ref(false) // tab加载中
export const total = ref(0) // 总条数
export const tableData = ref([]) // 表格数据
export const tableLoad = ref<boolean>(false) // 加载状态
export const scriptMenuData = ref<any>([]) // 脚本库数据

/**
 * @description 执行脚本任务
 */
const testScriptEvent = async (row: any, selectScriptFn: any) => {
	const { contentType, activeTabs } = useNodeScriptMassStore()
	contentType.value = 'bySelect'
	selectScriptFn(row.id)
	activeTabs.value = 'script-distribute'
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
 * @description 创建脚本
 */
export const openAddScriptView = (isEdit?: Boolean, row?: any, callback?: AnyFunction) => {
	$resetForm()
	// addScriptForm.script_type = tableParam.script_type
	if (isEdit) {
		const { id, name, content, description, script_type } = row
		Object.assign(addScriptForm, {
			name,
			id,
			script_type,
			content,
			description,
		})
	}
	useDialog({
		title: (isEdit ? '编辑' : '创建') + '脚本',
		area: 57,
		component: () => import('./add-script.vue'),
		onConfirm: async () => {
			const res = await onConfirmAddScript(!!isEdit, !!callback)
			if (res) {
				callback?.()
			}
			return res
		},
		showFooter: true,
	})
}

export const getTableColumns = () =>
	shallowRef<TableColumnProps[]>([
		useCheckbox(),
		{ label: '名称', prop: 'name' },
		{ label: '类型', prop: 'script_type' },
		{ label: '创建时间', render: (row: any) => formatTime(row.updated_at) },
		{ label: '备注', prop: 'description', showOverflowTooltip: true },
		useOperate([
			// {
			// 	onClick: (row: any) => testScriptEvent(row, fn),
			// 	title: '执行',
			// },
			{ onClick: (row: any) => openAddScriptView(true, row), title: '编辑' },
			{ onClick: deleteScriptEvent, title: '删除' },
		]),
	])

export const TableBatchOptions = [
	{
		label: '删除脚本',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps) => {
			const requestHandle = async (item: any) => await removeScript({ id: item.id })
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
	content: '',
	script_type: 'shell',
	description: '',
}) // 脚本库数据

export const helpList = [
	// { content: '当前仅支持Python和Shell脚本' },
	// { content: '请根据返回类型在脚本执行结束时输出符合预期的值' },
	// { content: '如果选择需要脚本参数，使用当前脚本时需传递一个参数，在脚本中的第一个参数中接收' },
	// {
	// 	content: 'Python 脚本需指定编码（如 #coding: utf-8）；Shell 脚本可以用 #!/bin/bash 或 #!/bin/sh 开头，未指定类型时默认按 Shell 脚本执行。',
	// },
] // 帮助列表

export const addScriptRules = reactive<any>({
	name: [{ required: true, message: '请输入脚本名称', trigger: 'blur' }],
	content: [{ required: true, message: '请输入脚本内容', trigger: 'blur' }],
})

const onConfirmAddScript = async (isEdit: boolean, callback?: boolean) => {
	await addScriptFormRef.value.validate()
	let params: any = { ...addScriptForm }
	if (!isEdit) delete params.id
	const requestFun = isEdit ? modifyScript : createScript
	const res: any = await useDataHandle({
		loading: `正在${isEdit ? '编辑' : '创建'}脚本，请稍后...`,
		request: requestFun(params),
		message: true,
		success: (res: any) => {
			if (res.status) {
				$resetForm()
			}
			if (callback !== true) getScriptData()
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
		content: '',
		script_type: 'shell',
		description: '',
		id: '',
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
