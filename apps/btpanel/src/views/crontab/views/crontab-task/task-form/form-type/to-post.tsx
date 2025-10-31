import { FormInput, FormTextarea } from '@/hooks/tools/form/form-item'
import CRONTAB_TASK_STORE from '../../useStore'

export const postParam = ref([{ paramName: '', paramValue: '' }])

const { rowData } = storeToRefs(CRONTAB_TASK_STORE())
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

export const toPost = (form: any) => {
	// 初始化名称
	if (isAdd.value) {
		form.value.name = `访问URL-POST[ http:// ]`
		form.value.urladdress = 'http://'
	}

	return [
		// 脚本内容
		FormInput('URL地址', 'urladdress', {
			attrs: {
				placeholder: '请输入URL地址',
				class: '!w-[30rem]',
				onInput: (val: any) => {
					form.value.name = `访问URL-POST[ ${val} ]`
				},
			},
			rules: [
				{ required: true, message: 'URL地址不可为空', trigger: ['blur', 'input'] },
				{
					validator: (rule: any, value: any, callback: any) => {
						if (value === 'http://' || value === 'https://') {
							callback(new Error('输入内容不可为空'))
						} else {
							callback()
						}
					},
					trigger: ['blur', 'input'],
				},
			],
		}),
		FormTextarea('User-Agent', 'user_agent', {
			attrs: {
				placeholder: '请输入User-Agent',
				class: 'w-[60rem]',
			},
		}),
	] as any[]
}

/**
 * @description 处理表格行样式
 */
export const rowClassName = (data: { row: any; rowIndex: number }) => {
	data.row.xh = data.rowIndex + 1
}

export const paramTableRef = ref()

/**
 * @description 选中参数
 * @param selection
 */
export const handleDetailSelectionChange = (selection: any) => {
	if (selection.length > 1) {
		paramTableRef.value?.clearSelection()
		paramTableRef.value?.toggleRowSelection(selection.pop())
	}
}

/**
 * @description 添加post参数
 */
export const addParam = () => {
	postParam.value.push({
		paramName: '',
		paramValue: '',
	})
}

/**
 * @description 删除post参数
 * @param row
 * @param index
 */
export const deleteParam = (row: any, index: number) => {
	postParam.value.splice(index, 1)
}
