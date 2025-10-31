<template>
	<div class="h-full" v-bt-loading="logLoading">
		<template v-if="isBindExtranet">
			<div v-if="siteType === 'proxy'" class="mb-[16px]">日志大小：{{ errorLogData.size }}</div>
			<div class="flex">
				<BtLog
					:content="errorLogData.logs"
					:isHtml="true"
					:fullScreen="{
						title: `全屏查看[错误]日志`,
						onRefresh: getErrorLogs,
					}"
					:style="{ height: '56rem', width: '99.5%' }" />
			</div>
		</template>
		<div class="bg-light flex items-center justify-center h-full" style="min-height: 500px" v-else>
			<div class="bg-lighter px-[48px] py-[16px] text-default flex items-center">
				请开启
				<bt-link class="mx-[.4rem]" @click="jumpTabEvent('mapping')"> 外网映射 </bt-link>
				后查看
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import BtLog from '@/components/extension/bt-log/index.vue'
import { useSiteStore, SITE_STORE } from '@site/useStore'
import { logLoading, errorLogData, getErrorLogs } from './useController'

const { isBindExtranet, siteType } = useSiteStore()
const { jumpTabEvent } = SITE_STORE()

onMounted(getErrorLogs)

defineExpose({ init: getErrorLogs })
</script>
