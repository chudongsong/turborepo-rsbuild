import { addMailBcc, editMailBcc } from '@/api/mail'
import { useMessage } from '@/hooks/tools'
import MAIL_BCC_ADD from '@mail/views/setting/bcc/add/store'
import { storeToRefs } from 'pinia'
import { MailBcc } from '@mail/types'
interface PropsData {
	row?: MailBcc
	isEdit: boolean
	onRefresh: () => void
}

const { form, formRef, propsData } = storeToRefs(MAIL_BCC_ADD())

const Message = useMessage()

export const onConfirm = async (close: any) => {
	await formRef.value?.validate()
	let ress
	const { isEdit, row, onRefresh } = propsData.value
	if (isEdit && row) {
		ress = await editMailBcc({
			user: row.user,
			type: row.type,
			forward_user: row.forward_user,
			type_new: form.value.type,
			forward_user_new: form.value.forward_user,
			active_new: form.value.active,
		})
	} else {
		ress = await addMailBcc(toRaw(form.value))
	}
	const { data } = ress
	Message.request(data)
	if (data.status) {
		close()
		onRefresh && onRefresh()
	}
}

const reset = () => {
	form.value.user = ''
	form.value.forward_user = ''
	form.value.type = 'sender'
	form.value.active = 1
}

export const initForm = (data: PropsData) => {
	const { row, isEdit } = data
	propsData.value = data
	reset()

	if (isEdit && row) {
		form.value.user = row.user
		form.value.forward_user = row.forward_user
		form.value.type = row.type
		form.value.active = row.active
	}
}
