import { FormGroup, FormHelp, FormInputAppend, FormInputPath, FormItemCustom, FormSelect } from '@/hooks/tools/form/form-item'
import { fileSelectionDialog, openPluginView } from '@/public'
import { useGlobalStore } from '@/store/global'
import { fileSplitItem, validateNumber } from '../useController'
import { getCrontabDataList, getDatabases } from '@/api/crontab'
import { ElCheckbox } from 'element-plus'
import CRONTAB_TASK_STORE from '../../useStore'

const { panel } = useGlobalStore()
const { backupPath } = toRefs(panel.value)
const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())

const orderOpt = ref([]) // 服务器列表
const databaseList = ref([{ label: '所有[所有数据]', value: 'ALL' }]) // 数据库列表
const backAccout = ref(false) // 使用数据库对应账号备份
const tableList = ref([]) // 表列表
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

const databaseOptions = [
	{ value: 'mysql', label: 'MySQL' },
	{ value: 'mongodb', label: 'MongoDB' },
	{ value: 'redis', label: 'Redis' },
	{ value: 'pgsql', label: 'PgSQL' },
]

export const database = (form: any) => {
	if (typeInit.value) init(form)

	return [
		FormGroup([
			//
			FormSelect('数据库', 'db_type', databaseOptions, {
				attrs: {
					class: '!w-[9rem]',
					disabled: isEdit.value,
					onChange: (val: string) => {
						changeDbType(val)
						form.value.name = `备份${val}数据库[ 所有 ]`
						form.value.sName = 'ALL'
						form.value.table_list = 'ALL'
					},
				},
			}),
			//
			FormSelect('数据库', 'sName', databaseList.value, {
				labelAttrs: { class: 'el-small-label ml-8px' },
				attrs: {
					class: '!w-[16rem]',
					disabled: isEdit.value,
					onChange: (val: string) => {
						form.value.sName = val
						if (val === 'ALL') {
							form.value.name = `备份${form.value.db_type}数据库[ 所有 ]`
						} else {
							tableList.value = databaseList.value.find((item: any) => item.value === val)?.table_list?.map((item: any) => ({ label: item.tb_name, value: item.value === '' ? 'ALL' : item.value }))
							form.value.name = `备份${form.value.db_type}数据库[ ${val} ]`
						}
					},
				},
			}),
			FormSelect('', 'table_list', tableList.value, {
				attrs: {
					disabled: isEdit.value,
					class: '!w-[16rem] ml-8px' + (form.value.sName === 'ALL' || !tableList.value?.length || form.value.db_type !== 'mysql' ? ' !hidden' : ''),
					onChange: (val: string) => {
						form.value.name = `备份${form.value.db_type}数据库[ ${form.value.sName} - ${val} ]`
					},
				},
			}),
			//
			FormSelect('备份到', 'backupTo', orderOpt.value, {
				labelAttrs: { class: 'el-small-label ml-8px' },
				attrs: { class: '!w-[12rem]' },
			}),
			//
			FormInputAppend('保留最新', 'save', '份', {
				labelAttrs: { class: 'el-small-label ml-8px' },
				attrs: { class: 'w-[10rem]' },
				rules: [
					{ required: true, message: '保留最新份数不可为空', trigger: 'blur' },
					{ validator: validateNumber, trigger: 'blur' },
				],
			}),
		]),
		//
		form.value.backupTo && form.value.backupTo !== 'localhost' ? fileSplitItem(form.value.sType) : null,
		//
		FormInputPath(
			'备份路径',
			'db_backup_path',
			{
				attrs: { class: '!w-[42rem]' },
				rules: [{ required: true, message: '备份路径不可为空', trigger: 'blur' }],
			},
			() => openFilePath(form)
		),
		FormItemCustom(' ', () => {
			return (
				<div class="text-small text-secondary flex items-center h-full">
					<ElCheckbox
						class="!mr-[12px]"
						v-model={backAccout.value}
						onChange={() => {
							form.value.backup_mode = backAccout.value ? 1 : 0
						}}>
						使用数据库对应账号备份
					</ElCheckbox>
					<span class="text-tertiary text-small"> *注意：目前只支持mysql数据库的本地数据库备份 </span>
				</div>
			)
		}),
		FormHelp('温馨提示', [{ content: '远程数据库不支持备份表' }]),
	]
}

/**
 * @description 获取网站列表
 */
const getOrderOpt = async (form: any) => {
	try {
		const { data: res } = await getCrontabDataList({ type: 'sites' })
		// orderOpt.value = res.orderOpt.map((item: any) => ({ label: item.name, value: item.value, status: Boolean(item.status) }))

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
							class={`float-right text-small text-danger cursor-pointer ml-12px ${item.value !== 'localhost' ? '' : '!hidden'}`}>
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
		if (isAdd.value) form.value.backupTo = orderOpt.value?.[0].value
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化
 * @param form
 */
const init = async (form: any) => {
	typeInit.value = false
	// 获取备份磁盘
	getOrderOpt(form)
	if (isAdd.value) {
		form.value.name = '备份mysql数据库[ 所有 ]' // 初始化名称
		form.value.db_type = 'mysql' // 初始化数据库类型
		form.value.backup_mode = 0 // 初始化备份模式
		form.value.sName = 'ALL' // 初始化数据库
		form.value.db_backup_path = backupPath.value // 获取备份路径
		form.value.save = 3 // 初始化保存份数
		form.value.more = 'ALL'
		form.value.table_list = 'ALL'
		backAccout.value = false
		await changeDbType('mysql')
		// if (databaseList.value.length > 0) {
		// 	form.value.table_list = tableList.value[0].value
		// 	tableList.value = databaseList.value[0].table_list?.map((item: any) => ({ label: item.tb_name, value: item.value === '' ? 'ALL' : item.value }))
		// }
		form.value.table_list = tableList.value[0].value
	} else {
		if (form.value.db_type === 'mysql') {
			backAccout.value = !!rowData.value?.backup_mode
		}
		await changeDbType(form.value.db_type)
		// 编辑 复制
		// 表选择判断
		form.value.table_list === '' ? (form.value.table_list = 'ALL') : form.value.table_list
	}
}

/**
 * @description 切换数据库类型
 * @param val
 */
const changeDbType = async (val: any) => {
	try {
		// 请求当前数据库信息
		const d_res = await getDatabases({ db_type: val })
		databaseList.value = d_res.data.map((item: any) => ({ label: item.name + (item.ps ? `[${item.ps}]` : ''), value: item.name, table_list: item.table_list }))
		tableList.value = databaseList.value[0].table_list?.map((item: any) => ({ label: item.tb_name, value: item.value === '' ? 'ALL' : item.value }))
		databaseList.value?.unshift({ label: '所有[所有数据]', value: 'ALL' })
	} catch (error) {
		console.log(error)
	}
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
