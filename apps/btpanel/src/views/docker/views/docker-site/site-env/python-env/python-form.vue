<template>
	<div class="p-[2rem] max-h-[60rem] overflow-auto">
		<BtForm />
	</div>
</template>
<script lang="tsx" setup>
import { useForm } from '@/hooks/tools'
import { FormGroup, FormInput, FormInputPath, FormSelect, FormInputIcon, FormButton, FormItemCustom } from '@form/form-item'
import { ElButton, ElPopover, ElAutocomplete } from 'element-plus'
import { openFile, usePortTable, getFormData, formData, createPythonEnv } from './useController'
import { DOCKER_SITE_ENV_PYTHON_STORE } from './useStore'

const store = DOCKER_SITE_ENV_PYTHON_STORE()
const { versionOptions, extendOptions, popoverFocus, isEdit } = storeToRefs(store)
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
				rules: [{ required: true, message: '请选择Python版本', trigger: 'change' }],
			}),
			FormInputIcon('运行目录', 'path', {
				attrs: { class: '!w-[320px]', placeholder: '请选择运行目录' },
				rules: [{ required: true, message: '请选择运行目录', trigger: 'change' }],
				icon: 'icon-file_mode',
				iconClick: () => {
					openFile(formDataRef)
				},
			}),
			FormItemCustom(
				'启动命令',
				() => {
					return (
						<ElPopover ref="pythonpopover" placement="top-start" popper-class="green-tips-popover !p-0" title="" width="440" v-model:visible={popoverFocus.value} trigger-keys={[]} trigger="focus">
							{{
								default: () => {
									return <div class="!p-[12px] bg-primary text-white">请填写完整启动命令，如：python main.py</div>
								},
								reference: () => {
									return (
										<bt-input
											v-model={formDataRef.value.command}
											type="textarea"
											width="52rem"
											v-popover="pythonpopover"
											rows={7}
											resize="none"
											onFocus={() => {
												popoverFocus.value = true
											}}
											placeholder={'请填写完整启动命令，如：python main.py'}
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
					rules: [{ required: true, message: '请填写完整启动命令，如：python main.py', trigger: 'change' }],
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
			FormItemCustom(
				'镜像源',
				() => {
					return (
						<ElAutocomplete
							v-model={formDataRef.value.repo_url}
							class="!w-[32rem]"
							placeholder="请选择或输入镜像源"
							fetch-suggestions={(queryString: string, cb: any) => {
								cb(extendOptions.value)
							}}
							popper-class="my-extautocomplete">
							{{
								default: ({ item }: { item: any }) => {
									return (
										<div class={item.value === formDataRef.value.repo_url ? 'bg-light flex items-center justify-between px-[2rem]' : 'flex items-center justify-between px-[2rem]'}>
											<div class={item.value === formDataRef.value.repo_url ? 'bt-link w-[38rem] truncate' : 'w-[38rem] truncate'}>{item.label}</div>
										</div>
									)
								},
							}}
						</ElAutocomplete>
					)
				},
				'repo_url',
				{
					attrs: { class: '!w-[22rem]' },
					rules: [{ required: true, message: '请输入或选择镜像源', trigger: 'change' }],
				}
			),
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		createPythonEnv(param.value, popupClose)
	},
})

// import { FTP_ADD_USER } from './store';
// import { storeToRefs } from 'pinia';

// const store = FTP_ADD_USER();

onMounted(() => {
	getFormData(dataRef)
})

// onUnmounted(() => {
// 	store.$reset(); // 重置数据
// });

defineExpose({ onConfirm: submit })
</script>

<style lang="scss">
.my-extautocomplete li {
	padding: 0 0 !important;
}
</style>
