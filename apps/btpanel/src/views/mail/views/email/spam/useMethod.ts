import { getPageTotal, isArray, isObject } from '@/utils'
import { deleteMail, getSpamMails, restoreSpam } from '@/api/mail'
import { Email } from '@mail/types'
import { useDialog } from '@/hooks/tools'
import { useMessage } from '@/hooks/tools'
import MAIL_SPAM from '@mail/views/email/spam/store'
import { storeToRefs } from 'pinia'

const { search, table } = storeToRefs(MAIL_SPAM())

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
	const { data } = await restoreSpam({ path: row.path, username: search.value.username || '' })
	Message.request(data)
	getList()
}

export const onDel = async (row: Email) => {
	const { data } = await deleteMail({ path: row.path })
	Message.request(data)
	getList()
}

export const getList = async () => {
	try {
		table.value.loading = true
		const { data } = await getSpamMails({
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
