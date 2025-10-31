<template>
	<div>
		<bt-removed-tips />
		<bt-table-group v-if="payment.authType === 'ltd'">
			<template #header-left>
				<!-- 按钮组 -->
				<div class="flex items-center">
					<el-button @click="openAddTaskView()" type="primary">创建任务</el-button>
					<bt-divider direction="vertical" class="!mx-1.2rem"></bt-divider>
					<el-button type="default" @click="taskSortEvent">任务排序</el-button>
					<div class="flex items-center ml-4px" @click="openNps()">
						<i class="svgtofont-desired text-medium"></i>
						<span class="bt-link">需求反馈</span>
					</div>
				</div>
			</template>
			<template #header-right>
				<div class="flex items-center">
					<bt-table-class name="Crontab" class="!w-[16rem]" v-model="tableParam.type_id" :options="classOption" field="name" :config="getClassOption" @change="refresh" :ignore="['0']" />
					<BtSearch placeholder="请输入任务名称" class="mx-10px"></BtSearch>
					<BtRefresh />
				</div>
			</template>
			<template #content>
				<BtTable></BtTable>
			</template>
			<template #footer-left>
				<BtBatch />
			</template>
			<template #footer-right>
				<BtPage></BtPage>
			</template>
		</bt-table-group>
		<bt-product-introduce v-else :data="productData" class="px-[20%] my-[8rem]"></bt-product-introduce>
	</div>
</template>

<script setup lang="tsx">
import { useGlobalStore } from '@store/global'
import { openNps } from '../../useController'
import { classOption, tableParam, productData, init, getClassOption, $reset, taskSortEvent, openAddTaskView, getTaskList, TableBatchOptions, changeStatusEvent, executionEvent, openEventView, openLogEvent, deleteTaskEvent, isRefreshSchedule } from './useController'
import { useAllTable, useBatch, useRefreshList } from '@/hooks/tools'
import { useCheckbox, useOperate, useStatus } from '@/hooks/tools/table/column'
import { formatTime } from '@/utils'

const { payment, mainHeight } = useGlobalStore()

// 批量操作
const useTableBatch = useBatch(TableBatchOptions)
const { BtTable, BtPage, BtSearch, BtRefresh, refresh, BtBatch } = useAllTable({
	request: (data: any) => {
		return getTaskList({ ...data, rows: data.limit, type_id: tableParam.type_id === 'all' ? '' : tableParam.type_id })
	},
	columns: computed(() => [
		useCheckbox(),
		{ label: '任务名称', prop: 'name', sortable: 'custom' },
		useStatus({
			sortable: 'custom',
			event: changeStatusEvent,
			data: ['停用', '正常'],
			minWidth: 50,
		}),
		{
			label: '执行周期',
			render: (row: any) => {
				let res = row.crontab_expression
				// 判断执行周期是否为自定义
				if (row.cycle_type !== 'custom') {
					let pdata: any = {
						day: '天，' + row.cycle_hour + '点' + row.cycle_minute + '分',
						week: '周' + row.cycle_where + '，' + row.cycle_hour + '点' + row.cycle_minute + '分',
						month: '月，' + row.cycle_where + '日，' + row.cycle_hour + '点' + row.cycle_minute + '分',
						hour: '小时，第' + row.cycle_minute + '分钟',
						'minute-n': '隔' + row.cycle_minute + '分钟',
						'hour-n': row.cycle_hour + '小时，第' + row.cycle_minute + '分钟',
						'day-n': '隔' + row.cycle_where + '天，' + row.cycle_hour + '点' + row.cycle_minute + '分',
					}
					res = pdata[row.cycle_type] ? ['每' + pdata[row.cycle_type] + ' 执行'] : ''
				}
				return h('span', res)
			},
		},
		{ label: '备注', prop: 'ps' },
		{ label: '创建时间', sortable: 'custom', render: (row: any) => formatTime(row.create_time), prop: 'create_time' },
		{
			label: '上次执行时间',
			prop: 'last_exec_time',
			sortable: 'custom',
			render: (row: any) => (row.last_exec_time ? formatTime(row.last_exec_time) : ''),
		},
		useOperate([
			{ title: '执行', onClick: executionEvent },
			{ title: '事件', onClick: openEventView },
			{ title: '编辑', onClick: openAddTaskView },
			{ title: '日志', onClick: openLogEvent },
			{ title: '删除', onClick: deleteTaskEvent },
		]),
	]),
	extension: [useRefreshList(isRefreshSchedule), useTableBatch],
})

onMounted(init)
onUnmounted($reset)
</script>
