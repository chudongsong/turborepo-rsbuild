<template>
	<div class="p-[16px]">
		<BtForm />
		<!-- <el-form ref="logFormRef" class="h-[48rem]" :model="logData" label-width="60px" v-bt-loading="formLoading" :rules="logRules" :disabled="formDisabled">
			<el-form-item label="日志" prop="type">
				<bt-select class="!w-[24rem]" v-model="logData.type" :options="typeOptions" placeholder="请选择"></bt-select>
			</el-form-item>
			<el-form-item class="mt-[1.6rem]" label=" ">
				<el-button type="primary" @click="submit">保存</el-button>
			</el-form-item>
		</el-form> -->
		<div class="ml-[20px]">
			<bt-help :options="[{ content: '切换PHP版本可能会导致网站无法访问' }, { content: '如果网站访问异常，建议删除网站重新创建以选择新的PHP版本' }]"></bt-help>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useForm } from '@/hooks/tools'
import { FormSelect, FormButton } from '@form/form-item'
import { phpFormData as formData, versionOptions, getPhpVersion, setPhpVersion, resetData } from './useController'

// 表单实体
const {
	BtForm,
	submit,
	param: dataRef,
} = useForm({
	data: formData,
	options: () => {
		return computed(() => [
			FormSelect('PHP版本', 'version', versionOptions.value, {
				attrs: { class: '!w-[22rem]' },
				rules: [{ required: true, message: '请选择PHP版本', trigger: 'change' }],
			}),
			FormButton('切换', {
				label: ' ',
				attrs: {
					type: 'primary',
					onClick: submit,
				},
			}),
		])
	},
	submit: async (param: Ref<any>, validate: any, ref: Ref<any>) => {
		await validate()
		setPhpVersion(param.value, dataRef)
	},
})
onMounted(() => {
	getPhpVersion(dataRef)
})

onUnmounted(() => {
	resetData()
})

defineExpose({
	init: () => {
		getPhpVersion(dataRef)
	},
})
</script>
