<template>
	<div class="pt-[1.6rem] px-[3rem]" v-loading="isLoading">
		<el-alert class="!mb-[1.6rem]" type="warning" :closable="false">
			<bt-help :options="tableHelpList" listStyle="disc" class="!text-warningDark" />
		</el-alert>
		<BtForm />
	</div>
</template>

<script setup lang="tsx">
import { useForm } from '@/hooks/tools'
import { formData, initFormData, isLoading, resetIpRotateData, setIpRotate } from './useMethod'
import { FormItemCustom, FormSwitch } from '@/hooks/tools/form/form-item'
import { getIpTagOptions, ipTagOptions } from '../method'

const props = defineProps({
	compData: {
		type: Object,
		default: () => ({}),
	},
})

const { row } = toRefs(props.compData)

const tableHelpList = [
	{
		isHtml: true,
		content: '<span class="text-warningDark">开启IP轮换后会定时在选择的多个IP中依次轮换，需要多IP的机器</span>',
	},
	{
		isHtml: true,
		content: '<span class="text-warningDark">此功能为附加功能，不影响使用，普通用户可以忽略</span>',
	},
]

const { BtForm, submit } = useForm({
	data: () => formData.value,
	options: (formDataRef: any) => {
		return computed(() => [
			FormItemCustom(
				'轮换周期',
				() => {
					return (
						<el-input
							v-model={formDataRef.value.cycle}
							placeholder="请输入轮换周期"
							v-slots={{
								append: () => '分钟',
							}}></el-input>
					)
				},
				'cycle',
				{
					rules: [{ required: true, message: '请输入轮换周期', trigger: 'blur' }],
				}
			),
			FormItemCustom(
				'IP池',
				() => {
					return (
						<el-select
							class="bt-multiple-select"
							v-model={formDataRef.value.tags}
							placeholder="请选择IP"
							multiple
							v-slots={{
								tag: () => {
									return formDataRef.value.tags?.length ? (
										<div class="flex flex-wrap gap-[5px]">
											{formDataRef.value.tags.map((tag: string) => (
												<el-tag key={tag} type="info" closable class="!w-auto inline-flex items-center" onClose={() => handleCloseTag(tag)}>
													{tag} <span class="text-tertiary ml-1">IP: {getIpByTag(tag)}</span>
												</el-tag>
											))}
										</div>
									) : null
								},
							}}>
							{ipTagOptions.value.map(item => (
								<el-option key={item.value} label={item.label} value={item.value}>
									<span style="float: left; max-width: 10ch; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{item.label}</span>
									<span class="ml-[.8rem]" style="float: right; color: var(--el-base-tertiary); font-size: var(--el-font-size-small)">
										IP: {item.ip}
									</span>
								</el-option>
							))}
						</el-select>
					)
				},
				'tags',
				{
					rules: [{ required: true, message: '请选择IP', trigger: 'blur' }],
				}
			),
			FormSwitch('状态', 'status'),
		])
	},
	submit: async (formData: any, validate: any) => {
		await validate()
		return await setIpRotate(formData.value)
	},
})

const onConfirm = async () => {
	try {
		return await submit()
	} catch (error) {
		return false
	}
}

// 添加工具函数
const handleCloseTag = (tag: string) => {
	const index = formData.value.tags.indexOf(tag)
	if (index > -1) {
		formData.value.tags.splice(index, 1)
	}
}

const getIpByTag = (tag: string): string => {
	const option = ipTagOptions.value.find(item => item.value === tag)
	return option?.ip || ''
}

onMounted(async () => {
	initFormData(row.value)
	isLoading.value = true
	await getIpTagOptions()
	isLoading.value = false
})

onUnmounted(() => {
	resetIpRotateData()
})

defineExpose({
	onConfirm,
})
</script>
