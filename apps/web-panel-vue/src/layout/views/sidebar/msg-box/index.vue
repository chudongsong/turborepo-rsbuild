<template>
	<BtTabs />
</template>

<script setup lang="tsx">
import type { ResponsePageResult } from '@/hooks/tools/axios/types'
import { useDataHandle, useTabs } from '@/hooks/tools'
import { useGlobalStore } from '@/store/global'
import { getDataInfo } from '@api/global'
import { getPageTotal } from '@/utils'

import TaskList from './tabPanel/task-list.vue'
import CompletedList from './tabPanel/completed-list.vue'
import PerformLog from './tabPanel/perform-log.vue'

const { panel } = useGlobalStore() // 全局持久化状态
const msgBoxTaskCount = toRef(panel.value, 'msgBoxTaskCount') // 消息盒子任务总数

// // tab视图
const completedTotal = ref(0) // 消息总数
const msgBoxSockShell = ref<WebSocket | null>(null) // 消息盒子socket

// tab名称
enum TabsName {
	taskList = 'taskList',
	completedList = 'completedList',
	performLog = 'performLog',
}

// 任务列表label
const taskListLabel = computed(() => `任务列表(${msgBoxTaskCount.value})`)
// 消息列表label
const completedListLabel = computed(() => `消息列表(${completedTotal.value})`)

// 监听任务总数变化
watch(msgBoxTaskCount, (val: number, oldVal: number) => {
	if (oldVal > val) completedTotal.value += oldVal - val // 更新消息总数
})

const { BtTabs } = useTabs({
	type: 'left-bg-card',
	options: [
		{
			label: () => <>{taskListLabel.value}</>,
			name: TabsName.taskList,
			lazy: true,
			render: TaskList,
		},
		{
			label: () => <>{completedListLabel.value}</>,
			name: 'completedList',
			lazy: true,
			render: CompletedList,
		},
		{
			label: '执行日志',
			name: 'performLog',
			lazy: true,
			render: PerformLog,
		},
	],
})

/**
 * @description 获取任务总数
 * @returns {Promise<void>}
 */
const getTaskNumber = async (): Promise<void> => {
	try {
		const { page }: ResponsePageResult = await useDataHandle({
			request: getDataInfo({ table: 'tasks', search: '1', limit: 11 }),
			data: { page: String },
		})
		completedTotal.value = getPageTotal(page)
	} catch (err) {
		console.error(err)
	}
}

/**
 * @description 关闭弹框
 */
const onCancel = () => {
	// 关闭弹窗的同时终止socket服务
	if (msgBoxSockShell.value) {
		msgBoxSockShell.value.close()
		msgBoxSockShell.value = null
	}
}

onMounted(getTaskNumber)
provide('msgBoxSockShell', msgBoxSockShell) // 提供socket实例
defineExpose({ onCancel })
</script>
