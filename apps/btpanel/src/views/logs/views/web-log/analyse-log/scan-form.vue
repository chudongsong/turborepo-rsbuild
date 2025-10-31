<!--  -->
<template>
	<div class="p-[20px] pb-0">
		<BtForm />
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormInput, FormSwitch } from '@/hooks/tools/form/form-item'
import { FormAlarmSelect } from '@/public'
import { submitScanConfig } from './useController'
import { LOG_ANALYSE_STORE, useLogAnalyseStore } from './useStore'

const { msgForm } = useLogAnalyseStore()

const { BtForm, submit } = useForm({
	data: msgForm.value,
	options: (formData: AnyObject) => {
		return computed(() => [
			FormSwitch('自动扫描', 'status'),
			// FormInput('周期', 'cycle', {
			// 	attrs: { disabled: true, class: '!w-30rem' },
			// }),
			FormAlarmSelect('告警方式', 'give', {
				attrs: {
					multiple: true,
					class: '!w-30rem',
					limit: ['sms', 'wx_account'],
					isShowApi: false,
				},
				rules: {
					give: [{ required: true, message: '请选择告警方式', trigger: 'change' }],
				},
			}),
		])
	},
	submit: submitScanConfig,
})

defineExpose({ onConfirm: submit })
</script>
