<template>
	<div class="pb-[1rem] px-16px">
		<bt-table-group>
			<template #content>
				<bt-table ref="fileTableRef" height="40rem" :column="tableColumn" :description="'列表为空'" :data="historyList"></bt-table>
			</template>
			<template #footer-left>
				<bt-table-batch :table-ref="fileTableRef" :options="batchOptions"></bt-table-batch>
			</template>
		</bt-table-group>
	</div>
</template>

<script setup lang="ts">
import type { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import type { TableColumnProps } from '@/components/data/bt-table/types'

import { useCreateEditorTabs } from '@files/public/ace/useMethods'
import { getFileHistory, fileHistoryDel, reHistory } from '@api/files'

import { useConfirm, useDataHandle, useMessage } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'

const Message = useMessage()

const fileTableRef = ref<any>() // 表格ref
const historyList = ref<any>([]) // 历史记录列表

/**
 * @description: 恢复
 * @param row 行数据
 */
const recoverEvent = async (row: any) => {
	await useConfirm({
		title: `恢复历史文件`,
		content: `是否恢复历史文件 ${row.time}?恢复历史文件后，当前文件内容将会被替换！`,
	})
	useDataHandle({
		loading: '正在恢复历史文件，请稍后...',
		request: reHistory({
			filename: row.filepath,
			history: row.historys[0],
		}),
		success: (res: any) => {
			if (res.status) {
				Message.success('恢复成功')
				// useCreateEditorTabs({
				// 	path: row.filepath,
				// 	title: row.fileName,
				// 	type: 'editor',
				// })
				getHistory()
			} else {
				Message.error('恢复失败')
			}
		},
	})
}

/**
 * @description: 删除
 * @param row 行数据
 */
const delEvent = async (row: any) => {
	await useDataHandle({
		loading: '正在删除历史文件，请稍后...',
		request: fileHistoryDel({ id: row.id }),
		message: true,
		success: getHistory,
	})
}

const tableBatchOpions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '删除',
			value: 'delete',
			event: async (batchConfirm, nextAll, selectedList, options, clearSelection) => {
				const requestHandle = async (item: any) => await fileHistoryDel({ id: item.id })
				await batchConfirm({
					title: '批量删除',
					content: '批量删除选中，是否继续操作？',
					column: [{ prop: 'filepath', label: '文件路径' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
					onConfirm: async () => {
						await nextAll(requestHandle) // 递归操作所有选中的数据
						getHistory() // 执行完毕的代码，刷新列表
						// 返回false则不关闭弹窗
						return false
					},
				})
			},
		},
	]
}

// 表格列
const tableColumn = [
	useCheckbox(),
	{
		label: '操作时间',
		prop: 'time',
		width: 180,
		render(row: any) {
			return h('span', {}, row.time)
		},
	},
	{
		label: '文件路径',
		prop: 'filepath',
		render(row: any) {
			return h('span', {}, row.filepath)
		},
	},
	useOperate([
		{
			title: '恢复',
			isHide: (row: any) => row.historys?.length === 0,
			onClick: recoverEvent,
		},
		{
			title: '删除',
			onClick: delEvent,
		},
	]),
]

/**
 * @description 获取历史记录
 */
const getHistory = async () => {
	await useDataHandle({
		request: getFileHistory(),
		data: [Array, historyList],
	})
}

const batchOptions = tableBatchOpions()

onMounted(() => {
	getHistory()
})
</script>
