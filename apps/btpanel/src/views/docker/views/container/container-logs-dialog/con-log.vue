<template>
	<div class="flex flex-col">
		<!-- <bt-removed-tips tips="日志切割功能将在下个正式版本被移除"></bt-removed-tips>

		<div class="flex items-center border-light border-b pb-[1rem]">
			<span>日志切割</span>
			<el-switch v-model="logCut" class="ml-[.7rem]" @change="toggleCutLog" />
			<span class="ml-[2rem]">
				<span>开启后每天2点0分进行切割日志文件，如需修改请点击</span>
				<span class="bt-link" @click="editConfig"> 编辑配置 </span>
			</span>
		</div> -->
		<div>
			<div class="flex items-center justify-between">
				<div class="btnGroup flex my-[1.6rem] items-center">
					<el-button type="default" size="default" @click="getLog(true)">刷新日志</el-button>
					<div class="line mx-[1rem] w-[.1rem] h-[2rem] bg-darker align-middle"></div>
					<el-button type="default" size="default" @click="downloadLog">下载日志</el-button>
					<el-button type="default" size="default" @click="clearLog">清空日志</el-button>
				</div>
				<div class="action flex items-center relative">
					<bt-radio class="container-custom-radio" :class="isDate ? 'w-[21.5rem]' : ''" type="button" v-model="day" :options="options" @change="setQuick" />
					<el-button :style="isDate ? 'background:var(--el-color-primary); color:var(--el-color-white);margin: 0 0 0 0rem;' : 'margin: 0 0 0 1rem;'" @click="openDatePicker">
						{{ isDate ? `${formatTime(dateData.date[0], 'yyyy-MM-dd')} - ${formatTime(dateData.date[1], 'yyyy-MM-dd')}` : '自定义时间' }}
					</el-button>
					<el-date-picker v-model="datePicker" class="!absolute left-[21.9rem]" ref="datePickerRef" type="daterange" range-separator="" start-placeholder="自定义时间" end-placeholder="" :default-time="defaultTime" :disabled-date="pickerOptions.disabledDate" @change="changeDate"> </el-date-picker>
				</div>
			</div>
			<div class="h-[54rem] overflow-y-auto">
				<bt-log
					class="h-full"
					:content="log.logs"
					:fullScreen="{
						title: `全屏查看容器${compData.name ? `【${compData.name}】` : ''}日志`,
						onRefresh: getLog,
					}" />
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { formatTime } from '@utils/index'
import { defaultTime, options, pickerOptions, dateData, isDate, datePicker, day, log, getLog, downloadLog, clearLog, setQuick, setDate, changeDate, initLog, unMountLogHandle } from './useController'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const datePickerRef = ref() // 日期选择器ref

// 打开日期选择器
const openDatePicker = () => {
	setDate(datePickerRef)
}

onMounted(() => initLog(props))
onUnmounted(() => unMountLogHandle())
</script>
<style lang="css" scoped>
:deep(.el-range-editor.el-input__wrapper) {
	@apply w-[.1rem] opacity-0;
}
:deep(.el-icon.el-input__icon.el-range__icon) {
	@apply hidden;
}

:deep(.container-custom-radio .el-radio-button__inner) {
	@apply h-[3rem] inline-flex items-center;
}
</style>
