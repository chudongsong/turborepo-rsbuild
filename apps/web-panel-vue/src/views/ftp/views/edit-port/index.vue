<template>
	<BtForm label-width="8rem" class="bt-custom-form" />
</template>

<script lang="ts" setup>
import { useForm } from '@/hooks/tools'
import { FormInput } from '@/hooks/tools/form/form-item'
import { portVerify } from '@/utils/rule'
import { useFtpStore } from '@ftp/useStore'
import { editPort } from '@ftp/useController'

const { ftpPort } = useFtpStore()

const { BtForm, submit } = useForm({
	data: () => ({ port: ftpPort.value }),
	options: () => {
		return computed(() => [
			FormInput('默认端口', 'port', {
				attrs: {
					class: '!w-[20rem]',
					placeholder: '请输入FTP默认端口',
					clearable: true,
					type: 'number',
				},
				rules: [portVerify()],
			}),
		])
	},
	submit: async (param: Ref<any>, validate: AnyFunction) => {
		await validate()
		return await editPort(param.value)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
