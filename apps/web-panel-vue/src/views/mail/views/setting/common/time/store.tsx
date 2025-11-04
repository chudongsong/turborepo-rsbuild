import { defineStore } from 'pinia'

export const MAIL_SETTING_TIME = defineStore('MAIL_SETTING_TIME', () => {
	const type = ref(0)

	const days = ref<any>(null)

	const reset = () => {
		type.value = 0
		days.value = null
	}

	return {
		type,
		days,
		reset,
	}
})

export default MAIL_SETTING_TIME
