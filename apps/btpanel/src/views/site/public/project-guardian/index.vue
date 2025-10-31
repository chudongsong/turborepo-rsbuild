<template>
	<div class="p-2rem">
		<bt-removed-tips></bt-removed-tips>
		<BtForm label-width="9rem" />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormInputAppend } from '@/hooks/tools/form/form-item'
import { getTime, setTime } from './useController'

const { BtForm, submit } = useForm({
	data: getTime,
	options: (formData: Ref<any>) => {
		return computed(() => [
			FormInputAppend('项目启动时间', 'daemon_time', '秒', {
				attrs: {
					placeholder: '请输入项目启动时间',
					style: 'width: 24rem;',
				},
				rules: [
					{ required: true, message: '请输入项目启动时间', trigger: 'blur' },
					{
						validator: (rule: any, value: any, callback: any) => {
							if (value < 0 || !Number.isInteger(parseFloat(value))) {
								callback(new Error('项目启动时间不能小于0'))
							} else {
								callback()
							}
						},
						trigger: ['blur', 'change'],
					},
				],
			}),
		])
	},
	submit: async (param: Ref<T>, validate: () => Promise<'closed' | true>) => {
		await validate()
		return await setTime(param.value)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
