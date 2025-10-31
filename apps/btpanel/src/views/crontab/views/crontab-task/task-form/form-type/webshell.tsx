import { getCrontabDataList } from '@/api/crontab'
import { FormSelect } from '@/hooks/tools/form/form-item'
import { FormAlarmOldSelect } from '@/public'
import CRONTAB_TASK_STORE from '../../useStore'

const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())
const siteList = ref([{ label: '全部', value: 'ALL' }]) // 网站列表
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增
// 是否为复制状态
const isCopy = computed(() => rowData.value && !rowData.value.id)

export const webshell = (form: any) => {
	if (typeInit.value) init(form)
	return [
		FormSelect('查杀站点', 'sName', siteList.value, {
			attrs: {
				class: '!w-[300px]',
				disabled: isEdit.value,
				onChange: (val: string) => {
					form.value.name = '木马查杀[' + (val === 'ALL' ? '全部' : val) + ']'
				},
			},
		}),
		FormAlarmOldSelect('消息通道', 'urladdress', {
			attrs: {
				placeholder: '请选择消息通道',
				isShowApi: false,
				isDefault: true,
				isShowAll: false,
				limit: ['sms'],
				multiple: false,
				class: '!w-[300px]',
			},
		}),
	]
}

/**
 * @description 获取网站列表
 */
const getSiteList = async (form: any) => {
	try {
		const { data: res } = await getCrontabDataList({ type: 'sites' })
		siteList.value = [{ label: '全部', value: 'ALL' }].concat(res.data.map(item => ({ label: item.name, value: item.name }))) || []
		// 赋值初始化
		form.value.sName = 'ALL'
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化
 */
const init = (form: any) => {
	!isEdit.value && getSiteList(form)
	typeInit.value = false
	// 初始化名称
	isAdd.value && (form.value.name = '木马查杀[全部]')
}
