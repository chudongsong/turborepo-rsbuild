<template>
	<el-form class="p-[20px]">
		<el-form-item label="任务类型">
			<AddSelect v-model="tid" :isEdit="compData.isEdit" :options="taskOptions" v-model:tag-options="tagOptions" @change="generateFields" />
			<span v-if="tid === 'site_push@8'" class="ml-10px text-small text-secondary"> * 当检测到新的版本时发送一次通知 </span>
		</el-form-item>
		<el-form-item v-if="currentTemplate?.description" label=" " class="!mt-[-1rem]">
			<div class="text-small text-secondary">{{ currentTemplate?.description }}</div>
		</el-form-item>
		<div v-for="item in fields" :key="tid + '_' + item.name + '_' + item.attr" class="block">
			<CommonItem v-for="field in item" :key="tid + '_' + field.name + '_' + field.attr" :value="field.value" :tid="tid" :data="field" :row="compData.row" :current-template="currentTemplate" @update:value="setValue"> </CommonItem>
		</div>

		<div class="mb-[1.6rem]">
			<el-form-item v-if="advanceShow.day_num" label="每日发送上限">
				<el-input v-model.number="form.day_num" type="number" text-type="次" class="!w-[15rem]">
					<template #append> 次 </template>
				</el-input>
			</el-form-item>
			<el-form-item v-if="advanceShow.total" label="总发送上限">
				<el-input v-model.number="form.total" type="number" text-type="次" class="!w-[15rem]">
					<template #append> 次 </template>
				</el-input>
			</el-form-item>
			<el-form-item v-if="advanceShow.send_interval" label="最小发送间隔">
				<el-input v-model.number="form.send_interval" text-type="秒" type="number" class="!w-[15rem]">
					<template #append> 秒 </template>
				</el-input>
			</el-form-item>
		</div>
		<el-form-item label="告警方式">
			<bt-alarm-select class="!w-[30rem]" v-model="form.method" :limit="limitType" />
		</el-form-item>
		<el-form-item class="!my-[1rem]" label=" ">
			<span class="bt-link" @click="showMore = !showMore">高级设置<span :class="showMore ? 'svgtofont-el-arrow-up' : 'svgtofont-el-arrow-down'"></span></span>
		</el-form-item>
		<div v-show="showMore">
			<el-form-item v-if="!advanceShow.day_num" label="每日发送上限">
				<el-input v-model.number="form.day_num" text-type="次" type="number" class="!w-[15rem]">
					<template #append> 次 </template>
				</el-input>
			</el-form-item>
			<el-form-item v-if="!advanceShow.total" label="总发送上限">
				<el-input v-model.number="form.total" text-type="次" type="number" class="!w-[15rem]">
					<template #append> 次 </template>
				</el-input>
			</el-form-item>
			<el-form-item v-if="!advanceShow.send_interval" label="最小发送间隔">
				<el-input v-model.number="form.send_interval" text-type="秒" type="number" class="!w-[15rem]">
					<template #append> 秒 </template>
				</el-input>
			</el-form-item>
			<el-form-item label="可发送时间范围">
				<div class="w-35rem">
					<el-time-picker v-model="form.time_range" is-range range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" placeholder="选择时间范围" />
				</div>
			</el-form-item>
		</div>
	</el-form>
</template>

<script lang="ts" setup>
import type { Field, TemplateMap } from '@config/types'

import { setNewAlarmTask } from '@/api/global'
import { Message, useDataHandle } from '@hooks/tools'
import { hasOwnProperty } from '@utils/index'
import { getTemplate } from '@/views/config/useMethod'

import CommonItem from './common-item.vue'
import AddSelect from './add-select.vue'

interface Props {
	compData: {
		isEdit: boolean
		row: any
		onRefresh?: () => Promise<void>
		diyProcessTemplate?: boolean
		diyProcessTemplateTid?: string[]
	}
}
interface EditParams {
	task_id?: string
	template_id: string
	task_data: string | any
}

const props = withDefaults(defineProps<Props>(), {})
const emit = defineEmits(['close']) // 关闭弹窗

const { compData } = toRefs(props)

const tid = ref('')
const devTemplate = ref<any>([]) // 获取模板
const fields = ref<Field[]>([])
const showMore = ref(false) // 展示更多
const types = ['dingding', 'mail', 'sms', 'wx_account', 'feishu', 'weixin']
const limitType = ref<any>([]) // 告警方式限制

const form = reactive<any>({
	method: [] as string[],
	send_interval: 0, // 发送最小间隔
	time_range: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 0)], // 时间范围
	day_num: 0, // 每日发送上限
	total: 0, // 总发送上限
})

const fieldRef = ref()

const mapFunction = (item: { tid: string; title: any; used: boolean; tags: any; can_create: boolean; is_pro: boolean; description: string }, index: number) => {
	if (index === 0) {
		tid.value = item.tid
		generateFields()
	}
	return {
		label: item.title,
		value: item.tid,
		used: item.used,
		tags: item.tags,
		can_create: item.can_create,
		is_pro: item.is_pro,
		description: item.description,
	}
}

const setValue = (data: any) => {
	fields.value = fields.value.map((fieldGroup: any) =>
		fieldGroup.map((item: any) => {
			if (item.attr === data.attr) {
				return { ...item, value: data.val }
			}
			return item
		})
	)
}

/**
 * @description 将对象拍平
 */
const flattenObject = (obj: any) => {
	let result: any = {}
	for (let key in obj) {
		if (typeof obj[key] === 'object' && obj[key] !== null) {
			// 如果当前值是对象，则递归调用flattenObject并将父键传递给函数
			let flattened = flattenObject(obj[key])
			result = { ...result, ...flattened }
		} else {
			// 如果当前值不是对象，则将其添加到结果中
			result[`${key}`] = obj[key]
		}
	}

	return result
}

/**
 * @description 获取模板
 */
const templateMap = computed(() => {
	const result = {} as TemplateMap
	devTemplate.value?.forEach((item: any) => {
		result[item.tid] = item
	})
	return result
})

const currentTemplate: any = computed(() => templateMap.value[tid.value])

/**
 * @description 高级设置展示
 */
const advanceShow = computed(() => {
	const advancedData = flattenObject(currentTemplate.value?.advancedShow || {})
	if (!props.compData.isEdit) {
		Object.entries(advancedData)?.forEach(([key, val]: [string, any]) => {
			form[key] = val
		})
	}
	return advancedData
})

const reorganizeFields = (fields: Field[], sorted: string[][]) => {
	const result: Field[][] = []
	const fieldMap = new Map(fields.map(field => [field.attr, field]))

	sorted.forEach(group => {
		const groupFields = group.map(attr => fieldMap.get(attr)).filter(Boolean) as Field[]
		result.push(groupFields)
	})

	return result
}

/**
 * @description 生成字段行数据
 */
const generateFields = () => {
	nextTick(() => {
		if (!currentTemplate.value) return
		limitType.value = types.filter((item: any) => {
			if (!currentTemplate.value.module.includes(item)) return item
		})
		const rawFields = currentTemplate.value.field.map((item: any) => {
			let value = item.default
			if (item.type === 'select' && (item.default === undefined || item.default === null)) {
				value = item.items[0]?.value || ''
			}
			return { ...item, value }
		})

		// 重新组织fields数组
		fields.value = reorganizeFields(rawFields, currentTemplate.value.sorted)
	})
}

// 时间戳转换为当天的秒数
const timestampToSecondsOfDay = (timestamp: number) => {
	// 将时间戳转换为 Date 对象
	const date = new Date(timestamp)
	// 获取当天的年、月、日
	const year = date.getFullYear()
	const month = date.getMonth() + 1 // 月份从 0 开始，需要加 1
	const day = date.getDate()
	// 构建当天的 0 点时间戳
	const startOfDayTimestamp = new Date(year, month - 1, day).getTime()
	// 计算传入时间戳与当天 0 点时间戳之间的差值，并转换为秒数
	const secondsOfDay = Math.floor((timestamp - startOfDayTimestamp) / 1000)
	return secondsOfDay
}

// 秒数转换为时间戳
const secondsOfDayToTimestamp = (secondsOfDay: number) => {
	// 获取当前时间的年、月、日
	const today = new Date()
	const year = today.getFullYear()
	const month = today.getMonth()
	const day = today.getDate()
	// 构建当天 0 点的时间戳
	const startOfDayTimestamp = new Date(year, month, day).getTime()
	// 计算传入的秒数对应的时间戳，并返回
	return startOfDayTimestamp + secondsOfDay * 1000
}

/**
 * @description 标签选项
 */
const tagOptions = ref<any>([
	{ label: '全部', value: 'all', checked: true },
	{ label: '常用', value: 'common', checked: false },
	{ label: '网站', value: 'site', checked: false },
	{ label: 'SSL', value: 'ssl', checked: false },
	{ label: '系统', value: 'system', checked: false },
	{ label: '软件', value: 'soft', checked: false },
	{ label: '插件', value: 'plugin', checked: false },
	{ label: '面板', value: 'panel', checked: false },
	{ label: '安全', value: 'safe', checked: false },
])

/**
 * @description 获取任务类型选项
 */
const taskOptions = computed(() => {
	const { diyProcessTemplate: tem, diyProcessTemplateTid: tid } = props.compData
	if (tem && tid?.length) {
		return devTemplate.value?.filter((item: any) => tid.includes(item.tid)).map(mapFunction)
	} else {
		return devTemplate.value?.map(mapFunction)
	}
})

/**
 * @description 获取数据
 */
const getData = () => {
	const data: { [key: string]: any } = {}
	const temp = currentTemplate.value
	data.tid = temp.tid
	data.type = temp.type
	data.title = temp.title
	data.status = true
	data.count = 0
	data.interval = 600
	data.project = ''
	fields.value.forEach((fieldGroup: any) => {
		fieldGroup.forEach((item: any) => {
			data[item.attr] = item.value
		})
	})
	return data
}

/**
 * @description 重置
 */
const reset = () => {
	tid.value = taskOptions.value[0]!.value
	generateFields()
	form.method = []
	form.send_interval = 0
	form.time_range = [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 0)]
	form.day_num = 0
	form.total = 0
}

/**
 * @description 添加
 */
const onAdd = async () => {
	try {
		const params = handleParams()
		await useDataHandle({
			loading: '正在添加告警任务，请稍候...',
			request: setNewAlarmTask(params),
			message: true,
			success: (res: any) => {
				if (res.status) {
					reset()
					compData.value?.onRefresh && compData.value?.onRefresh()
					emit('close')
				}
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 处理参数
 */
const handleParams = () => {
	const temp = currentTemplate.value
	const { isEdit, row } = compData.value
	const params: EditParams = {
		template_id: temp.tid,
		task_data: {
			task_data: getData(),
			sender: form.method,
			number_rule: { day_num: form.day_num, total: form.total },
		},
	}
	params.task_data.time_rule = {
		send_interval: form.send_interval,
		time_range: form.time_range[1] != 0 ? [timestampToSecondsOfDay(form.time_range[0]), timestampToSecondsOfDay(form.time_range[1])] : [],
	}
	params.task_data = JSON.stringify(params.task_data)
	if (isEdit) params.task_id = row.id
	return params
}

/**
 * @description 确认
 * @param close
 */
const onConfirm = async () => {
	try {
		if (!form.method.length) {
			Message.error('请选择告警方式')
			return
		}
		// 判定是否是编辑状态
		if (!compData.value.isEdit) {
			onAdd()
			return
		}
		const params = handleParams() // 参数
		const res: any = await useDataHandle({
			loading: '正在编辑告警任务，请稍候...',
			request: setNewAlarmTask(params),
			message: true,
			success: (res: any) => {
				if (res.status) {
					if (compData.value.onRefresh) compData.value?.onRefresh()
				}
			},
		})
		return res.status
	} catch (error) {
		console.log(error)
		return false
	}
}

const setForm = (row: any) => {
	tid.value = row.template_id
	generateFields()
	nextTick(() => {
		// 将二维数组展平为一维数组进行处理
		const flatFields = fields.value.flat()

		flatFields.forEach((item: any) => {
			if (hasOwnProperty(row.task_data, item.attr)) {
				item.value = row.task_data[item.attr]
			}

			// 项目停止告警
			if (tid.value == '9' && item.attr === 'cycle') {
				if (typeof item.value === 'number') {
					// 找到第二组字段（索引为1的字段组）的第一个字段
					const targetField = fields.value[1]?.[0]
					if (targetField) {
						const list = targetField.all_items[item.value - 1]
						targetField.items = list
					}
				}
			}

			// 首页磁盘告警
			if (tid.value === '20' && item.attr === 'count') {
				// 获取第二组和第三组的第一个字段
				const secondGroupField = fields.value[1]?.[0]
				const thirdGroupField = fields.value[2]?.[0]

				if (secondGroupField && thirdGroupField) {
					const isGB = secondGroupField.value === 1
					thirdGroupField.name = isGB ? '占用超过' : '占用率超过'
					thirdGroupField.unit = isGB ? 'GB' : '%'
				}
			}
		})
	})
}

/**
 * @description 初始化
 */
const init = async () => {
	try {
		// 获取模板
		devTemplate.value = (await getTemplate()) || []
		// 判定是否是编辑状态
		const { isEdit, row } = compData.value
		if (isEdit) {
			const arr: string[] = row.sender.map((item: any) => item)
			form.method = arr
			// 高级设置数据填充
			form.day_num = row.number_rule.day_num || 0 // 每日发送上限
			form.total = row.number_rule.total || 0 // 总发送上限
			form.send_interval = row.time_rule.send_interval || 0 // 发送最小间隔
			// 时间数据填充
			if (row.time_rule && row.time_rule.time_range && row.time_rule.time_range.length > 0) {
				form.time_range = [secondsOfDayToTimestamp(row.time_rule.time_range[0]), secondsOfDayToTimestamp(row.time_rule.time_range[1])]
			} else {
				form.time_range = [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 0)]
			}
			nextTick(() => setForm(row))
		}
	} catch (error) {
		console.log(error)
	}
}

provide('alarm-list-form', { fields })
onMounted(() => init())

defineExpose({ onConfirm })
</script>
<style lang="css" scoped>
:deep(.flex-item .el-form-item) {
	margin-top: 0 !important;
}
</style>
