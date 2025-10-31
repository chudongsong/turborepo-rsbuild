<template>
	<BtForm class="p-[2rem]" label-width="4rem"> </BtForm>
</template>
<script setup lang="ts">
import type { TermCommandProps } from '@term/types'
import type { FormItemProps } from '@/hooks/tools/form/types'

import { useForm } from '@/hooks/tools'
import { handlingSubmit, initCommandList } from './useController'

// 表单配置
const formOptions = computed(
	() =>
		[
			{
				label: '命令名称',
				key: 'title',
				type: 'input',
				attrs: { placeholder: '请输入命令名称', class: 'mr-4 !w-[280px]' },
				rules: [{ required: true, message: '请输入命令名称', trigger: ['blur', 'change'] }],
			},
			{
				label: '命令内容',
				type: 'input',
				key: 'shell',
				attrs: { placeholder: '请输入命令内容', class: 'mr-4 !w-[280px]', type: 'textarea', autosize: { minRows: 8, maxRows: 8 } },
				rules: [{ required: true, message: '请输入命令内容', trigger: ['blur', 'change'] }],
			},
		] as FormItemProps[]
)

// 表单生成
const { BtForm, submit } = useForm({
	data: initCommandList,
	options: () => formOptions,
	submit: async (form: Ref<TermCommandProps>, validate: any) => {
		await validate()
		return await handlingSubmit(form)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
