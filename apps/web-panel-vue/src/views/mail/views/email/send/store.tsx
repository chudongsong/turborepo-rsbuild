import { defineStore } from 'pinia'
import { getCkeditorData } from '@mail/useMethod'

export const MAIL_SEND = defineStore('MAIL_SEND', () => {
	const senderRef = ref()

	const formRef = ref<any>(null)

	const form = reactive({
		sender: null as string | null,
		mail_to: '',
		subject: '',
		content: '',
	})

	const rules = {
		mail_to: {
			trigger: ['blur', 'input'],
			validator: () => {
				if (form.mail_to.trim() === '') {
					return new Error('请输入收件人')
				}
				return true
			},
		},
		subject: {
			trigger: ['blur', 'input'],
			validator: () => {
				if (form.subject.trim() === '') {
					return new Error('请输入邮件主题')
				}
				return true
			},
		},
		content: {
			validator: () => {
				const content = getCkeditorData()
				if (content === '') {
					return new Error('请输入邮件内容')
				}
				return true
			},
		},
	}

	const reset = () => {
		form.sender = null
		form.mail_to = ''
		form.subject = ''
		form.content = ''
		senderRef.value = null
	}

	return {
		formRef,
		senderRef,
		form,
		rules,
		reset,
	}
})

export default MAIL_SEND
