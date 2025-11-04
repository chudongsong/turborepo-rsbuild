<template>
	<div class="px-15 py-10" v-bt-loading="hisLoading">
		<el-timeline class="overflow-auto h-[46rem] px-2px">
			<el-timeline-item v-for="(item, index) in histVersion" :key="`${index}`" size="large" :timestamp="`${item.addtime} - ${item.title}`" placement="top">
				<div v-html="item.body" class="p-5 leading-8 text-base !text-secondary border border-light rounded-base"></div>
			</el-timeline-item>
		</el-timeline>
		<div class="absolute -top-[3.2rem] left-[9rem]">
			<bt-link class="!fixed" href="https://www.bt.cn/new/update_log.html" target="_blank">>>查看更多</bt-link>
		</div>
	</div>
</template>
<script setup lang="ts">
import HOME_HEADER_STORE from '@home/views/header/store'
import { storeToRefs } from 'pinia'

const store = HOME_HEADER_STORE()
const { hisLoading, histVersion } = storeToRefs(store)

onMounted(() => {
	store.getHistoryVersion()
})
</script>
