<template>
	<div class="p-[2rem]">
		<el-form ref="javaAddFormRef" :model="javaAddForm" :disabled="formDisabled" label-width="9rem" :rules="rule">
			<el-form-item label="项目组名称" prop="name">
				<bt-input v-model="javaAddForm.name" width="22rem" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { addJavaGroup } from '@/api/site'
import { useDataHandle } from '@/hooks/tools'

interface Props {
	compData: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: {},
})

const javaAddFormRef = ref()
const formDisabled = ref(false)
const javaAddForm = reactive({
	name: '',
})
const rule = {
	name: { required: true, message: '请输入项目组名称', trigger: 'blur' },
}

/**
 * @description 添加
 */
const onConfirm = async (close?: any) => {
	await javaAddFormRef.value.validate()
	useDataHandle({
		loading: formDisabled,
		request: addJavaGroup({ group_name: javaAddForm.name }),
		success: (res: any) => {
			if (res.status) {
				props.compData.refreshEvent && props.compData.refreshEvent()
				close && close()
			}
		},
	})
}

defineExpose({
	onConfirm,
})
</script>

<style lang="css" scoped>
.set-title {
	@apply text-extraLarge font-bold mt-20x px-[1rem] flex justify-between items-center;
}

:deep(.el-divider--horizontal) {
	@apply mt-[1rem];
}
</style>
