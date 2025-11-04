import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps, TableBatchEventProps } from '@/components/extension/bt-table-batch/types.d'
import { openAddContainerView, openContainerDetailView, chunkArray } from '@docker/useMethods'
import { useBatchStatus } from '@hooks/tools/table/column'
import { deleteMirror, getMirrorList } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useConfirm, useBatch, useDialog, useDataHandle } from '@/hooks/tools'

const {
	refs: { customLimit, isRefreshTableList },
	getCurrentCon,
} = getDockerStore()

export const mirrorTableData = reactive({
	// p: 1,
	// limit: Number(localStorage.getItem('dockerimagelimit')) || 20,
	search: '',
	isRefresh: true,
})
const tableList = ref([]) // 表格数据

// 批量操作方法
const useImagesBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: any, options: TableBatchOptionsProps, clearSelection: any): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { id, name } = item
		switch (value) {
			case 'delete':
				const params = {
					id: id,
					name: name,
					force: '0',
				}
				return await deleteMirror({ data: JSON.stringify(params) })
				break
		}
	}
	await batchConfirm({
		title: `批量${label}镜像`,
		content: `批量${label}已选的镜像，是否继续操作！`,
		column: [
			{
				label: '镜像名',
				prop: 'name',
			},
			useBatchStatus(),
		], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshTableList.value = true
			return false
		},
	})
}

// 批量操作列表
export const tableBatchData: TableBatchOptionsProps[] = [
	{
		label: '删除',
		value: 'delete',
		event: useImagesBatchEventHandle,
	},
]
// 表格左上方按钮组
export const tableBtnGroup = [
	{
		active: true,
		label: '从仓库中拉取',
		type: 'button',
		onClick: () => {
			useDialog({
				component: () => import('./stash-pull-dialog/index.vue'),
				title: '拉取镜像',
				area: 64,
			})
		},
	},
	{
		active: false,
		label: '导入镜像',
		type: 'button',
		onClick: () => {
			useDialog({
				component: () => import('./import-mirror-dialog/index.vue'),
				title: `导入镜像`,
				area: 43,
				btn: '导入',
			})
		},
	},
	{
		active: false,
		label: '构建镜像',
		type: 'button',
		onClick: () => {
			useDialog({
				component: () => import('./create-mirror-dialog/index.vue'),
				title: `构建镜像`,
				area: 54,
				btn: '提交',
			})
		},
	},
	{
		active: false,
		label: '线上镜像',
		type: 'button',
		onClick: () => {
			useDialog({
				component: () => import('@docker/views/cloud-images/index.vue'),
				title: 'Docker线上镜像搜索',
				area: 80,
			})
		},
	},
	{
		active: false,
		label: '清理镜像',
		type: 'button',
		onClick: async () => {
			useDialog({
				component: () => import('@docker/public/clear-confirm.vue'),
				title: '清理镜像',
				area: 35,
				btn: true,
			})
		},
	},
]

/**
 * @description 删除事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const deleteDataEvent = async (row: any, refresh: AnyFunction): Promise<void> => {
	const params = {
		id: row.id,
		name: row.name,
		force: '0',
	}
	try {
		await useConfirm({
			type: 'calc',
			title: `删除镜像【${row.name}】`,
			width: '35rem',
			content: `您真的要删除镜像【${row.name}】吗？`,
		})
		useDataHandle({
			request: deleteMirror({ data: JSON.stringify(params) }),
			message: true,
			success: () => {
				refresh()
			},
		})
	} catch (error) {
		console.log(error)
	}
}

/**
 * @description 推送事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const pushDataEvent = (row: any): void => {
	useDialog({
		component: () => import('./push-mirror-dialog/index.vue'),
		title: `推送【${row.name}】到仓库`,
		area: 43,
		btn: true,
		compData: { row },
	})
}

/**
 * @description 导出事件
 * @param {FtpTableDataProps} row 行数据
 * @returns {void} void
 */
export const exportDataEvent = (row: any): void => {
	useDialog({
		component: () => import('./export-mirror-dialog/index.vue'),
		title: `导出【${row.name}】镜像`,
		area: 43,
		btn: '导出',
		compData: { row },
	})
}
/**
 * @description 创建容器
 */
export const createEvent = async (row: any): Promise<void> => {
	openAddContainerView({ image: row.name })
}
/**
 * @description 查看容器详情
 * @param {FtpTableDataProps} row 行数据
 */
export const conDetailEvent = async (row: any) => {
	const con = {
		id: row.container_id,
		name: row.container_name,
	}
	await getCurrentCon(con.id)
	openContainerDetailView(con)
}

/**
 * @description 过滤搜索
 */
const filterSearch = async (str: string, param: { p: number; limit: number }): Promise<{ data: any[]; total: number }> => {
	try {
		// 切换大小写
		const query: string = str.toLowerCase()
		const keyArr = ['name', 'id', 'container']
		const arr = tableList.value.filter(item => {
			// 获取要搜索的数据字段
			const data = {
				...item,
				container: item.containers.map((item: any) => item.container_name).join('') || '',
			}
			// 返回符合条件的数据
			return keyArr.some(key => data[key]?.toLowerCase().includes(query))
		})
		// 更新数据,手动分页
		return {
			data:
				chunkArray({
					limit: param.limit,
					list: arr,
					p: param.p,
				}) || [],
			total: arr.length,
		}
	} catch (error) {
		return {
			data: [],
			total: 0,
		}
	}
}

/**
 * @description 批量操作
 */
export const useTableBatch = useBatch([
	{
		label: '删除项目',
		value: 'delete',
		event: useImagesBatchEventHandle,
	},
])

/**
 * @description 检查高度
 */
export const checkHeight = (mainHeight: Ref<number>, tableParams: Ref<{ p: number; limit: number; search: string }>) => {
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
export const getMList = async (param: { p: number; limit: number; search: string }, isFilter: boolean): Promise<{ data: any[]; total: number }> => {
	isRefreshTableList.value = false
	// 判断是否是搜索
	if (isFilter) {
		return filterSearch(param.search, param)
	}
	// 判断是否需要刷新
	if (!mirrorTableData.isRefresh) {
		return {
			data:
				chunkArray({
					limit: param.limit,
					list: tableList.value,
					p: param.p,
				}) || [],
			total: tableList.value.length,
		}
	}
	mirrorTableData.isRefresh = false
	const data: any[] = await useDataHandle({
		request: getMirrorList(),
		data: Array,
	})
	tableList.value = data
	return {
		data:
			chunkArray({
				limit: param.limit,
				list: tableList.value,
				p: param.p,
			}) || [],
		total: tableList.value.length,
	}
}

// 初始化
export const init = (mainHeight: Ref<number>, tableParams: Ref<{ p: number; limit: number; search: string }>): void => {
	// search()
	setTimeout(() => {
		if (!customLimit.value.images) checkHeight(mainHeight, tableParams)
	}, 0)
}

// 销毁
export const unmountHandler = (): void => {
	mirrorTableData.search = ''
	mirrorTableData.isRefresh = true
	tableList.value = []
}
