<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="refresh">刷新</el-button>
				<el-button @click="onClear">清空</el-button>
				<header-nav-tools class="ml-16px" />
			</template>
			<template #header-right>
				<el-select class="!w-[200px] mr-[10px]" v-model="search.status" @update="onChangeType">
					<el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
				</el-select>
				<BtSearch class="!w-[240px]" placeholder="请输入名称" @search="refresh"> </BtSearch>
			</template>
			<template #content>
				<BtTable />
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage> </BtPage>
			</template>
		</bt-table-group>
	</div>
</template>

<script lang="ts" setup>
import { isObject, formatTime, isArray } from '@/utils'
import { useAllTable, useBatch, useConfirm, useDataHandle } from '@/hooks/tools'
import { delAbnormalMailAll, delAbnormalMailList, getMassAbnormal, getMassAbnormalType } from '@/api/mail'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { openResultView } from '@/public'
import HeaderNavTools from '@/views/mail/public/header-nav-tools.vue'
const search = reactive({
	p: 1,
	size: 10,
	status: 'bounced',
	search: '',
})

/**
 * @description 批量操作
 */
const useTableBatch = useBatch([
	{
		label: '删除',
		value: 'del',
		event: async (batchConfirm, nextAll, selectedList, options) => {
			await batchConfirm({
				title: '批量删除',
				content: '您确定要删除选定项吗？',
				column: [{ label: '邮箱', prop: 'recipient' }, useBatchStatus()],
				onConfirm: async () => {
					let resultData: any[] = []
					await nextAll(async (data: any) => {
						const res = await delAbnormalMailList({ ids: data.id })
						resultData.push({
							name: data.recipient,
							status: res.status,
							msg: res.msg,
						})
					})
					openResultView(resultData, { title: '批量删除' })
					refresh()
				},
			})
		},
	},
])

const { BtTable, BtPage, BtRefresh, BtColumn, BtBatch, refresh, BtSearch } = useAllTable({
	request: async params => {
		const { data } = await getMassAbnormal(params)
		return {
			data: data.data || [],
			total: data.total || 0,
		}
	},
	columns: [
		useCheckbox(),
		{
			prop: 'recipient',
			label: '邮箱',
		},
		{
			prop: 'task_name',
			label: '邮件主题',
		},
		{
			prop: 'status',
			label: '类型',
		},
		{
			prop: 'state',
			label: '状态',
			render: row => (row.state || row.count >= 3 ? '无效' : '观察'),
		},
		{
			prop: 'created',
			label: '添加时间',
			render: row => formatTime(row.created),
		},
		useOperate((row: any) => {
			return [
				{
					title: '删除',
					onClick: async () => {
						useConfirm({
							title: '删除',
							content: `您确定要删除${row.recipient}吗？`,
							onConfirm: async () => {
								useDataHandle({
									loading: '正在删除，请稍候...',
									message: true,
									request: delAbnormalMailList({ ids: row.id }),
									success: () => {
										refresh()
									},
								})
							},
						})
					},
				},
			]
		}),
	],
	extension: [useTableBatch],
})

const options = ref<any[]>([])

const onChangeType = () => {
	search.p = 1
	refresh()
}

const onClear = () => {
	useConfirm({
		title: '清空无效列表',
		content: '这将清除该类型下的所有数据，您确定要继续吗？',
		onConfirm: async () => {
			await delAbnormalMailAll({ status: search.status })
			refresh()
		},
	})
}

const getType = async () => {
	try {
		const { data: { data } } = await getMassAbnormalType()
		if (isArray<{ status: string }>(data)) {
			options.value = data.map((item: any) => ({
				label: item.status,
				value: item.status,
			}))
			if (options.value.length) {
				search.status = options.value[0].value as string
			}
		}
	} catch (error) {
		console.error(error)
	}
}

const init = async () => {
	await getType()
	refresh()
}

init()

defineExpose({
	init,
})
</script>
