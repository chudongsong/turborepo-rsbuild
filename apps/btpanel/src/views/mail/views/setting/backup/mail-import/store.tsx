import { defineStore } from 'pinia'
import { formatTime } from '@/utils'
import { useLoading, useTableData } from '@mail/useMethod'
import { useOperate } from '@/hooks/tools/table/column'
import { MailBackup } from '@mail/types'

export const MAIL_BACKUP_IMPORT = defineStore('MAIL_BACKUP_IMPORT', () => {
	const search = reactive({
		path: '/www/backup/path/',
	})

	const { table, columns } = useTableData<MailBackup>([
		{
			prop: 'name',
			label: '文件名',
		},
		{
			prop: 'mtime',
			label: '导入时间',
			render: row => formatTime(row.mtime),
		},
		useOperate(
			[
				{
					title: '恢复',
					onClick: async (row: any) => {
						const { onRestore } = await import('@mail/views/setting/backup/mail-import/useMethod')
						onRestore(row)
					},
				},
				{
					title: '删除',
					onClick: async (row: any) => {
						const { onDelete } = await import('@mail/views/setting/backup/mail-import/useMethod')
						onDelete(row)
					},
				},
			],
			{
				width: 120,
				fixed: 'right',
				label: '操作',
			}
		),
	])

	const { loading, setLoading } = useLoading()

	const reset = () => {
		table.data = []
		table.total = 0
	}

	return {
		search,
		table,
		columns,
		loading,
		setLoading,
		reset,
	}
})

export default MAIL_BACKUP_IMPORT
