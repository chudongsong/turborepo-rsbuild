import { defineStore } from 'pinia'
import { useLoading } from '@mail/useMethod'

export const MAIL_SETTING_MONITOR = defineStore('MAIL_SETTING_MONITOR', () => {
	const status = ref(false)

	const { loading, setLoading } = useLoading()

	const reset = () => {
		status.value = false
		setLoading(false)
	}

	return {
		status,
		loading,
		setLoading,
		reset,
	}
})

export default MAIL_SETTING_MONITOR
