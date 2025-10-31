import { getCrontabDataList } from '@/api/crontab'
import { FormGroup, FormInputAppend, FormInputPath, FormSelect, FormTextarea } from '@/hooks/tools/form/form-item'
import { fileSelectionDialog, openPluginView } from '@/public'
import { useGlobalStore } from '@/store/global'
import { fileSplitItem, validateNumber } from '../useController'
import CRONTAB_TASK_STORE from '../../useStore'

const { panel } = useGlobalStore()
const { backupPath } = toRefs(panel.value)
const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

const db_backup_path = ref(backupPath.value) // 备份路径
const orderOpt = ref([]) // 服务器列表

export const path = (form: any) => {
	if (typeInit.value) init(form)

	return [
		FormGroup([
			// 备份目录
			FormInputPath(
				'备份目录',
				'sName',
				{
					attrs: {
						disabled: isEdit.value,
						placeholder: '请输入备份目录',
						class: '!w-[30rem]',
						onInput: (val: string) => {
							form.value.name = `备份目录[${val}]`
						},
					},
					rules: [{ required: true, message: '请输入备份目录', trigger: 'blur' }],
				},
				() => !isEdit.value && openFilePath(form)
			),
			//
			FormSelect('备份到', 'backupTo', orderOpt.value, {
				labelAttrs: { class: 'el-small-label ml-8px' },
				attrs: { class: '!w-[16rem]' },
			}),
			//
			FormInputAppend('保留最新', 'save', '份', {
				labelAttrs: { class: 'el-small-label ml-8px' },
				attrs: { class: 'w-[14rem]' },
				rules: [
					{ required: true, message: '保留最新份数不可为空', trigger: 'blur' },
					{ validator: validateNumber, trigger: 'blur' },
				],
			}),
		]),
		//  文件拆分
		form.value.backupTo && form.value.backupTo !== 'localhost' ? fileSplitItem(form.value.sType) : null,
		FormTextarea('排除目录', 'sBody', {
			attrs: {
				rows: 10,
				resize: 'none',
				class: 'w-[60rem]',
				placeholder: `每行一条规则,目录不能以/结尾，\n 示例：data/config.php \n static/upload \n *.log,`,
			},
		}),
	]
}

/**
 * @description 打开文件选择框
 */
const openFilePath = (form: any) => {
	fileSelectionDialog({
		type: 'dir',
		path: form.value.sName,
		change: path => {
			form.value.sName = path
			form.value.name = `备份目录[${path}]`
		},
	})
}

/**
 * @description 获取网站列表
 */
const getOrderOpt = async (form: any) => {
	try {
		const { data: res } = await getCrontabDataList({ type: 'sites' })
		// orderOpt.value = res.orderOpt.map((item: any) => ({ label: item.name, value: item.value }))

		orderOpt.value = res.orderOpt.map((item: any) => ({
			label: item.name,
			value: item.value,
			status: Boolean(item.status),
			disabled: item.value !== 'localhost' && !item.status,
			render: (item: any) => {
				return (
					<div class="flex items-center justify-between">
						<span>{item.label}</span>
						<span
							onClick={() => {
								openPluginView({ name: item.value })
							}}
							class={`float-right cursor-pointer text-small text-danger ml-12px ${item.value !== 'localhost' ? '' : '!hidden'}`}>
							{item.status ? '' : '[未配置]'}
						</span>
					</div>
				)
			},
		}))

		// 添加服务器磁盘
		if (!orderOpt.value || orderOpt.value[0]?.value !== 'localhost') {
			orderOpt.value?.unshift({ label: '服务器磁盘', value: 'localhost' })
		}
		// 赋值初始化
		isAdd.value && (form.value.backupTo = orderOpt.value?.[0].value)
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化
 * @param form
 */
const init = (form: any) => {
	typeInit.value = false
	if (isAdd.value) {
		// 获取备份路径
		form.value.db_backup_path = db_backup_path.value
		// 初始化保存份数
		form.value.save = 3
		// 初始化路径
		form.value.sName = '/www/wwwroot'
		//
		form.value.name = '备份目录[/www/wwwroot]'
		form.value.more = 'ALL'
	}
	// 获取备份磁盘
	getOrderOpt(form)
}
