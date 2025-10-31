<template>
	<div>
		<div class="flex items-center justify-between mb-[12px]">
			<div class="flex items-center">
				<BtOperation />
				<span class="ml-[1.6rem]">日志大小：{{ getByteUnit(size) }}</span>
				<div class="flex items-center ml-1rem" @click="desiredNpsDialog()">
					<i class="svgtofont-desired text-medium"></i>
					<span class="bt-link">需求反馈</span>
				</div>
			</div>
			<div class="inline-flex items-center">
				<bt-input-search v-model="search" @search="getRunDataEvent" placeholder="请输入搜索关键字" class="!w-[30rem]" />
			</div>
		</div>
		<bt-log :content="logMsg" :isHtml="true" :autoScroll="true" :fullScreen="{ title: '全屏查看-运行日志', onRefresh: getRunDataEvent }" :style="`height:${mainHeight - 240}px;min-height:40rem`" />
	</div>
</template>
<script setup lang="ts">
import { useGlobalStore } from '@store/global'
import { desiredNpsDialog } from '@logs/useController'
import { getByteUnit } from '@utils/common'
import { storeToRefs } from 'pinia'
import { clearRunLogs } from './useController'
import { LOG_PANEL_STORE } from './useStore'
import { useMessage, useOperation } from '@/hooks/tools'

import BtLog from '@/components/extension/bt-log/index.vue'

const { mainHeight } = useGlobalStore() // 获取全局高度
const store = LOG_PANEL_STORE()
const { search, logMsg, size } = storeToRefs(store)
const { getRunDataEvent } = store

// 消息提示
const Message = useMessage()

// 手动刷新方法
const handleRefresh = async () => {
	await getRunDataEvent()
	Message.success('刷新成功')
}

const { BtOperation } = useOperation({
	options: [
		{
			label: '刷新日志',
			type: 'button',
			onClick: handleRefresh,
		},
		{
			label: '清空日志',
			type: 'button',
			onClick: () => clearRunLogs(),
		},
	],
})

onMounted(getRunDataEvent)
</script>
