<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<BtForm />
	</div>
</template>
<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormInput, FormSelect } from '@form/form-item'
import { onConfirm, init, options, unmountHandler } from './useController'

interface Props {
	compData?: any
}
interface formDataProp {
	tag: string
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
		tag: '',
		name: '',
		id: props.compData.row?.id || '',
		loading: false,
	}),
	options: () => {
		return computed(() => [
			FormSelect('仓库名', 'name', options.value, {
				attrs: { class: '!w-[24rem]', placeholder: `请选择仓库名` },
				rules: [{ required: true, message: '请选择仓库名', trigger: 'change' }],
			}),
			FormInput('标签', 'tag', {
				attrs: { placeholder: `请输入版本，如：btphp_1.1`, class: '!w-[24rem]' },
				rules: [{ required: true, message: '请输入版本，如：btphp_1.1', trigger: 'blur' }],
			}),
		])
	},
	submit: async (param: Ref<formDataProp>, validate: any, ref: Ref<any>) => {
		await validate()
		onConfirm(param, popupClose)
	},
})

onMounted(async () => {
	init(dataRef, popupClose)
})

onUnmounted(() => {
	unmountHandler()
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
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-light border-darkSecondary border-[1px] border-light rounded-l-base px-[1rem] box-border;
}
.el-form-item {
	@apply mb-[1.5rem];
}
</style>
