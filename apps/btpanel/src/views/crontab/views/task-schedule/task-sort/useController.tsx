import { getTriggerListAll, saveCustomOrder } from '@/api/crontab'
import { useDataHandle } from '@/hooks/tools'
import { useOperate } from '@/hooks/tools/table/column'
import { getTaskList, isRefreshSchedule } from '../useController'
import Sortable from 'sortablejs'

// ----------------------------------------------
// 任务排序
// ----------------------------------------------

export const allLoading = ref(false) // 任务排序加载中
export const allTableData = ref([]) // 任务排序数据

/**
 * @description: 获取所有任务列表
 */
const getSortTableData = async () => {
	await useDataHandle({
		loading: allLoading,
		request: getTriggerListAll(),
		data: [Array, allTableData],
	})
	rowDrop()
}

/**
 * @description: 行拖拽
 * @return {void}
 */
const rowDrop = () => {
	const tbody = document.querySelector('.groupSortTable .el-table__body-wrapper tbody') as HTMLElement
	Sortable.create(tbody, {
		animation: 500,
		onEnd: async (e: any) => {
			const currentRow = allTableData.value.splice(e.oldIndex, 1)[0]
			allTableData.value.splice(e.newIndex, 0, currentRow)
			const order_list = allTableData.value.map((item: any) => item.trigger_id)
			await useDataHandle({
				loading: '正在保存排序，请稍后...',
				request: saveCustomOrder({ order_list: JSON.stringify(order_list) }),
				message: true,
			})
			getSortTableData()
			isRefreshSchedule.value = true
		},
	})
}

export const sortColumn: any = shallowRef([
	{ label: '任务名称', prop: 'name' },
	useOperate(
		[
			{
				render: () => {
					return h('i', {
						class: 'svgtofont-icon-drag cursor-move mover align-middle',
						props: { title: '拖拽排序' },
					})
				},
			},
		],
		{ fixed: false }
	),
])

export const initSort = () => {
	getSortTableData()
}

export const $reset_sort = () => {
	allTableData.value = []
	allLoading.value = false
}
