import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps } from '@/components/data/bt-table-batch/types.d'
import { Message, useConfirm, useDataHandle } from '@/hooks/tools'
import { getContainerBackupList, addContainerBackup, delContainerBackup } from '@/api/docker'
import { pullMirrorDialog } from '@docker/useMethods'
import { useCheckbox, useBatchStatus, useOperate } from '@hooks/tools/table/column'
import { getByteUnit } from '@utils/index'

const row = ref<any>()
export const tableData = reactive({
	loading: false,
	list: [] as any[],
})

// 批量操作列表
export const tableBatchData: TableBatchOptionsProps[] = [
	{
		label: '删除',
		value: 'delete',
		event: async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
			const { label, value } = options
			const requestHandle = async (item: AnyObject, index: number) => {
				const { container_id, container_name, name } = item
				switch (value) {
					case 'delete':
						return await delContainerBackup({
							data: JSON.stringify({
								container_id,
								container_name,
								name,
							}),
						})
						break
				}
			}
			await batchConfirm({
				title: `批量${label}容器备份`,
				content: `批量${label}已选的容器备份，删除后备份文件将无法恢复，是否继续操作！`,
				column: [
					{
						label: '文件名',
						prop: 'name',
					},
					useBatchStatus(),
				], // 弹窗配置
				onConfirm: async () => {
					// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
					await nextAll(requestHandle)
					// 执行完毕的代码，刷新列表
					getContainerBackup()
					// 返回false则不关闭弹窗
					return false
				},
			})
		},
	},
]

export const addBackup = async () => {
	useDataHandle({
		request: addContainerBackup({ container_id: row.value.id }),
		message: true,
		success: async (res: any) => {
			if (res.status) {
				await getContainerBackup()
				await pullMirrorDialog(true)
			}
		},
	})
}
/**
 * @description: 删除容器备份
 */
const deleteContainerBackup = async (crow: any): Promise<void> => {
	try {
		await useConfirm({
			icon: 'warning-filled',
			title: `删除备份文件`,
			width: '45rem',
			content: `删除[${crow.name}]备份文件后，该备份文件将永久消失，是否继续操作？`,
		})
		useDataHandle({
			loading: '正在删除...',
			request: delContainerBackup({
				container_id: crow.container_id,
				container_name: crow.container_name,
				name: crow.name,
			}),
			success: async ({ status }: { status: boolean }) => {
				if (status) {
					await getContainerBackup()
					Message.success('删除成功')
				}
			},
			error: (err: any) => {
				Message.request(err)
			},
		})
	} catch (err) {
		console.log(err)
	}
}
/**
 * @description: 下载备份文件
 */
const downContainerFile = async (crow: any): Promise<void> => {
	window.open('/download?filename=' + encodeURIComponent(crow.filename), '_blank', 'noopener,noreferrer')
}
/**
 * @description: 获取容器备份
 */
const getContainerBackup = async () => {
	tableData.loading = true
	useDataHandle({
		request: getContainerBackupList({ container_id: row.value.id }),
		data: Array,
		success: (data: any) => {
			tableData.list = data
			tableData.loading = false
		},
	})
}

// 容器备份列表
export const backupContainerTable = () => {
	return [
		useCheckbox({ key: 'name' }),
		{ label: '文件名', prop: 'name', minWidth: 140 },
		{ label: '存储位置', prop: 'filename', minWidth: 180, isCustom: true },
		{
			label: '文件大小',
			prop: 'size',
			minWidth: 86,
			isCustom: true,
			render: (row: any) => getByteUnit(row.size),
		},
		{ label: '备份时间', prop: 'addtime', minWidth: 120, isCustom: true },
		useOperate([
			{ onClick: downContainerFile, title: '下载' },
			{ onClick: deleteContainerBackup, title: '删除' },
		]),
	]
}

// 初始化
export const init = (props: any) => {
	row.value = props.compData.row
	getContainerBackup()
}

// 销毁
export const unMountHandle = () => {
	tableData.list = []
	tableData.loading = false
	row.value = {}
}
