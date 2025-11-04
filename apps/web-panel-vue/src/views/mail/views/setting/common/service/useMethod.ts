import { isObject } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { getServiceStatus, setServiceStatus, repairService } from '@/api/mail'
import { MailServiceTable } from '@mail/types'
import { useDataHandle, useMessage } from '@/hooks/tools'
import { useDialog } from '@/hooks/tools'
import MAIL_SETTING_SERVICE from '@/views/mail/views/setting/common/service/store'
import { storeToRefs } from 'pinia'

const { table, configModal } = storeToRefs(MAIL_SETTING_SERVICE())
const { setLoading } = MAIL_SETTING_SERVICE()

const Message = useMessage()

export const onChangeStatus = (row: MailServiceTable) => {
	useConfirm({
		title: row.status ? `正在停止 ${row.key} 服务` : `正在启动 ${row.key} 服务`,
		content: row.status ? `确定要停止 ${row.key} 服务吗？` : `确定要启动 ${row.key} 服务吗？`,
		onConfirm: async () => {
			useDataHandle({
				request: setServiceStatus({
					service: row.key,
					type: row.status ? 'stop' : 'start',
				}),
				message: true,
				success: () => {
					getList()
				},
			})
		},
	})
}

export const onRestart = (row: MailServiceTable) => {
	useConfirm({
		title: `重启 ${row.key} 服务`,
		content: `确定要重启 ${row.key} 服务吗？`,
		onConfirm: async () => {
			useDataHandle({
				request: setServiceStatus({
					service: row.key,
					type: 'restart',
				}),
				message: true,
				success: () => {
					getList()
				},
			})
		},
	})
}

export const onRepair = (row: MailServiceTable) => {
	let content = `确定要修复 ${row.key} 服务吗？`
	if (row.key === 'dovecot') {
		content = '配置将恢复为默认设置，并使以下配置失效：SSL。确认继续吗？'
	} else if (row.key === 'postfix') {
		content = '配置将恢复为默认设置，并使以下配置失效：SSL、防垃圾邮件、BCC、SMTP 中继、邮件转发。确认继续吗？'
	}
	useConfirm({
		title: `修复 ${row.key} 服务`,
		content,
		onConfirm: async () => {
			useDataHandle({
				request: repairService({
					service: row.key,
					type: 'repair',
				}),
				message: true,
				success: () => {
					getList()
				},
			})
		},
	})
}

export const onShowConfig = (row: MailServiceTable) => {
	configModal.value.data.row = row
	configModal.value.title = `在线编辑 【${row.key}_配置文件】`
	configModal.value.show = true
	useDialog({
		title: configModal.value.title,
		area: [80, 60],
		component: () => import('./config.vue'),
		compData: configModal.value.data,
		showFooter: true,
		confirmText: '保存',
	})
}

export const getList = async () => {
	try {
		setLoading(true)
		const { data } = await getServiceStatus()
		if (isObject(data)) {
			table.value.data = []

			table.value.data.push({ key: 'dovecot', name: 'Dovecot', status: data.dovecot })
			if (data.change_rspamd) {
				table.value.data.push({ key: 'opendkim', name: 'Opendkim', status: data.opendkim })
			} else {
				table.value.data.push({ key: 'rspamd', name: 'Rspamd', status: data.rspamd })
			}
			table.value.data.push({ key: 'postfix', name: 'Postfix', status: data.postfix })
		}
	} finally {
		setLoading(false)
	}
}
