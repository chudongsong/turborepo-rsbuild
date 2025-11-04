<template>
	<div class="time-control flex relative">
		<el-button-group class="control-btn">
			<el-button v-for="(item, index) in btnGroup(type)" :key="index" :type="btnActive === index ? 'primary' : ''" @click="item.event">
				{{ item.content }}
			</el-button>
		</el-button-group>
		<el-date-picker
			type="daterange"
			v-model="customTime"
			range-separator=""
			start-placeholder="开始日期"
			end-placeholder="结束日期"
			:teleported="false"
			:show-after="100"
			ref="player"
			class="!absolute -z-1 !w-[92px] !h-[30px] right-0"
			popper-class="custom-day-picker"
			:default-time="pickerOptions.defaultTime"
			:disabled-date="pickerOptions.disabledDate"
			format="YYYY/MM/DD"
			value-format="x"
			@change="selectTime(customTime, type)"
			@visible-change="visiblePicker">
		</el-date-picker>
	</div>
</template>

<script lang="ts" setup>
import { days, changeAllDay as cutDays } from '../useController'

interface Props {
	type: string
}

const props = withDefaults(defineProps<Props>(), {
	type: 'network',
})

const emits = defineEmits(['cut-day-click'])

const status = ref<string>('')
const btnActive = ref<number>(1)
const player = ref() //获取时间选择器
const customTime = ref([])

//标记当前选择的天数按钮
const btnGroup = (type: string) => {
	return [
		{
			content: '昨天',
			active: false,
			event: () => {
				btnActive.value = 0
				cutDays(1, type)
			},
		},
		{
			content: '今天',
			active: true,
			event: () => {
				btnActive.value = 1
				cutDays(0, type)
			},
		},
		{
			content: '最近七天',
			active: false,
			event: () => {
				btnActive.value = 2
				status.value = '最近七天'
				cutDays(7, type)
			},
		},
		{
			content: '自定义时间',
			active: false,
			event: () => {
				btnActive.value = 3
				player.value.focus() //出发时间选择器
				emits('cut-day-click')
				const elements = document.querySelectorAll('.custom-day-picker')
				const list: string[] = []
				elements.forEach(element => {
					// 将字符串形式的zIndex转换为数字
					list.push((element as HTMLElement).style.zIndex)
				})
				const indexOfMaxValue = list.reduce((maxIndex, currentElement, currentIndex, array) => {
					return currentElement > array[maxIndex] ? currentIndex : maxIndex
				}, 0)
				// 隐藏zIndex不是最高的所有元素
				elements.forEach((element, index) => {
					if (index !== indexOfMaxValue) {
						;(element as HTMLElement).style.display = 'none'
					}
				})
			},
		},
	]
}

const pickerOptions = reactive({
	disabledDate: (time: Date) => {
		// return time.getTime() > Date.now()
		// 获取当前日期
		const today = new Date()
		// 将时间设置为23:59:59
		today.setHours(23, 59, 59, 999)
		// 获取时间戳
		const timestamp = today.getTime()
		// 禁用的时间
		const thirtyDaysAgo = new Date(today.getTime() - days.value * 24 * 3600 * 1000)
		return time.getTime() < thirtyDaysAgo.getTime() || time.getTime() > timestamp
	},
	defaultTime: [new Date(), new Date()] as [Date, Date],
})
/**
 * @description: 选择时间
 * @param time 		选择的时间
 */
const selectTime = (time: number[], type: string) => {
	status.value = '自定义时间'
	time[0] = new Date(time[0]).setHours(0, 0, 0, 0)
	time[1] = new Date(time[1]).setHours(23, 59, 59, 0)
	time = [Math.floor(time[0] / 1000), Math.floor(time[1] / 1000)]
	cutDays(time, type)
}

const visiblePicker = (show: boolean) => {
	if (!show) {
		const elements = document.querySelectorAll('.custom-day-picker')
		elements.forEach(element => {
			;(element as HTMLElement).style.display = 'none'
		})
	}
}
</script>

<style lang="css" scoped>
.el-button:nth-child(n + 2) {
	margin-left: 0;
	border-left: 0;
}

:deep(.el-button + .el-button) {
	@apply ml-[0rem];
}

:deep(.el-button-group > .el-button:not(:last-child)) {
	@apply mr-0;
}
.time-control :deep(.el-date-editor) {
	opacity: 0;
}
</style>
