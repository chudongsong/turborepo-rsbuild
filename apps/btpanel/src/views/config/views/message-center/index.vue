<template>
	<bt-table-group>
		<template #header-left>
			<div class="flex items-center">
				<el-button @click="onAllRead">全部已读</el-button>
				<el-button class="ml-8px" @click="onAllDel">全部删除</el-button>
			</div>
		</template>
		<template #header-right>
			<div class="flex items-center">
				<bt-table-refresh :refresh="getList" />
			</div>
		</template>
		<template #content>
			<bt-table v-bt-loading="tableLoad" :data="tableData" :column="tableColumn" :max-height="mainHeight - 226" description="消息中心列表为空" v-bt-loading:title="'正在加载消息中心列表，请稍后...'"> </bt-table>
		</template>
		<template #footer-right>
			<bt-table-page :total="tableTotal" v-model:page="search.page" v-model:row="search.size" @change="getList" />
		</template>
	</bt-table-group>
</template>

<script lang="tsx" setup>
import type { MessageCenter } from '@config/type.d'

import { getMsgList, setDeleteAll, setReadAll } from '@/api/config'

import { useGlobalStore } from '@store/global'
import { Message, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { useCheckbox } from '@/hooks/tools/table/column'
import { formatTime } from '@/utils'

const { mainHeight } = useGlobalStore()

const tableLoad = ref(false)
const tableTotal = ref(0)
const tableData = ref<MessageCenter[]>([])

const search = reactive({
	page: 1,
	size: 10,
	is_read: true,
	sub_type: 'all',
})

/**
 * @description 获取消息列表
 */
const getList = async () => {
	await useDataHandle({
		loading: tableLoad,
		request: getMsgList(toRaw(search)),
		data: { msg_list: [Array, tableData], count: [Number, tableTotal] },
	})
}

/**
 * @description 全部已读
 */
const onAllRead = async () => {
	if (tableData.value.length === 0) return Message.error('暂无消息可设置已读')
	await useConfirm({
		icon: 'warning-filled',
		title: '全部已读',
		content: '确定将全部消息标记为已读？',
	})

	await useDataHandle({
		loading: '正在设置全部已读，请稍候...',
		request: setReadAll(),
		message: true,
		success: getList,
	})
}

/**
 * @description 全部删除
 */
const onAllDel = async () => {
	if (tableData.value.length === 0) return Message.error('暂无消息可删除')
	await useConfirm({
		icon: 'warning-filled',
		title: '全部删除',
		content: '确定删除全部消息？',
	})

	await useDataHandle({
		loading: '正在删除全部消息，请稍候...',
		request: setDeleteAll(),
		message: true,
		success: getList,
	})
}

// 显示日志
const onShowLogs = (row: MessageCenter) => {
	row.read = true
	useDialog({
		title: row.sub_type === 'push_msg' ? '' : `当前状态：${row.title}`,
		area: [75],
		compData: row,
		component: () => import('@layout/views/sidebar/msg-box/tabPanel/details.vue'),
	})
}

const tableColumn = [
	useCheckbox(),
	{
		label: '标题内容',
		minWidth: 300,
		render: (row: any) => (
			<div
				class="relative"
				onClick={() => {
					onShowLogs(row)
				}}>
				<span class="hover:(cursor-pointer text-primary)">{row.title}</span>
				<div class={!row.read ? 'dot' : ''}></div>
			</div>
		),
	},
	{ label: '提交时间', minWidth: 140, render: (row: any) => formatTime(row.create_time) },
	{
		label: '类型',
		minWidth: 160,
		render: (row: any) => <span class="py-4px px-8px text-tertiary bg-light">{row.msg_types[0]}</span>,
	},
]

onMounted(() => {
	getList()
})
</script>
