import { getCrontabDataList } from '@/api/crontab'
import { FormGroup, FormInputAppend, FormInputPath, FormSelect, FormTextarea } from '@/hooks/tools/form/form-item'
import { useGlobalStore } from '@/store/global'
import { fileSplitForm, fileSplitItem, validateNumber } from '../useController'
import { fileSelectionDialog, openPluginView } from '@/public'

import CRONTAB_TASK_STORE from '../../useStore'

const { panel } = useGlobalStore()
const { backupPath } = toRefs(panel.value)
const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())

const orderOpt = ref([]) // 服务器列表
const siteList = ref([{ label: '所有[所有网站]', value: 'ALL' }]) // 网站列表

const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

export const site = (form: any) => {
	if (typeInit.value) init(form)

	return [
		FormGroup([
			// 备份网站
			FormSelect('备份网站', 'sName', siteList.value, {
				attrs: {
					placeholder: '请选择备份网站',
					class: '!w-[30rem]',
					disabled: isEdit.value,
					onChange: (val: string) => {
						form.value.name = `备份网站[ ${val === 'ALL' ? '所有' : val} ]`
					},
				},
			}),
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
		// 当备份为云存储+不保留本地备份时，不显示备份路径
		isShowBackPath(form) &&
			FormInputPath(
				'备份路径',
				'db_backup_path',
				{
					attrs: { placeholder: '请输入备份路径', class: '!w-[30rem]' },
					rules: [{ required: true, message: '备份路径不可为空', trigger: 'blur' }],
				},
				() => openFilePath(form)
			),
		FormTextarea('排除规则', 'sBody', {
			attrs: {
				rows: 10,
				resize: 'none',
				class: 'w-[60rem]',
				placeholder: `每行一条规则,目录不能以/结尾，\n 示例：data/config.php \n static/upload \n *.log,`,
			},
			// rules: [{ required: false, message: '11111', trigger: 'blur' }],
		}),
	]
}

/**
 * @description 获取网站列表
 */
const getOrderOpt = async (form: any) => {
	try {
		const { data: res } = await getCrontabDataList({ type: 'sites' })

		// 初始化赋值备份到
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

		if (isAdd.value) form.value.backupTo = orderOpt.value?.[0].value

		// 初始化赋值备份网站
		siteList.value = [{ label: '所有[所有网站]', value: 'ALL' }].concat(res.data.map((item: any) => ({ label: item.name + `${item.ps ? `[${item.ps}]` : ''}`, value: item.name }))) || []
		isAdd.value && (form.value.sName = 'ALL')
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 是否显示备份路径
 */
const isShowBackPath = (form: any) => {
	try {
		if (form.value.backupTo !== 'localhost' && !fileSplitForm.value.save_local) return false
		return true
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
		form.value.name = `备份网站[ 所有 ]`
		form.value.save = 3
		form.value.db_backup_path = backupPath.value
		form.value.more = 'ALL'
	} else {
		console.log('form', form.value)
	}

	getOrderOpt(form)
}

/**
 * @description 打开文件选择框
 */
const openFilePath = (form: any) => {
	fileSelectionDialog({
		type: 'dir',
		path: form.value.db_backup_path,
		change: path => {
			form.value.db_backup_path = path
		},
	})
}
