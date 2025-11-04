<template>
	<!-- 暂不提取方法，后续可能弃用该组件 -->

	<div>
		<el-form :rules="rule" :label-width="labelWidth" :inline="true" :model="timeForm" class="demo-form-inline">
			<el-form-item class="!w-full">
				<el-form-item label="执行周期">
					<div class="flex items-center">
						<el-select @change="handleTypeChange(timeForm.type, true)" class="w-[8rem] mr-[4px]" v-model="timeForm.type">
							<template v-for="(item, index) in timeType">
								<el-option v-if="item.type === 'second-n' ? showSecond : true" :key="index" :label="item.text" :value="item.type"> </el-option>
							</template>
						</el-select>
						<template v-if="timeForm.type == 'sweek'">
							<el-select class="ml-[8px] mr-[4px] !w-[8rem]" v-model="timeForm.timeType" @change="timeTypeChange">
								<el-option label="每天" value="sday"></el-option>
								<el-option label="每周" value="sweek"></el-option>
								<el-option label="每月" value="smonth"></el-option>
							</el-select>
							<el-form-item class="el-form-item-item" prop="timeSet">
								<el-select v-if="timeForm.timeType === 'sweek'" class="ml-[8px] mr-[4px] !w-[20rem]" v-model="timeForm.timeSet" multiple>
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
								<el-select class="ml-[8px] mr-[4px] !w-[12rem]" v-model="timeForm.timeSet" multiple collapse-tags>
									<el-option v-for="(item, index) in 30" :key="item" :label="item" :value="`${item}`"></el-option>
								</el-select>
								<span>号</span>
							</el-form-item>
							<el-form-item class="el-form-item-item" prop="specialHour">
								<el-select textType="点" class="ml-[8px] mr-[4px] !w-[12rem]" v-model="timeForm.specialHour" multiple collapse-tags>
									<el-option v-for="(item, index) in 24" :key="index" :label="index" :value="index"></el-option>
								</el-select>
								<span>点</span>
							</el-form-item>
							<el-form-item class="el-form-item-item" prop="specialMinute">
								<el-select class="ml-[8px] mr-[4px] !w-[12rem]" v-model="timeForm.specialMinute" multiple collapse-tags>
									<template v-for="(item, index) in 60">
										<el-option v-if="index % 5 === 0" :key="index" :label="index" :value="index"></el-option>
									</template>
								</el-select>
								<span>分</span>
							</el-form-item>
						</template>
						<template v-else>
							<el-form-item class="el-form-item-item" v-if="timeForm.type == 'week'">
								<el-select class="ml-[8px] mr-[4px] !w-[8rem]" v-model="timeForm.week">
									<el-option label="周一" value="1"></el-option>
									<el-option label="周二" value="2"></el-option>
									<el-option label="周三" value="3"></el-option>
									<el-option label="周四" value="4"></el-option>
									<el-option label="周五" value="5"></el-option>
									<el-option label="周六" value="6"></el-option>
									<el-option label="周日" value="7"></el-option>
								</el-select>
							</el-form-item>
							<el-form-item class="el-form-item-item" prop="where1">
								<bt-input class="mr-[4px] ml-[8px]" v-model="timeForm.where1" :min="1" v-if="timeType[cycleTime]?.showDay" width="9.2rem" textType="天" type="number">
									<template #append>天</template>
								</bt-input>
							</el-form-item>
							<el-form-item v-if="timeType[cycleTime]?.showHour" class="el-form-item-item" prop="hour">
								<bt-input class="mr-[4px] ml-[8px]" v-model="timeForm.hour" v-if="timeType[cycleTime]?.showHour" width="10rem" textType="小时" max="23" min="0" type="number">
									<template #append>小时</template>
								</bt-input>
							</el-form-item>
							<el-form-item v-if="timeType[cycleTime]?.showMinute" class="el-form-item-item" prop="minute">
								<bt-input class="mr-[4px] ml-[8px]" v-model="timeForm.minute" v-if="timeType[cycleTime]?.showMinute" width="10rem" textType="分钟" max="59" min="0" type="number">
									<template #append>分钟</template>
								</bt-input>
							</el-form-item>
							<el-form-item v-if="timeType[cycleTime]?.showSecond" class="el-form-item-item" prop="second">
								<bt-input class="mr-[4px] ml-[8px]" v-model="timeForm.second" v-if="timeType[cycleTime]?.showSecond" width="10rem" textType="秒" max="59" min="0" type="number">
									<template #append>秒</template>
								</bt-input>
							</el-form-item>
						</template>
					</div>
				</el-form-item>

				<!-- <div class="defineClass"> -->
				<el-form-item label=" " class="!mt-0 defineClass">
					<div class="flex items-center">
						<el-checkbox v-model="noticeForm.flock" :disabled="isFlockDisabled"> 开启进程锁</el-checkbox>
						<el-popover placement="right-start" width="440" popper-class="white-tips-popover" trigger="hover" content="">
							<div class="p-[12px]">
								<span class="text-secondary"> 在同一时间内只用一个进程在执行，若上一个进程未执行结束，下一次不执行 </span>
							</div>
							<i slot="reference" class="el-icon-question text-warning ml-[12px]"></i>
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

				<!-- </div> -->
			</el-form-item>
			<slot name="center"></slot>
			<el-form-item label="备份提醒" prop="notice" v-if="showNotice" class="!mt-1.6rem">
				<div class="flex items-center">
					<bt-select class="w-[20rem]" v-model="noticeForm.notice" :options="noticeOptions" :change="handleChange"></bt-select>
					<el-form-item label="消息通道" v-if="noticeForm.notice === 1">
						<bt-give-select v-model="noticeForm.notice_channel" :needAll="needAll" @change="onGiveSelect"></bt-give-select>
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
interface Props {
	isEdit?: boolean
	showKeyword?: boolean
	showNotice?: boolean
	needAll?: boolean
	showSecond?: boolean
	isTask?: boolean
	labelWidth?: string
	showStopWeb?: boolean
	stopSite?: boolean
}
const props = withDefaults(defineProps<Props>(), {
	isTask: false, //是否是任务编排
	isEdit: false,
	showKeyword: false,
	showNotice: true,
	needAll: false,
	showSecond: false,
	labelWidth: '',
	showStopWeb: false,
	stopSite: true,
})
const WebStopSite = ref(props.stopSite)

const emit = defineEmits(['crontab', 'siteWeb'])

const {
	refs: { timeForm, noticeForm, msgData, timeFormRules },
	clearTimeForm,
} = getGlobalStore()

const form = ref()
const cycleTime = ref(0)
const isFlockDisabled = ref(false)

let timeType = ref([
	{
		type: 'day',
		text: '每天',
		showDay: false,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'day-n',
		text: 'N天',
		showDay: true,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'hour',
		text: '每小时',
		showDay: false,
		showHour: false,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'hour-n',
		text: 'N小时',
		showDay: false,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'minute-n',
		text: 'N分钟',
		showDay: false,
		showHour: false,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'week',
		text: '每周',
		showDay: false,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
	{
		type: 'month',
		text: '每月',
		showDay: true,
		showHour: true,
		showMinute: true,
		showSecond: false,
	},
])
const rule = {
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
				} else if (timeForm.value.type === 'hour-n' && Number.parseInt(value) === 0 && Number.parseInt(timeForm.value.minute) === 0) {
					callback(new Error('小时和分钟不能同时为0'))
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
				} else if (timeForm.value.type === 'hour-n' && Number.parseInt(value) === 0 && Number.parseInt(timeForm.value.hour) === 0) {
					// n小时n分钟不能同时为0
					callback(new Error('小时和分钟不能同时为0'))
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
}

const onGiveSelect = (val: string) => {
	noticeForm.value.notice_channel = val
}

const timeTypeChange = (val: string) => {
	form.value.clearValidate()
}

const handleChange = (val: number) => {
	noticeForm.value.notice = val
	if (val === 1) noticeForm.value.notice_channel = 'all'
}

/**
 * @description 周期变化
 */
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
	if (timeForm.value.type === 'second-n') {
		noticeForm.value.flock = false
		isFlockDisabled.value = true
	} else {
		isFlockDisabled.value = props.isEdit
	}
	if (form.value) form.value.clearValidate()
	// 任务编排自定义显示判断
	val == 'custom' ? emit('crontab', true) : emit('crontab', false)
}

const stopSiteHancel = (val: any) => {
	emit('siteWeb', val)
}

watchEffect(() => {
	// 监听timeForm表单数据变化，变化后更新选项数据
	handleTypeChange(timeForm.value.type)
})

onMounted(() => {
	handleTypeChange(timeForm.value.type, true)
	if (props.showSecond) {
		timeType.value.push({
			type: 'second-n',
			text: 'N秒',
			showDay: false,
			showHour: false,
			showMinute: false,
			showSecond: true,
		})
	}
	timeType.value.push({
		type: 'sweek',
		text: '自定义',
		showDay: false,
		showHour: true,
		showMinute: true,
		showSecond: false,
	})
	if (props.isTask) {
		timeType.value.push({
			type: 'custom',
			text: '自定义',
			showDay: false,
			showHour: false,
			showMinute: false,
			showSecond: false,
		})
	}
})

defineExpose({ form })
</script>

<style lang="css" scoped>
:deep(.el-input-group__append) {
	padding: 0 10px !important;
}
.el-form-item-item {
	margin: 0 !important;
}
.defineClass {
	margin-left: -90px !important;
}
:deep(.week-css .el-input__inner) {
	height: 32px !important;
}
</style>
