import { getPageTotal, isArray, isObject } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { getTaskList, setPauseTask, deleteTask } from '@/api/mail'
import { MailTask } from '@mail/types'
import { Message, useDialog } from '@/hooks/tools'
import MAIL_MASS from '@mail/views/mass/store'
import { storeToRefs } from 'pinia'

const { search, table, formModal, failModal, logModal } = storeToRefs(MAIL_MASS())

export const onShowAdd = () => {
	formModal.value.show = true
	useDialog({
		title: formModal.value.title,
		area: 70,
		component: () => import('./add/index.vue'),
		compData: {
			data: formModal.value.data,
		},
		showFooter: true,
		closeBtn: 2,
	})
}

export const onShowFail = (row: MailTask) => {
	failModal.value.data.row = row
	failModal.value.title = `错误任务 【${row.task_name}】`
	failModal.value.show = true
	useDialog({
		title: failModal.value.title,
		area: 70,
		component: () => import('./fail/index.vue'),
		compData: failModal.value.data,
	})
}

export const onShowLog = (row: MailTask) => {
	logModal.value.data.row = row
	logModal.value.title = `日志 【${row.task_name}】`
	logModal.value.show = true
	useDialog({
		title: logModal.value.title,
		area: [60, 50],
		component: () => import('./mass-log.vue'),
		compData: logModal.value.data,
	})
}

export const onSetStatus = async (row: MailTask) => {
	try {
		await useConfirm({
			title: `修改任务状态 【${row.task_name}】`,
			content: row.task_process ? '暂停任务后，可以继续发送任务！' : `立即开始发送任务?`,
		})
		const { data } = await setPauseTask({ task_id: row.id, pause: row.task_process ? 1 : 0 })
		Message.request(data)
		getList()
	} catch (error) {}
}

export const onDel = async (row: MailTask) => {
	try {
		await useConfirm({
			title: '删除任务',
			content: `是否删除 [${row.task_name}] 任务?`,
		})
		const { data } = await deleteTask({ task_id: row.id })
		Message.request(data)
		getList()
	} catch (error) {}
}

export const getList = async () => {
	try {
		table.value.loading = true
		const { data } = await getTaskList(toRaw(search.value))
		if (isObject(data)) {
			table.value.data = isArray(data.data) ? data.data : []
			table.value.total = getPageTotal(data.page)
		}
	} finally {
		table.value.loading = false
	}
}
