<template>
	<div class="flex flex-col p-[1.6rem] lib-box">
		<div class="flex">
			<i class="!text-warningDark !text-titleLarge svgtofont-el-warning-filled"></i>
			<div class="my-[1.4rem] text-base pl-[1rem] leading-[2rem]">
				<span v-html="cmdForm.msg"></span>
			</div>
		</div>
		<div v-if="cmdForm.needForce" class="pl-[5rem]">
			<el-form :model="cmdForm" @submit.prevent>
				<el-form-item prop="force">
					<el-checkbox v-model="cmdForm.force">强制卸载</el-checkbox>
				</el-form-item>
			</el-form>
			<bt-help class="mt-[2rem]" :options="[{ content: '强制卸载可能会残留容器信息或镜像' }]" />
		</div>
	</div>
</template>
<script setup lang="ts">
import { cmdForm, onConfirm, init, unmountHandler } from './useController'

interface Props {
	compData?: any
}

const props = withDefaults(defineProps<Props>(), {
	compData: () => ({}),
})

const popupClose = inject<any>('popupClose', () => {}) //     弹窗关闭

onMounted(() => {
	init(props)
})

onUnmounted(() => {
	unmountHandler()
})

defineExpose({
	onConfirm: () => {
		onConfirm(popupClose)
	},
})
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[7rem] text-default;
}
.el-form-item {
	@apply mb-[1.5rem];
}
:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}
</style>
