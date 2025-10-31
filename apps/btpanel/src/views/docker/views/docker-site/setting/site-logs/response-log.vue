<template>
	<div class="h-full">
		<div>日志大小：{{ responseLogData.size }}</div>

		<bt-log
			v-bt-loading="logLoading"
			class="mt-[16px]"
			:content="responseLogData.logs"
			:isHtml="true"
			:fullScreen="{
				title: `全屏查看[响应]日志`,
				onRefresh: getResLogs,
			}"
			:style="{ height: '58rem', width: '99.5%' }" />
	</div>
</template>

<script setup lang="tsx">
import BtLog from '@/components/extension/bt-log/index.vue'
import { getResLogs, initResLog, logLoading, responseLogData } from './useController'

onMounted(initResLog)
</script>
