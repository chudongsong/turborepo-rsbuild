<template>
	<div class="flex flex-col p-16px lib-box">
		<el-image class="w-full h-[65rem]" :src="image" :preview-src-list="imagesArr"> </el-image>
	</div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_IMAGE_PREVIEW_STORE from './store'

const store = FILES_IMAGE_PREVIEW_STORE()
const { image, imagesArr } = storeToRefs(store)
const { init, $reset } = store

onMounted(() => {
	init()
})

onUnmounted(() => {
	$reset()
})
</script>
<style lang="css" scoped>
:deep(.el-form-item__label) {
	@apply w-[9rem] text-default;
}

.el-form-item {
	@apply mb-[1.4rem];
}

.check :deep(.el-form-item__content) {
	@apply leading-[1.4];
}

:deep(.el-form .el-form-item--small.el-form-item + .el-form-item) {
	margin-top: 1.5rem !important;
}
</style>
