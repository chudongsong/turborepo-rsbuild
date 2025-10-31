<template>
	<div>
		<el-form ref="alertFormRef" :rules="rule" :label-width="labelWidth" :inline="true" :model="timeForm" class="demo-form-inline">
			<el-form-item class="!w-full">
				<el-form-item label="执行周期">
					<div class="flex items-center">
						<el-form-item class="el-form-item-item">
							<el-select @change="handleTypeChange(timeForm.type, true)" class="!w-[8rem]" v-model="timeForm.type">
								<template v-for="(item, index) in timeType">
									<el-option v-if="item.type === 'second-n' ? showSecond : true" :key="index" :label="item.text" :value="item.type"> </el-option>
								</template>
							</el-select>
						</el-form-item>
						<template v-if="timeForm.type == 'sweek'">
							<el-form-item class="el-form-item-item">
								<el-select class="!w-[8rem]" v-model="timeForm.timeType" @change="timeTypeChange">
									<el-option label="每天" value="sday"></el-option>
									<el-option label="每周" value="sweek"></el-option>
									<el-option label="每月" value="smonth"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item v-if="timeForm.timeType === 'sweek'" class="el-form-item-item" prop="timeSet">
								<el-select class="!w-[16rem]" v-model="timeForm.timeSet" multiple collapse-tags>
									<el-option label="周一" value="1"></el-option>
									<el-option label="周二" value="2"></el-option>
									<el-option label="周三" value="3"></el-option>
									<el-option label="周四" value="4"></el-option>
									<el-option label="周五" value="5"></el-option>
									<el-option label="周六" value="6"></el-option>
									<el-option label="周日" value="7"></el-option>
								</el-select>
							</el-form-item>

							<el-form-item class="el-form-item-item" v-if="timeForm.timeType === 'smonth'" prop="timeSet">
								<el-select class="!w-[14rem] cycle-select" v-model="timeForm.timeSet" multiple collapse-tags collapse-tags-tooltip>
									<el-option v-for="(item, index) in 30" :key="item" :label="item" :value="`${item}`"></el-option>
								</el-select>
								<span class="el-input-group__append cycle-unit">号</span>
							</el-form-item>
							<el-form-item class="el-form-item-item" prop="specialHour">
								<el-select class="!w-[14rem] cycle-select" v-model="timeForm.specialHour" multiple collapse-tags>
									<el-option v-for="(item, index) in 24" :key="index" :label="index" :value="index"></el-option>
								</el-select>
								<span class="el-input-group__append cycle-unit">点</span>
							</el-form-item>
							<el-form-item class="el-form-item-item" prop="specialMinute">
								<el-select class="!w-[14rem] cycle-select" v-model="timeForm.specialMinute" multiple collapse-tags>
									<template v-for="(item, index) in 60">
										<el-option v-if="index % 5 === 0" :key="index" :label="index" :value="index"></el-option>
									</template>
								</el-select>
								<span class="el-input-group__append cycle-unit">分</span>
							</el-form-item>
						</template>
						<template v-else>
							<el-form-item class="el-form-item-item" v-if="timeForm.type == 'week'">
								<el-select class="!w-[8rem]" v-model="timeForm.week">
									<el-option label="周一" value="1"></el-option>
									<el-option label="周二" value="2"></el-option>
									<el-option label="周三" value="3"></el-option>
									<el-option label="周四" value="4"></el-option>
									<el-option label="周五" value="5"></el-option>
									<el-option label="周六" value="6"></el-option>
									<el-option label="周日" value="7"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item v-if="timeType[cycleTime]?.showDay" class="el-form-item-item" prop="where1">
								<bt-input v-model="timeForm.where1" :min="1" width="10rem" textType="天" type="number">
									<template #append> 天 </template>
								</bt-input>
							</el-form-item>
							<el-form-item v-if="timeType[cycleTime]?.showHour" class="el-form-item-item" prop="hour">
								<bt-input v-model="timeForm.hour" width="10rem" textType="小时" max="23" min="0" type="number">
									<template #append> 小时 </template>
								</bt-input>
							</el-form-item>
							<el-form-item v-if="timeType[cycleTime]?.showMinute" class="el-form-item-item" prop="minute">
								<bt-input v-model="timeForm.minute" v-if="timeType[cycleTime]?.showMinute" width="10rem" max="59" min="0" type="number">
									<template #append> 分钟 </template>
								</bt-input>
							</el-form-item>
							<el-form-item v-if="timeType[cycleTime]?.showSecond" class="el-form-item-item" prop="second">
								<bt-input v-model="timeForm.second" v-if="timeType[cycleTime]?.showSecond" width="10rem" max="59" min="0" type="number">
									<template #append> 秒 </template>
								</bt-input>
							</el-form-item>
						</template>
					</div>
				</el-form-item>

				<div class="defineClass">
					<el-form-item label=" " class="!mt-0 defineClass">
						<div class="flex items-center">
							<el-checkbox v-model="noticeForm.flock" :disabled="isFlockDisabled"> 开启进程锁</el-checkbox>
							<el-popover placement="right-start" width="440" popper-class="white-tips-popover" trigger="hover" content="">
								<div class="p-12x">
									<span class="text-secondary"> 在同一时间内只用一个进程在执行，若上一个进程未执行结束，下一次不执行 </span>
								</div>
								<i slot="reference" class="el-icon-question text-warning ml-12x"></i>
							</el-popover>
						</div>
					</el-form-item>

					<el-form-item label=" " v-if="showStopWeb" class="!mt-0 defineClass">
						<div class="flex items-center">
							<el-checkbox v-model="WebStopSite" @change="stopSiteHancel"> 网站停用时是否停止备份</el-checkbox>
							<el-popover placement="right-start" width="220" popper-class="white-tips-popover" trigger="hover" content="">
								<span class="text-secondary"> 该功能不支持反向代理和html项目 </span>
								<template #reference>
									<i class="svgtofont-el-question-filled text-warning ml-[12px]"></i>
								</template>
							</el-popover>
						</div>
					</el-form-item>
				</div>
			</el-form-item>
			<slot name="center"></slot>
			<el-form-item label="备份提醒" prop="notice" v-if="showNotice" class="!mt-1.6rem">
				<div class="flex items-center">
					<bt-select class="!w-[20rem]" v-model="noticeForm.notice" :options="noticeOptions" @change="handleChange"></bt-select>
					<el-form-item label="消息通道" v-if="noticeForm.notice === 1">
						<bt-alarm-old-select v-model="noticeForm.notice_channel" :is-show-api="false" :multiple="false" :all-alarm="true" @change="onGiveSelect" class="!w-16rem"></bt-alarm-old-select>
					</el-form-item>
					<el-form-item label="关键词匹配" v-show="showKeyword && noticeForm.notice === 1" class="!mt-0">
						<div class="flex items-center">
							<el-popover placement="top-start" width="290" popper-class="white-tips-popover" trigger="focus" content="">
								<div class="p-[12px]">
									<div>1、在shell程序中不要<span class="text-danger">中断</span>执行如（exit等）</div>
									<div>2、输出<span class="text-danger">关键词</span>（建议5位且程序中不会出现）</div>
									<div>3、匹配到关键词<span class="text-danger">发送告警</span></div>
								</div>
								<bt-input slot="reference" class="mr-[4px]" v-model="noticeForm.keyword" :disabled="isEdit" width="16rem" placeholder="请输入关键词" type="text"> </bt-input>
							</el-popover>
						</div>
					</el-form-item>
				</div>
			</el-form-item>
			<slot name="bottom"></slot>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import CRONTAB_TASK_STORE from '../useStore'
import { noticeOptions, timeForm, noticeForm, clearTimeForm } from './useController'
const { rowData } = storeToRefs(CRONTAB_TASK_STORE())

interface Props {
	isEdit?: boolean // 是否是编辑
	showKeyword?: boolean // 是否显示关键词匹配
	showNotice?: boolean // 是否显示备份提醒
	needAll?: boolean // 是否需要全部
	showSecond?: boolean // 是否显示秒
	labelWidth?: string // label宽度
	showStopWeb?: boolean // 是否显示网站停用时是否停止备份
	stopSite?: boolean // 网站停用时是否停止备份
}
const props = withDefaults(defineProps<Props>(), {
	isEdit: false,
	showKeyword: false,
	showNotice: true,
	needAll: false,
	showSecond: false,
	labelWidth: '',
	showStopWeb: false,
	stopSite: true,
})

const WebStopSite = ref(rowData.value.stop_site === '1' || false)

const emit = defineEmits(['crontab', 'siteWeb'])
// 表单ref
const alertFormRef = ref()
// 周期时间
const cycleTime = ref(0)
// 暂时下架进程锁相关功能
const isFlockDisabled = ref(false)

const timeType = ref([
	{ type: 'day', text: '每天', showDay: false, showHour: true, showMinute: true, showSecond: false },
	{ type: 'day-n', text: 'N天', showDay: true, showHour: true, showMinute: true, showSecond: false },
	{ type: 'hour', text: '每小时', showDay: false, showHour: false, showMinute: true, showSecond: false },
	{ type: 'hour-n', text: 'N小时', showDay: false, showHour: true, showMinute: true, showSecond: false },
	{ type: 'minute-n', text: 'N分钟', showDay: false, showHour: false, showMinute: true, showSecond: false },
	{ type: 'week', text: '每周', showDay: false, showHour: true, showMinute: true, showSecond: false },
	{ type: 'month', text: '每月', showDay: true, showHour: true, showMinute: true, showSecond: false },
	{ type: 'second-n', text: 'N秒', showDay: false, showHour: false, showMinute: false, showSecond: true },
	{ type: 'sweek', text: '自定义', showDay: false, showHour: true, showMinute: true, showSecond: false },
])

const rule = reactive({
	where1: [
		{
			validator: (rule: any, value: string, callback: any) => {
				if (timeForm.value.type === 'day-n' || timeForm.value.type === 'month') {
					if (Number.parseInt(value) > 31 || Number.parseInt(value) < 1 || !Number.isInteger(parseFloat(value))) {
						callback(new Error('请输入1-31的整数'))
					} else if (value === '') {
						callback(new Error('请输入天数'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	hour: [
		// { required: true, message: '不可为空', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				if (timeForm.value.type === 'minute-n' || timeForm.value.type === 'hour' || timeForm.value.type === 'second-n') callback()
				if (Number.parseInt(value) > 23 || Number.parseInt(value) < 0 || !Number.isInteger(parseFloat(value))) {
					callback(new Error('请输入0-23的整数'))
				} else if (value === '') {
					callback(new Error('请输入小时'))
				} else if (timeForm.value.type === 'hour-n' && Number.parseInt(value) === 0) {
					callback(new Error('小时不能为0'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	minute: [
		// { required: true, message: '不可为空', trigger: 'blur' },
		{
			validator: (rule: any, value: string, callback: any) => {
				if (Number.parseInt(value) > 59 || Number.parseInt(value) < 0 || !Number.isInteger(parseFloat(value))) {
					callback(new Error('请输入0-59的整数'))
				} else if (value === '') {
					callback(new Error('请输入分钟'))
				} else if (timeForm.value.type === 'minute-n' && (Number.parseInt(value) < 1 || !/^[1-9]\d*$/.test(value))) {
					// n分钟不能小于1
					callback(new Error('请输入1-59的整数'))
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	second: [
		{
			validator: (rule: any, value: string, callback: any) => {
				// 判断是否为整数
				if (timeForm.value.type === 'second-n') {
					if (!Number.isInteger(parseFloat(value)) || Number.parseInt(value) > 59 || Number.parseInt(value) < 1) {
						callback(new Error('请输入1-59的整数'))
					} else if (value === '') {
						callback(new Error('请输入秒'))
					} else {
						callback()
					}
				} else {
					callback()
				}
			},
			trigger: ['blur', 'change'],
		},
	],
	timeSet: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (timeForm.value.type === 'sweek' && !value.length) {
					callback(new Error('请选择时间'))
				} else {
					callback()
				}
			},
			trigger: 'change',
		},
	],
	specialHour: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (timeForm.value.type === 'sweek' && !value.length) {
					callback(new Error('请选择小时'))
				} else {
					callback()
				}
			},
			trigger: 'change',
		},
	],
	specialMinute: [
		{
			validator: (rule: any, value: any, callback: any) => {
				if (timeForm.value.type === 'sweek' && !value.length) {
					callback(new Error('请选择分钟'))
				} else {
					callback()
				}
			},
			trigger: 'change',
		},
	],
})

const onGiveSelect = (val: string) => {
	noticeForm.value.notice_channel = val
}

const timeTypeChange = (val: string) => {
	alertFormRef.value.clearValidate()
}

const handleChange = (val: number) => {
	noticeForm.value.notice = val
	if (val === 1) {
		// getMsgConfig()
		noticeForm.value.notice_channel = 'all'
	}
}

const handleTypeChange = (val: string, isSelect: boolean = false) => {
	if (!props.isEdit) {
		noticeForm.value.notice = 0
		// 选择周期时，清空通知方式
		if (isSelect) clearTimeForm()
	}
	timeForm.value.type = val
	cycleTime.value = timeType.value.findIndex((item: any) => {
		return item.type === val
	})
	if (timeForm.value.type === 'minute-n') {
		timeForm.value.where1 = timeForm.value.minute
	}
	if (timeForm.value.type === 'hour-n') {
		timeForm.value.where1 = timeForm.value.hour
	}
	// 暂时下架进程锁相关功能
	if (timeForm.value.type === 'second-n') {
		noticeForm.value.flock = false
		isFlockDisabled.value = true
	} else {
		isFlockDisabled.value = false
	}
	if (alertFormRef.value) alertFormRef.value.clearValidate()
	// 任务编排自定义显示判断
	val == 'custom' ? emit('crontab', true) : emit('crontab', false)
}

watchEffect(() => {
	// 监听timeForm表单数据变化，变化后更新选项数据
	handleTypeChange(timeForm.value.type)
})

onMounted(() => {
	handleTypeChange(timeForm.value.type, true)
})

const stopSiteHancel = (val: any) => {
	emit('siteWeb', val)
}

defineExpose({
	validate: () => alertFormRef.value?.validate(),
	WebStopSite: WebStopSite, // 网站停用时是否停止备份
})
</script>

<style lang="css" scoped>
:deep(.el-input-group__append) {
	padding: 0 10px !important;
}

.el-form-item-item {
	@apply m-0 !important;
	margin-right: 1rem;
}

.defineClass {
	/* margin-left: -90px !important; */
}

:deep(.week-css .el-input__inner) {
	height: 32px !important;
}
</style>

<style>
.cycle-select .el-select__wrapper {
	border-radius: var(--el-border-radius-base) 0 0 var(--el-border-radius-base);
}
.cycle-unit {
	border-radius: 0 var(--el-border-radius-base) var(--el-border-radius-base) 0;
	border: 1px solid var(--el-color-border-dark);
	border-left: none;
	line-height: 30px;
	height: 30px;
}
</style>
