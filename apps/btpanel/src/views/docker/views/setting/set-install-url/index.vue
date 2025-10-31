<template>
  <BtForm class="p-[1.6rem]" />
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormSelect } from '@form/form-item'
import { onConfirm,options,typeOptions } from './useController'

interface formDataProp {
	installType: 'default' | 'custom' | 'binary';
	url: string;
}

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭


// 表单实体
const { BtForm, submit, param:formDataRef } = useForm({
	data: () => ({
		url: "",
		installType: "default",
	}),
	options: () => {
		return computed(() => [
			FormSelect('安装方式', 'installType', typeOptions, {
				attrs: { class: '!w-[47rem]' },
				rules:[{ required: true, message: '请选择安装方式', trigger: ['blur','change'] }]
			}),
			...(formDataRef.value.installType === 'custom'  ? [
				FormSelect('镜像源', 'url', options, {
					attrs: { class: '!w-[47rem]' },
					rules:[{ required: true, message: '请选择镜像源', trigger: ['blur','change'] }]
				}),
			]:[]),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		onConfirm(param,popupClose)
	},
})

defineExpose({ onConfirm:submit });
</script>
