import { defineStore } from 'pinia'
import type { TableBatchOptionsProps } from '@/components/extension/bt-table-batch/types.d'
import { useCheckbox, useOperate } from '@/hooks/tools/table/column'
import { useConfirm } from '@/hooks/tools/confirm'

import { useTableData } from '@mail/useMethod'
import { delBlacklist } from '@/api/mail'
import { Message } from '@/hooks/tools'

export const MAIL_BLACKLIST = defineStore('MAIL_BLACKLIST', () => {
	const email = ref('')
	const tableRef = ref()
	const loading = ref(false)

	// 批量操作列表
	const tableBatchData: TableBatchOptionsProps[] = [
		{
			label: '删除',
			value: 'delete',
			event: async (batchConfirm, nextAll, selectedList, options) => {
				const { useBlackListBatchEventHandle } = await import('@mail/views/blacklist/useMethod')
				useBlackListBatchEventHandle(batchConfirm, nextAll, selectedList, options)
			},
		},
	]

	const { table, columns } = useTableData<{ email: string }>([
		useCheckbox(),
		{
			prop: 'email',
			label: '邮箱',
			showOverflowTooltip: true,
		},
		useOperate([
			{
				title: '删除',
				onClick: async (row: any) => {
					try {
						await useConfirm({
							title: `删除黑名单 【${row.email}】`,
							content: '您确定要删除此黑名单吗?',
						})
						const { data } = await delBlacklist({ emails_to_remove: [row.email] })
						Message.request(data)
						const { getList } = await import('@mail/views/blacklist/useMethod')
						getList()
					} catch (error) {}
				},
			},
		]),
	])

	const search = reactive({
		keyword: '',
	})

	const reset = () => {
		search.keyword = ''
		table.data = []
		table.total = 0
	}

	return {
		tableBatchData,
		email,
		tableRef,
		loading,
		table,
		columns,
		search,
		reset,
	}
})

export default MAIL_BLACKLIST
