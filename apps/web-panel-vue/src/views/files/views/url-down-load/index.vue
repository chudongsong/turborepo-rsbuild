<template>
	<el-form ref="quickFormRef" :model="quickForm" :rules="quickRules" :disabled="formDisabled" class="p-[2rem]" label-position="right" @submit.native.prevent>
		<el-form-item prop="url" label="URL地址">
			<bt-input width="30rem" v-model="quickForm.url" @input="setName" @change="setName" placeholder="在此处粘贴或输入url地址" />
		</el-form-item>
		<el-form-item prop="path" label="下载到">
			<bt-input-icon width="30rem" v-model="quickForm.path" placeholder="请输入路径" icon="icon-file_mode" @icon-click="onPathChange" />
		</el-form-item>
		<el-form-item prop="filename" label="文件名">
			<bt-input width="30rem" v-model="quickForm.filename" placeholder="请输入保存文件名" />
		</el-form-item>
	</el-form>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import FILES_URL_DOWN_LOAD_STORE from './store'

const store = FILES_URL_DOWN_LOAD_STORE()
const { quickForm, formDisabled, quickFormRef, quickRules } = storeToRefs(store)
const { onPathChange, setName, init } = store

onMounted(() => {
	init()
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
