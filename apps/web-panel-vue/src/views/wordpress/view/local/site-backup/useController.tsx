import { backupSite, delSiteBackup, getSiteBackupList, restoreSiteBackup } from '@/api/wp'
import { TableColumnProps } from '@/components/data/bt-table/types'
import { TableBatchDialogProps, TableBatchEventProps, TableBatchNextAllProps, TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types'
import { useConfirm, useDataHandle } from '@/hooks/tools'
import { RequestProps } from '@/hooks/tools/message/types'
import { OperationButtonProps } from '@/hooks/tools/operation/types'
import { useBatchStatus, useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { formatTime, getByteUnit, getPageTotal } from '@/utils'
import useWPLocalStore from '@/views/wordpress/view/local/useStore'

const { localRow, isRefreshBackupList } = storeToRefs(useWPLocalStore())

export const getWpBackupListData = async (params: any) => {
	try {
		const {
			data: { data, page },
		} = await getSiteBackupList({ s_id: localRow.value.id, p: params.p, limit: params.limit })

		return {
			data,
			total: getPageTotal(page),
		}
	} catch (error) {
		console.log(error)
		return { data: [], total: 0 }
	}
}

export const operation = (): OperationButtonProps[] => {
	return [
		{
			type: 'button',
			label: '备份',
			active: true,
			onClick: () => {
				useDataHandle({
					loading: '正在备份，请稍后...',
					request: backupSite({ s_id: localRow.value.id, bak_type: 3 }),
					success: (rdata: RequestProps) => {
						if (rdata.status) isRefreshBackupList.value = true
					},
					message: true,
				})
			},
		},
	]
}

export const getWpBackupListOption = () => {
	return [
		useCheckbox(),
		{
			label: '文件名',
			prop: 'filename',
			isCustom: true,
			minWidth: 180,
		},
		{
			label: '文件大小',
			prop: 'size',
			render: (row: any) => {
				return getByteUnit(Number(row.size), true)
			},
		},
		{
			label: '备份时间',
			prop: 'addtime',
			minWidth: 120,
			render: (row: any) => {
				return formatTime(row.bak_time)
			},
		},
		{
			label: '信息',
			prop: 'bak_type',
			minWidth: 80,
			render: (row: any) => (row.bak_type == 1 ? `仅文件` : row.bak_type == 2 ? `仅DB` : `完整的备份`),
		},
		useOperate([
			{
				title: '恢复',
				onClick: async (row: any) => {
					await useConfirm({
						title: '恢复备份文件',
						content: '将恢复站点文件和数据库，继续吗？',
						onConfirm: async () => {
							useDataHandle({
								loading: '正在恢复备份文件，请稍后...',
								request: restoreSiteBackup({ bak_id: row.id }),
								success: (rdata: RequestProps) => {},
								message: true,
							})
						},
					})
				},
			},
			{
				title: '下载',
				onClick: (row: any) => {
					const url = `${window.location.origin}`
					window.open(`${url}/download?filename=${encodeURIComponent(row.bak_file)}${row.filename ? `&amp;name=${row.filename}` : ''}`, '_blank', 'noopener,noreferrer')
				},
			},
			{
				title: '删除',
				onClick: (row: any) => {
					useConfirm({
						title: '删除备份文件',
						content: `网站备份即将被删除 【${row.filename}】，是否继续操作?`,
						onConfirm: async () => {
							useDataHandle({
								loading: '正在删除备份文件，请稍后...',
								request: delSiteBackup({ bak_id: row.id }),
								success: (rdata: RequestProps) => {
									if (rdata.status) isRefreshBackupList.value = true
								},
								message: true,
							})
						},
					})
				},
			},
		]),
	]
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
	const template: Map<string, string> = new Map([['delete', '批量删除已选的备份文件，是否继续操作？']])
	const requestHandle = async (item: any, index: number) => {
		const { id } = item
		switch (value) {
			case 'delete':
				return await delSiteBackup({ bak_id: id })
		}
	}
	await batchConfirm({
		title: `批量${label}备份文件`,
		content: `${template.get(value) as string}，是否继续操作！`,
		column: [{ label: '备份文件', prop: 'filename' }, useBatchStatus()] as TableColumnProps[], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			isRefreshBackupList.value = true
			// 返回false则不关闭弹窗
			return false
		},
	})
}
