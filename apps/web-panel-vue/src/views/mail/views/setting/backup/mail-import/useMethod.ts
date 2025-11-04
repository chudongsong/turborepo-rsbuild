import { isArray, isObject, isString } from '@/utils'
import { fileSelectionDialog } from '@/public'
import { openUploadDialog } from '@mail/useMethod'
import { useConfirm } from '@/hooks/tools/confirm'
import { getBackupList, getBackupPath, restoreBackup, deleteFile } from '@/api/mail'
import { MailBackup } from '@mail/types'
import { Message, useDataHandle } from '@/hooks/tools'
import MAIL_BACKUP_IMPORT from '@mail/views/setting/backup/mail-import/store'
import { storeToRefs } from 'pinia'

const { search, table } = storeToRefs(MAIL_BACKUP_IMPORT())
const { setLoading } = MAIL_BACKUP_IMPORT()

export const onUpload = () => {
	openUploadDialog({
		path: search.value.path,
		uploadData: {
			accept: '.gz,.tar,.tar.gz,.zip',
			multiple: true,
		},
		refreshEvent: (fileList: any, popupClose: any) => {
			getList()
			popupClose()
		},
	})
}

export const onSelect = () => {
	fileSelectionDialog({
		type: 'file',
		change: async val => {
			useDataHandle({
				request: restoreBackup({ file_path: val }),
				message: true,
			})
		},
	})
}

export const onRestore = async (row: MailBackup) => {
	await useConfirm({
		title: '恢复备份',
		content: '确认恢复当前备份?',
	})
	const { data } = await restoreBackup({ file_path: `${search.value.path}/${row.name}` })
	Message.request(data)
}

export const onDelete = async (row: MailBackup) => {
	await useConfirm({
		title: '删除备份',
		content: '确认删除当前备份?',
	})
	const { data } = await deleteFile({ path: `${search.value.path}/${row.name}` })
	Message.request(data)
	getList()
}

export const getPath = async () => {
	const { data } = await getBackupPath()
	if (isObject(data)) {
		search.value.path = isString(data.data) ? data.data : ''
	}
}

export const getList = async () => {
	try {
		setLoading(true)
		await getPath()
		const { data } = await getBackupList(toRaw(search.value))
		table.value.data = isArray(data.data) ? data.data : ([] as any)
	} finally {
		setLoading(false)
	}
}
