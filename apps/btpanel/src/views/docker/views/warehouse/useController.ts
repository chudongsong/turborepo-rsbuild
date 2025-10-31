
import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'
import { chunkArray,NPSDialog } from '@docker/useMethods'
import { useBatchStatus } from '@hooks/tools/table/column'
import { delStash, getStashList } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useConfirm,useBatch,useDialog,useDataHandle } from '@/hooks/tools'


const {
	refs: { customLimit,isRefreshWarehouseList },
} = getDockerStore()

export const warehouseTableData = reactive({
	isRefresh: true,
})
const tableList = ref([]) // 表格数据

// 批量操作方法
const useWarehouseBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { id } = item
		switch (value) {
			case 'delete':
				const params = {
					id: id,
				}
				return await delStash({ data: JSON.stringify(params) })
				break
		}
	}
	await batchConfirm({
		title: `批量${label}仓库`,
		content: `批量${label}已选的仓库，是否继续操作！`,
		column: [
			{
				label: '仓库名',
				prop: 'name',
			},
			useBatchStatus(),
		], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshWarehouseList.value = true
			// 返回false则不关闭弹窗
			return false
		},
	})
}

// 表格左上方按钮组
export const tableBtnGroup = [
	{
		active: true,
		label: `添加仓库`,
		onClick: () => {
			useDialog({
				component: () => import('./add-stash-dialog/index.vue'),
				title: `添加仓库`,
				area: 54,
				btn: '添加',
			})
		},
	},
	{
		type: 'link',
		label: `需求反馈`,
		class: 'ml-[2rem]',
		onClick: () => {
			NPSDialog()
		},
	},
]

/**
 * @description 编辑事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const editDataEvent = (row: any): void => {
	useDialog({
		component: () => import('./add-stash-dialog/index.vue'),
		title: `编辑仓库【${row.name}】`,
		area: 54,
		btn: '编辑',
		compData: { row },
	})
}

/**
 * @description 删除事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const deleteDataEvent = async (row: any): Promise<void> => {
	await useConfirm({
		title: `删除仓库【${row.name}】`,
		type: 'calc',
		width: '35rem',
		content: `您真的要删除仓库【${row.name}】吗？`,
	})
	const params = {
		id: row.id,
	}
	useDataHandle({
		request: delStash({ data: JSON.stringify(params) }),
		message: true,
		loading: '正在删除...',
		success: () => {
			isRefreshWarehouseList.value = true
		},
	})
}

/**
 * @description 批量操作
 */
export const useTableBatch = useBatch([
	{
		label: '删除项目',
		value: 'delete',
		event: useWarehouseBatchEventHandle,
	},
])

/**
 * @description 检查高度
 */
export const checkHeight = (mainHeight:Ref<number>,tableParams:Ref<{p:number,limit:number,search:string}>) => {
	setTimeout(() => {
		if (mainHeight.value > 900) {
			tableParams.value.limit = 20
		} else {
			tableParams.value.limit = 10
		}
	}, 0)
}

/**
 * @description 获取列表
 * @returns {Promise<void>} void
 */
export const getWarehouseList = async (param:{p:number,limit:number,search:string}): Promise<{data:any[],total:number}> => {
	isRefreshWarehouseList.value = false
	// 判断是否需要刷新
	if (!warehouseTableData.isRefresh) {
		return {
			data:chunkArray({
				limit: param.limit,
				list: tableList.value,
				p: param.p,
			}) || [],
			total: tableList.value.length
		}
	}
	warehouseTableData.isRefresh = false
	const data:any[] = await useDataHandle({
		request: getStashList(),
		data: Array,
	})
	tableList.value = data
	return {
		data:chunkArray({
			limit: param.limit,
			list: tableList.value,
			p: param.p,
		}) || [],
		total: tableList.value.length
	}
}

// 初始化
export const init = (mainHeight:Ref<number>,tableParams:Ref<{p:number,limit:number,search:string}>): void => {
	// search()
	setTimeout(() => {
			if (!customLimit.value.storage) checkHeight(mainHeight,tableParams)
	}, 0)
}

// 销毁
export const unmountHandler = (): void => {
	warehouseTableData.isRefresh = true
	tableList.value = []
}
