<template>
	<div class="flex items-center">
		<bt-link @click="openNps">
			<div class="flex items-center">
				<span class="svgtofont-desired text-medium"></span>
				<span>需求反馈</span>
			</div>
		</bt-link>
		<bt-link class="ml-[12px]" @click="openUseExplain">
			<div class="flex items-center">
				<span class="text-small">>></span>
				<span>使用说明</span>
			</div>
		</bt-link>
	</div>
</template>

<script lang="ts" setup>
import { npsSurveyV2Dialog } from '@/public'

/**
 * @description 打开使用说明
 */
const openUseExplain = () => {
	window.open('https://www.bt.cn/bbs/thread-141971-1-1.html')
}

/**
 * @description 打开需求反馈
 */
const openNps = () => {
	npsSurveyV2Dialog({
		name: '宝塔邮局',
		type: 36,
		id: 63,
	})
}
</script>
