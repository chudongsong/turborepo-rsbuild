import { getCkeditorData, setCkeditorData } from '@mail/useMethod'
import { sendMailContent } from '@/api/mail'
import { useMessage } from '@/hooks/tools'
import MAIL_SEND from '@mail/views/email/send/store'
import { storeToRefs } from 'pinia'

const { form, formRef } = storeToRefs(MAIL_SEND())

const Message = useMessage()

export const getParams = () => {
	return {
		mail_from: form.value.sender || '',
		mail_to: JSON.stringify(form.value.mail_to.split(',')),
		subject: form.value.subject,
		content: getCkeditorData(),
		subtype: 'html',
		smtp_server: 'localhost',
	}
}

export const onSend = async () => {
	await formRef.value?.validate()
	const params = getParams()
	const { data } = await sendMailContent(params)
	Message.request(data)
	form.value.mail_to = ''
	form.value.subject = ''
	setCkeditorData('')
}
