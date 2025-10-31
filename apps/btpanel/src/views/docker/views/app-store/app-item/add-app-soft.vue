<template>
	<BtForm class="p-2rem" label-width="110px" />
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormInput, FormSelect, FormItemCustom, FormRadioButton } from '@form/form-item'
import { formData, versionList, useTemplateFormItems, useDependFormItems, dependData, installSoft, addSoftUnmountedHandle, editorConfig, getComposeFileEbent } from './useController'
import { ElRadioGroup, ElRadioButton } from 'element-plus'

import BtEditor from '@/components/extension/bt-editor'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const popupClose = inject<any>('popupClose') //     弹窗关闭

// 表单实体
const { BtForm, submit } = useForm({
	data: formData,
	options: (formDataRef: any) => {
		return computed(() => [
			FormInput('名称', 'service_name', {
				attrs: { class: '!w-[24rem]', placeholder: '请输入服务名称' },
				rules: [{ required: false, message: '请输入服务名称', trigger: 'blur' }],
			}),
			FormSelect('版本选择', 'version', versionList.value, {
				attrs: { class: '!w-[24rem]', placeholder: '请选择版本' },
				rules: [{ required: true, message: '请选择版本' }],
			}),
			...(props.compData?.appData?.field
				? props.compData.appData.field.map((item: any) => {
						return useTemplateFormItems(item, formDataRef)
				  })
				: []),
			...(props.compData.appData.depend && Object.keys(dependData).length ? props.compData.appData.depend.map((item: any) => useDependFormItems(item, formDataRef, popupClose)) : []),
			// FormRadioButton('模板', 'showCompose', [
			// 	{ label: '默认', value: 'false' },
			// 	{ label: '自定义', value: 'true' },
			// ],{
			// 	attrs: { onChange: (val:any)=>getComposeFileEbent(val,formDataRef,props.compData.appData.appname) },
			// }),
			FormItemCustom(
				'编辑模板',
				() => {
					return (
						<div class="flex items-center">
							<ElRadioGroup v-model={formDataRef.value['showCompose']} onChange={(val: any) => getComposeFileEbent(val, formDataRef, props.compData.appData.appname, props.compData.appData.appid)} class="!my-0">
								<ElRadioButton label="默认" value="false" />
								<ElRadioButton label="自定义" value="true" />
							</ElRadioGroup>
							<span class="text-[1.2rem] ml-[2rem]"> * 自定义本次Docekr Compose启动模板 </span>
						</div>
					)
				},
				'showCompose'
			),
			...(formDataRef.value['showCompose'] === 'true'
				? [
						FormItemCustom(
							' ',
							() => {
								return (
									<div class="flex flex-col items-start justify-center w-full">
										<BtEditor key="editer1" class="!w-[500px] h-[30rem]" v-model={formDataRef.value['editcompose']} editorOption={editorConfig} />
									</div>
								)
							},
							'editcompose'
						),
				  ]
				: []),
		])
	},
	submit: async (param: Ref<FormData>, validate: any, ref: Ref<any>) => {
		await validate()
		installSoft(popupClose)
	},
})

onUnmounted(() => {
	// 重置数据
	addSoftUnmountedHandle()
})

defineExpose({ onConfirm: submit })
</script>

<style scoped lang="css">
.unit {
	color: var(--el-color-text-secondary);
	font-size: var(--el-font-size-small);
	height: 14px;
	margin-left: 4px;
	display: flex;
	align-items: center;
}
</style>
