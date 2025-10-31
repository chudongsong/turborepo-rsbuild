
import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'
import { chunkArray } from '@docker/useMethods'
import { useBatchStatus } from '@hooks/tools/table/column'
import { delNet, clearNet, getNetList } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useConfirm,useBatch,useDialog,useDataHandle } from '@/hooks/tools'


const {
	refs: { customLimit,isRefreshNetworkList },
} = getDockerStore()

export const NetTableData = reactive({
	isRefresh: true,
})
const tableList = ref([]) // 表格数据

// 批量操作方法
const useNetworkBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { id } = item
		switch (value) {
			case 'delete':
				const params = {
					id: id,
				}
				return await delNet({ data: JSON.stringify(params) })
				break
		}
	}
	await batchConfirm({
		title: `批量${label}网络`,
		content: `批量${label}已选的网络，是否继续操作！`,
		column: [
			{
				label: '网络名',
				prop: 'name',
			},
			useBatchStatus(),
		], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshNetworkList.value = true
				// 返回false则不关闭弹窗
			return false
		},
	})
}

// 表格左上方按钮组
export const tableBtnGroup = [
	{
		active: true,
		label: '添加网络',
		type: 'button',
		onClick: () => {
			useDialog({
				component: () => import('./add-net-dialog/index.vue'),
				title: `添加网络`,
				area: 58,
				btn: '添加',
			})
		},
	},
	{
		active: false,
		label: '清理网络',
		type: 'button',
		onClick: async () => {
			try {
				await useConfirm({
					type: 'calc',
					title: `清理网络`,
					width: '35rem',
					content: `您真的要清理未使用的网络吗？`,
				})
				useDataHandle({
					request: clearNet(),
					message: true,
					loading: '正在清理',
					success: () => {
						isRefreshNetworkList.value = true
					},
				})
			} catch (error) {
				console.log(error)
			}
		},
	},
]

/**
 * @description 删除事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const deleteDataEvent = async (row: any): Promise<void> => {
	try {
		await useConfirm({
			type: 'calc',
			title: `删除网络【${row.name}】`,
			width: '35rem',
			content: `您真的要删除网络【${row.name}】吗？`,
		})
		const params = {
			id: row.id,
		}
		useDataHandle({
			request: delNet({ data: JSON.stringify(params) }),
			message: true,
			success: () => {
				isRefreshNetworkList.value = true
			},
		})
	} catch (error) {}
}

/**
 * @description 批量操作
 */
export const useTableBatch = useBatch([
	{
		label: '删除项目',
		value: 'delete',
		event: useNetworkBatchEventHandle,
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
export const getNList = async (param:{p:number,limit:number,search:string}): Promise<{data:any[],total:number}> => {
	isRefreshNetworkList.value = false
	// 判断是否需要刷新
	if (!NetTableData.isRefresh) {
		return {
			data:chunkArray({
				limit: param.limit,
				list: tableList.value,
				p: param.p,
			}) || [],
			total: tableList.value.length
		}
	}
	NetTableData.isRefresh = false
	const data:any[] = await useDataHandle({
		request: getNetList(),
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
			if (!customLimit.value.network) checkHeight(mainHeight,tableParams)
	}, 0)
}

// 销毁
export const unmountHandler = (): void => {
	NetTableData.isRefresh = true
	tableList.value = []
}
