<template>
	<div>
		<BtTableGroup>
			<template #header-left><BtOperation /></template>
			<template #content><BtTable /></template>
			<template #footer-left>
				<div class="flex flex-col">
					<BtBatch />
					<bt-help :options="[{ content: '后缀：禁止访问的文件后缀' }, { content: '目录：规则会在这个目录内生效' }]" class="mt-4px"></bt-help>
				</div>
			</template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="ts">
import { Message, useAllTable, useBatch, useConfirm, useDataHandle, useDialog, useHandleError, useOperation, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import useWPWordpressSecurityStore from './useStore'
import { getDenyList } from './useController'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { deleteDirAuthMultiple, delFileDeny } from '@/api/site'
import { openResultDialog } from '@/views/site/useController'

const { localRow } = storeToRefs(useWPLocalStore())
const { isRefreshDenyList } = storeToRefs(useWPWordpressSecurityStore())

const { BtOperation } = useOperation({
	options: [
		{
			onClick: () => {
				useDialog({
					title: '添加拒绝访问',
					area: 48,
					component: () => import('./deny-form.vue'),
					compData: {
						isEdit: false,
						siteName: localRow.value.name,
						getList: () => {
							isRefreshDenyList.value = true
						},
					},
					btn: true,
				})
			},
			type: 'button',
			active: true,
			label: '添加拒绝访问',
		},
	],
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '删除',
		value: 'delete',
		event: async (batchCofirm, nextAll, selectedList, options) => {
			await useConfirm({
				title: '批量删除拒绝访问规则',
				content: '批量删除选中的拒绝访问规则，该操作可能会存在风险，是否继续？',
			})
			let loading = Message.load('正在删除,请稍后...')
			try {
				const results = await Promise.all(
					selectedList.value.map(async (row: any) => {
						try {
							const { data } = await delFileDeny({
								website: localRow.value.name,
								deny_name: row.name,
							})
							if (data.status) {
								return {
									name: row.name,
									status: true,
								}
							} else {
								return {
									name: row.name,
									status: false,
								}
							}
						} catch (error) {
							return {
								name: row.name,
								status: false,
							}
						}
					})
				)
				openResultDialog({
					resultData: results,
					resultTitle: '删除拒绝访问规则',
				})
				isRefreshDenyList.value = true
			} catch (error) {
				useHandleError(error)
			} finally {
				loading.close()
			}
		},
	},
])

/**
 * @description 获取表格
 */
const { BtTable, BtPage, BtRecommendSearch, BtRefresh, BtColumn, BtBatch, BtTableCategory, BtErrorMask, tableRef, classList, refresh } = useAllTable({
	request: (data: any) => {
		return getDenyList(data)
	},
	columns: [
		useCheckbox(),
		{
			label: '名称',
			prop: 'name',
		},
		{
			label: '路径',
			prop: 'dir',
		},
		useOperate([
			{
				onClick: (row: any) => {
					useDialog({
						title: '添加拒绝访问',
						area: 48,
						component: () => import('./deny-form.vue'),
						compData: {
							isEdit: true,
							siteName: localRow.value.name,
							row,
							getList: () => {
								isRefreshDenyList.value = true
							},
						},
						btn: true,
					})
				},
				title: '编辑',
			},
			{
				onClick: (row: any) => {
					useConfirm({
						title: `删除拒绝访问规则【${row.name}】`,
						content: `删除选中的规则后，访问${row.dir}该保护目录将失去防护，是否继续操作？`,
						icon: 'warning-filled',
						type: 'calc',
						onConfirm: async () => {
							await useDataHandle({
								loading: '正在删除，请稍后...',
								request: delFileDeny({ website: localRow.value.name, deny_name: row.name }),
								message: true,
								success: () => {
									isRefreshDenyList.value = true
								},
							})
						},
					})
				},
				title: '删除',
			},
		]),
	],
	extension: [useRefreshList(isRefreshDenyList), useTableBatch],
})
</script>

<style scoped></style>
