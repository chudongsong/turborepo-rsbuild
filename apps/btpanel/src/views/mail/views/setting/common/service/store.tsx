import { defineStore } from 'pinia'
import { useLoading, useModalData, useTableData } from '@mail/useMethod'
import { useOperate } from '@/hooks/tools/table/column'
import { MailServiceTable } from '@mail/types'
import BtTableStatus from '@/components/extension/bt-table-status'

export const MAIL_SETTING_SERVICE = defineStore('MAIL_SETTING_SERVICE', () => {
	const { table, columns } = useTableData<MailServiceTable>([
		{
			prop: 'name',
			label: '名称',
		},
		{
			prop: 'status',
			label: '状态',
			render: row => (
				<BtTableStatus
					modelValue={row.status}
					onClick={async () => {
						const { onChangeStatus } = await import('@/views/mail/views/setting/common/service/useMethod')
						onChangeStatus(row)
					}}
				/>
			),
		},
		useOperate((row: any) => [
			{
				title: row.status ? '停止' : '开启',
				onClick: async (row: any) => {
					const { onChangeStatus } = await import('@/views/mail/views/setting/common/service/useMethod')
					onChangeStatus(row)
				},
			},
			{
				title: '重启',
				onClick: async (row: any) => {
					const { onRestart } = await import('@/views/mail/views/setting/common/service/useMethod')
					onRestart(row)
				},
			},
			{
				title: '修复',
				onClick: async (row: any) => {
					const { onRepair } = await import('@/views/mail/views/setting/common/service/useMethod')
					onRepair(row)
				},
			},
			{
				title: '设置',
				onClick: async (row: any) => {
					const { onShowConfig } = await import('@/views/mail/views/setting/common/service/useMethod')
					onShowConfig(row)
				},
			},
		]),
	])

	const configModal = useModalData()

	const { loading, setLoading } = useLoading()

	const reset = () => {
		setLoading(false)
		table.data = []
		table.total = 0
	}

	return {
		table,
		columns,
		loading,
		setLoading,
		configModal,
		reset,
	}
})

export default MAIL_SETTING_SERVICE
