<template>
	<div class="py-[1rem] px-[3rem]" v-loading="isLoading">
		<BtForm />
		<bt-help :options="helpOptions"> </bt-help>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { addForwardFrom, domainList, editForwardFrom, formDataInit, forwardForm, forwardType, getMailboxListByDomainName, handleForwardFormInit, isLoading, mailboxList, resetFormData } from '../useMethod'
import { FormInput, FormItemCustom, FormSelect, FormSwitch } from '@/hooks/tools/form/form-item'

const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
})

const { isEdit, row } = props.compData

const helpOptions = computed(() => {
	if (forwardType.value === 0) {
		return [
			{
				content: '<span class="text-dangerDark">全部：捕获当前域名下，所有邮件（包括不存在的邮箱的邮件）</span>',
				isHtml: true,
			},
			{
				content: '<span class="text-dangerDark">不存在：捕获当前域名下，不存在的邮箱的邮件</span>',
				isHtml: true,
			},
			{
				content: '<span class="text-dangerDark">前缀：捕获当前域名下，以指定字符串的开头的邮箱（邮箱可以不存在）的邮件</span>',
				isHtml: true,
			},
			{
				content: '<span class="text-dangerDark">后缀：捕获当前域名下，邮箱地址@以前的部分以指定字符串的结尾的邮箱（邮箱可以不存在）的邮件</span>',
				isHtml: true,
			},
			{
				content: '<span class="text-dangerDark">包含：捕获当前域名下，邮箱地址@以前的部分包含指定字符串的邮箱（邮箱可以不存在）的邮件</span>',
				isHtml: true,
			},
		]
	} else {
		return [
			{
				content: '<span class="text-dangerDark">转发示例：配置bt.cn转发到btmail.cn，则：a@bt.cn->a@btmail.cn、b@bt.cn->b@btmail.cn、...</span>',
				isHtml: true,
			},
		]
	}
})

const forwardRule = [
	{
		label: '前缀',
		value: 'prefix',
	},
	{
		label: '后缀',
		value: 'suffix',
	},
	{
		label: '包含',
		value: 'contain',
	},
	{
		label: '全部',
		value: 'all',
	},
	{
		label: '不存在',
		value: 'none',
	},
]
const itemWidth = '!w-[300px]'

const mailForm = (formDataRef: any) => [
	FormItemCustom(
		' ',
		() => (
			<el-radio-group
				disabled={isEdit}
				v-model={formDataRef.value.type}
				onChange={(val: string) => {
					formDataRef.value.rule_str = ''
					formDataRef.value.rule = 'all'
					nextTick(() => {
						formRef.value && formRef.value.clearValidate()
						formRef.value && formRef.value.validateField('receiver')
					})
				}}>
				<el-radio value="mail" size="default">
					邮箱
				</el-radio>
				<el-radio class="ml-[6rem]" value="wildcard" size="default">
					通配符
				</el-radio>
			</el-radio-group>
		),
		'type'
	),
	FormSelect('域名', 'domain', domainList.value, {
		attrs: {
			class: itemWidth,
			disabled: isEdit,
			onChange: (val: string) => {
				formDataRef.value.rule_str = ''
				getMailboxListByDomainName(val)
			},
		},
		rules: [{ required: true, message: '请选择域名' }],
	}),
	formDataRef.value.type === 'mail'
		? FormSelect('邮箱', 'rule_str', mailboxList.value, {
				attrs: {
					class: itemWidth,
					disabled: !formDataRef.value.domain || isEdit,
					placeholder: '请先选择域名，再选择邮箱',
				},
				rules: [
					{
						validator: (rule: any, value: any, callback: any) => {
							if (formDataRef.value.type === 'mail') {
								if (!value) {
									callback(new Error('请选择邮箱'))
								} else {
									callback()
								}
							} else {
								if (formDataRef.value.rule === 'none' || formDataRef.value.rule === 'all') {
									callback()
									return
								}

								if (!value) {
									callback(new Error('请输入规则内容'))
								} else {
									callback()
								}
							}
						},
					},
				],
		  })
		: FormItemCustom(
				'规则',
				() => {
					const isEnable = formDataRef.value.rule === 'none' || formDataRef.value.rule === 'all'
					return (
						<div class="flex items-center">
							<el-select
								disabled={isEdit}
								v-model={formDataRef.value.rule}
								onChange={(val: string) => {
									if (val === 'none' || val === 'all') {
										formDataRef.value.rule_str = ''
										nextTick(() => {
											formRef.value && formRef.value.clearValidate('rule_str')
										})
									}
								}}
								placeholder="选择规则"
								class={'!w-[100px]'}>
								{forwardRule.map(item => (
									<el-option label={item.label} value={item.value}></el-option>
								))}
							</el-select>
							<el-input v-model={formDataRef.value.rule_str} disabled={isEnable || isEdit} placeholder="输入规则" class={`!w-[190px] ml-[10px]`}></el-input>
						</div>
					)
				},
				'rule_str',
				{
					rules: [
						{
							validator: (rule: any, value: any, callback: any) => {
								if (formDataRef.value.rule === 'none' || formDataRef.value.rule === 'all') {
									callback()
									return
								}

								if (!value) {
									callback(new Error('请输入规则内容'))
								} else {
									callback()
								}
							},
						},
					],
				}
		  ),
	FormInput('接收者', 'receiver', {
		attrs: {
			placeholder: '输入需要转发的邮箱',
			type: 'textarea',
			rows: 4,
			class: itemWidth,
		},
		rules: [
			{
				required: true,
				message: '请输入需要转发的邮箱',
				validator: (rule: any, value: any, callback: any) => {
					if (!value) {
						callback(new Error('请输入需要转发的邮箱'))
					} else {
						callback()
					}
				},
			},
		],
	}),
]

const domainForm = (formDataRef: any) => [
	FormSelect('域名', 'domain', domainList.value, {
		attrs: {
			class: itemWidth,
			disabled: isEdit,
		},
		rules: [{ required: true, message: '请选择域名' }],
	}),
	FormInput('接收域名', 'receiver', {
		attrs: {
			placeholder: '输入需要接收的域名',
			class: itemWidth,
		},
		rules: [{ required: true, message: '请输入需要接收的域名' }],
	}),
]

const {
	BtForm,
	submit,
	ref: formRef,
} = useForm({
	data: () => forwardForm.value,
	options: (formDataRef: any) => {
		return computed(() => {
			return [
				...(forwardType.value === 0 ? mailForm(formDataRef) : domainForm(formDataRef)),
				FormSwitch('状态', 'status', {
					attrs: {
						class: '!w-[50px]',
					},
				}),
			]
		})
	},
	submit: async (formDataRef: any, validate: any) => {
		await validate()
		let res
		if (isEdit) {
			res = await editForwardFrom(formDataRef.value, row.address)
		} else {
			res = await addForwardFrom(formDataRef.value)
		}
		return res
	},
})

const onConfirm = async () => {
	const res = await submit()
	return res
}

onMounted(async () => {
	if (isEdit) {
		handleForwardFormInit(row)
	} else {
		await formDataInit()
	}
})

onUnmounted(() => {
	resetFormData()
})

defineExpose({
	onConfirm,
})
</script>
<style scoped lang="scss"></style>
