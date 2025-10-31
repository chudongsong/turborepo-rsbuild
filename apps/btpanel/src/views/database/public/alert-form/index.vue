<template>
	<div>
		<el-form ref="formDataRef" :rules="rule" :inline="true" :model="formData" class="demo-form-inline">
			<el-form-item label="执行周期" class="!mb-0">
				<div class="flex items-center">
					<el-select @change="handleTypeChange(formData.type, true)" class="!w-[8rem] mr-[4px]" v-model="formData.type">
						<el-option v-for="(item, index) in timeType" :key="index" :label="item.text" :value="item.type"> </el-option>
					</el-select>

					<el-form-item class="el-form-item-item" v-if="formData.type == 'week'">
						<el-select class="ml-[8px] mr-[4px] !w-[8rem]" v-model="formData.week">
							<el-option label="周一" :value="1"></el-option>
							<el-option label="周二" :value="2"></el-option>
							<el-option label="周三" :value="3"></el-option>
							<el-option label="周四" :value="4"></el-option>
							<el-option label="周五" :value="5"></el-option>
							<el-option label="周六" :value="6"></el-option>
							<el-option label="周日" :value="7"></el-option>
						</el-select>
					</el-form-item>

					<el-form-item class="el-form-item-item" prop="where1">
						<bt-input class="ml-[8px] mr-[4px]" v-model="formData.where1" :min="1" v-if="timeType[cycleTime]?.showDay" width="9.2rem" type="number">
							<template #append> 天 </template>
						</bt-input>
					</el-form-item>
					<el-form-item class="el-form-item-item" prop="hour">
						<bt-input class="ml-[8px] mr-[4px]" v-model="formData.hour" v-if="timeType[cycleTime]?.showHour" width="10rem" max="23" min="0" type="number">
							<template #append> 小时 </template>
						</bt-input>
					</el-form-item>
					<el-form-item class="el-form-item-item" prop="minute">
						<bt-input class="ml-[8px] mr-[4px]" v-model="formData.minute" v-if="timeType[cycleTime]?.showMinute" width="10rem" max="59" min="0" type="number">
							<template #append> 分钟 </template>
						</bt-input>
					</el-form-item>
				</div>
			</el-form-item>

			<slot name="other-config"></slot>

			<el-form-item label="备份提醒" prop="notice" class="!mt-1.6rem">
				<div class="flex items-center">
					<el-select v-model="formData.notice" class="!w-[20rem]">
						<el-option label="不接受任何消息通知" :value="0"></el-option>
						<el-option label="任务执行失败接收通知" :value="1"></el-option>
					</el-select>
					<el-form-item label="消息通道" v-show="formData.notice === 1">
						<bt-alarm-old-select v-model="formData.noticeChannel" class="!w-[12rem]" :allAlarm="true" :multiple="false" :isDefault="true" :isShowApi="false" :limit="['sms']"></bt-alarm-old-select>
					</el-form-item>
				</div>
			</el-form-item>
			<slot name="bottom"></slot>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	rowData?: AnyObject
}

const props = withDefaults(defineProps<Props>(), {
	rowData: () => ({}),
})

const formDataRef = ref() // 表单ref
const cycleTime = ref(0) // 周期时间

let timeType = shallowRef([
	{
		type: 'day',
		text: '每天',
		showDay: false,
		showHour: true,
		showMinute: true,
	},
	{
		type: 'day-n',
		text: 'N天',
		showDay: true,
		showHour: true,
		showMinute: true,
	},
	{
		type: 'hour',
		text: '每小时',
		showDay: false,
		showHour: false,
		showMinute: true,
	},
	{
		type: 'hour-n',
		text: 'N小时',
		showDay: false,
		showHour: true,
		showMinute: true,
	},
	{
		type: 'minute-n',
		text: 'N分钟',
		showDay: false,
		showHour: false,
		showMinute: true,
	},
	{
		type: 'week',
		text: '每周',
		showDay: false,
		showHour: true,
		showMinute: true,
	},
	{
		type: 'month',
		text: '每月',
		showDay: true,
		showHour: true,
		showMinute: true,
	},
])

const rule = {
	where1: [
		{
			validator: (rule: any, value: string, callback: any) => {
				if (formData.value.type === 'day-n' || formData.value.type === 'month') {
					if (Number.parseInt(value) > 31 || Number.parseInt(value) < 1 || !Number.isInteger(parseFloat(value))) {
						callback(new Error('请输入1-31的整数'))
					} else if (value === '') {
						callback(new Error('请输入天数'))
					}
					callback()
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
	hour: [
		{
			validator: (rule: any, value: number, callback: any) => {
				if (formData.value.type === 'minute-n' || formData.value.type === 'hour' || formData.value.type === 'second-n') callback()
				if (value > 23 || value < 0 || !value) {
					callback(new Error('请输入0-23的整数'))
				} else if (formData.value.type === 'hour-n' && value === 0 && formData.value.minute === 0) {
					callback(new Error('小时和分钟不能同时为0'))
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
	minute: [
		{
			validator: (rule: any, value: number, callback: any) => {
				if (value > 59 || value < 0 || !value) {
					callback(new Error('请输入0-59的整数'))
				} else if (formData.value.type === 'hour-n' && value === 0 && formData.value.hour === 0) {
					// n小时n分钟不能同时为0
					callback(new Error('小时和分钟不能同时为0'))
				} else if (formData.value.type === 'minute-n' && (value < 1 || !value)) {
					// n分钟不能小于1
					callback(new Error('请输入1-59的整数'))
				}
				callback()
			},
			trigger: ['blur', 'change'],
		},
	],
}

const formData = ref({
	type: 'day',
	week: 1,
	where1: '' as number | string,
	hour: 1,
	minute: 30,
	notice: 0,
	noticeChannel: '',
})

/**
 * @description 周期变化
 * @param val
 * @param isSelect
 */
const handleTypeChange = (val: string, isSelect: boolean = false) => {
	if (!props.rowData.cron_id) formData.value.notice = 0

	formData.value.type = val
	// 查找当前选中的周期在配置中的索引
	cycleTime.value = timeType.value.findIndex((item: any) => item.type === val)

	// 特殊赋值情况
	if (formData.value.type === 'minute-n') formData.value.where1 = formData.value.minute
	if (formData.value.type === 'hour-n') formData.value.where1 = formData.value.hour
}

onMounted(async () => {
	// 编辑
	// await handleTypeChange(formData.value.type, true)
	if (props.rowData.cron_id) {
		Object.assign(formData.value, {
			type: props.rowData.type,
			week: props.rowData.where1,
			where1: props.rowData.where1,
			hour: props.rowData.hour,
			minute: props.rowData.minute,
			notice: props.rowData.notice,
			noticeChannel: props.rowData.notice_channel.split(',').length > 1 ? 'all' : props.rowData.notice_channel,
		})
	}
})

defineExpose({ formData, formDataRef })
</script>

<style lang="css" scoped>
:deep(.el-input-group__append) {
	padding: 0 10px !important;
}

.el-form-item-item {
	margin: 0 !important;
}

:deep(.week-css .el-input__inner) {
	height: 32px !important;
}
</style>
