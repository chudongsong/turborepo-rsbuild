import { storeToRefs } from 'pinia'
import { getPageTotal, isArray, isObject } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { getDomains, setDomainCatchall, delDomain, flushDomainRecord, checkBlacklists, autoCreateDNSRecord, getIpList } from '@/api/mail'
import { MailDomain } from '@mail/types'
import { Message, useDataHandle, useDialog } from '@/hooks/tools'

import MAIL_DOMAIN from '@mail/views/domain/store'
import MAIL_DOMAIN_ADD from '@mail/views/domain/add/store'
import MAIL_DOMAIN_CATCH from '@mail/views/domain/catch/store'
import { router } from '@/router'
import { menu } from '@mail/views/setting/useMethod'

const store = MAIL_DOMAIN()
const { search, table, formModal, dnsModal, sslModal, catchModal }: any = storeToRefs(store)

const { onConfirm: mailDomainAddConfirm } = MAIL_DOMAIN_ADD()
const { onConfirm: mailDomainCatchConfirm } = MAIL_DOMAIN_CATCH()

export const getList = async () => {
	try {
		table.value.loading = true
		const { data } = await getDomains(search.value)
		if (isObject(data)) {
			table.value.data = isArray(data.data) ? data.data : []
			table.value.total = getPageTotal(data.page)
		}
	} finally {
		table.value.loading = false
	}
}

export const onShowAdd = () => {
	formModal.value.data.isEdit = false
	formModal.value.title = '添加域名'
	useDialog({
		title: formModal.value.title,
		area: 54,
		showFooter: true,
		component: () => import('./add/index.vue'),
		compData: formModal.value.data,
		onConfirm: mailDomainAddConfirm,
	})
}

export const onOpenCatch = (row: MailDomain) => {
	catchModal.value.data.row = row
	useDialog({
		title: catchModal.value.title,
		area: 46,
		component: () => import('./catch/index.vue'),
		compData: catchModal.value.data,
		showFooter: true,
		onConfirm: mailDomainCatchConfirm,
		onCancel: () => {
			row.catch_all = !row.catch_all
		},
	})
}

export const onCloseCatch = async (row: MailDomain) => {
	await useConfirm({
		title: '捕获电子邮件',
		content: '确认关闭捕获功能?',
		onCancel: () => {
			row.catch_all = !row.catch_all
		},
	})
	const { data } = await setDomainCatchall({ domain: row.domain, email: '' })
	Message.request(data)
	getList()
}

export const onShowSSL = (row: MailDomain) => {
	sslModal.value.data.row = row
	useDialog({
		title: sslModal.value.title,
		area: 65,
		component: () => import('./ssl/index.vue'),
		compData: sslModal.value.data,
	})
}

export const onShowDNS = async (row: MailDomain) => {
	dnsModal.value.data.row = row
	dnsModal.value.title = `DNS记录 【${row.domain}】`
	useDialog({
		title: dnsModal.value.title,
		area: 75,
		component: () => import('./dns/index.vue'),
		compData: dnsModal.value.data,
	})
}

export const onShowEdit = (row: MailDomain) => {
	formModal.value.data.row = row
	formModal.value.data.isEdit = true
	formModal.value.title = `编辑域名 【${row.domain}】`
	useDialog({
		title: formModal.value.title,
		area: 54,
		showFooter: true,
		component: () => import('./add/index.vue'),
		compData: formModal.value.data,
		onConfirm: mailDomainAddConfirm,
	})
}

export const onDel = async (row: MailDomain) => {
	await useConfirm({
		title: '删除域名',
		content: `是否删除【${row.domain}】域名`,
		onConfirm: async () => {
			const { data } = await delDomain({ domain: row.domain })
			Message.request(data)
			getList()
		},
	})
}

export const onRefresh = async () => {
	try {
		table.value.loading = true
		await flushDomainRecord({ domain: 'all' })
		search.value.p = 1
		getList()
	} finally {
		table.value.loading = false
	}
}

export const onShowCheck = (row: any) => {
	useDialog({
		title: '黑名单检查',
		area: 65,
		compData: {
			row,
		},
		component: () => import('./check/index.vue'),
	})
}

export const onCheck = async (a_record: any) => {
	useDataHandle({
		request: checkBlacklists({ a_record }),
		loading: '检查中...',
		message: true,
		success: () => {
			getList()
		},
	})
}

export const onShowCheckLog = (log: any) => {
	useDialog({
		title: '黑名单检查日志',
		area: 65,
		component: () => import('./log/index.vue'),
		compData: {
			log,
		},
	})
}

// 一键解析
export const onParseAll = async (domain: string, mx_record: string, callback?: (data: any, resultData: any[]) => void) => {
	let load = Message.load('解析中...')
	try {
		let resultData: any[] = []
		const { data } = await autoCreateDNSRecord({ domain, a_record: mx_record })
		data.data.forEach((item: any) => {
			resultData.push({
				name: item.name,
				status: item.status,
				msg: item.msg,
			})
		})
		callback?.(data, resultData)
	} catch (err) {
		console.log('error', err)
	} finally {
		load.close()
	}
}

export const onShowIpRotate = (row: any) => {
	useDialog({
		title: `设置IP轮换 【${row.domain}】`,
		area: 47,
		component: () => import('./ip-rotate/index.vue'),
		compData: {
			row,
		},
		btn: true,
	})
}

export const ipTagOptions = ref<{ label: string; value: string; ip: string }[]>([])

export const getIpTagOptions = async () => {
	const {
		data: { data },
	} = await getIpList()
	ipTagOptions.value = data.map((item: any) => ({
		label: item.tag,
		value: item.tag,
		ip: item.ip,
	}))
}

export const addIpTag = () => {
	menu.value = 'ip'
	router.push('/mail/setting')
}
