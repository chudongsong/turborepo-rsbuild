import { isObject, isDev } from '@/utils'
import { useDialog } from '@/hooks/tools/dialog'
import { importRecipient, getRecipientData, addSendTask } from '@/api/mail'
import { Message } from '@/hooks/tools'

import MAIL_MASS_ADD from '@mail/views/mass/add/store'
import { storeToRefs } from 'pinia'

const { form, formRef, limitList, maxThreads, propsData } = storeToRefs(MAIL_MASS_ADD())
const { initForm } = MAIL_MASS_ADD()

export const init = (data: any) => {
	propsData.value = data
	initForm()
}

export const onUpdateTo = async (val: string) => {
	if (!val) return
	const { data: ress } = await importRecipient({ file: val })
	Message.request(ress)
	const { data } = await getRecipientData({ file: val })
	if (isObject(data.msg)) {
		let total = 0
		limitList.value = Object.entries(data.msg).map(([domain, { count, etc }]) => {
			total += count
			return { domain, count, etc }
		})

		maxThreads.value = total >= 10000 ? 10 : 5
	}
}

export const onShowCase = () => {
	useDialog({
		title: 'Unsubscribe Link Case',
		area: 55.4,
		btn: false,
		component: () => (
			<>
				<img src={`/static/images/mail/unsubscribe.png`}></img>
			</>
		),
	})
}

export const getParams = () => {
	return {
		task_name: form.value.task_name,
		addresser: form.value.addresser || '',
		file_recipient: form.value.file_recipient,
		subject: form.value.subject,
		up_content: form.value.up_content,
		file_content: form.value.file_content,
		content: form.value.content,
		is_record: form.value.is_record,
		unsubscribe: form.value.unsubscribe,
		threads: form.value.threadsType === 0 ? 0 : form.value.threads,
	}
}

export const onConfirm = async (close: any) => {
	await formRef.value?.validate()
	if (limitList.value.length === 0) {
		Message.error('导入的收件人列表为空或格式错误，请重新导入正确格式的收件人邮箱')
		return
	}
	const { data } = await addSendTask(getParams())
	Message.request(data)
	if (data.status) {
		propsData.value.data.onRefresh && propsData.value.data.onRefresh()
		close()
	}
}
