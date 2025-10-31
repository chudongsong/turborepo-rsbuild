import { defineStore } from 'pinia'
import { MailBcc } from '@mail/types'

interface PropsData {
	row?: MailBcc
	isEdit: boolean
	onRefresh: () => void
}

export const MAIL_BCC_ADD = defineStore('MAIL_BCC_ADD', () => {
	const formRef = ref()

	const form = reactive({
		user: '',
		forward_user: '',
		type: 'sender',
		active: 1,
	})

	const propsData = ref({} as PropsData)

	const typeOptions = [
		{ label: '发送时抄送', value: 'sender' },
		{ label: '接收时抄送', value: 'recipient' },
	]

	const validateEmail = (rule: any, value: any, callback: any) => {
		if (!value) {
			return callback(new Error('邮箱不能为空'))
		}
		const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
		if (!emailPattern.test(value)) {
			return callback(new Error('请输入正确的邮箱格式'))
		}
		callback()
	}

	const rules = {
		user: [{ required: true, validator: validateEmail, trigger: 'blur' }],
		forward_user: [{ required: true, validator: validateEmail, trigger: 'blur' }],
		type: [{ required: true, message: '请选择抄送类型', trigger: 'change' }],
	}

	return {
		formRef,
		form,
		propsData,
		typeOptions,
		rules,
	}
})

export default MAIL_BCC_ADD
