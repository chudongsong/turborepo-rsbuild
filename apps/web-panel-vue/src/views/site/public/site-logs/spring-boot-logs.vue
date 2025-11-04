<!-- 项目日志 -->
<template>
	<div class="flex flex-col" v-bt-loading="logLoading">
		<div class="flex items-center">
			<span>日志路径</span>
			<bt-select v-model="logData.path" :options="pathOptions" @change="setSpringLogsPath" placeholder="请选择" class="!w-[38rem] !mx-[.8rem]"></bt-select>
		</div>
		<div class="mt-[16px]">
			<div>
				<el-button type="primary" @click="getSpringLogs">刷新日志</el-button>
				<el-button type="default" @click="openRealTimeLogs">实时日志</el-button>
			</div>

			<bt-log
				:title="`全屏查看【项目】日志`"
				:content="logData.logs"
				:isHtml="true"
				:fullScreen="{
					title: `全屏查看【项目】日志`,
					onRefresh: getSpringLogs,
				}"
				class="mt-[16px]"
				:style="{ height: logType === 'java' ? '48rem' : '64rem', width: '99.5%' }"></bt-log>
		</div>
		<bt-dialog title="查看日志" @cancel="cancelRealLogs" v-model="fullLogPopup" :area="['100%', '100%']" :close-btn="1">
			<div ref="logPopupCon" class="bg-[#333] text-white w-full h-full" :style="`height: ${mainHeight}px;`">
				<pre class="p-[12px] w-full flex items-start overflow-y-auto h-full">
					<code class="flex-1 w-full p-0 bg-none whitespace-pre-line text-i text-[#ececec]" v-html="logData.logs"></code>
				</pre>
			</div>
		</bt-dialog>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@/store/global'
import BtLog from '@/components/extension/bt-log/index.vue'
import { logLoading, logType, logData, pathOptions, fullLogPopup, logPopupCon, cancelRealLogs, getSpringLogs, initSpringBoot, openRealTimeLogs, setSpringLogsPath } from './useController'

const { mainHeight } = useGlobalStore()

onMounted(initSpringBoot)

defineExpose({ init: initSpringBoot })
</script>
