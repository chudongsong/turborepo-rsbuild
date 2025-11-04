<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<el-form ref="cmdFormRef" :model="cmdForm" :rules="cmdRules" @submit.native.prevent>
			<el-form-item prop="name" label="仓库名">
				<bt-select v-model="cmdForm.name" :options="options" class="w-[44rem]" />
			</el-form-item>
		</el-form>
	</div>
</template>
<script setup lang="ts">
import { pullMirror, getStashList } from '@/api/docker'
import { pullMirrorDialog } from '@docker/useMethods'
import { useDataHandle } from '@/hooks/tools'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

// 表单
const cmdForm = reactive({
	name: '',
	id: '',
})
const cmdFormRef = ref()
// 验证规则
const cmdRules = {
	name: [{ required: true, message: '请选择仓库', trigger: 'blur' }],
}

// 仓库名选项
const options = shallowRef<any>([])

// 提交
const onConfirm = async (close: AnyFunction) => {
	try {
		await cmdFormRef.value.validate(async (valid: boolean) => {
			if (valid) {
				let params = {
					template_id: props.compData.id,
					name: options.value.find((item: any) => item.url == cmdForm.name).name,
					url: options.value.find((item: any) => item.url == cmdForm.name).url,
				}
				useDataHandle({
					request: pullMirror({ data: JSON.stringify(params) }),
				})
				pullMirrorDialog()
				close()
			}
		})
	} catch (error) {
		console.log(error)
	}
}

onMounted(async () => {
	cmdForm.id = props.compData.id
	useDataHandle({
		request: getStashList(),
		data: Array,
		success: (data: any[]) => {
			data.forEach((item: any) => {
				options.value.push({
					value: item.url,
					label: `${item.name}${item.url === 'docker.io' ? '' : `(${item.url})`}`,
					url: item.url,
					name: item.name,
				})
			})
			cmdForm.name = options.value[0]?.value
		},
	})
})

defineExpose({ onConfirm })
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}
</style>
