import { getCrontabDataList, getEnterpriseDatabase } from '@/api/crontab'
import { FormGroup, FormHelp, FormInputPaw, FormSelect } from '@/hooks/tools/form/form-item'
import { fileSplitItem } from '../useController'
import { getRandomChart } from '@/utils'
import CRONTAB_TASK_STORE from '../../useStore'
import { openPluginView } from '@/public'

const orderOpt = ref([]) // 服务器列表
const databaseList = ref([]) // 数据库列表
const tableList = ref([]) // 表列表

const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isCopy = computed(() => !rowData.value.id && rowData.value) // 是否复制
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

export const enterpriseBackup = (form: any) => {
	if (typeInit.value) init(form)

	return [
		FormGroup([
			FormSelect('备份数据库', 'db_name', databaseList.value, {
				attrs: {
					class: '!w-[20rem] mr-8px',
					disabled: isEdit.value,
					onChange: (val: string) => {
						form.value.tb_name = 'ALL'
						form.value.name = `[勿删]数据库增量备份[ ${val} - 所有 ]`
						tableList.value = databaseList.value.find((item: any) => item.value === val)?.table_list.map((item: any) => ({ label: item.tb_name, value: item.value === '' ? 'ALL' : item.value }))
					},
				},
			}),
			tableList.value &&
				FormSelect('', 'tb_name', tableList.value, {
					attrs: {
						disabled: isEdit.value,
						class: '!w-[20rem]',
						onChange: (val: string) => {
							const database = databaseList.value.find((item: any) => item.value === form.value.db_name)?.label
							form.value.name = `[勿删]数据库增量备份[ ${database} - ${val === 'ALL' ? '所有' : val} ]`
						},
					},
				}),
			FormSelect('备份到', 'backupTo', orderOpt.value, {
				labelAttrs: { class: 'el-small-label ml-8px' },
				attrs: { class: '!w-[16rem]' },
			}),
		]),
		form.value.backupTo && form.value.backupTo !== 'localhost' ? fileSplitItem(form.value.sType) : null,
		// 添加和复制时才显示压缩密码
		(isAdd.value || isCopy.value) &&
			FormInputPaw(
				'压缩密码',
				'zip_password',
				{
					attrs: {
						class: 'w-[32rem]',
						placeholder: '请输入压缩密码',
					},
				},
				() => {
					form.value.zip_password = getRandomChart(16)
				}
			),
		FormHelp('温馨提示', [{ content: '<span class="text-dangerDark">注意：请牢记压缩密码，以免因压缩密码导致无法恢复和下载数据</span>', isHtml: true }, { content: '【使用提醒】当前数据库暂不支持SQLServer、MongoDB、Redis、PgSQL备份' }]),
	]
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
		form.value.name = '[勿删]数据库增量备份[ --/-- ]'
		form.value.more = 'ALL'
	} else {
		// 数据库增量备份特殊情况赋值
		form.value.db_name = form.value.sName
		form.value.tb_name = form.value.sBody === '' ? 'ALL' : form.value.sBody
	}
	// 获取备份磁盘
	getOrderOpt(form)
	selectDatabase(form)
}

/**
 * @description 切换数据库类型
 * @param val
 */
const selectDatabase = async (form: any) => {
	try {
		// 请求当前数据库信息
		const { data: d_res } = await getEnterpriseDatabase()
		databaseList.value = d_res.data.map((item: any) => ({ label: item.name, value: item.name, table_list: item.table_list }))
		tableList.value = d_res.data[0].table_list?.map((item: any) => ({ label: item.tb_name, value: item.value === '' ? 'ALL' : item.value })) || [{ label: '所有', value: 'ALL' }]
		if (databaseList.value.length > 0 && isAdd.value) {
			form.value.db_name = databaseList.value[0]?.value
			form.value.tb_name = tableList.value[0]?.value
			form.value.name = `[勿删]数据库增量备份[ ${databaseList.value[0].label} - ${tableList.value[0]?.label} ]`
		} else if (!isEdit.value && !isAdd.value) {
			// 复制的情况下，输入框被取消禁用，需要对应赋值选项
			tableList.value = databaseList.value.find((item: any) => item.value === form.value.db_name)?.table_list?.map((item: any) => ({ label: item.tb_name, value: item.value === '' ? 'ALL' : item.value }))
		}
		console.log(tableList.value, 'tableList')
	} catch (error) {
		console.log(error)
	}
}
