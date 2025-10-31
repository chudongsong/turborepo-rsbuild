<template>
	<el-form ref="cmdFormRef" :model="cmdForm" :rules="cmdRules" :label-position="`right`" class="mt-[1rem]" @submit.native.prevent>
		<el-form-item label="新容器名" prop="name">
			<el-input autofocus class="!w-[24rem]" v-model="cmdForm.name" placeholder="请输入新容器名" />
		</el-form-item>

		<el-button v-if="compData.type !== 'dialog'" class="ml-[10rem]" title="保存" type="primary" @click="onConfirm">保存</el-button>
	</el-form>
</template>
<script setup lang="ts">
import { ContainerReName } from '@/api/docker'
import { useDataHandle } from '@hooks/tools/data'
import { getDockerStore } from '@/views/docker/useStore'

interface Props {
	compData?: any
}

const { refreshActiveTable } = getDockerStore()

const popupClose = inject<any>('popupClose') //     弹窗关闭

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const { row } = toRefs(props.compData)

// 表单
const cmdForm = reactive({ name: row.value.name })
const cmdFormRef = ref()

// 验证规则
const cmdRules = {
	name: [{ required: true, message: '请输入容器名', trigger: ['blur'] }],
}

// 提交
const onConfirm = async () => {
	await cmdFormRef.value.validate()
	useDataHandle({
		loading: '正在保存，请稍候...',
		request: ContainerReName({ id: row.value.id, name: cmdForm.name }),
		message: true,
		success: () => {
			refreshActiveTable()
			popupClose()
		},
	})
}

onMounted(async () => {
	cmdForm.name = row.value.name
})

defineExpose({ onConfirm })
</script>
