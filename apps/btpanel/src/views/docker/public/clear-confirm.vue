<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<div class="flex">
			<i data-v-5f070e15="" class="svgtofont-el-warning-filled !text-[4rem] !text-[#e6a23c]" style=""></i>
			<div class="flex text-[#ff0000] my-[1.4rem] text-base pl-[1rem]">
				{{ compData.confirmMsg ? compData.confirmMsg : '即将清理没有镜像名的镜像，是否继续？' }}
			</div>
		</div>
		<div class="pl-[5rem]">
			<el-form size="default" :model="cmdForm" class="relative w-full" :label-position="`right`" @submit.native.prevent>
				<el-form-item>
					<el-checkbox v-model="cmdForm.filters">{{ compData.confirmCheck ? compData.confirmCheck : '清理没有容器使用的镜像' }}</el-checkbox>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>
<script setup lang="ts">
import { clearMirror } from '@/api/docker'
import { getDockerStore } from '@docker/useStore'
import { useDataHandle } from '@hooks/tools/data'

interface Props {
	compData?: any
}

const {
	refs: { isRefreshTableList },
} = getDockerStore() // 表格刷新

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})
const emits = defineEmits(['close'])

// 表单
const cmdForm = reactive({
	filters: false,
})

// 提交
const onConfirm = async (close: any) => {
	if (props.compData.confirmEvent) {
		props.compData.confirmEvent(cmdForm.filters, close)
		return
	}
	await useDataHandle({
		request: clearMirror({
			data: JSON.stringify({ filters: cmdForm.filters ? '1' : '0' }),
		}),
		message: true,
	})
	isRefreshTableList.value = true
	emits('close')
}

defineExpose({
	onConfirm,
})
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}
.portTable :deep(.el-form-item__label) {
	@apply w-[5rem] h-[4rem] text-default mr-[0rem] bg-[#f2f4f7] border-medium border-[1px] border-[#e4e7ed] rounded-l-[0.4rem] px-[1rem] box-border;
}
.el-form-item {
	@apply mb-[1.5rem];
}
:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}
</style>
