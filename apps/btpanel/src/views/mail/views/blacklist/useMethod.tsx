import type { TableBatchOptionsProps, TableBatchDialogProps, TableBatchNextAllProps } from '@/components/extension/bt-table-batch/types.d'
import { useBatchStatus } from '@/hooks/tools/table/column'
import { isObject, isArray } from '@/utils'
import { useMessage } from '@/hooks/tools/message'

import { downloadFile, openUploadDialog } from '@mail/useMethod'
import { addBlacklist, delBlacklist, exportBlacklist, getBlacklist, importBlacklist } from '@/api/mail'

import MAIL_BLACKLIST from '@mail/views/blacklist/store'
import { storeToRefs } from 'pinia'
import { useDataHandle } from '@/hooks/tools'
const { loading, email, search, table } = storeToRefs(MAIL_BLACKLIST())

const Message = useMessage()

export const getKeys = (row: any) => row.email

export const onAdd = async () => {
	if (email.value.trim() === '') {
		Message.error('请输入邮箱')
		return
	}
	const { data } = await addBlacklist({ emails_to_add: email.value.split(',') })
	Message.request(data)
	getList()
	email.value = ''
}

// 导入
export const onImport = () => {
	openUploadDialog({
		path: '/www/server/panel/data/mail/',
		size: 5,
		uploadData: {
			accept: ['json'].map(item => `.${item}`).join(','),
			multiple: false,
		},
		refreshEvent: async (fileList: any) => {
			await importBlacklist({ file: `/www/server/panel/data/mail/${fileList[0].name}` })
			getList()
		},
	})
}

// 导出
export const onExport = async () => {
	useDataHandle({
		request: exportBlacklist(),
		loading: '加载中...',
		success: ({ data }: any) => {
			if (!data.status) {
				return Message.error(data.msg)
			}
			if (isObject(data)) {
				downloadFile(data.msg)
			}
		},
	})
}

/**
 * @description 容器批量处理事件
 * @param {TableBatchDialogProps} batchConfirm 选中处理事件
 * @param {TableBatchNextAllProps} nextAll 选中处理事件
 * @param {AnyObject[]} selectedList 选中的数据
 * @param {TableBatchOptionsProps} options 选中的配置
 * @returns {Promise<void>} void
 */
export const useBlackListBatchEventHandle: any = async (batchConfirm: TableBatchDialogProps, nextAll: TableBatchNextAllProps, selectedList: AnyObject[], options: TableBatchOptionsProps): Promise<void> => {
	const { label, value } = options
	const requestHandle = async (item: AnyObject, index: number) => {
		const { email } = item
		switch (value) {
			case 'delete':
				return await delBlacklist({ emails_to_remove: [email] }, false)
				break
			default:
				return
		}
	}
	await batchConfirm({
		title: `批量${label}邮件`,
		content: `批量${label}已选的邮件，是否继续操作！`,
		column: [
			{
				label: '邮件',
				prop: 'email',
			},
			useBatchStatus(),
		], // 弹窗配置
		onConfirm: async () => {
			// 递归操作所有选中的数据，如果不需要递归则不需要该方法，执行单接口请求
			await nextAll(requestHandle)
			// 执行完毕的代码，刷新列表
			getList()
			// 返回false则不关闭弹窗
			return false
		},
	})
}

export const getList = async () => {
	try {
		loading.value = true
		const { data } = await getBlacklist(toRaw(search.value))
		if (isArray(data)) {
			table.value.data = data.map((email: any) => ({ email }))
		}
	} finally {
		loading.value = false
	}
}
