<!--  -->
<template>
	<div class="p-2rem">
		<BtForm></BtForm>
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormCustom, FormGroup, FormInput, FormItemCustom, FormSelect } from '@/hooks/tools/form/form-item'
import { getIntallList, getRootUser, jdkSetList, rowData, setTomcat, userList, goAddJdk } from './useController'
import { ElCheckbox } from 'element-plus'

const emit = defineEmits(['close'])

const { BtForm, submit } = useForm({
	data: () => {
		if (rowData.value) return { ...rowData.value }
		return {}
	},
	options: (formData: any) =>
		computed(() => [
			FormSelect('启动用户', 'user', userList.value, { attrs: { class: '!w-[30rem]' } }),
			FormItemCustom(
				'开机启动',
				() => {
					return <ElCheckbox v-model={formData.value.auto_restart}>是否设置开机自动启动</ElCheckbox>
				},
				'auto_restart',
				{ attrs: { class: '!w-[10rem]' } }
			),
			FormInput('端口', 'port', {
				attrs: { class: '!w-[20rem]', placeholder: '请输入端口', type: 'number' },
				rules: [{ required: true, message: '请输入Tomcat名称' }],
			}),
			FormGroup([
				FormSelect('JDK', 'jdk_path', jdkSetList.value, { attrs: { class: '!w-[30rem]' } }),
				FormCustom(() => {
					return (
						<span
							class="bt-link ml-8px h-[32px] leading-[32px] text-center"
							onClick={() => {
								emit('close')
								goAddJdk()
							}}>
							添加JDK
						</span>
					)
				}),
			]),
			FormInput('备注', 'ps', { attrs: { class: '!w-[30rem]', placeholder: '请输入备注' } }),
		]),
	submit: async (params: any, validate: any) => {
		await validate()
		return await setTomcat(params.value)
	},
})

onMounted(() => {
	getRootUser()
	getIntallList()
})
defineExpose({ onConfirm: submit })
</script>

<style lang="sass" scoped></style>
