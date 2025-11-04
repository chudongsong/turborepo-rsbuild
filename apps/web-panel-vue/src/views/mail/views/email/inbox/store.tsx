import { defineStore } from 'pinia'
import { formatTime } from '@/utils'
import { useOperate } from '@/hooks/tools/table/column'
import { useTableData } from '@mail/useMethod'
import { Email } from '@mail/types'

export const MAIL_INBOX = defineStore('MAIL_INBOX', () => {
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
							const { onShowView } = await import('@mail/views/email/inbox/useMethod')
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
						const { onShowView } = await import('@mail/views/email/inbox/useMethod')
						onShowView(row)
					},
				},
				{
					title: '垃圾邮件',
					onClick: async (row: any) => {
						const { onSpam } = await import('@mail/views/email/inbox/useMethod')
						onSpam(row)
					},
				},
				{
					title: '删除',
					onClick: async (row: any) => {
						const { onDel } = await import('@mail/views/email/inbox/useMethod')
						onDel(row)
					},
				},
			],
			{
				fixed: 'right',
				width: 200,
				label: '操作',
			}
		),
	])

	const reset = () => {
		search.p = 1
		search.username = null
		table.data = []
		table.total = 0
		senderRef.value = null
	}

	return {
		senderRef,
		search,
		table,
		columns,
		reset,
	}
})

export default MAIL_INBOX
