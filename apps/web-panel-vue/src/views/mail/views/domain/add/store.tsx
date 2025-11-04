import { defineStore } from 'pinia'
import { MailDomain } from '@mail/types'
import { getByteUnit } from '@/utils'
import { getNumber } from '@mail/useMethod'
import { addDomain, editDomain } from '@/api/mail'
import { Message } from '@/hooks/tools'

interface PropsData {
	row?: MailDomain
	isEdit: boolean
	onRefresh: () => void
}

export const MAIL_DOMAIN_ADD = defineStore('MAIL_DOMAIN_ADD', () => {
	const formRef = ref<any>(null)

	const propsData = ref({} as PropsData)

	const form = reactive({
		domain: '',
		a_record: '',
		quota: 5,
		quota_unit: 'GB',
		mailboxes: 50,
		email: '',
		dns_id: null as number | null,
		auto_create_record: 1,
		catch_type: 'none',
		ip_tag: [] as string[],
	})

	const unitOptions = [
		{ label: 'GB', value: 'GB' },
		{ label: 'MB', value: 'MB' },
	]

	const rules: Record<string, any[]> = {
		domain: [
			{
				trigger: ['blur', 'input'],
				validator: (rule, value, callback) => {
					if (!value || value.trim() === '') {
						return callback(new Error('收件箱域名不能为空!'))
					}
					callback()
				},
			},
		],
		mailboxes: [
			{
				trigger: ['blur', 'input'],
				validator: (rule, value, callback) => {
					// 大于0的整数
					if (!/^[1-9]\d*$/.test(value)) {
						callback(new Error('请输入大于0的正整数'))
					} else {
						callback()
					}

					// if (value === '' || value === null || value === undefined) {
					// 	return callback(new Error('邮箱数量不能为空!'))
					// }
					// if (typeof value !== 'number' || value <= 0) {
					// 	return callback(new Error('邮箱数量必须大于 0!'))
					// }
					callback()
				},
			},
		],
	}

	const getParams = () => {
		let params: any = {
			domain: form.domain,
			a_record: form.a_record,
			quota: form.quota + ' ' + form.quota_unit,
			mailboxes: form.mailboxes,
			email: form.email,
			dns_id: form.dns_id,
			catch_type: form.catch_type,
			ip_tag: form.ip_tag,
		}
		if (form.dns_id) {
			params.auto_create_record = form.auto_create_record
		}
		return params
	}

	const onConfirm = async () => {
		await formRef.value?.validate()
		let ress
		const { isEdit } = propsData.value
		if (isEdit) {
			ress = await editDomain(getParams())
		} else {
			ress = await addDomain(getParams())
		}
		const { data } = ress
		Message.request(data)
		if (data.status) {
			propsData.value.onRefresh && propsData.value.onRefresh()
			resetForm()
		} else {
			return false
		}
	}

	const initForm = (data: PropsData) => {
		propsData.value = data
		resetForm()
		const { isEdit, row } = data
		if (isEdit && row) {
			form.domain = row.domain
			form.a_record = row.a_record
			const quota = getByteUnit(row.quota)
			form.quota = getNumber(quota.split(' ')[0])
			form.quota_unit = quota.split(' ')[1]
			form.mailboxes = row.mailboxes
			form.email = row.email
			form.ip_tag = row.ip_tag.map((item: any) => item.tag) || []
			form.catch_type = row.catch_type
			if (row.dns_id) {
				form.dns_id = row.dns_id
				form.auto_create_record = 1
			}
		}
	}

	const resetForm = () => {
		Object.assign(form, {
			domain: '',
			a_record: '',
			quota: 5,
			quota_unit: 'GB',
			mailboxes: 50,
			email: '',
			dns_id: null,
			auto_create_record: 1,
			ip_tag: '',
			catch_type: 'none',
		})
	}

	return {
		form,
		formRef,
		unitOptions,
		rules,
		onConfirm,
		initForm,
		propsData,
	}
})

export default MAIL_DOMAIN_ADD
