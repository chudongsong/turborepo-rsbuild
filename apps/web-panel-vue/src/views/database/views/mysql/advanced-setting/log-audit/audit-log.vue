<template>
	<div class="h-full" v-loading="loading.log">
		<!-- <div class="mb-[1.6rem]">日志大小：{{ errorLogData.size }}</div> -->
		<div class="flex">
			<BtLog
				:content="logContent"
				:fullScreen="{
					title: `全屏查看审计日志`,
					onRefresh: getAduitLogs,
				}"
				:style="{ height: '53rem', width: '99.5%' }" />
		</div>
	</div>
</template>

<script setup lang="tsx">
import BtLog from '@/components/extension/bt-log/index.vue'
import { DATABASE_MYSQL_ADVANCED_AUDIT_STORE } from './useStore';


const store = DATABASE_MYSQL_ADVANCED_AUDIT_STORE();
const { loading,logContent } = storeToRefs(store);
const {getAduitLogs} = store


onMounted(getAduitLogs)
defineExpose({
	init: getAduitLogs
})
</script>
