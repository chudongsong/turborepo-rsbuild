/** ----------远程管理业务---------- */

import { delWpRemote, getWpRemoteList } from '@/api/wp'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { TableColumnProps } from '@/components/data/bt-table/types'
import useWPRemoteStore from '@/views/wordpress/view/remote/useStore'
import { TableConfigProps, TableExtProps } from '@/hooks/tools/table/types'

const { isRefreshRemoteList } = storeToRefs(useWPRemoteStore())

/**
 * @description 远程管理列表
 **/
export const getWpRemoteListData = async (params: any) => {
	try {
		const {
			data: { list, total },
		} = await getWpRemoteList({ keyword: params.search, p_size: params.limit, p: params.p })
		return {
			data: list,
			total,
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}

/**
 * @description 批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {Ref<FtpTableRowProps[]>} selectList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBatchEventHandle: TableBatchEventProps = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectList: Ref<any[]>, options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const template: Map<string, string> = new Map([['delete', '批量删除已选的网站，删除后彻底失去访问和操作权限']])
	const requestHandle = async (item: any, index: number) => {
		const { id } = item
		switch (value) {
			case 'delete':
				return await delWpRemote({ remote_id: id })
		}
	}
	await batchConfirm({
		title: `批量${label}网站`,
		content: `${template.get(value) as string}，是否继续操作！`,
		column: [{ label: '网站', prop: 'site_url' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshRemoteList.value = true
			// 返回false则不关闭弹窗
			return false
		},
	})
}
