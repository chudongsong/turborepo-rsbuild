<template>
	<div class="relative">
		<bt-table-group v-show="!formVisible">
			<template #header-left>
				<el-button type="primary" @click="onShowAdd">添加模板</el-button>
				<header-nav-tools class="ml-16px" />
			</template>
			<template #content>
				<BtTable />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage />
			</template>
		</bt-table-group>

		<template v-if="formVisible">
			<template-form v-model:show="formVisible" :data="formData" :refresh="refresh"></template-form>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { formatTime, isArray, isObject } from '@/utils'
import { useAllTable, useBatch, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { addMailTemplate, delMailTemplate, getMailTemplateList } from '@/api/mail'
import { showAddTemplate } from '../controller'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'

import TemplateForm from './form.vue'
import TemplatePreview from './preview.vue'
import HeaderNavTools from '@/views/mail/public/header-nav-tools.vue'
const formVisible = ref(false)

const formData = ref<any>(null)

const onShowAdd = async () => {
	const name = `template_${formatTime(new Date(), 'yyyyMMddHHmmss')}`
	const { data: { data } } = await addMailTemplate({ temp_name: name, type: 1 })
	refresh()
	if (isObject<{ data: any }>(data)) {
		formData.value = data
		formVisible.value = true
	}
}

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm, nextAll, selectedList, options) => {
			await batchConfirm({
				title: '批量删除',
				content: '确定删除选定项吗？',
				column: [{ label: '模板名称', prop: 'name' }, useBatchStatus()],
				onConfirm: async () => {
					useDataHandle({
						loading: '删除中...',
						message: true,
						request: delMailTemplate({ id: selectedList.value.map((item: any) => item.id) }),
						success: () => {
							refresh()
						}
					})
				}
			})
		}
	}
])

const { BtTable, BtPage, BtRefresh, BtColumn, BtBatch, refresh, BtSearch } = useAllTable({
	request: async data => {
		const { data: message } = await getMailTemplateList({
			p: data.p,
			size: data.limit,
		})
		return {
			data: message.data || [],
			total: message.total || 0,
		}
	},
	columns: [
		useCheckbox(),
		{
			prop: 'name',
			label: '名称',
		},
		{
			prop: 'created',
			label: '创建时间',
			render: row => formatTime(row.created),
		},
		useOperate((row: any) => [
			{
				title: '创建任务',
				onClick: () => {
					showAddTemplate(row.id)
				},
			},
			{
				title: '查看',
				onClick: () => {
					onShowPreview(row)
				},
			},
			{
				title: '编辑',
				onClick: () => {
					onShowEdit(row)
				},
			},
			{
				title: '删除',
				onClick: () => {
					onDelTemplate(row)
				},
			},
		])
	],
	extension: [useTableBatch],
})

const onShowPreview = (row: any) => {
	useDialog({
		title: `查看【${row.name}】`,
		area: 80,
		compData: {
			row,
		},
		component: TemplatePreview,
	})
}

const onShowEdit = (row: any) => {
	formData.value = row
	formVisible.value = true
}

const onDelTemplate = (row: any) => {
	useConfirm({
		title: `删除【${row.name}】`,
		content: '确定删除该模板吗？',
		onConfirm: async () => {
			useDataHandle({
				loading: '删除中...',
				message: true,
				request: delMailTemplate({ id: row.id }),
				success: () => {
					refresh()
				},
			})
		},
	})
}

</script>
