<template>
	<div>
		<bt-table-group v-show="!taskShowVisible">
			<template #header-left>
				<el-button type="primary" @click="onShowAdd()"> 添加发送任务 </el-button>
				<header-nav-tools class="ml-16px" />
			</template>
			<template #content>
				<BtTable :min-height="mainHeight" />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</bt-table-group>
		<!-- 添加/编辑任务 -->
		<template v-if="taskShowVisible">
			<task-form v-model:show="taskShowVisible" :is-edit="formModal.isEdit" :title="formModal.title" :row="formModal.row" :refresh="refresh"> </task-form>
		</template>
	</div>
</template>

<script lang="tsx" setup>
import { useAllTable, useDialog, useConfirm, useDataHandle } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { useGlobalStore } from '@/store/global'
import { formatTime, getPageTotal } from '@/utils'
import TaskForm from './form/index.vue'
import { onShowAdd } from './useMethod'
import { taskShowVisible } from '../useMethod'
import { getTaskList, setPauseTask, deleteTask } from '@/api/mail'
import HeaderNavTools from '@/views/mail/public/header-nav-tools.vue'
const { mainHeight } = useGlobalStore()

const formModal = ref({
	isEdit: false,
	title: '',
	row: undefined,
})

const { BtTable, BtPage, BtRefresh, BtTableCategory, BtRecommendSearch, BtColumn, BtBatch, BtErrorMask, refresh } = useAllTable({
	request: async data => {
		let params = {
			p: data.p,
			size: data.limit,
		}
		const { data: message } = await getTaskList(params)
		return {
			data: message.data || [],
			total: getPageTotal(message.page) || 0,
		}
	},
	columns: [
		{
			prop: 'created',
			label: '时间',
			width: 180,
			render: row => formatTime(row.created),
		},
		{
			prop: 'subject',
			label: '邮件主题',
			showOverflowTooltip: true,
		},
		{
			prop: 'addresser',
			label: '发件人',
			width: 160,
			showOverflowTooltip: true,
		},
		{
			prop: 'recipient_count',
			label: '收件人',
			width: 160,
		},
		{
			prop: 'success_count',
			label: '成功',
			width: 90,
			render: row => {
				if (row.task_process === 2) {
					return row.recipient_count - row.count.error_count
				}
				return '--'
			},
		},
		{
			prop: 'error_count',
			label: '失败',
			width: 90,
			render: row => {
				if (row.task_process === 2) {
					return (
						<a
							class="bt-link !text-danger"
							href="javascript:;"
							onClick={() => {
								onShowFail(row)
							}}>
							{row.count.error_count}
						</a>
					)
				}
				return '--'
			},
		},
		{
			prop: 'task_process',
			label: '状态',
			width: 90,
			render: row => {
				if (row.task_process === 0) return <span class="text-warning"> 待处理 </span>
				if (row.task_process === 1) return <span class="text-warning"> 执行中 </span>
				return '完成'
			},
		},
		{
			prop: 'remark',
			label: '备注',
			showOverflowTooltip: true,
		},
		useOperate((row: any) => {
			return [
				{
					title: '编辑',
					// isHide: (row: any) => row.task_process !== 0 && row.pause !== 0,
					onClick: () => {
						onShowEdit(row)
					},
				},
				{
					title: '查看',
					// isHide: (row: any) => row.task_process === 0 && row.pause === 0,
					onClick: () => {
						onShowDetails(row)
					},
				},
				{
					title: row.task_process ? '暂停' : '发送',
					isHide: (row: any) => row.task_process === 2,
					onClick: () => {
						onSetStatus(row)
					},
				},
				{
					title: '删除',
					onClick: () => {
						onDel(row)
					},
				},
			]
		}),
	],
})

const onShowDetails = (row: any) => {
	useDialog({
		title: `查看【${row.subject || ''}】`,
		area: 64,
		compData: {
			row,
			onAdd: onShowAdd,
		},
		component: () => import('./details/index.vue'),
	})
}

const onShowFail = (row: any) => {
	useDialog({
		title: `错误日志【${row.subject}】`,
		area: 70,
		compData: {
			row,
		},
		component: () => import('./fail/index.vue'),
	})
}

const onShowEdit = (row: any) => {
	formModal.value.row = row
	formModal.value.isEdit = true
	taskShowVisible.value = true
}

const onDel = async (row: any) => {
	useConfirm({
		title: '删除任务',
		content: `是否删除【${row.subject}】任务？`,
		onConfirm: async () => {
			useDataHandle({
				loading: '正在删除任务，请稍候...',
				message: true,
				request: deleteTask({ task_id: row.id }),
				success: () => {
					refresh()
				},
			})
		},
	})
}

const onSetStatus = (row: any) => {
	useConfirm({
		title: `更改任务状态【${row.subject}】`,
		content: row.task_process ? '暂停任务后，可以继续发送任务！' : '立即开始发送任务吗？',
		onConfirm: async () => {
			useDataHandle({
				loading: '正在处理，请稍候...',
				message: true,
				request: setPauseTask({ task_id: row.id, pause: row.task_process ? 1 : 0 }),
				success: () => {
					refresh()
				},
			})
		},
	})
}

watch(taskShowVisible, val => {
	if (!val) {
		formModal.value.row = undefined
		formModal.value.isEdit = false
		formModal.value.title = ''
	}
})
</script>

<style scoped lang="scss"></style>
