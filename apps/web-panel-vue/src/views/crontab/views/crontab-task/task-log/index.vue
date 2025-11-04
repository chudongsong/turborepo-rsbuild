<template>
	<div class="p-[20px]">
		<div class="pb-2rem flex gap-2rem leading-2rem">
			<div class="max-w-[54rem] truncate">日志路径：{{ logInfo.log_path }}</div>
			<div class="w-[20rem] truncate" :title="`大小：${logInfo.size}`">大小： {{ logInfo.size }}</div>
		</div>
		<div class="flex justify-between items-end">
			<div class="flex items-center">
				<div class="flex refresh-btn">
					<bt-time-refresh :refreshFn="() => getLog(true)" :session-config.sync="refreshForm" @save="setSessionData"></bt-time-refresh>
				</div>
				<el-button @click="logEvent"> 清空日志 </el-button>
				<el-divider direction="vertical" class="!h-[2rem] !mx-1rem"></el-divider>
				<el-button @click="startTask">执行任务</el-button>
				<!-- <el-button @click="executeScript">重装Crontab</el-button> -->
			</div>
			<div class="flex items-center relative">
				<!-- <bt-radio type="button" v-model="btnActive" :options="logsTimeOptions" @change="setActive" class="control-btn"></bt-radio> -->
				<el-button-group size="default" class="control-btn">
					<el-button v-for="(item, index) in logsTimeOptions" :key="index" :type="btnActive === index ? 'primary' : ''" @click="setActive(item.value)">
						{{ item.label }}
					</el-button>
				</el-button-group>
				<el-date-picker
					v-model="customTime"
					type="daterange"
					ref="player"
					align="right"
					size="default"
					class="!absolute right-0 top-0 opacity-0 !w-0 !h-0"
					range-separator=""
					start-placeholder="开始日期"
					end-placeholder="结束日期"
					:disabled-date="disabledDate"
					:default-time="defaultTime"
					@change="selectTime" />
			</div>
		</div>

		<div class="pre-box bg-[#333] mt-[12px] text-white h-[48rem] overflow-auto p-[20px]">
			<pre class="whitespace-pre-wrap" v-html="logMsg"></pre>
		</div>
		<bt-help :options="list" list-style="disc" class="mt-[1rem] mx-[1rem]"> </bt-help>
		<bt-dialog title="正在检查Crontab，请耐心等候" v-model="logDialog" :area="[60]">
			<div class="flex-wrap">
				<bt-log class="h-[40rem] !rounded-none" :content="logContent" />
			</div>
		</bt-dialog>
	</div>
</template>

<script lang="tsx" setup>
import { openPath, isShowTip } from '../useController'
import { player, logsTimeOptions, logInfo, logDialog, btnActive, customTime, refreshForm, defaultTime, logMsg, logContent, startTask, getLog, setActive, setSessionData, logEvent, executeScript, disabledDate, selectTime, initLog } from './useController'

const emit = defineEmits(['close'])

const list = computed(() => {
	return [
		// 列表有保存数量 以及 查看 功能得 显示提示
		...(isShowTip.value
			? [
					{
						content: (
							<span class="bt-link" onClick={() => openPath(close)}>
								一键跳转至本地备份目录
							</span>
						),
					},
			  ]
			: []),
		{
			content: () => (
				<span>
					若您发现任务无法定时执行，可尝试点击
					<span class="bt-link" onClick={() => executeScript()}>
						【重装Crontab】
					</span>
					进行重新安装
				</span>
			),
		},
	]
})

const close = () => {
	emit('close')
}

onMounted(initLog)
</script>
<style lang="css" scoped>
.control-btn .el-radio-button__inner {
	line-height: 32px;
	height: 32px;
}
</style>
