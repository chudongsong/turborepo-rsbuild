import { defineStore } from 'pinia'
import type { FormItemRule } from 'element-plus'
import { addMailbox, editMailbox, getDomainName } from '@/api/mail'
import { Mailbox } from '@mail/types'
import { getByteUnit, isArray } from '@/utils'
import { getNumber } from '@mail/useMethod'
import type { SelectOptionProps } from '@components/form/bt-select/types'
import { Message } from '@/hooks/tools'
interface PropsData {
	row?: Mailbox
	isEdit: boolean
	onRefresh: () => void
}

export const MAIL_MAILBOX_ADD = defineStore('MAIL_MAILBOX_ADD', () => {
	const formRef = ref<any>(null)

	const form = reactive({
		full_name: '',
		domain: null as string | null,
		quota: 5,
		quota_unit: 'GB',
		is_admin: 0,
		username: '',
		password: '',
		active: 1,
	})

	const propsData = ref({} as PropsData)

	const domainOptions = ref<SelectOptionProps[]>([])

	const unitOptions = [
		{ label: 'GB', value: 'GB' },
		{ label: 'MB', value: 'MB' },
	]

	const typeOptions = [
		{ label: '普通用户', value: 0 },
		{ label: '管理员', value: 1 },
	]

	const rules: Record<string, FormItemRule[]> = {
		full_name: [
			{
				trigger: ['blur', 'input'],
				validator: (rule, value, callback) => {
					if (!value || value.trim() === '') {
						return callback(new Error('用户名不能为空!'))
					}
					callback()
				},
			},
		],
		username: [
			{
				trigger: ['blur', 'input'],
				validator: (rule, value, callback) => {
					if (!value || value.trim() === '') {
						return callback(new Error('邮箱地址不能为空!'))
					}
					callback()
				},
			},
		],
		quota: [
			{
				trigger: ['blur', 'input'],
				validator: (rule, value, callback) => {
					if (!value) {
						return callback(new Error('邮箱配额大小不能为空!'))
					}
					callback()
				},
			},
		],
		password: [
			{
				trigger: ['blur', 'input'],
				validator: (rule, value, callback) => {
					if (!propsData.value.isEdit) {
						if (!value || value.trim().length < 8) {
							return callback(new Error('当前邮箱用户密码长度小于8位，请重新输入'))
						}
						const pwdReg = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
						if (!pwdReg.test(value)) {
							return callback(new Error('当前邮箱用户密码必须至少包含大小写字母和数字，请重新输入'))
						}
					} else {
						if (value) {
							if (value.trim().length < 8) {
								return callback(new Error('当前邮箱用户密码长度小于8位，请重新输入'))
							}
							const pwdReg = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
							if (!pwdReg.test(value)) {
								return callback(new Error('当前邮箱用户密码必须至少包含大小写字母和数字，请重新输入'))
							}
						}
					}
					callback()
				},
			},
		],
	}

	const getParams = () => {
		return {
			full_name: form.full_name,
			quota: form.quota + ' ' + form.quota_unit,
			is_admin: form.is_admin,
			username: form.username + '@' + form.domain,
			password: form.password,
			active: form.active,
		}
	}

	const onConfirm = async () => {
		await formRef.value?.validate()
		try {
			let ress
			if (propsData.value.isEdit) {
				ress = await editMailbox(getParams())
			} else {
				ress = await addMailbox(getParams())
			}
			const { data } = ress
			Message.request(data)
			if (data.status) {
				propsData.value.onRefresh && propsData.value.onRefresh()
				initFormData()
			} else {
				return false
			}
		} catch (error) {
			console.log(error)
		}
	}

	const getDomainOptions = async () => {
		const { data } = await getDomainName()
		if (isArray(data.data)) {
			domainOptions.value = data.data.map((item: any) => ({
				label: item,
				value: item,
			})) as SelectOptionProps[]
			if (form.domain === null) {
				form.domain = data.data[0] as any
			}
		}
	}

	const initFormData = () => {
		form.full_name = ''
		form.domain = null
		form.quota = 5
		form.quota_unit = 'GB'
		form.is_admin = 0
		form.username = ''
		form.password = ''
		form.active = 1
	}

	const initForm = (data: PropsData) => {
		const { row, isEdit } = data
		propsData.value = data
		initFormData()
		if (isEdit && row) {
			form.full_name = row.full_name
			form.is_admin = row.is_admin
			form.username = row.username.split('@')[0]
			form.active = row.active

			const [username, domain] = row.username.split('@')
			form.username = username
			form.domain = domain

			const quota = getByteUnit(row.quota)
			const [quotaNum, quotaUnit] = quota.split(' ')
			form.quota = getNumber(quotaNum)
			form.quota_unit = quotaUnit
		}
	}

	return {
		form,
		domainOptions,
		unitOptions,
		typeOptions,
		rules,
		getParams,
		onConfirm,
		getDomainOptions,
		initForm,
		formRef,
	}
})

export default MAIL_MAILBOX_ADD
