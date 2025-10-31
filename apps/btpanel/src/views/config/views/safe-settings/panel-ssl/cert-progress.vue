<template>
	<div class="h-full overflow-auto bg-[#222] text-white">
		<pre v-html="applyLog" class="whitespace-pre-wrap p-[1rem]"></pre>
	</div>
</template>

<script lang="ts" setup>
import { getComposerLine } from '@/api/config'

const applyLog = ref('正在申请证书...')
const applyTimer = ref() // 申请证书定时器

const getApplyLog = async () => {
	applyTimer.value = setInterval(async () => {
		try {
			const { data } = await getComposerLine({
				filename: '/www/server/panel/logs/letsencrypt.log',
				num: 10,
			})
			applyLog.value = data.msg
		} catch (error) {
			clearInterval(applyTimer.value)
		}
	}, 2000)
}
onMounted(() => {
	getApplyLog()
})

onBeforeUnmount(() => {
	clearInterval(applyTimer.value)
})
</script>
