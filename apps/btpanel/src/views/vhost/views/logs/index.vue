<template>
	<div>
		<version-compare />
		<BtTableGroup>
			<template #header-left>
				<bt-button @click="deleteLogEvent(refresh)">清除日志</bt-button>
				<div class="flex items-center ml-1rem" @click="npsSurveyV2Dialog({ name: '用户管理', type: 35, id: 62 })">
					<i class="svgtofont-desired text-medium mr-[4px]"></i>
					<span class="bt-link">需求反馈</span>
				</div>
			</template>
			<template #header-right>
				<BtTableCategory class="!w-[140px] mr-[10px]" />
				<BtSearch placeholder="请输入用户名称" class="!w-[270px] mr-[10px]" />
				<BtRefresh />
			</template>
			<template #content><BtTable :min-height="mainHeight" /></template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right><BtPage /></template>
		</BtTableGroup>
	</div>
</template>

<script lang="tsx" setup>
import VersionCompare from '@/views/vhost/public/version-compare.vue'
import { useDynamicTable, useRefresh } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { npsSurveyV2Dialog } from '@/public'
import { useLogsStore } from './useStore'
import { deleteLogEvent } from './useController'
const { mainHeight } = useGlobalStore()
const { columns, getLogsList } = useLogsStore()

const { BtTable, BtSearch, BtRefresh, BtPage, refresh } = useDynamicTable({
	request: getLogsList,
	columns: columns.value,
	extension: [useRefresh()],
})
</script>

<style lang=""></style>
