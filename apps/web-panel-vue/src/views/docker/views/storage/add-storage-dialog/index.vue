<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<BtForm />
	</div>
</template>
<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormInput, FormMore, FormTextarea } from '@form/form-item'
import { onConfirm } from './useController'

interface formDataProp {
	name: string
	driver: string
	driver_opts: string
	labels: string
	remark: string
	isAdv: boolean
}

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		name: '',
		driver: 'local',
		driver_opts: '',
		labels: '',
		remark: '',
		isAdv: false, // 是否高级设置
	}),
	options: (formDataRef: Ref<formDataProp>) => {
		return computed(() => [
			FormInput('卷名', 'name', {
				attrs: { class: '!w-[35rem]', placeholder: '请输入卷名' },
				rules: [{ required: true, message: '请输入卷名，至少2个字符', min: 2, trigger: 'blur' }],
			}),
			FormMore(toRef(formDataRef.value, 'isAdv')),
			...(formDataRef.value.isAdv
				? [
						FormTextarea('选项', 'driver_opts', {
							attrs: { placeholder: `选项`, autosize: { minRows: 5, maxRows: 5 }, resize: 'none', class: 'w-[35rem]' },
						}),
						FormTextarea('标签', 'labels', {
							attrs: { placeholder: `存储券标签，一行一个，例：key=value`, autosize: { minRows: 5, maxRows: 5 }, resize: 'none', class: 'w-[35rem]' },
						}),
						FormTextarea('备注', 'remark', {
							attrs: { placeholder: `备注`, autosize: { minRows: 5, maxRows: 5 }, resize: 'none', class: 'w-[35rem]' },
						}),
				  ]
				: []),
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
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}
:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	@apply mb-[1.5rem];
	margin-top: 1.5rem !important;
}
</style>
