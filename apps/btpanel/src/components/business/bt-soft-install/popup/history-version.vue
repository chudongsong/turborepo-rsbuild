<template>
	<div class="p-[2rem]">
		<div class="h-[32rem] overflow-auto" v-bt-loading="historyLoad">
			<div class="log-info-item" v-for="(item, index) in historyData" :key="index" v-if="historyData?.length">
				<span class="log-info-item-active"></span>
				<div class="log-info-item-date">{{ formatTime(item.update_time) }}</div>
				<div class="log-info-item-title">
					{{ pluginModuleInfo.title + item.m_version + '.' + item.version + ' - ' + (item.beta ? '测试版' : '正式版') }}
				</div>
				<div class="log-info-item-content" v-html="item.update_msg.replace(/\n/g, '<br>')"></div>
			</div>
			<div class="flex items-center justify-center h-full" v-if="!historyData?.length">
				<span class="text-secondary">暂无日志数据</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { formatTime } from '@utils/index'
import { storeToRefs } from 'pinia'
import { INSTALL_STORE } from '../store'

const { historyData, historyLoad, pluginModuleInfo } = storeToRefs(INSTALL_STORE())
const { getHistoryVersion } = INSTALL_STORE()
onMounted(getHistoryVersion)
</script>

<style lang="css" scoped>
.log-info-item {
	@apply ml-[15rem] border-l-[0.5rem] border-light relative pt-[4px] pl-[2px];
}
.log-info-item-active {
	@apply w-[1.5rem] h-[1.5rem] bg-primary block rounded-round absolute -left-[1rem] top-[2.1rem];
	z-index: 999;
}
.log-info-item-active::after {
	@apply relative content-[''] h-[0.5rem] w-[0.5rem] block rounded-round bg-white top-[0.5rem] left-[0.5rem];
}
.log-info-item:first-child {
	color: var(--el-color-danger);
}
.log-info-item:first-child .log-info-item-active::before {
	@apply content-[''] inline-block absolute -top-[2.2rem] left-[0.5rem] h-[2.2rem] w-[0.5rem] bg-white;
	z-index: 998;
}
.log-info-item-date {
	@apply absolute -left-[14rem] top-[2rem] text-default;
}
.log-info-item-title {
	@apply border-b-[0.1rem] border-light mb-[0.4rem] text-primary pt-[8px] pb-[4px] pl-[16px] mt-[8px] ml-[4px];
}
.log-info-item-content {
	@apply leading-[2.4rem] min-h-[4rem] pl-[2rem] text-tertiary;
}
</style>
