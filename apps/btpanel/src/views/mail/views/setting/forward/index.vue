<template>
	<div>
		<bt-table-group>
			<template #header-left>
				<el-button type="primary" @click="addOrEditForward(false)">添加</el-button>
			</template>
			<template #header-right>
				<bt-radio
					type="button"
					size="default"
					v-model="forwardType"
					:options="[
						{ label: '转发到邮箱', value: 0 },
						{ label: '转发到域名', value: 1 },
					]"
					@change="
						() => {
							isRefresh = true
						}
					"
					class="mr-[1rem]"></bt-radio>
				<BtRefresh />
			</template>
			<template #content>
				<bt-table></bt-table>
			</template>
			<template #footer-left>
				<bt-batch></bt-batch>
			</template>
		</bt-table-group>
		<bt-help class="mt-[1rem]" :options="helpOptions"> </bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useAllTable, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { forwardType, getForwardList, isRefresh, useTableBatch, addOrEditForward, deleteForwardFrom, editForwardFrom, handleForwardFormInit } from './useMethod'

const helpOptions = [
	{
		content: '<span class="text-dangerDark">转发优先级：准确的邮箱转发>域名转发到域名>捕获前缀、后缀、全部邮箱>捕获不存在的邮箱</span>',
		isHtml: true,
	},
	{
		content: '<span class="text-dangerDark">捕获所有的邮箱和捕获不存在的邮箱不能同时存在</span>',
		isHtml: true,
	},
	{
		content: '<span class="text-dangerDark">除准确的邮箱转发外，其它所有转发均支持在邮箱不存在时也能转发（可用于实现“无限邮”）</span>',
		isHtml: true,
	},
]

const { BtTable, BtBatch, BtRefresh } = useAllTable({
	request: getForwardList,
	columns: [
		useCheckbox({
			key: 'address',
		}),
		{
			label: '被转发者',
			prop: 'forwarder',
			showOverflowTooltip: true,
		},
		{
			label: '转发到',
			prop: 'goto',
			showOverflowTooltip: true,
		},
		{
			label: '域名',
			prop: 'domain',
			isHide: () => forwardType.value === 0,
			showOverflowTooltip: true,
		},
		{
			label: '创建时间',
			prop: 'created',
		},
		{
			label: '修改时间',
			prop: 'modified',
		},
		{
			label: '状态',
			prop: 'active',
			render: row => (
				<ElSwitch
					v-model={row.active}
					size="small"
					activeValue={1}
					inactiveValue={0}
					onChange={async (val: any) => {
						row.active = val
						await editForwardFrom(handleForwardFormInit(row), row.address)
					}}
				/>
			),
		},
		useOperate([
			{
				title: '编辑',
				onClick: (row: any) => {
					addOrEditForward(true, row)
				},
			},
			{
				title: '删除',
				onClick: (row: any) => {
					deleteForwardFrom(row)
				},
			},
		]),
	],
	extension: [useTableBatch, useRefreshList(isRefresh)],
})
</script>

<style scoped lang="scss"></style>
