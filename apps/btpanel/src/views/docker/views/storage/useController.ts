
import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'
import { chunkArray,NPSDialog } from '@docker/useMethods'
import { useBatchStatus } from '@hooks/tools/table/column'
import { delStorage, clearStorage, getStorageList } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useConfirm,useBatch,useDialog,useDataHandle } from '@/hooks/tools'


const {
	refs: { customLimit,isRefreshStorageList },
} = getDockerStore()

export const storageTableData = reactive({
	isRefresh: true,
})
const tableList = ref([]) // 表格数据

// 批量操作方法
const useStorageBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { Name } = item
		switch (value) {
			case 'delete':
				return await delStorage({ data: JSON.stringify({ name: Name }) })
		}
	}
	await batchConfirm({
		title: `批量${label}存储卷`,
		content: `批量${label}已选的存储卷，是否继续操作！`,
		column: [{ label: '存储卷', prop: 'Name' }, useBatchStatus()], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshStorageList.value = true
			// 返回false则不关闭弹窗
			return false
		},
	})
}

// 表格左上方按钮组
export const tableBtnGroup = [
	{
		active: true,
		label: `添加存储卷`,
		onClick: () => {
			useDialog({
				component: () => import('./add-storage-dialog/index.vue'),
				title: `添加存储卷`,
				area: 58,
				btn: '添加',
			})
		},
	},
	{
		label: `清理存储卷`,
		onClick: async () => {
			await useConfirm({
				type: 'calc',
				title: `清理存储卷`,
				content: `您真的要清理所有未被容器使用的存储卷吗？（可能不会包含您自己创建的卷）`,
			})
			useDataHandle({
				request: clearStorage(),
				message: true,
				loading: '正在清理存储卷，请稍后...',
				success: () =>{
					isRefreshStorageList.value = true
				},
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
 * @description 删除事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const deleteDataEvent = async (row: any): Promise<void> => {
	await useConfirm({
		type: 'calc',
		title: `删除存储卷【${row.Name}】`,
		content: `您真的要删除存储卷【${row.Name}】吗？`,
	})
	useDataHandle({
		request: delStorage({ data: JSON.stringify({ name: row.Name }) }),
		message: true,
		success: () => {
			isRefreshStorageList.value = true
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
		event: useStorageBatchEventHandle,
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
 * @description 获取镜像列表
 * @returns {Promise<void>} void
 */
export const getSList = async (param:{p:number,limit:number,search:string}): Promise<{data:any[],total:number}> => {
	isRefreshStorageList.value = false
	// 判断是否需要刷新
	if (!storageTableData.isRefresh) {
		return {
			data:chunkArray({
				limit: param.limit,
				list: tableList.value,
				p: param.p,
			}) || [],
			total: tableList.value.length
		}
	}
	storageTableData.isRefresh = false
	const data:any[] = await useDataHandle({
		request: getStorageList(),
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
	storageTableData.isRefresh = true
	tableList.value = []
}
