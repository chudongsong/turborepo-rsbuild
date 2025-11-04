import { getCrontabDataList } from '@/api/crontab'
import { FormGroup, FormHelp, FormItemCustom, FormSelect } from '@/hooks/tools/form/form-item'
import { ElTimeSelect } from 'element-plus'
import CRONTAB_TASK_STORE from '../../useStore'

const siteList = ref([{ label: '所有[所有网站]', value: 'ALL' }]) // 网站列表
const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())

const startTime = ref('') // 开启时间
const stopTime = ref('') // 停止时间
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

// 不需要告警
export const siteRestart = (form: any) => {
	if (typeInit.value) init(form)

	return [
		// 网站
		FormSelect('网站', 'sName', siteList.value, {
			attrs: {
				class: '!w-[30rem]',
				disabled: isEdit.value,
				onChange: (val: string) => {
					form.value.name = '网站启停[' + (val === 'ALL' ? '所有' : val) + ']'
				},
			},
		}),
		// 操作
		FormGroup([
			FormItemCustom(
				'开启时间',
				() => {
					return (
						<ElTimeSelect
							prefix-icon="none"
							clearable
							placeholder="请选择开启时间"
							class="!w-22rem"
							v-model={startTime.value}
							onChange={(val: any) => {
								startTime.value = val
								form.value.startTime = val
								form.value.special_time = `${startTime.value},${stopTime.value}`
							}}
							start="00:00"
							step="00:05"
							end="23:59"></ElTimeSelect>
					)
				},
				'startTime',
				{
					rules: [{ required: true, message: '请选择开启时间', trigger: 'change' }],
				}
			),
			FormItemCustom(
				'停止时间',
				() => {
					return (
						<ElTimeSelect
							prefix-icon="none"
							clearable
							placeholder="请选择停止时间"
							class="!w-22rem"
							v-model={stopTime.value}
							onChange={(val: any) => {
								stopTime.value = val
								form.value.stopTime = val
								form.value.special_time = `${startTime.value},${stopTime.value}`
							}}
							start="00:00"
							step="00:05"
							end="23:59"></ElTimeSelect>
					)
				},
				'stopTime',
				{
					rules: [{ required: true, message: '请选择停止时间', trigger: 'change' }],
				}
			),
		]),
		// 任务描述
		FormHelp('温馨提示', [{ content: '执行周期为每天一次' }]),
	]
}

/**
 * @description 获取网站列表
 */
const getSiteList = async (form: any) => {
	try {
		const { data: res } = await getCrontabDataList({ type: 'sites' })
		siteList.value = [{ label: '所有[所有网站]', value: 'ALL' }].concat(res.data.map(item => ({ label: item.name + `[${item.ps}]`, value: item.name }))) || []
		// 赋值初始化
		isAdd.value && (form.value.sName = 'ALL')
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化
 */
const init = (form: any) => {
	stopTime.value = ''
	startTime.value = ''
	typeInit.value = false
	!isEdit.value && getSiteList(form)
	// 初始化名称
	isAdd.value && (form.value.name = '网站启停[所有]')
	if (!isAdd.value) {
		startTime.value = form.value.special_time.split(',')[0]
		stopTime.value = form.value.special_time.split(',')[1]
		form.value.startTime = startTime.value
		form.value.stopTime = stopTime.value
	}
}
