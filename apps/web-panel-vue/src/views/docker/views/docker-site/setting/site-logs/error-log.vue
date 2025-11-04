<template>
	<div class="h-full" v-bt-loading="logLoading">
		<div class="mb-[1.6rem]">日志大小：{{ errorLogData.size }}</div>
		<div class="flex">
			<BtLog
				:content="errorLogData.logs"
				:isHtml="true"
				:fullScreen="{
					title: `全屏查看[错误]日志`,
					onRefresh: getErrorLogs,
				}"
				:style="{ height: '58rem', width: '99.5%' }" />
		</div>
	</div>
</template>

<script setup lang="tsx">
import BtLog from '@/components/extension/bt-log/index.vue'
import { logLoading, errorLogData, getErrorLogs } from './useController'

onMounted(getErrorLogs)
</script>
