<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="onShowAdd">添加</el-button>
				<header-nav-tools class="ml-16px" />
			</template>
			<template #header-right>
				<BtSearch class="!w-[240px]" placeholder="请输入名称" @search="refresh"> </BtSearch>
			</template>
			<template #content>
				<BtTable> </BtTable>
			</template>
			<template #footer-left>
				<BtBatch> </BtBatch>
			</template>
			<template #footer-right>
				<BtPage> </BtPage>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="tsx" setup>
import { isObject, formatTime } from '@/utils'
import { copyText } from '@/utils'
import { Message, useAllTable, useBatch, useConfirm, useDataHandle, useDialog } from '@/hooks/tools'
import { delMassMailList, getMassMailList } from '@/api/mail'
import { showContacts } from '@mail/views/market/useMethod'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'

import MailForm from './form.vue'
import { assembBatchResults, openResultView } from '@/public'
import HeaderNavTools from '@/views/mail/public/header-nav-tools.vue'

const formModal = reactive({
	show: false,
	title: '',
	data: {
		isEdit: false,
		row: null as any,
		refresh: () => {
			refresh()
		},
	},
})

const onShowAdd = () => {
	formModal.data.row = null
	formModal.data.isEdit = false
	formModal.title = '添加分组'
	useDialog({
		title: '添加分组',
		component: MailForm,
		compData: formModal.data,
		area: 40,
		showFooter: true,
	})
}

const onShowEdit = (row: any) => {
	formModal.data.row = row
	formModal.data.isEdit = true
	formModal.title = '编辑分组'
	useDialog({
		title: '编辑分组',
		component: MailForm,
		compData: formModal.data,
		area: 40,
		showFooter: true,
	})
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
				column: [{ label: '群组名称', prop: 'mail_type' }, useBatchStatus()],
				onConfirm: async () => {
					let resultData: any[] = []
					await nextAll(async (data: any) => {
						const res = await delMassMailList({ ids: data.id })
						resultData.push({
							name: data.mail_type,
							status: res.status,
							message: res.msg,
							msg: res.msg,
						})
					})
					openResultView(resultData, { title: '删除' })
					refresh()
				},
			})
		},
	},
])

const { BtTable, BtPage, BtRefresh, BtColumn, BtBatch, refresh, BtSearch } = useAllTable({
	request: async data => {
		const { data: message } = await getMassMailList(data)
		return {
			data: message.data || [],
			total: message.total || 0,
		}
	},
	columns: [
		useCheckbox(),
		{
			prop: 'mail_type',
			label: '群组名称',
			render: row => {
				return (
					<a
						class="bt-link"
						href="javascript:;"
						onClick={() => {
							showContacts(row.id)
						}}>
						{row.mail_type}
					</a>
				)
			},
		},
		{
			prop: 'subscribers',
			label: '订阅',
			align: 'center',
		},
		{
			prop: 'unsubscribers',
			label: '取消订阅',
			align: 'center',
		},
		{
			prop: 'created',
			label: '添加时间',
			render: row => formatTime(row.created),
		},
		useOperate((row: any) => [
			{
				title: '复制链接',
				isHide: (row: any) => true,
				onClick: () => {
					copyText(row.subscribe_url)
				},
			},
			{
				title: '重命名',
				onClick: () => {
					onShowEdit(row)
				},
			},
			{
				title: '删除',
				onClick: () => {
					if (row.subscribers || row.unsubscribers) {
						Message.error('请先修改或删除此类型下的取消订阅或订阅者，才能继续删除	')
						return
					}
					useConfirm({
						title: '删除',
						content: `确定删除【${row.mail_type}】分组吗？`,
						onConfirm: async () => {
							useDataHandle({
								loading: '正在删除',
								message: true,
								request: delMassMailList({ ids: row.id }),
								success: () => {
									refresh()
								},
							})
						},
					})
				},
			},
		]),
	],
	extension: [useTableBatch],
})

defineExpose({
	init: refresh,
})
</script>
