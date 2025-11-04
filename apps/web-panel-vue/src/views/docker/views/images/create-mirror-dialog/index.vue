<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<BtForm />
	</div>
</template>
<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormGroup, FormInputPath, FormSelect, FormTextarea, FormItemCustom } from '@form/form-item'
import { validatePath, validateData, openFile, options, onConfirm } from './useController'

import BtEditor from '@/components/extension/bt-editor'

interface formDataProp {
	type: 'path' | 'data'
	path: string
	data: string
	tag: string
}

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		type: 'path',
		path: '',
		data: '',
		tag: '',
	}),
	options: (formDataRef: Ref<formDataProp>) => {
		return computed(() => [
			FormGroup([
				FormSelect('Dockerfile', 'type', options, {
					attrs: { class: '!w-[10rem]' },
					rules: [{ required: true, message: '请选择', trigger: 'change' }],
				}),
				...(formDataRef.value.type == 'path' ? [FormInputPath('', 'path', { attrs: { class: '!w-[21rem] ml-[.5rem]', placeholder: '请输入或选择Dockerfile文件' }, rules: [{ validator: (...args) => validatePath(formDataRef, ...args), trigger: 'change' }] }, () => openFile(formDataRef))] : []),
			]),
			...(formDataRef.value.type == 'data'
				? [
						FormItemCustom(
							' ',
							() => {
								return <BtEditor class="w-[32rem] h-[29.3rem]" v-model={formDataRef.value.data} />
							},
							'data',
							{
								rules: [{ validator: (...args) => validateData(formDataRef, ...args), trigger: 'blur' }],
							}
						),
				  ]
				: []),
			FormTextarea('标签', 'tag', {
				attrs: { placeholder: `请输入镜像名，例如：btnginx:1.24`, autosize: { minRows: 5, maxRows: 5 }, resize: 'none', class: 'w-[320px]' },
			}),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		onConfirm(param, popupClose)
	},
})

defineExpose({
	onConfirm: submit,
})
</script>
<style scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}

.el-form-item {
	@apply mb-[1.5rem];
}
</style>
