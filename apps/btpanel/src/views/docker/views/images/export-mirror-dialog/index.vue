<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<BtForm />
	</div>
</template>
<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormInput, FormInputPath } from '@form/form-item'
import { openFile, onConfirm } from './useController'

interface Props {
	compData?: any
}

interface formDataProp {
	path: string
	name: string
	id: string
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

// 表单实体
const {
	BtForm,
	submit,
	param: dataRef,
} = useForm({
	data: () => ({
		path: '',
		name: '',
		id: props.compData.row.id,
	}),
	options: (formDataRef: Ref<formDataProp>) => {
		return computed(() => [
			FormInputPath(
				'导出路径',
				'path',
				{
					attrs: { class: '!w-[24rem]', placeholder: `请选择导出路径` },
					rules: [{ required: true, message: '请输入导出路径', trigger: ['blur', 'change'] }],
				},
				() => openFile(formDataRef)
			),
			FormInput('文件名', 'name', {
				attrs: { placeholder: `请输入导出的文件名`, class: '!w-[26.3rem]' },
				slots: { unit: () => '.tar' },
				rules: [{ required: true, message: '请输入导出的文件名', trigger: 'blur' }],
			}),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		console.log(param, dataRef)
		onConfirm(param, popupClose)
	},
})

onMounted(() => {
	// console.log(props)
	// dataRef.value.id = props.compData.row.id
})

defineExpose({
	onConfirm: submit,
})
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}

.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-light border-[1px] border-light rounded-l-base px-[1rem] box-border;
}
.el-form-item {
	@apply mb-[1.5rem];
}
</style>
