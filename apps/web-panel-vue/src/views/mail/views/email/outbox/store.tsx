import { defineStore } from 'pinia'
import { formatTime } from '@/utils'
import { useOperate } from '@/hooks/tools/table/column'
import { useTableData } from '@mail/useMethod'
import { Email } from '@mail/types'

export const MAIL_OUTBOX = defineStore('MAIL_OUTBOX', () => {
	const senderRef = ref()

	const search = reactive({
		p: 1,
		username: null as string | null,
	})

	const { table, columns } = useTableData<Email>([
		{
			prop: 'from',
			label: '发件人',
			width: 250,
			showOverflowTooltip: true,
		},
		{
			prop: 'to',
			label: '收件人',
			width: 250,
			showOverflowTooltip: true,
		},
		{
			prop: 'theme',
			label: '主题',
			minWidth: 160,
			showOverflowTooltip: true,
			render: row => {
				const html = row.html
				const preview = (html || row.body || '').slice(0, 2000) + ((html || row.body || '').length > 2000 ? '...' : '')
				return (
					<span
						class="cursor-pointer"
						onClick={async () => {
							const { onShowView } = await import('@mail/views/email/outbox/useMethod')
							onShowView(row)
						}}>
						<a class="bt-link">{row.subject}</a>
						{/* <span class="text-desc"> - {preview}</span> */}
					</span>
				)
			},
		},
		{
			prop: 'time',
			label: '时间',
			width: 150,
			minWidth: 150,
			render: row => formatTime(row.time),
		},
		useOperate(
			[
				{
					title: '查看',
					onClick: async (row: any) => {
						const { onShowView } = await import('@mail/views/email/outbox/useMethod')
						onShowView(row)
					},
				},
				{
					title: '删除',
					onClick: async (row: any) => {
						const { onDel } = await import('@mail/views/email/outbox/useMethod')
						onDel(row)
					},
				},
			],
			{
				width: 200,
				fixed: 'right',
				label: '操作',
			}
		),
	])

	const reset = () => {
		search.username = null
		table.data = []
		table.total = 0
		search.p = 1
	}

	return {
		search,
		table,
		columns,
		senderRef,
		reset,
	}
})

export default MAIL_OUTBOX
