import { defineStore } from 'pinia'

export const MAIL_BACKUP_PLAN = defineStore('MAIL_BACKUP_PLAN', () => {
	const open = ref(false)

	const form = reactive({
		open: false,
		cycle: 'week',
		week: '1',
		hour: 1,
		minute: 30,
		backupTo: 'localhost',
		save: 3,
	})

	const toOptions = ref<any[]>([{ label: '服务器磁盘', value: 'localhost' }])

	const weekOptions = [
		{ label: '周一', value: '1' },
		{ label: '周二', value: '2' },
		{ label: '周三', value: '3' },
		{ label: '周四', value: '4' },
		{ label: '周五', value: '5' },
		{ label: '周六', value: '6' },
		{ label: '周日', value: '0' },
	]

	const cycleOptions = [
		{ label: '每周', value: 'week' },
		{ label: '每天', value: 'day' },
	]

	const reset = () => {
		form.cycle = 'week'
		form.week = '1'
		form.hour = 1
		form.minute = 30
		form.backupTo = 'localhost'
		form.save = 3
		form.open = false
		open.value = false
	}

	return {
		open,
		form,
		toOptions,
		weekOptions,
		cycleOptions,
		reset,
	}
})

export default MAIL_BACKUP_PLAN
