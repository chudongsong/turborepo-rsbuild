import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { useTableData, useModalData } from '@mail/useMethod'
import { useOperate, usePassword } from '@/hooks/tools/table/column'
import { ElSwitch } from 'element-plus'
import { getByteUnit } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { editMailbox } from '@/api/mail'
import { Message } from '@/hooks/tools'

export const MAIL_MAILBOX = defineStore('MAIL_MAILBOX', () => {
	const router = useRouter()

	const search = reactive({
		p: 1,
		size: 10,
	})

	const formModal = useModalData('添加邮箱', {
		isEdit: false,
		row: undefined,
		onRefresh: async () => {
			const { getList } = await import('@mail/views/mailbox/method')
			getList()
		},
	})

	const info = reactive({
		id: 0,
		site_name: '',
		status: false,
		ssl_status: false,
	})

	const { table, columns } = useTableData([
		{
			prop: 'username',
			label: '用户名',
			showOverflowTooltip: true,
		},
		usePassword(),
		{
			prop: 'info',
			label: '登录信息',
			width: 180,
			render: row => (
				<a
					class="bt-link"
					href="javascript:;"
					onClick={async () => {
						const { onCopy } = await import('@mail/views/mailbox/method')
						onCopy(row)
					}}>
					复制
				</a>
			),
		},
		{
			prop: 'quota',
			label: '邮箱配额',
			render: row => getByteUnit(row.quota),
		},
		{
			prop: 'is_admin',
			label: '类型',
			render: row => (row.is_admin === 1 ? '管理员' : '普通用户'),
		},
		{
			prop: 'active',
			label: '状态',
			render: row => (
				<ElSwitch
					v-model={row.active}
					size="small"
					activeValue={1}
					inactiveValue={0}
					onChange={async (val: any) => {
						const { data } = await editMailbox({
							username: row.username,
							full_name: row.full_name,
							quota: getByteUnit(row.quota),
							active: val,
							is_admin: row.is_admin,
						})
						row.active = val
						Message.request(data)
					}}
				/>
			),
		},
		useOperate(
			[
				{
					title: 'WebMail',
					onClick: async (row: any) => {
						if (info.status) {
							const { onLogin } = await import('@mail/views/mailbox/method')
							onLogin(row)
						} else {
							try {
								await useConfirm({
									title: 'WebMail未激活',
									content: () => (
										<div>
											WebMail尚未激活，请前往"
											<a
												class="bt-link"
												href="javascript:;"
												onClick={() => {
													router.push('/mail/setting')
												}}>
												邮局 &gt; 设置
											</a>
											" 激活并安装它
										</div>
									),
								})
								router.push({
									name: 'mail-setting',
								})
							} catch (error) {}
						}
					},
				},
				{
					title: '编辑',
					onClick: async (row: any) => {
						const { onShowEdit } = await import('@mail/views/mailbox/method')
						onShowEdit(row)
					},
				},
				{
					title: '删除',
					onClick: async (row: any) => {
						const { onDel } = await import('@mail/views/mailbox/method')
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
		search.p = 1
		search.size = 10
		info.id = 0
		info.status = false
		info.ssl_status = false
		info.site_name = ''
		formModal.data.row = undefined
		formModal.data.isEdit = false
		table.data = []
	}

	return {
		search,
		formModal,
		info,
		table,
		columns,
		reset,
	}
})

export default MAIL_MAILBOX
