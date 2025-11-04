<!--  -->
<template>
	<div class="p-[20px]">
		<BtForm />
		<bt-help
			:options="[
				{ content: '检查时只检查间隔时间内的日志内容' },
				{
					content: '周期时间请勿设置太小，建议10分钟以上以免导致服务器资源异常',
				},
			]"
			class="pl-2rem"
			style="list-style: disc"></bt-help>
	</div>
</template>

<script setup lang="tsx">
import BtInputNumber from '@/components/form/bt-input-number'
import { useForm } from '@/hooks/tools'
import { FormCustom, FormInputAppend, FormTextarea } from '@/hooks/tools/form/form-item'
import { FormAlarmSelect } from '@/public'
import { storeToRefs } from 'pinia'
import { saveKeywordConfig } from '../useController'
import { LOG_SITE_STORE } from '../useStore'

const store = LOG_SITE_STORE()
const { msgForm } = storeToRefs(store)

const { BtForm, submit } = useForm({
	data: { ...msgForm.value },
	options: (formData: AnyObject) => {
		formData.cycle = msgForm.value.cycle
		formData.give = msgForm.value.give
		return computed(() => [
			FormInputAppend('周期', 'cycle', '分钟', {
				attrs: {
					min: 1,
					max: 60,
					style: 'width: 24rem',
				},
				rules: [{ required: true, message: '请输入周期', trigger: 'blur' }],
			}),
			FormTextarea('关键字', 'keyword', {
				attrs: {
					rows: 5,
					placeholder: '多个用逗号隔开',
					style: 'width: 32rem',
				},
				rules: [{ required: true, message: '请输入关键字', trigger: 'blur' }],
			}),
			FormAlarmSelect('告警方式', 'give', {
				attrs: {
					class: '!w-[32rem]',
					limit: ['sms'],
				},
				rules: {
					give: [{ required: true, message: '请选择告警方式', trigger: ['change'] }],
				},
			}),
		])
	},
	submit: saveKeywordConfig,
})

defineExpose({
	onConfirm: submit,
})
</script>
