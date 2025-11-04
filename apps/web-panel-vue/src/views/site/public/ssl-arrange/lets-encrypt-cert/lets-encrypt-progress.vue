<template>
	<div class="h-full overflow-auto bg-[#222] text-white">
		<pre v-html="applyLog" class="whitespace-pre-wrap p-[1rem]"></pre>
	</div>
</template>

<script lang="ts" setup>
import { applyLog, applyTimer, getApplyLog } from './useController'

onMounted(() => {
	getApplyLog()
})

onBeforeUnmount(() => {
	clearInterval(applyTimer.value)
	applyLog.value = '正在申请证书，请稍候...'
})
</script>
