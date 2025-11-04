<template>
	<div ref="logPopupCon" class="bg-[#222] text-white w-full h-full" :style="`height: ${mainHeight - 170}px;`">
		<pre class="p-[12px] w-full flex items-start overflow-y-auto h-full pre-box">
			<code class="flex-1 w-full p-0 bg-none whitespace-pre-line text-i text-disabled" v-html="logData"></code>
		</pre>
	</div>
</template>
<script setup lang="tsx">
import { useGlobalStore } from '@/store/global'
import { getScanPerceptionRealTimeLog } from '@/api/firewall'

const { mainHeight } = useGlobalStore()
const logPopupCon = ref()
const logData = ref({})

const init = async () => {
	const { data } = await getScanPerceptionRealTimeLog()
	logData.value = data.msg
	// 滚动到pre的底部
	nextTick(() => {
		const el: any = document.querySelector('.pre-box')
		el.scrollTop = el.scrollHeight
	})
}
init()
</script>
