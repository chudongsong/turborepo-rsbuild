<template>
	<div class="p-[2rem] max-h-[60rem] overflow-auto">
		<BtForm />
	</div>
</template>
<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormInput, FormSelect, FormInputIcon, FormItemCustom } from '@form/form-item'
import { ElButton, ElPopover } from 'element-plus'
import { openFile, usePortTable, getFormData, formData, createGoEnv } from './useController'
import { DOCKER_SITE_ENV_GO_STORE } from './useStore'

const store = DOCKER_SITE_ENV_GO_STORE()
const { versionOptions, popoverFocus, isEdit } = storeToRefs(store)
const popupClose = inject('popupClose', () => {})

// 表单实体
const {
	BtForm,
	submit,
	param: dataRef,
} = useForm({
	data: formData,
	options: (formDataRef: any) => {
		return computed(() => [
			FormInput('名称', 'name', {
				attrs: { class: '!w-[320px]', placeholder: '请输入环境名称', disabled: isEdit.value },
				rules: [{ required: true, message: '请输入环境名称', trigger: 'blur' }],
			}),
			FormSelect('版本', 'version', versionOptions.value, {
				attrs: { class: '!w-[22rem]', disabled: isEdit.value },
				rules: [{ required: true, message: '请选择Go版本', trigger: 'change' }],
			}),
			FormInputIcon('运行目录', 'path', {
				attrs: { class: '!w-[320px]', placeholder: '请选择运行目录' },
				rules: [{ required: true, message: '请选择运行目录', trigger: ['blur', 'change'] }],
				icon: 'icon-file_mode',
				iconClick: () => {
					openFile(formDataRef)
				},
			}),
			FormItemCustom(
				'启动命令',
				() => {
					return (
						<ElPopover ref="gopopover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="440" v-model:visible={popoverFocus.value} trigger-keys={[]} trigger="focus">
							{{
								default: () => {
									return <div class="!p-[12px] bg-primary text-white">请填写完整启动命令，如：go run main.go</div>
								},
								reference: () => {
									return (
										<bt-input
											v-model={formDataRef.value.command}
											type="textarea"
											width="52rem"
											v-popover="gopopover"
											rows={7}
											resize="none"
											onFocus={() => {
												popoverFocus.value = true
											}}
											placeholder={'请填写完整启动命令，如：go run main.go'}
										/>
									)
								},
							}}
						</ElPopover>
					)
				},
				'command',
				{
					attrs: { class: '!w-[52rem]' },
					rules: [{ required: true, message: '请填写完整启动命令，如：go run main.go', trigger: 'change' }],
				}
			),
			...(formDataRef.value.port && formDataRef.value.port.length > 0
				? [
						usePortTable(formDataRef.value.port),
						FormItemCustom(' ', () => {
							return (
								<ElButton
									type="default"
									onClick={() => {
										formDataRef.value.port.push({ server: '', con: '', output: false, protocol: ['tcp'], id: 1 })
									}}>
									添加
								</ElButton>
							)
						}),
				  ]
				: [
						FormItemCustom('端口', () => {
							return (
								<ElButton
									type="default"
									onClick={() => {
										formDataRef.value.port.push({ server: '', con: '', output: false, protocol: ['tcp'], id: Math.random() * 1000 })
									}}>
									添加
								</ElButton>
							)
						}),
				  ]),
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		createGoEnv(param.value, popupClose)
	},
})

onMounted(() => {
	getFormData(dataRef)
})

defineExpose({ onConfirm: submit })
</script>
