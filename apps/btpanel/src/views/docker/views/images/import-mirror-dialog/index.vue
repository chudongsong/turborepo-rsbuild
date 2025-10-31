<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<BtForm />
	</div>
</template>
<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormInputPath } from '@form/form-item'
import { openFile,onConfirm } from './useController'

interface formDataProp {
	path: string,
}

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		path: '',
		name: '',
		id: '',
	}),
	options: (formDataRef: Ref<formDataProp>) => {
		return computed(() => [
			FormInputPath('路径', 'path', { 
				attrs: { class: '!w-[24rem]',placeholder: `请输入镜像路径` },
				rules: [{ required: true, message: '请输入镜像路径', trigger: ['blur','change'] }],
			}, () => openFile(formDataRef)),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		onConfirm(param,popupClose)
	},
})
defineExpose({
	onConfirm:submit,
})
</script>
<style lang="css" scoped>
</style>
