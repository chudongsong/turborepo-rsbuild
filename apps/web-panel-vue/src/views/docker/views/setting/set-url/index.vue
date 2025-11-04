<template>
	<BtForm class="p-[1.6rem]" />
</template>
<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { FormItemCustom, FormHelp } from '@form/form-item'
import { querySearch, deleteUrl, onConfirm, init, showDel, getInitData } from './useController'

import { ElAutocomplete } from 'element-plus'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭
// 表单实体
const {
	BtForm,
	submit,
	param: formDataRef,
} = useForm({
	data: () => getInitData(props),
	options: (dataRef: Ref<{ registry_mirrors_address: string }>) => {
		return computed(() => [
			FormItemCustom(
				'加速URL',
				() => {
					return (
						<ElAutocomplete v-model={dataRef.value.registry_mirrors_address} fetch-suggestions={querySearch} popper-class="my-urlautocomplete" placeholder="请选择或输入加速URL">
							{{
								default: ({ item }: { item: any }) => (
									<div class={item.value === dataRef.value.registry_mirrors_address ? 'flex items-center justify-between px-[2rem] bg-light' : 'flex items-center justify-between px-[2rem]'}>
										<div class={item.value === dataRef.value.registry_mirrors_address ? 'w-[38rem] truncate bt-link' : 'w-[38rem] truncate'}>{item.label}</div>
										{showDel(item.value) && (
											<span
												class="bt-danger"
												onClick={(e: MouseEvent) => {
													e.stopPropagation()
													deleteUrl(item.value)
												}}>
												删除
											</span>
										)}
									</div>
								),
								suffix: () => <span class="svgtofont-el-arrow-down"></span>,
							}}
						</ElAutocomplete>
					)
				},
				'registry_mirrors_address',
				{
					rules: [
						{
							validator: (rule: any, value: string, callback: any) => {
								if (value && value !== '不使用加速') {
									if (value.indexOf('http') === -1) {
										callback(new Error('请输入正确的加速URL,如https://docker.1ms.run'))
									} else {
										callback()
									}
								} else {
									callback()
								}
							},
							trigger: ['blur', 'change'],
						},
					],
				}
			),
			FormHelp('', [
				{
					content: '可选择或手动输入加速URL',
				},
				{
					content: '优先使用加速URL执行操作，请求超时将跳过使用默认加速方式',
				},
				{
					content: '设置加速后需要手动重启docker',
				},
			]),
		])
	},
	submit: async (param: Ref<{ registry_mirrors_address: string }>, validate: any, ref: Ref<any>) => {
		onConfirm(param, popupClose)
	},
})

onMounted(() => {
	init(props, formDataRef)
})

defineExpose({
	onConfirm: submit,
})
</script>

<style lang="css">
.my-urlautocomplete li {
	padding: 0 0 !important;
}
</style>
