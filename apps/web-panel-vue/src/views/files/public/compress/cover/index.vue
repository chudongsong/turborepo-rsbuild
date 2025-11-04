<template>
	<div class="flex flex-col p-16px lib-box">
		<div class="flex items-center my-[2rem] text-base">
			<i :class="`el-icon-warning text-[4rem] text-warning mr-[2rem]`"></i>
			当前目录已包含以下文件，请选择需要操作的文件，继续操作？
		</div>
		<bt-table ref="TableRef" height="20rem" max-height="20rem" :column="tableColumn" :description="'列表为空'" :data="tableList"></bt-table>
		<div class="mt-[2rem]">
			<div class="text-tertiary">选择文件后，进行相应的操作</div>
			<div class="flex items-center my-[2rem]">
				<el-button @click="jump">跳过</el-button>
				<el-button class="!ml-[1rem]" type="default" @click="cover">覆盖</el-button>
				<el-button class="!ml-[1rem]" type="default" @click="rename">重命名解压文件</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="tsx">
import { storeToRefs } from 'pinia'
import FILES_COMPRESS_STORE from '../store'

const store = FILES_COMPRESS_STORE()
const { tableColumn, tableList, TableRef } = storeToRefs(store)
const { jump, cover, rename, initCover, $reset } = store

onMounted(initCover)

onUnmounted(() => {
	$reset()
})

defineExpose({
	// onConfirm,
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
