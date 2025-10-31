import { getZone } from '@/api/crontab'
import { FormHelp, FormItemCustom } from '@/hooks/tools/form/form-item'
import { ElCascader } from 'element-plus'
import CRONTAB_TASK_STORE from '../../useStore'

const { rowData, typeInit } = storeToRefs(CRONTAB_TASK_STORE())

const zoneList = ref<any>([]) // 时区列表
const timeValue = ref<any>([]) // 时间值
const isEdit = computed(() => !!rowData.value.id) // 是否编辑
const isAdd = computed(() => !rowData.value.id && !rowData.value) // 是否新增

export const syncTime = (form: any) => {
	if (typeInit.value) initTime(form)

	return [
		// 时区选择
		FormItemCustom('时区选择', () => (
			<ElCascader
				class="w-[32rem]"
				options={zoneList.value}
				modelValue={timeValue.value}
				props={{ expandTrigger: 'hover' }}
				onChange={(val: any) => {
					form.value.name = `定期同步服务器时间[${val[0]}/${val[1]}]`
					form.value.sName = `${val[0]}/${val[1]}`
					timeValue.value = [val[0], val[1]] // 存储中间值

					form.value.region = val[0]
					form.value.zone = val[1]
				}}></ElCascader>
		)),
		FormHelp('温馨提示', [{ content: '默认从NTP服务器同步时间，失败时将同步bt.cn的服务器时间。' }]),
	] as any[]
}

/**
 * @description 获取时区
 */
const getZoneList = async (form: any) => {
	try {
		const res = await getZone()
		// 转换格式
		zoneList.value = Object.keys(res.data).map((key: any) => ({
			value: key,
			label: key,
			children: res.data[key].map((item: any) => ({
				value: item,
				label: item,
			})),
		}))
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 初始化时间
 * @param form
 */
const initTime = (form: any) => {
	try {
		typeInit.value = false
		if (isAdd.value) {
			form.value.name = '定期同步服务器时间[Asia/Shangehai]'
			form.value.sName = `Asia/Shanghai`
			timeValue.value = ['Asia', 'Shanghai'] // 显示值
		} else {
			timeValue.value = form.value.sName.split('/')
		}
		getZoneList(form)
	} catch (error) {
		console.log(error)
	}
}
