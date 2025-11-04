<template>
	<div>
		<BtTableGroup>
			<template #header-left><BtOperation /></template>
			<template #content><BtTable /></template>
			<template #footer-left>
				<div class="flex flex-col">
					<BtBatch />
					<bt-help :options="[{ content: '目录设置加密访问后，访问时需要输入账号密码才能访问' }, { content: '例如我设置了加密访问 /test/ ,那我访问 http://aaa.com/test/ 时就要输入账号密码才能访问' }]" class="ml-[20px] mt-[20px]"></bt-help>
				</div>
			</template>
		</BtTableGroup>
	</div>
</template>

<script setup lang="tsx">
import { Message, useAllTable, useBatch, useConfirm, useDataHandle, useDialog, useHandleError, useOperation, useRefreshList } from '@/hooks/tools'
import useWPWordpressSecurityStore from './useStore'
import { getLimitList } from './useController'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'
import { deleteDirAuth } from '@/api/site'
import { openResultDialog } from '@/views/site/useController'

const { localRow } = storeToRefs(useWPLocalStore())
const { isRefreshLimitList } = storeToRefs(useWPWordpressSecurityStore())

const { BtOperation } = useOperation({
	options: [
		{
			onClick: () => {
				useDialog({
					title: '添加限制访问',
					area: 48,
					component: () => import('./limit-form.vue'),
					compData: {
						isEdit: false,
						siteId: localRow.value.id,
						getList: () => {
							isRefreshLimitList.value = true
						},
					},
					btn: true,
				})
			},
			type: 'button',
			active: true,
			label: '添加限制访问',
		},
	],
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '批量删除',
		value: 'delete',
		event: async (batchCofirm, nextAll, selectedList, options) => {
			await useConfirm({
				title: '批量删除限制访问规则',
				content: '批量删除选中的限制访问规则，该操作可能会存在风险，是否继续？',
			})
			let loading = Message.load('正在删除,请稍后...')
			try {
				const results = await Promise.all(
					selectedList.value.map(async (row: any) => {
						try {
							const { data } = await deleteDirAuth({
								id: localRow.value.id,
								name: row.name,
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
					resultTitle: '删除限制访问规则',
				})
				isRefreshLimitList.value = true
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
		return getLimitList(data)
	},
	columns: [
		useCheckbox(),
		{
			label: '名称',
			prop: 'name',
		},
		{
			label: '路径',
			prop: 'site_dir',
		},
		useOperate([
			{
				onClick: (row: any) => {
					useDialog({
						title: '添加限制访问',
						area: 48,
						component: () => import('./limit-form.vue'),
						compData: {
							isEdit: true,
							siteId: localRow.value.id,
							row,
							getList: () => {
								isRefreshLimitList.value = true
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
						title: `删除限制访问规则【${row.name}】`,
						content: `删除选中的规则后，访问${row.site_dir}将不再需要安全验证，是否继续操作？`,
						icon: 'warning-filled',
						type: 'calc',
						onConfirm: async () => {
							await useDataHandle({
								loading: '正在删除，请稍后...',
								request: deleteDirAuth({ id: localRow.value.id, name: row.name }),
								message: true,
								success: () => {
									isRefreshLimitList.value = true
								},
							})
						},
					})
				},
				title: '删除',
			},
		]),
	],
	extension: [useRefreshList(isRefreshLimitList), useTableBatch],
})
</script>

<style scoped></style>
