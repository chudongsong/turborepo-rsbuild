<template>
	<bt-table-group>
		<template #header-left>
			<BtOperation />
		</template>
		<template #header-right></template>
		<template #content>
			<bt-table ref="cronTableRef" :max-height="560" :column="tableColumn" v-bt-loading:title="'正在加载计划任务列表，请稍后...'" :data="tableData" v-bt-loading="tableLoading" />
		</template>
		<template #footer-left>
			<bt-table-batch :table-ref="cronTableRef" :options="TableBatchOptions"></bt-table-batch>
		</template>
	</bt-table-group>
</template>

<script setup lang="ts">
import { getCrontabList, modifyCrontabStatus, removeCrontab, startTaskCrontab } from '@/api/site'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchEventProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle, useDialog, useOperation } from '@/hooks/tools'
import { useBatchStatus, useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'
import { useSiteStore } from '@site/useStore'

const { siteInfo } = useSiteStore()

const cronTableRef = ref<any>() // 表格实例
const tableData = ref<any>([]) // 表格数据
const tableLoading = ref<boolean>(false) // 表格加载状态

const { BtOperation } = useOperation({
	options: [
		{
			label: '添加计划任务',
			type: 'button',
			active: true,
			onClick: () => editCrontab(),
		},
	],
})

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchCofirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
const useBatchEventHandle: TableBatchEventProps = async (batchCofirm, nextAll, selectedList, options) => {
	const { label, value } = options
	const template: Map<string, string> = new Map([
		['stark', '即将批量执行选中的计划任务'],
		['start', '即将批量开启选中任务'],
		['stop', '即将批量停止选中任务'],
		['delete', '即将批量删除选中任务'],
	])
	const requestHandle = async (item: AnyObject, index: number) => {
		const requestList: Map<string, AnyFunction> = new Map([
			['stark', startTaskCrontab],
			['start', modifyCrontabStatus],
			['stop', modifyCrontabStatus],
			['delete', removeCrontab],
		])
		const { id } = item
		const fn = requestList.get(value)
		switch (value) {
			case 'stark':
				if (fn) {
					return fn({ id })
				}
				break
			case 'start':
			case 'stop':
				if (fn) {
					return fn({ id, status: value === 'start' ? 1 : 0 })
				}
				break
			case 'delete':
				if (fn) {
					return fn({ id })
				}
				break
		}
	}
	await batchCofirm({
		title: `批量${label}`,
		content: `${template.get(value) as string}，是否继续操作？`,
		column: [
			{
				label: '项目名称',
				prop: 'name',
			},
			useBatchStatus(),
		] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			getCrontab()
			return false
		},
	})
}

const batchOptions = (): TableBatchOptionsProps[] => {
	return [
		{
			label: '执行任务',
			value: 'stark',
			event: useBatchEventHandle,
		},
		{
			label: '启动任务',
			value: 'start',
			event: useBatchEventHandle,
		},
		{
			label: '停止任务',
			value: 'stop',
			event: useBatchEventHandle,
		},
		{
			label: '删除任务',
			value: 'delete',
			event: useBatchEventHandle,
		},
	]
}

const useTableColumn = () => {
	return shallowRef<TableColumnProps[]>([
		useCheckbox(),
		{
			label: '计划任务',
			prop: 'rname',
			render: (row: any) => {
				return row.rname || row.name
			},
		},
		useStatus({
			event: (row: any) => {
				changeStatusEvent(row)
			},
			data: ['停用', '正常'],
		}),
		{
			label: '执行周期',
			prop: 'cycle',
		},
		{
			label: '上次执行时间',
			prop: 'addtime',
		},
		useOperate([
			{
				onClick: startTaskEvent,
				title: '执行',
			},
			{
				onClick: (row: any) => {
					editCrontab(row)
				},
				title: '编辑',
			},
			{
				onClick: (row: any) => {
					openLogEvent(row)
				},
				title: '日志',
			},
			{
				onClick: deleteDataEvent,
				title: '删除',
			},
		]),
	])
}

/**
 * @description 修改计划任务状态
 * @param {any} row 行数据
 */
const changeStatusEvent = async (row: any) => {
	await useConfirm({
		title: row.status ? '停用计划任务' : '启用计划任务',
		content: row.status ? '计划任务暂停后将无法继续运行，您真的要停用这个计划任务吗？' : '该计划任务已停用，是否要启用这个计划任务？',
		icon: 'question-filled',
	})
	await useDataHandle({
		loading: '正在设置计划任务状态，请稍候...',
		request: modifyCrontabStatus({ id: row.id }),
		message: true,
		success: getCrontab,
	})
}

/**
 * @description 启动计划任务
 * @param {any} row 行数据
 */
const editCrontab = (row?: any) => {
	useDialog({
		isAsync: true,
		title: `${row ? '编辑' : '添加'}计划任务${row ? '【' + row.name + '】' : ''}`,
		area: 74,
		component: () => import('./add-crontab.vue'),
		compData: {
			row: row || false,
			sitename: siteInfo.value.name,
			refreshEvent: getCrontab,
		},
		showFooter: true,
	})
}

const openLogEvent = (row: any) => {
	useDialog({
		isAsync: true,
		title: '查看【' + (row.rname || row.name) + '】日志',
		area: 80,
		compData: { id: row.id },
		component: () => import('./log-detail.vue'),
	})
}

/**
 * @description: 执行任务
 * @return {void}
 */
const startTaskEvent = async (row: any) => {
	useDataHandle({
		loading: '正在执行计划任务，请稍后...',
		request: startTaskCrontab({ id: row.id }),
		message: true,
		success: () => {
			openLogEvent(row)
		},
	})
}

/**
 * @description 删除计划任务
 * @param {any} row 行数据
 */
const deleteDataEvent = async ({ id, name }: any) => {
	await useConfirm({
		title: '删除计划任务',
		content: `您确定要删除计划任务【${name}】，是否继续？`,
		icon: 'warning-filled',
	})
	useDataHandle({
		loading: '正在删除计划任务，请稍后...',
		request: removeCrontab({ id }),
		message: true,
		success: getCrontab,
	})
}

/**
 * @description 获取计划任务列表
 */
const getCrontab = async () => {
	useDataHandle({
		loading: tableLoading,
		request: getCrontabList({ sitename: siteInfo.value.name }),
		data: {
			data: [Array, tableData],
		},
	})
}

const tableColumn = useTableColumn()
const TableBatchOptions = batchOptions()

onMounted(getCrontab)

defineExpose({
	init: getCrontab,
})
</script>

<style scoped></style>
