<template>
	<BtForm class="p-[1.6rem]" />
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormInputPath } from '@form/form-item'
import { openFile, onConfirm } from './useController'
import { getDockerStore } from '@docker/useStore'

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

const {
	refs: { settingData },
} = getDockerStore()

// 表单实体
const {
	BtForm,
	submit,
	param: formDataRef,
} = useForm({
	data: () => ({
		path: JSON.parse(JSON.stringify(settingData.value.docker_compose_path)),
	}),
	options: () => {
		return computed(() => [FormInputPath('路径', 'path', { attrs: { class: '!w-[24rem]', placeholder: '请选择compose文件路径' }, rules: [{ required: true, message: '请选择compose文件路径', trigger: ['blur', 'change'] }] }, () => openFile(formDataRef))])
	},
	submit: async (param: Ref<{ path: string }>, validate: any, ref: Ref<any>) => {
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
.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-light border-darkSecondary border-[1px] border-light rounded-l-base px-[1rem] box-border;
}
.el-form-item {
	@apply mb-[1.5rem];
}
</style>
