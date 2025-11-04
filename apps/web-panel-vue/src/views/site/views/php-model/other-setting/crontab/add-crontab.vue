<template>
	<el-form ref="crontabFormRef" :model="crontabForm" :rules="crontabFormRules" :disabled="formDisabled" label-width="80px" class="p-2rem">
		<el-form-item label="任务名称" prop="cron_name">
			<bt-input v-model="crontabForm.cron_name" placeholder="请输入计划任务名称" width="36rem" />
		</el-form-item>
		<el-form-item label="执行周期">
			<div class="flex items-center">
				<el-select @change="handleTypeChange(crontabForm.type, true)" class="!w-[8rem] mr-1rem" v-model="crontabForm.type">
					<el-option v-for="(item, index) in timeType" :key="index" :label="item.text" :value="item.type"></el-option>
				</el-select>
				<el-form-item v-if="crontabForm.type == 'week'" class="el-form-item-item mr-1rem">
					<el-select class="!w-[8rem]" v-model="crontabForm.week">
						<el-option label="周一" value="1"></el-option>
						<el-option label="周二" value="2"></el-option>
						<el-option label="周三" value="3"></el-option>
						<el-option label="周四" value="4"></el-option>
						<el-option label="周五" value="5"></el-option>
						<el-option label="周六" value="6"></el-option>
						<el-option label="周日" value="7"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="timeType[cycleTime]?.showDay" class="el-form-item-item mr-1rem" prop="where1">
					<bt-input v-model="crontabForm.where1" :min="1" width="12rem" type="number">
						<template #append>天</template>
					</bt-input>
				</el-form-item>
				<el-form-item v-if="timeType[cycleTime]?.showHour" class="el-form-item-item mr-1rem" prop="hour">
					<bt-input v-model="crontabForm.hour" v-if="timeType[cycleTime]?.showHour" width="12rem" max="23" min="0" type="number">
						<template #append>小时</template>
					</bt-input>
				</el-form-item>
				<el-form-item v-if="timeType[cycleTime]?.showMinute" class="el-form-item-item" prop="minute">
					<bt-input v-model="crontabForm.minute" v-if="timeType[cycleTime]?.showMinute" width="12rem" max="59" min="0" type="number">
						<template #append>分钟</template>
					</bt-input>
				</el-form-item>
			</div>
		</el-form-item>
		<el-form-item label=" " label-width="0rem">
			<div class="flex items-center">
				<el-checkbox v-model="crontabForm.flock" :disabled="isEdit">开启进程锁</el-checkbox>
				<el-popover placement="right-start" width="440" popper-class="white-tips-popover" trigger="hover" content="">
					<div class="p-[12px]">
						<span class="text-secondary">在同一时间内只用一个进程在执行，若上一个进程未执行结束，下一次不执行</span>
					</div>
					<template #reference>
						<i class="svgtofont-el-question-filled text-warning ml-[12px]"></i>
					</template>
				</el-popover>
			</div>
		</el-form-item>
		<el-form-item label="脚本内容" prop="sBody">
			<bt-input width="58rem" placeholder="请输入脚本内容" type="textarea" v-model="crontabForm.sBody" :resize="'both'" :rows="10"></bt-input>
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { useDataHandle } from '@/hooks/tools'
import { addCrontab, modifyCrontab } from '@api/site'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const isEdit = ref(!!props.compData.row)
const crontabFormRef = ref()
const formDisabled = ref(false)
const crontabForm = reactive({
	cron_name: '',
	type: 'week',
	week: '1',
	where1: '3',
	hour: '1',
	minute: '30',
	flock: false,
	sBody: '',
})

const crontabFormRules = reactive({
	cron_name: [{ required: true, message: '请输入计划任务名称', trigger: 'blur' }],
	hour: [{ required: true, message: '请输入执行时间', trigger: 'blur' }],
	minute: [{ required: true, message: '请输入执行时间', trigger: 'blur' }],
	sBody: [{ required: true, message: '请输入脚本内容', trigger: 'blur' }],
})
const cycleTime = ref(5)
let timeType = ref([
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

const handleTypeChange = (val: string, isSelect: boolean = false) => {
	crontabForm.type = val
	cycleTime.value = timeType.value.findIndex((item: any) => {
		return item.type === val
	})
	if (crontabForm.type === 'minute-n') {
		crontabForm.where1 = crontabForm.minute
	}
	if (crontabForm.type === 'hour-n') {
		crontabForm.where1 = crontabForm.hour
	}
	if (crontabFormRef.value) crontabFormRef.value.clearValidate()
}

const onConfirm = (close: any) => {
	crontabFormRef.value.validate((valid: any) => {
		if (!valid) return
		formDisabled.value = true
		let params: any = {
			sitename: props.compData.sitename,
			...crontabForm,
			flock: crontabForm.flock ? 1 : 0,
		}
		if (isEdit.value) params['id'] = props.compData.row.id

		const requestFun = isEdit.value ? modifyCrontab : addCrontab

		useDataHandle({
			loading: `正在${isEdit.value ? '修改' : '添加'}计划任务，请稍候...`,
			request: requestFun(params),
			message: true,
			success: (res: any) => {
				formDisabled.value = false
				if (res.status) {
					close()
					props.compData.refreshEvent()
				}
			},
		})
	})
}

onMounted(() => {
	isEdit.value = !!props.compData.row
	const { type, where1, where_hour, where_minute, flock, sBody, rname, name } = props.compData.row
	Object.assign(crontabForm, {
		cron_name: rname || name || '',
		type: type || 'week',
		week: type === 'week' ? where1 : '1',
		where1: where1 || '3',
		hour: where_hour || '1',
		minute: where_minute || '30',
		flock: flock ? true : false,
		sBody: sBody || '',
	})
	handleTypeChange(crontabForm.type)
})

defineExpose({
	onConfirm,
})
</script>
