import { isArray, isObject } from '@/utils'
import { useConfirm } from '@/hooks/tools/confirm'
import { getBackupParams, saveBackupTask, closeBackupTask, getCloudList } from '@/api/mail'
import { Message } from '@/hooks/tools'
import MAIL_BACKUP_PLAN from '@mail/views/setting/backup/backup-plan/store'
import { storeToRefs } from 'pinia'

const { form, open, toOptions } = storeToRefs(MAIL_BACKUP_PLAN())

export const getParams = () => {
	let params = {
		type: form.value.cycle,
		hour: form.value.hour,
		minute: form.value.minute,
		backupTo: form.value.backupTo,
		save: form.value.save,
	}
	if (form.value.cycle === 'week') {
		params = Object.assign(params, { week: form.value.week })
	}
	return params
}

export const onSave = async () => {
	const { data } = await saveBackupTask(getParams())
	Message.request(data)
	initForm()
}

export const onUpdateOpen = (val: boolean | string | number) => {
	if (open.value && val === false) {
		useConfirm({
			title: '关闭邮件备份',
			content: '确认关闭当前备份计划?',
			onConfirm: async () => {
				const { data } = await closeBackupTask()
				Message.request(data)
				form.value.open = false
			},
			onCancel: () => {
				form.value.open = !val
			},
		})
	}
}

export const getToOptions = async () => {
	const { data } = await getCloudList()
	if (isArray(data.data)) {
		toOptions.value = data.data.map((item: any) => ({ label: item.name, value: item.value }))
		toOptions.value.unshift({ label: '服务器磁盘', value: 'localhost' })
	}
}

export const initForm = async () => {
	try {
		const { data } = await getBackupParams()
		if (isObject(data) && data.hasOwnProperty('type')) {
			open.value = true
			form.value.open = true
			form.value.cycle = data.type
			form.value.week = data.where1
			form.value.hour = data.where_hour
			form.value.minute = data.where_minute
			form.value.backupTo = data.backupTo
			form.value.save = data.save
		}
	} catch (error) {
		open.value = false
		form.value.open = false
	}
}

// 验证保留份数
export const validateSaveCount = (val: string) => {
	const num = parseInt(val)
	if (isNaN(num) || num < 1) {
		form.value.save = 1
	} else {
		form.value.save = num
	}
}

// 验证小时输入
export const validateHour = (val: string) => {
	const num = parseInt(val)
	if (isNaN(num) || num < 0) {
		form.value.hour = 0
	} else if (num > 23) {
		form.value.hour = 23
	} else {
		form.value.hour = num
	}
}

// 验证分钟输入
export const validateMinute = (val: string) => {
	const num = parseInt(val)
	if (isNaN(num) || num < 0) {
		form.value.minute = 0
	} else if (num > 59) {
		form.value.minute = 59
	} else {
		form.value.minute = num
	}
}
