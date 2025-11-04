<!--  -->
<template>
	<div class="p-2rem">
		<div class="py-[12px] px-[16px]">
			<div class="flex justify-between mb-[4px]">
				<div class="download-speed-top-title">正在扫描中，扫描进度...</div>
				<div class="download-speed-top-score">{{ percentum }}%</div>
			</div>
			<bt-progress :strokeWidth="5" :percentage="percentum" :showText="false"></bt-progress>
		</div>
	</div>
</template>

<script setup lang="ts">
import { LOG_ANALYSE_STORE } from './useStore'

const store = LOG_ANALYSE_STORE()
const { percentum } = storeToRefs(store)
</script>

<style lang="sass" scoped></style>
