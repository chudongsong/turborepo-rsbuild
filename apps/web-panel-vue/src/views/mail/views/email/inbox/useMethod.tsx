import { getPageTotal, isArray, isObject } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { useMessage } from '@/hooks/tools'
import { deleteMail, getInboxMails, moveSpamMail } from '@/api/mail'
import { Email } from '@mail/types'
import { useDialog } from '@/hooks/tools'
import MAIL_INBOX from '@mail/views/email/inbox/store'
import { storeToRefs } from 'pinia'

const { search, table } = storeToRefs(MAIL_INBOX())

const Message = useMessage()

export const onShowView = (row: Email) => {
	useDialog({
		title: `检查邮件【${row.subject}】`,
		area: [85, 68],
		compData: { row },
		component: () => import('@mail/public/mail-view.vue'),
	})
}

export const onSpam = async (row: Email) => {
	try {
		await useConfirm({
			title: '标记为垃圾邮件',
			content: '您确定要将此消息标记为垃圾邮件吗？',
		})
		const { data } = await moveSpamMail({ path: row.path, username: search.value.username || '' })
		Message.request(data)
		getList()
	} catch (error) {}
}

export const onDel = async (row: Email) => {
	const { data } = await deleteMail({ path: row.path })
	Message.request(data)
	getList()
}

export const getList = async () => {
	try {
		table.value.loading = true
		const { data } = await getInboxMails({
			p: search.value.p,
			username: search.value.username || '',
		})
		if (isObject(data)) {
			table.value.data = isArray(data.data) ? data.data : []
			table.value.total = getPageTotal(data.page)
		}
	} finally {
		table.value.loading = false
	}
}

export const refresh = () => {
	search.value.p = 1
	getList()
}
