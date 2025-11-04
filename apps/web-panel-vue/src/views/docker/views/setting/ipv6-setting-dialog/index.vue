<template>
	<div class="p-[2rem]">
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormInput, FormHelp } from '@form/form-item'
import { onConfirm } from './useController'
import { getDockerStore } from '@docker/useStore'

const {
	refs: { settingData },
} = getDockerStore()

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭
// 表单实体
const { BtForm, submit } = useForm({
	data: () => ({
		address: settingData.value.ipv6Address || '',
	}),
	options: () => {
		return computed(() => [
			FormInput('ipv6范围', 'address', {
				attrs: { class: '!w-[32rem]', placeholder: 'ipv6范围' },
			}),
			FormHelp('', [
				{
					content: '此ipv6范围将会在默认的bridge网络中启用，请勿随意修改！',
				},
				{
					content: '设置范围后需要重启docker，请确保可以重启docker再操作。',
				},
			]),
		])
	},
	submit: async (param: Ref<{ address: string }>, validate: any, ref: Ref<any>) => {
		onConfirm(param, popupClose)
	},
})

defineExpose({ onConfirm: submit })
</script>

<style lang="css" scoped>
:deep(.el-input__inner) {
	@apply h-[3.2rem] leading-[3.2rem] text-small;
}
</style>
