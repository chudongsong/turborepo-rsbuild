<template>
	<div class="my-[1.6rem]">
		<BtForm labelWidth="8rem" />
		<ul class="mt-8px leading-8 text-small list-disc ml-[4.5rem]">
			<li>配置保存后，如果备份任务处于启用状态，将按新配置执行。</li>
		</ul>
	</div>
</template>
<script lang="tsx" setup>
import { useForm, useDataHandle } from '@/hooks/tools'
import { FormGroup, FormInput, FormSelect, FormItemCustom } from '@form/form-item'
import { formatTime } from '@/utils'
import { addIncrementTask } from '@/api/database'

import { ElTimePicker, ElDatePicker } from 'element-plus'

interface Props {
	compData?: any
}
const props = withDefaults(defineProps<Props>(), {
	compData: () => {},
})

const allBackupTypeOptions = [
	{ label: '每天', value: 'daily' },
	{ label: '每周', value: 'weekly' },
	{ label: '相隔N天', value: 'interval' },
	{ label: '相隔N小时', value: 'hours' },
]

const allBackupWeekOptions = [
	{ label: '周一', value: '1' },
	{ label: '周二', value: '2' },
	{ label: '周三', value: '3' },
	{ label: '周四', value: '4' },
	{ label: '周五', value: '5' },
	{ label: '周六', value: '6' },
	{ label: '周日', value: '0' },
]

const incrementBackupTypeOptions = [
	{ label: '小时', value: 'hour' },
	{ label: '分钟', value: 'minute' },
]

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

/**
 * @description 检查正整数
 * @param value 值
 * @param callback 回调
 * @param message 错误信息
 */
const checkIntValidator = (value: any, callback: any, message: string) => {
	if (!/^\d+$/.test(String(value)) || Number(value) <= 0) {
		callback(new Error(message))
	} else {
		callback()
	}
}

/**
 * @description 将时间字符串转换为当天对应时间的日期对象
 * @param timeStr 时间字符串，格式为"HH:MM:SS"
 * @returns 当天对应时间的日期对象
 */
const parseTimeToDate = (timeStr: string = '08:00:00'): Date => {
	const date = new Date()
	if (!timeStr) return date

	const [hours, minutes, seconds] = timeStr.split(':').map(Number)

	date.setHours(isNaN(hours) ? 0 : hours, isNaN(minutes) ? 0 : minutes, isNaN(seconds) ? 0 : seconds, 0)

	return date
}

// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		schedule_time: props.compData?.backupPlan?.full_backup_schedule?.type || 'daily',
		weekday: props.compData?.backupPlan?.full_backup_schedule?.weekday || '1',
		interval_days: props.compData?.backupPlan?.full_backup_schedule?.interval_days || '1',
		interval_hours: props.compData?.backupPlan?.full_backup_schedule?.interval_hours || '24',
		allBackupTime: (() => {
			const date = parseTimeToDate(props.compData?.backupPlan?.full_backup_schedule?.time)
			return date
		})(),
		start_date: (() => {
			const date = props.compData?.backupPlan?.full_backup_schedule?.start_date ? new Date(props.compData?.backupPlan?.full_backup_schedule?.start_date) : new Date()
			date.setHours(8, 0, 0, 0)
			return date
		})(),
		incrementBackupNum: props.compData?.backupPlan?.incremental_backup_interval || '1',
		incrementBackupType: props.compData?.backupPlan?.incremental_backup_interval ? 'minute' : 'hour',
	}),
	options: (formDataRef: Ref<any>) => {
		return computed(() => [
			FormGroup([
				FormSelect('全量备份', 'schedule_time', allBackupTypeOptions, {
					attrs: { class: '!w-[10rem]' },
				}),
				...(formDataRef.value.schedule_time === 'weekly'
					? [
							FormSelect('', 'weekday', allBackupWeekOptions, {
								attrs: { class: '!w-[8rem] ml-[1rem]' },
							}),
					  ]
					: []),
				...(formDataRef.value.schedule_time === 'interval'
					? [
							FormInput('', 'interval_days', {
								attrs: { class: '!w-[8rem] ml-[1rem]' },
								slots: {
									unit: () => {
										return <span>天</span>
									},
								},
								rules: [{ validator: (rule: any, value: any, callback: any) => checkIntValidator(value, callback, '请输入正确的整数'), trigger: 'blur' }],
							}),
							FormItemCustom(
								'开始日期',
								() => {
									return <ElDatePicker class="!w-[13rem]" v-model={formDataRef.value.start_date} format="YYYY-MM-DD" value-format="x" />
								},
								'start_date',
								{
									rules: [{ required: true, message: '请选择开始日期', trigger: ['blur', 'change'] }],
								}
							),
					  ]
					: []),
				...(formDataRef.value.schedule_time === 'hours'
					? [
							FormInput('', 'interval_hours', {
								attrs: { class: '!w-[12rem] ml-[1rem]' },
								slots: {
									unit: () => {
										return <span class="ml-[1rem] inline-block w-[4rem]">小时</span>
									},
								},
								rules: [{ validator: (rule: any, value: any, callback: any) => checkIntValidator(value, callback, '请输入正确的整数'), trigger: 'blur' }],
							}),
					  ]
					: [
							FormItemCustom(
								'执行时间',
								() => {
									return <ElTimePicker class="!w-[13rem]" v-model={formDataRef.value.allBackupTime} format="HH:mm:ss" />
								},
								'allBackupTime',
								{
									rules: [{ required: true, message: '请选择执行时间', trigger: ['blur', 'change'] }],
								}
							),
					  ]),
			]),
			FormGroup([
				FormItemCustom(
					'增量备份',
					() => {
						return <span></span>
					},
					'null'
				),
				FormInput('每隔', 'incrementBackupNum', {
					attrs: { class: '!w-[8rem]' },
					labelAttrs: { labelWidth: '3.5rem' },
					rules: [{ validator: (rule: any, value: any, callback: any) => checkIntValidator(value, callback, '请输入正确的整数'), trigger: 'blur' }],
				}),
				FormSelect('', 'incrementBackupType', incrementBackupTypeOptions, {
					attrs: { class: '!w-[8rem] ml-[1rem]' },
				}),
			]),
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		onConfirm(param, popupClose)
	},
})

/**
 * @description 增加增量备份任务/修改
 */
const onConfirm = async (params: any, close: AnyFunction) => {
	console.log(formatTime(params.value.start_date, 'yyyy-MM-dd'))

	const data = {
		id: props.compData.id,
		schedule_type: params.value.schedule_time,
		incremental_backup_interval: params.value.incrementBackupType === 'hour' ? Number(params.value.incrementBackupNum) * 60 : Number(params.value.incrementBackupNum),
		...(params.value.schedule_time !== 'hours' ? { schedule_time: formatTime(params.value.allBackupTime, 'HH:mm:ss') } : { interval_hours: params.value.interval_hours }),
		...(params.value.schedule_time === 'weekly' ? { weekday: params.value.weekday } : {}),
		...(params.value.schedule_time === 'interval' ? { interval_days: params.value.interval_days, start_date: formatTime(params.value.start_date, 'yyyy-MM-dd') } : {}),
	}

	await useDataHandle({
		loading: '正在保存，请稍候...',
		request: addIncrementTask(data),
		message: true,
	})

	props.compData.refreshEvent() // 刷新表格数据
	close()
}

/**
 * @description 初始化
 */
const init = async () => {
	// 获取数据库表选项数据
}

onMounted(() => {
	init()
})

defineExpose({ onConfirm: submit })
</script>

<style lang="css" scoped>
:deep(.el-form .el-form-item__label) {
	min-width: 0 !important;
}
</style>
