import { useGlobalStore } from '@store/global'
import { getPageTotal, isArray, isObject, copyText } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { getMailboxList, delMailbox, getRoundcubeStatus, loginRoundcube } from '@/api/mail'
import { Mailbox } from '@mail/types'
import { Message, useDialog } from '@/hooks/tools'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { getMailStore } from '@mail/useStore'

const {
	refs: { tabActive },
} = getMailStore()

import MAIL_MAILBOX from './store'
import MAIL_MAILBOX_ADD from '@mail/views/mailbox/add/store'

const { formModal, info, table, search } = storeToRefs(MAIL_MAILBOX())
const { onConfirm: mailboxAddConfirm } = MAIL_MAILBOX_ADD()

const { payment } = useGlobalStore()

export const onShowAdd = () => {
	formModal.value.data.isEdit = false
	formModal.value.data.row = undefined
	formModal.value.title = '添加邮箱'
	useDialog({
		title: formModal.value.title,
		area: 48,
		showFooter: true,
		component: () => import('./add/index.vue'),
		compData: formModal.value.data,
		onConfirm: mailboxAddConfirm,
	})
}

export const useMailMethods = () => {
	const router = useRouter()

	const onLoginMail = async () => {
		if (!info.value.site_name) {
			return Message.msg({
				customClass: 'bt-message-error-html',
				dangerouslyUseHTMLString: true,
				type: 'error',
				message: h('div', { class: 'flex items-center leading-3rem mt-[4px]' }, [
					'请先在【系统设置】-【WebMail】中配置',
					h(
						'span',
						{
							class: 'bt-link',
							onClick: () => {
								router.push('/mail/setting')
								tabActive.value = 'mail-setting'
							},
						},
						' WebMail'
					),
				]),
				showClose: true,
			})
		}
		window.open(`${info.value.ssl_status ? 'https' : 'http'}://${info.value.site_name}`, '_blank', 'noopener,noreferrer')
	}

	return {
		onLoginMail,
	}
}

// 复制
export const onCopy = (row: Mailbox) => {
	copyText({
		value: `WebMail: ${info.value.site_name ? `${info.value.ssl_status ? 'https' : 'http'}://${info.value.site_name}` : '未配置WebMail'}\n用户名: ${row.username}\n密码: ${row.password}\nPOP 服务 [ 地址：${row.mx} 端口：110/995 ]\nIMAP 服务 [ 地址：${row.mx} 端口：143/993 ]\nSMTP 服务 [ 地址：${
			row.mx
		} 端口：25/465/587 ]\n`,
	})
}

// 一键登录
export const onLogin = async (row: Mailbox) => {
	if (payment.value.authType !== 'ltd') {
		return Message.warn('请先购买企业版')
	}
	const { data } = await loginRoundcube({ rc_user: row.username, rc_pass: row.password })
	if (isObject(data)) {
		window.open(`${info.value.ssl_status ? 'https' : 'http'}://${data.data}`, '_blank', 'noopener,noreferrer')
	}
}

export const onShowEdit = (row: Mailbox) => {
	formModal.value.data.isEdit = true
	formModal.value.data.row = row
	formModal.value.title = `编辑邮箱 【${row.username}】`
	useDialog({
		title: formModal.value.title,
		area: 48,
		showFooter: true,
		component: () => import('./add/index.vue'),
		compData: formModal.value.data,
		onConfirm: mailboxAddConfirm,
	})
}

export const onDel = async (row: Mailbox) => {
	try {
		await useConfirm({
			title: '删除邮箱',
			content: `是否删除【${row.username}】邮箱?`,
		})
		const { data } = await delMailbox({ username: row.username })
		Message.request(data)
		getList()
	} catch (error) {}
}

export const getInfo = async () => {
	const { data } = await getRoundcubeStatus()
	if (isObject(data)) {
		info.value.id = data.id
		info.value.status = data.status
		info.value.site_name = data.site_name
		info.value.ssl_status = data.ssl_status
	}
}

export const getList = async () => {
	try {
		table.value.loading = true
		const { data } = await getMailboxList(toRaw(search.value))
		if (isObject(data.data)) {
			table.value.data = isArray(data.data.data) ? data.data.data : []
			table.value.total = getPageTotal(data.data.page)
		}
	} finally {
		table.value.loading = false
	}
}

export const init = async () => {
	try {
		table.value.loading = true
		await getInfo()
		await getList()
	} finally {
		table.value.loading = false
	}
}
