import type { MailBcc } from '@mail/types'

import { defineStore } from 'pinia'
import { useOperate } from '@/hooks/tools/table/column'
import { useModalData, useTableData } from '@mail/useMethod'
import BtIcon from '@/components/base/bt-icon'

export const MAIL_BCC = defineStore('MAIL_BCC', () => {
	const search = reactive({
		p: 1,
		size: 10,
	})

	const formModal = useModalData('添加密抄', {
		isEdit: false,
		row: undefined,
		onRefresh: async () => {
			const { getList } = await import('@mail/views/setting/bcc/useMethod')
			getList()
		},
	})

	const typeMap = new Map([
		['sender', '发送时抄送'],
		['recipient', '接收时抄送'],
	])

	const { table, columns } = useTableData<MailBcc>([
		{
			prop: 'user',
			label: '被抄送者',
			showOverflowTooltip: true,
		},
		{
			prop: 'forward_user',
			label: '抄送到',
			showOverflowTooltip: true,
		},
		{
			prop: 'domain',
			label: '域名',
			showOverflowTooltip: true,
		},
		{
			prop: 'type',
			label: '抄送类型',
			render: row => typeMap.get(row.type),
		},
		{
			prop: 'active',
			label: '状态',
			render: row => <div class={`w-[2rem]`}>{row.active === 1 ? <BtIcon icon="el-circle-check" class="!text-primary" /> : <BtIcon icon="el-circle-close" class="!text-dangerDark" />}</div>,
		},
		useOperate([
			{
				title: '编辑',
				onClick: async (row: any) => {
					const { onShowEdit } = await import('@mail/views/setting/bcc/useMethod')
					onShowEdit(row)
				},
			},
			{
				title: '删除',
				onClick: async (row: any) => {
					const { onDel } = await import('@mail/views/setting/bcc/useMethod')
					onDel(row)
				},
			},
		]),
	])

	const reset = () => {
		search.p = 1
		search.size = 10
		table.data = []
		table.total = 0
	}

	return {
		search,
		formModal,
		table,
		columns,
		reset,
	}
})

export default MAIL_BCC
