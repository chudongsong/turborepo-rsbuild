import { isArray, isObject } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { getBccList, delMailBcc } from '@/api/mail'
import { MailBcc } from '@mail/types'
import { useDialog } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import MAIL_BCC from '@mail/views/setting/bcc/store'
import { storeToRefs } from 'pinia'

const { search, table, formModal } = storeToRefs(MAIL_BCC())

const Message = useMessage()

export const onShowAdd = () => {
	formModal.value.data.isEdit = false
	formModal.value.title = '添加密抄'
	formModal.value.show = true
	useDialog({
		title: formModal.value.title,
		area: 54,
		component: () => import('./add/index.vue'),
		compData: formModal.value.data,
		showFooter: true,
	})
}

export const onShowEdit = (row: MailBcc) => {
	formModal.value.data.isEdit = true
	formModal.value.data.row = row
	formModal.value.title = `编辑密抄`
	formModal.value.show = true
	useDialog({
		title: formModal.value.title,
		area: 54,
		component: () => import('./add/index.vue'),
		compData: formModal.value.data,
		showFooter: true,
	})
}

export const onDel = async (row: MailBcc) => {
	try {
		await useConfirm({
			title: '删除转发',
			content: `是否删除转发设置?`,
		})
		const { data } = await delMailBcc({
			type: row.type,
			user: row.user,
			forward_user: row.forward_user,
		})
		Message.request(data)
		getList()
	} catch (error) {}
}

export const getList = async () => {
	try {
		table.value.loading = true
		const { data } = await getBccList()
		table.value.data = []
		if (isObject(data.data)) {
			Object.entries(data.data).forEach(([key, item]) => {
				if (isArray(item)) {
					table.value.data.push(...item.map((item: any) => ({ ...item, type: key })))
				}
			})
		}
	} finally {
		table.value.loading = false
	}
}

export const refresh = () => {
	search.value.p = 1
	getList()
}
