import { defineStore } from 'pinia'
import { MailDomain } from '@mail/types'
import { setDomainCatchall } from '@/api/mail'
import { Message } from '@/hooks/tools'
interface PropsData {
	row: MailDomain
	onRefresh: () => void
}

export const MAIL_DOMAIN_CATCH = defineStore('MAIL_DOMAIN_CATCH', () => {
	const form = reactive({
		email: '',
		catch_type: 'none',
	})

	const formRef = ref<any>(null)

	const rules: Record<string, any[]> = {
		email: [
			{
				required: true,
				message: '请输入邮箱',
				trigger: 'blur',
			},
		],
	}

	const propsData = ref({} as PropsData)

	const init = (data: PropsData) => {
		propsData.value = data
	}

	const onConfirm = async () => {
		await formRef.value?.validate()
		const { row, onRefresh } = propsData.value
		const { data } = await setDomainCatchall({ domain: row.domain, email: form.email, catch_type: form.catch_type })
		Message.request(data)
		if (data.status) {
			onRefresh && onRefresh()
		} else {
			return false
		}
	}

	return {
		form,
		init,
		rules,
		formRef,
		onConfirm,
	}
})

export default MAIL_DOMAIN_CATCH
